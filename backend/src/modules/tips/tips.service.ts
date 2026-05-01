import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, count, eq, gte, lte, sql, sum } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DB_TOKEN } from '../../database/database.provider';
import * as schema from '../../database/schema/index';
import { TipRecord } from '../../database/schema/tips';
import { TIP_ERROR, TIP_PAYMENT_METHOD } from '../../common/constants/tip.constants';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '../../common/constants/pagination.constants';
import {
  type CreateTipDto,
  type UpdateTipDto,
  type TipListParams,
  type TipSummaryParams,
} from './schemas/tip.schemas';

type DrizzleDB = NodePgDatabase<typeof schema>;

export interface TipSummary {
  totalAmount: string;
  tipCount: number;
  byPaymentMethod: { paymentMethod: string; totalAmount: string; tipCount: number }[];
  byEmployee: { employeeId: string; totalAmount: string; tipCount: number }[];
}

@Injectable()
export class TipsService {
  constructor(@Inject(DB_TOKEN) private readonly db: DrizzleDB) {}

  async create(dto: CreateTipDto): Promise<TipRecord> {
    const rows = await this.db
      .insert(schema.tips)
      .values({
        sessionId: dto.sessionId,
        employeeId: dto.employeeId,
        customerId: dto.customerId ?? null,
        amount: String(dto.amount),
        paymentMethod: dto.paymentMethod,
        note: dto.note ?? null,
      })
      .returning();

    const inserted = rows[0];
    if (inserted === undefined) {
      throw new Error('Failed to create tip');
    }

    return inserted;
  }

  async findAll(params: TipListParams): Promise<{
    data: TipRecord[];
    meta: { total: number; page: number; limit: number };
  }> {
    const page = params.page ?? DEFAULT_PAGE;
    const limit = params.limit ?? DEFAULT_LIMIT;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (params.employeeId !== undefined) {
      conditions.push(eq(schema.tips.employeeId, params.employeeId));
    }

    if (params.sessionId !== undefined) {
      conditions.push(eq(schema.tips.sessionId, params.sessionId));
    }

    if (params.paymentMethod !== undefined) {
      conditions.push(eq(schema.tips.paymentMethod, params.paymentMethod));
    }

    if (params.dateFrom !== undefined) {
      conditions.push(gte(schema.tips.createdAt, new Date(params.dateFrom)));
    }

    if (params.dateTo !== undefined) {
      conditions.push(lte(schema.tips.createdAt, new Date(params.dateTo)));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, totalResult] = await Promise.all([
      this.db.select().from(schema.tips).where(where).limit(limit).offset(offset),
      this.db.select({ value: count() }).from(schema.tips).where(where),
    ]);

    const total = totalResult[0]?.value ?? 0;

    return { data: rows, meta: { total, page, limit } };
  }

  async findOne(id: string): Promise<TipRecord> {
    const rows = await this.db
      .select()
      .from(schema.tips)
      .where(eq(schema.tips.id, id))
      .limit(1);

    const record = rows[0];
    if (record === undefined) {
      throw new NotFoundException(TIP_ERROR.NOT_FOUND);
    }

    return record;
  }

  async update(id: string, dto: UpdateTipDto): Promise<TipRecord> {
    await this.findOne(id);

    const updateValues: Partial<{
      amount: string;
      paymentMethod: (typeof TIP_PAYMENT_METHOD)[keyof typeof TIP_PAYMENT_METHOD];
      note: string | null;
    }> = {};

    if (dto.amount !== undefined) {
      updateValues.amount = String(dto.amount);
    }

    if (dto.paymentMethod !== undefined) {
      updateValues.paymentMethod = dto.paymentMethod;
    }

    if (dto.note !== undefined) {
      updateValues.note = dto.note;
    }

    const rows = await this.db
      .update(schema.tips)
      .set(updateValues)
      .where(eq(schema.tips.id, id))
      .returning();

    const updated = rows[0];
    if (updated === undefined) {
      throw new NotFoundException(TIP_ERROR.NOT_FOUND);
    }

    return updated;
  }

  async remove(id: string): Promise<TipRecord> {
    const existing = await this.findOne(id);

    await this.db.delete(schema.tips).where(eq(schema.tips.id, id));

    return existing;
  }

  async getSummary(params: TipSummaryParams): Promise<TipSummary> {
    const conditions = [];

    if (params.employeeId !== undefined) {
      conditions.push(eq(schema.tips.employeeId, params.employeeId));
    }

    if (params.dateFrom !== undefined) {
      conditions.push(gte(schema.tips.createdAt, new Date(params.dateFrom)));
    }

    if (params.dateTo !== undefined) {
      conditions.push(lte(schema.tips.createdAt, new Date(params.dateTo)));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult, byPaymentMethodResult, byEmployeeResult] = await Promise.all([
      this.db
        .select({ totalAmount: sum(schema.tips.amount), tipCount: count() })
        .from(schema.tips)
        .where(where),
      this.db
        .select({
          paymentMethod: schema.tips.paymentMethod,
          totalAmount: sum(schema.tips.amount),
          tipCount: count(),
        })
        .from(schema.tips)
        .where(where)
        .groupBy(schema.tips.paymentMethod),
      this.db
        .select({
          employeeId: schema.tips.employeeId,
          totalAmount: sum(schema.tips.amount),
          tipCount: count(),
        })
        .from(schema.tips)
        .where(where)
        .groupBy(schema.tips.employeeId),
    ]);

    const totals = totalResult[0];

    return {
      totalAmount: totals?.totalAmount ?? '0',
      tipCount: totals?.tipCount ?? 0,
      byPaymentMethod: byPaymentMethodResult.map((row) => ({
        paymentMethod: row.paymentMethod,
        totalAmount: row.totalAmount ?? '0',
        tipCount: row.tipCount,
      })),
      byEmployee: byEmployeeResult.map((row) => ({
        employeeId: row.employeeId,
        totalAmount: row.totalAmount ?? '0',
        tipCount: row.tipCount,
      })),
    };
  }
}
