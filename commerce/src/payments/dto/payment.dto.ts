/**
 * Payment DTOs - Unified interface for all payment gateways
 * Supports: Stripe, PayPal, Flutterwave, Paystack
 */

export enum PaymentGateway {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  FLUTTERWAVE = 'flutterwave',
  PAYSTACK = 'paystack',
}

export enum Region {
  US = 'us',
  EU = 'eu',
  AFRICA = 'africa',
  APAC = 'apac',
  LATAM = 'latam',
}

export enum PaymentStatus {
  PENDING = 'pending',
  AUTHORIZED = 'authorized',
  CAPTURED = 'captured',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export enum BNPLProvider {
  STRIPE_KLARNA = 'stripe_klarna',
  STRIPE_AFTERPAY = 'stripe_afterpay',
  PAYPAL_BNPL = 'paypal_bnpl',
  NONE = 'none',
}

/**
 * Currency codes (ISO 4217)
 */
export type CurrencyCode = string; // e.g., 'USD', 'EUR', 'NGN', 'ZAR'

/**
 * Main Payment Intent DTO
 * Used across all gateway implementations
 */
export class CreatePaymentIntentDTO {
  /** Amount in minor units (cents, kobo, etc.) */
  amount: bigint;

  /** ISO 4217 currency code */
  currency: CurrencyCode;

  /** User's ISO 639-1 language code */
  locale: string;

  /** User's IP address for geolocation */
  ipAddress: string;

  /** User's email */
  email: string;

  /** Payment metadata */
  metadata?: {
    orderId: string;
    userId: string;
    description?: string;
    tripId?: string;
    vendorIds?: string[];
    [key: string]: any;
  };

  /** Vendor split configuration */
  splits?: VendorSplit[];

  /** BNPL eligibility (optional) */
  bnplEligible?: boolean;

  /** BNPL preferred provider */
  bnplProvider?: BNPLProvider;

  /** Return URLs */
  returnUrl?: string;
  cancelUrl?: string;
  webhookUrl?: string;
}

/**
 * Vendor split configuration for marketplace transactions
 */
export class VendorSplit {
  vendorId: string;
  vendorStripeAccountId?: string;
  vendorFlutterwaveAccountId?: string;
  amount: bigint; // Amount to transfer to this vendor (minor units)
  feePercentage: number; // Platform fee percentage (e.g., 10)
  description: string;
  type: 'flight' | 'hotel' | 'car' | 'tour' | 'insurance'; // Vendor service type
}

/**
 * Payment Intent Response (unified across all gateways)
 */
export class PaymentIntentResponseDTO {
  id: string; // Unified payment intent ID
  clientSecret?: string;
  publishableKey?: string;
  status: PaymentStatus;
  gateway: PaymentGateway;
  gatewayIntentId: string; // Provider-specific ID (e.g., Stripe PI ID)
  amount: bigint;
  currency: CurrencyCode;
  locale: string;
  createdAt: Date;
  expiresAt?: Date;
  redirectUrl?: string; // For hosted payment pages
  nextAction?: {
    type: 'use_stripe_sdk' | 'redirect_to_url' | 'display_otp' | 'display_qr_code';
    url?: string;
    qrCode?: string;
    expiresAt?: Date;
  };
  bnplProvider?: BNPLProvider;
  metadata?: Record<string, any>;
}

/**
 * Webhook payload from payment gateway
 */
export class PaymentWebhookDTO {
  type: 'charge.captured' | 'charge.failed' | 'charge.refunded' | 'charge.dispute_created';
  gateway: PaymentGateway;
  gatewayEventId: string;
  paymentIntentId: string;
  status: PaymentStatus;
  amount?: bigint;
  currency?: CurrencyCode;
  failureReason?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

/**
 * Refund Request DTO
 */
export class RefundRequestDTO {
  paymentIntentId: string;
  amount?: bigint; // If not provided, full refund is requested
  reason: 'requested_by_customer' | 'duplicate' | 'fraudulent' | 'service_cancelled' | 'booking_cancelled';
  splits?: RefundSplit[]; // For partial vendor refunds
  metadata?: Record<string, any>;
}

/**
 * Vendor-specific refund split
 */
export class RefundSplit {
  vendorId: string;
  refundAmount: bigint;
  deductFees: boolean; // Whether to deduct GDS fees or other vendor fees
  feeDeduction?: bigint;
}

/**
 * Refund Response
 */
export class RefundResponseDTO {
  id: string;
  paymentIntentId: string;
  status: PaymentStatus;
  amount: bigint;
  currency: CurrencyCode;
  gateway: PaymentGateway;
  gatewayRefundId: string;
  splits?: RefundSplit[];
  createdAt: Date;
  completedAt?: Date;
}

/**
 * Geolocation Response
 */
export class GeolocationDTO {
  country: string;
  countryCode: string; // ISO 3166-1 alpha-2
  region: Region;
  city: string;
  timezone: string;
  currency: CurrencyCode; // Default currency for this location
  recommendedGateways: PaymentGateway[];
  supportedCurrencies: CurrencyCode[];
}

/**
 * BNPL Eligibility Check Response
 */
export class BNPLEligibilityDTO {
  eligible: boolean;
  providers: BNPLProvider[];
  minAmount: bigint;
  maxAmount: bigint;
  installments: number[];
  apr?: number;
  monthlyPayment?: bigint;
}

/**
 * Gateway Availability Response
 */
export class GatewayAvailabilityDTO {
  gateway: PaymentGateway;
  available: boolean;
  region: Region;
  supportedCurrencies: CurrencyCode[];
  processingFee: number; // Percentage
  settlementTime: string; // e.g., "T+1", "T+2"
  lastStatusCheck: Date;
}
