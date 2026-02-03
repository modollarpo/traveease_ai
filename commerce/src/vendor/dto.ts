import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsIn, IsISO31661Alpha2 } from 'class-validator';

// DTOs for vendor offers and CSV operations

export class CreateVendorOfferDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  category: string; // e.g. TOUR / TRANSFER / EXPERIENCE

  @IsISO31661Alpha2()
  countryCode: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsOptional()
  @IsNumber()
  meetingPointLat?: number;

  @IsOptional()
  @IsNumber()
  meetingPointLng?: number;

  // Price in minor units (e.g. 250000 for NGN 2,500.00)
  @IsInt()
  priceMinor: number;

  @IsString()
  @IsNotEmpty()
  currency: string; // ISO 4217

  @IsString()
  @IsNotEmpty()
  language: string; // e.g. en, pt, fr

  @IsOptional()
  @IsInt()
  durationMinutes?: number;

  @IsOptional()
  @IsInt()
  capacity?: number;

  @IsOptional()
  @IsString()
  availableFrom?: string; // ISO date or datetime

  @IsOptional()
  @IsString()
  availableTo?: string; // ISO date or datetime

  @IsOptional()
  @IsString()
  daysOfWeek?: string; // MON,TUE,WED

  @IsOptional()
  @IsString()
  images?: string; // semicolon-separated URLs

  @IsOptional()
  @IsString()
  @IsIn(['ACTIVE', 'DRAFT', 'INACTIVE'])
  status?: string;

  @IsOptional()
  @IsString()
  externalId?: string;
}

export class UpdateVendorOfferDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsISO31661Alpha2()
  countryCode?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsNumber()
  meetingPointLat?: number;

  @IsOptional()
  @IsNumber()
  meetingPointLng?: number;

  @IsOptional()
  @IsInt()
  priceMinor?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsInt()
  durationMinutes?: number;

  @IsOptional()
  @IsInt()
  capacity?: number;

  @IsOptional()
  @IsString()
  availableFrom?: string;

  @IsOptional()
  @IsString()
  availableTo?: string;

  @IsOptional()
  @IsString()
  daysOfWeek?: string;

  @IsOptional()
  @IsString()
  images?: string;

  @IsOptional()
  @IsString()
  @IsIn(['ACTIVE', 'DRAFT', 'INACTIVE'])
  status?: string;

  @IsOptional()
  @IsString()
  externalId?: string;
}

export class VendorOfferFilterDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  countryCode?: string;
}

// Public traveler-facing search DTO
export class PublicOfferSearchDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  countryCode?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsInt()
  minPriceMinor?: number;

  @IsOptional()
  @IsInt()
  maxPriceMinor?: number;

  @IsOptional()
  @IsString()
  language?: string;
}

export interface CsvImportSummary {
  jobId: string;
  totalRows: number;
  createdCount: number;
  updatedCount: number;
  errorCount: number;
}
