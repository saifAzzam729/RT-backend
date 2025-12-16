import { Injectable } from '@nestjs/common';

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
  getPricing(): PricingInfo {
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

  getPlanById(planId: string): PricingPlan | null {
    const pricing = this.getPricing();

    // Check all plans
    if (pricing.tender.single.id === planId) return pricing.tender.single;
    if (pricing.tender.yearly.id === planId) return pricing.tender.yearly;
    if (pricing.job.single.id === planId) return pricing.job.single;
    if (pricing.job.yearly.id === planId) return pricing.job.yearly;
    if (pricing.combined.id === planId) return pricing.combined;
    if (pricing.vendor.id === planId) return pricing.vendor;
    if (pricing.vendorAdvertisement.id === planId) return pricing.vendorAdvertisement;

    return null;
  }

  calculatePrice(planId: string, quantity: number = 1): number {
    const plan = this.getPlanById(planId);
    if (!plan) {
      throw new Error(`Plan with ID ${planId} not found`);
    }

    return plan.price * quantity;
  }
}

