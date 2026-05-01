import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { TipsService } from './tips.service';
import {
  createTipSchema,
  updateTipSchema,
  tipListParamsSchema,
  tipSummaryParamsSchema,
  type CreateTipDto,
  type UpdateTipDto,
  type TipListParams,
  type TipSummaryParams,
} from './schemas/tip.schemas';

@ApiTags('tips')
@ApiBearerAuth()
@Controller('tips')
export class TipsController {
  constructor(private readonly tipsService: TipsService) {}

  @Get('summary')
  getSummary(
    @Query(new ZodValidationPipe(tipSummaryParamsSchema)) params: TipSummaryParams,
  ) {
    return this.tipsService.getSummary(params);
  }

  @Get()
  findAll(
    @Query(new ZodValidationPipe(tipListParamsSchema)) params: TipListParams,
  ) {
    return this.tipsService.findAll(params);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tipsService.findOne(id);
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(createTipSchema)) dto: CreateTipDto,
  ) {
    return this.tipsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateTipSchema)) dto: UpdateTipDto,
  ) {
    return this.tipsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tipsService.remove(id);
  }
}
