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
  createEmployeeSchema,
  updateEmployeeSchema,
  updateEmployeeStatusSchema,
  employeeListParamsSchema,
  type CreateEmployeeDto,
  type UpdateEmployeeDto,
  type UpdateEmployeeStatusDto,
  type EmployeeListParamsDto,
} from './schemas/employee.schemas';
import { EmployeesService } from './employees.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

@ApiTags('employees')
@ApiBearerAuth()
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  findAll(
    @Query(new ZodValidationPipe(employeeListParamsSchema)) params: EmployeeListParamsDto,
  ) {
    return this.employeesService.findAll(params);
  }

  @Get('status')
  getStatuses() {
    return this.employeesService.getStatuses();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(createEmployeeSchema)) dto: CreateEmployeeDto,
  ) {
    return this.employeesService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateEmployeeSchema)) dto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(id, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateEmployeeStatusSchema)) dto: UpdateEmployeeStatusDto,
  ) {
    return this.employeesService.updateStatus(id, dto);
  }
}
