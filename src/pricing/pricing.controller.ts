import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PricingService } from './pricing.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('pricing')
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all pricing plans' })
  @ApiResponse({ status: 200, description: 'Returns all available pricing plans' })
  async getPricing() {
    return this.pricingService.getPricing();
  }

  @Public()
  @Get('plan/:planId')
  @ApiOperation({ summary: 'Get a specific pricing plan by ID' })
  @ApiParam({ name: 'planId', description: 'Pricing plan ID' })
  @ApiResponse({ status: 200, description: 'Returns the pricing plan details' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async getPlan(@Param('planId') planId: string) {
    const plan = await this.pricingService.getPlanById(planId);
    if (!plan) {
      return { error: 'Plan not found', planId };
    }
    return plan;
  }

  @Public()
  @Get('calculate')
  @ApiOperation({ summary: 'Calculate price for a plan' })
  @ApiQuery({ name: 'planId', description: 'Pricing plan ID', required: true })
  @ApiQuery({ name: 'quantity', description: 'Quantity (default: 1)', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Returns calculated price' })
  @ApiResponse({ status: 400, description: 'Invalid plan ID' })
  async calculatePrice(
    @Query('planId') planId: string,
    @Query('quantity') quantity?: string,
  ) {
    const qty = quantity ? parseInt(quantity, 10) : 1;
    try {
      const price = await this.pricingService.calculatePrice(planId, qty);
      const plan = await this.pricingService.getPlanById(planId);
      return {
        planId,
        quantity: qty,
        unitPrice: plan?.price || 0,
        totalPrice: price,
        currency: plan?.currency || 'USD',
      };
    } catch (error) {
      return {
        error: error.message,
        planId,
      };
    }
  }
}










