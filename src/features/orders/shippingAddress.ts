import type { Prisma } from "@prisma/client";

export interface ShippingAddressView {
  firstName?: string;
  lastName?: string;
  phone?: string;
  city?: string;
  region?: string;
  streetLine1?: string;
}

function readStringField(
  value: Prisma.JsonObject,
  key: keyof ShippingAddressView
): string | undefined {
  const field = value[key];
  return typeof field === "string" && field.trim() ? field : undefined;
}

export function getShippingAddressView(
  value: Prisma.JsonValue | null
): ShippingAddressView | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return {
    firstName: readStringField(value, "firstName"),
    lastName: readStringField(value, "lastName"),
    phone: readStringField(value, "phone"),
    city: readStringField(value, "city"),
    region: readStringField(value, "region"),
    streetLine1: readStringField(value, "streetLine1"),
  };
}
