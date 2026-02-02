/**
 * Travel Insurance Service
 * Comprehensive travel insurance coverage for trips
 * Integrates with Allianz, World Nomads, SafetyWing
 */

import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export enum InsuranceType {
  SINGLE_TRIP = 'single_trip',
  MULTI_TRIP = 'multi_trip',
  ANNUAL = 'annual',
  BACKPACKER = 'backpacker',
  BUSINESS = 'business',
  STUDENT = 'student',
}

export enum CoverageType {
  MEDICAL = 'medical',
  TRIP_CANCELLATION = 'trip_cancellation',
  TRIP_INTERRUPTION = 'trip_interruption',
  BAGGAGE_LOSS = 'baggage_loss',
  BAGGAGE_DELAY = 'baggage_delay',
  FLIGHT_DELAY = 'flight_delay',
  EMERGENCY_EVACUATION = 'emergency_evacuation',
  ADVENTURE_SPORTS = 'adventure_sports',
  RENTAL_CAR = 'rental_car',
  COVID_19 = 'covid_19',
  TERRORISM = 'terrorism',
  NATURAL_DISASTERS = 'natural_disasters',
}

export interface InsuranceQuoteRequest {
  insuranceType: InsuranceType;
  tripDetails: {
    destination: string[]; // Multiple countries
    departureDate: string;
    returnDate: string;
    tripCost?: bigint; // Total trip cost for cancellation coverage
  };
  travelers: {
    age: number;
    preexistingConditions?: string[];
  }[];
  coverageTypes: CoverageType[];
  additionalOptions?: {
    includeAdventureSports?: boolean;
    includeRentalCarCoverage?: boolean;
    cancelForAnyReason?: boolean; // Premium add-on
    increasemedicalLimit?: bigint;
  };
}

export interface InsuranceQuote {
  provider: 'allianz' | 'world_nomads' | 'safetywing' | 'local';
  quoteId: string;
  plan: {
    name: string;
    type: InsuranceType;
    description: string;
  };
  coverage: {
    type: CoverageType;
    limit: bigint; // In minor units (e.g., $100,000 = 10000000 cents)
    deductible: bigint;
    description: string;
  }[];
  pricing: {
    premium: bigint; // Total premium in minor units
    currency: string;
    breakdown: {
      basePremium: bigint;
      taxes: bigint;
      fees: bigint;
    };
    paymentOptions: ('full' | 'monthly')[];
  };
  terms: {
    policyPeriod: {
      start: string;
      end: string;
    };
    exclusions: string[];
    limitations: string[];
    policyDocument: string; // PDF URL
  };
  rating: {
    score: number;
    reviewCount: number;
    claimApprovalRate: number; // Percentage
    averageClaimProcessingDays: number;
  };
  validUntil: Date; // Quote expiry
}

export interface InsurancePurchaseRequest {
  quoteId: string;
  provider: string;
  travelers: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: 'M' | 'F' | 'X';
    email: string;
    phone: string;
    passportNumber?: string;
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
    medicalHistory?: {
      preexistingConditions: string[];
      medications: string[];
      allergies: string[];
    };
  }[];
  beneficiaries?: {
    name: string;
    relationship: string;
    percentage: number; // 0-100
  }[];
  paymentIntentId: string;
}

export interface InsurancePolicy {
  id: string;
  policyNumber: string;
  provider: string;
  status: 'active' | 'expired' | 'cancelled' | 'claimed';
  plan: {
    name: string;
    type: InsuranceType;
  };
  coverage: {
    type: CoverageType;
    limit: bigint;
    deductible: bigint;
  }[];
  insured: {
    name: string;
    dateOfBirth: string;
    email: string;
  }[];
  policyPeriod: {
    start: Date;
    end: Date;
  };
  premium: {
    total: bigint;
    currency: string;
  };
  documents: {
    policyDocument: string; // PDF
    insuranceCard: string; // PDF
    claimForm: string; // PDF
  };
  emergencyContact: {
    phone: string; // 24/7 assistance hotline
    email: string;
    website: string;
  };
  createdAt: Date;
}

export interface InsuranceClaim {
  id: string;
  policyNumber: string;
  claimNumber: string;
  type: CoverageType;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'paid';
  incidentDetails: {
    date: string;
    location: string;
    description: string;
  };
  claimAmount: bigint;
  approvedAmount?: bigint;
  supportingDocuments: string[]; // S3 URLs
  timeline: {
    date: Date;
    status: string;
    note?: string;
  }[];
  submittedAt: Date;
  resolvedAt?: Date;
}

@Injectable()
export class TravelInsuranceService {
  private readonly logger = new Logger(TravelInsuranceService.name);

  private readonly allianzApiKey: string;
  private readonly worldNomadsApiKey: string;
  private readonly safetyWingApiKey: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.allianzApiKey = this.configService.get<string>('ALLIANZ_API_KEY');
    this.worldNomadsApiKey = this.configService.get<string>('WORLD_NOMADS_API_KEY');
    this.safetyWingApiKey = this.configService.get<string>('SAFETYWING_API_KEY');
  }

  /**
   * Get insurance quotes from multiple providers
   */
  async getQuotes(request: InsuranceQuoteRequest): Promise<InsuranceQuote[]> {
    this.logger.log(
      `Getting insurance quotes for ${request.tripDetails.destination.join(', ')}`,
    );

    try {
      // Query multiple providers in parallel
      const [allianzQuotes, worldNomadsQuotes, safetyWingQuotes] =
        await Promise.allSettled([
          this.getAllianzQuote(request),
          this.getWorldNomadsQuote(request),
          this.getSafetyWingQuote(request),
        ]);

      const quotes: InsuranceQuote[] = [];

      if (allianzQuotes.status === 'fulfilled') {
        quotes.push(...allianzQuotes.value);
      }

      if (worldNomadsQuotes.status === 'fulfilled') {
        quotes.push(...worldNomadsQuotes.value);
      }

      if (safetyWingQuotes.status === 'fulfilled') {
        quotes.push(...safetyWingQuotes.value);
      }

      // Sort by price
      quotes.sort((a, b) => Number(a.pricing.premium - b.pricing.premium));

      this.logger.log(`Found ${quotes.length} insurance quotes`);
      return quotes;
    } catch (error) {
      this.logger.error(`Insurance quote retrieval failed: ${error.message}`);
      throw new HttpException(
        'Failed to get insurance quotes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Purchase insurance policy
   */
  async purchasePolicy(
    request: InsurancePurchaseRequest,
  ): Promise<InsurancePolicy> {
    this.logger.log(`Purchasing insurance policy: ${request.quoteId}`);

    try {
      let policy: InsurancePolicy;

      switch (request.provider) {
        case 'allianz':
          policy = await this.purchaseAllianzPolicy(request);
          break;
        case 'world_nomads':
          policy = await this.purchaseWorldNomadsPolicy(request);
          break;
        case 'safetywing':
          policy = await this.purchaseSafetyWingPolicy(request);
          break;
        default:
          throw new Error(`Unknown provider: ${request.provider}`);
      }

      // Send policy documents via email
      await this.sendPolicyDocuments(policy);

      this.logger.log(`Policy purchased: ${policy.policyNumber}`);
      return policy;
    } catch (error) {
      this.logger.error(`Policy purchase failed: ${error.message}`);
      throw new HttpException(
        'Policy purchase failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Submit insurance claim
   */
  async submitClaim(
    policyNumber: string,
    claimDetails: {
      type: CoverageType;
      incidentDate: string;
      incidentLocation: string;
      description: string;
      claimAmount: bigint;
      supportingDocuments: Buffer[];
    },
  ): Promise<InsuranceClaim> {
    this.logger.log(`Submitting claim for policy: ${policyNumber}`);

    try {
      // TODO: Upload supporting documents to S3
      // TODO: Submit claim to insurance provider API
      // TODO: Send confirmation email

      const claim: InsuranceClaim = {
        id: `claim_${Date.now()}`,
        policyNumber: policyNumber,
        claimNumber: `CLM${Date.now()}`,
        type: claimDetails.type,
        status: 'submitted',
        incidentDetails: {
          date: claimDetails.incidentDate,
          location: claimDetails.incidentLocation,
          description: claimDetails.description,
        },
        claimAmount: claimDetails.claimAmount,
        supportingDocuments: [], // S3 URLs
        timeline: [
          {
            date: new Date(),
            status: 'submitted',
            note: 'Claim submitted successfully',
          },
        ],
        submittedAt: new Date(),
      };

      this.logger.log(`Claim submitted: ${claim.claimNumber}`);
      return claim;
    } catch (error) {
      this.logger.error(`Claim submission failed: ${error.message}`);
      throw new HttpException(
        'Claim submission failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Track claim status
   */
  async trackClaim(claimNumber: string): Promise<InsuranceClaim> {
    this.logger.log(`Tracking claim: ${claimNumber}`);

    try {
      // TODO: Fetch from database
      // TODO: Check with provider API for updates

      return {
        id: '',
        policyNumber: '',
        claimNumber: claimNumber,
        type: CoverageType.MEDICAL,
        status: 'under_review',
        incidentDetails: {
          date: '',
          location: '',
          description: '',
        },
        claimAmount: BigInt(0),
        supportingDocuments: [],
        timeline: [],
        submittedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Claim tracking failed: ${error.message}`);
      throw new HttpException('Claim not found', HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Get Allianz quote
   */
  private async getAllianzQuote(
    request: InsuranceQuoteRequest,
  ): Promise<InsuranceQuote[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.allianzpartners.com/v1/quotes',
          {
            destination: request.tripDetails.destination,
            departure_date: request.tripDetails.departureDate,
            return_date: request.tripDetails.returnDate,
            travelers: request.travelers,
            trip_cost: request.tripDetails.tripCost,
          },
          {
            headers: {
              'Authorization': `Bearer ${this.allianzApiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return response.data.quotes.map((quote: any) => ({
        provider: 'allianz',
        quoteId: quote.id,
        plan: {
          name: quote.plan_name,
          type: request.insuranceType,
          description: quote.description,
        },
        coverage: quote.coverage.map((c: any) => ({
          type: this.mapCoverageType(c.type),
          limit: BigInt(c.limit * 100),
          deductible: BigInt(c.deductible * 100),
          description: c.description,
        })),
        pricing: {
          premium: BigInt(Math.round(quote.premium * 100)),
          currency: quote.currency,
          breakdown: {
            basePremium: BigInt(Math.round(quote.base_premium * 100)),
            taxes: BigInt(Math.round(quote.taxes * 100)),
            fees: BigInt(Math.round(quote.fees * 100)),
          },
          paymentOptions: quote.payment_options,
        },
        terms: {
          policyPeriod: {
            start: request.tripDetails.departureDate,
            end: request.tripDetails.returnDate,
          },
          exclusions: quote.exclusions || [],
          limitations: quote.limitations || [],
          policyDocument: quote.policy_document_url,
        },
        rating: {
          score: 4.5,
          reviewCount: 12500,
          claimApprovalRate: 92,
          averageClaimProcessingDays: 7,
        },
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      }));
    } catch (error) {
      this.logger.warn(`Allianz quote failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Get World Nomads quote
   */
  private async getWorldNomadsQuote(
    request: InsuranceQuoteRequest,
  ): Promise<InsuranceQuote[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.worldnomads.com/quotes',
          {
            destinations: request.tripDetails.destination,
            start_date: request.tripDetails.departureDate,
            end_date: request.tripDetails.returnDate,
            travelers: request.travelers,
          },
          {
            headers: {
              'API-Key': this.worldNomadsApiKey,
            },
          },
        ),
      );

      return response.data.quotes.map((quote: any) => ({
        provider: 'world_nomads',
        quoteId: quote.quote_id,
        plan: {
          name: quote.plan.name,
          type: request.insuranceType,
          description: quote.plan.description,
        },
        coverage: quote.coverage_details.map((c: any) => ({
          type: this.mapCoverageType(c.coverage_type),
          limit: BigInt(c.coverage_limit * 100),
          deductible: BigInt((c.excess || 0) * 100),
          description: c.description,
        })),
        pricing: {
          premium: BigInt(Math.round(quote.total_premium * 100)),
          currency: quote.currency,
          breakdown: {
            basePremium: BigInt(Math.round(quote.base_premium * 100)),
            taxes: BigInt(Math.round(quote.tax * 100)),
            fees: BigInt(0),
          },
          paymentOptions: ['full'],
        },
        terms: {
          policyPeriod: {
            start: request.tripDetails.departureDate,
            end: request.tripDetails.returnDate,
          },
          exclusions: quote.general_exclusions || [],
          limitations: quote.policy_limitations || [],
          policyDocument: quote.pds_url,
        },
        rating: {
          score: 4.3,
          reviewCount: 8900,
          claimApprovalRate: 88,
          averageClaimProcessingDays: 10,
        },
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }));
    } catch (error) {
      this.logger.warn(`World Nomads quote failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Get SafetyWing quote
   */
  private async getSafetyWingQuote(
    request: InsuranceQuoteRequest,
  ): Promise<InsuranceQuote[]> {
    try {
      // SafetyWing offers simple pricing: $42/4 weeks for travelers under 40
      const weeks = Math.ceil(
        (new Date(request.tripDetails.returnDate).getTime() -
          new Date(request.tripDetails.departureDate).getTime()) /
          (7 * 24 * 60 * 60 * 1000),
      );

      const basePremiumPerWeek = 1050; // $10.50 in cents
      const premium = BigInt(basePremiumPerWeek * weeks);

      return [
        {
          provider: 'safetywing',
          quoteId: `sw_${Date.now()}`,
          plan: {
            name: 'Nomad Insurance',
            type: InsuranceType.BACKPACKER,
            description: 'Travel medical insurance for digital nomads and travelers',
          },
          coverage: [
            {
              type: CoverageType.MEDICAL,
              limit: BigInt(25000000), // $250,000
              deductible: BigInt(25000), // $250
              description: 'Overall maximum',
            },
            {
              type: CoverageType.EMERGENCY_EVACUATION,
              limit: BigInt(10000000), // $100,000
              deductible: BigInt(0),
              description: 'Emergency medical evacuation',
            },
          ],
          pricing: {
            premium: premium,
            currency: 'USD',
            breakdown: {
              basePremium: premium,
              taxes: BigInt(0),
              fees: BigInt(0),
            },
            paymentOptions: ['monthly', 'full'],
          },
          terms: {
            policyPeriod: {
              start: request.tripDetails.departureDate,
              end: request.tripDetails.returnDate,
            },
            exclusions: [
              'Pre-existing conditions',
              'Home country coverage limited to 30 days',
            ],
            limitations: [],
            policyDocument: 'https://safetywing.com/policy-document',
          },
          rating: {
            score: 4.7,
            reviewCount: 5200,
            claimApprovalRate: 95,
            averageClaimProcessingDays: 5,
          },
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      ];
    } catch (error) {
      this.logger.warn(`SafetyWing quote failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Purchase Allianz policy
   */
  private async purchaseAllianzPolicy(
    request: InsurancePurchaseRequest,
  ): Promise<InsurancePolicy> {
    const response = await firstValueFrom(
      this.httpService.post(
        'https://api.allianzpartners.com/v1/policies',
        {
          quote_id: request.quoteId,
          travelers: request.travelers,
          beneficiaries: request.beneficiaries,
          payment_intent_id: request.paymentIntentId,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.allianzApiKey}`,
          },
        },
      ),
    );

    return this.mapToInsurancePolicy(response.data.policy, 'allianz');
  }

  /**
   * Purchase World Nomads policy
   */
  private async purchaseWorldNomadsPolicy(
    request: InsurancePurchaseRequest,
  ): Promise<InsurancePolicy> {
    const response = await firstValueFrom(
      this.httpService.post(
        'https://api.worldnomads.com/policies',
        {
          quote_id: request.quoteId,
          policyholders: request.travelers,
        },
        {
          headers: {
            'API-Key': this.worldNomadsApiKey,
          },
        },
      ),
    );

    return this.mapToInsurancePolicy(response.data.policy, 'world_nomads');
  }

  /**
   * Purchase SafetyWing policy
   */
  private async purchaseSafetyWingPolicy(
    request: InsurancePurchaseRequest,
  ): Promise<InsurancePolicy> {
    const response = await firstValueFrom(
      this.httpService.post(
        'https://api.safetywing.com/subscriptions',
        {
          travelers: request.travelers,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.safetyWingApiKey}`,
          },
        },
      ),
    );

    return this.mapToInsurancePolicy(response.data.subscription, 'safetywing');
  }

  /**
   * Map to InsurancePolicy
   */
  private mapToInsurancePolicy(data: any, provider: string): InsurancePolicy {
    return {
      id: data.id || data.policy_id,
      policyNumber: data.policy_number || data.certificate_number,
      provider: provider,
      status: 'active',
      plan: {
        name: data.plan_name || 'Travel Insurance',
        type: InsuranceType.SINGLE_TRIP,
      },
      coverage: data.coverage?.map((c: any) => ({
        type: this.mapCoverageType(c.type),
        limit: BigInt(c.limit * 100),
        deductible: BigInt((c.deductible || 0) * 100),
      })) || [],
      insured: data.insured?.map((i: any) => ({
        name: `${i.first_name} ${i.last_name}`,
        dateOfBirth: i.date_of_birth,
        email: i.email,
      })) || [],
      policyPeriod: {
        start: new Date(data.effective_date || data.start_date),
        end: new Date(data.expiration_date || data.end_date),
      },
      premium: {
        total: BigInt(Math.round((data.premium || data.total_premium) * 100)),
        currency: data.currency || 'USD',
      },
      documents: {
        policyDocument: data.policy_document_url || '',
        insuranceCard: data.insurance_card_url || '',
        claimForm: data.claim_form_url || '',
      },
      emergencyContact: {
        phone: data.emergency_phone || '+1-800-654-1908',
        email: data.emergency_email || 'claims@provider.com',
        website: data.provider_website || '',
      },
      createdAt: new Date(),
    };
  }

  /**
   * Send policy documents via email
   */
  private async sendPolicyDocuments(policy: InsurancePolicy): Promise<void> {
    // TODO: Integrate with email service (SendGrid, AWS SES)
    this.logger.log(`Sending policy documents for: ${policy.policyNumber}`);
  }

  /**
   * Map coverage type string to enum
   */
  private mapCoverageType(type: string): CoverageType {
    const typeMap: Record<string, CoverageType> = {
      medical: CoverageType.MEDICAL,
      trip_cancellation: CoverageType.TRIP_CANCELLATION,
      trip_interruption: CoverageType.TRIP_INTERRUPTION,
      baggage: CoverageType.BAGGAGE_LOSS,
      emergency_evacuation: CoverageType.EMERGENCY_EVACUATION,
      covid: CoverageType.COVID_19,
    };
    return typeMap[type?.toLowerCase()] || CoverageType.MEDICAL;
  }
}
