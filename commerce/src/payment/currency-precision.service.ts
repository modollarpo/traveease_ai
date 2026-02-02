import { Injectable } from '@nestjs/common';

export interface CurrencyAmount {
  amount: bigint;
  currency: string;
  baseCurrency: string;
  midMarketRate: number;
}

@Injectable()
export class CurrencyPrecisionService {
  storeAmount(params: CurrencyAmount) {
    // Store as BIGINT in minor units (e.g., cents, kobo)
    // Save both transaction and base currency with rate
    return {
      storedAmount: params.amount,
      currency: params.currency,
      baseCurrency: params.baseCurrency,
      midMarketRate: params.midMarketRate,
    };
  }
}
