import { Injectable } from '@nestjs/common';

@Injectable()
export class FlutterwaveGatewayService {
  async createPayment(params: any) {
    if (!process.env.FLW_SECRET_KEY) {
      throw new Error('FLW_SECRET_KEY not configured');
    }
    // Real Flutterwave API integration should go here
    return { id: 'flutterwave_payment_id', ...params };
  }
}
