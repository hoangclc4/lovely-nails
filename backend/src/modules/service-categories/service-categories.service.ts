import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, count, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DB_TOKEN } from '../../database/database.provider';
import * as schema from '../../database/schema/index';
import { ServiceCategoryRecord, NewServiceCategoryRecord } from '../../database/schema/service-categories';
import { SERVICE_CATEGORY_ERROR } from '../../common/constants/service.constants';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '../../common/constants/pagination.constants';
import {
  type CreateServiceCategoryDto,
  type UpdateServiceCategoryDto,
  type ServiceCategoryListParams,
} from './schemas/service-category.schemas';

type DrizzleDB = NodePgDatabase<typeof schema>;

@Injectable()
export class ServiceCategoriesService {
  constructor(@Inject(DB_TOKEN) private readonly db: DrizzleDB) {}

  async findAll(params: ServiceCategoryListParams): Promise<{
    data: ServiceCategoryRecord[];
    meta: { total: number; page: number; limit: number };
  }> {
    const page = params.page ?? DEFAULT_PAGE;
    const limit = params.limit ?? DEFAULT_LIMIT;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (params.isActive !== undefined) {
      conditions.push(eq(schema.serviceCategories.isActive, params.isActive));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, totalResult] = await Promise.all([
      this.db
        .select()
        .from(schema.serviceCategories)
        .where(where)
        .orderBy(asc(schema.serviceCategories.sortOrder))
        .limit(limit)
        .offset(offset),
      this.db.select({ value: count() }).from(schema.serviceCategories).where(where),
    ]);

    const total = totalResult[0]?.value ?? 0;

    return { data: rows, meta: { total, page, limit } };
  }

  async findOne(id: string): Promise<ServiceCategoryRecord> {
    const rows = await this.db
      .select()
      .from(schema.serviceCategories)
      .where(eq(schema.serviceCategories.id, id))
      .limit(1);

    const record = rows[0];

    if (record === undefined) {
      throw new NotFoundException(SERVICE_CATEGORY_ERROR.NOT_FOUND);
    }

    return record;
  }

  async create(dto: CreateServiceCategoryDto): Promise<ServiceCategoryRecord> {
    const values: NewServiceCategoryRecord = {
      name: dto.name,
      description: dto.description ?? null,
      sortOrder: dto.sortOrder,
      isActive: dto.isActive,
    };

    const rows = await this.db
      .insert(schema.serviceCategories)
      .values(values)
      .returning();

    const created = rows[0];

    if (created === undefined) {
      throw new Error('Failed to create service category');
    }

    return created;
  }

  async update(id: string, dto: UpdateServiceCategoryDto): Promise<ServiceCategoryRecord> {
    await this.findOne(id);

    const updateValues: Partial<NewServiceCategoryRecord> = {};

    if (dto.name !== undefined) updateValues.name = dto.name;
    if (dto.description !== undefined) updateValues.description = dto.description;
    if (dto.sortOrder !== undefined) updateValues.sortOrder = dto.sortOrder;
    if (dto.isActive !== undefined) updateValues.isActive = dto.isActive;

    const rows = await this.db
      .update(schema.serviceCategories)
      .set(updateValues)
      .where(eq(schema.serviceCategories.id, id))
      .returning();

    const updated = rows[0];

    if (updated === undefined) {
      throw new NotFoundException(SERVICE_CATEGORY_ERROR.NOT_FOUND);
    }

    return updated;
  }

  async remove(id: string): Promise<ServiceCategoryRecord> {
    await this.findOne(id);

    const rows = await this.db
      .delete(schema.serviceCategories)
      .where(eq(schema.serviceCategories.id, id))
      .returning();

    const deleted = rows[0];

    if (deleted === undefined) {
      throw new NotFoundException(SERVICE_CATEGORY_ERROR.NOT_FOUND);
    }

    return deleted;
  }
}
