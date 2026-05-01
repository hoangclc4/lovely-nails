import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  upsertEmployeeScheduleSchema,
  dayOfWeekParamSchema,
  employeeScheduleListParamsSchema,
  type UpsertEmployeeScheduleDto,
  type EmployeeScheduleListParams,
} from './schemas/employee-schedule.schemas';
import { EmployeeScheduleService } from './employee-schedule.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

@ApiTags('employee-schedule')
@ApiBearerAuth()
@Controller('employee-schedule')
export class EmployeeScheduleController {
  constructor(private readonly employeeScheduleService: EmployeeScheduleService) {}

  @Get()
  findAll(
    @Query(new ZodValidationPipe(employeeScheduleListParamsSchema)) params: EmployeeScheduleListParams,
  ) {
    return this.employeeScheduleService.findAll(params);
  }

  @Put(':employeeId/:dayOfWeek')
  upsert(
    @Param('employeeId') employeeId: string,
    @Param('dayOfWeek', new ZodValidationPipe(dayOfWeekParamSchema)) dayOfWeek: number,
    @Body(new ZodValidationPipe(upsertEmployeeScheduleSchema)) dto: UpsertEmployeeScheduleDto,
  ) {
    return this.employeeScheduleService.upsert(employeeId, dayOfWeek, dto);
  }
}
