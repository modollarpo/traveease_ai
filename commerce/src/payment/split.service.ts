import { Injectable } from '@nestjs/common';

export interface SplitPaymentParams {
  items: Array<{
    vendorId: string;
    amount: number;
    currency: string;
    platformFeePercent: number;
  }>;
  gateway: 'stripe' | 'paypal' | 'flutterwave';
}

@Injectable()
export class MarketplaceSplitService {
  async splitPayments(params: SplitPaymentParams) {
    // Example for Stripe Connect
    if (params.gateway === 'stripe') {
      return params.items.map(item => ({
        vendorId: item.vendorId,
        transferAmount: item.amount * (1 - item.platformFeePercent / 100),
        platformFee: item.amount * (item.platformFeePercent / 100),
        currency: item.currency,
      }));
    }
    // Example for Flutterwave
    if (params.gateway === 'flutterwave') {
      return params.items.map(item => ({
        vendorId: item.vendorId,
        subaccountAmount: item.amount * (1 - item.platformFeePercent / 100),
        platformFee: item.amount * (item.platformFeePercent / 100),
        currency: item.currency,
      }));
    }
    // Example for PayPal
    if (params.gateway === 'paypal') {
      return params.items.map(item => ({
        vendorId: item.vendorId,
        adaptiveAmount: item.amount * (1 - item.platformFeePercent / 100),
        platformFee: item.amount * (item.platformFeePercent / 100),
        currency: item.currency,
      }));
    }
    throw new Error('Unsupported gateway for split payments');
  }

  async handleRefunds(refundRequest: {
    itemId: string;
    amount: number;
    gateway: 'stripe' | 'paypal' | 'flutterwave';
    nonRefundableFee?: number;
  }) {
    // Refund logic per gateway
    // Only refund the item minus non-refundable fees
    return {
      refundedAmount: refundRequest.amount - (refundRequest.nonRefundableFee || 0),
      gateway: refundRequest.gateway,
    };
  }
}
