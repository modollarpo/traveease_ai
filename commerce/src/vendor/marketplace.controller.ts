import { Controller, Get, Query } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { PublicOfferSearchDto } from './dto';

// Public traveler / AI marketplace entrypoints

@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly vendorService: VendorService) {}

  @Get('offers')
  async searchOffers(@Query() query: PublicOfferSearchDto) {
    return this.vendorService.searchPublicOffers(query);
  }
}
