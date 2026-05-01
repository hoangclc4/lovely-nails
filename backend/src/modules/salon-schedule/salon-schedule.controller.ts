import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  upsertSalonScheduleSchema,
  dayOfWeekParamSchema,
  type UpsertSalonScheduleDto,
} from './schemas/salon-schedule.schemas';
import { SalonScheduleService } from './salon-schedule.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

@ApiTags('salon-schedule')
@ApiBearerAuth()
@Controller('salon-schedule')
export class SalonScheduleController {
  constructor(private readonly salonScheduleService: SalonScheduleService) {}

  @Get()
  findAll() {
    return this.salonScheduleService.findAll();
  }

  @Put(':dayOfWeek')
  upsert(
    @Param('dayOfWeek', new ZodValidationPipe(dayOfWeekParamSchema)) dayOfWeek: number,
    @Body(new ZodValidationPipe(upsertSalonScheduleSchema)) dto: UpsertSalonScheduleDto,
  ) {
    return this.salonScheduleService.upsert(dayOfWeek, dto);
  }
}
