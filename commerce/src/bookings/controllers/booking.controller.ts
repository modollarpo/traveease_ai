/**
 * Unified Booking Controller
 * REST API endpoints for all booking services
 */

import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';

// Services
import { HotelBookingService } from '../services/hotel-booking.service';
import { ToursExperiencesService } from '../services/tours-experiences.service';
import { ShortletsService } from '../services/shortlets.service';
import { VisaImmigrationService } from '../services/visa-immigration.service';
import { TravelInsuranceService } from '../services/travel-insurance.service';
import { CurrencyExchangeService } from '../services/currency-exchange.service';
import { AIConciergeService } from '../services/ai-concierge.service';
import { LoyaltyRewardsService } from '../services/loyalty-rewards.service';
import { FlightBookingService } from '../services/flight-booking.service';
import { CarRentalService } from '../services/car-rental.service';
import { LocalMobilityService } from '../services/local-mobility.service';

// Payment services
import { PaymentGatewayOrchestrator } from '../../payments/services/payment-gateway-orchestrator.service';
import { MarketplaceSplitService } from '../../payments/services/marketplace-split.service';

@Controller('bookings')
export class BookingController {
  private readonly logger = new Logger(BookingController.name);

  constructor(
    // Booking services
    private readonly hotelService: HotelBookingService,
    private readonly toursService: ToursExperiencesService,
    private readonly shortletsService: ShortletsService,
    private readonly visaService: VisaImmigrationService,
    private readonly insuranceService: TravelInsuranceService,
    private readonly currencyService: CurrencyExchangeService,
    private readonly aiConcierge: AIConciergeService,
    private readonly loyaltyService: LoyaltyRewardsService,
    
    // Phase 4 - Transportation & Mobility
    private readonly flightService: FlightBookingService,
    private readonly carRentalService: CarRentalService,
    private readonly mobilityService: LocalMobilityService,
    
    // Payment services
    private readonly paymentOrchestrator: PaymentGatewayOrchestrator,
    private readonly marketplaceSplit: MarketplaceSplitService,
  ) {}

  // ===========================
  // HOTELS
  // ===========================

  @Post('hotels/search')
  @HttpCode(HttpStatus.OK)
  async searchHotels(@Body() dto: any) {
    this.logger.log(`Hotel search: ${dto.location}`);
    return await this.hotelService.searchHotels(dto);
  }

  @Get('hotels/:offerId')
  async getHotelOffer(@Param('offerId') offerId: string) {
    this.logger.log(`Get hotel offer: ${offerId}`);
    return await this.hotelService.getHotelOffer(offerId);
  }

  @Post('hotels/book')
  async bookHotel(@Body() dto: any) {
    this.logger.log(`Booking hotel: ${dto.offerId}`);
    
    // Create booking
    const booking = await this.hotelService.createBooking(dto);
    
    // Award loyalty points
    if (dto.userId) {
      const points = this.loyaltyService.calculateBookingPoints(
        booking.pricing.total,
        'hotel',
      );
      await this.loyaltyService.awardPoints(
        dto.userId,
        'booking' as any,
        points,
        `Hotel booking: ${booking.hotel.name}`,
        booking.id,
      );
    }
    
    return booking;
  }

  @Delete('hotels/:bookingId')
  async cancelHotel(@Param('bookingId') bookingId: string) {
    this.logger.log(`Cancelling hotel booking: ${bookingId}`);
    return await this.hotelService.cancelBooking(bookingId);
  }

  // ===========================
  // TOURS & EXPERIENCES
  // ===========================

  @Post('tours/search')
  @HttpCode(HttpStatus.OK)
  async searchTours(@Body() dto: any) {
    this.logger.log(`Tour search: ${dto.location}`);
    return await this.toursService.searchTours(dto);
  }

  @Get('tours/:tourId')
  async getTourDetails(
    @Param('tourId') tourId: string,
    @Query('provider') provider: string,
  ) {
    this.logger.log(`Get tour details: ${tourId}`);
    return await this.toursService.getTourDetails(tourId, provider);
  }

  @Post('tours/book')
  async bookTour(@Body() dto: any) {
    this.logger.log(`Booking tour: ${dto.tourId}`);
    
    const booking = await this.toursService.createBooking(dto);
    
    // Award loyalty points
    if (dto.userId) {
      const points = this.loyaltyService.calculateBookingPoints(
        booking.pricing.total,
        'tour',
      );
      await this.loyaltyService.awardPoints(
        dto.userId,
        'booking' as any,
        points,
        `Tour booking: ${booking.tour.name}`,
        booking.id,
      );
    }
    
    return booking;
  }

  @Delete('tours/:bookingId')
  async cancelTour(@Param('bookingId') bookingId: string) {
    this.logger.log(`Cancelling tour booking: ${bookingId}`);
    return await this.toursService.cancelBooking(bookingId);
  }

  // ===========================
  // SHORTLETS / VACATION RENTALS
  // ===========================

  @Post('shortlets/search')
  @HttpCode(HttpStatus.OK)
  async searchShortlets(@Body() dto: any) {
    this.logger.log(`Shortlet search: ${dto.location}`);
    return await this.shortletsService.searchProperties(dto);
  }

  @Get('shortlets/:propertyId')
  async getShortletDetails(
    @Param('propertyId') propertyId: string,
    @Query('provider') provider: string,
  ) {
    this.logger.log(`Get shortlet details: ${propertyId}`);
    return await this.shortletsService.getPropertyDetails(propertyId, provider);
  }

  @Post('shortlets/book')
  async bookShortlet(@Body() dto: any) {
    this.logger.log(`Booking shortlet: ${dto.propertyId}`);
    
    const booking = await this.shortletsService.createBooking(dto);
    
    // Award loyalty points
    if (dto.primaryGuest?.userId) {
      const points = this.loyaltyService.calculateBookingPoints(
        booking.pricing.total,
        'hotel',
      );
      await this.loyaltyService.awardPoints(
        dto.primaryGuest.userId,
        'booking' as any,
        points,
        `Shortlet booking: ${booking.property.title}`,
        booking.id,
      );
    }
    
    return booking;
  }

  @Delete('shortlets/:bookingId')
  async cancelShortlet(
    @Param('bookingId') bookingId: string,
    @Query('confirmationCode') confirmationCode: string,
  ) {
    this.logger.log(`Cancelling shortlet booking: ${bookingId}`);
    return await this.shortletsService.cancelBooking(bookingId, confirmationCode);
  }

  // ===========================
  // VISA & IMMIGRATION
  // ===========================

  @Post('visa/requirements')
  @HttpCode(HttpStatus.OK)
  async checkVisaRequirements(@Body() dto: any) {
    this.logger.log(
      `Visa check: ${dto.passportCountry} → ${dto.destinationCountry}`,
    );
    return await this.visaService.checkVisaRequirements(dto);
  }

  @Post('visa/apply')
  async submitVisaApplication(@Body() dto: any) {
    this.logger.log(`Visa application: ${dto.applicantInfo.firstName}`);
    return await this.visaService.submitApplication(dto);
  }

  @Get('visa/track/:applicationNumber')
  async trackVisaApplication(@Param('applicationNumber') applicationNumber: string) {
    this.logger.log(`Tracking visa application: ${applicationNumber}`);
    return await this.visaService.trackApplication(applicationNumber);
  }

  @Post('visa/health-requirements')
  @HttpCode(HttpStatus.OK)
  async getHealthRequirements(
    @Body() dto: { destinationCountry: string; originCountry: string },
  ) {
    this.logger.log(
      `Health requirements: ${dto.originCountry} → ${dto.destinationCountry}`,
    );
    return await this.visaService.getHealthRequirements(
      dto.destinationCountry,
      dto.originCountry,
    );
  }

  @Post('visa/upload-document')
  async uploadVisaDocument(@Body() dto: any) {
    this.logger.log(`Uploading visa document: ${dto.documentType}`);
    // TODO: Handle file upload (multipart/form-data)
    return await this.visaService.uploadDocument(
      dto.applicationId,
      dto.documentType,
      dto.file,
    );
  }

  @Get('visa/centers')
  async getVisaCenters(
    @Query('country') country: string,
    @Query('city') city: string,
  ) {
    this.logger.log(`Finding visa centers in ${city}, ${country}`);
    return await this.visaService.getVisaApplicationCenters(country, city);
  }

  // ===========================
  // TRAVEL INSURANCE
  // ===========================

  @Post('insurance/quotes')
  @HttpCode(HttpStatus.OK)
  async getInsuranceQuotes(@Body() dto: any) {
    this.logger.log(
      `Insurance quotes: ${dto.tripDetails.destination.join(', ')}`,
    );
    return await this.insuranceService.getQuotes(dto);
  }

  @Post('insurance/purchase')
  async purchaseInsurance(@Body() dto: any) {
    this.logger.log(`Purchasing insurance: ${dto.quoteId}`);
    return await this.insuranceService.purchasePolicy(dto);
  }

  @Post('insurance/claims')
  async submitClaim(@Body() dto: any) {
    this.logger.log(`Submitting claim: ${dto.policyNumber}`);
    return await this.insuranceService.submitClaim(
      dto.policyNumber,
      dto.claimDetails,
    );
  }

  @Get('insurance/claims/:claimNumber')
  async trackClaim(@Param('claimNumber') claimNumber: string) {
    this.logger.log(`Tracking claim: ${claimNumber}`);
    return await this.insuranceService.trackClaim(claimNumber);
  }

  // ===========================
  // CURRENCY EXCHANGE
  // ===========================

  @Get('currency/rates')
  async getExchangeRate(
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    this.logger.log(`Exchange rate: ${from} → ${to}`);
    return await this.currencyService.getExchangeRate(from, to);
  }

  @Post('currency/convert')
  @HttpCode(HttpStatus.OK)
  async convertCurrency(@Body() dto: any) {
    this.logger.log(
      `Converting ${dto.amount} ${dto.fromCurrency} → ${dto.toCurrency}`,
    );
    return await this.currencyService.convertCurrency(dto);
  }

  @Get('currency/multiple-rates')
  async getMultipleRates(
    @Query('base') base: string,
    @Query('targets') targets: string,
  ) {
    const targetCurrencies = targets.split(',');
    this.logger.log(`Multiple rates: ${base} → [${targets}]`);
    return await this.currencyService.getMultipleRates(base, targetCurrencies);
  }

  @Post('currency/book-rate')
  async bookFXRate(@Body() dto: any) {
    this.logger.log(`Booking FX rate: ${dto.fromCurrency} → ${dto.toCurrency}`);
    return await this.currencyService.bookFXRate(dto);
  }

  @Get('currency/info/:code')
  async getCurrencyInfo(@Param('code') code: string) {
    this.logger.log(`Currency info: ${code}`);
    return await this.currencyService.getCurrencyInfo(code);
  }

  @Post('currency/optimal-payment')
  @HttpCode(HttpStatus.OK)
  async getOptimalPaymentCurrency(@Body() dto: any) {
    this.logger.log(
      `Optimal payment currency: ${dto.userLocation} → ${dto.vendorCurrency}`,
    );
    return await this.currencyService.getOptimalPaymentCurrency(
      dto.userLocation,
      dto.vendorCurrency,
      dto.amount,
    );
  }

  @Get('currency/historical')
  async getHistoricalRates(
    @Query('base') base: string,
    @Query('target') target: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    this.logger.log(`Historical rates: ${base} → ${target}`);
    return await this.currencyService.getHistoricalRates(
      base,
      target,
      startDate,
      endDate,
    );
  }

  // ===========================
  // AI CONCIERGE
  // ===========================

  @Post('ai/itinerary')
  async generateItinerary(@Body() dto: any) {
    this.logger.log(`Generating AI itinerary: ${dto.destinations.join(', ')}`);
    return await this.aiConcierge.generateItinerary(dto);
  }

  @Post('ai/chat')
  @HttpCode(HttpStatus.OK)
  async chatWithAI(@Body() dto: { message: string; context: any }) {
    this.logger.log(`AI chat: ${dto.message.substring(0, 50)}...`);
    return await this.aiConcierge.chat(dto.message, dto.context);
  }

  @Post('ai/recommendations')
  @HttpCode(HttpStatus.OK)
  async getAIRecommendations(@Body() dto: any) {
    this.logger.log(`AI recommendations for user`);
    return await this.aiConcierge.getSmartRecommendations(
      dto.userProfile,
      dto.currentLocation,
    );
  }

  @Post('ai/optimize-itinerary')
  @HttpCode(HttpStatus.OK)
  async optimizeItinerary(@Body() dto: any) {
    this.logger.log(`Optimizing itinerary for: ${dto.goal}`);
    return await this.aiConcierge.optimizeItinerary(
      dto.currentItinerary,
      dto.goal,
    );
  }

  @Post('ai/monitor-prices')
  async monitorPrices(@Body() dto: any) {
    this.logger.log(`Setting up price monitoring: ${dto.tripId}`);
    await this.aiConcierge.monitorPrices(dto.tripId, dto.thresholdPercentage);
    return { message: 'Price monitoring activated', tripId: dto.tripId };
  }

  // ===========================
  // LOYALTY & REWARDS
  // ===========================

  @Get('loyalty/:userId')
  async getLoyaltyAccount(@Param('userId') userId: string) {
    this.logger.log(`Getting loyalty account: ${userId}`);
    return await this.loyaltyService.getAccount(userId);
  }

  @Get('loyalty/:userId/catalog')
  async getRewardCatalog(
    @Param('userId') userId: string,
    @Query('tier') tier?: string,
    @Query('category') category?: string,
  ) {
    this.logger.log(`Getting reward catalog for: ${userId}`);
    return await this.loyaltyService.getRewardCatalog(tier as any, category as any);
  }

  @Post('loyalty/redeem')
  async redeemReward(@Body() dto: any) {
    this.logger.log(`Redeeming reward: ${dto.rewardId} for ${dto.userId}`);
    return await this.loyaltyService.redeemReward(dto);
  }

  @Post('loyalty/transfer')
  async transferPoints(@Body() dto: any) {
    this.logger.log(
      `Transferring ${dto.points} points to ${dto.partnerProgram}`,
    );
    return await this.loyaltyService.transferToPartner(
      dto.userId,
      dto.partnerProgram,
      dto.points,
      dto.partnerAccountNumber,
    );
  }

  @Get('loyalty/:userId/referral')
  async getReferralProgram(@Param('userId') userId: string) {
    this.logger.log(`Getting referral program: ${userId}`);
    return await this.loyaltyService.getReferralProgram(userId);
  }

  @Post('loyalty/referral/process')
  async processReferral(@Body() dto: any) {
    this.logger.log(`Processing referral: ${dto.referralCode}`);
    return await this.loyaltyService.processReferral(
      dto.referralCode,
      dto.newUserId,
    );
  }

  @Get('loyalty/:userId/tier-check')
  async checkTierUpgrade(@Param('userId') userId: string) {
    this.logger.log(`Checking tier upgrade: ${userId}`);
    return await this.loyaltyService.checkTierUpgrade(userId);
  }

  // ===========================
  // UNIFIED SEARCH (ALL TYPES)
  // ===========================

  @Post('search/unified')
  @HttpCode(HttpStatus.OK)
  async unifiedSearch(@Body() dto: any) {
    this.logger.log(`Unified search: ${dto.location}`);

    const results = await Promise.allSettled([
      this.hotelService.searchHotels({
        location: dto.location,
        checkIn: dto.dates?.checkIn,
        checkOut: dto.dates?.checkOut,
        guests: dto.guests,
      }),
      this.toursService.searchTours({
        location: dto.location,
        date: dto.dates?.checkIn,
        participants: dto.guests,
      }),
      this.shortletsService.searchProperties({
        location: dto.location,
        checkIn: dto.dates?.checkIn,
        checkOut: dto.dates?.checkOut,
        guests: dto.guests,
      }),
    ]);

    return {
      hotels: results[0].status === 'fulfilled' ? results[0].value : [],
      tours: results[1].status === 'fulfilled' ? results[1].value : [],
      shortlets: results[2].status === 'fulfilled' ? results[2].value : [],
    };
  }

  // ===========================
  // PHASE 4 - FLIGHTS
  // ===========================

  @Post('flights/search')
  async searchFlights(@Body() dto: any) {
    return this.flightService.searchFlights({
      originLocationCode: dto.originCode,
      destinationLocationCode: dto.destinationCode,
      departureDate: dto.departureDate,
      returnDate: dto.returnDate,
      adults: dto.adults || 1,
      children: dto.children,
      infants: dto.infants,
      travelClass: dto.cabinClass || 'ECONOMY',
      nonStop: dto.nonStop || false,
      maxPrice: dto.maxPrice,
      currencyCode: dto.currency || 'USD',
    });
  }

  @Get('flights/:offerId')
  async getFlightOffer(@Param('offerId') offerId: string) {
    return this.flightService.getFlightOfferDetails(offerId);
  }

  @Post('flights/book')
  @HttpCode(HttpStatus.CREATED)
  async bookFlight(@Body() dto: any) {
    const booking = await this.flightService.createBooking(
      dto.offerId,
      dto.passengers,
      dto.ancillaryServices || [],
    );

    // Award loyalty points
    if (dto.userId) {
      const pointsEarned = Math.floor(booking.totalPrice * 1.5); // 1.5 points per $1
      await this.loyaltyService.awardPoints(dto.userId, pointsEarned, 'FLIGHT_BOOKING');
    }

    return booking;
  }

  @Post('flights/:bookingId/payment-capture')
  async captureFlightPayment(@Param('bookingId') bookingId: string, @Body() dto: any) {
    return this.flightService.capturePayment(bookingId, dto.paymentMethodId);
  }

  @Post('flights/:bookingId/seats')
  async selectFlightSeats(@Param('bookingId') bookingId: string, @Body() dto: any) {
    return this.flightService.selectSeats(bookingId, dto.seatSelections);
  }

  @Get('flights/:segmentId/available-seats')
  async getAvailableSeats(@Param('segmentId') segmentId: string, @Query('cabin') cabin: string) {
    return this.flightService.getAvailableSeats(segmentId, cabin as any);
  }

  @Post('flights/:bookingId/ancillaries')
  async addFlightAncillaries(@Param('bookingId') bookingId: string, @Body() dto: any) {
    return this.flightService.addAncillaryServices(bookingId, dto.services);
  }

  @Post('flights/:bookingId/issue-tickets')
  async issueFlightTickets(@Param('bookingId') bookingId: string, @Body() dto: any) {
    return this.flightService.issueTickets(bookingId, dto.orderId);
  }

  @Get('flights/pnr/:pnr')
  async getFlightPNR(@Param('pnr') pnr: string) {
    return this.flightService.getPNRDetails(pnr);
  }

  @Delete('flights/:bookingId')
  async cancelFlight(@Param('bookingId') bookingId: string, @Body() dto: any) {
    return this.flightService.cancelBooking(bookingId, dto.pnr);
  }

  // ===========================
  // PHASE 4 - CAR RENTALS
  // ===========================

  @Post('cars/search')
  async searchCars(@Body() dto: any) {
    return this.carRentalService.searchCars({
      pickupLocation: {
        iataCode: dto.pickupAirportCode,
        city: dto.pickupCity,
        latitude: dto.pickupLatitude,
        longitude: dto.pickupLongitude,
      },
      dropoffLocation: {
        iataCode: dto.dropoffAirportCode,
        city: dto.dropoffCity,
        latitude: dto.dropoffLatitude,
        longitude: dto.dropoffLongitude,
      },
      pickupDate: dto.pickupDate,
      dropoffDate: dto.dropoffDate,
      driverAge: dto.driverAge || 25,
      vehicleType: dto.vehicleType,
      transmissionType: dto.transmission,
    });
  }

  @Get('cars/:offerId')
  async getCarOffer(@Param('offerId') offerId: string) {
    return this.carRentalService.getCarDetails(offerId);
  }

  @Post('cars/reserve')
  @HttpCode(HttpStatus.CREATED)
  async reserveCar(@Body() dto: any) {
    const rental = await this.carRentalService.createReservation(
      dto.offerId,
      dto.renterInfo,
      dto.driverDocuments,
      dto.selectedInsurance,
      dto.additionalServices || [],
    );

    // Award loyalty points
    if (dto.userId) {
      const pointsEarned = Math.floor(rental.totalCost * 1.2);
      await this.loyaltyService.awardPoints(dto.userId, pointsEarned, 'CAR_RENTAL');
    }

    return rental;
  }

  @Post('cars/:rentalId/confirm')
  async confirmCarReservation(@Param('rentalId') rentalId: string, @Body() dto: any) {
    return this.carRentalService.confirmReservation(rentalId, dto.paymentMethodId);
  }

  @Post('cars/:rentalId/complete')
  async completeCarRental(@Param('rentalId') rentalId: string, @Body() dto: any) {
    return this.carRentalService.completeRental(rentalId, dto.dropoffDetails);
  }

  @Delete('cars/:rentalId')
  async cancelCarRental(@Param('rentalId') rentalId: string, @Body() dto: any) {
    return this.carRentalService.cancelRental(rentalId, dto.reason);
  }

  @Post('cars/documents/upload')
  async uploadCarDocument(@Body() dto: any) {
    return this.carRentalService.uploadDocument(dto.file, dto.documentType);
  }

  @Post('cars/documents/verify')
  async verifyCarDocuments(@Body() dto: any) {
    return this.carRentalService.verifyDocuments(dto.documents);
  }

  @Get('cars/location/resolve')
  async resolveCarLocation(@Query() query: any) {
    return this.carRentalService.resolveLocation({
      iataCode: query.iataCode,
      city: query.city,
      latitude: query.latitude,
      longitude: query.longitude,
    });
  }

  @Get('cars/:provider/reliability')
  async getCarReliabilityScore(@Param('provider') provider: string) {
    return this.carRentalService.getReliabilityScore(provider);
  }

  @Get('cars/:offerId/pricing')
  async getCarPricing(@Param('offerId') offerId: string) {
    return this.carRentalService.getPricingDetails(offerId);
  }

  // ===========================
  // PHASE 4 - LOCAL MOBILITY
  // ===========================

  @Post('mobility/rides/search')
  async searchRides(@Body() dto: any) {
    return this.mobilityService.searchRides({
      pickupLocation: {
        latitude: dto.pickupLatitude,
        longitude: dto.pickupLongitude,
        address: dto.pickupAddress,
      },
      dropoffLocation: {
        latitude: dto.dropoffLatitude,
        longitude: dto.dropoffLongitude,
        address: dto.dropoffAddress,
      },
      requestedTime: dto.requestedTime,
      passengerCount: dto.passengerCount || 1,
      rideTypes: dto.rideTypes,
      preferredProviders: dto.providers,
      specialRequests: dto.specialRequests,
    });
  }

  @Post('mobility/rides/book')
  @HttpCode(HttpStatus.CREATED)
  async bookRide(@Body() dto: any) {
    return this.mobilityService.bookRide(dto.offerId, dto.passenger, dto.paymentMethod);
  }

  @Post('mobility/rides/:bookingId/accept')
  async acceptRide(@Param('bookingId') bookingId: string) {
    return this.mobilityService.acceptRide(bookingId);
  }

  @Post('mobility/rides/:bookingId/start')
  async startRide(@Param('bookingId') bookingId: string) {
    return this.mobilityService.startRide(bookingId);
  }

  @Post('mobility/rides/:bookingId/complete')
  async completeRide(@Param('bookingId') bookingId: string, @Body() dto: any) {
    return this.mobilityService.completeRide(
      bookingId,
      dto.actualFare,
      dto.rating,
      dto.review,
    );
  }

  @Delete('mobility/rides/:bookingId')
  async cancelRide(@Param('bookingId') bookingId: string, @Body() dto: any) {
    return this.mobilityService.cancelRide(bookingId, dto.reason);
  }

  @Get('mobility/airport-transfers')
  async getAirportTransfers(
    @Query('airport') airport: string,
    @Query('destination') destination: string,
    @Query('passengers') passengers: string,
  ) {
    return this.mobilityService.getAirportTransferPackages(airport, destination, parseInt(passengers));
  }

  @Post('mobility/airport-transfer/book')
  async bookAirportTransfer(@Body() dto: any) {
    return this.mobilityService.bookAirportTransfer(
      dto.packageType,
      dto.passenger,
      dto.flightDetails,
    );
  }

  @Post('mobility/shuttles/search')
  async searchShuttles(@Body() dto: any) {
    return this.mobilityService.searchShuttleServices(dto.fromCity, dto.toCity);
  }

  @Post('mobility/shuttles/book')
  async bookShuttle(@Body() dto: any) {
    const booking = await this.mobilityService.bookShuttleService(
      dto.serviceId,
      dto.passenger,
      dto.seatCount || 1,
    );

    // Award loyalty points
    if (dto.userId) {
      const pointsEarned = Math.floor(booking.estimatedFare * 1.1);
      await this.loyaltyService.awardPoints(dto.userId, pointsEarned, 'SHUTTLE_BOOKING');
    }

    return booking;
  }

  @Post('mobility/intercity/search')
  async searchInterCityTransport(@Body() dto: any) {
    return this.mobilityService.searchInterCityTransport(
      dto.fromCity,
      dto.toCity,
      dto.travelDate,
    );
  }

  @Post('mobility/intercity/book')
  async bookInterCityTransport(@Body() dto: any) {
    return this.mobilityService.bookInterCityTransport(
      dto.transportId,
      dto.passenger,
      dto.seatNumber,
    );
  }

  // ===========================
  // HEALTH & STATUS
  // ===========================

  @Get('health')
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        hotels: 'operational',
        tours: 'operational',
        shortlets: 'operational',
        flights: 'operational',
        cars: 'operational',
        mobility: 'operational',
        visa: 'operational',
        insurance: 'operational',
        currency: 'operational',
        ai: 'operational',
        loyalty: 'operational',
      },
    };
  }
}
