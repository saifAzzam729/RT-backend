import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding pricing plans...');

  const plans = [
    {
      plan_id: 'tender-single',
      name: 'Single Tender',
      description: 'Post one tender',
      price: 25,
      currency: 'USD',
      period: 'one-time',
      plan_type: 'tender',
      features: ['Post 1 tender', 'Unlimited applications', 'Standard visibility'],
    },
    {
      plan_id: 'tender-yearly',
      name: 'Tender Yearly Plan',
      description: 'Unlimited tenders for one year',
      price: 2500,
      currency: 'USD',
      period: 'yearly',
      plan_type: 'tender',
      features: [
        'Unlimited tender postings',
        'Unlimited applications',
        'Priority visibility',
        'Analytics dashboard',
      ],
    },
    {
      plan_id: 'job-single',
      name: 'Single Job Advertisement',
      description: 'Post one job advertisement',
      price: 35,
      currency: 'USD',
      period: 'one-time',
      plan_type: 'job',
      features: ['Post 1 job advertisement', 'Unlimited applications', 'Standard visibility'],
    },
    {
      plan_id: 'job-yearly',
      name: 'Job Advertisement Yearly Plan',
      description: 'Unlimited job advertisements for one year',
      price: 3000,
      currency: 'USD',
      period: 'yearly',
      plan_type: 'job',
      features: [
        'Unlimited job postings',
        'Unlimited applications',
        'Priority visibility',
        'Analytics dashboard',
      ],
    },
    {
      plan_id: 'combined-yearly',
      name: 'Combined Yearly Plan',
      description: 'Unlimited tenders and job advertisements for one year',
      price: 5000,
      currency: 'USD',
      period: 'yearly',
      plan_type: 'combined',
      features: [
        'Unlimited tender postings',
        'Unlimited job postings',
        'Unlimited applications',
        'Priority visibility',
        'Advanced analytics dashboard',
        'Dedicated support',
      ],
    },
    {
      plan_id: 'vendor-yearly',
      name: 'Vendor Yearly Plan',
      description: 'Vendor subscription for one year',
      price: 500,
      currency: 'USD',
      period: 'yearly',
      plan_type: 'vendor',
      features: [
        'Vendor profile listing',
        'Company/organization profile',
        'Basic visibility',
        'Access to vendor directory',
      ],
    },
    {
      plan_id: 'vendor-advertisement',
      name: 'Vendor Advertisement',
      description: 'Advertisement placement for vendors',
      price: 0,
      currency: 'USD',
      period: 'one-time',
      plan_type: 'vendorAdvertisement',
      features: ['Featured vendor listing', 'Enhanced visibility', 'Premium placement'],
    },
  ];

  for (const plan of plans) {
    await prisma.pricingPlan.upsert({
      where: { plan_id: plan.plan_id },
      update: plan,
      create: plan,
    });
    console.log(`✓ Seeded/Updated: ${plan.plan_id}`);
  }

  console.log('Pricing plans seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });















