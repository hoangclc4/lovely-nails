import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { SalariesService } from './salaries.service';
import {
  generateSalarySchema,
  salaryListParamsSchema,
  updateSalarySchema,
  addAdjustmentSchema,
  type GenerateSalaryDto,
  type SalaryListParams,
  type UpdateSalaryDto,
  type AddAdjustmentDto,
} from './schemas/salary.schemas';

@ApiTags('salary')
@ApiBearerAuth()
@Controller('salary')
export class SalariesController {
  constructor(private readonly salariesService: SalariesService) {}

  @Post('generate')
  generate(
    @Body(new ZodValidationPipe(generateSalarySchema)) dto: GenerateSalaryDto,
  ) {
    return this.salariesService.generate(dto);
  }

  @Get()
  findAll(
    @Query(new ZodValidationPipe(salaryListParamsSchema)) params: SalaryListParams,
  ) {
    return this.salariesService.findAll(params);
  }

  @Get(':id/detail')
  getDetail(@Param('id') id: string) {
    return this.salariesService.getDetail(id);
  }

  @Get(':id/payslip')
  getPayslip(@Param('id') id: string) {
    return this.salariesService.getPayslip(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salariesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateSalarySchema)) dto: UpdateSalaryDto,
  ) {
    return this.salariesService.update(id, dto);
  }

  @Post(':id/adjustments')
  addAdjustment(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(addAdjustmentSchema)) dto: AddAdjustmentDto,
  ) {
    return this.salariesService.addAdjustment(id, dto);
  }

  @Patch(':id/confirm')
  confirm(@Param('id') id: string) {
    return this.salariesService.confirm(id);
  }

  @Patch(':id/mark-paid')
  markPaid(@Param('id') id: string) {
    return this.salariesService.markPaid(id);
  }
}
