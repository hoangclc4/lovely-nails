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
import { ServiceAddOnsService } from './service-add-ons.service';
import {
  createServiceAddOnSchema,
  serviceAddOnListParamsSchema,
  updateServiceAddOnSchema,
  type CreateServiceAddOnDto,
  type ServiceAddOnListParams,
  type UpdateServiceAddOnDto,
} from './schemas/service-add-on.schemas';

@ApiTags('service-add-ons')
@ApiBearerAuth()
@Controller('service-add-ons')
export class ServiceAddOnsController {
  constructor(private readonly serviceAddOnsService: ServiceAddOnsService) {}

  @Get()
  findAll(
    @Query(new ZodValidationPipe(serviceAddOnListParamsSchema)) params: ServiceAddOnListParams,
  ) {
    return this.serviceAddOnsService.findAll(params);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceAddOnsService.findOne(id);
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(createServiceAddOnSchema)) dto: CreateServiceAddOnDto,
  ) {
    return this.serviceAddOnsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateServiceAddOnSchema)) dto: UpdateServiceAddOnDto,
  ) {
    return this.serviceAddOnsService.update(id, dto);
  }
}
