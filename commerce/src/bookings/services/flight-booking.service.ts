import { Injectable, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

// Flight Offer DTO
interface FlightOffer {
  id: string;
  source: 'amadeus' | 'mock';
  itineraries: Itinerary[];
  price: {
    total: string;
    base: string;
    fees: Array<{ amount: string; type: string }>;
    grandTotal: string;
  };
  pricingOptions: {
    fareType: string[];
    includedCheckedBagsOnly: boolean;
  };
  validatingAirlineCodes: string[];
  travelerPricings: TravelerPricing[];
}

interface Itinerary {
  duration: string;
  segments: Segment[];
}

interface Segment {
  departure: { iataCode: string; at: string };
  arrival: { iataCode: string; at: string };
  carrierCode: string;
  number: string;
  aircraft: { code: string };
  operating: { carrierCode: string };
  stops: Array<{ iataCode: string; duration: string }>;
  class: string;
}

interface TravelerPricing {
  travelerId: string;
  fareOption: string;
  travelerType: string;
  price: {
    currency: string;
    total: string;
    base: string;
  };
  fareDetailsBySegment: Array<{
    segmentId: string;
    cabin: string;
    class: string;
    includedCheckedBags: { weight: number; weightUnit: string };
  }>;
}

// Flight Order DTO
interface FlightOrder {
  id: string;
  associatedRecords: Array<{ reference: string; creationDate: string; originSystemCode: string }>;
  flightOffers: FlightOffer[];
  travelers: Traveler[];
  remarks: { general: Array<{ subType: string; text: string }> };
  contacts: Contact[];
  documents: Document[];
  type: string;
  associatedRecord: string;
}

interface Traveler {
  id: string;
  dateOfBirth: string;
  name: { firstName: string; lastName: string };
  gender: string;
  contact: { emailAddress: string; phones: Array<{ deviceType: string; countryCallingCode: string; number: string }> };
  documents: Array<{ documentType: string; birthPlace: string; issuanceLocation: string; issuanceDate: string; number: string; expiryDate: string; issuanceCountry: string; validityCountry: string; nationality: string; holder: boolean }>;
}

interface Contact {
  addresseeName: { firstName: string; lastName: string };
  address: { cityName: string; countryCode: string; lines: string[] };
  emailAddress: string;
  phones: Array<{ deviceType: string; countryCallingCode: string; number: string }>;
}

interface Document {
  documentType: string;
  birthPlace: string;
  issuanceLocation: string;
  issuanceDate: string;
  number: string;
  expiryDate: string;
  issuanceCountry: string;
  validityCountry: string;
  nationality: string;
  holder: boolean;
}

interface FlightBooking {
  bookingId: string;
  orderId: string;
  pnr: string;
  status: 'OFFER_VALID' | 'ORDER_CREATED' | 'PAYMENT_CAPTURED' | 'ISSUED' | 'CANCELLED';
  flightOffer: FlightOffer;
  passengers: PassengerInfo[];
  ancillaryServices: AncillaryService[];
  selectedSeats: SeatSelection[];
  totalPrice: number;
  createdAt: Date;
  expiresAt: Date;
  bookingDetails: {
    outbound?: { departure: string; arrival: string; duration: string; stops: number };
    return?: { departure: string; arrival: string; duration: string; stops: number };
  };
}

interface PassengerInfo {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'UNKNOWN';
  nationality: string;
  passport: {
    number: string;
    expiryDate: string;
    issuanceCountry: string;
  };
}

interface AncillaryService {
  type: 'BAGGAGE' | 'SEAT_SELECTION' | 'MEAL' | 'LOUNGE' | 'INSURANCE' | 'TRANSFER';
  description: string;
  price: number;
  quantity: number;
}

interface SeatSelection {
  passengerId: string;
  segmentId: string;
  seatNumber: string;
  cabin: 'ECONOMY' | 'BUSINESS' | 'FIRST' | 'PREMIUM_ECONOMY';
  price: number;
}

interface FlightSearchRequest {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  travelClass?: string;
  includeAirlineCodes?: string[];
  excludeAirlineCodes?: string[];
  nonStop?: boolean;
  maxPrice?: number;
  currencyCode?: string;
}

interface PNRInfo {
  pnr: string;
  passengers: string[];
  itinerary: Array<{ departure: string; arrival: string; carrier: string; flightNumber: string }>;
  status: string;
  eticketNumbers: string[];
}

@Injectable()
export class FlightBookingService {
  private amadeusBearerToken: string = '';
  private tokenExpiryTime: number = 0;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.initializeAmadeusToken();
  }

  // Initialize Amadeus Bearer Token
  private async initializeAmadeusToken(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'https://test.api.amadeus.com/v1/security/oauth2/token',
          {
            grant_type: 'client_credentials',
            client_id: this.configService.get('AMADEUS_API_KEY'),
            client_secret: this.configService.get('AMADEUS_API_SECRET'),
          },
        ),
      );

      this.amadeusBearerToken = response.data.access_token;
      this.tokenExpiryTime = Date.now() + response.data.expires_in * 1000;
    } catch (error) {
      console.error('Failed to initialize Amadeus token:', error);
      // Use mock data in test mode
      this.amadeusBearerToken = 'test_token_' + Date.now();
    }
  }

  // Search Flights
  async searchFlights(request: FlightSearchRequest): Promise<FlightOffer[]> {
    try {
      const params = new URLSearchParams({
        originLocationCode: request.originLocationCode,
        destinationLocationCode: request.destinationLocationCode,
        departureDate: request.departureDate,
        ...(request.returnDate && { returnDate: request.returnDate }),
        adults: request.adults.toString(),
        ...(request.children && { children: request.children.toString() }),
        ...(request.infants && { infants: request.infants.toString() }),
        ...(request.travelClass && { travelClass: request.travelClass }),
        ...(request.nonStop && { nonStop: 'true' }),
        ...(request.maxPrice && { maxPrice: request.maxPrice.toString() }),
        ...(request.currencyCode && { currencyCode: request.currencyCode }),
        max: '250',
      });

      if (process.env.AMADEUS_ENVIRONMENT === 'test') {
        return this.generateMockFlightOffers(request);
      }

      const response = await firstValueFrom(
        this.httpService.get(
          `https://api.amadeus.com/v2/shopping/flight-offers?${params}`,
          {
            headers: { Authorization: `Bearer ${this.amadeusBearerToken}` },
          },
        ),
      );

      return response.data.data || [];
    } catch (error) {
      console.error('Flight search error:', error);
      return this.generateMockFlightOffers(request);
    }
  }

  // Get Single Flight Offer Details
  async getFlightOfferDetails(offerId: string): Promise<FlightOffer> {
    const offers = await this.searchFlights({
      originLocationCode: 'LAX',
      destinationLocationCode: 'JFK',
      departureDate: new Date().toISOString().split('T')[0],
      adults: 1,
    });

    const offer = offers.find((o) => o.id === offerId);
    if (!offer) {
      throw new HttpException('Flight offer not found', HttpStatus.NOT_FOUND);
    }

    return offer;
  }

  // Create Flight Order (PNR Generation)
  async createBooking(
    offerId: string,
    passengers: PassengerInfo[],
    ancillaryServices: AncillaryService[],
  ): Promise<FlightBooking> {
    // Verify offer still exists
    const offer = await this.getFlightOfferDetails(offerId);

    // Validate passenger count
    if (passengers.length < 1 || passengers.length > 9) {
      throw new BadRequestException('Flight can accommodate 1-9 passengers');
    }

    // Generate Booking
    const booking: FlightBooking = {
      bookingId: `BK${uuidv4().substring(0, 10).toUpperCase()}`,
      orderId: `FL${uuidv4().substring(0, 12).toUpperCase()}`,
      pnr: this.generatePNR(),
      status: 'OFFER_VALID',
      flightOffer: offer,
      passengers,
      ancillaryServices,
      selectedSeats: [],
      totalPrice: parseFloat(offer.price.grandTotal),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 20 * 60 * 1000), // 20 minutes
      bookingDetails: {
        outbound: this.extractItineraryInfo(offer.itineraries[0]),
        return: offer.itineraries[1] ? this.extractItineraryInfo(offer.itineraries[1]) : undefined,
      },
    };

    return booking;
  }

  // Capture Payment (Authorization)
  async capturePayment(bookingId: string, paymentMethodId: string): Promise<FlightBooking> {
    // In production, integrate with PaymentGatewayOrchestrator
    // For now, simulate payment capture

    const booking: FlightBooking = {
      bookingId,
      orderId: `FL${uuidv4().substring(0, 12).toUpperCase()}`,
      pnr: this.generatePNR(),
      status: 'PAYMENT_CAPTURED',
      flightOffer: {} as FlightOffer,
      passengers: [],
      ancillaryServices: [],
      selectedSeats: [],
      totalPrice: 0,
      createdAt: new Date(),
      expiresAt: new Date(),
      bookingDetails: {},
    };

    return booking;
  }

  // Issue Flight (Generate E-Ticket)
  async issueTickets(bookingId: string, orderId: string): Promise<{ etickets: string[]; pnr: string }> {
    const pnr = this.generatePNR();
    const etickets = [
      `001${Math.random().toString().substring(2, 12)}`,
      `001${Math.random().toString().substring(2, 12)}`,
    ];

    return {
      etickets,
      pnr,
    };
  }

  // Select Seats with Cabin Classes
  async selectSeats(bookingId: string, seatSelections: SeatSelection[]): Promise<SeatSelection[]> {
    // Validate seat selections against aircraft
    const validSeats: SeatSelection[] = [];

    for (const selection of seatSelections) {
      // Simulate seat availability check
      if (this.isSeatAvailable(selection.seatNumber)) {
        validSeats.push(selection);
      }
    }

    return validSeats;
  }

  // Get Available Seats by Cabin Class
  async getAvailableSeats(
    segmentId: string,
    cabin: 'ECONOMY' | 'BUSINESS' | 'FIRST' | 'PREMIUM_ECONOMY',
  ): Promise<Array<{ seatNumber: string; price: number; available: boolean }>> {
    const rows = cabin === 'BUSINESS' ? 12 : cabin === 'FIRST' ? 8 : 30;
    const columns = cabin === 'FIRST' ? 2 : cabin === 'BUSINESS' ? 3 : 6;

    const seats: Array<{ seatNumber: string; price: number; available: boolean }> = [];

    for (let row = 1; row <= rows; row++) {
      for (let col = 0; col < columns; col++) {
        const letter = String.fromCharCode(65 + col);
        const seatNumber = `${row}${letter}`;

        seats.push({
          seatNumber,
          price: cabin === 'BUSINESS' ? 150 : cabin === 'FIRST' ? 300 : 50,
          available: Math.random() > 0.2, // 80% availability
        });
      }
    }

    return seats.filter((s) => s.available);
  }

  // Add Ancillary Services
  async addAncillaryServices(bookingId: string, services: AncillaryService[]): Promise<AncillaryService[]> {
    return services.map((service) => ({
      ...service,
      price: this.calculateAncillaryPrice(service),
    }));
  }

  // Get PNR Information
  async getPNRDetails(pnr: string): Promise<PNRInfo> {
    // In production, call Amadeus PNR retrieval API
    return {
      pnr,
      passengers: ['JOHN DOE', 'JANE DOE'],
      itinerary: [
        {
          departure: 'LAX',
          arrival: 'JFK',
          carrier: 'AA',
          flightNumber: '123',
        },
      ],
      status: 'ISSUED',
      eticketNumbers: [
        `001${Math.random().toString().substring(2, 12)}`,
        `001${Math.random().toString().substring(2, 12)}`,
      ],
    };
  }

  // Cancel Booking
  async cancelBooking(bookingId: string, pnr: string): Promise<{ status: string; refundAmount: number }> {
    // Calculate refund based on airline policy
    const refundPercentage = 0.8; // 80% refund for cancellation

    return {
      status: 'CANCELLED',
      refundAmount: 1000 * refundPercentage, // Mock calculation
    };
  }

  // Modify Booking (Change Dates/Routes)
  async modifyBooking(bookingId: string, newFlightOfferId: string): Promise<FlightBooking> {
    const newOffer = await this.getFlightOfferDetails(newFlightOfferId);

    return {
      bookingId,
      orderId: `FL${uuidv4().substring(0, 12).toUpperCase()}`,
      pnr: this.generatePNR(),
      status: 'ORDER_CREATED',
      flightOffer: newOffer,
      passengers: [],
      ancillaryServices: [],
      selectedSeats: [],
      totalPrice: parseFloat(newOffer.price.grandTotal),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 20 * 60 * 1000),
      bookingDetails: {
        outbound: this.extractItineraryInfo(newOffer.itineraries[0]),
      },
    };
  }

  // Get Ancillary Service Pricing
  async getAncillaryPricing(
    segmentId: string,
  ): Promise<Array<{ service: string; basePrice: number; currency: string }>> {
    return [
      { service: 'BAGGAGE_1', basePrice: 35, currency: 'USD' },
      { service: 'BAGGAGE_2', basePrice: 60, currency: 'USD' },
      { service: 'SEAT_SELECTION', basePrice: 15, currency: 'USD' },
      { service: 'PRIORITY_BOARDING', basePrice: 25, currency: 'USD' },
      { service: 'MEAL_UPGRADE', basePrice: 20, currency: 'USD' },
      { service: 'LOUNGE_ACCESS', basePrice: 80, currency: 'USD' },
    ];
  }

  // Price Monitoring Background Job
  async monitorFlightPrice(originalOfferId: string, targetPrice: number): Promise<{ priceDropped: boolean; newPrice: number }> {
    // Simulate price monitoring
    const newPrice = targetPrice - Math.random() * 100;

    return {
      priceDropped: newPrice < targetPrice,
      newPrice: Math.max(newPrice, targetPrice * 0.7),
    };
  }

  // ==================== HELPER METHODS ====================

  private generatePNR(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let pnr = '';
    for (let i = 0; i < 6; i++) {
      pnr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pnr;
  }

  private generateMockFlightOffers(request: FlightSearchRequest): FlightOffer[] {
    const offers: FlightOffer[] = [];

    for (let i = 0; i < 5; i++) {
      const basePrice = 400 + Math.random() * 600;
      const duration = Math.floor(4 + Math.random() * 6);

      const offer: FlightOffer = {
        id: `FL${uuidv4().substring(0, 8).toUpperCase()}`,
        source: 'mock',
        itineraries: [
          {
            duration: `PT${duration}H${Math.floor(Math.random() * 60)}M`,
            segments: [
              {
                departure: { iataCode: request.originLocationCode, at: request.departureDate + 'T08:00:00' },
                arrival: { iataCode: request.destinationLocationCode, at: request.departureDate + 'T' + (8 + duration) + ':00:00' },
                carrierCode: ['AA', 'UA', 'DL', 'BA', 'AF'][Math.floor(Math.random() * 5)],
                number: String(Math.floor(100 + Math.random() * 900)),
                aircraft: { code: ['320', '350', '787', '777'][Math.floor(Math.random() * 4)] },
                operating: { carrierCode: ['AA', 'UA', 'DL', 'BA', 'AF'][Math.floor(Math.random() * 5)] },
                stops: Math.random() > 0.7 ? [{ iataCode: 'ORD', duration: 'PT2H' }] : [],
                class: request.travelClass || 'ECONOMY',
              },
            ],
          },
        ],
        price: {
          total: basePrice.toFixed(2),
          base: (basePrice * 0.85).toFixed(2),
          fees: [{ amount: (basePrice * 0.15).toFixed(2), type: 'SUPPLIER' }],
          grandTotal: basePrice.toFixed(2),
        },
        pricingOptions: { fareType: ['PUBLISHED'], includedCheckedBagsOnly: true },
        validatingAirlineCodes: ['AA'],
        travelerPricings: Array(request.adults)
          .fill(null)
          .map((_, idx) => ({
            travelerId: `${idx + 1}`,
            fareOption: 'PUBLISHED',
            travelerType: 'ADULT',
            price: {
              currency: request.currencyCode || 'USD',
              total: (basePrice / request.adults).toFixed(2),
              base: ((basePrice * 0.85) / request.adults).toFixed(2),
            },
            fareDetailsBySegment: [
              {
                segmentId: '1',
                cabin: 'ECONOMY',
                class: 'M',
                includedCheckedBags: { weight: 23, weightUnit: 'KG' },
              },
            ],
          })),
      };

      offers.push(offer);
    }

    return offers;
  }

  private isSeatAvailable(seatNumber: string): boolean {
    // Simulate seat availability
    return Math.random() > 0.15; // 85% availability
  }

  private calculateAncillaryPrice(service: AncillaryService): number {
    const basePrices: Record<string, number> = {
      BAGGAGE: 35,
      SEAT_SELECTION: 15,
      MEAL: 20,
      LOUNGE: 80,
      INSURANCE: 50,
      TRANSFER: 40,
    };

    return (basePrices[service.type] || 0) * service.quantity;
  }

  private extractItineraryInfo(itinerary: Itinerary): {
    departure: string;
    arrival: string;
    duration: string;
    stops: number;
  } {
    const firstSegment = itinerary.segments[0];
    const lastSegment = itinerary.segments[itinerary.segments.length - 1];
    const totalStops = itinerary.segments.reduce((sum, seg) => sum + seg.stops.length, 0);

    return {
      departure: firstSegment.departure.iataCode + ' - ' + firstSegment.departure.at,
      arrival: lastSegment.arrival.iataCode + ' - ' + lastSegment.arrival.at,
      duration: itinerary.duration,
      stops: totalStops,
    };
  }
}
