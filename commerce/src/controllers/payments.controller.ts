import { Controller, Post, Body } from '@nestjs/common';
import { PaymentGatewayOrchestrator } from '../payment/orchestrator.service';
import { MarketplaceSplitService } from '../payment/split.service';
import { LogisticsSagaService } from '../payment/logistics-saga.service';
import { CurrencyPrecisionService } from '../payment/currency-precision.service';
import { NigerianComplianceService } from '../payment/nigerian-compliance.service';
import { MultiVendorCartService } from '../payment/multi-vendor-cart.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly orchestrator: PaymentGatewayOrchestrator,
    private readonly splitService: MarketplaceSplitService,
    private readonly logisticsSaga: LogisticsSagaService,
    private readonly currencyService: CurrencyPrecisionService,
    private readonly nigerianCompliance: NigerianComplianceService,
    private readonly multiVendorCart: MultiVendorCartService,
  ) {}

  @Post('intent')
  async createPaymentIntent(@Body() body) {
    return this.orchestrator.createPaymentIntent(body);
  }

  @Post('split')
  async splitPayments(@Body() body) {
    return this.splitService.splitPayments(body);
  }

  @Post('logistics')
  async logisticsSaga(@Body() body) {
    switch (body.action) {
      case 'holdInventory':
        return this.logisticsSaga.holdInventory(body.ttl);
      case 'lockPrice':
        return this.logisticsSaga.lockPrice();
      case 'captureAuth':
        return this.logisticsSaga.captureAuth();
      case 'ticket':
        return this.logisticsSaga.ticket();
      default:
        return { error: 'Invalid action' };
    }
  }

  @Post('currency')
  async storeAmount(@Body() body) {
    return this.currencyService.storeAmount(body);
  }

  @Post('compliance/stamp-duty')
  async calculateStampDuty(@Body() body) {
    return {
      stampDuty: this.nigerianCompliance.calculateStampDuty(
        body.amount,
        body.currency,
      ),
    };
  }

  @Post('compliance/total')
  async calculateTotalWithCompliance(@Body() body) {
    return this.nigerianCompliance.calculateTotalWithCompliance(body);
  }

  @Post('cart/create')
  async createCart(@Body() body) {
    return this.multiVendorCart.createCart(body);
  }

  @Post('cart/markup')
  async applyVendorMarkup(@Body() body) {
    return this.multiVendorCart.applyVendorMarkup(body);
  }
}

