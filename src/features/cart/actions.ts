// src/features/cart/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import prisma from "@/lib/db/prisma";
import { getServerSession } from "@/lib/auth/jwt";
import { addToCartSchema, updateCartItemSchema } from "@/lib/validation/schemas";
import type { ActionResult } from "@/features/auth/actions";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n/config";

const CART_SESSION_COOKIE = "st_cart";

const cartMessages = {
  fr: {
    invalid: "Données invalides",
    stockInsufficient: "Stock insuffisant pour cette variante.",
    maxQuantity: "Quantité maximale atteinte.",
    itemNotFound: "Article introuvable",
    stockInsufficientShort: "Stock insuffisant",
  },
  en: {
    invalid: "Invalid data",
    stockInsufficient: "Not enough stock for this variant.",
    maxQuantity: "Maximum quantity reached.",
    itemNotFound: "Item not found",
    stockInsufficientShort: "Not enough stock",
  },
} as const;

function getActionLocale(formData: FormData): Locale {
  const locale = formData.get("locale");
  return typeof locale === "string" && isLocale(locale) ? locale : DEFAULT_LOCALE;
}

async function getOrCreateCart(): Promise<string> {
  const session = await getServerSession();
  const cookieStore = cookies();

  if (session) {
    const cart = await prisma.cart.upsert({
      where: { userId: session.id },
      update: {},
      create: { userId: session.id },
    });
    return cart.id;
  }

  let sessionId = cookieStore.get(CART_SESSION_COOKIE)?.value;

  if (!sessionId) {
    sessionId = nanoid();
    cookieStore.set(CART_SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }

  const cart = await prisma.cart.upsert({
    where: { sessionId },
    update: {},
    create: { sessionId },
  });

  return cart.id;
}

async function getExistingCartId(): Promise<string | null> {
  const session = await getServerSession();
  const cookieStore = cookies();

  if (session) {
    const cart = await prisma.cart.findUnique({ where: { userId: session.id } });
    return cart?.id ?? null;
  }

  const sessionId = cookieStore.get(CART_SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const cart = await prisma.cart.findUnique({ where: { sessionId } });
  return cart?.id ?? null;
}

export async function addToCartAction(formData: FormData): Promise<ActionResult> {
  const locale = getActionLocale(formData);
  const messages = cartMessages[locale];
  const parsed = addToCartSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: messages.invalid };

  const { productId, variantId, quantity } = parsed.data;

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { stock: true, stockStatus: true, price: true },
  });

  if (!variant || variant.stockStatus === "OUT_OF_STOCK" || variant.stock < quantity) {
    return { success: false, error: messages.stockInsufficient };
  }

  const cartId = await getOrCreateCart();

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId, variantId } },
  });

  if (existing) {
    const newQty = existing.quantity + quantity;
    if (newQty > variant.stock) return { success: false, error: messages.maxQuantity };
    await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: newQty } });
  } else {
    await prisma.cartItem.create({ data: { cartId, productId, variantId, quantity } });
  }

  revalidatePath("/store/cart");
  return { success: true, data: undefined };
}

export async function updateCartItemAction(formData: FormData): Promise<ActionResult> {
  const locale = getActionLocale(formData);
  const messages = cartMessages[locale];
  const parsed = updateCartItemSchema.safeParse({
    cartItemId: formData.get("cartItemId"),
    quantity: Number(formData.get("quantity")),
  });
  if (!parsed.success) return { success: false, error: messages.invalid };

  const { cartItemId, quantity } = parsed.data;
  const cartId = await getOrCreateCart();

  const item = await prisma.cartItem.findFirst({
    where: { id: cartItemId, cartId },
    include: { variant: { select: { stock: true } } },
  });

  if (!item) return { success: false, error: messages.itemNotFound };

  if (quantity === 0) {
    await prisma.cartItem.delete({ where: { id: cartItemId } });
  } else if (quantity > item.variant.stock) {
    return { success: false, error: messages.stockInsufficientShort };
  } else {
    await prisma.cartItem.update({ where: { id: cartItemId }, data: { quantity } });
  }

  revalidatePath("/store/cart");
  return { success: true, data: undefined };
}

export async function clearCartAction(): Promise<ActionResult> {
  const cartId = await getOrCreateCart();
  await prisma.cartItem.deleteMany({ where: { cartId } });
  revalidatePath("/store/cart");
  return { success: true, data: undefined };
}

export async function getCartData() {
  const cartId = await getExistingCartId();

  if (!cartId) return { items: [], subtotal: 0, taxAmount: 0, total: 0, itemCount: 0 };

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
          variant: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!cart) return { items: [], subtotal: 0, taxAmount: 0, total: 0, itemCount: 0 };

  const subtotal = cart.items.reduce((sum, item) => sum + Number(item.variant.price) * item.quantity, 0);
  const taxAmount = 0;       // TVA supprimée — prix TTC
  const total = subtotal;    // total = subtotal sans TVA
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return { cartId, items: cart.items, subtotal, taxAmount, total, itemCount };
}

export async function mergeGuestCartAction(): Promise<void> {
  const session = await getServerSession();
  if (!session) return;

  const cookieStore = cookies();
  const guestSessionId = cookieStore.get(CART_SESSION_COOKIE)?.value;
  if (!guestSessionId) return;

  const guestCart = await prisma.cart.findUnique({
    where: { sessionId: guestSessionId },
    include: { items: true },
  });
  if (!guestCart || guestCart.items.length === 0) return;

  const userCart = await prisma.cart.upsert({
    where: { userId: session.id },
    update: {},
    create: { userId: session.id },
  });

  for (const guestItem of guestCart.items) {
    await prisma.cartItem.upsert({
      where: { cartId_variantId: { cartId: userCart.id, variantId: guestItem.variantId } },
      update: { quantity: guestItem.quantity },
      create: {
        cartId: userCart.id,
        productId: guestItem.productId,
        variantId: guestItem.variantId,
        quantity: guestItem.quantity,
      },
    });
  }

  await prisma.cart.delete({ where: { id: guestCart.id } });
  cookieStore.delete(CART_SESSION_COOKIE);
}
