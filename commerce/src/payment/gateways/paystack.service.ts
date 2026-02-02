import { Injectable } from '@nestjs/common';

@Injectable()
export class PaystackGatewayService {
  async initializeTransaction(params: any) {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      throw new Error('PAYSTACK_SECRET_KEY not configured');
    }
    // Real Paystack API integration should go here
    return { id: 'paystack_txn_id', ...params };
  }
}
