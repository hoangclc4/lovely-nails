import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DailyParamsSchema } from './schemas/dashboard.schemas';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('live')
  async getLive(@Query('date') date?: string) {
    const params = DailyParamsSchema.parse({ date });
    return this.dashboardService.getLive(params.date);
  }

  @Get('daily-summary')
  async getDailySummary(@Query('date') date?: string) {
    const params = DailyParamsSchema.parse({ date });
    return this.dashboardService.getDailySummary(params.date);
  }
}
