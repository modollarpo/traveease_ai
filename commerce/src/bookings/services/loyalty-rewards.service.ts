/**
 * Loyalty & Rewards Service
 * Points accumulation, tier management, redemption, partner rewards
 * Integrates with airline FFPs, hotel programs, credit card rewards
 */

import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export enum LoyaltyTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond',
}

export enum PointsSource {
  BOOKING = 'booking',
  REFERRAL = 'referral',
  REVIEW = 'review',
  SIGNUP_BONUS = 'signup_bonus',
  PARTNER_TRANSFER = 'partner_transfer',
  PROMOTION = 'promotion',
  MILESTONE = 'milestone',
}

export enum RewardType {
  FLIGHT_DISCOUNT = 'flight_discount',
  HOTEL_NIGHT = 'hotel_night',
  UPGRADE = 'upgrade',
  LOUNGE_ACCESS = 'lounge_access',
  CASHBACK = 'cashback',
  EXPERIENCE = 'experience',
  GIFT_CARD = 'gift_card',
  DONATION = 'donation',
}

export interface LoyaltyAccount {
  userId: string;
  memberId: string;
  tier: LoyaltyTier;
  points: {
    balance: number;
    lifetime: number;
    expiring: {
      points: number;
      expiryDate: Date;
    }[];
  };
  tierProgress: {
    currentTier: LoyaltyTier;
    nextTier?: LoyaltyTier;
    pointsToNextTier?: number;
    spendToNextTier?: bigint;
    tierExpiryDate?: Date;
  };
  benefits: {
    name: string;
    description: string;
    unlocked: boolean;
  }[];
  partnerAccounts: {
    partner: string;
    accountNumber: string;
    points: number;
  }[];
  createdAt: Date;
  lastActivityAt: Date;
}

export interface PointsTransaction {
  id: string;
  userId: string;
  type: 'earn' | 'redeem' | 'expire' | 'transfer';
  source: PointsSource;
  points: number;
  description: string;
  bookingId?: string;
  balance: number; // Balance after transaction
  createdAt: Date;
}

export interface RewardCatalogItem {
  id: string;
  type: RewardType;
  name: string;
  description: string;
  pointsCost: number;
  cashEquivalent: bigint;
  availability: 'always' | 'limited' | 'seasonal';
  stock?: number;
  restrictions?: string[];
  imageUrl?: string;
  validUntil?: Date;
}

export interface RedemptionRequest {
  userId: string;
  rewardId: string;
  quantity?: number;
  beneficiary?: {
    name: string;
    email: string;
  };
}

export interface Redemption {
  id: string;
  userId: string;
  reward: {
    name: string;
    type: RewardType;
  };
  pointsRedeemed: number;
  status: 'pending' | 'approved' | 'issued' | 'redeemed' | 'expired' | 'cancelled';
  code?: string; // Voucher code
  issuedAt?: Date;
  expiresAt?: Date;
  redeemedAt?: Date;
  createdAt: Date;
}

export interface ReferralProgram {
  userId: string;
  referralCode: string;
  referrals: {
    referredUserId: string;
    referredEmail: string;
    status: 'pending' | 'completed';
    pointsEarned: number;
    referredAt: Date;
    completedAt?: Date;
  }[];
  totalReferrals: number;
  totalPointsEarned: number;
}

@Injectable()
export class LoyaltyRewardsService {
  private readonly logger = new Logger(LoyaltyRewardsService.name);

  // Tier benefits
  private readonly TIER_BENEFITS = {
    [LoyaltyTier.BRONZE]: {
      pointsMultiplier: 1.0,
      benefits: ['Earn 1 point per $1', 'Birthday bonus', 'Email support'],
      thresholdPoints: 0,
    },
    [LoyaltyTier.SILVER]: {
      pointsMultiplier: 1.25,
      benefits: ['Earn 1.25x points', 'Priority support', '5% booking discount', 'Free cancellation'],
      thresholdPoints: 5000,
    },
    [LoyaltyTier.GOLD]: {
      pointsMultiplier: 1.5,
      benefits: ['Earn 1.5x points', '10% discount', 'Room upgrades', 'Late checkout', 'Lounge access'],
      thresholdPoints: 15000,
    },
    [LoyaltyTier.PLATINUM]: {
      pointsMultiplier: 2.0,
      benefits: ['Earn 2x points', '15% discount', 'Suite upgrades', 'Dedicated concierge', 'Annual gift'],
      thresholdPoints: 50000,
    },
    [LoyaltyTier.DIAMOND]: {
      pointsMultiplier: 3.0,
      benefits: ['Earn 3x points', '20% discount', 'Guaranteed upgrades', 'VIP concierge', 'Exclusive experiences'],
      thresholdPoints: 100000,
    },
  };

  constructor(private configService: ConfigService) {}

  /**
   * Get user's loyalty account
   */
  async getAccount(userId: string): Promise<LoyaltyAccount> {
    this.logger.log(`Getting loyalty account for user: ${userId}`);

    try {
      // TODO: Fetch from database

      const mockAccount: LoyaltyAccount = {
        userId,
        memberId: `TE${userId.substring(0, 8).toUpperCase()}`,
        tier: LoyaltyTier.GOLD,
        points: {
          balance: 25000,
          lifetime: 35000,
          expiring: [
            { points: 5000, expiryDate: new Date('2026-06-30') },
          ],
        },
        tierProgress: {
          currentTier: LoyaltyTier.GOLD,
          nextTier: LoyaltyTier.PLATINUM,
          pointsToNextTier: 25000,
          spendToNextTier: BigInt(2500000), // $25,000 in cents
          tierExpiryDate: new Date('2026-12-31'),
        },
        benefits: [
          { name: 'Priority Support', description: '24/7 dedicated support line', unlocked: true },
          { name: 'Room Upgrades', description: 'Subject to availability', unlocked: true },
          { name: 'Late Checkout', description: 'Until 2 PM', unlocked: true },
          { name: 'Lounge Access', description: 'Airport lounges worldwide', unlocked: true },
        ],
        partnerAccounts: [
          { partner: 'Delta SkyMiles', accountNumber: 'DL123456789', points: 50000 },
          { partner: 'Marriott Bonvoy', accountNumber: 'MB987654321', points: 75000 },
        ],
        createdAt: new Date('2024-01-15'),
        lastActivityAt: new Date(),
      };

      return mockAccount;
    } catch (error) {
      this.logger.error(`Failed to get loyalty account: ${error.message}`);
      throw new HttpException('Account not found', HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Award points for booking
   */
  async awardPoints(
    userId: string,
    source: PointsSource,
    amount: number,
    description: string,
    bookingId?: string,
  ): Promise<PointsTransaction> {
    this.logger.log(`Awarding ${amount} points to user ${userId}`);

    try {
      // Get user tier to apply multiplier
      const account = await this.getAccount(userId);
      const tierConfig = this.TIER_BENEFITS[account.tier];
      const multipliedPoints = Math.round(amount * tierConfig.pointsMultiplier);

      const transaction: PointsTransaction = {
        id: `pts_${Date.now()}`,
        userId,
        type: 'earn',
        source,
        points: multipliedPoints,
        description,
        bookingId,
        balance: account.points.balance + multipliedPoints,
        createdAt: new Date(),
      };

      // TODO: Save to database
      // TODO: Check if user qualified for tier upgrade
      // TODO: Send notification

      this.logger.log(`Awarded ${multipliedPoints} points (${tierConfig.pointsMultiplier}x multiplier)`);
      return transaction;
    } catch (error) {
      this.logger.error(`Failed to award points: ${error.message}`);
      throw new HttpException(
        'Points award failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Calculate points for booking
   */
  calculateBookingPoints(bookingAmount: bigint, bookingType: string): number {
    const amountInDollars = Number(bookingAmount) / 100;

    // Base: 1 point per $1
    let points = Math.floor(amountInDollars);

    // Bonus points by booking type
    const bonusMultipliers: Record<string, number> = {
      flight: 1.5, // 1.5x for flights
      hotel: 2.0, // 2x for hotels
      package: 2.5, // 2.5x for packages
      tour: 1.2, // 1.2x for tours
    };

    const multiplier = bonusMultipliers[bookingType] || 1.0;
    points = Math.floor(points * multiplier);

    return points;
  }

  /**
   * Get reward catalog
   */
  async getRewardCatalog(
    tier?: LoyaltyTier,
    category?: RewardType,
  ): Promise<RewardCatalogItem[]> {
    this.logger.log(`Getting reward catalog (tier: ${tier}, category: ${category})`);

    // TODO: Fetch from database with filters

    const catalog: RewardCatalogItem[] = [
      {
        id: 'rwd_flight_25',
        type: RewardType.FLIGHT_DISCOUNT,
        name: '$25 Flight Discount',
        description: 'Apply $25 off any flight booking',
        pointsCost: 2500,
        cashEquivalent: BigInt(2500),
        availability: 'always',
      },
      {
        id: 'rwd_hotel_night',
        type: RewardType.HOTEL_NIGHT,
        name: 'Free Hotel Night',
        description: 'One free night at participating hotels',
        pointsCost: 10000,
        cashEquivalent: BigInt(15000),
        availability: 'always',
      },
      {
        id: 'rwd_upgrade',
        type: RewardType.UPGRADE,
        name: 'Flight Upgrade Certificate',
        description: 'Upgrade to business class',
        pointsCost: 25000,
        cashEquivalent: BigInt(50000),
        availability: 'limited',
        stock: 50,
      },
      {
        id: 'rwd_lounge',
        type: RewardType.LOUNGE_ACCESS,
        name: 'Airport Lounge Pass (2 visits)',
        description: 'Access to Priority Pass lounges',
        pointsCost: 5000,
        cashEquivalent: BigInt(6000),
        availability: 'always',
      },
      {
        id: 'rwd_cashback_100',
        type: RewardType.CASHBACK,
        name: '$100 Cashback',
        description: 'Direct deposit to your account',
        pointsCost: 12000,
        cashEquivalent: BigInt(10000),
        availability: 'always',
      },
    ];

    // Filter by category
    if (category) {
      return catalog.filter((item) => item.type === category);
    }

    return catalog;
  }

  /**
   * Redeem reward
   */
  async redeemReward(request: RedemptionRequest): Promise<Redemption> {
    this.logger.log(`Redeeming reward: ${request.rewardId} for user ${request.userId}`);

    try {
      // Get reward details
      const catalog = await this.getRewardCatalog();
      const reward = catalog.find((r) => r.id === request.rewardId);

      if (!reward) {
        throw new HttpException('Reward not found', HttpStatus.NOT_FOUND);
      }

      // Check user has enough points
      const account = await this.getAccount(request.userId);
      if (account.points.balance < reward.pointsCost) {
        throw new HttpException('Insufficient points', HttpStatus.BAD_REQUEST);
      }

      // Deduct points
      const transaction = await this.deductPoints(
        request.userId,
        reward.pointsCost,
        `Redeemed: ${reward.name}`,
      );

      // Create redemption
      const redemption: Redemption = {
        id: `red_${Date.now()}`,
        userId: request.userId,
        reward: {
          name: reward.name,
          type: reward.type,
        },
        pointsRedeemed: reward.pointsCost,
        status: 'approved',
        code: this.generateVoucherCode(),
        issuedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        createdAt: new Date(),
      };

      // TODO: Save to database
      // TODO: Send voucher via email
      // TODO: Integrate with booking system to auto-apply discounts

      this.logger.log(`Reward redeemed: ${redemption.code}`);
      return redemption;
    } catch (error) {
      this.logger.error(`Redemption failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Transfer points to partner program
   */
  async transferToPartner(
    userId: string,
    partnerProgram: string,
    points: number,
    partnerAccountNumber: string,
  ): Promise<{ transferId: string; partnerPoints: number }> {
    this.logger.log(
      `Transferring ${points} points to ${partnerProgram} for user ${userId}`,
    );

    try {
      // Check balance
      const account = await this.getAccount(userId);
      if (account.points.balance < points) {
        throw new HttpException('Insufficient points', HttpStatus.BAD_REQUEST);
      }

      // Transfer ratios to partner programs
      const transferRatios: Record<string, number> = {
        'Delta SkyMiles': 1.0, // 1:1
        'Marriott Bonvoy': 1.2, // 1:1.2
        'Hilton Honors': 1.5, // 1:1.5
        'American Airlines': 1.0,
      };

      const ratio = transferRatios[partnerProgram] || 1.0;
      const partnerPoints = Math.floor(points * ratio);

      // Deduct points
      await this.deductPoints(userId, points, `Transfer to ${partnerProgram}`);

      // TODO: Call partner API to credit points
      // TODO: Save transfer record

      this.logger.log(`Transferred ${points} → ${partnerPoints} ${partnerProgram} points`);
      return {
        transferId: `xfer_${Date.now()}`,
        partnerPoints,
      };
    } catch (error) {
      this.logger.error(`Transfer failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get referral program details
   */
  async getReferralProgram(userId: string): Promise<ReferralProgram> {
    this.logger.log(`Getting referral program for user: ${userId}`);

    try {
      // TODO: Fetch from database

      return {
        userId,
        referralCode: this.generateReferralCode(userId),
        referrals: [
          {
            referredUserId: 'user_123',
            referredEmail: 'friend@example.com',
            status: 'completed',
            pointsEarned: 5000,
            referredAt: new Date('2025-12-01'),
            completedAt: new Date('2025-12-15'),
          },
        ],
        totalReferrals: 1,
        totalPointsEarned: 5000,
      };
    } catch (error) {
      this.logger.error(`Failed to get referral program: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process referral signup
   */
  async processReferral(
    referralCode: string,
    newUserId: string,
  ): Promise<{ referrerBonus: number; refereeBonus: number }> {
    this.logger.log(`Processing referral: ${referralCode} → ${newUserId}`);

    try {
      // TODO: Validate referral code
      // TODO: Check if new user already used a referral
      // TODO: Award bonus points to both users

      const referrerBonus = 5000; // 5,000 points
      const refereeBonus = 2500; // 2,500 points (welcome bonus)

      // Award points to referrer
      // await this.awardPoints(referrerId, PointsSource.REFERRAL, referrerBonus, 'Referral bonus');

      // Award points to referee
      await this.awardPoints(
        newUserId,
        PointsSource.SIGNUP_BONUS,
        refereeBonus,
        'Welcome bonus',
      );

      return { referrerBonus, refereeBonus };
    } catch (error) {
      this.logger.error(`Referral processing failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check for tier upgrade
   */
  async checkTierUpgrade(userId: string): Promise<{
    upgraded: boolean;
    newTier?: LoyaltyTier;
    benefits?: string[];
  }> {
    this.logger.log(`Checking tier upgrade for user: ${userId}`);

    try {
      const account = await this.getAccount(userId);
      const currentPoints = account.points.lifetime;

      // Find eligible tier
      let newTier: LoyaltyTier | undefined;

      const tiers = [
        LoyaltyTier.DIAMOND,
        LoyaltyTier.PLATINUM,
        LoyaltyTier.GOLD,
        LoyaltyTier.SILVER,
        LoyaltyTier.BRONZE,
      ];

      for (const tier of tiers) {
        const tierConfig = this.TIER_BENEFITS[tier];
        if (currentPoints >= tierConfig.thresholdPoints) {
          newTier = tier;
          break;
        }
      }

      if (newTier && newTier !== account.tier) {
        // Upgrade!
        const newTierConfig = this.TIER_BENEFITS[newTier];

        // TODO: Update tier in database
        // TODO: Send congratulations email

        this.logger.log(`User upgraded: ${account.tier} → ${newTier}`);
        return {
          upgraded: true,
          newTier,
          benefits: newTierConfig.benefits,
        };
      }

      return { upgraded: false };
    } catch (error) {
      this.logger.error(`Tier upgrade check failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Deduct points
   */
  private async deductPoints(
    userId: string,
    points: number,
    description: string,
  ): Promise<PointsTransaction> {
    const account = await this.getAccount(userId);

    const transaction: PointsTransaction = {
      id: `pts_${Date.now()}`,
      userId,
      type: 'redeem',
      source: PointsSource.BOOKING, // Placeholder
      points: -points,
      description,
      balance: account.points.balance - points,
      createdAt: new Date(),
    };

    // TODO: Save to database

    return transaction;
  }

  /**
   * Generate voucher code
   */
  private generateVoucherCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'TE';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Generate referral code
   */
  private generateReferralCode(userId: string): string {
    return `TRVZ${userId.substring(0, 6).toUpperCase()}`;
  }
}
