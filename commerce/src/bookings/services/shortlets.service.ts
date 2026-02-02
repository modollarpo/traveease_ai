/**
 * Shortlets & Vacation Rentals Service
 * Integrates with Airbnb, Booking.com, Vrbo for short-term accommodation
 * Supports apartments, villas, homes, and unique stays
 */

import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export enum PropertyType {
  APARTMENT = 'apartment',
  HOUSE = 'house',
  VILLA = 'villa',
  CONDO = 'condo',
  STUDIO = 'studio',
  LOFT = 'loft',
  COTTAGE = 'cottage',
  BUNGALOW = 'bungalow',
  UNIQUE = 'unique', // Treehouses, boats, etc.
}

export enum ShortletAmenity {
  WIFI = 'wifi',
  KITCHEN = 'kitchen',
  WASHING_MACHINE = 'washing_machine',
  AIR_CONDITIONING = 'air_conditioning',
  PARKING = 'parking',
  POOL = 'pool',
  GYM = 'gym',
  WORKSPACE = 'workspace',
  TV = 'tv',
  BALCONY = 'balcony',
  GARDEN = 'garden',
  ELEVATOR = 'elevator',
  WHEELCHAIR_ACCESSIBLE = 'wheelchair_accessible',
  PET_FRIENDLY = 'pet_friendly',
  FAMILY_FRIENDLY = 'family_friendly',
}

export interface ShortletSearchDTO {
  location: string; // City or coordinates
  checkIn: string; // ISO date
  checkOut: string; // ISO date
  guests: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: PropertyType[];
  amenities?: ShortletAmenity[];
  priceRange?: {
    min: number;
    max: number;
  };
  currency?: string;
  instantBook?: boolean;
  superhost?: boolean; // Airbnb superhost
  minRating?: number;
}

export interface ShortletProperty {
  id: string;
  provider: 'airbnb' | 'booking' | 'vrbo' | 'local';
  title: string;
  description: string;
  propertyType: PropertyType;
  address: {
    street?: string; // Hidden until booking
    neighborhood: string;
    city: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
      precision: 'exact' | 'approximate'; // Exact after booking
    };
  };
  capacity: {
    guests: number;
    bedrooms: number;
    beds: number;
    bathrooms: number;
  };
  amenities: ShortletAmenity[];
  images: string[];
  host: {
    id: string;
    name: string;
    isSuperhost?: boolean;
    verified: boolean;
    responseRate: number; // Percentage
    responseTime: string; // e.g., "within an hour"
    joinedDate: string;
  };
  pricing: {
    basePrice: bigint; // Per night in minor units
    cleaningFee: bigint;
    serviceFee: bigint;
    total: bigint;
    currency: string;
    weeklyDiscount?: number; // Percentage
    monthlyDiscount?: number;
  };
  availability: {
    instantBook: boolean;
    minNights: number;
    maxNights: number;
    checkInTime: string;
    checkOutTime: string;
  };
  policies: {
    cancellation: {
      type: 'flexible' | 'moderate' | 'strict' | 'super_strict';
      description: string;
      refundDeadline?: string;
      refundPercentage?: number;
    };
    houseRules: string[];
  };
  rating: {
    overall: number;
    cleanliness: number;
    communication: number;
    checkIn: number;
    accuracy: number;
    location: number;
    value: number;
    reviewCount: number;
  };
  vendorId: string;
}

export interface ShortletBookingRequest {
  propertyId: string;
  provider: 'airbnb' | 'booking' | 'vrbo' | 'local';
  checkIn: string;
  checkOut: string;
  guests: {
    adults: number;
    children: number;
    infants: number;
    pets?: number;
  };
  primaryGuest: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
  };
  purpose?: 'leisure' | 'business';
  specialRequests?: string;
  arrivalTime?: string;
  paymentIntentId?: string;
}

export interface ShortletBooking {
  id: string;
  confirmationCode: string;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  property: {
    title: string;
    propertyType: PropertyType;
    address: string; // Full address revealed
    checkInInstructions?: string;
    accessCode?: string;
    wifiPassword?: string;
  };
  reservation: {
    checkIn: string;
    checkOut: string;
    nights: number;
    guests: number;
  };
  host: {
    name: string;
    phone: string;
    email: string;
  };
  pricing: {
    total: bigint;
    currency: string;
    breakdown: {
      accommodation: bigint;
      cleaningFee: bigint;
      serviceFee: bigint;
      taxes: bigint;
    };
  };
  primaryGuest: {
    name: string;
    email: string;
    phone: string;
  };
  vendorId: string;
  vendorConfirmation?: string;
  createdAt: Date;
  confirmedAt?: Date;
}

@Injectable()
export class ShortletsService {
  private readonly logger = new Logger(ShortletsService.name);

  private readonly airbnbApiKey: string;
  private readonly bookingApiKey: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.airbnbApiKey = this.configService.get<string>('AIRBNB_API_KEY');
    this.bookingApiKey = this.configService.get<string>('BOOKING_API_KEY');
  }

  /**
   * Search for shortlet properties
   */
  async searchProperties(dto: ShortletSearchDTO): Promise<ShortletProperty[]> {
    this.logger.log(
      `Searching shortlets in ${dto.location} | ${dto.checkIn} to ${dto.checkOut}`,
    );

    try {
      // Search across providers in parallel
      const [airbnbResults, bookingResults] = await Promise.allSettled([
        this.searchAirbnb(dto),
        this.searchBookingCom(dto),
      ]);

      const properties: ShortletProperty[] = [];

      if (airbnbResults.status === 'fulfilled') {
        properties.push(...airbnbResults.value);
      }

      if (bookingResults.status === 'fulfilled') {
        properties.push(...bookingResults.value);
      }

      // Sort by rating and price
      properties.sort((a, b) => {
        if (a.rating.overall !== b.rating.overall) {
          return b.rating.overall - a.rating.overall;
        }
        return Number(a.pricing.total - b.pricing.total);
      });

      this.logger.log(`Found ${properties.length} shortlet properties`);
      return properties;
    } catch (error) {
      this.logger.error(`Shortlet search failed: ${error.message}`);
      throw new HttpException(
        'Property search failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get property details
   */
  async getPropertyDetails(
    propertyId: string,
    provider: string,
  ): Promise<ShortletProperty> {
    this.logger.log(`Retrieving property: ${propertyId} from ${provider}`);

    try {
      switch (provider) {
        case 'airbnb':
          return await this.getAirbnbProperty(propertyId);
        case 'booking':
          return await this.getBookingProperty(propertyId);
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }
    } catch (error) {
      this.logger.error(`Property retrieval failed: ${error.message}`);
      throw new HttpException('Property not found', HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Create shortlet booking
   */
  async createBooking(dto: ShortletBookingRequest): Promise<ShortletBooking> {
    this.logger.log(`Creating shortlet booking: ${dto.propertyId}`);

    try {
      // Validate property availability
      const property = await this.getPropertyDetails(dto.propertyId, dto.provider);

      // Calculate total nights and price
      const nights = this.calculateNights(dto.checkIn, dto.checkOut);
      const totalPrice =
        property.pricing.basePrice * BigInt(nights) +
        property.pricing.cleaningFee +
        property.pricing.serviceFee;

      let booking: ShortletBooking;

      switch (dto.provider) {
        case 'airbnb':
          booking = await this.bookAirbnb(dto, property, nights, totalPrice);
          break;
        case 'booking':
          booking = await this.bookBookingCom(dto, property, nights, totalPrice);
          break;
        default:
          throw new Error(`Unknown provider: ${dto.provider}`);
      }

      this.logger.log(`Shortlet booking created: ${booking.confirmationCode}`);
      return booking;
    } catch (error) {
      this.logger.error(`Shortlet booking failed: ${error.message}`);
      throw new HttpException(
        'Booking failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Cancel shortlet booking
   */
  async cancelBooking(
    bookingId: string,
    confirmationCode: string,
  ): Promise<{ refundAmount: bigint; refundPercentage: number }> {
    this.logger.log(`Cancelling shortlet booking: ${confirmationCode}`);

    try {
      // TODO: Check cancellation policy and calculate refund
      // TODO: Call provider cancellation API

      return {
        refundAmount: BigInt(0),
        refundPercentage: 0,
      };
    } catch (error) {
      this.logger.error(`Cancellation failed: ${error.message}`);
      throw new HttpException(
        'Cancellation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Search Airbnb
   */
  private async searchAirbnb(dto: ShortletSearchDTO): Promise<ShortletProperty[]> {
    try {
      const params = {
        location: dto.location,
        checkin: dto.checkIn,
        checkout: dto.checkOut,
        adults: dto.guests,
        currency: dto.currency || 'USD',
      };

      const response = await firstValueFrom(
        this.httpService.post('https://api.airbnb.com/v2/search_results', params, {
          headers: {
            'X-Airbnb-API-Key': this.airbnbApiKey,
          },
        }),
      );

      return response.data.search_results.map((listing: any) =>
        this.mapAirbnbToProperty(listing, dto.checkIn, dto.checkOut),
      );
    } catch (error) {
      this.logger.warn(`Airbnb search failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Search Booking.com
   */
  private async searchBookingCom(dto: ShortletSearchDTO): Promise<ShortletProperty[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get('https://distribution-xml.booking.com/2.7/json/hotelAvailability', {
          params: {
            location: dto.location,
            checkin: dto.checkIn,
            checkout: dto.checkOut,
            guests: dto.guests,
            room_type: 'apartment',
          },
          headers: {
            Authorization: `Basic ${Buffer.from(this.bookingApiKey).toString('base64')}`,
          },
        }),
      );

      return response.data.hotels?.map((hotel: any) =>
        this.mapBookingToProperty(hotel, dto.checkIn, dto.checkOut),
      ) || [];
    } catch (error) {
      this.logger.warn(`Booking.com search failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Get Airbnb property
   */
  private async getAirbnbProperty(propertyId: string): Promise<ShortletProperty> {
    const response = await firstValueFrom(
      this.httpService.get(`https://api.airbnb.com/v2/listings/${propertyId}`, {
        headers: {
          'X-Airbnb-API-Key': this.airbnbApiKey,
        },
      }),
    );

    return this.mapAirbnbToProperty(response.data.listing, '', '');
  }

  /**
   * Get Booking.com property
   */
  private async getBookingProperty(propertyId: string): Promise<ShortletProperty> {
    const response = await firstValueFrom(
      this.httpService.get(
        `https://distribution-xml.booking.com/2.7/json/hotels/${propertyId}`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(this.bookingApiKey).toString('base64')}`,
          },
        },
      ),
    );

    return this.mapBookingToProperty(response.data.hotel, '', '');
  }

  /**
   * Book via Airbnb
   */
  private async bookAirbnb(
    dto: ShortletBookingRequest,
    property: ShortletProperty,
    nights: number,
    totalPrice: bigint,
  ): Promise<ShortletBooking> {
    const bookingData = {
      listing_id: dto.propertyId,
      checkin: dto.checkIn,
      checkout: dto.checkOut,
      number_of_adults: dto.guests.adults,
      number_of_children: dto.guests.children,
      guest: {
        first_name: dto.primaryGuest.firstName,
        last_name: dto.primaryGuest.lastName,
        email: dto.primaryGuest.email,
        phone: dto.primaryGuest.phone,
      },
    };

    const response = await firstValueFrom(
      this.httpService.post('https://api.airbnb.com/v2/reservations', bookingData, {
        headers: {
          'X-Airbnb-API-Key': this.airbnbApiKey,
        },
      }),
    );

    return this.mapToShortletBooking(response.data.reservation, property, dto, nights, totalPrice);
  }

  /**
   * Book via Booking.com
   */
  private async bookBookingCom(
    dto: ShortletBookingRequest,
    property: ShortletProperty,
    nights: number,
    totalPrice: bigint,
  ): Promise<ShortletBooking> {
    const bookingData = {
      hotel_id: dto.propertyId,
      arrival_date: dto.checkIn,
      departure_date: dto.checkOut,
      guest: {
        first_name: dto.primaryGuest.firstName,
        last_name: dto.primaryGuest.lastName,
        email: dto.primaryGuest.email,
      },
    };

    const response = await firstValueFrom(
      this.httpService.post(
        'https://distribution-xml.booking.com/2.7/json/reservations',
        bookingData,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(this.bookingApiKey).toString('base64')}`,
          },
        },
      ),
    );

    return this.mapToShortletBooking(response.data.reservation, property, dto, nights, totalPrice);
  }

  /**
   * Map Airbnb listing to ShortletProperty
   */
  private mapAirbnbToProperty(
    listing: any,
    checkIn: string,
    checkOut: string,
  ): ShortletProperty {
    const nights = this.calculateNights(checkIn, checkOut);
    const basePrice = BigInt(Math.round(listing.price.rate * 100));
    const cleaningFee = BigInt(Math.round((listing.price.cleaning_fee || 0) * 100));
    const serviceFee = BigInt(Math.round((listing.price.service_fee || 0) * 100));

    return {
      id: listing.id.toString(),
      provider: 'airbnb',
      title: listing.name,
      description: listing.description,
      propertyType: this.mapPropertyType(listing.property_type),
      address: {
        neighborhood: listing.neighborhood || listing.city,
        city: listing.city,
        country: listing.country_code,
        coordinates: {
          latitude: listing.lat,
          longitude: listing.lng,
          precision: 'approximate',
        },
      },
      capacity: {
        guests: listing.person_capacity,
        bedrooms: listing.bedrooms,
        beds: listing.beds,
        bathrooms: listing.bathrooms,
      },
      amenities: this.mapAmenities(listing.amenities),
      images: listing.photos?.map((p: any) => p.large_url) || [],
      host: {
        id: listing.user.id.toString(),
        name: listing.user.first_name,
        isSuperhost: listing.user.is_superhost,
        verified: listing.user.identity_verified,
        responseRate: listing.user.response_rate || 0,
        responseTime: listing.user.response_time || 'unknown',
        joinedDate: listing.user.created_at,
      },
      pricing: {
        basePrice: basePrice,
        cleaningFee: cleaningFee,
        serviceFee: serviceFee,
        total: basePrice * BigInt(nights || 1) + cleaningFee + serviceFee,
        currency: listing.price.currency,
        weeklyDiscount: listing.price_interface?.weekly_price_factor,
        monthlyDiscount: listing.price_interface?.monthly_price_factor,
      },
      availability: {
        instantBook: listing.instant_bookable,
        minNights: listing.min_nights,
        maxNights: listing.max_nights,
        checkInTime: listing.check_in_time || '15:00',
        checkOutTime: listing.check_out_time || '11:00',
      },
      policies: {
        cancellation: {
          type: listing.cancellation_policy,
          description: listing.cancellation_policy_description,
        },
        houseRules: listing.house_rules || [],
      },
      rating: {
        overall: listing.star_rating || 0,
        cleanliness: listing.review_scores_cleanliness / 10 || 0,
        communication: listing.review_scores_communication / 10 || 0,
        checkIn: listing.review_scores_checkin / 10 || 0,
        accuracy: listing.review_scores_accuracy / 10 || 0,
        location: listing.review_scores_location / 10 || 0,
        value: listing.review_scores_value / 10 || 0,
        reviewCount: listing.reviews_count || 0,
      },
      vendorId: `shortlet_airbnb_${listing.user.id}`,
    };
  }

  /**
   * Map Booking.com hotel to ShortletProperty
   */
  private mapBookingToProperty(
    hotel: any,
    checkIn: string,
    checkOut: string,
  ): ShortletProperty {
    const nights = this.calculateNights(checkIn, checkOut);
    const basePrice = BigInt(Math.round(hotel.min_price * 100));

    return {
      id: hotel.hotel_id.toString(),
      provider: 'booking',
      title: hotel.hotel_name,
      description: hotel.hotel_description,
      propertyType: PropertyType.APARTMENT,
      address: {
        street: hotel.address,
        neighborhood: hotel.district,
        city: hotel.city,
        country: hotel.country,
        coordinates: {
          latitude: hotel.latitude,
          longitude: hotel.longitude,
          precision: 'exact',
        },
      },
      capacity: {
        guests: hotel.max_persons_in_room,
        bedrooms: 1,
        beds: 1,
        bathrooms: 1,
      },
      amenities: this.mapAmenities(hotel.facilities),
      images: hotel.photos || [],
      host: {
        id: hotel.hotel_id.toString(),
        name: hotel.hotel_name,
        verified: true,
        responseRate: 95,
        responseTime: 'within 24 hours',
        joinedDate: '2020-01-01',
      },
      pricing: {
        basePrice: basePrice,
        cleaningFee: BigInt(0),
        serviceFee: BigInt(0),
        total: basePrice * BigInt(nights || 1),
        currency: hotel.currency,
      },
      availability: {
        instantBook: true,
        minNights: 1,
        maxNights: 30,
        checkInTime: '15:00',
        checkOutTime: '11:00',
      },
      policies: {
        cancellation: {
          type: 'moderate',
          description: hotel.cancellation_policy,
        },
        houseRules: [],
      },
      rating: {
        overall: hotel.review_score / 2 || 0,
        cleanliness: hotel.review_score / 2 || 0,
        communication: hotel.review_score / 2 || 0,
        checkIn: hotel.review_score / 2 || 0,
        accuracy: hotel.review_score / 2 || 0,
        location: hotel.review_score / 2 || 0,
        value: hotel.review_score / 2 || 0,
        reviewCount: hotel.review_count || 0,
      },
      vendorId: `shortlet_booking_${hotel.hotel_id}`,
    };
  }

  /**
   * Map to ShortletBooking
   */
  private mapToShortletBooking(
    reservation: any,
    property: ShortletProperty,
    dto: ShortletBookingRequest,
    nights: number,
    totalPrice: bigint,
  ): ShortletBooking {
    return {
      id: reservation.id || reservation.reservation_id,
      confirmationCode: reservation.confirmation_code || reservation.id,
      status: 'confirmed',
      property: {
        title: property.title,
        propertyType: property.propertyType,
        address: `${property.address.street || ''} ${property.address.city}`,
        checkInInstructions: reservation.special_checkout_instructions,
        accessCode: reservation.door_code,
        wifiPassword: reservation.wifi_password,
      },
      reservation: {
        checkIn: dto.checkIn,
        checkOut: dto.checkOut,
        nights: nights,
        guests: dto.guests.adults + dto.guests.children,
      },
      host: {
        name: property.host.name,
        phone: reservation.host_phone || '',
        email: reservation.host_email || '',
      },
      pricing: {
        total: totalPrice,
        currency: property.pricing.currency,
        breakdown: {
          accommodation: property.pricing.basePrice * BigInt(nights),
          cleaningFee: property.pricing.cleaningFee,
          serviceFee: property.pricing.serviceFee,
          taxes: BigInt(0),
        },
      },
      primaryGuest: {
        name: `${dto.primaryGuest.firstName} ${dto.primaryGuest.lastName}`,
        email: dto.primaryGuest.email,
        phone: dto.primaryGuest.phone,
      },
      vendorId: property.vendorId,
      vendorConfirmation: reservation.confirmation_code,
      createdAt: new Date(),
      confirmedAt: new Date(),
    };
  }

  /**
   * Map property type string to enum
   */
  private mapPropertyType(type: string): PropertyType {
    const typeMap: Record<string, PropertyType> = {
      apartment: PropertyType.APARTMENT,
      house: PropertyType.HOUSE,
      villa: PropertyType.VILLA,
      condo: PropertyType.CONDO,
      studio: PropertyType.STUDIO,
      loft: PropertyType.LOFT,
      cottage: PropertyType.COTTAGE,
    };
    return typeMap[type?.toLowerCase()] || PropertyType.APARTMENT;
  }

  /**
   * Map amenities to enum
   */
  private mapAmenities(amenities: any[]): ShortletAmenity[] {
    if (!amenities) return [];
    
    const amenityMap: Record<string, ShortletAmenity> = {
      wifi: ShortletAmenity.WIFI,
      kitchen: ShortletAmenity.KITCHEN,
      'washing machine': ShortletAmenity.WASHING_MACHINE,
      'air conditioning': ShortletAmenity.AIR_CONDITIONING,
      parking: ShortletAmenity.PARKING,
      pool: ShortletAmenity.POOL,
      gym: ShortletAmenity.GYM,
    };

    return amenities
      .map((a) => amenityMap[a.toLowerCase()])
      .filter((a) => a !== undefined);
  }

  /**
   * Calculate nights between dates
   */
  private calculateNights(checkIn: string, checkOut: string): number {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }
}
