import { Injectable } from '@nestjs/common';

@Injectable()
export class StripeGatewayService {
  async createPaymentIntent(params: any) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }
    // Real Stripe SDK integration should go here
    return { id: 'stripe_intent_id', ...params };
  }
}
