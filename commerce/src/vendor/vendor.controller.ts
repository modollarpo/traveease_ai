import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { VendorService } from './vendor.service';
import { CreateVendorOfferDto, UpdateVendorOfferDto, VendorOfferFilterDto } from './dto';

@Controller('vendor')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  private getVendorId(headers: Record<string, any>): string {
    const vendorId = headers['x-vendor-id'] || headers['X-Vendor-Id'];
    if (!vendorId || typeof vendorId !== 'string') {
      throw new BadRequestException('x-vendor-id header is required');
    }
    return vendorId;
  }

  @Get('offers')
  async listOffers(
    @Headers() headers: Record<string, any>,
    @Query() filters: VendorOfferFilterDto,
  ) {
    const vendorId = this.getVendorId(headers);
    return this.vendorService.listOffers(vendorId, filters);
  }

  @Post('offers')
  async createOffer(
    @Headers() headers: Record<string, any>,
    @Body() dto: CreateVendorOfferDto,
  ) {
    const vendorId = this.getVendorId(headers);
    return this.vendorService.createOffer(vendorId, dto);
  }

  @Patch('offers/:id')
  async updateOffer(
    @Headers() headers: Record<string, any>,
    @Param('id') id: string,
    @Body() dto: UpdateVendorOfferDto,
  ) {
    const vendorId = this.getVendorId(headers);
    return this.vendorService.updateOffer(vendorId, id, dto);
  }

  @Delete('offers/:id')
  async deleteOffer(
    @Headers() headers: Record<string, any>,
    @Param('id') id: string,
  ) {
    const vendorId = this.getVendorId(headers);
    return this.vendorService.softDeleteOffer(vendorId, id);
  }

  @Post('offers/import-csv')
  @UseInterceptors(FileInterceptor('file'))
  async importOffersCsv(
    @Headers() headers: Record<string, any>,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const vendorId = this.getVendorId(headers);
    if (!file) {
      throw new BadRequestException('CSV file is required');
    }

    return this.vendorService.importCsv(vendorId, file.buffer);
  }

  @Get('offers/export-csv')
  async exportOffersCsv(
    @Headers() headers: Record<string, any>,
    @Query() filters: VendorOfferFilterDto,
    @Res() res: Response,
  ) {
    const vendorId = this.getVendorId(headers);
    const csv = await this.vendorService.exportCsv(vendorId, filters);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="vendor-offers.csv"');
    return res.send(csv);
  }

  @Get('offers/import-jobs')
  async listImportJobs(@Headers() headers: Record<string, any>) {
    const vendorId = this.getVendorId(headers);
    return this.vendorService.listImportJobs(vendorId);
  }

  @Get('offers/import-jobs/:id')
  async getImportJob(
    @Headers() headers: Record<string, any>,
    @Param('id') id: string,
  ) {
    const vendorId = this.getVendorId(headers);
    return this.vendorService.getImportJob(vendorId, id);
  }
}
