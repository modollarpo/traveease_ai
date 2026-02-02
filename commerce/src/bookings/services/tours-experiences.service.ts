/**
 * Tours & Experiences Service
 * Integrates with GetYourGuide, Viator, and local African tour operators
 * Handles activities, tours, attractions, and experiences
 */

import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export enum TourCategory {
  CULTURAL = 'cultural',
  ADVENTURE = 'adventure',
  FOOD_DRINK = 'food_drink',
  WILDLIFE = 'wildlife',
  HISTORICAL = 'historical',
  WATER_SPORTS = 'water_sports',
  CITY_TOURS = 'city_tours',
  DAY_TRIPS = 'day_trips',
  NIGHTLIFE = 'nightlife',
  SHOPPING = 'shopping',
}

export enum TourDuration {
  LESS_THAN_1H = '<1h',
  ONE_TO_4H = '1-4h',
  FOUR_TO_8H = '4-8h',
  FULL_DAY = 'full_day',
  MULTI_DAY = 'multi_day',
}

export interface TourSearchDTO {
  location: string; // City name or coordinates
  categorySlug?: TourCategory[];
  date?: string; // ISO date
  participants?: number;
  currency?: string;
  maxPrice?: number;
  minRating?: number;
  duration?: TourDuration[];
  language?: string[];
}

export interface TourExperience {
  id: string;
  providerId: string; // 'getyourguide', 'viator', 'local_operator'
  title: string;
  description: string;
  shortDescription: string;
  category: TourCategory;
  duration: {
    value: number;
    unit: 'minutes' | 'hours' | 'days';
  };
  languages: string[];
  images: string[];
  rating: {
    average: number;
    count: number;
  };
  price: {
    adult: bigint; // Minor units
    child?: bigint;
    infant?: bigint;
    currency: string;
    originalPrice?: bigint; // If on sale
  };
  availability: {
    date: string;
    slots: number;
    status: 'available' | 'limited' | 'sold_out';
  }[];
  included: string[];
  excluded: string[];
  meetingPoint: {
    name: string;
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  cancellationPolicy: {
    refundable: boolean;
    cutoffHours: number; // Hours before tour starts
    refundPercentage: number;
  };
  restrictions: {
    minAge?: number;
    maxAge?: number;
    maxParticipants?: number;
    fitnessLevel?: 'low' | 'moderate' | 'high';
    accessibility?: boolean;
  };
  vendorId: string;
}

export interface TourBookingRequest {
  tourId: string;
  providerId: string;
  date: string; // ISO date
  timeSlot?: string; // e.g., '09:00', '14:00'
  participants: {
    adults: number;
    children?: number;
    infants?: number;
  };
  travelerDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nationality?: string;
  }[];
  specialRequirements?: string;
  pickupLocation?: string;
  paymentIntentId?: string;
}

export interface TourBooking {
  id: string;
  confirmationNumber: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  tour: {
    title: string;
    category: TourCategory;
    duration: string;
    date: string;
    timeSlot: string;
  };
  meetingPoint: {
    name: string;
    address: string;
    time: string;
  };
  participants: {
    adults: number;
    children: number;
    infants: number;
    total: number;
  };
  leadTraveler: {
    name: string;
    email: string;
    phone: string;
  };
  price: {
    total: bigint;
    currency: string;
    breakdown: {
      adults: bigint;
      children: bigint;
      infants: bigint;
      fees: bigint;
    };
  };
  voucher?: {
    code: string;
    qrCode: string;
    downloadUrl: string;
  };
  vendorId: string;
  vendorConfirmation?: string;
  createdAt: Date;
  confirmedAt?: Date;
}

@Injectable()
export class ToursExperiencesService {
  private readonly logger = new Logger(ToursExperiencesService.name);

  private readonly getYourGuideApiKey: string;
  private readonly viatorApiKey: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.getYourGuideApiKey = this.configService.get<string>('GETYOURGUIDE_API_KEY');
    this.viatorApiKey = this.configService.get<string>('VIATOR_API_KEY');
  }

  /**
   * Search for tours and experiences
   */
  async searchTours(dto: TourSearchDTO): Promise<TourExperience[]> {
    this.logger.log(`Searching tours in ${dto.location}`);

    try {
      // Search across multiple providers in parallel
      const [getYourGuideResults, viatorResults, localResults] = await Promise.allSettled([
        this.searchGetYourGuide(dto),
        this.searchViator(dto),
        this.searchLocalOperators(dto),
      ]);

      const tours: TourExperience[] = [];

      if (getYourGuideResults.status === 'fulfilled') {
        tours.push(...getYourGuideResults.value);
      }

      if (viatorResults.status === 'fulfilled') {
        tours.push(...viatorResults.value);
      }

      if (localResults.status === 'fulfilled') {
        tours.push(...localResults.value);
      }

      // Sort by rating and price
      tours.sort((a, b) => {
        if (a.rating.average !== b.rating.average) {
          return b.rating.average - a.rating.average;
        }
        return Number(a.price.adult - b.price.adult);
      });

      this.logger.log(`Found ${tours.length} tour experiences`);
      return tours;
    } catch (error) {
      this.logger.error(`Tour search failed: ${error.message}`);
      throw new HttpException(
        'Tour search failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get detailed tour information
   */
  async getTourDetails(tourId: string, providerId: string): Promise<TourExperience> {
    this.logger.log(`Retrieving tour details: ${tourId} from ${providerId}`);

    try {
      switch (providerId) {
        case 'getyourguide':
          return await this.getGetYourGuideTour(tourId);
        case 'viator':
          return await this.getViatorTour(tourId);
        case 'local_operator':
          return await this.getLocalTour(tourId);
        default:
          throw new Error(`Unknown provider: ${providerId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to retrieve tour: ${error.message}`);
      throw new HttpException('Tour not found', HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Create tour booking
   */
  async createBooking(dto: TourBookingRequest): Promise<TourBooking> {
    this.logger.log(`Creating tour booking: ${dto.tourId}`);

    try {
      // First, get tour details to validate pricing
      const tour = await this.getTourDetails(dto.tourId, dto.providerId);

      // Calculate total price
      const totalPrice =
        BigInt(dto.participants.adults) * tour.price.adult +
        BigInt(dto.participants.children || 0) * (tour.price.child || BigInt(0)) +
        BigInt(dto.participants.infants || 0) * (tour.price.infant || BigInt(0));

      // Create booking based on provider
      let booking: TourBooking;

      switch (dto.providerId) {
        case 'getyourguide':
          booking = await this.bookGetYourGuide(dto, tour, totalPrice);
          break;
        case 'viator':
          booking = await this.bookViator(dto, tour, totalPrice);
          break;
        case 'local_operator':
          booking = await this.bookLocalOperator(dto, tour, totalPrice);
          break;
        default:
          throw new Error(`Unknown provider: ${dto.providerId}`);
      }

      this.logger.log(`Tour booking created: ${booking.confirmationNumber}`);
      return booking;
    } catch (error) {
      this.logger.error(`Tour booking failed: ${error.message}`);
      throw new HttpException(
        'Tour booking failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Cancel tour booking
   */
  async cancelBooking(bookingId: string, confirmationNumber: string): Promise<TourBooking> {
    this.logger.log(`Cancelling tour booking: ${confirmationNumber}`);

    try {
      // TODO: Implement provider-specific cancellation
      // Check cancellation policy and calculate refund

      this.logger.log(`Tour booking cancelled: ${confirmationNumber}`);
      return {} as TourBooking; // TODO: Return updated booking
    } catch (error) {
      this.logger.error(`Tour cancellation failed: ${error.message}`);
      throw new HttpException(
        'Tour cancellation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Search GetYourGuide
   */
  private async searchGetYourGuide(dto: TourSearchDTO): Promise<TourExperience[]> {
    try {
      const params = new URLSearchParams({
        location: dto.location,
        currency: dto.currency || 'USD',
        limit: '20',
      });

      if (dto.categorySlug?.length) {
        params.append('categories', dto.categorySlug.join(','));
      }

      if (dto.date) {
        params.append('date', dto.date);
      }

      const response = await firstValueFrom(
        this.httpService.get(
          `https://api.getyourguide.com/1/activities?${params}`,
          {
            headers: {
              'X-API-KEY': this.getYourGuideApiKey,
            },
          },
        ),
      );

      return response.data.activities.map((activity: any) =>
        this.mapGetYourGuideToTourExperience(activity),
      );
    } catch (error) {
      this.logger.warn(`GetYourGuide search failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Search Viator
   */
  private async searchViator(dto: TourSearchDTO): Promise<TourExperience[]> {
    try {
      const searchData = {
        location: dto.location,
        currency: dto.currency || 'USD',
        count: 20,
        categories: dto.categorySlug,
        startDate: dto.date,
      };

      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.viator.com/partner/products/search',
          searchData,
          {
            headers: {
              'exp-api-key': this.viatorApiKey,
              'Accept-Language': 'en-US',
            },
          },
        ),
      );

      return response.data.products.map((product: any) =>
        this.mapViatorToTourExperience(product),
      );
    } catch (error) {
      this.logger.warn(`Viator search failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Search local operators (Africa-focused)
   */
  private async searchLocalOperators(dto: TourSearchDTO): Promise<TourExperience[]> {
    // TODO: Integrate with local African tour operators
    // Examples: SafariBookings, Africa Travel Resource, local DMCs
    this.logger.debug('Local operator search not yet implemented');
    return [];
  }

  /**
   * Get GetYourGuide tour details
   */
  private async getGetYourGuideTour(tourId: string): Promise<TourExperience> {
    const response = await firstValueFrom(
      this.httpService.get(
        `https://api.getyourguide.com/1/activities/${tourId}`,
        {
          headers: {
            'X-API-KEY': this.getYourGuideApiKey,
          },
        },
      ),
    );

    return this.mapGetYourGuideToTourExperience(response.data);
  }

  /**
   * Get Viator tour details
   */
  private async getViatorTour(tourId: string): Promise<TourExperience> {
    const response = await firstValueFrom(
      this.httpService.get(
        `https://api.viator.com/partner/products/${tourId}`,
        {
          headers: {
            'exp-api-key': this.viatorApiKey,
          },
        },
      ),
    );

    return this.mapViatorToTourExperience(response.data);
  }

  /**
   * Get local operator tour details
   */
  private async getLocalTour(tourId: string): Promise<TourExperience> {
    // TODO: Implement local operator integration
    throw new Error('Local operator not yet implemented');
  }

  /**
   * Book GetYourGuide tour
   */
  private async bookGetYourGuide(
    dto: TourBookingRequest,
    tour: TourExperience,
    totalPrice: bigint,
  ): Promise<TourBooking> {
    const bookingData = {
      activity_id: dto.tourId,
      date: dto.date,
      time_slot: dto.timeSlot,
      participants: {
        adults: dto.participants.adults,
        children: dto.participants.children || 0,
      },
      traveler: dto.travelerDetails[0],
    };

    const response = await firstValueFrom(
      this.httpService.post(
        'https://api.getyourguide.com/1/bookings',
        bookingData,
        {
          headers: {
            'X-API-KEY': this.getYourGuideApiKey,
          },
        },
      ),
    );

    return this.mapToTourBooking(response.data, tour, dto, totalPrice);
  }

  /**
   * Book Viator tour
   */
  private async bookViator(
    dto: TourBookingRequest,
    tour: TourExperience,
    totalPrice: bigint,
  ): Promise<TourBooking> {
    const bookingData = {
      productCode: dto.tourId,
      travelDate: dto.date,
      travelers: dto.travelerDetails.map((t) => ({
        firstName: t.firstName,
        lastName: t.lastName,
        email: t.email,
        phone: t.phone,
      })),
    };

    const response = await firstValueFrom(
      this.httpService.post(
        'https://api.viator.com/partner/bookings/book',
        bookingData,
        {
          headers: {
            'exp-api-key': this.viatorApiKey,
          },
        },
      ),
    );

    return this.mapToTourBooking(response.data, tour, dto, totalPrice);
  }

  /**
   * Book local operator tour
   */
  private async bookLocalOperator(
    dto: TourBookingRequest,
    tour: TourExperience,
    totalPrice: bigint,
  ): Promise<TourBooking> {
    // TODO: Implement local operator booking
    throw new Error('Local operator booking not yet implemented');
  }

  /**
   * Map GetYourGuide activity to TourExperience
   */
  private mapGetYourGuideToTourExperience(activity: any): TourExperience {
    return {
      id: activity.activity_id.toString(),
      providerId: 'getyourguide',
      title: activity.title,
      description: activity.description,
      shortDescription: activity.short_description,
      category: this.mapCategoryToEnum(activity.category),
      duration: {
        value: activity.duration,
        unit: 'minutes',
      },
      languages: activity.languages || ['en'],
      images: activity.pictures?.map((p: any) => p.url) || [],
      rating: {
        average: activity.rating || 0,
        count: activity.number_of_ratings || 0,
      },
      price: {
        adult: BigInt(Math.round(activity.retail_price * 100)),
        currency: activity.currency,
      },
      availability: [],
      included: activity.included || [],
      excluded: activity.excluded || [],
      meetingPoint: {
        name: activity.meeting_point?.name || '',
        address: activity.meeting_point?.address || '',
        coordinates: {
          latitude: activity.meeting_point?.latitude || 0,
          longitude: activity.meeting_point?.longitude || 0,
        },
      },
      cancellationPolicy: {
        refundable: activity.cancellation_policy?.refundable || false,
        cutoffHours: activity.cancellation_policy?.hours_before || 24,
        refundPercentage: activity.cancellation_policy?.refund_percentage || 0,
      },
      restrictions: {},
      vendorId: `tour_getyourguide`,
    };
  }

  /**
   * Map Viator product to TourExperience
   */
  private mapViatorToTourExperience(product: any): TourExperience {
    return {
      id: product.productCode,
      providerId: 'viator',
      title: product.title,
      description: product.description,
      shortDescription: product.shortDescription,
      category: this.mapCategoryToEnum(product.category),
      duration: {
        value: product.duration || 0,
        unit: 'hours',
      },
      languages: product.availableLanguages || ['en'],
      images: product.images?.map((i: any) => i.variants[0].url) || [],
      rating: {
        average: product.rating || 0,
        count: product.reviewCount || 0,
      },
      price: {
        adult: BigInt(Math.round(product.pricing.price * 100)),
        currency: product.pricing.currency,
      },
      availability: [],
      included: product.inclusions || [],
      excluded: product.exclusions || [],
      meetingPoint: {
        name: product.location?.name || '',
        address: product.location?.address || '',
        coordinates: {
          latitude: product.location?.latitude || 0,
          longitude: product.location?.longitude || 0,
        },
      },
      cancellationPolicy: {
        refundable: product.cancellationPolicy?.type !== 'NON_REFUNDABLE',
        cutoffHours: 24,
        refundPercentage: 100,
      },
      restrictions: {},
      vendorId: `tour_viator`,
    };
  }

  /**
   * Map to internal TourBooking format
   */
  private mapToTourBooking(
    providerBooking: any,
    tour: TourExperience,
    dto: TourBookingRequest,
    totalPrice: bigint,
  ): TourBooking {
    const leadTraveler = dto.travelerDetails[0];

    return {
      id: providerBooking.booking_id || providerBooking.bookingRef,
      confirmationNumber: providerBooking.confirmation_code || providerBooking.bookingRef,
      status: 'confirmed',
      tour: {
        title: tour.title,
        category: tour.category,
        duration: `${tour.duration.value} ${tour.duration.unit}`,
        date: dto.date,
        timeSlot: dto.timeSlot || '09:00',
      },
      meetingPoint: {
        name: tour.meetingPoint.name,
        address: tour.meetingPoint.address,
        time: dto.timeSlot || '09:00',
      },
      participants: {
        adults: dto.participants.adults,
        children: dto.participants.children || 0,
        infants: dto.participants.infants || 0,
        total:
          dto.participants.adults +
          (dto.participants.children || 0) +
          (dto.participants.infants || 0),
      },
      leadTraveler: {
        name: `${leadTraveler.firstName} ${leadTraveler.lastName}`,
        email: leadTraveler.email,
        phone: leadTraveler.phone,
      },
      price: {
        total: totalPrice,
        currency: tour.price.currency,
        breakdown: {
          adults: BigInt(dto.participants.adults) * tour.price.adult,
          children: BigInt(dto.participants.children || 0) * (tour.price.child || BigInt(0)),
          infants: BigInt(dto.participants.infants || 0) * (tour.price.infant || BigInt(0)),
          fees: BigInt(0),
        },
      },
      voucher: providerBooking.voucher
        ? {
            code: providerBooking.voucher.code,
            qrCode: providerBooking.voucher.qr_code,
            downloadUrl: providerBooking.voucher.download_url,
          }
        : undefined,
      vendorId: tour.vendorId,
      vendorConfirmation: providerBooking.confirmation_code,
      createdAt: new Date(),
      confirmedAt: new Date(),
    };
  }

  /**
   * Map category string to enum
   */
  private mapCategoryToEnum(category: string): TourCategory {
    const categoryMap: Record<string, TourCategory> = {
      cultural: TourCategory.CULTURAL,
      adventure: TourCategory.ADVENTURE,
      food: TourCategory.FOOD_DRINK,
      wildlife: TourCategory.WILDLIFE,
      historical: TourCategory.HISTORICAL,
      water: TourCategory.WATER_SPORTS,
      city: TourCategory.CITY_TOURS,
      'day-trip': TourCategory.DAY_TRIPS,
      nightlife: TourCategory.NIGHTLIFE,
      shopping: TourCategory.SHOPPING,
    };

    return categoryMap[category.toLowerCase()] || TourCategory.CULTURAL;
  }
}
