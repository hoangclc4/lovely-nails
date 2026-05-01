import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, count, desc, eq, ilike, or, sql, sum } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DB_TOKEN } from '../../database/database.provider';
import * as schema from '../../database/schema/index';
import { CustomerRecord } from '../../database/schema/customers';
import { CUSTOMER_ERROR } from '../../common/constants/customer.constants';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '../../common/constants/pagination.constants';
import {
  type CreateCustomerDto,
  type UpdateCustomerDto,
  type CustomerListParams,
  type MergeCustomersDto,
} from './schemas/customer.schemas';

type DrizzleDB = NodePgDatabase<typeof schema>;

export interface SessionHistory {
  sessionId: string;
  startTime: Date | null;
  endTime: Date | null;
  totalAmount: string;
  status: string;
  employeeId: string;
}

@Injectable()
export class CustomersService {
  constructor(@Inject(DB_TOKEN) private readonly db: DrizzleDB) {}

  async create(dto: CreateCustomerDto): Promise<CustomerRecord> {
    const existing = await this.db
      .select({ id: schema.customers.id })
      .from(schema.customers)
      .where(eq(schema.customers.phone, dto.phone))
      .limit(1);

    if (existing[0] !== undefined) {
      throw new ConflictException(CUSTOMER_ERROR.PHONE_TAKEN);
    }

    const rows = await this.db
      .insert(schema.customers)
      .values({
        fullName: dto.fullName,
        phone: dto.phone,
        email: dto.email ?? null,
        dateOfBirth: dto.dateOfBirth ?? null,
        notes: dto.notes ?? null,
      })
      .returning();

    const inserted = rows[0];
    if (inserted === undefined) {
      throw new Error('Failed to create customer');
    }

    return inserted;
  }

  async findAll(params: CustomerListParams): Promise<{
    data: CustomerRecord[];
    meta: { total: number; page: number; limit: number };
  }> {
    const page = params.page ?? DEFAULT_PAGE;
    const limit = params.limit ?? DEFAULT_LIMIT;
    const offset = (page - 1) * limit;

    const where =
      params.search !== undefined
        ? or(
            ilike(schema.customers.fullName, `%${params.search}%`),
            ilike(schema.customers.phone, `%${params.search}%`),
          )
        : undefined;

    const [rows, totalResult] = await Promise.all([
      this.db
        .select()
        .from(schema.customers)
        .where(where)
        .limit(limit)
        .offset(offset),
      this.db.select({ value: count() }).from(schema.customers).where(where),
    ]);

    const total = totalResult[0]?.value ?? 0;

    return { data: rows, meta: { total, page, limit } };
  }

  async findOne(id: string): Promise<CustomerRecord> {
    const rows = await this.db
      .select()
      .from(schema.customers)
      .where(eq(schema.customers.id, id))
      .limit(1);

    const record = rows[0];
    if (record === undefined) {
      throw new NotFoundException(CUSTOMER_ERROR.NOT_FOUND);
    }

    return record;
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<CustomerRecord> {
    await this.findOne(id);

    if (dto.phone !== undefined) {
      const existing = await this.db
        .select({ id: schema.customers.id })
        .from(schema.customers)
        .where(and(eq(schema.customers.phone, dto.phone), sql`${schema.customers.id} != ${id}::uuid`))
        .limit(1);

      if (existing[0] !== undefined) {
        throw new ConflictException(CUSTOMER_ERROR.PHONE_TAKEN);
      }
    }

    const rows = await this.db
      .update(schema.customers)
      .set({
        ...(dto.fullName !== undefined && { fullName: dto.fullName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.dateOfBirth !== undefined && { dateOfBirth: dto.dateOfBirth }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        updatedAt: new Date(),
      })
      .where(eq(schema.customers.id, id))
      .returning();

    const updated = rows[0];
    if (updated === undefined) {
      throw new NotFoundException(CUSTOMER_ERROR.NOT_FOUND);
    }

    return updated;
  }

  async getHistory(id: string): Promise<{ customer: CustomerRecord; sessions: SessionHistory[] }> {
    const customer = await this.findOne(id);

    const sessionRows = await this.db
      .select({
        sessionId: schema.serviceSessions.id,
        startTime: schema.serviceSessions.startTime,
        endTime: schema.serviceSessions.endTime,
        status: schema.serviceSessions.status,
        employeeId: schema.serviceSessions.employeeId,
        totalAmount: sql<string>`coalesce((
          select sum(${schema.sessionServices.priceAtTime})
          from ${schema.sessionServices}
          where ${schema.sessionServices.sessionId} = ${schema.serviceSessions.id}
        ), '0')`,
      })
      .from(schema.serviceSessions)
      .where(eq(schema.serviceSessions.customerId, id))
      .orderBy(desc(schema.serviceSessions.startTime));

    const sessions: SessionHistory[] = sessionRows.map((row) => ({
      sessionId: row.sessionId,
      startTime: row.startTime,
      endTime: row.endTime ?? null,
      totalAmount: row.totalAmount,
      status: row.status,
      employeeId: row.employeeId,
    }));

    return { customer, sessions };
  }

  async merge(dto: MergeCustomersDto): Promise<CustomerRecord> {
    if (dto.keepId === dto.mergeId) {
      throw new Error(CUSTOMER_ERROR.MERGE_SAME);
    }

    await this.findOne(dto.keepId);
    await this.findOne(dto.mergeId);

    return this.db.transaction(async (tx) => {
      await tx
        .update(schema.serviceSessions)
        .set({ customerId: dto.keepId })
        .where(eq(schema.serviceSessions.customerId, dto.mergeId));

      await tx
        .delete(schema.customers)
        .where(eq(schema.customers.id, dto.mergeId));

      const rows = await tx
        .select()
        .from(schema.customers)
        .where(eq(schema.customers.id, dto.keepId))
        .limit(1);

      const kept = rows[0];
      if (kept === undefined) {
        throw new NotFoundException(CUSTOMER_ERROR.NOT_FOUND);
      }

      return kept;
    });
  }
}
