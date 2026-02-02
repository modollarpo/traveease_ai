import { Module } from '@nestjs/common';
import { PaymentGatewayOrchestrator } from './orchestrator.service';
import { MarketplaceSplitService } from './split.service';
import { LogisticsSagaService } from './logistics-saga.service';
import { CurrencyPrecisionService } from './currency-precision.service';
import { StripeGatewayService } from './gateways/stripe.service';
import { PayPalGatewayService } from './gateways/paypal.service';
import { FlutterwaveGatewayService } from './gateways/flutterwave.service';
import { PaystackGatewayService } from './gateways/paystack.service';
import { NigerianComplianceService } from './nigerian-compliance.service';
import { MultiVendorCartService } from './multi-vendor-cart.service';

@Module({
  providers: [
    PaymentGatewayOrchestrator,
    MarketplaceSplitService,
    LogisticsSagaService,
    CurrencyPrecisionService,
    StripeGatewayService,
    PayPalGatewayService,
    FlutterwaveGatewayService,
    PaystackGatewayService,
    NigerianComplianceService,
    MultiVendorCartService,
  ],
  exports: [
    PaymentGatewayOrchestrator,
    MarketplaceSplitService,
    LogisticsSagaService,
    CurrencyPrecisionService,
    StripeGatewayService,
    PayPalGatewayService,
    FlutterwaveGatewayService,
    PaystackGatewayService,
    NigerianComplianceService,
    MultiVendorCartService,
  ],
})
export class PaymentModule {}
