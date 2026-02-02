import { Injectable } from '@nestjs/common';

@Injectable()
export class NigerianComplianceService {
  /**
   * Calculate CBN Stamp Duty: ₦50 on transactions over ₦10,000
   */
  calculateStampDuty(amountInMinorUnits: number, currency: string): number {
    if (currency !== 'NGN') return 0;
    const amountInNaira = amountInMinorUnits / 100;
    if (amountInNaira > 10000) {
      return 5000; // ₦50 in kobo (minor units)
    }
    return 0;
  }

  /**
   * Calculate VAT: 7.5% on platform commission
   */
  calculateVAT(platformCommissionInMinorUnits: number): number {
    return Math.floor(platformCommissionInMinorUnits * 0.075);
  }

  /**
   * Calculate total transaction with compliance fees
   */
  calculateTotalWithCompliance(params: {
    basePrice: number;
    platformCommissionPercent: number;
    currency: string;
  }): {
    basePrice: number;
    platformCommission: number;
    stampDuty: number;
    vat: number;
    total: number;
  } {
    const commission = Math.floor(
      (params.basePrice * params.platformCommissionPercent) / 100
    );
    const stampDuty = this.calculateStampDuty(params.basePrice, params.currency);
    const vat = this.calculateVAT(commission);

    return {
      basePrice: params.basePrice,
      platformCommission: commission,
      stampDuty,
      vat,
      total: params.basePrice + commission + stampDuty + vat,
    };
  }
}
