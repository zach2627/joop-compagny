// src/features/payment/paydunya.ts
/**
 * PayDunya Payment Integration
 * Supports: Wave, Orange Money, cash on delivery
 * Docs: https://paydunya.com/developers
 */

const PAYDUNYA_BASE =
  process.env.PAYDUNYA_MODE === "live"
    ? "https://app.paydunya.com/api/v1"
    : "https://app.paydunya.com/sandbox-api/v1";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "https://joop-compagny.com";
const STORE_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "JOOP COMPANY";

interface PayDunyaHeaders extends Record<string, string> {
  "PAYDUNYA-MASTER-KEY": string;
  "PAYDUNYA-PRIVATE-KEY": string;
  "PAYDUNYA-TOKEN": string;
  "Content-Type": string;
}

function getHeaders(): PayDunyaHeaders {
  const masterKey = process.env.PAYDUNYA_MASTER_KEY;
  const privateKey = process.env.PAYDUNYA_PRIVATE_KEY;
  const token = process.env.PAYDUNYA_TOKEN;

  if (!masterKey || !privateKey || !token) {
    throw new Error("PayDunya credentials not configured");
  }

  return {
    "PAYDUNYA-MASTER-KEY": masterKey,
    "PAYDUNYA-PRIVATE-KEY": privateKey,
    "PAYDUNYA-TOKEN": token,
    "Content-Type": "application/json",
  };
}

export interface InvoiceItem {
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  description?: string;
}

export interface CreateInvoiceOptions {
  orderNumber: string;
  items: InvoiceItem[];
  subtotalAmount: number;
  totalAmount: number;
  taxAmount?: number;
  description?: string;
  customer?: {
    name: string;
    email?: string;
    phone?: string;
  };
  customData?: Record<string, string>;
}

export interface InvoiceResponse {
  response_code: string;
  response_text: string;
  description: string;
  invoice_token: string;
  invoice_url: string;
}

export async function createInvoice(
  options: CreateInvoiceOptions
): Promise<InvoiceResponse> {
  const {
    orderNumber,
    items,
    totalAmount,
    taxAmount = 0,
    description,
    customer,
    customData,
  } = options;
  const returnUrl = new URL(process.env.PAYDUNYA_RETURN_URL ?? `${SITE_URL}/store/orders`);
  returnUrl.searchParams.set("order", orderNumber);

  const payload = {
    invoice: {
      items: items.reduce(
        (acc, item) => {
          acc[item.name] = {
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            description: item.description || item.name,
          };
          return acc;
        },
        {} as Record<string, unknown>
      ),
      taxes: taxAmount > 0 ? { TVA: { amount: taxAmount } } : {},
      total_amount: totalAmount,
      description: description || `Commande ${orderNumber} - ${STORE_NAME}`,
    },
    store: {
      name: STORE_NAME,
      tagline: "Bijoux, parfums et encens au Senegal",
      postal_address: "Dakar, Senegal",
      phone: "+221 77 000 00 00",
      website_url: SITE_URL,
      logo_url: `${SITE_URL}/icon.svg`,
    },
    actions: {
      cancel_url: process.env.PAYDUNYA_CANCEL_URL ?? `${SITE_URL}/store/cart`,
      return_url: returnUrl.toString(),
      callback_url:
        process.env.PAYDUNYA_CALLBACK_URL ?? `${SITE_URL}/api/webhooks/paydunya`,
    },
    custom_data: {
      order_number: orderNumber,
      ...customData,
    },
    ...(customer && {
      customer: {
        name: customer.name,
        email: customer.email || "",
        phone: customer.phone || "",
      },
    }),
  };

  const response = await fetch(`${PAYDUNYA_BASE}/checkout-invoice/create`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`PayDunya API error: ${response.status} - ${error}`);
  }

  const data = await response.json();

  if (data.response_code !== "00") {
    throw new Error(`PayDunya invoice creation failed: ${data.response_text}`);
  }

  return data as InvoiceResponse;
}

export interface InvoiceStatusResponse {
  response_code: string;
  response_text: string;
  invoice: {
    token: string;
    status: "pending" | "completed" | "cancelled" | "failed";
    total_amount: number;
    total_amount_without_taxes: number;
    taxes: Record<string, unknown>;
    description: string;
    customer: Record<string, string>;
    custom_data: Record<string, string>;
  };
}

export async function confirmInvoice(
  token: string
): Promise<InvoiceStatusResponse> {
  const response = await fetch(
    `${PAYDUNYA_BASE}/checkout-invoice/confirm/${token}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(`PayDunya confirm error: ${response.status}`);
  }

  return response.json();
}

export interface DirectPayOptions {
  orderNumber: string;
  amount: number;
  customerPhone: string;
  channel: "WAVE" | "ORANGE_MONEY";
  description?: string;
}

export interface DirectPayResponse {
  response_code: string;
  response_text: string;
  transaction_id?: string;
  reference?: string;
}

export async function initiateDirectPay(
  options: DirectPayOptions
): Promise<DirectPayResponse> {
  const { orderNumber, amount, customerPhone, channel, description } = options;
  const phone = customerPhone.replace(/\D/g, "").replace(/^221/, "");

  const payload = {
    account_alias: phone,
    amount,
    description: description || `Commande ${orderNumber}`,
    callback_url:
      process.env.PAYDUNYA_CALLBACK_URL ?? `${SITE_URL}/api/webhooks/paydunya`,
    custom_data: { order_number: orderNumber },
  };

  const endpoint =
    channel === "WAVE"
      ? `${PAYDUNYA_BASE}/mobile-money-checkout/wave`
      : `${PAYDUNYA_BASE}/mobile-money-checkout/orange-money`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`PayDunya direct pay error: ${response.status}`);
  }

  return response.json();
}

export async function verifyWebhookCallback(
  token: string
): Promise<{
  isValid: boolean;
  status: string;
  orderNumber: string | null;
}> {
  try {
    const data = await confirmInvoice(token);

    return {
      isValid: data.response_code === "00",
      status: data.invoice?.status ?? "unknown",
      orderNumber: data.invoice?.custom_data?.order_number ?? null,
    };
  } catch {
    return { isValid: false, status: "error", orderNumber: null };
  }
}

export function formatXOF(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("fr-SN", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}
