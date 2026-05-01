import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, count, eq, ilike } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  type CreateEmployeeDto,
  type UpdateEmployeeDto,
  type UpdateEmployeeStatusDto,
  type EmployeeListParamsDto,
  type EmployeeStatusSummary,
  type EmployeeWorkStatus,
} from './schemas/employee.schemas';
import { DEFAULT_PAGE, DEFAULT_LIMIT } from '../../common/constants/pagination.constants';
import { DB_TOKEN } from '../../database/database.provider';
import * as schema from '../../database/schema/index';
import { EmployeeRecord, NewEmployeeRecord } from '../../database/schema/employees';
import { RedisService } from '../redis/redis.service';
import { EMPLOYEE_WORK_STATUS } from '../../common/constants/employee.constants';

type DrizzleDB = NodePgDatabase<typeof schema>;

const EMPLOYEE_NOT_FOUND_MESSAGE = 'Employee not found';

@Injectable()
export class EmployeesService {
  constructor(
    @Inject(DB_TOKEN) private readonly db: DrizzleDB,
    private readonly redisService: RedisService,
  ) {}

  async findAll(params: EmployeeListParamsDto): Promise<{
    data: EmployeeRecord[];
    meta: { total: number; page: number; limit: number };
  }> {
    const page = params.page ?? DEFAULT_PAGE;
    const limit = params.limit ?? DEFAULT_LIMIT;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (params.status !== undefined) {
      conditions.push(eq(schema.employees.status, params.status));
    }

    if (params.search !== undefined && params.search.length > 0) {
      conditions.push(ilike(schema.employees.fullName, `%${params.search}%`));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, totalResult] = await Promise.all([
      this.db
        .select()
        .from(schema.employees)
        .where(where)
        .limit(limit)
        .offset(offset),
      this.db
        .select({ value: count() })
        .from(schema.employees)
        .where(where),
    ]);

    const total = totalResult[0]?.value ?? 0;

    return { data: rows, meta: { total, page, limit } };
  }

  async findOne(id: string): Promise<EmployeeRecord> {
    const rows = await this.db
      .select()
      .from(schema.employees)
      .where(eq(schema.employees.id, id))
      .limit(1);

    const employee = rows[0];

    if (employee === undefined) {
      throw new NotFoundException(EMPLOYEE_NOT_FOUND_MESSAGE);
    }

    return employee;
  }

  async create(dto: CreateEmployeeDto): Promise<EmployeeRecord> {
    const today = new Date().toISOString().split('T')[0] as string;

    const rows = await this.db
      .insert(schema.employees)
      .values({
        fullName: dto.fullName,
        phone: dto.phone,
        email: dto.email ?? null,
        avatarUrl: dto.avatarUrl ?? null,
        revenueSharePct: String(dto.revenueSharePct),
        hireDate: today,
      })
      .returning();

    const created = rows[0];

    if (created === undefined) {
      throw new Error('Failed to create employee');
    }

    return created;
  }

  async update(id: string, dto: UpdateEmployeeDto): Promise<EmployeeRecord> {
    await this.findOne(id);

    const updateValues: Partial<NewEmployeeRecord> = {
      updatedAt: new Date(),
    };

    if (dto.fullName !== undefined) updateValues.fullName = dto.fullName;
    if (dto.phone !== undefined) updateValues.phone = dto.phone;
    if (dto.email !== undefined) updateValues.email = dto.email ?? null;
    if (dto.avatarUrl !== undefined) updateValues.avatarUrl = dto.avatarUrl ?? null;
    if (dto.revenueSharePct !== undefined) updateValues.revenueSharePct = String(dto.revenueSharePct);

    const rows = await this.db
      .update(schema.employees)
      .set(updateValues)
      .where(eq(schema.employees.id, id))
      .returning();

    const updated = rows[0];

    if (updated === undefined) {
      throw new NotFoundException(EMPLOYEE_NOT_FOUND_MESSAGE);
    }

    return updated;
  }

  async updateStatus(id: string, dto: UpdateEmployeeStatusDto): Promise<EmployeeRecord> {
    await this.findOne(id);

    const rows = await this.db
      .update(schema.employees)
      .set({ status: dto.status, updatedAt: new Date() })
      .where(eq(schema.employees.id, id))
      .returning();

    const updated = rows[0];

    if (updated === undefined) {
      throw new NotFoundException(EMPLOYEE_NOT_FOUND_MESSAGE);
    }

    return updated;
  }

  async getStatuses(): Promise<EmployeeStatusSummary[]> {
    const employees = await this.db
      .select({
        id: schema.employees.id,
        fullName: schema.employees.fullName,
        status: schema.employees.status,
      })
      .from(schema.employees);

    const redisStatuses = await this.redisService.getAllEmployeeStatuses();

    return employees.map((employee) => ({
      id: employee.id,
      fullName: employee.fullName,
      status: employee.status,
      workStatus: (redisStatuses[employee.id] ?? EMPLOYEE_WORK_STATUS.OFF) as EmployeeWorkStatus,
    }));
  }
}
