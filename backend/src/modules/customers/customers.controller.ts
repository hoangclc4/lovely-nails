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
import { CustomersService } from './customers.service';
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerListParamsSchema,
  mergeCustomersSchema,
  type CreateCustomerDto,
  type UpdateCustomerDto,
  type CustomerListParams,
  type MergeCustomersDto,
} from './schemas/customer.schemas';

@ApiTags('customers')
@ApiBearerAuth()
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll(
    @Query(new ZodValidationPipe(customerListParamsSchema)) params: CustomerListParams,
  ) {
    return this.customersService.findAll(params);
  }

  @Get(':id/history')
  getHistory(@Param('id') id: string) {
    return this.customersService.getHistory(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Post('merge')
  merge(
    @Body(new ZodValidationPipe(mergeCustomersSchema)) dto: MergeCustomersDto,
  ) {
    return this.customersService.merge(dto);
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(createCustomerSchema)) dto: CreateCustomerDto,
  ) {
    return this.customersService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateCustomerSchema)) dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, dto);
  }
}
