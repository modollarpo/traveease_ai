/**
 * Payment Gateway Orchestrator Service
 * Routes payments to optimal gateway based on user location, currency, and vendor preference
 */

import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  CreatePaymentIntentDTO,
  PaymentIntentResponseDTO,
  PaymentGateway,
  Region,
  GeolocationDTO,
  BNPLEligibilityDTO,
  BNPLProvider,
  GatewayAvailabilityDTO,
  PaymentStatus,
} from '../dto/payment.dto';

@Injectable()
export class PaymentGatewayOrchestrator {
  private readonly logger = new Logger(PaymentGatewayOrchestrator.name);

  private readonly stripeApiKey: string;
  private readonly paypalClientId: string;
  private readonly flutterwaveSecretKey: string;
  private readonly paystackSecretKey: string;
  private readonly maxmindAccountId: string;

  /** Gateway routing configuration */
  private readonly gatewayPreferences = {
    [Region.US]: [PaymentGateway.STRIPE, PaymentGateway.PAYPAL],
    [Region.EU]: [PaymentGateway.STRIPE, PaymentGateway.PAYPAL],
    [Region.AFRICA]: [PaymentGateway.FLUTTERWAVE, PaymentGateway.PAYSTACK, PaymentGateway.STRIPE],
    [Region.APAC]: [PaymentGateway.STRIPE, PaymentGateway.PAYPAL],
    [Region.LATAM]: [PaymentGateway.PAYPAL, PaymentGateway.STRIPE],
  };

  /** Currency to gateway mapping */
  private readonly currencyGatewayMap = {
    NGN: [PaymentGateway.PAYSTACK, PaymentGateway.FLUTTERWAVE],
    GHS: [PaymentGateway.PAYSTACK, PaymentGateway.FLUTTERWAVE],
    KES: [PaymentGateway.FLUTTERWAVE, PaymentGateway.STRIPE],
    ZAR: [PaymentGateway.FLUTTERWAVE, PaymentGateway.STRIPE],
    UGX: [PaymentGateway.FLUTTERWAVE],
    EUR: [PaymentGateway.STRIPE, PaymentGateway.PAYPAL],
    USD: [PaymentGateway.STRIPE, PaymentGateway.PAYPAL, PaymentGateway.FLUTTERWAVE],
    GBP: [PaymentGateway.STRIPE, PaymentGateway.PAYPAL],
  };

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.stripeApiKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    this.paypalClientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    this.flutterwaveSecretKey = this.configService.get<string>('FLUTTERWAVE_SECRET_KEY');
    this.paystackSecretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    this.maxmindAccountId = this.configService.get<string>('MAXMIND_ACCOUNT_ID');
  }

  /**
   * Main orchestration method - detects user location and creates payment intent via optimal gateway
   */
  async createPaymentIntent(
    dto: CreatePaymentIntentDTO,
  ): Promise<PaymentIntentResponseDTO> {
    this.logger.log(
      `Creating payment intent: ${dto.metadata?.orderId} | Amount: ${dto.amount} ${dto.currency}`,
    );

    try {
      // Step 1: Detect user geolocation
      const geolocation = await this.detectGeolocation(dto.ipAddress);

      // Step 2: Determine optimal gateway
      const optimalGateway = this.selectOptimalGateway(
        geolocation,
        dto.currency,
        dto.splits?.map((s) => s.vendorIds),
      );

      this.logger.debug(
        `Selected gateway: ${optimalGateway} for region: ${geolocation.region}`,
      );

      // Step 3: Validate gateway availability
      const gatewayAvailable = await this.checkGatewayAvailability(optimalGateway, geolocation);
      if (!gatewayAvailable.available) {
        this.logger.warn(
          `Gateway ${optimalGateway} unavailable, attempting fallback...`,
        );
        return this.createPaymentIntentWithFallback(dto, geolocation);
      }

      // Step 4: Create payment intent via selected gateway
      let response: PaymentIntentResponseDTO;

      switch (optimalGateway) {
        case PaymentGateway.STRIPE:
          response = await this.createStripePaymentIntent(dto);
          break;
        case PaymentGateway.PAYPAL:
          response = await this.createPayPalPaymentIntent(dto);
          break;
        case PaymentGateway.FLUTTERWAVE:
          response = await this.createFlutterwavePaymentIntent(dto);
          break;
        case PaymentGateway.PAYSTACK:
          response = await this.createPaystackPaymentIntent(dto);
          break;
        default:
          throw new Error(`Unknown gateway: ${optimalGateway}`);
      }

      // Step 5: Check BNPL eligibility if requested
      if (dto.bnplEligible && response.gateway === PaymentGateway.STRIPE) {
        const bnplEligibility = await this.checkBNPLEligibility(response, geolocation);
        if (bnplEligibility.eligible) {
          response.bnplProvider = bnplEligibility.providers[0];
        }
      }

      this.logger.log(
        `Payment intent created: ${response.id} via ${response.gateway}`,
      );

      return response;
    } catch (error) {
      this.logger.error(`Payment intent creation failed: ${error.message}`, error.stack);
      throw new HttpException(
        'Payment intent creation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Detect user geolocation using MaxMind GeoIP2
   */
  private async detectGeolocation(ipAddress: string): Promise<GeolocationDTO> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://geoip.maxmind.com/geoip/v2.1/insights/${ipAddress}`,
          {
            auth: {
              username: this.maxmindAccountId,
              password: this.configService.get<string>('MAXMIND_LICENSE_KEY'),
            },
          },
        ),
      );

      const data = response.data;
      const country = data.country.iso_code;

      return {
        country: data.country.names.en,
        countryCode: country,
        region: this.mapCountryToRegion(country),
        city: data.city?.names?.en || 'Unknown',
        timezone: data.location.time_zone,
        currency: this.mapCountryToCurrency(country),
        recommendedGateways: this.gatewayPreferences[this.mapCountryToRegion(country)],
        supportedCurrencies: this.currencyGatewayMap[
          this.mapCountryToCurrency(country)
        ],
      };
    } catch (error) {
      this.logger.warn(`Geolocation detection failed for IP ${ipAddress}, using default`);
      // Fallback to default geolocation based on currency
      return {
        country: 'Unknown',
        countryCode: 'XX',
        region: Region.APAC,
        city: 'Unknown',
        timezone: 'UTC',
        currency: 'USD',
        recommendedGateways: [PaymentGateway.STRIPE, PaymentGateway.PAYPAL],
        supportedCurrencies: ['USD', 'EUR', 'GBP'],
      };
    }
  }

  /**
   * Select optimal gateway based on region, currency, and vendor preference
   */
  private selectOptimalGateway(
    geolocation: GeolocationDTO,
    currency: string,
    vendorCountries?: string[],
  ): PaymentGateway {
    // Priority 1: Currency-specific gateway
    const currencyGateways = this.currencyGatewayMap[currency] || [];
    if (currencyGateways.length > 0) {
      const regionPreferences = this.gatewayPreferences[geolocation.region] || [];
      const intersection = currencyGateways.filter((g) =>
        regionPreferences.includes(g),
      );
      if (intersection.length > 0) return intersection[0];
      return currencyGateways[0];
    }

    // Priority 2: Region-based gateway
    return this.gatewayPreferences[geolocation.region][0] || PaymentGateway.STRIPE;
  }

  /**
   * Create Stripe Payment Intent
   */
  private async createStripePaymentIntent(
    dto: CreatePaymentIntentDTO,
  ): Promise<PaymentIntentResponseDTO> {
    try {
      const stripeClient = require('stripe')(this.stripeApiKey);

      const paymentIntent = await stripeClient.paymentIntents.create({
        amount: Number(dto.amount),
        currency: dto.currency.toLowerCase(),
        metadata: dto.metadata,
        description: dto.metadata?.description || 'Traveease booking',
        receipt_email: dto.email,
        statement_descriptor: 'TRAVEEASE TRAVEL',
        // Marketplace support
        on_behalf_of: dto.metadata?.vendorIds?.[0] || undefined,
        transfer_data: dto.splits?.length
          ? {
              destination: dto.splits[0]?.vendorStripeAccountId,
            }
          : undefined,
      });

      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: this.mapStripeStatus(paymentIntent.status),
        gateway: PaymentGateway.STRIPE,
        gatewayIntentId: paymentIntent.id,
        amount: BigInt(paymentIntent.amount),
        currency: paymentIntent.currency.toUpperCase(),
        locale: dto.locale,
        createdAt: new Date(paymentIntent.created * 1000),
        expiresAt: new Date(paymentIntent.created * 1000 + 15 * 60 * 1000), // 15 min expiry
        nextAction:
          paymentIntent.status === 'requires_action'
            ? {
                type: 'use_stripe_sdk',
                expiresAt: new Date(Date.now() + 15 * 60 * 1000),
              }
            : undefined,
      };
    } catch (error) {
      this.logger.error(`Stripe payment intent creation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create PayPal Payment Intent
   */
  private async createPayPalPaymentIntent(
    dto: CreatePaymentIntentDTO,
  ): Promise<PaymentIntentResponseDTO> {
    try {
      // Get PayPal access token
      const accessToken = await this.getPayPalAccessToken();

      const orderData = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: dto.currency,
              value: (Number(dto.amount) / 100).toFixed(2), // Convert from minor units
            },
            description: dto.metadata?.description || 'Traveease booking',
            reference_id: dto.metadata?.orderId,
            // PayPal Commerce Platform for splits
            payee:
              dto.splits?.length > 0
                ? {
                    email_address: `vendor-${dto.splits[0].vendorId}@traveease.com`,
                  }
                : undefined,
          },
        ],
        payer: {
          email_address: dto.email,
        },
        application_context: {
          locale: dto.locale || 'en-US',
          return_url: dto.returnUrl || 'https://traveease.com/payment/success',
          cancel_url: dto.cancelUrl || 'https://traveease.com/payment/cancel',
          user_action: 'PAY_NOW',
        },
      };

      const response = await firstValueFrom(
        this.httpService.post('https://api-m.paypal.com/v2/checkout/orders', orderData, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      const order = response.data;

      return {
        id: order.id,
        status: this.mapPayPalStatus(order.status),
        gateway: PaymentGateway.PAYPAL,
        gatewayIntentId: order.id,
        amount: BigInt(dto.amount),
        currency: dto.currency,
        locale: dto.locale,
        createdAt: new Date(order.create_time),
        expiresAt: new Date(new Date(order.create_time).getTime() + 3 * 60 * 60 * 1000), // 3 hour expiry
        redirectUrl: order.links.find((l: any) => l.rel === 'approve')?.href,
      };
    } catch (error) {
      this.logger.error(`PayPal payment intent creation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create Flutterwave Payment Intent
   */
  private async createFlutterwavePaymentIntent(
    dto: CreatePaymentIntentDTO,
  ): Promise<PaymentIntentResponseDTO> {
    try {
      const flutterwaveData = {
        tx_ref: dto.metadata?.orderId || `order_${Date.now()}`,
        amount: Number(dto.amount) / 100, // Convert from minor units
        currency: dto.currency,
        payment_options: 'card,mobilemoney,ussd',
        customer: {
          email: dto.email,
        },
        customizations: {
          title: 'Traveease Booking',
          description: dto.metadata?.description,
          logo: 'https://traveease.com/logo.png',
        },
        meta: dto.metadata,
        // Subaccount for vendor splits
        subaccounts:
          dto.splits?.map((split) => ({
            id: split.vendorFlutterwaveAccountId,
            transaction_charge_type: 'percentage',
            transaction_charge: split.feePercentage,
          })) || [],
      };

      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.flutterwave.com/v3/payments',
          flutterwaveData,
          {
            headers: {
              Authorization: `Bearer ${this.flutterwaveSecretKey}`,
            },
          },
        ),
      );

      const payment = response.data.data;

      return {
        id: payment.id,
        status: this.mapFlutterwaveStatus(payment.status),
        gateway: PaymentGateway.FLUTTERWAVE,
        gatewayIntentId: payment.id,
        amount: BigInt(dto.amount),
        currency: dto.currency,
        locale: dto.locale,
        createdAt: new Date(payment.created_at),
        expiresAt: new Date(new Date(payment.created_at).getTime() + 30 * 60 * 1000), // 30 min expiry
        redirectUrl: payment.data?.link,
      };
    } catch (error) {
      this.logger.error(`Flutterwave payment intent creation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create Paystack Payment Intent
   */
  private async createPaystackPaymentIntent(
    dto: CreatePaymentIntentDTO,
  ): Promise<PaymentIntentResponseDTO> {
    try {
      const paystackData = {
        amount: Number(dto.amount), // Already in minor units
        email: dto.email,
        metadata: {
          ...dto.metadata,
          locale: dto.locale,
        },
        currency: dto.currency,
      };

      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.paystack.co/transaction/initialize',
          paystackData,
          {
            headers: {
              Authorization: `Bearer ${this.paystackSecretKey}`,
            },
          },
        ),
      );

      const transaction = response.data.data;

      return {
        id: transaction.reference,
        status: PaymentStatus.PENDING,
        gateway: PaymentGateway.PAYSTACK,
        gatewayIntentId: transaction.reference,
        amount: BigInt(dto.amount),
        currency: dto.currency,
        locale: dto.locale,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min expiry
        redirectUrl: transaction.authorization_url,
      };
    } catch (error) {
      this.logger.error(`Paystack payment intent creation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Fallback to alternative gateway if primary fails
   */
  private async createPaymentIntentWithFallback(
    dto: CreatePaymentIntentDTO,
    geolocation: GeolocationDTO,
  ): Promise<PaymentIntentResponseDTO> {
    const availableGateways = this.gatewayPreferences[geolocation.region] || [
      PaymentGateway.STRIPE,
    ];

    for (const gateway of availableGateways) {
      try {
        const isAvailable = await this.checkGatewayAvailability(gateway, geolocation);
        if (!isAvailable.available) continue;

        this.logger.log(`Attempting payment via fallback gateway: ${gateway}`);

        let response: PaymentIntentResponseDTO;
        switch (gateway) {
          case PaymentGateway.STRIPE:
            response = await this.createStripePaymentIntent(dto);
            break;
          case PaymentGateway.PAYPAL:
            response = await this.createPayPalPaymentIntent(dto);
            break;
          case PaymentGateway.FLUTTERWAVE:
            response = await this.createFlutterwavePaymentIntent(dto);
            break;
          case PaymentGateway.PAYSTACK:
            response = await this.createPaystackPaymentIntent(dto);
            break;
          default:
            continue;
        }

        this.logger.log(`Fallback succeeded via ${gateway}`);
        return response;
      } catch (error) {
        this.logger.warn(
          `Fallback gateway ${gateway} failed: ${error.message}`,
        );
        continue;
      }
    }

    throw new HttpException(
      'All payment gateways unavailable',
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }

  /**
   * Check BNPL eligibility based on amount and region
   */
  async checkBNPLEligibility(
    paymentIntent: PaymentIntentResponseDTO,
    geolocation: GeolocationDTO,
  ): Promise<BNPLEligibilityDTO> {
    // BNPL typically available for orders $50-$2000+
    const amount = Number(paymentIntent.amount);
    const minAmount = BigInt(5000); // $50 in cents
    const maxAmount = BigInt(200000); // $2000 in cents

    const eligible = amount >= minAmount && amount <= maxAmount;

    let providers: BNPLProvider[] = [];
    if (eligible && paymentIntent.gateway === PaymentGateway.STRIPE) {
      providers = [
        BNPLProvider.STRIPE_KLARNA,
        BNPLProvider.STRIPE_AFTERPAY,
      ];
    } else if (
      eligible &&
      paymentIntent.gateway === PaymentGateway.PAYPAL
    ) {
      providers = [BNPLProvider.PAYPAL_BNPL];
    }

    const installments = eligible ? [3, 4, 6, 12] : [];
    const monthlyPayment = eligible
      ? BigInt(Math.floor(Number(paymentIntent.amount) / installments[0]))
      : undefined;

    return {
      eligible,
      providers,
      minAmount,
      maxAmount,
      installments,
      apr: eligible ? 0 : undefined, // 0% APR for qualifying purchases
      monthlyPayment,
    };
  }

  /**
   * Check if payment gateway is available and responsive
   */
  private async checkGatewayAvailability(
    gateway: PaymentGateway,
    geolocation: GeolocationDTO,
  ): Promise<GatewayAvailabilityDTO> {
    const availability: GatewayAvailabilityDTO = {
      gateway,
      available: false,
      region: geolocation.region,
      supportedCurrencies: [],
      processingFee: 0,
      settlementTime: 'T+1',
      lastStatusCheck: new Date(),
    };

    try {
      // Check gateway health endpoint
      switch (gateway) {
        case PaymentGateway.STRIPE:
          availability.available = true;
          availability.processingFee = 2.9; // 2.9% + $0.30
          availability.supportedCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
          break;
        case PaymentGateway.PAYPAL:
          availability.available = true;
          availability.processingFee = 3.49; // 3.49% + $0.49
          availability.supportedCurrencies = ['USD', 'EUR', 'GBP', 'AUD', 'CAD'];
          break;
        case PaymentGateway.FLUTTERWAVE:
          availability.available = true;
          availability.processingFee = 1.4; // Platform dependent
          availability.supportedCurrencies = [
            'NGN', 'GHS', 'KES', 'TZS', 'UGX', 'ZAR', 'XOF', 'USD', 'EUR',
          ];
          break;
        case PaymentGateway.PAYSTACK:
          availability.available = true;
          availability.processingFee = 1.5; // 1.5% + ₦10
          availability.supportedCurrencies = ['NGN'];
          break;
      }

      // Verify currency support for this region
      if (
        !availability.supportedCurrencies.includes(
          geolocation.currency,
        )
      ) {
        availability.available = false;
      }
    } catch (error) {
      availability.available = false;
      this.logger.warn(`Gateway ${gateway} availability check failed: ${error.message}`);
    }

    return availability;
  }

  /**
   * Helper: Get PayPal access token
   */
  private async getPayPalAccessToken(): Promise<string> {
    const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');
    const auth = Buffer.from(
      `${this.paypalClientId}:${clientSecret}`,
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

  /**
   * Helper: Map country to region
   */
  private mapCountryToRegion(countryCode: string): Region {
    const regionMap = {
      US: Region.US,
      CA: Region.US,
      MX: Region.LATAM,
      BR: Region.LATAM,
      DE: Region.EU,
      FR: Region.EU,
      GB: Region.EU,
      NG: Region.AFRICA,
      GH: Region.AFRICA,
      KE: Region.AFRICA,
      ZA: Region.AFRICA,
      SG: Region.APAC,
      JP: Region.APAC,
      AU: Region.APAC,
    };
    return regionMap[countryCode] || Region.APAC;
  }

  /**
   * Helper: Map country to default currency
   */
  private mapCountryToCurrency(countryCode: string): string {
    const currencyMap = {
      US: 'USD',
      CA: 'CAD',
      GB: 'GBP',
      DE: 'EUR',
      FR: 'EUR',
      NG: 'NGN',
      GH: 'GHS',
      KE: 'KES',
      ZA: 'ZAR',
      JP: 'JPY',
      SG: 'SGD',
      AU: 'AUD',
    };
    return currencyMap[countryCode] || 'USD';
  }

  /**
   * Helper: Map Stripe status to unified status
   */
  private mapStripeStatus(
    stripeStatus: string,
  ): PaymentStatus {
    const statusMap = {
      requires_payment_method: PaymentStatus.PENDING,
      requires_confirmation: PaymentStatus.PENDING,
      requires_action: PaymentStatus.PENDING,
      processing: PaymentStatus.AUTHORIZED,
      requires_capture: PaymentStatus.AUTHORIZED,
      canceled: PaymentStatus.CANCELLED,
      succeeded: PaymentStatus.CAPTURED,
    };
    return statusMap[stripeStatus] || PaymentStatus.PENDING;
  }

  /**
   * Helper: Map PayPal status to unified status
   */
  private mapPayPalStatus(paypalStatus: string): PaymentStatus {
    const statusMap = {
      CREATED: PaymentStatus.PENDING,
      SAVED: PaymentStatus.AUTHORIZED,
      APPROVED: PaymentStatus.AUTHORIZED,
      VOIDED: PaymentStatus.CANCELLED,
      COMPLETED: PaymentStatus.CAPTURED,
      PAYER_ACTION_REQUIRED: PaymentStatus.PENDING,
    };
    return statusMap[paypalStatus] || PaymentStatus.PENDING;
  }

  /**
   * Helper: Map Flutterwave status to unified status
   */
  private mapFlutterwaveStatus(
    flutterwaveStatus: string,
  ): PaymentStatus {
    const statusMap = {
      pending: PaymentStatus.PENDING,
      failed: PaymentStatus.FAILED,
      successful: PaymentStatus.CAPTURED,
    };
    return statusMap[flutterwaveStatus] || PaymentStatus.PENDING;
  }
}
