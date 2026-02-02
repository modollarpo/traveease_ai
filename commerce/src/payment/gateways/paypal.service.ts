import { Injectable } from '@nestjs/common';

@Injectable()
export class PayPalGatewayService {
  async createOrder(params: any) {
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_SECRET) {
      throw new Error('PayPal credentials not configured');
    }
    // Real PayPal SDK integration should go here
    return { id: 'paypal_order_id', ...params };
  }
}
