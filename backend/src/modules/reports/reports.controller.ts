import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import {
  RevenueReportParamsSchema,
  EmployeeReportParamsSchema,
  ServiceReportParamsSchema,
  FinancialReportParamsSchema,
} from './schemas/report.schemas';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('revenue')
  async getRevenue(@Query() query: Record<string, string>) {
    const params = RevenueReportParamsSchema.parse(query);
    return this.reportsService.getRevenueReport(params);
  }

  @Get('employees')
  async getEmployees(@Query() query: Record<string, string>) {
    const params = EmployeeReportParamsSchema.parse(query);
    return this.reportsService.getEmployeeReport(params);
  }

  @Get('services')
  async getServices(@Query() query: Record<string, string>) {
    const params = ServiceReportParamsSchema.parse(query);
    return this.reportsService.getServiceReport(params);
  }

  @Get('financial')
  async getFinancial(@Query() query: Record<string, string>) {
    const params = FinancialReportParamsSchema.parse(query);
    return this.reportsService.getFinancialReport(params);
  }
}
