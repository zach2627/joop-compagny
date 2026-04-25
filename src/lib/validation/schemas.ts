// src/lib/validation/schemas.ts
import { z } from "zod";

// ─── Auth ────────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z.string().min(2, "Le nom doit comporter au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z
    .string()
    .regex(/^\+?[0-9]{8,15}$/, "Numéro de téléphone invalide")
    .optional(),
  password: z
    .string()
    .min(8, "Le mot de passe doit comporter au moins 8 caractères")
    .regex(/[A-Z]/, "Doit contenir au moins une majuscule")
    .regex(/[0-9]/, "Doit contenir au moins un chiffre"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

// ─── Product ─────────────────────────────────────────────────────────────────

export const productFilterSchema = z.object({
  category: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  color: z.string().optional(),
  storage: z.string().optional(),
  inStock: z.coerce.boolean().optional(),
  sort: z
    .enum(["newest", "price_asc", "price_desc", "popular", "featured"])
    .default("featured"),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(48).default(12),
  q: z.string().max(100).optional(),
});

export const productCreateSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  shortDescription: z.string().max(300).optional(),
  categoryId: z.string().cuid(),
  brand: z.string().default("JOOP COMPAGNY"),
  basePrice: z.number().positive(),
  compareAtPrice: z.number().positive().optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
});

export const variantSchema = z.object({
  sku: z.string().min(3).max(50),
  name: z.string().min(2).max(200),
  storage: z.string().optional(),
  color: z.string().optional(),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  price: z.number().positive(),
  compareAt: z.number().positive().optional(),
  stock: z.number().int().min(0),
  isDefault: z.boolean().default(false),
});

// ─── Cart ────────────────────────────────────────────────────────────────────

export const addToCartSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(10),
});

export const updateCartItemSchema = z.object({
  cartItemId: z.string().cuid(),
  quantity: z.number().int().min(0).max(10),
});

// ─── Checkout ────────────────────────────────────────────────────────────────

// Accepte tous les formats sénégalais :
// +221771234567, +221 77 123 4567, 771234567, 0771234567
export const senegalPhoneRegex = /^\+?221\s?[0-9]{2}\s?[0-9]{3}\s?[0-9]{4}$|^[0-9]{9}$|^0[0-9]{9}$/;

export const checkoutAddressSchema = z.object({
  firstName: z.string().min(2, "Prénom requis"),
  lastName: z.string().min(2, "Nom requis"),
  phone: z
    .string()
    .regex(senegalPhoneRegex, "Numéro sénégalais invalide (ex: +221 77 XXX XXXX)"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  streetLine1: z.string().min(5, "Adresse requise"),
  streetLine2: z.string().optional(),
  city: z.string().min(2, "Ville requise"),
  region: z.enum([
    "Dakar",
    "Thiès",
    "Diourbel",
    "Fatick",
    "Kaolack",
    "Kolda",
    "Louga",
    "Matam",
    "Saint-Louis",
    "Sédhiou",
    "Tambacounda",
    "Ziguinchor",
    "Kaffrine",
    "Kédougou",
  ]),
  saveAddress: z.boolean().default(false),
});

export const checkoutPaymentSchema = z.object({
  method: z.enum(["WAVE", "ORANGE_MONEY", "CASH_ON_DELIVERY", "CARD"]),
  phone: z
    .string()
    .regex(senegalPhoneRegex, "Numéro de paiement invalide")
    .optional()
    .or(z.literal("")),
  notes: z.string().max(500).optional(),
});

export const checkoutSchema = z.object({
  address: checkoutAddressSchema,
  payment: checkoutPaymentSchema,
});

// ─── Order ───────────────────────────────────────────────────────────────────

export const updateOrderStatusSchema = z.object({
  orderId: z.string().cuid(),
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ]),
  comment: z.string().max(500).optional(),
});

// ─── Address ─────────────────────────────────────────────────────────────────

export const addressSchema = z.object({
  label: z.string().min(1).max(50).default("Home"),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().regex(senegalPhoneRegex, "Numéro invalide"),
  streetLine1: z.string().min(5),
  streetLine2: z.string().optional(),
  city: z.string().min(2),
  region: z.string().min(2),
  isDefault: z.boolean().default(false),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProductFilter = z.infer<typeof productFilterSchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
