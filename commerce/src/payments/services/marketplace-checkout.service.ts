import { Injectable } from '@nestjs/common';
import { PaymentGatewayOrchestrator } from './payment-gateway-orchestrator.service';
import { MarketplaceSplitService } from './marketplace-split.service';
import { NigerianComplianceService } from './nigerian-compliance.service';

export interface MarketplaceLineItem {
  vendorId: string;
  label: string;
  // Amounts in minor units (e.g. cents, kobo)
  amountMinor: number;
  currency: string; // ISO 4217
}

export interface MarketplaceCheckoutRequest {
  userId: string;
  currency: string; // transaction currency
  items: MarketplaceLineItem[];
  // gateway hints from frontend (geo, IP, etc.)
  ipCountry?: string;
  userAgent?: string;
}

export interface MarketplaceCheckoutResponse {
  gateway: 'stripe' | 'paypal' | 'flutterwave' | 'paystack';
  paymentIntentId: string;
  clientSecret?: string;
  authorizationUrl?: string;
  totalMinor: number;
  currency: string;
}

@Injectable()
export class MarketplaceCheckoutService {
  constructor(
    private readonly orchestrator: PaymentGatewayOrchestrator,
    private readonly marketplaceSplit: MarketplaceSplitService,
    private readonly nigerianCompliance: NigerianComplianceService,
  ) {}

  /**
   * High-level checkout orchestration for marketplace carts.
   *
   * - Picks optimal gateway based on IP / currency.
   * - Adds Nigerian stamp duty when applicable.
   * - Creates a single payment intent.
   * - Prepares downstream split instructions for post-payment webhooks.
   */
  async createMarketplaceCheckout(
    payload: MarketplaceCheckoutRequest,
  ): Promise<MarketplaceCheckoutResponse> {
    const { items, currency } = payload;

    // 1) Compute cart total in minor units
    const totalMinor = items.reduce((acc, item) => acc + item.amountMinor, 0);

    // 2) Apply Nigerian stamp duty if needed (> ₦10,000 and NGN)
    let totalWithComplianceMinor = totalMinor;
    if (currency === 'NGN') {
      const stamp = this.nigerianCompliance.calculateStampDuty(totalMinor, currency);
      totalWithComplianceMinor += stamp;
    }

    // 3) Select gateway via orchestrator
    const gatewayDecision = await this.orchestrator.selectGateway({
      currency,
      ipCountry: payload.ipCountry,
      amountMinor: totalWithComplianceMinor,
    });

    // 4) Create payment intent with a single-field card input on the client
    const paymentIntent = await this.orchestrator.createPaymentIntent({
      amountMinor: totalWithComplianceMinor,
      currency,
      gateway: gatewayDecision.gateway,
      metadata: {
        userId: payload.userId,
        cartSize: items.length,
      },
    });

    // 5) Pre-register split instructions for post-capture webhook processing.
    await this.marketplaceSplit.registerPlannedSplit({
      paymentIntentId: paymentIntent.id,
      currency,
      items,
    });

    return {
      gateway: gatewayDecision.gateway,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.clientSecret,
      authorizationUrl: paymentIntent.authorizationUrl,
      totalMinor: totalWithComplianceMinor,
      currency,
    };
  }
}
