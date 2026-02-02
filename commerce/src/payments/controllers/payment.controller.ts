/**
 * Payment Controller - Orchestration layer for payment operations
 * Exposes REST endpoints for payment intent creation, refunds, and webhook handling
 */

import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { PaymentGatewayOrchestrator } from '../services/payment-gateway-orchestrator.service';
import { MarketplaceSplitService } from '../services/marketplace-split.service';
import {
  CreatePaymentIntentDTO,
  PaymentIntentResponseDTO,
  PaymentWebhookDTO,
  RefundRequestDTO,
  RefundResponseDTO,
  GeolocationDTO,
  BNPLEligibilityDTO,
} from '../dto/payment.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(
    private paymentGatewayOrchestrator: PaymentGatewayOrchestrator,
    private marketplaceSplitService: MarketplaceSplitService,
  ) {}

  /**
   * Create a payment intent (multi-gateway orchestrated)
   */
  @Post('intents')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create Payment Intent',
    description: 'Creates a payment intent routed to the optimal gateway based on user location and currency',
  })
  @ApiResponse({
    status: 201,
    description: 'Payment intent created successfully',
    type: PaymentIntentResponseDTO,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid payment request',
  })
  @ApiResponse({
    status: 503,
    description: 'Payment gateway unavailable',
  })
  async createPaymentIntent(
    @Body() dto: CreatePaymentIntentDTO,
    @Headers('x-forwarded-for') clientIp?: string,
  ): Promise<PaymentIntentResponseDTO> {
    this.logger.log(`Creating payment intent for order: ${dto.metadata?.orderId}`);

    // Get client IP for geolocation
    const ip = clientIp || '127.0.0.1';
    dto.ipAddress = ip;

    return this.paymentGatewayOrchestrator.createPaymentIntent(dto);
  }

  /**
   * Retrieve payment intent details
   */
  @Get('intents/:id')
  @ApiOperation({
    summary: 'Get Payment Intent',
    description: 'Retrieve details of a previously created payment intent',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment intent details',
    type: PaymentIntentResponseDTO,
  })
  @ApiResponse({
    status: 404,
    description: 'Payment intent not found',
  })
  async getPaymentIntent(
    @Param('id') intentId: string,
  ): Promise<PaymentIntentResponseDTO> {
    this.logger.log(`Retrieving payment intent: ${intentId}`);
    // TODO: Implement retrieval from database/cache
    throw new Error('Not implemented');
  }

  /**
   * Request a refund for a payment
   */
  @Post('refunds')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Request Refund',
    description: 'Request a refund for a previously captured payment (full or partial)',
  })
  @ApiResponse({
    status: 201,
    description: 'Refund initiated successfully',
    type: RefundResponseDTO,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid refund request',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment not found',
  })
  async requestRefund(
    @Body() dto: RefundRequestDTO,
  ): Promise<RefundResponseDTO> {
    this.logger.log(
      `Refund requested for payment: ${dto.paymentIntentId} | Amount: ${dto.amount}`,
    );
    return this.marketplaceSplitService.handleMultiVendorRefund(dto);
  }

  /**
   * Webhook handler for Stripe events
   */
  @Post('webhooks/stripe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Stripe Webhook',
    description: 'Handle Stripe payment events',
  })
  @ApiHeader({
    name: 'stripe-signature',
    description: 'Stripe webhook signature',
  })
  async handleStripeWebhook(
    @Body() event: any,
    @Headers('stripe-signature') signature: string,
  ): Promise<{ received: boolean }> {
    this.logger.log(`Stripe webhook received: ${event.type}`);
    
    // Handle transfer events for marketplace splits
    if (event.type === 'transfer.updated' || event.type === 'transfer.created') {
      await this.marketplaceSplitService.handleStripeTransferWebhook(event);
    }
    
    return { received: true };
  }

  /**
   * Webhook handler for PayPal events
   */
  @Post('webhooks/paypal')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'PayPal Webhook',
    description: 'Handle PayPal payment events',
  })
  async handlePayPalWebhook(@Body() event: any): Promise<{ received: boolean }> {
    this.logger.log(`PayPal webhook received: ${event.event_type}`);
    // TODO: Verify and process webhook
    return { received: true };
  }

  /**
   * Webhook handler for Flutterwave events
   */
  @Post('webhooks/flutterwave')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Flutterwave Webhook',
    description: 'Handle Flutterwave payment events',
  })
  async handleFlutterwaveWebhook(@Body() event: any): Promise<{ received: boolean }> {
    this.logger.log(`Flutterwave webhook received: ${event.data?.status}`);
    // TODO: Verify and process webhook
    return { received: true };
  }

  /**
   * Webhook handler for Paystack events
   */
  @Post('webhooks/paystack')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Paystack Webhook',
    description: 'Handle Paystack payment events',
  })
  async handlePaystackWebhook(@Body() event: any): Promise<{ received: boolean }> {
    this.logger.log(`Paystack webhook received: ${event.event}`);
    // TODO: Verify and process webhook
    return { received: true };
  }

  /**
   * Health check endpoint for payment gateway status
   */
  @Get('health')
  @ApiOperation({
    summary: 'Payment Gateway Health',
    description: 'Check the health and availability of all payment gateways',
  })
  async getGatewayHealth(): Promise<Record<string, any>> {
    this.logger.log('Checking payment gateway health');
    // TODO: Implement gateway health check
    return {
      status: 'ok',
      gateways: {
        stripe: { available: true },
        paypal: { available: true },
        flutterwave: { available: true },
        paystack: { available: true },
      },
    };
  }
}
