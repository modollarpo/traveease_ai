import { Injectable } from '@nestjs/common';
import { StripeGatewayService } from './gateways/stripe.service';
import { PayPalGatewayService } from './gateways/paypal.service';
import { FlutterwaveGatewayService } from './gateways/flutterwave.service';
import { PaystackGatewayService } from './gateways/paystack.service';

export type PaymentGateway = 'stripe' | 'paypal' | 'flutterwave' | 'paystack';

@Injectable()
export class PaymentGatewayOrchestrator {
  constructor(
    private readonly stripe: StripeGatewayService,
    private readonly paypal: PayPalGatewayService,
    private readonly flutterwave: FlutterwaveGatewayService,
    private readonly paystack: PaystackGatewayService,
  ) {}

  detectGateway(userIp: string, currency: string, vendorLocation: string): PaymentGateway {
    if (currency === 'USD' || currency === 'EUR') {
      return 'stripe';
    }
    if (vendorLocation === 'Nigeria' || currency === 'NGN') {
      return 'paystack';
    }
    if (vendorLocation === 'Africa') {
      return 'flutterwave';
    }
    return 'paypal';
  }

  async createPaymentIntent(params: {
    amount: number;
    currency: string;
    userIp: string;
    vendorLocation: string;
    bnpl?: boolean;
  }) {
    const gateway = this.detectGateway(params.userIp, params.currency, params.vendorLocation);
    switch (gateway) {
      case 'stripe':
        return this.stripe.createPaymentIntent(params);
      case 'paypal':
        return this.paypal.createOrder(params);
      case 'flutterwave':
        return this.flutterwave.createPayment(params);
      case 'paystack':
        return this.paystack.initializeTransaction(params);
      default:
        throw new Error('Unsupported gateway');
    }
  }
}
