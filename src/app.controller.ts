import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Application is running' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('stats')
  @Public()
  @ApiOperation({ summary: 'Get homepage statistics (public)' })
  @ApiResponse({
    status: 200,
    description: 'Homepage statistics including active opportunities, registered users, and companies/organizations',
  })
  async getStats() {
    return this.appService.getStats();
  }

  @Get('search')
  @Public()
  @ApiOperation({ summary: 'Search across jobs and tenders (public)' })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Search query',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Search results across jobs and tenders',
  })
  async search(@Query('q') query: string) {
    return this.appService.search(query);
  }
}
