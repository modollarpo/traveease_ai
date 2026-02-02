/**
 * Visa & Immigration Service
 * Handles visa requirements checking, application tracking, document verification
 * Integrates with Sherpa° (TripIt), iVisa, embassy APIs
 */

import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export enum VisaType {
  TOURIST = 'tourist',
  BUSINESS = 'business',
  TRANSIT = 'transit',
  STUDENT = 'student',
  WORK = 'work',
  DIPLOMATIC = 'diplomatic',
  MEDICAL = 'medical',
  FAMILY_VISIT = 'family_visit',
}

export enum VisaRequirement {
  VISA_REQUIRED = 'visa_required',
  VISA_FREE = 'visa_free',
  VISA_ON_ARRIVAL = 'visa_on_arrival',
  eVISA = 'evisa',
  eTA = 'eta', // Electronic Travel Authorization (Canada, Australia)
  ESTA = 'esta', // Electronic System for Travel Authorization (USA)
}

export enum VisaApplicationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  ADDITIONAL_DOCS_REQUIRED = 'additional_docs_required',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ISSUED = 'issued',
  EXPIRED = 'expired',
}

export interface VisaRequirementCheckDTO {
  passportCountry: string; // ISO 3166-1 alpha-3
  destinationCountry: string;
  travelPurpose: VisaType;
  stayDuration?: number; // Days
  passportExpiry?: string; // ISO date
}

export interface VisaRequirementResult {
  requirement: VisaRequirement;
  description: string;
  processingTime: {
    min: number; // Days
    max: number;
    average: number;
  };
  cost: {
    amount: bigint; // In minor units
    currency: string;
  };
  validity: {
    singleEntry?: boolean;
    multipleEntry?: boolean;
    maxStayDays?: number;
    validityMonths?: number;
  };
  documentsRequired: VisaDocument[];
  additionalRequirements: string[];
  embassyInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    workingHours: string;
  };
  applicationUrl?: string;
  isFastTrackAvailable: boolean;
  importantNotes: string[];
}

export interface VisaDocument {
  type: 'passport' | 'photo' | 'bank_statement' | 'invitation_letter' | 'employment_letter' | 'flight_itinerary' | 'hotel_booking' | 'insurance' | 'other';
  name: string;
  description: string;
  requirements: string[];
  isMandatory: boolean;
  uploadUrl?: string;
}

export interface VisaApplicationDTO {
  applicantInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: 'M' | 'F' | 'X';
    nationality: string;
    passportNumber: string;
    passportIssueDate: string;
    passportExpiryDate: string;
    birthCity: string;
    birthCountry: string;
    email: string;
    phone: string;
  };
  travelInfo: {
    destinationCountry: string;
    purposeOfVisit: VisaType;
    arrivalDate: string;
    departureDate: string;
    stayAddress?: string;
    invitingPerson?: {
      name: string;
      address: string;
      phone: string;
    };
  };
  employmentInfo?: {
    status: 'employed' | 'self_employed' | 'student' | 'retired' | 'unemployed';
    employer?: string;
    position?: string;
    salary?: number;
  };
  documents: {
    passport: string; // S3 URL
    photo: string;
    bankStatement?: string;
    invitationLetter?: string;
    employmentLetter?: string;
    flightItinerary?: string;
    hotelBooking?: string;
    insurance?: string;
    additional?: Record<string, string>;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface VisaApplication {
  id: string;
  applicationNumber: string;
  status: VisaApplicationStatus;
  applicant: {
    name: string;
    passportNumber: string;
    nationality: string;
  };
  destination: string;
  visaType: VisaType;
  submittedAt?: Date;
  processingDeadline?: Date;
  interviewDate?: Date;
  interviewLocation?: string;
  result?: {
    decision: 'approved' | 'rejected';
    visaNumber?: string;
    issueDate?: Date;
    expiryDate?: Date;
    entryType?: 'single' | 'multiple';
    maxStayDays?: number;
    rejectionReason?: string;
  };
  timeline: {
    date: Date;
    status: VisaApplicationStatus;
    note?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface VaccinationRequirement {
  disease: string;
  vaccineNames: string[];
  isMandatory: boolean;
  requiredDosesBefore: number; // Days before travel
  validityDays?: number;
  certificateRequired: boolean;
  exemptions?: string[];
}

export interface HealthRequirements {
  destinationCountry: string;
  vaccinations: VaccinationRequirement[];
  covidRequirements?: {
    vaccinationRequired: boolean;
    acceptedVaccines?: string[];
    testRequired: boolean;
    testType?: 'PCR' | 'Antigen';
    testTimingHours?: number;
    quarantineRequired: boolean;
    quarantineDays?: number;
  };
  otherHealthRequirements: string[];
  clinicsNearby?: {
    name: string;
    address: string;
    phone: string;
    services: string[];
  }[];
}

@Injectable()
export class VisaImmigrationService {
  private readonly logger = new Logger(VisaImmigrationService.name);

  private readonly sherpaApiKey: string;
  private readonly iVisaApiKey: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.sherpaApiKey = this.configService.get<string>('SHERPA_API_KEY');
    this.iVisaApiKey = this.configService.get<string>('IVISA_API_KEY');
  }

  /**
   * Check visa requirements for specific travel
   */
  async checkVisaRequirements(
    dto: VisaRequirementCheckDTO,
  ): Promise<VisaRequirementResult> {
    this.logger.log(
      `Checking visa requirements: ${dto.passportCountry} → ${dto.destinationCountry}`,
    );

    try {
      // Use Sherpa° API for visa requirements
      const response = await firstValueFrom(
        this.httpService.get('https://requirements-api.sherpa.com/v2/visa', {
          params: {
            origin: dto.passportCountry,
            destination: dto.destinationCountry,
            purpose: dto.travelPurpose,
          },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `ApiKey ${this.sherpaApiKey}`,
          },
        }),
      );

      const visaInfo = response.data;

      const result: VisaRequirementResult = {
        requirement: this.mapVisaRequirement(visaInfo.category),
        description: visaInfo.description,
        processingTime: {
          min: visaInfo.processing_time?.min || 5,
          max: visaInfo.processing_time?.max || 30,
          average: visaInfo.processing_time?.average || 15,
        },
        cost: {
          amount: BigInt(Math.round((visaInfo.fee?.amount || 0) * 100)),
          currency: visaInfo.fee?.currency || 'USD',
        },
        validity: {
          singleEntry: visaInfo.entry_type === 'single',
          multipleEntry: visaInfo.entry_type === 'multiple',
          maxStayDays: visaInfo.max_stay_days,
          validityMonths: visaInfo.validity_months,
        },
        documentsRequired: this.mapDocuments(visaInfo.required_documents || []),
        additionalRequirements: visaInfo.additional_requirements || [],
        embassyInfo: visaInfo.embassy && {
          name: visaInfo.embassy.name,
          address: visaInfo.embassy.address,
          phone: visaInfo.embassy.phone,
          email: visaInfo.embassy.email,
          website: visaInfo.embassy.website,
          workingHours: visaInfo.embassy.working_hours,
        },
        applicationUrl: visaInfo.application_url,
        isFastTrackAvailable: visaInfo.fast_track_available || false,
        importantNotes: visaInfo.important_notes || [],
      };

      // Check passport validity
      if (dto.passportExpiry) {
        const expiryDate = new Date(dto.passportExpiry);
        const travelDate = new Date();
        const monthsUntilExpiry =
          (expiryDate.getTime() - travelDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

        if (monthsUntilExpiry < 6) {
          result.importantNotes.push(
            `⚠️ Your passport expires in ${Math.round(monthsUntilExpiry)} months. Many countries require 6 months validity.`,
          );
        }
      }

      this.logger.log(`Visa requirement: ${result.requirement}`);
      return result;
    } catch (error) {
      this.logger.error(`Visa requirement check failed: ${error.message}`);
      throw new HttpException(
        'Failed to check visa requirements',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Submit visa application
   */
  async submitApplication(dto: VisaApplicationDTO): Promise<VisaApplication> {
    this.logger.log(
      `Submitting visa application: ${dto.applicantInfo.firstName} ${dto.applicantInfo.lastName}`,
    );

    try {
      // Use iVisa API for application submission
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.ivisa.com/v1/applications',
          {
            applicant: dto.applicantInfo,
            travel: dto.travelInfo,
            employment: dto.employmentInfo,
            documents: dto.documents,
          },
          {
            headers: {
              'Authorization': `Bearer ${this.iVisaApiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const applicationData = response.data.application;

      const application: VisaApplication = {
        id: applicationData.id,
        applicationNumber: applicationData.application_number,
        status: VisaApplicationStatus.SUBMITTED,
        applicant: {
          name: `${dto.applicantInfo.firstName} ${dto.applicantInfo.lastName}`,
          passportNumber: dto.applicantInfo.passportNumber,
          nationality: dto.applicantInfo.nationality,
        },
        destination: dto.travelInfo.destinationCountry,
        visaType: dto.travelInfo.purposeOfVisit,
        submittedAt: new Date(),
        processingDeadline: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
        ),
        timeline: [
          {
            date: new Date(),
            status: VisaApplicationStatus.SUBMITTED,
            note: 'Application submitted successfully',
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.logger.log(`Application submitted: ${application.applicationNumber}`);
      return application;
    } catch (error) {
      this.logger.error(`Application submission failed: ${error.message}`);
      throw new HttpException(
        'Application submission failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Track visa application status
   */
  async trackApplication(applicationNumber: string): Promise<VisaApplication> {
    this.logger.log(`Tracking application: ${applicationNumber}`);

    try {
      // TODO: Fetch from database
      // TODO: Check with provider API for updates

      return {
        id: applicationNumber,
        applicationNumber: applicationNumber,
        status: VisaApplicationStatus.UNDER_REVIEW,
        applicant: {
          name: '',
          passportNumber: '',
          nationality: '',
        },
        destination: '',
        visaType: VisaType.TOURIST,
        timeline: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Application tracking failed: ${error.message}`);
      throw new HttpException(
        'Application not found',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * Get health and vaccination requirements
   */
  async getHealthRequirements(
    destinationCountry: string,
    originCountry: string,
  ): Promise<HealthRequirements> {
    this.logger.log(
      `Checking health requirements for ${destinationCountry} from ${originCountry}`,
    );

    try {
      const response = await firstValueFrom(
        this.httpService.get(
          'https://requirements-api.sherpa.com/v2/health',
          {
            params: {
              origin: originCountry,
              destination: destinationCountry,
            },
            headers: {
              'Authorization': `ApiKey ${this.sherpaApiKey}`,
            },
          },
        ),
      );

      const healthData = response.data;

      return {
        destinationCountry,
        vaccinations: healthData.vaccinations?.map((v: any) => ({
          disease: v.disease,
          vaccineNames: v.vaccine_names,
          isMandatory: v.mandatory,
          requiredDosesBefore: v.required_days_before || 10,
          validityDays: v.validity_days,
          certificateRequired: v.certificate_required,
          exemptions: v.exemptions,
        })) || [],
        covidRequirements: healthData.covid && {
          vaccinationRequired: healthData.covid.vaccination_required,
          acceptedVaccines: healthData.covid.accepted_vaccines,
          testRequired: healthData.covid.test_required,
          testType: healthData.covid.test_type,
          testTimingHours: healthData.covid.test_timing_hours,
          quarantineRequired: healthData.covid.quarantine_required,
          quarantineDays: healthData.covid.quarantine_days,
        },
        otherHealthRequirements: healthData.other_requirements || [],
        clinicsNearby: [], // TODO: Integrate with Google Places API
      };
    } catch (error) {
      this.logger.error(`Health requirements check failed: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve health requirements',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Upload visa document
   */
  async uploadDocument(
    applicationId: string,
    documentType: string,
    file: Buffer,
  ): Promise<{ documentUrl: string; verified: boolean }> {
    this.logger.log(`Uploading document: ${documentType} for ${applicationId}`);

    try {
      // TODO: Upload to S3
      // TODO: Run AI document verification (passport MRZ, photo quality check)

      return {
        documentUrl: `https://s3.amazonaws.com/traveease-visa-docs/${applicationId}/${documentType}.pdf`,
        verified: false, // Will be verified by embassy
      };
    } catch (error) {
      this.logger.error(`Document upload failed: ${error.message}`);
      throw new HttpException(
        'Document upload failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get nearby visa application centers
   */
  async getVisaApplicationCenters(
    country: string,
    city: string,
  ): Promise<any[]> {
    this.logger.log(`Finding visa centers in ${city}, ${country}`);

    try {
      // TODO: Integrate with Google Places API
      // TODO: Filter for visa application centers, embassies, consulates

      return [
        {
          name: 'VFS Global Visa Application Centre',
          address: '123 Main Street',
          city: city,
          country: country,
          phone: '+1-234-567-8900',
          services: ['Biometric collection', 'Document submission', 'Visa interview'],
          workingHours: 'Mon-Fri 9:00-17:00',
          appointmentRequired: true,
          bookingUrl: 'https://www.vfsglobal.com',
        },
      ];
    } catch (error) {
      this.logger.error(`Visa center search failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Map visa requirement category
   */
  private mapVisaRequirement(category: string): VisaRequirement {
    const categoryMap: Record<string, VisaRequirement> = {
      'visa_required': VisaRequirement.VISA_REQUIRED,
      'visa_free': VisaRequirement.VISA_FREE,
      'visa_on_arrival': VisaRequirement.VISA_ON_ARRIVAL,
      'evisa': VisaRequirement.eVISA,
      'eta': VisaRequirement.eTA,
      'esta': VisaRequirement.ESTA,
    };
    return categoryMap[category?.toLowerCase()] || VisaRequirement.VISA_REQUIRED;
  }

  /**
   * Map required documents
   */
  private mapDocuments(documents: any[]): VisaDocument[] {
    return documents.map((doc) => ({
      type: doc.type || 'other',
      name: doc.name,
      description: doc.description,
      requirements: doc.requirements || [],
      isMandatory: doc.mandatory !== false,
    }));
  }
}
