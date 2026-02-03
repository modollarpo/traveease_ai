import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { VendorController } from './vendor.controller';
import { VendorService } from './vendor.service';
import { PrismaService } from '../prisma.service';
import { MarketplaceController } from './marketplace.controller';

@Module({
  imports: [
    MulterModule.register({}),
  ],
  controllers: [VendorController, MarketplaceController],
  providers: [VendorService, PrismaService],
  exports: [VendorService],
})
export class VendorModule {}
