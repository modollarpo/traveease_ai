/**
 * Payment Module - Orchestrates all payment gateway integrations
 */

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentGatewayOrchestrator } from './services/payment-gateway-orchestrator.service';
import { MarketplaceSplitService } from './services/marketplace-split.service';
import { PaymentController } from './controllers/payment.controller';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    // TypeOrmModule.forFeature([Payment, Refund, PaymentLedger]),
  ],
  controllers: [PaymentController],
  providers: [
    PaymentGatewayOrchestrator,
    MarketplaceSplitService,
  ],
  exports: [
    PaymentGatewayOrchestrator,
    MarketplaceSplitService,
  ],
})
export class PaymentsModule {}
