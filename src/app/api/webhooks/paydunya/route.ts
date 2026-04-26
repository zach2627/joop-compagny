// src/app/api/webhooks/paydunya/route.ts
import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { verifyWebhookCallback } from "@/features/payment/paydunya";
import prisma from "@/lib/db/prisma";
import { logger } from "@/lib/middleware/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function redactToken(token: unknown) {
  if (typeof token !== "string" || token.length === 0) return undefined;
  if (token.length <= 10) return "[redacted]";

  return `${token.slice(0, 4)}...${token.slice(-4)}`;
}

function getStockStatus(stock: number) {
  if (stock <= 0) return "OUT_OF_STOCK" as const;
  if (stock <= 5) return "LOW_STOCK" as const;
  return "IN_STOCK" as const;
}

async function restoreOrderStock(
  tx: Prisma.TransactionClient,
  items: Array<{ variantId: string; quantity: number }>
) {
  for (const item of items) {
    const variant = await tx.productVariant.update({
      where: { id: item.variantId },
      data: {
        stock: { increment: item.quantity },
      },
      select: { id: true, stock: true },
    });

    await tx.productVariant.update({
      where: { id: variant.id },
      data: { stockStatus: getStockStatus(variant.stock) },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const parsedBody = await request.json();
    const body = isRecord(parsedBody) ? parsedBody : {};
    const callbackData = parsedBody as Prisma.InputJsonValue;
    const token = typeof body.token === "string" ? body.token : null;

    logger.info("webhook.paydunya.received", { token: redactToken(token) });

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const { isValid, status, orderNumber } = await verifyWebhookCallback(token);

    if (!isValid) {
      logger.warn("webhook.paydunya.invalid", { token: redactToken(token) });
      return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
    }

    if (!orderNumber) {
      return NextResponse.json({ error: "Order not found" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        payment: true,
        items: {
          select: {
            variantId: true,
            quantity: true,
          },
        },
      },
    });

    if (!order) {
      logger.warn("webhook.paydunya.order-not-found", { orderNumber });
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (status === "completed") {
      if (order.paymentStatus === "COMPLETED" || order.payment?.status === "COMPLETED") {
        return NextResponse.json({ success: true });
      }

      if (order.paymentStatus === "FAILED" || order.status === "CANCELLED") {
        logger.warn("webhook.paydunya.completed-ignored", { orderNumber });
        return NextResponse.json({ success: true });
      }

      await prisma.$transaction([
        // Update payment
        prisma.payment.updateMany({
          where: { orderId: order.id },
          data: {
            status: "COMPLETED",
            paydunyaToken: token,
            callbackData,
            paidAt: new Date(),
          },
        }),
        // Update order
        prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "COMPLETED",
            status: "CONFIRMED",
          },
        }),
        // Add history
        prisma.orderHistory.create({
          data: {
            orderId: order.id,
            status: "CONFIRMED",
            comment: "Paiement recu via PayDunya",
            createdBy: "system",
          },
        }),
      ]);

      logger.info("webhook.paydunya.payment-confirmed", {
        orderNumber,
        token: redactToken(token),
      });
    } else if (status === "cancelled" || status === "failed") {
      if (order.paymentStatus === "COMPLETED" || order.payment?.status === "COMPLETED") {
        logger.warn("webhook.paydunya.failure-ignored", { orderNumber, status });
        return NextResponse.json({ success: true });
      }

      if (
        order.paymentStatus === "FAILED" ||
        order.status === "CANCELLED" ||
        order.payment?.status === "FAILED"
      ) {
        return NextResponse.json({ success: true });
      }

      await prisma.$transaction(async (tx) => {
        await tx.payment.updateMany({
          where: { orderId: order.id },
          data: {
            status: "FAILED",
            failedAt: new Date(),
            callbackData,
          },
        });

        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "FAILED",
            status: "CANCELLED",
            cancelledAt: new Date(),
          },
        });

        await tx.orderHistory.create({
          data: {
            orderId: order.id,
            status: "CANCELLED",
            comment:
              status === "failed"
                ? "Paiement echoue via PayDunya - stock restitue"
                : "Paiement annule via PayDunya - stock restitue",
            createdBy: "system",
          },
        });

        await restoreOrderStock(tx, order.items);
      });

      logger.warn("webhook.paydunya.payment-failed", { orderNumber, status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("webhook.paydunya.error", { error: String(error) });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// Only allow POST
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
