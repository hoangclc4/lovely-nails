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
import {
  clockInSchema,
  clockOutSchema,
  breakStartSchema,
  breakEndSchema,
  shiftListParamsSchema,
  updateShiftSchema,
  type ClockInDto,
  type ClockOutDto,
  type BreakStartDto,
  type BreakEndDto,
  type ShiftListParamsDto,
  type UpdateShiftDto,
} from './schemas/shift.schemas';
import { ShiftsService } from './shifts.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

@ApiTags('shifts')
@ApiBearerAuth()
@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Post('clock-in')
  clockIn(@Body(new ZodValidationPipe(clockInSchema)) dto: ClockInDto) {
    return this.shiftsService.clockIn(dto);
  }

  @Post('clock-out')
  clockOut(@Body(new ZodValidationPipe(clockOutSchema)) dto: ClockOutDto) {
    return this.shiftsService.clockOut(dto);
  }

  @Post('break/start')
  startBreak(@Body(new ZodValidationPipe(breakStartSchema)) dto: BreakStartDto) {
    return this.shiftsService.startBreak(dto);
  }

  @Post('break/end')
  endBreak(@Body(new ZodValidationPipe(breakEndSchema)) dto: BreakEndDto) {
    return this.shiftsService.endBreak(dto);
  }

  @Get()
  findAll(@Query(new ZodValidationPipe(shiftListParamsSchema)) params: ShiftListParamsDto) {
    return this.shiftsService.findAll(params);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateShiftSchema)) dto: UpdateShiftDto,
  ) {
    return this.shiftsService.update(id, dto);
  }
}
