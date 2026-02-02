/**
 * Currency Exchange Service
 * Real-time FX rates, currency conversion, FX booking
 * Integrates with XE.com, Wise (TransferWise), local FX providers
 */

import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface ExchangeRate {
  baseCurrency: string; // ISO 4217 (e.g., USD)
  targetCurrency: string; // ISO 4217 (e.g., EUR)
  rate: number; // High precision (18 decimals)
  inverseRate: number;
  bid: number; // Buy rate
  ask: number; // Sell rate
  midMarket: number; // Mid-market rate (average of bid/ask)
  timestamp: Date;
  source: 'xe' | 'wise' | 'ecb' | 'fed';
}

export interface CurrencyConversionRequest {
  amount: bigint; // Amount in minor units (e.g., cents)
  fromCurrency: string;
  toCurrency: string;
  includeFeesBreakdown?: boolean;
}

export interface CurrencyConversionResult {
  originalAmount: bigint;
  fromCurrency: string;
  toCurrency: string;
  exchangeRate: number;
  convertedAmount: bigint;
  fees: {
    conversionFee: bigint;
    serviceFee: bigint;
    totalFees: bigint;
  };
  finalAmount: bigint; // After fees
  timestamp: Date;
  rateValidUntil: Date;
}

export interface FXBookingRequest {
  fromCurrency: string;
  toCurrency: string;
  amount: bigint;
  targetRate?: number; // Book when rate reaches this level
  expiryDate: string; // ISO date
  travelerEmail: string;
}

export interface FXBooking {
  id: string;
  status: 'pending' | 'executed' | 'expired' | 'cancelled';
  fromCurrency: string;
  toCurrency: string;
  requestedAmount: bigint;
  targetRate?: number;
  currentRate: number;
  lockedRate?: number;
  lockedAt?: Date;
  expiresAt: Date;
  travelerEmail: string;
  createdAt: Date;
  executedAt?: Date;
}

export interface CurrencyInfo {
  code: string; // ISO 4217
  name: string;
  symbol: string;
  decimals: number;
  countries: string[];
  isCryptocurrency: boolean;
}

@Injectable()
export class CurrencyExchangeService {
  private readonly logger = new Logger(CurrencyExchangeService.name);

  private readonly xeApiKey: string;
  private readonly wiseApiKey: string;

  // In-memory cache for rates (15-minute TTL)
  private ratesCache: Map<string, { rate: ExchangeRate; expiry: number }> = new Map();
  private readonly CACHE_TTL = 15 * 60 * 1000; // 15 minutes

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.xeApiKey = this.configService.get<string>('XE_API_KEY');
    this.wiseApiKey = this.configService.get<string>('WISE_API_KEY');
  }

  /**
   * Get real-time exchange rate
   */
  async getExchangeRate(
    baseCurrency: string,
    targetCurrency: string,
  ): Promise<ExchangeRate> {
    this.logger.log(`Getting exchange rate: ${baseCurrency} → ${targetCurrency}`);

    const cacheKey = `${baseCurrency}_${targetCurrency}`;
    const cached = this.ratesCache.get(cacheKey);

    // Check cache
    if (cached && cached.expiry > Date.now()) {
      this.logger.log('Returning cached rate');
      return cached.rate;
    }

    try {
      // Fetch from XE.com (most accurate mid-market rates)
      const response = await firstValueFrom(
        this.httpService.get(
          `https://xecdapi.xe.com/v1/convert_from`,
          {
            params: {
              from: baseCurrency,
              to: targetCurrency,
              amount: 1,
            },
            headers: {
              'Authorization': `Basic ${Buffer.from(`${this.xeApiKey}:`).toString('base64')}`,
            },
          },
        ),
      );

      const rateData = response.data;
      const targetRate = rateData.to.find((r: any) => r.quotecurrency === targetCurrency);

      const rate: ExchangeRate = {
        baseCurrency,
        targetCurrency,
        rate: targetRate.mid,
        inverseRate: 1 / targetRate.mid,
        bid: targetRate.bid,
        ask: targetRate.ask,
        midMarket: targetRate.mid,
        timestamp: new Date(rateData.timestamp),
        source: 'xe',
      };

      // Cache the rate
      this.ratesCache.set(cacheKey, {
        rate,
        expiry: Date.now() + this.CACHE_TTL,
      });

      this.logger.log(`Rate: 1 ${baseCurrency} = ${rate.midMarket} ${targetCurrency}`);
      return rate;
    } catch (error) {
      this.logger.error(`Exchange rate fetch failed: ${error.message}`);
      
      // Fallback to ECB rates (European Central Bank)
      return await this.getECBRate(baseCurrency, targetCurrency);
    }
  }

  /**
   * Convert currency
   */
  async convertCurrency(
    request: CurrencyConversionRequest,
  ): Promise<CurrencyConversionResult> {
    this.logger.log(
      `Converting ${request.amount} ${request.fromCurrency} → ${request.toCurrency}`,
    );

    try {
      const rate = await this.getExchangeRate(
        request.fromCurrency,
        request.toCurrency,
      );

      // Convert using mid-market rate
      const amountInMajorUnits = Number(request.amount) / 100;
      const convertedAmount = BigInt(
        Math.round(amountInMajorUnits * rate.midMarket * 100),
      );

      // Calculate fees (1% conversion fee + $2 service fee)
      const conversionFeeRate = 0.01; // 1%
      const conversionFee = BigInt(Math.round(Number(request.amount) * conversionFeeRate));
      const serviceFee = BigInt(200); // $2 in cents
      const totalFees = conversionFee + serviceFee;
      const finalAmount = convertedAmount - totalFees;

      const result: CurrencyConversionResult = {
        originalAmount: request.amount,
        fromCurrency: request.fromCurrency,
        toCurrency: request.toCurrency,
        exchangeRate: rate.midMarket,
        convertedAmount: convertedAmount,
        fees: {
          conversionFee,
          serviceFee,
          totalFees,
        },
        finalAmount,
        timestamp: new Date(),
        rateValidUntil: new Date(Date.now() + 30 * 60 * 1000), // 30 min
      };

      this.logger.log(`Converted: ${result.finalAmount} ${result.toCurrency}`);
      return result;
    } catch (error) {
      this.logger.error(`Currency conversion failed: ${error.message}`);
      throw new HttpException(
        'Currency conversion failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get multiple exchange rates
   */
  async getMultipleRates(
    baseCurrency: string,
    targetCurrencies: string[],
  ): Promise<ExchangeRate[]> {
    this.logger.log(
      `Getting rates for ${baseCurrency} → [${targetCurrencies.join(', ')}]`,
    );

    try {
      const rates = await Promise.all(
        targetCurrencies.map((target) =>
          this.getExchangeRate(baseCurrency, target),
        ),
      );

      return rates;
    } catch (error) {
      this.logger.error(`Multiple rates fetch failed: ${error.message}`);
      throw new HttpException(
        'Failed to fetch exchange rates',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Book FX rate (lock rate for future transaction)
   */
  async bookFXRate(request: FXBookingRequest): Promise<FXBooking> {
    this.logger.log(
      `Booking FX rate: ${request.fromCurrency} → ${request.toCurrency}`,
    );

    try {
      const currentRate = await this.getExchangeRate(
        request.fromCurrency,
        request.toCurrency,
      );

      const booking: FXBooking = {
        id: `fx_${Date.now()}`,
        status: 'pending',
        fromCurrency: request.fromCurrency,
        toCurrency: request.toCurrency,
        requestedAmount: request.amount,
        targetRate: request.targetRate,
        currentRate: currentRate.midMarket,
        expiresAt: new Date(request.expiryDate),
        travelerEmail: request.travelerEmail,
        createdAt: new Date(),
      };

      // If no target rate, lock current rate immediately
      if (!request.targetRate) {
        booking.status = 'executed';
        booking.lockedRate = currentRate.midMarket;
        booking.lockedAt = new Date();
      }

      // TODO: Save to database
      // TODO: Set up background job to monitor rate and execute when target is reached

      this.logger.log(`FX booking created: ${booking.id}`);
      return booking;
    } catch (error) {
      this.logger.error(`FX booking failed: ${error.message}`);
      throw new HttpException(
        'FX booking failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get currency information
   */
  async getCurrencyInfo(currencyCode: string): Promise<CurrencyInfo> {
    this.logger.log(`Getting info for currency: ${currencyCode}`);

    const currencyDatabase: Record<string, CurrencyInfo> = {
      USD: {
        code: 'USD',
        name: 'United States Dollar',
        symbol: '$',
        decimals: 2,
        countries: ['US', 'EC', 'SV', 'PA'],
        isCryptocurrency: false,
      },
      EUR: {
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
        decimals: 2,
        countries: ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT'],
        isCryptocurrency: false,
      },
      GBP: {
        code: 'GBP',
        name: 'British Pound Sterling',
        symbol: '£',
        decimals: 2,
        countries: ['GB'],
        isCryptocurrency: false,
      },
      NGN: {
        code: 'NGN',
        name: 'Nigerian Naira',
        symbol: '₦',
        decimals: 2,
        countries: ['NG'],
        isCryptocurrency: false,
      },
      KES: {
        code: 'KES',
        name: 'Kenyan Shilling',
        symbol: 'KSh',
        decimals: 2,
        countries: ['KE'],
        isCryptocurrency: false,
      },
      ZAR: {
        code: 'ZAR',
        name: 'South African Rand',
        symbol: 'R',
        decimals: 2,
        countries: ['ZA'],
        isCryptocurrency: false,
      },
      JPY: {
        code: 'JPY',
        name: 'Japanese Yen',
        symbol: '¥',
        decimals: 0,
        countries: ['JP'],
        isCryptocurrency: false,
      },
      CNY: {
        code: 'CNY',
        name: 'Chinese Yuan',
        symbol: '¥',
        decimals: 2,
        countries: ['CN'],
        isCryptocurrency: false,
      },
      AED: {
        code: 'AED',
        name: 'UAE Dirham',
        symbol: 'د.إ',
        decimals: 2,
        countries: ['AE'],
        isCryptocurrency: false,
      },
    };

    const info = currencyDatabase[currencyCode];

    if (!info) {
      throw new HttpException(
        `Currency ${currencyCode} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return info;
  }

  /**
   * Get historical exchange rates
   */
  async getHistoricalRates(
    baseCurrency: string,
    targetCurrency: string,
    startDate: string,
    endDate: string,
  ): Promise<{ date: string; rate: number }[]> {
    this.logger.log(
      `Getting historical rates: ${baseCurrency} → ${targetCurrency} (${startDate} to ${endDate})`,
    );

    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://xecdapi.xe.com/v1/historic_rate`,
          {
            params: {
              from: baseCurrency,
              to: targetCurrency,
              date: startDate,
            },
            headers: {
              'Authorization': `Basic ${Buffer.from(`${this.xeApiKey}:`).toString('base64')}`,
            },
          },
        ),
      );

      // TODO: Fetch multiple dates in range
      // For now, return single date
      return [
        {
          date: startDate,
          rate: response.data.to[0].mid,
        },
      ];
    } catch (error) {
      this.logger.error(`Historical rates fetch failed: ${error.message}`);
      throw new HttpException(
        'Failed to fetch historical rates',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fallback: Get ECB rates
   */
  private async getECBRate(
    baseCurrency: string,
    targetCurrency: string,
  ): Promise<ExchangeRate> {
    this.logger.log('Using ECB fallback rates');

    try {
      const response = await firstValueFrom(
        this.httpService.get(
          'https://api.exchangerate.host/latest',
          {
            params: {
              base: baseCurrency,
              symbols: targetCurrency,
            },
          },
        ),
      );

      const rate = response.data.rates[targetCurrency];

      return {
        baseCurrency,
        targetCurrency,
        rate: rate,
        inverseRate: 1 / rate,
        bid: rate * 0.998, // Approximate bid/ask spread
        ask: rate * 1.002,
        midMarket: rate,
        timestamp: new Date(response.data.date),
        source: 'ecb',
      };
    } catch (error) {
      this.logger.error(`ECB rate fetch failed: ${error.message}`);
      throw new HttpException(
        'All exchange rate sources failed',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Calculate optimal currency for payment
   * Based on conversion fees, exchange rates, and user location
   */
  async getOptimalPaymentCurrency(
    userLocation: string, // ISO country code
    vendorCurrency: string,
    amount: bigint,
  ): Promise<{
    recommendedCurrency: string;
    reason: string;
    savings: bigint;
    comparison: {
      currency: string;
      totalCost: bigint;
      exchangeRate?: number;
      fees: bigint;
    }[];
  }> {
    this.logger.log(
      `Calculating optimal payment currency for ${userLocation} → ${vendorCurrency}`,
    );

    // Get user's local currency
    const localCurrency = this.getCountryCurrency(userLocation);

    // Calculate cost in both currencies
    const [localConversion, vendorConversion] = await Promise.all([
      this.convertCurrency({
        amount,
        fromCurrency: localCurrency,
        toCurrency: vendorCurrency,
      }),
      this.convertCurrency({
        amount,
        fromCurrency: vendorCurrency,
        toCurrency: vendorCurrency, // No conversion needed
      }),
    ]);

    const comparison = [
      {
        currency: localCurrency,
        totalCost: amount + localConversion.fees.totalFees,
        exchangeRate: localConversion.exchangeRate,
        fees: localConversion.fees.totalFees,
      },
      {
        currency: vendorCurrency,
        totalCost: amount,
        fees: BigInt(0),
      },
    ];

    // Determine optimal currency
    const sortedByTotalCost = [...comparison].sort(
      (a, b) => Number(a.totalCost - b.totalCost),
    );

    const optimal = sortedByTotalCost[0];
    const savings = sortedByTotalCost[1].totalCost - optimal.totalCost;

    return {
      recommendedCurrency: optimal.currency,
      reason:
        optimal.currency === vendorCurrency
          ? 'Pay in vendor currency to avoid conversion fees'
          : 'Your local currency offers better total value',
      savings,
      comparison,
    };
  }

  /**
   * Get country's default currency
   */
  private getCountryCurrency(countryCode: string): string {
    const currencyMap: Record<string, string> = {
      US: 'USD',
      CA: 'CAD',
      GB: 'GBP',
      EU: 'EUR',
      DE: 'EUR',
      FR: 'EUR',
      IT: 'EUR',
      ES: 'EUR',
      NG: 'NGN',
      GH: 'GHS',
      KE: 'KES',
      ZA: 'ZAR',
      JP: 'JPY',
      CN: 'CNY',
      AE: 'AED',
      AU: 'AUD',
      IN: 'INR',
    };

    return currencyMap[countryCode] || 'USD';
  }

  /**
   * Clear rates cache (for testing or manual refresh)
   */
  clearCache(): void {
    this.ratesCache.clear();
    this.logger.log('Exchange rates cache cleared');
  }
}
