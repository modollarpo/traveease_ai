import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateVendorOfferDto, UpdateVendorOfferDto, VendorOfferFilterDto, CsvImportSummary, PublicOfferSearchDto } from './dto';

@Injectable()
export class VendorService {
  constructor(private readonly prisma: PrismaService) {}

  async listOffers(vendorId: string, filters: VendorOfferFilterDto = {}) {
    return this.prisma.vendorOffer.findMany({
      where: {
        vendorId,
        status: filters.status,
        city: filters.city,
        countryCode: filters.countryCode,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createOffer(vendorId: string, dto: CreateVendorOfferDto) {
    const priceMinorBigInt = BigInt(dto.priceMinor);

    const availableFrom = dto.availableFrom ? new Date(dto.availableFrom) : undefined;
    const availableTo = dto.availableTo ? new Date(dto.availableTo) : undefined;

    return this.prisma.vendorOffer.create({
      data: {
        vendorId,
        externalId: dto.externalId || null,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        countryCode: dto.countryCode,
        city: dto.city,
        meetingPointLat: dto.meetingPointLat ?? null,
        meetingPointLng: dto.meetingPointLng ?? null,
        priceMinor: priceMinorBigInt,
        currency: dto.currency,
        language: dto.language,
        durationMinutes: dto.durationMinutes ?? null,
        capacity: dto.capacity ?? null,
        availableFrom,
        availableTo,
        daysOfWeek: dto.daysOfWeek ?? null,
        images: dto.images ?? null,
        status: dto.status || 'DRAFT',
      },
    });
  }

  async updateOffer(vendorId: string, id: string, dto: UpdateVendorOfferDto) {
    const existing = await this.prisma.vendorOffer.findFirst({
      where: { id, vendorId },
    });

    if (!existing) {
      throw new NotFoundException('Offer not found for this vendor');
    }

    const data: any = { ...dto };

    if (dto.priceMinor !== undefined) {
      data.priceMinor = BigInt(dto.priceMinor);
    }

    if (dto.availableFrom !== undefined) {
      data.availableFrom = dto.availableFrom ? new Date(dto.availableFrom) : null;
    }

    if (dto.availableTo !== undefined) {
      data.availableTo = dto.availableTo ? new Date(dto.availableTo) : null;
    }

    return this.prisma.vendorOffer.update({
      where: { id },
      data,
    });
  }

  async softDeleteOffer(vendorId: string, id: string) {
    const existing = await this.prisma.vendorOffer.findFirst({
      where: { id, vendorId },
    });

    if (!existing) {
      throw new NotFoundException('Offer not found for this vendor');
    }

    return this.prisma.vendorOffer.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }

  async importCsv(vendorId: string, fileBuffer: Buffer): Promise<CsvImportSummary> {
    if (!fileBuffer?.length) {
      throw new BadRequestException('CSV file is required');
    }

    const text = fileBuffer.toString('utf8');
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);

    if (lines.length < 2) {
      throw new BadRequestException('CSV must contain a header row and at least one data row');
    }

    const header = lines[0].split(',').map((h) => h.trim());

    const requiredHeaders = [
      'title',
      'description',
      'category',
      'country_code',
      'city',
      'price_minor',
      'currency',
      'language',
    ];

    for (const h of requiredHeaders) {
      if (!header.includes(h)) {
        throw new BadRequestException(`Missing required CSV column: ${h}`);
      }
    }

    const index = (name: string) => header.indexOf(name);

    const job = await this.prisma.vendorOfferImportJob.create({
      data: {
        vendorId,
        fileName: 'upload.csv',
        status: 'PROCESSING',
      },
    });

    let totalRows = 0;
    let createdCount = 0;
    let updatedCount = 0;
    const errors: { row: number; message: string }[] = [];

    for (let i = 1; i < lines.length; i++) {
      const rowNumber = i + 1; // 1-based with header
      const raw = lines[i];

      if (!raw.trim()) continue;

      totalRows++;
      const cols = raw.split(',');

      try {
        const get = (name: string) => {
          const idx = index(name);
          return idx >= 0 ? cols[idx]?.trim() : undefined;
        };

        const externalId = get('external_id');
        const title = get('title') ?? '';
        const description = get('description') ?? '';
        const category = get('category') ?? '';
        const countryCode = (get('country_code') ?? '').toUpperCase();
        const city = get('city') ?? '';
        const meetingPointLat = get('meeting_point_lat');
        const meetingPointLng = get('meeting_point_lng');
        const priceMinorStr = get('price_minor') ?? '0';
        const currency = (get('currency') ?? '').toUpperCase();
        const language = get('language') ?? 'en';
        const durationMinutes = get('duration_minutes');
        const capacity = get('capacity');
        const availableFrom = get('available_from');
        const availableTo = get('available_to');
        const daysOfWeek = get('days_of_week');
        const images = get('images');
        const status = get('status') || 'DRAFT';

        if (!title || !description || !category || !countryCode || !city) {
          throw new Error('Missing required fields');
        }

        const priceMinor = BigInt(parseInt(priceMinorStr, 10));

        const commonData: any = {
          vendorId,
          title,
          description,
          category,
          countryCode,
          city,
          meetingPointLat: meetingPointLat ? Number(meetingPointLat) : null,
          meetingPointLng: meetingPointLng ? Number(meetingPointLng) : null,
          priceMinor,
          currency,
          language,
          durationMinutes: durationMinutes ? parseInt(durationMinutes, 10) : null,
          capacity: capacity ? parseInt(capacity, 10) : null,
          availableFrom: availableFrom ? new Date(availableFrom) : null,
          availableTo: availableTo ? new Date(availableTo) : null,
          daysOfWeek: daysOfWeek || null,
          images: images || null,
          status,
        };

        if (externalId) {
          const existing = await this.prisma.vendorOffer.findFirst({
            where: { vendorId, externalId },
          });

          if (existing) {
            await this.prisma.vendorOffer.update({
              where: { id: existing.id },
              data: commonData,
            });
            updatedCount++;
          } else {
            await this.prisma.vendorOffer.create({
              data: {
                ...commonData,
                externalId,
              },
            });
            createdCount++;
          }
        } else {
          await this.prisma.vendorOffer.create({
            data: commonData,
          });
          createdCount++;
        }
      } catch (err: any) {
        errors.push({ row: rowNumber, message: err.message || 'Unknown error' });
      }
    }

    const summary: CsvImportSummary = {
      jobId: job.id,
      totalRows,
      createdCount,
      updatedCount,
      errorCount: errors.length,
    };

    await this.prisma.vendorOfferImportJob.update({
      where: { id: job.id },
      data: {
        status: errors.length ? 'COMPLETED' : 'COMPLETED',
        totalRows,
        createdCount,
        updatedCount,
        errorCount: errors.length,
        errorReportJson: errors.length ? JSON.stringify(errors) : null,
      },
    });

    return summary;
  }

  async listImportJobs(vendorId: string) {
    return this.prisma.vendorOfferImportJob.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getImportJob(vendorId: string, id: string) {
    const job = await this.prisma.vendorOfferImportJob.findFirst({
      where: { id, vendorId },
    });

    if (!job) {
      throw new NotFoundException('Import job not found for this vendor');
    }

    return job;
  }

  async exportCsv(vendorId: string, filters: VendorOfferFilterDto = {}): Promise<string> {
    const offers = await this.prisma.vendorOffer.findMany({
      where: {
        vendorId,
        status: filters.status,
        city: filters.city,
        countryCode: filters.countryCode,
      },
      orderBy: { createdAt: 'desc' },
    });

    const headers = [
      'external_id',
      'title',
      'description',
      'category',
      'country_code',
      'city',
      'meeting_point_lat',
      'meeting_point_lng',
      'price_minor',
      'currency',
      'language',
      'duration_minutes',
      'capacity',
      'available_from',
      'available_to',
      'days_of_week',
      'images',
      'status',
    ];

    const rows: string[] = [];
    rows.push(headers.join(','));

    for (const o of offers) {
      const cols = [
        o.externalId ?? '',
        o.title ?? '',
        (o.description || '').replace(/\r?\n/g, ' '),
        o.category ?? '',
        o.countryCode ?? '',
        o.city ?? '',
        o.meetingPointLat != null ? String(o.meetingPointLat) : '',
        o.meetingPointLng != null ? String(o.meetingPointLng) : '',
        o.priceMinor != null ? o.priceMinor.toString() : '0',
        o.currency ?? '',
        o.language ?? '',
        o.durationMinutes != null ? String(o.durationMinutes) : '',
        o.capacity != null ? String(o.capacity) : '',
        o.availableFrom ? o.availableFrom.toISOString() : '',
        o.availableTo ? o.availableTo.toISOString() : '',
        o.daysOfWeek ?? '',
        o.images ?? '',
        o.status ?? '',
      ];

      rows.push(cols.map((c) => (c?.includes(',') ? `"${c.replace(/"/g, '""')}"` : c)).join(','));
    }

    return rows.join('\n');
  }

  // Traveler / AI-facing public search over ACTIVE offers
  async searchPublicOffers(filters: PublicOfferSearchDto) {
    const where: any = {
      status: 'ACTIVE',
    };

    if (filters.countryCode) {
      where.countryCode = filters.countryCode.toUpperCase();
    }

    if (filters.city) {
      where.city = filters.city;
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.language) {
      where.language = filters.language;
    }

    if (filters.minPriceMinor != null || filters.maxPriceMinor != null) {
      where.priceMinor = {};
      if (filters.minPriceMinor != null) {
        where.priceMinor.gte = BigInt(filters.minPriceMinor);
      }
      if (filters.maxPriceMinor != null) {
        where.priceMinor.lte = BigInt(filters.maxPriceMinor);
      }
    }

    return this.prisma.vendorOffer.findMany({
      where,
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            countryCode: true,
            city: true,
            reliabilityScore: true,
          },
        },
      },
      orderBy: [
        { vendor: { reliabilityScore: 'desc' } },
        { priceMinor: 'asc' },
      ],
      take: 100,
    });
  }
}
