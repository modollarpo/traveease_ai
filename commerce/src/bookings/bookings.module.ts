import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

// Services
import { HotelBookingService } from './services/hotel-booking.service';
import { ToursExperiencesService } from './services/tours-experiences.service';
import { ShortletsService } from './services/shortlets.service';
import { VisaImmigrationService } from './services/visa-immigration.service';
import { TravelInsuranceService } from './services/travel-insurance.service';
import { CurrencyExchangeService } from './services/currency-exchange.service';
import { AIConciergeService } from './services/ai-concierge.service';
import { LoyaltyRewardsService } from './services/loyalty-rewards.service';
import { FlightBookingService } from './services/flight-booking.service';
import { CarRentalService } from './services/car-rental.service';
import { LocalMobilityService } from './services/local-mobility.service';

// Controllers
import { BookingController } from './controllers/booking.controller';

// Import PaymentsModule for payment integration
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000, // 30 seconds
      maxRedirects: 3,
    }),
    ConfigModule,
    PaymentsModule, // For payment processing integration
  ],
  controllers: [BookingController],
  providers: [
    // Core booking services
    HotelBookingService,
    ToursExperiencesService,
    ShortletsService,
    
    // Phase 4 - Transportation & Mobility
    FlightBookingService,
    CarRentalService,
    LocalMobilityService,
    
    // Value-added services
    VisaImmigrationService,
    TravelInsuranceService,
    CurrencyExchangeService,
    AIConciergeService,
    LoyaltyRewardsService,
  ],
  exports: [
    // Core booking services
    HotelBookingService,
    ToursExperiencesService,
    ShortletsService,
    
    // Phase 4 - Transportation & Mobility
    FlightBookingService,
    CarRentalService,
    LocalMobilityService,
    
    // Value-added services
    VisaImmigrationService,
    TravelInsuranceService,
    CurrencyExchangeService,
    AIConciergeService,
    LoyaltyRewardsService,
  ],
})
export class BookingsModule {}
