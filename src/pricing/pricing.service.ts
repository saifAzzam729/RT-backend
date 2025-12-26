import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  period: 'one-time' | 'yearly';
  features: string[];
}

export interface PricingInfo {
  tender: {
    single: PricingPlan;
    yearly: PricingPlan;
  };
  job: {
    single: PricingPlan;
    yearly: PricingPlan;
  };
  combined: PricingPlan;
  vendor: PricingPlan;
  vendorAdvertisement: PricingPlan;
}

@Injectable()
export class PricingService {
  constructor(private prisma: PrismaService) {}

  async getPricing(): Promise<PricingInfo> {
    // Try to get from database first
    const dbPlans = await this.prisma.pricingPlan.findMany();
    
    if (dbPlans.length > 0) {
      return this.formatPricingFromDb(dbPlans);
    }
    
    // Fallback to hardcoded values if database is empty
    return this.getHardcodedPricing();
  }

  private formatPricingFromDb(plans: any[]): PricingInfo {
    const planMap: Record<string, PricingPlan> = {};
    
    plans.forEach((plan) => {
      planMap[plan.plan_id] = {
        id: plan.plan_id,
        name: plan.name,
        description: plan.description,
        price: Number(plan.price),
        currency: plan.currency,
        period: plan.period as 'one-time' | 'yearly',
        features: plan.features || [],
      };
    });

    return {
      tender: {
        single: planMap['tender-single'] || this.getDefaultTenderSingle(),
        yearly: planMap['tender-yearly'] || this.getDefaultTenderYearly(),
      },
      job: {
        single: planMap['job-single'] || this.getDefaultJobSingle(),
        yearly: planMap['job-yearly'] || this.getDefaultJobYearly(),
      },
      combined: planMap['combined-yearly'] || this.getDefaultCombined(),
      vendor: planMap['vendor-yearly'] || this.getDefaultVendor(),
      vendorAdvertisement: planMap['vendor-advertisement'] || this.getDefaultVendorAdvertisement(),
    };
  }

  private getHardcodedPricing(): PricingInfo {
    return {
      tender: {
        single: {
          id: 'tender-single',
          name: 'Single Tender',
          description: 'Post one tender',
          price: 25,
          currency: 'USD',
          period: 'one-time',
          features: [
            'Post 1 tender',
            'Unlimited applications',
            'Standard visibility',
          ],
        },
        yearly: {
          id: 'tender-yearly',
          name: 'Tender Yearly Plan',
          description: 'Unlimited tenders for one year',
          price: 2500,
          currency: 'USD',
          period: 'yearly',
          features: [
            'Unlimited tender postings',
            'Unlimited applications',
            'Priority visibility',
            'Analytics dashboard',
          ],
        },
      },
      job: {
        single: {
          id: 'job-single',
          name: 'Single Job Advertisement',
          description: 'Post one job advertisement',
          price: 35,
          currency: 'USD',
          period: 'one-time',
          features: [
            'Post 1 job advertisement',
            'Unlimited applications',
            'Standard visibility',
          ],
        },
        yearly: {
          id: 'job-yearly',
          name: 'Job Advertisement Yearly Plan',
          description: 'Unlimited job advertisements for one year',
          price: 3000,
          currency: 'USD',
          period: 'yearly',
          features: [
            'Unlimited job postings',
            'Unlimited applications',
            'Priority visibility',
            'Analytics dashboard',
          ],
        },
      },
      combined: {
        id: 'combined-yearly',
        name: 'Combined Yearly Plan',
        description: 'Unlimited tenders and job advertisements for one year',
        price: 5000,
        currency: 'USD',
        period: 'yearly',
        features: [
          'Unlimited tender postings',
          'Unlimited job postings',
          'Unlimited applications',
          'Priority visibility',
          'Advanced analytics dashboard',
          'Dedicated support',
        ],
      },
      vendor: {
        id: 'vendor-yearly',
        name: 'Vendor Yearly Plan',
        description: 'Vendor subscription for one year',
        price: 500,
        currency: 'USD',
        period: 'yearly',
        features: [
          'Vendor profile listing',
          'Company/organization profile',
          'Basic visibility',
          'Access to vendor directory',
        ],
      },
      vendorAdvertisement: {
        id: 'vendor-advertisement',
        name: 'Vendor Advertisement',
        description: 'Advertisement placement for vendors',
        price: 0, // Placeholder - price to be determined
        currency: 'USD',
        period: 'one-time',
        features: [
          'Featured vendor listing',
          'Enhanced visibility',
          'Premium placement',
        ],
      },
    };
  }

  async getPlanById(planId: string): Promise<PricingPlan | null> {
    // Try database first
    const dbPlan = await this.prisma.pricingPlan.findUnique({
      where: { plan_id: planId },
    });

    if (dbPlan) {
      return {
        id: dbPlan.plan_id,
        name: dbPlan.name,
        description: dbPlan.description,
        price: Number(dbPlan.price),
        currency: dbPlan.currency,
        period: dbPlan.period as 'one-time' | 'yearly',
        features: dbPlan.features || [],
      };
    }

    // Fallback to hardcoded
    const pricing = await this.getPricing();
    if (pricing.tender.single.id === planId) return pricing.tender.single;
    if (pricing.tender.yearly.id === planId) return pricing.tender.yearly;
    if (pricing.job.single.id === planId) return pricing.job.single;
    if (pricing.job.yearly.id === planId) return pricing.job.yearly;
    if (pricing.combined.id === planId) return pricing.combined;
    if (pricing.vendor.id === planId) return pricing.vendor;
    if (pricing.vendorAdvertisement.id === planId) return pricing.vendorAdvertisement;

    return null;
  }

  async calculatePrice(planId: string, quantity: number = 1): Promise<number> {
    const plan = await this.getPlanById(planId);
    if (!plan) {
      throw new Error(`Plan with ID ${planId} not found`);
    }

    return plan.price * quantity;
  }

  // Default plan getters for fallback
  private getDefaultTenderSingle(): PricingPlan {
    return {
      id: 'tender-single',
      name: 'Single Tender',
      description: 'Post one tender',
      price: 25,
      currency: 'USD',
      period: 'one-time',
      features: ['Post 1 tender', 'Unlimited applications', 'Standard visibility'],
    };
  }

  private getDefaultTenderYearly(): PricingPlan {
    return {
      id: 'tender-yearly',
      name: 'Tender Yearly Plan',
      description: 'Unlimited tenders for one year',
      price: 2500,
      currency: 'USD',
      period: 'yearly',
      features: [
        'Unlimited tender postings',
        'Unlimited applications',
        'Priority visibility',
        'Analytics dashboard',
      ],
    };
  }

  private getDefaultJobSingle(): PricingPlan {
    return {
      id: 'job-single',
      name: 'Single Job Advertisement',
      description: 'Post one job advertisement',
      price: 35,
      currency: 'USD',
      period: 'one-time',
      features: ['Post 1 job advertisement', 'Unlimited applications', 'Standard visibility'],
    };
  }

  private getDefaultJobYearly(): PricingPlan {
    return {
      id: 'job-yearly',
      name: 'Job Advertisement Yearly Plan',
      description: 'Unlimited job advertisements for one year',
      price: 3000,
      currency: 'USD',
      period: 'yearly',
      features: [
        'Unlimited job postings',
        'Unlimited applications',
        'Priority visibility',
        'Analytics dashboard',
      ],
    };
  }

  private getDefaultCombined(): PricingPlan {
    return {
      id: 'combined-yearly',
      name: 'Combined Yearly Plan',
      description: 'Unlimited tenders and job advertisements for one year',
      price: 5000,
      currency: 'USD',
      period: 'yearly',
      features: [
        'Unlimited tender postings',
        'Unlimited job postings',
        'Unlimited applications',
        'Priority visibility',
        'Advanced analytics dashboard',
        'Dedicated support',
      ],
    };
  }

  private getDefaultVendor(): PricingPlan {
    return {
      id: 'vendor-yearly',
      name: 'Vendor Yearly Plan',
      description: 'Vendor subscription for one year',
      price: 500,
      currency: 'USD',
      period: 'yearly',
      features: [
        'Vendor profile listing',
        'Company/organization profile',
        'Basic visibility',
        'Access to vendor directory',
      ],
    };
  }

  private getDefaultVendorAdvertisement(): PricingPlan {
    return {
      id: 'vendor-advertisement',
      name: 'Vendor Advertisement',
      description: 'Advertisement placement for vendors',
      price: 0,
      currency: 'USD',
      period: 'one-time',
      features: ['Featured vendor listing', 'Enhanced visibility', 'Premium placement'],
    };
  }
}










