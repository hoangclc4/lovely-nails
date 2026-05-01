import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, count, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DB_TOKEN } from '../../database/database.provider';
import * as schema from '../../database/schema/index';
import { ServiceAddOnRecord, NewServiceAddOnRecord } from '../../database/schema/service-add-ons';
import { SERVICE_ADD_ON_ERROR } from '../../common/constants/service.constants';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '../../common/constants/pagination.constants';
import {
  type CreateServiceAddOnDto,
  type UpdateServiceAddOnDto,
  type ServiceAddOnListParams,
} from './schemas/service-add-on.schemas';

type DrizzleDB = NodePgDatabase<typeof schema>;

@Injectable()
export class ServiceAddOnsService {
  constructor(@Inject(DB_TOKEN) private readonly db: DrizzleDB) {}

  async findAll(params: ServiceAddOnListParams): Promise<{
    data: ServiceAddOnRecord[];
    meta: { total: number; page: number; limit: number };
  }> {
    const page = params.page ?? DEFAULT_PAGE;
    const limit = params.limit ?? DEFAULT_LIMIT;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (params.isActive !== undefined) {
      conditions.push(eq(schema.serviceAddOns.isActive, params.isActive));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, totalResult] = await Promise.all([
      this.db.select().from(schema.serviceAddOns).where(where).limit(limit).offset(offset),
      this.db.select({ value: count() }).from(schema.serviceAddOns).where(where),
    ]);

    const total = totalResult[0]?.value ?? 0;

    return { data: rows, meta: { total, page, limit } };
  }

  async findOne(id: string): Promise<ServiceAddOnRecord> {
    const rows = await this.db
      .select()
      .from(schema.serviceAddOns)
      .where(eq(schema.serviceAddOns.id, id))
      .limit(1);

    const record = rows[0];

    if (record === undefined) {
      throw new NotFoundException(SERVICE_ADD_ON_ERROR.NOT_FOUND);
    }

    return record;
  }

  async create(dto: CreateServiceAddOnDto): Promise<ServiceAddOnRecord> {
    const values: NewServiceAddOnRecord = {
      name: dto.name,
      price: String(dto.price),
      durationMinutes: dto.durationMinutes,
      isActive: dto.isActive,
    };

    const rows = await this.db.insert(schema.serviceAddOns).values(values).returning();

    const created = rows[0];

    if (created === undefined) {
      throw new Error('Failed to create service add-on');
    }

    return created;
  }

  async update(id: string, dto: UpdateServiceAddOnDto): Promise<ServiceAddOnRecord> {
    await this.findOne(id);

    const updateValues: Partial<NewServiceAddOnRecord> = {};

    if (dto.name !== undefined) updateValues.name = dto.name;
    if (dto.price !== undefined) updateValues.price = String(dto.price);
    if (dto.durationMinutes !== undefined) updateValues.durationMinutes = dto.durationMinutes;
    if (dto.isActive !== undefined) updateValues.isActive = dto.isActive;

    const rows = await this.db
      .update(schema.serviceAddOns)
      .set(updateValues)
      .where(eq(schema.serviceAddOns.id, id))
      .returning();

    const updated = rows[0];

    if (updated === undefined) {
      throw new NotFoundException(SERVICE_ADD_ON_ERROR.NOT_FOUND);
    }

    return updated;
  }

  async remove(id: string): Promise<ServiceAddOnRecord> {
    await this.findOne(id);

    const rows = await this.db
      .update(schema.serviceAddOns)
      .set({ isActive: false })
      .where(eq(schema.serviceAddOns.id, id))
      .returning();

    const updated = rows[0];

    if (updated === undefined) {
      throw new NotFoundException(SERVICE_ADD_ON_ERROR.NOT_FOUND);
    }

    return updated;
  }
}
