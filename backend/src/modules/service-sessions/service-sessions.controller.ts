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
import { ServiceSessionsService } from './service-sessions.service';
import {
  createSessionSchema,
  addSessionServiceSchema,
  addSessionAddOnSchema,
  addTimeExtensionSchema,
  sessionListParamsSchema,
  updateSessionCustomerSchema,
  type CreateSessionDto,
  type AddSessionServiceDto,
  type AddSessionAddOnDto,
  type AddTimeExtensionDto,
  type SessionListParams,
  type UpdateSessionCustomerDto,
} from './schemas/service-session.schemas';

@ApiTags('sessions')
@ApiBearerAuth()
@Controller('sessions')
export class ServiceSessionsController {
  constructor(private readonly serviceSessionsService: ServiceSessionsService) {}

  @Get()
  findAll(
    @Query(new ZodValidationPipe(sessionListParamsSchema)) params: SessionListParams,
  ) {
    return this.serviceSessionsService.findAll(params);
  }

  @Get('next-number')
  getNextNumber(@Query('date') date: string) {
    return this.serviceSessionsService.getNextNumber(date);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceSessionsService.findOne(id);
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(createSessionSchema)) dto: CreateSessionDto,
  ) {
    return this.serviceSessionsService.create(dto);
  }

  @Patch(':id/customer')
  updateCustomer(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateSessionCustomerSchema)) dto: UpdateSessionCustomerDto,
  ) {
    return this.serviceSessionsService.updateCustomer(id, dto);
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string) {
    return this.serviceSessionsService.complete(id);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.serviceSessionsService.cancel(id);
  }

  @Post(':id/services')
  addService(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(addSessionServiceSchema)) dto: AddSessionServiceDto,
  ) {
    return this.serviceSessionsService.addService(id, dto);
  }

  @Post(':id/add-ons')
  addAddOn(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(addSessionAddOnSchema)) dto: AddSessionAddOnDto,
  ) {
    return this.serviceSessionsService.addAddOn(id, dto);
  }

  @Post(':id/extend-time')
  extendTime(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(addTimeExtensionSchema)) dto: AddTimeExtensionDto,
  ) {
    return this.serviceSessionsService.extendTime(id, dto);
  }

  @Get(':id/extensions')
  findExtensions(@Param('id') id: string) {
    return this.serviceSessionsService.findExtensions(id);
  }
}
