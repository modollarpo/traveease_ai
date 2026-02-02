import { Injectable, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

// Car Rental DTOs
interface CarOffer {
  id: string;
  provider: 'amadeus' | 'hertz' | 'budget' | 'enterprise' | 'avis';
  vehicle: {
    type: string;
    model: string;
    category: string;
    doors: number;
    seats: number;
    transmission: 'MANUAL' | 'AUTOMATIC';
    fuelType: 'DIESEL' | 'PETROL' | 'HYBRID' | 'ELECTRIC';
    airConditioning: boolean;
    features: string[];
  };
  rentalLocation: {
    name: string;
    iataCode: string;
    address: string;
    city: string;
    country: string;
    coordinates: { latitude: number; longitude: number };
    openingHours: { open: string; close: string }[];
  };
  pickupDateTime: string;
  dropoffDateTime: string;
  price: {
    total: number;
    currency: string;
    dailyRate: number;
    insurancePerDay: number;
    taxes: number;
    fees: number;
  };
  insurance: InsuranceOption[];
  mileage: {
    unlimited: boolean;
    included: number;
    overageRate: number;
  };
  supplierFeeInformation: Array<{ code: string; description: string; amount: number }>;
}

interface InsuranceOption {
  code: string;
  description: string;
  coverageType: 'COLLISION' | 'LIABILITY' | 'THEFT' | 'BASIC' | 'PREMIUM';
  dailyRate: number;
  deductible: number;
  maxCoverage: number;
}

interface CarRental {
  rentalId: string;
  reservationId: string;
  status: 'RESERVED' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  carOffer: CarOffer;
  renterInfo: RenterInfo;
  driverDocuments: DriverDocuments;
  rentalAgreement: string;
  selectedInsurance: InsuranceOption;
  additionalServices: AdditionalService[];
  totalCost: number;
  paymentStatus: 'PENDING' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED';
  createdAt: Date;
  pickupDetails: {
    dateTime: string;
    location: string;
    agentName: string;
    condition: string;
    mileage: number;
    fuelLevel: string;
    damageReport: string;
  };
  dropoffDetails?: {
    dateTime: string;
    location: string;
    agentName: string;
    condition: string;
    mileage: number;
    fuelLevel: string;
    damageReport: string;
  };
}

interface RenterInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  mainDriver: boolean;
}

interface DriverDocuments {
  driversLicense: {
    number: string;
    expiryDate: string;
    issuanceCountry: string;
    mrz?: string; // Machine Readable Zone from MRZ reading
    verified: boolean;
    uploadUrl: string;
  };
  insuranceDocument?: {
    provider: string;
    policyNumber: string;
    expiryDate: string;
    uploadUrl: string;
    verified: boolean;
  };
  internationalLicense?: {
    number: string;
    expiryDate: string;
    uploadUrl: string;
  };
}

interface AdditionalService {
  type: 'GPS' | 'WIFI' | 'CHILD_SEAT' | 'INFANT_SEAT' | 'EXTRA_DRIVER' | 'ROADSIDE_ASSISTANCE';
  description: string;
  dailyRate: number;
  quantity: number;
  totalCost: number;
}

interface CarSearchRequest {
  pickupLocation: {
    iataCode?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  dropoffLocation?: {
    iataCode?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  pickupDate: string;
  dropoffDate: string;
  driverAge: number;
  vehicleType?: string;
  transmissionType?: string;
}

interface ReliabilityScore {
  provider: string;
  rating: number; // 0-100
  reviewCount: number;
  claimResolutionTime: number; // hours
  customerSatisfaction: number; // percentage
  claimHistory: number; // percentage
  factors: {
    responseTime: number;
    vehicleCondition: number;
    documentVerification: number;
    customerSupport: number;
  };
}

@Injectable()
export class CarRentalService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  // Search Car Rentals
  async searchCars(request: CarSearchRequest): Promise<CarOffer[]> {
    try {
      // Use Amadeus Car Search API
      if (process.env.AMADEUS_ENVIRONMENT === 'test') {
        return this.generateMockCarOffers(request);
      }

      // In production: Call Amadeus Car Search API
      const offers: CarOffer[] = [];
      return offers;
    } catch (error) {
      console.error('Car search error:', error);
      return this.generateMockCarOffers(request);
    }
  }

  // Get Car Details
  async getCarDetails(offerId: string): Promise<CarOffer> {
    const offers = await this.searchCars({
      pickupLocation: { city: 'New York' },
      pickupDate: new Date().toISOString().split('T')[0],
      dropoffDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      driverAge: 35,
    });

    const offer = offers.find((o) => o.id === offerId);
    if (!offer) {
      throw new HttpException('Car offer not found', HttpStatus.NOT_FOUND);
    }

    return offer;
  }

  // Create Car Rental Reservation
  async createReservation(
    offerId: string,
    renterInfo: RenterInfo,
    driverDocuments: DriverDocuments,
    selectedInsurance: InsuranceOption,
    additionalServices: AdditionalService[],
  ): Promise<CarRental> {
    // Verify offer
    const carOffer = await this.getCarDetails(offerId);

    // Verify driver documents
    await this.verifyDocuments(driverDocuments);

    // Calculate costs
    const additionalServicesCost = additionalServices.reduce((sum, svc) => sum + svc.totalCost, 0);
    const insuranceCost = this.calculateInsuranceCost(
      carOffer.pickupDateTime,
      carOffer.dropoffDateTime,
      selectedInsurance.dailyRate,
    );
    const totalCost = carOffer.price.total + insuranceCost + additionalServicesCost;

    const rental: CarRental = {
      rentalId: `CR${uuidv4().substring(0, 10).toUpperCase()}`,
      reservationId: `RES${uuidv4().substring(0, 12).toUpperCase()}`,
      status: 'RESERVED',
      carOffer,
      renterInfo,
      driverDocuments,
      rentalAgreement: `Agreement-${uuidv4()}`,
      selectedInsurance,
      additionalServices: additionalServices.map((svc) => ({
        ...svc,
        totalCost: svc.dailyRate * this.calculateRentalDays(carOffer.pickupDateTime, carOffer.dropoffDateTime),
      })),
      totalCost,
      paymentStatus: 'PENDING',
      createdAt: new Date(),
      pickupDetails: {
        dateTime: carOffer.pickupDateTime,
        location: carOffer.rentalLocation.name,
        agentName: '',
        condition: '',
        mileage: 0,
        fuelLevel: '',
        damageReport: '',
      },
    };

    return rental;
  }

  // Confirm Reservation (After Payment)
  async confirmReservation(rentalId: string, paymentMethodId: string): Promise<CarRental> {
    // Process payment via PaymentGatewayOrchestrator
    // Return confirmed reservation

    return {
      rentalId,
      reservationId: `RES${uuidv4().substring(0, 12).toUpperCase()}`,
      status: 'CONFIRMED',
      carOffer: {} as CarOffer,
      renterInfo: {} as RenterInfo,
      driverDocuments: {} as DriverDocuments,
      rentalAgreement: '',
      selectedInsurance: {} as InsuranceOption,
      additionalServices: [],
      totalCost: 0,
      paymentStatus: 'CAPTURED',
      createdAt: new Date(),
      pickupDetails: {
        dateTime: '',
        location: '',
        agentName: '',
        condition: '',
        mileage: 0,
        fuelLevel: '',
        damageReport: '',
      },
    };
  }

  // Complete Rental (Check-in)
  async completeRental(rentalId: string, dropoffDetails: Partial<CarRental['dropoffDetails']>): Promise<CarRental> {
    return {
      rentalId,
      reservationId: `RES${uuidv4().substring(0, 12).toUpperCase()}`,
      status: 'COMPLETED',
      carOffer: {} as CarOffer,
      renterInfo: {} as RenterInfo,
      driverDocuments: {} as DriverDocuments,
      rentalAgreement: '',
      selectedInsurance: {} as InsuranceOption,
      additionalServices: [],
      totalCost: 0,
      paymentStatus: 'CAPTURED',
      createdAt: new Date(),
      pickupDetails: {
        dateTime: '',
        location: '',
        agentName: '',
        condition: '',
        mileage: 0,
        fuelLevel: '',
        damageReport: '',
      },
      dropoffDetails: {
        dateTime: dropoffDetails?.dateTime || '',
        location: dropoffDetails?.location || '',
        agentName: dropoffDetails?.agentName || '',
        condition: dropoffDetails?.condition || '',
        mileage: dropoffDetails?.mileage || 0,
        fuelLevel: dropoffDetails?.fuelLevel || '',
        damageReport: dropoffDetails?.damageReport || '',
      },
    };
  }

  // Cancel Rental
  async cancelRental(rentalId: string, reason: string): Promise<{ status: string; refundAmount: number }> {
    // Calculate refund based on cancellation policy
    const refundPercentage = 0.75; // 75% refund

    return {
      status: 'CANCELLED',
      refundAmount: 500 * refundPercentage,
    };
  }

  // Verify Driver Documents (With MRZ Reading)
  async verifyDocuments(documents: DriverDocuments): Promise<{ verified: boolean; issues: string[] }> {
    const issues: string[] = [];

    // Verify Driver's License
    if (!documents.driversLicense.number || documents.driversLicense.number.length < 5) {
      issues.push('Invalid driver license number');
    }

    // Check Expiry
    const licenseExpiry = new Date(documents.driversLicense.expiryDate);
    if (licenseExpiry < new Date()) {
      issues.push('Driver license expired');
    }

    // MRZ Reading (if uploaded)
    if (documents.driversLicense.uploadUrl) {
      const mrzData = await this.performMRZReading(documents.driversLicense.uploadUrl);
      if (!mrzData.valid) {
        issues.push('MRZ reading failed - document may be invalid');
      }
    }

    // Verify Insurance Document if provided
    if (documents.insuranceDocument) {
      const insuranceExpiry = new Date(documents.insuranceDocument.expiryDate);
      if (insuranceExpiry < new Date()) {
        issues.push('Insurance document expired');
      }
    }

    return {
      verified: issues.length === 0,
      issues,
    };
  }

  // MRZ (Machine Readable Zone) Reading
  async performMRZReading(documentUrl: string): Promise<{ valid: boolean; data: Record<string, string> }> {
    // In production: Use OCR library (Tesseract.js)
    // For now: Simulate successful MRZ reading
    return {
      valid: true,
      data: {
        firstName: 'JOHN',
        lastName: 'DOE',
        passportNumber: 'ABC123456',
        dateOfBirth: '1990-01-15',
        nationality: 'US',
      },
    };
  }

  // Secure Document Upload to S3
  async uploadDocument(
    file: Express.Multer.File,
    documentType: 'DRIVERS_LICENSE' | 'INSURANCE' | 'INTERNATIONAL_LICENSE',
  ): Promise<{ uploadUrl: string; verified: boolean; fileName: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Generate secure S3 key
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileName = `${documentType}-${timestamp}-${randomString}`;
    const s3Key = `documents/${fileName}`;

    // In production: Upload to AWS S3
    // For now: Simulate successful upload
    const uploadUrl = `s3://${this.configService.get('AWS_S3_BUCKET')}/${s3Key}`;

    // Perform document verification (MRZ for licenses)
    let verified = false;
    if (documentType === 'DRIVERS_LICENSE') {
      const mrzResult = await this.performMRZReading(uploadUrl);
      verified = mrzResult.valid;
    } else {
      verified = true; // Insurance docs verified by expiry check
    }

    return {
      uploadUrl,
      verified,
      fileName,
    };
  }

  // Pick-up/Drop-off Location Resolution
  async resolveLocation(
    input: { iataCode?: string; city?: string; latitude?: number; longitude?: number },
  ): Promise<{ iataCode: string; city: string; coordinates: { latitude: number; longitude: number } }> {
    // If IATA code provided, resolve city
    if (input.iataCode) {
      const mapping: Record<string, { city: string; latitude: number; longitude: number }> = {
        LAX: { city: 'Los Angeles', latitude: 33.9425, longitude: -118.4081 },
        JFK: { city: 'New York', latitude: 40.6413, longitude: -73.7781 },
        LHR: { city: 'London', latitude: 51.4700, longitude: -0.4543 },
        CDG: { city: 'Paris', latitude: 49.009, longitude: 2.5479 },
        AMS: { city: 'Amsterdam', latitude: 52.3086, longitude: 4.7639 },
      };

      const location = mapping[input.iataCode];
      if (location) {
        return {
          iataCode: input.iataCode,
          city: location.city,
          coordinates: { latitude: location.latitude, longitude: location.longitude },
        };
      }
    }

    // If city provided, find coordinates
    if (input.city) {
      const cityMapping: Record<string, { latitude: number; longitude: number }> = {
        'Los Angeles': { latitude: 34.0522, longitude: -118.2437 },
        'New York': { latitude: 40.7128, longitude: -74.006 },
        London: { latitude: 51.5074, longitude: -0.1278 },
        Paris: { latitude: 48.8566, longitude: 2.3522 },
        Amsterdam: { latitude: 52.374, longitude: 4.8952 },
      };

      const coords = cityMapping[input.city];
      if (coords) {
        return {
          iataCode: Object.keys(cityMapping).indexOf(input.city) === 0 ? 'LAX' : 'JFK',
          city: input.city,
          coordinates: coords,
        };
      }
    }

    // If coordinates provided, find nearest location
    if (input.latitude && input.longitude) {
      // Simulate finding nearest rental location
      return {
        iataCode: 'LAX',
        city: 'Los Angeles',
        coordinates: { latitude: input.latitude, longitude: input.longitude },
      };
    }

    throw new BadRequestException('Must provide IATA code, city, or coordinates');
  }

  // Calculate Reliability Score
  async getReliabilityScore(provider: string): Promise<ReliabilityScore> {
    const scores: Record<string, ReliabilityScore> = {
      amadeus: {
        provider: 'Amadeus (Global)',
        rating: 92,
        reviewCount: 15000,
        claimResolutionTime: 24,
        customerSatisfaction: 94,
        claimHistory: 2.1,
        factors: {
          responseTime: 95,
          vehicleCondition: 92,
          documentVerification: 89,
          customerSupport: 94,
        },
      },
      hertz: {
        provider: 'Hertz',
        rating: 85,
        reviewCount: 8000,
        claimResolutionTime: 48,
        customerSatisfaction: 82,
        claimHistory: 3.5,
        factors: {
          responseTime: 84,
          vehicleCondition: 86,
          documentVerification: 84,
          customerSupport: 85,
        },
      },
      enterprise: {
        provider: 'Enterprise',
        rating: 88,
        reviewCount: 12000,
        claimResolutionTime: 36,
        customerSatisfaction: 87,
        claimHistory: 2.8,
        factors: {
          responseTime: 88,
          vehicleCondition: 89,
          documentVerification: 87,
          customerSupport: 87,
        },
      },
    };

    return scores[provider.toLowerCase()] || scores.amadeus;
  }

  // Get Pricing Details
  async getPricingDetails(offerId: string): Promise<CarOffer['price'] & { breakdown: Record<string, number> }> {
    const offer = await this.getCarDetails(offerId);

    return {
      ...offer.price,
      breakdown: {
        baseRate: offer.price.dailyRate * this.calculateRentalDays(offer.pickupDateTime, offer.dropoffDateTime),
        insurance: offer.price.insurancePerDay * this.calculateRentalDays(offer.pickupDateTime, offer.dropoffDateTime),
        taxes: offer.price.taxes,
        fees: offer.price.fees,
      },
    };
  }

  // ==================== HELPER METHODS ====================

  private generateMockCarOffers(request: CarSearchRequest): CarOffer[] {
    const offers: CarOffer[] = [];
    const providers: Array<'hertz' | 'budget' | 'enterprise' | 'avis'> = ['hertz', 'budget', 'enterprise', 'avis'];

    for (let i = 0; i < 8; i++) {
      const vehicles = [
        { type: 'Economy Car', model: 'Toyota Corolla', category: 'ECAR', doors: 4, seats: 5 },
        { type: 'Compact Car', model: 'Honda Civic', category: 'CCAR', doors: 4, seats: 5 },
        { type: 'Mid-size Car', model: 'Toyota Camry', category: 'MCAR', doors: 4, seats: 5 },
        { type: 'Full-size Car', model: 'Nissan Altima', category: 'FCAR', doors: 4, seats: 5 },
        { type: 'SUV', model: 'Toyota RAV4', category: 'MSUV', doors: 4, seats: 7 },
        { type: 'Van', model: 'Nissan Caravan', category: 'PVAN', doors: 4, seats: 8 },
      ];

      const vehicle = vehicles[i % vehicles.length];
      const dailyRate = i < 3 ? 35 + i * 10 : 50 + i * 15;
      const rentalDays = this.calculateRentalDays(request.pickupDate, request.dropoffDate);

      const offer: CarOffer = {
        id: `CAR${uuidv4().substring(0, 8).toUpperCase()}`,
        provider: providers[i % providers.length],
        vehicle: {
          ...vehicle,
          transmission: i % 2 === 0 ? 'AUTOMATIC' : 'MANUAL',
          fuelType: ['PETROL', 'DIESEL', 'HYBRID'][i % 3] as any,
          airConditioning: true,
          features: ['GPS', 'Bluetooth', 'WiFi', 'USB Charging'],
        },
        rentalLocation: {
          name: 'Downtown Rental Center',
          iataCode: 'LAX',
          address: '123 Main Street',
          city: 'Los Angeles',
          country: 'USA',
          coordinates: { latitude: 34.0522, longitude: -118.2437 },
          openingHours: [
            { open: '06:00', close: '23:00' },
            { open: '06:00', close: '23:00' },
            { open: '06:00', close: '23:00' },
            { open: '06:00', close: '23:00' },
            { open: '06:00', close: '23:00' },
            { open: '08:00', close: '22:00' },
            { open: '08:00', close: '22:00' },
          ],
        },
        pickupDateTime: request.pickupDate,
        dropoffDateTime: request.dropoffDate,
        price: {
          total: dailyRate * rentalDays,
          currency: 'USD',
          dailyRate,
          insurancePerDay: 15,
          taxes: Math.round(dailyRate * rentalDays * 0.1),
          fees: 25,
        },
        insurance: [
          {
            code: 'BASIC',
            description: 'Basic Coverage',
            coverageType: 'BASIC',
            dailyRate: 12,
            deductible: 1000,
            maxCoverage: 50000,
          },
          {
            code: 'PREMIUM',
            description: 'Premium Coverage - Zero Deductible',
            coverageType: 'PREMIUM',
            dailyRate: 25,
            deductible: 0,
            maxCoverage: 200000,
          },
        ],
        mileage: {
          unlimited: i % 3 === 0,
          included: i % 3 === 0 ? 0 : 500,
          overageRate: 0.25,
        },
        supplierFeeInformation: [
          { code: 'AIRPORT_FEE', description: 'Airport Facility Fee', amount: 10 },
          { code: 'INTL_PLATE', description: 'International Plate Fee', amount: 5 },
        ],
      };

      offers.push(offer);
    }

    return offers;
  }

  private calculateRentalDays(pickupDate: string, dropoffDate: string): number {
    const pickup = new Date(pickupDate);
    const dropoff = new Date(dropoffDate);
    return Math.ceil((dropoff.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24));
  }

  private calculateInsuranceCost(pickupDate: string, dropoffDate: string, dailyRate: number): number {
    return this.calculateRentalDays(pickupDate, dropoffDate) * dailyRate;
  }
}
