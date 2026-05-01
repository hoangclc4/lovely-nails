import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, count, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DB_TOKEN } from '../../database/database.provider';
import * as schema from '../../database/schema/index';
import { ServiceRecord, NewServiceRecord } from '../../database/schema/services';
import { SERVICE_ERROR } from '../../common/constants/service.constants';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '../../common/constants/pagination.constants';
import {
  type CreateServiceDto,
  type UpdateServiceDto,
  type ServiceListParams,
} from './schemas/service.schemas';

type DrizzleDB = NodePgDatabase<typeof schema>;

@Injectable()
export class ServicesService {
  constructor(@Inject(DB_TOKEN) private readonly db: DrizzleDB) {}

  async findAll(params: ServiceListParams): Promise<{
    data: ServiceRecord[];
    meta: { total: number; page: number; limit: number };
  }> {
    const page = params.page ?? DEFAULT_PAGE;
    const limit = params.limit ?? DEFAULT_LIMIT;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (params.categoryId !== undefined) {
      conditions.push(eq(schema.services.categoryId, params.categoryId));
    }

    if (params.isActive !== undefined) {
      conditions.push(eq(schema.services.isActive, params.isActive));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, totalResult] = await Promise.all([
      this.db.select().from(schema.services).where(where).limit(limit).offset(offset),
      this.db.select({ value: count() }).from(schema.services).where(where),
    ]);

    const total = totalResult[0]?.value ?? 0;

    return { data: rows, meta: { total, page, limit } };
  }

  async findOne(id: string): Promise<ServiceRecord> {
    const rows = await this.db
      .select()
      .from(schema.services)
      .where(eq(schema.services.id, id))
      .limit(1);

    const record = rows[0];

    if (record === undefined) {
      throw new NotFoundException(SERVICE_ERROR.NOT_FOUND);
    }

    return record;
  }

  async create(dto: CreateServiceDto): Promise<ServiceRecord> {
    const values: NewServiceRecord = {
      name: dto.name,
      description: dto.description ?? null,
      price: String(dto.price),
      durationMinutes: dto.durationMinutes,
      categoryId: dto.categoryId ?? null,
      isActive: dto.isActive,
      imageUrl: dto.imageUrl ?? null,
    };

    const rows = await this.db.insert(schema.services).values(values).returning();

    const created = rows[0];

    if (created === undefined) {
      throw new Error('Failed to create service');
    }

    return created;
  }

  async update(id: string, dto: UpdateServiceDto): Promise<ServiceRecord> {
    await this.findOne(id);

    const updateValues: Partial<NewServiceRecord> = {
      updatedAt: new Date(),
    };

    if (dto.name !== undefined) updateValues.name = dto.name;
    if (dto.description !== undefined) updateValues.description = dto.description;
    if (dto.price !== undefined) updateValues.price = String(dto.price);
    if (dto.durationMinutes !== undefined) updateValues.durationMinutes = dto.durationMinutes;
    if (dto.categoryId !== undefined) updateValues.categoryId = dto.categoryId;
    if (dto.isActive !== undefined) updateValues.isActive = dto.isActive;
    if (dto.imageUrl !== undefined) updateValues.imageUrl = dto.imageUrl;

    const rows = await this.db
      .update(schema.services)
      .set(updateValues)
      .where(eq(schema.services.id, id))
      .returning();

    const updated = rows[0];

    if (updated === undefined) {
      throw new NotFoundException(SERVICE_ERROR.NOT_FOUND);
    }

    return updated;
  }

  async remove(id: string): Promise<ServiceRecord> {
    const record = await this.findOne(id);

    try {
      await this.db.delete(schema.services).where(eq(schema.services.id, id));
    } catch (err: unknown) {
      const pgError = err as { code?: string };
      const FK_VIOLATION_CODE = '23503';
      if (pgError.code === FK_VIOLATION_CODE) {
        throw new BadRequestException(SERVICE_ERROR.IN_USE);
      }
      throw err;
    }

    return record;
  }
}
