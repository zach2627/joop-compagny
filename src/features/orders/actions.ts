// src/features/orders/actions.ts
"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "@/lib/db/prisma";
import { getServerSession } from "@/lib/auth/jwt";
import { checkoutSchema, updateOrderStatusSchema } from "@/lib/validation/schemas";
import { createInvoice } from "@/features/payment/paydunya";
import { clearCartAction, getCartData } from "@/features/cart/actions";
import { logger } from "@/lib/middleware/logger";
import type { ActionResult } from "@/features/auth/actions";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/config";
import {
  translateProductContent,
  translateVariantName,
} from "@/lib/i18n/product-content";

class StockConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StockConflictError";
  }
}

function generateOrderNumber(): string {
  const date = new Date();
  const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, "");
  const uid = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  return `JCP-${yyyymmdd}-${uid}`;
}

function getStockStatus(stock: number): "OUT_OF_STOCK" | "LOW_STOCK" | "IN_STOCK" {
  if (stock <= 0) return "OUT_OF_STOCK";
  if (stock <= 5) return "LOW_STOCK";
  return "IN_STOCK";
}

const orderMessages = {
  fr: {
    invalid: "Informations invalides",
    emptyCart: "Votre panier est vide.",
    stockInsufficient: (name: string, variant: string) =>
      `Stock insuffisant pour: ${name} - ${variant}`,
    variantNotFound: (name: string, variant: string) =>
      `Variante introuvable pour: ${name} - ${variant}`,
    historyCreated: "Commande créée",
    invoiceDescription: (orderNumber: string) =>
      `Commande ${orderNumber} - JOOP COMPAGNY`,
    paymentInitFailed:
      "Impossible de lancer le paiement pour le moment. Votre panier n'a pas ete vide.",
  },
  en: {
    invalid: "Invalid information",
    emptyCart: "Your cart is empty.",
    stockInsufficient: (name: string, variant: string) =>
      `Not enough stock for: ${name} - ${variant}`,
    variantNotFound: (name: string, variant: string) =>
      `Variant not found for: ${name} - ${variant}`,
    historyCreated: "Order created",
    invoiceDescription: (orderNumber: string) =>
      `Order ${orderNumber} - JOOP COMPAGNY`,
    paymentInitFailed:
      "We could not start payment right now. Your cart has not been cleared.",
  },
} as const;

function getActionLocale(formData: FormData): Locale {
  const locale = formData.get("locale");
  return typeof locale === "string" && isLocale(locale) ? locale : DEFAULT_LOCALE;
}

export async function createOrderAction(
  formData: FormData
): Promise<
  ActionResult<{
    orderId: string;
    orderNumber: string;
    paymentUrl?: string;
    redirectPath: string;
  }>
> {
  const locale = getActionLocale(formData);
  const messages = orderMessages[locale];
  const session = await getServerSession();

  const rawData = Object.fromEntries(formData);
  const parsed = checkoutSchema.safeParse({
    address: {
      firstName: rawData["address.firstName"],
      lastName: rawData["address.lastName"],
      phone: rawData["address.phone"],
      email: rawData["address.email"],
      streetLine1: rawData["address.streetLine1"],
      streetLine2: rawData["address.streetLine2"],
      city: rawData["address.city"],
      region: rawData["address.region"],
    },
    payment: {
      method: rawData["payment.method"],
      phone: rawData["payment.phone"],
      notes: rawData["payment.notes"],
    },
  });

  if (!parsed.success) {
    return {
      success: false,
      error: messages.invalid,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { address, payment } = parsed.data;
  const cartData = await getCartData();

  if (cartData.items.length === 0) {
    return { success: false, error: messages.emptyCart };
  }

  for (const item of cartData.items) {
    if (item.variant.stock < item.quantity) {
      const productText = translateProductContent(locale, item.product);
      const variantName = translateVariantName(locale, item.product.slug, item.variant.name);
      return {
        success: false,
        error: messages.stockInsufficient(productText.name, variantName),
      };
    }
  }

  const orderNumber = generateOrderNumber();
  const redirectPath = `/store/orders?order=${orderNumber}`;
  let preparedInvoice: Awaited<ReturnType<typeof createInvoice>> | null = null;

  if (payment.method !== "CASH_ON_DELIVERY") {
    try {
      preparedInvoice = await createInvoice({
        orderNumber,
        items: cartData.items.map((item) => ({
          name: translateVariantName(locale, item.product.slug, item.variant.name),
          quantity: item.quantity,
          unit_price: Number(item.variant.price),
          total_price: Number(item.variant.price) * item.quantity,
        })),
        subtotalAmount: cartData.subtotal,
        totalAmount: Math.round(cartData.total),
        taxAmount: Math.round(cartData.taxAmount),
        description: messages.invoiceDescription(orderNumber),
        customer: session
          ? { name: session.name ?? "", email: session.email }
          : {
              name: `${address.firstName} ${address.lastName}`,
              email: address.email,
              phone: address.phone,
            },
        customData: {
          payment_method: payment.method,
          customer_phone: payment.phone ?? address.phone,
        },
      });
    } catch (error) {
      logger.error("payment.init.failed", {
        orderNumber,
        method: payment.method,
        error: String(error),
      });

      return { success: false, error: messages.paymentInitFailed };
    }
  }

  let order;
  try {
    order = await prisma.$transaction(async (tx) => {
      for (const item of cartData.items) {
        const updated = await tx.productVariant.updateMany({
          where: {
            id: item.variantId,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        if (updated.count === 0) {
          const productText = translateProductContent(locale, item.product);
          const variantName = translateVariantName(locale, item.product.slug, item.variant.name);
          throw new StockConflictError(
            messages.stockInsufficient(productText.name, variantName)
          );
        }

        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          select: { stock: true },
        });

        if (!variant) {
          const productText = translateProductContent(locale, item.product);
          const variantName = translateVariantName(locale, item.product.slug, item.variant.name);
          throw new StockConflictError(
            messages.variantNotFound(productText.name, variantName)
          );
        }

        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stockStatus: getStockStatus(variant.stock) },
        });
      }

      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session?.id,
          guestEmail: !session ? address.email : undefined,
          guestPhone: !session ? address.phone : undefined,
          shippingAddress: {
            firstName: address.firstName,
            lastName: address.lastName,
            phone: address.phone,
            streetLine1: address.streetLine1,
            streetLine2: address.streetLine2 ?? null,
            city: address.city,
            region: address.region,
            country: "SN",
          },
          paymentMethod: payment.method,
          subtotal: cartData.subtotal,
          taxAmount: cartData.taxAmount,
          total: cartData.total,
          notes: payment.notes,
          items: {
            create: cartData.items.map((item) => {
              const productText = translateProductContent(locale, item.product);
              const variantName = translateVariantName(
                locale,
                item.product.slug,
                item.variant.name
              );

              return {
                productId: item.productId,
                variantId: item.variantId,
                productName: productText.name,
                variantName,
                sku: item.variant.sku,
                quantity: item.quantity,
                unitPrice: Number(item.variant.price),
                totalPrice: Number(item.variant.price) * item.quantity,
                imageUrl: item.product.images[0]?.url,
              };
            }),
          },
          history: {
            create: { status: "PENDING", comment: messages.historyCreated, createdBy: "system" },
          },
        },
      });

      if (payment.method === "CASH_ON_DELIVERY") {
        await tx.payment.create({
          data: {
            orderId: createdOrder.id,
            method: "CASH_ON_DELIVERY",
            amount: cartData.total,
            status: "PENDING",
          },
        });
      } else {
        if (!preparedInvoice) {
          throw new Error("Missing prepared PayDunya invoice");
        }

        await tx.payment.create({
          data: {
            orderId: createdOrder.id,
            method: payment.method,
            amount: cartData.total,
            paydunyaToken: preparedInvoice.invoice_token,
            invoiceUrl: preparedInvoice.invoice_url,
            status: "PENDING",
          },
        });
      }

      return createdOrder;
    });
  } catch (error) {
    if (error instanceof StockConflictError) {
      return { success: false, error: error.message };
    }

    throw error;
  }

  logger.info("order.created", { orderId: order.id, orderNumber, userId: session?.id });

  const paymentUrl = preparedInvoice?.invoice_url;

  await clearCartAction();
  revalidateTag("products");
  revalidatePath("/store/orders");

  return {
    success: true,
    data: { orderId: order.id, orderNumber, paymentUrl, redirectPath },
  };
}

export async function getMyOrdersAction() {
  const session = await getServerSession();
  if (!session) return [];

  return prisma.order.findMany({
    where: { userId: session.id },
    include: {
      items: {
        include: {
          product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
          variant: true,
        },
      },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateOrderStatusAction(data: unknown): Promise<ActionResult> {
  const session = await getServerSession();
  if (!session || !["ADMIN", "STAFF"].includes(session.role)) {
    return { success: false, error: "Non autorisé" };
  }

  const parsed = updateOrderStatusSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Données invalides" };

  const { orderId, status, comment } = parsed.data;

  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { status } }),
    prisma.orderHistory.create({
      data: { orderId, status, comment, createdBy: session.id },
    }),
  ]);

  revalidatePath("/admin/commandes");
  revalidatePath("/admin/orders");
  logger.info("order.status.updated", { orderId, status, by: session.id });

  return { success: true, data: undefined };
}

export async function getAnalyticsData() {
  const session = await getServerSession();
  if (!session || !["ADMIN", "STAFF"].includes(session.role)) return null;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalRevenue,
    monthRevenue,
    lastMonthRevenue,
    totalOrders,
    monthOrders,
    totalCustomers,
    newCustomers,
    totalProducts,
    activeProducts,
    featuredProducts,
    lowStockVariants,
    ordersByStatus,
    topProducts,
    recentOrders,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { status: { in: ["DELIVERED", "SHIPPED", "PROCESSING"] } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: startOfMonth },
        status: { in: ["DELIVERED", "SHIPPED", "PROCESSING", "CONFIRMED"] },
      },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        status: { in: ["DELIVERED", "SHIPPED", "PROCESSING", "CONFIRMED"] },
      },
      _sum: { total: true },
    }),
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: startOfMonth } } }),
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({ where: { isFeatured: true } }),
    prisma.productVariant.count({
      where: { stockStatus: { in: ["LOW_STOCK", "OUT_OF_STOCK"] } },
    }),
    prisma.order.groupBy({ by: ["status"], _count: true }),
    prisma.orderItem.groupBy({
      by: ["productId", "productName"],
      _sum: { totalPrice: true, quantity: true },
      orderBy: { _sum: { totalPrice: "desc" } },
      take: 5,
    }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { items: true } },
      },
    }),
  ]);

  return {
    revenue: {
      total: Number(totalRevenue._sum.total ?? 0),
      month: Number(monthRevenue._sum.total ?? 0),
      lastMonth: Number(lastMonthRevenue._sum.total ?? 0),
      growth: lastMonthRevenue._sum.total
        ? ((Number(monthRevenue._sum.total ?? 0) - Number(lastMonthRevenue._sum.total)) /
            Number(lastMonthRevenue._sum.total)) *
          100
        : 0,
    },
    orders: { total: totalOrders, month: monthOrders, byStatus: ordersByStatus },
    customers: { total: totalCustomers, new: newCustomers },
    products: {
      total: totalProducts,
      active: activeProducts,
      featured: featuredProducts,
      lowStock: lowStockVariants,
    },
    topProducts,
    recentOrders,
  };
}
