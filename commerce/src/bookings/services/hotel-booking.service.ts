/**
 * Hotel Booking Service
 * Integrates with Amadeus Hotel APIs for global hotel inventory
 * Supports multi-vendor, multi-currency bookings
 */

import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export enum HotelBookingStatus {
  SEARCHING = 'searching',
  OFFER_AVAILABLE = 'offer_available',
  PRICE_LOCKED = 'price_locked',
  PAYMENT_PENDING = 'payment_pending',
  PAYMENT_AUTHORIZED = 'payment_authorized',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  CHECKED_OUT = 'checked_out',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

export interface HotelSearchDTO {
  cityCode: string; // IATA city code (e.g., 'BER', 'MAD')
  checkInDate: string; // ISO date
  checkOutDate: string; // ISO date
  adults: number;
  children?: number;
  rooms?: number;
  currency?: string;
  maxPrice?: number;
  amenities?: string[]; // ['WIFI', 'PARKING', 'POOL', 'GYM']
  starRating?: number[]; // [3, 4, 5]
  hotelChains?: string[]; // ['MARRIOTT', 'HILTON', 'IHG']
}

export interface HotelOffer {
  id: string;
  hotelId: string;
  hotelName: string;
  hotelChain?: string;
  starRating: number;
  address: {
    street: string;
    city: string;
    country: string;
    postalCode: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  amenities: string[];
  roomType: string;
  bedType: string;
  maxOccupancy: number;
  price: {
    total: bigint; // Minor units
    currency: string;
    baseRate: bigint;
    taxes: bigint;
    fees: bigint;
  };
  cancellationPolicy: {
    refundable: boolean;
    deadline?: string; // ISO datetime
    penalty?: bigint;
  };
  images: string[];
  description: string;
  availableRooms: number;
  expiresAt: Date; // Offer validity
}

export interface HotelBookingRequest {
  offerId: string;
  guests: {
    title: string; // Mr, Mrs, Ms
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    isMainGuest: boolean;
  }[];
  specialRequests?: string[];
  paymentIntentId?: string;
  loyaltyProgram?: {
    chain: string;
    membershipNumber: string;
  };
}

export interface HotelBooking {
  id: string;
  confirmationNumber: string;
  status: HotelBookingStatus;
  hotel: {
    name: string;
    address: string;
    phone: string;
    email: string;
    checkInTime: string;
    checkOutTime: string;
  };
  reservation: {
    checkInDate: string;
    checkOutDate: string;
    nights: number;
    roomType: string;
    guests: number;
  };
  price: {
    total: bigint;
    currency: string;
    breakdown: {
      room: bigint;
      taxes: bigint;
      fees: bigint;
    };
  };
  mainGuest: {
    name: string;
    email: string;
    phone: string;
  };
  vendorId: string;
  vendorConfirmation?: string;
  cancellationPolicy: {
    refundable: boolean;
    deadline?: string;
    penalty?: bigint;
  };
  createdAt: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
}

@Injectable()
export class HotelBookingService {
  private readonly logger = new Logger(HotelBookingService.name);

  private readonly amadeusApiKey: string;
  private readonly amadeusApiSecret: string;
  private amadeusAccessToken: string;
  private tokenExpiresAt: Date;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.amadeusApiKey = this.configService.get<string>('AMADEUS_API_KEY');
    this.amadeusApiSecret = this.configService.get<string>('AMADEUS_API_SECRET');
  }

  /**
   * Search for hotel offers based on criteria
   */
  async searchHotels(dto: HotelSearchDTO): Promise<HotelOffer[]> {
    this.logger.log(
      `Searching hotels in ${dto.cityCode} | ${dto.checkInDate} to ${dto.checkOutDate}`,
    );

    try {
      await this.ensureAmadeusToken();

      const params = new URLSearchParams({
        cityCode: dto.cityCode,
        checkInDate: dto.checkInDate,
        checkOutDate: dto.checkOutDate,
        adults: dto.adults.toString(),
        roomQuantity: (dto.rooms || 1).toString(),
        currency: dto.currency || 'USD',
        bestRateOnly: 'true',
      });

      if (dto.maxPrice) {
        params.append('priceRange', `0-${dto.maxPrice}`);
      }

      if (dto.starRating?.length) {
        params.append('ratings', dto.starRating.join(','));
      }

      if (dto.amenities?.length) {
        params.append('amenities', dto.amenities.join(','));
      }

      const response = await firstValueFrom(
        this.httpService.get(
          `https://api.amadeus.com/v3/shopping/hotel-offers?${params}`,
          {
            headers: {
              Authorization: `Bearer ${this.amadeusAccessToken}`,
            },
          },
        ),
      );

      const offers = response.data.data.map((offer: any) =>
        this.mapAmadeusOfferToHotelOffer(offer),
      );

      this.logger.log(`Found ${offers.length} hotel offers`);
      return offers;
    } catch (error) {
      this.logger.error(`Hotel search failed: ${error.message}`);
      throw new HttpException(
        'Hotel search failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get detailed hotel offer by ID
   */
  async getHotelOffer(offerId: string): Promise<HotelOffer> {
    this.logger.log(`Retrieving hotel offer: ${offerId}`);

    try {
      await this.ensureAmadeusToken();

      const response = await firstValueFrom(
        this.httpService.get(
          `https://api.amadeus.com/v3/shopping/hotel-offers/${offerId}`,
          {
            headers: {
              Authorization: `Bearer ${this.amadeusAccessToken}`,
            },
          },
        ),
      );

      return this.mapAmadeusOfferToHotelOffer(response.data.data);
    } catch (error) {
      this.logger.error(`Failed to retrieve hotel offer: ${error.message}`);
      throw new HttpException('Hotel offer not found', HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Create hotel booking
   */
  async createBooking(dto: HotelBookingRequest): Promise<HotelBooking> {
    this.logger.log(`Creating hotel booking for offer: ${dto.offerId}`);

    try {
      await this.ensureAmadeusToken();

      // First, retrieve the offer to validate it's still available
      const offer = await this.getHotelOffer(dto.offerId);

      // Build booking request
      const bookingData = {
        data: {
          offerId: dto.offerId,
          guests: dto.guests.map((guest) => ({
            name: {
              title: guest.title,
              firstName: guest.firstName,
              lastName: guest.lastName,
            },
            contact: {
              email: guest.email,
              phone: guest.phone,
            },
          })),
          payments: dto.paymentIntentId
            ? [
                {
                  method: 'CREDIT_CARD',
                  card: {
                    vendorCode: 'VI', // Will be updated with actual card type
                  },
                },
              ]
            : [],
        },
      };

      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.amadeus.com/v1/booking/hotel-bookings',
          bookingData,
          {
            headers: {
              Authorization: `Bearer ${this.amadeusAccessToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const booking = this.mapAmadeusBookingToHotelBooking(
        response.data.data,
        offer,
        dto.guests,
      );

      this.logger.log(
        `Hotel booking created: ${booking.confirmationNumber}`,
      );

      return booking;
    } catch (error) {
      this.logger.error(`Hotel booking failed: ${error.message}`);
      throw new HttpException(
        'Hotel booking failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Cancel hotel booking
   */
  async cancelBooking(
    bookingId: string,
    confirmationNumber: string,
  ): Promise<HotelBooking> {
    this.logger.log(`Cancelling hotel booking: ${confirmationNumber}`);

    try {
      await this.ensureAmadeusToken();

      const response = await firstValueFrom(
        this.httpService.delete(
          `https://api.amadeus.com/v1/booking/hotel-bookings/${confirmationNumber}`,
          {
            headers: {
              Authorization: `Bearer ${this.amadeusAccessToken}`,
            },
          },
        ),
      );

      // TODO: Update booking status in database
      this.logger.log(`Hotel booking cancelled: ${confirmationNumber}`);

      return response.data.data;
    } catch (error) {
      this.logger.error(`Hotel cancellation failed: ${error.message}`);
      throw new HttpException(
        'Hotel cancellation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Check availability for a specific hotel
   */
  async checkHotelAvailability(
    hotelId: string,
    checkInDate: string,
    checkOutDate: string,
  ): Promise<boolean> {
    try {
      await this.ensureAmadeusToken();

      const response = await firstValueFrom(
        this.httpService.get(
          `https://api.amadeus.com/v3/shopping/hotel-offers/by-hotel`,
          {
            params: {
              hotelId,
              checkInDate,
              checkOutDate,
            },
            headers: {
              Authorization: `Bearer ${this.amadeusAccessToken}`,
            },
          },
        ),
      );

      return response.data.data?.available || false;
    } catch (error) {
      this.logger.warn(`Hotel availability check failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Ensure Amadeus access token is valid
   */
  private async ensureAmadeusToken(): Promise<void> {
    if (this.amadeusAccessToken && this.tokenExpiresAt > new Date()) {
      return;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.amadeus.com/v1/security/oauth2/token',
          new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: this.amadeusApiKey,
            client_secret: this.amadeusApiSecret,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );

      this.amadeusAccessToken = response.data.access_token;
      this.tokenExpiresAt = new Date(
        Date.now() + response.data.expires_in * 1000,
      );

      this.logger.debug('Amadeus access token refreshed');
    } catch (error) {
      this.logger.error(`Amadeus token refresh failed: ${error.message}`);
      throw new HttpException(
        'Authentication failed',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /**
   * Map Amadeus offer to internal HotelOffer format
   */
  private mapAmadeusOfferToHotelOffer(amadeusOffer: any): HotelOffer {
    const offer = amadeusOffer.offers?.[0] || amadeusOffer;
    const hotel = amadeusOffer.hotel;

    return {
      id: offer.id,
      hotelId: hotel.hotelId,
      hotelName: hotel.name,
      hotelChain: hotel.chainCode,
      starRating: hotel.rating || 0,
      address: {
        street: hotel.address?.lines?.[0] || '',
        city: hotel.address?.cityName || '',
        country: hotel.address?.countryCode || '',
        postalCode: hotel.address?.postalCode || '',
        coordinates: {
          latitude: hotel.latitude || 0,
          longitude: hotel.longitude || 0,
        },
      },
      amenities: hotel.amenities || [],
      roomType: offer.room?.type || 'STANDARD',
      bedType: offer.room?.typeEstimated?.bedType || 'DOUBLE',
      maxOccupancy: offer.guests?.adults || 2,
      price: {
        total: BigInt(Math.round(parseFloat(offer.price.total) * 100)),
        currency: offer.price.currency,
        baseRate: BigInt(Math.round(parseFloat(offer.price.base) * 100)),
        taxes: BigInt(
          Math.round(
            parseFloat(offer.price.taxes?.[0]?.amount || '0') * 100,
          ),
        ),
        fees: BigInt(0), // TODO: Extract fees if available
      },
      cancellationPolicy: {
        refundable: offer.policies?.cancellation?.type !== 'FULL_STAY',
        deadline: offer.policies?.cancellation?.deadline,
        penalty: offer.policies?.cancellation?.amount
          ? BigInt(Math.round(parseFloat(offer.policies.cancellation.amount) * 100))
          : undefined,
      },
      images: hotel.media?.map((m: any) => m.uri) || [],
      description: offer.room?.description?.text || hotel.description || '',
      availableRooms: offer.available || 1,
      expiresAt: new Date(Date.now() + 20 * 60 * 1000), // 20 min validity
    };
  }

  /**
   * Map Amadeus booking to internal HotelBooking format
   */
  private mapAmadeusBookingToHotelBooking(
    amadeusBooking: any,
    offer: HotelOffer,
    guests: any[],
  ): HotelBooking {
    const mainGuest = guests.find((g) => g.isMainGuest) || guests[0];

    return {
      id: amadeusBooking.id,
      confirmationNumber: amadeusBooking.providerConfirmationId,
      status: HotelBookingStatus.CONFIRMED,
      hotel: {
        name: offer.hotelName,
        address: `${offer.address.street}, ${offer.address.city}`,
        phone: amadeusBooking.hotel?.contact?.phone || '',
        email: amadeusBooking.hotel?.contact?.email || '',
        checkInTime: '15:00',
        checkOutTime: '11:00',
      },
      reservation: {
        checkInDate: amadeusBooking.checkInDate,
        checkOutDate: amadeusBooking.checkOutDate,
        nights: this.calculateNights(
          amadeusBooking.checkInDate,
          amadeusBooking.checkOutDate,
        ),
        roomType: offer.roomType,
        guests: guests.length,
      },
      price: {
        total: offer.price.total,
        currency: offer.price.currency,
        breakdown: {
          room: offer.price.baseRate,
          taxes: offer.price.taxes,
          fees: offer.price.fees,
        },
      },
      mainGuest: {
        name: `${mainGuest.firstName} ${mainGuest.lastName}`,
        email: mainGuest.email,
        phone: mainGuest.phone,
      },
      vendorId: `hotel_${offer.hotelChain || 'independent'}`,
      vendorConfirmation: amadeusBooking.providerConfirmationId,
      cancellationPolicy: offer.cancellationPolicy,
      createdAt: new Date(),
      confirmedAt: new Date(),
    };
  }

  /**
   * Calculate number of nights between check-in and check-out
   */
  private calculateNights(checkIn: string, checkOut: string): number {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
