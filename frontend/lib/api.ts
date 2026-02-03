export interface MarketplaceLineItemPayload {
  vendorId: string;
  label: string;
  amountMinor: number;
  currency: string;
}

export interface MarketplaceCheckoutPayload {
  userId: string;
  currency: string;
  items: MarketplaceLineItemPayload[];
}

export interface MarketplaceCheckoutResult {
  gateway: string;
  paymentIntentId: string;
  clientSecret?: string;
  authorizationUrl?: string;
  totalMinor: number;
  currency: string;
}

const COMMERCE_BASE_URL =
  process.env.NEXT_PUBLIC_COMMERCE_BASE_URL ?? 'http://localhost:4000';

export async function createMarketplaceCheckout(
  payload: MarketplaceCheckoutPayload,
): Promise<MarketplaceCheckoutResult> {
  const res = await fetch(`${COMMERCE_BASE_URL}/payments/checkout/marketplace`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Checkout failed with status ${res.status}`);
  }

  return res.json();
}
