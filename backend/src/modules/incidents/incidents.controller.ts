import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IncidentsService } from './incidents.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  incidentListParamsSchema,
  incidentReportQuerySchema,
  updateIncidentSchema,
  type IncidentListParams,
  type IncidentReportQuery,
  type UpdateIncidentDto,
} from './schemas/incident.schemas';

@ApiTags('incidents')
@ApiBearerAuth()
@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Get('report')
  getReport(
    @Query(new ZodValidationPipe(incidentReportQuerySchema)) query: IncidentReportQuery,
  ) {
    return this.incidentsService.getReport(query);
  }

  @Get()
  findAll(
    @Query(new ZodValidationPipe(incidentListParamsSchema)) params: IncidentListParams,
  ) {
    return this.incidentsService.findAll(params);
  }

  @Get('customer/:customerId')
  findByCustomer(@Param('customerId') customerId: string) {
    return this.incidentsService.findByCustomer(customerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incidentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateIncidentSchema)) dto: UpdateIncidentDto,
  ) {
    return this.incidentsService.update(id, dto);
  }
}
