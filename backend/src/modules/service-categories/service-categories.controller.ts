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
import { ServiceCategoriesService } from './service-categories.service';
import {
  createServiceCategorySchema,
  serviceCategoryListParamsSchema,
  updateServiceCategorySchema,
  type CreateServiceCategoryDto,
  type ServiceCategoryListParams,
  type UpdateServiceCategoryDto,
} from './schemas/service-category.schemas';

@ApiTags('service-categories')
@ApiBearerAuth()
@Controller('service-categories')
export class ServiceCategoriesController {
  constructor(private readonly serviceCategoriesService: ServiceCategoriesService) {}

  @Get()
  findAll(
    @Query(new ZodValidationPipe(serviceCategoryListParamsSchema)) params: ServiceCategoryListParams,
  ) {
    return this.serviceCategoriesService.findAll(params);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceCategoriesService.findOne(id);
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(createServiceCategorySchema)) dto: CreateServiceCategoryDto,
  ) {
    return this.serviceCategoriesService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateServiceCategorySchema)) dto: UpdateServiceCategoryDto,
  ) {
    return this.serviceCategoriesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviceCategoriesService.remove(id);
  }
}
