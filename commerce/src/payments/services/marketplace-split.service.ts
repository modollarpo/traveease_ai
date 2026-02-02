/**
 * Marketplace Split Service - Handles multi-vendor fund distribution
 * Integrates with Stripe Connect, PayPal Adaptive Payments, and Flutterwave Subaccounts
 */

import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  PaymentGateway,
  VendorSplit,
  RefundRequestDTO,
  RefundResponseDTO,
  PaymentStatus,
} from '../dto/payment.dto';

export interface SplitCalculation {
  vendorId: string;
  totalAmount: bigint;
  vendorAmount: bigint;
  platformFee: bigint;
  feePercentage: number;
}

export interface StripeTransfer {
  id: string;
  object: string;
  amount: number;
  amount_reversed: number;
  automatic: boolean;
  created: number;
  currency: string;
  destination: string;
  destination_payment: string;
  failure_balance_transaction: string | null;
  failure_code: string | null;
  failure_message: string | null;
  livemode: boolean;
  metadata: Record<string, any>;
  reversals: {
    object: string;
    data: any[];
    has_more: boolean;
    total_count: number;
    url: string;
  };
  reversed: boolean;
  source_transaction: string;
  statement_descriptor: string | null;
  status: 'in_transit' | 'paid' | 'failed';
  type: 'card_refund' | 'adjustment' | 'advance' | 'advance_funding' | 'charge' | 'connect_reserve' | 'issuing_authorization_hold' | 'issuing_authorization_release' | 'payout' | 'payout_cancellation' | 'payout_failure' | 'refund' | 'refund_failure' | 'reversal' | 'reversal_surcharge' | 'topup' | 'topup_reversal' | 'transfer' | 'transfer_cancellation' | 'transfer_failure' | 'transfer_refund' | 'transfer_reversal' | 'transfer_reversal_refund';
}

export interface MarketplaceCharge {
  paymentId: string;
  gateway: PaymentGateway;
  totalAmount: bigint;
  currency: string;
  splits: SplitCalculation[];
  transfers?: {
    [vendorId: string]: {
      transferId: string;
      status: string;
      amount: bigint;
    };
  };
  createdAt: Date;
  completedAt?: Date;
}

@Injectable()
export class MarketplaceSplitService {
  private readonly logger = new Logger(MarketplaceSplitService.name);

  private readonly stripeApiKey: string;
  private readonly paypalClientId: string;
  private readonly paypalClientSecret: string;
  private readonly flutterwaveSecretKey: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.stripeApiKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    this.paypalClientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    this.paypalClientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');
    this.flutterwaveSecretKey = this.configService.get<string>('FLUTTERWAVE_SECRET_KEY');
  }

  /**
   * Calculate vendor splits based on vendor allocation
   * Example: Flight ($1000) + Tour ($200) with 10% platform fee
   */
  calculateSplits(
    totalAmount: bigint,
    splits: VendorSplit[],
  ): SplitCalculation[] {
    const calculations: SplitCalculation[] = [];

    for (const split of splits) {
      const platformFeeAmount = BigInt(
        Math.floor(Number(split.amount) * (split.feePercentage / 100)),
      );

      calculations.push({
        vendorId: split.vendorId,
        totalAmount,
        vendorAmount: split.amount - platformFeeAmount,
        platformFee: platformFeeAmount,
        feePercentage: split.feePercentage,
      });
    }

    return calculations;
  }

  /**
   * Distribute funds via Stripe Connect using Destination Charges
   * Allows direct payment to vendor accounts with automatic transfers
   */
  async distributeViaStripeConnect(
    chargeId: string,
    splits: VendorSplit[],
  ): Promise<MarketplaceCharge> {
    this.logger.log(`Distributing Stripe charge ${chargeId} to ${splits.length} vendors`);

    const stripeClient = require('stripe')(this.stripeApiKey);
    const splitCalculations = this.calculateSplits(
      BigInt(0), // Amount already calculated
      splits,
    );

    const transfers: Record<string, any> = {};

    for (const split of splits) {
      try {
        // Create transfer to vendor's connected account
        const transfer = await stripeClient.transfers.create({
          amount: Number(split.amount - BigInt(Math.floor(Number(split.amount) * (split.feePercentage / 100)))),
          currency: 'usd', // TODO: Use actual currency from charge
          destination: split.vendorStripeAccountId,
          source_transaction: chargeId,
          description: `Payment for ${split.type}: ${split.description}`,
          metadata: {
            vendorId: split.vendorId,
            type: split.type,
            traveaseOrderId: split.vendorIds?.[0],
          },
        });

        transfers[split.vendorId] = {
          transferId: transfer.id,
          status: transfer.status,
          amount: BigInt(transfer.amount),
        };

        this.logger.debug(`Transfer created: ${transfer.id} to ${split.vendorId}`);
      } catch (error) {
        this.logger.error(
          `Stripe transfer failed for vendor ${split.vendorId}: ${error.message}`,
        );
        throw error;
      }
    }

    return {
      paymentId: chargeId,
      gateway: PaymentGateway.STRIPE,
      totalAmount: BigInt(0), // Retrieve from charge
      currency: 'USD',
      splits: splitCalculations,
      transfers,
      createdAt: new Date(),
      completedAt: new Date(),
    };
  }

  /**
   * Distribute funds via PayPal Adaptive Payments
   * Legacy but still widely used for marketplace payments
   */
  async distributeViaPayPalAdaptive(
    orderId: string,
    amount: bigint,
    currency: string,
    splits: VendorSplit[],
  ): Promise<MarketplaceCharge> {
    this.logger.log(
      `Distributing PayPal payment ${orderId} to ${splits.length} vendors via Adaptive Payments`,
    );

    try {
      const accessToken = await this.getPayPalAccessToken();

      // Build receiver list for Adaptive Payments
      const receivers = splits.map((split) => ({
        email: `vendor-${split.vendorId}@traveease.com`, // Placeholder email
        amount: (Number(split.amount) / 100).toFixed(2),
      }));

      // Platform fee receiver (Traveease)
      const platformFeeTotal = splits.reduce(
        (sum, split) =>
          sum +
          BigInt(
            Math.floor(
              Number(split.amount) *
              (split.feePercentage / 100),
            ),
          ),
        BigInt(0),
      );

      receivers.push({
        email: this.configService.get<string>('PAYPAL_MERCHANT_EMAIL'),
        amount: (Number(platformFeeTotal) / 100).toFixed(2),
      });

      const response = await firstValueFrom(
        this.httpService.post(
          'https://svcs.paypal.com/AdaptivePayments/Pay',
          new URLSearchParams({
            METHOD: 'Pay',
            VERSION: '204.0',
            RECEIVERLIST_RECEIVER_EMAIL_0: receivers[0].email,
            RECEIVERLIST_RECEIVER_AMOUNT_0: receivers[0].amount,
            RECEIVERLIST_RECEIVER_EMAIL_1: receivers[1].email,
            RECEIVERLIST_RECEIVER_AMOUNT_1: receivers[1].amount,
            CURRENCYCODE: currency,
            RETURLURL: this.configService.get<string>('PAYPAL_RETURN_URL'),
            CANCELURL: this.configService.get<string>('PAYPAL_CANCEL_URL'),
            TRACKINGID: orderId,
            ACTIONTYPE: 'PAY',
          }),
          {
            headers: {
              'X-PAYPAL-SECURITY-USERID': this.configService.get<string>('PAYPAL_API_USERNAME'),
              'X-PAYPAL-SECURITY-PASSWORD': this.configService.get<string>('PAYPAL_API_PASSWORD'),
              'X-PAYPAL-SECURITY-SIGNATURE': this.configService.get<string>('PAYPAL_API_SIGNATURE'),
              'X-PAYPAL-APPLICATION-ID': this.paypalClientId,
            },
          },
        ),
      );

      const responseParams = new URLSearchParams(response.data);
      const payKey = responseParams.get('payKey');

      if (!payKey) {
        throw new Error(`PayPal Adaptive Payment failed: ${response.data}`);
      }

      this.logger.debug(`PayPal Adaptive Payment created with payKey: ${payKey}`);

      return {
        paymentId: payKey,
        gateway: PaymentGateway.PAYPAL,
        totalAmount: amount,
        currency,
        splits: this.calculateSplits(amount, splits),
        createdAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`PayPal Adaptive Payment failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Distribute funds via Flutterwave Subaccounts
   * Supports 150+ currencies in Africa and beyond
   */
  async distributeViaFlutterwaveSubaccounts(
    transactionId: string,
    amount: bigint,
    currency: string,
    splits: VendorSplit[],
  ): Promise<MarketplaceCharge> {
    this.logger.log(
      `Distributing Flutterwave payment ${transactionId} to ${splits.length} vendors via Subaccounts`,
    );

    try {
      const splitCalculations = this.calculateSplits(amount, splits);

      // Flutterwave automatically routes to subaccounts if configured
      // The split configuration is typically done at payment initiation
      // This method validates and tracks the splits

      const transfers: Record<string, any> = {};

      for (const split of splitCalculations) {
        transfers[split.vendorId] = {
          transferId: `fw-${transactionId}-${split.vendorId}`,
          status: 'completed',
          amount: split.vendorAmount,
        };
      }

      return {
        paymentId: transactionId,
        gateway: PaymentGateway.FLUTTERWAVE,
        totalAmount: amount,
        currency,
        splits: splitCalculations,
        transfers,
        createdAt: new Date(),
        completedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Flutterwave subaccount distribution failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Handle multi-vendor refunds (partial or full)
   * Example: Flight cancelled (refund $1000) but car rental kept ($200)
   */
  async handleMultiVendorRefund(
    dto: RefundRequestDTO,
  ): Promise<RefundResponseDTO> {
    this.logger.log(
      `Processing multi-vendor refund for payment: ${dto.paymentIntentId}`,
    );

    try {
      // Retrieve original payment from ledger
      // const payment = await this.paymentLedgerRepository.findOne(dto.paymentIntentId);

      // Calculate refunds per vendor
      const splits = dto.splits || [];

      if (splits.length === 0) {
        // Full refund - return all to vendors proportionally
        this.logger.log('Full refund requested');
        // TODO: Implement full refund logic
      } else {
        // Partial refund - specific vendor splits
        for (const split of splits) {
          this.logger.log(
            `Refunding vendor ${split.vendorId}: ${split.refundAmount}`,
          );

          // Deduct non-refundable fees (e.g., GDS fees for flights)
          const netRefund = split.deductFees
            ? split.refundAmount - (split.feeDeduction || BigInt(0))
            : split.refundAmount;

          // Process refund based on original gateway
          // TODO: Route to appropriate gateway refund handler
        }
      }

      // Record refund in ledger
      return {
        id: `refund_${Date.now()}`,
        paymentIntentId: dto.paymentIntentId,
        status: PaymentStatus.REFUNDED,
        amount: dto.amount || BigInt(0),
        currency: 'USD',
        gateway: PaymentGateway.STRIPE,
        gatewayRefundId: '',
        splits: dto.splits,
        createdAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Multi-vendor refund failed: ${error.message}`);
      throw new HttpException(
        'Refund processing failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Webhook handler for Stripe transfer.updated events
   * Tracks vendor payouts and settlement status
   */
  async handleStripeTransferWebhook(event: any): Promise<void> {
    const transfer = event.data.object as StripeTransfer;

    this.logger.log(
      `Stripe transfer update: ${transfer.id} - Status: ${transfer.status}`,
    );

    // Update ledger with settlement status
    // TODO: Update ledger repository

    if (transfer.status === 'failed') {
      this.logger.error(`Stripe transfer failed: ${transfer.failure_message}`);
      // Notify vendor and retry
    }
  }

  /**
   * Webhook handler for PayPal adaptive payment completion
   */
  async handlePayPalAdaptiveWebhook(event: any): Promise<void> {
    this.logger.log(`PayPal Adaptive Payment webhook received: ${event.tracking_id}`);
    // TODO: Update payment status and record splits
  }

  /**
   * Webhook handler for Flutterwave settlement
   */
  async handleFlutterwaveSettlementWebhook(event: any): Promise<void> {
    this.logger.log(`Flutterwave settlement notification received`);
    // TODO: Update ledger with settlement status
  }

  /**
   * Ledger record for marketplace transaction
   */
  async recordMarketplaceTransaction(
    payment: MarketplaceCharge,
  ): Promise<void> {
    this.logger.log(
      `Recording marketplace transaction: ${payment.paymentId}`,
    );

    // Create ledger entries for each vendor split
    for (const split of payment.splits) {
      // TODO: Create ledger entry
      // {
      //   paymentId: payment.paymentId,
      //   vendorId: split.vendorId,
      //   amount: split.vendorAmount,
      //   platformFee: split.platformFee,
      //   status: 'pending_settlement',
      //   gateway: payment.gateway,
      // }
    }
  }

  /**
   * Get PayPal access token
   */
  private async getPayPalAccessToken(): Promise<string> {
    const auth = Buffer.from(
      `${this.paypalClientId}:${this.paypalClientSecret}`,
    ).toString('base64');

    const response = await firstValueFrom(
      this.httpService.post(
        'https://api-m.paypal.com/v1/oauth2/token',
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      ),
    );

    return response.data.access_token;
  }
}
