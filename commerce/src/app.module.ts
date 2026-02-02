import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

// Modules
import { PaymentsModule } from './payments/payments.module';
import { BookingsModule } from './bookings/bookings.module';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // HTTP client for external APIs
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 3,
    }),
    
    // Feature modules
    PaymentsModule,
    BookingsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
