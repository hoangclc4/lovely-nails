import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, count, eq, gte, isNull, lte } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DB_TOKEN } from '../../database/database.provider';
import * as schema from '../../database/schema/index';
import { WorkShiftRecord } from '../../database/schema/work-shifts';
import { RedisService } from '../redis/redis.service';
import { EMPLOYEE_WORK_STATUS } from '../../common/constants/employee.constants';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '../../common/constants/pagination.constants';
import {
  type ClockInDto,
  type ClockOutDto,
  type BreakStartDto,
  type BreakEndDto,
  type ShiftListParamsDto,
  type UpdateShiftDto,
} from './schemas/shift.schemas';

type DrizzleDB = NodePgDatabase<typeof schema>;

const SHIFT_NOT_FOUND_MESSAGE = 'No active shift found';
const SHIFT_RECORD_NOT_FOUND_MESSAGE = 'Shift not found';
const ALREADY_CLOCKED_IN_MESSAGE = 'Employee already clocked in';
const NOT_FREE_MESSAGE = 'Employee is not free';
const NOT_ON_BREAK_MESSAGE = 'Employee is not on break';
const MS_PER_MINUTE = 60 * 1000;
@Injectable()
export class ShiftsService {
  constructor(
    @Inject(DB_TOKEN) private readonly db: DrizzleDB,
    private readonly redisService: RedisService,
  ) {}

  async clockIn(dto: ClockInDto): Promise<WorkShiftRecord> {
    const today = new Date().toISOString().split('T')[0] as string;

    const existing = await this.db
      .select()
      .from(schema.workShifts)
      .where(
        and(
          eq(schema.workShifts.employeeId, dto.employeeId),
          eq(schema.workShifts.date, today),
          isNull(schema.workShifts.clockOut),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException(ALREADY_CLOCKED_IN_MESSAGE);
    }

    const now = new Date();
    const rows = await this.db
      .insert(schema.workShifts)
      .values({
        employeeId: dto.employeeId,
        clockIn: now,
        date: today,
      })
      .returning();

    const created = rows[0];

    if (created === undefined) {
      throw new Error('Failed to create shift record');
    }

    await this.redisService.setEmployeeStatus(dto.employeeId, EMPLOYEE_WORK_STATUS.FREE);

    return created;
  }

  async clockOut(dto: ClockOutDto): Promise<WorkShiftRecord> {
    const activeRows = await this.db
      .select()
      .from(schema.workShifts)
      .where(
        and(
          eq(schema.workShifts.employeeId, dto.employeeId),
          isNull(schema.workShifts.clockOut),
        ),
      )
      .limit(1);

    const activeShift = activeRows[0];

    if (activeShift === undefined) {
      throw new NotFoundException(SHIFT_NOT_FOUND_MESSAGE);
    }

    const now = new Date();

    const rows = await this.db
      .update(schema.workShifts)
      .set({ clockOut: now })
      .where(eq(schema.workShifts.id, activeShift.id))
      .returning();

    const updated = rows[0];

    if (updated === undefined) {
      throw new NotFoundException(SHIFT_NOT_FOUND_MESSAGE);
    }

    await this.redisService.deleteEmployeeStatus(dto.employeeId);

    return updated;
  }

  async startBreak(dto: BreakStartDto): Promise<{ employeeId: string; status: string }> {
    const status = await this.redisService.getEmployeeStatus(dto.employeeId);

    if (status !== EMPLOYEE_WORK_STATUS.FREE) {
      throw new ConflictException(NOT_FREE_MESSAGE);
    }

    const now = Date.now();
    await this.redisService.setBreakStart(dto.employeeId, now);
    await this.redisService.setEmployeeStatus(dto.employeeId, EMPLOYEE_WORK_STATUS.ON_BREAK);

    return { employeeId: dto.employeeId, status: EMPLOYEE_WORK_STATUS.ON_BREAK };
  }

  async endBreak(dto: BreakEndDto): Promise<WorkShiftRecord> {
    const status = await this.redisService.getEmployeeStatus(dto.employeeId);

    if (status !== EMPLOYEE_WORK_STATUS.ON_BREAK) {
      throw new ConflictException(NOT_ON_BREAK_MESSAGE);
    }

    const breakStartMs = await this.redisService.getBreakStart(dto.employeeId);
    const breakDurationMinutes =
      breakStartMs !== null
        ? Math.round((Date.now() - breakStartMs) / MS_PER_MINUTE)
        : 0;

    const activeRows = await this.db
      .select()
      .from(schema.workShifts)
      .where(
        and(
          eq(schema.workShifts.employeeId, dto.employeeId),
          isNull(schema.workShifts.clockOut),
        ),
      )
      .limit(1);

    const activeShift = activeRows[0];

    if (activeShift === undefined) {
      throw new NotFoundException(SHIFT_NOT_FOUND_MESSAGE);
    }

    const newBreakMinutes = activeShift.breakMinutes + breakDurationMinutes;

    const rows = await this.db
      .update(schema.workShifts)
      .set({ breakMinutes: newBreakMinutes })
      .where(eq(schema.workShifts.id, activeShift.id))
      .returning();

    const updated = rows[0];

    if (updated === undefined) {
      throw new NotFoundException(SHIFT_NOT_FOUND_MESSAGE);
    }

    await this.redisService.deleteBreakStart(dto.employeeId);
    await this.redisService.setEmployeeStatus(dto.employeeId, EMPLOYEE_WORK_STATUS.FREE);

    return updated;
  }

  async findAll(params: ShiftListParamsDto): Promise<{
    data: WorkShiftRecord[];
    meta: { total: number; page: number; limit: number };
  }> {
    const page = params.page ?? DEFAULT_PAGE;
    const limit = params.limit ?? DEFAULT_LIMIT;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (params.employeeId !== undefined) {
      conditions.push(eq(schema.workShifts.employeeId, params.employeeId));
    }

    if (params.dateFrom !== undefined) {
      conditions.push(gte(schema.workShifts.date, params.dateFrom));
    }

    if (params.dateTo !== undefined) {
      conditions.push(lte(schema.workShifts.date, params.dateTo));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, totalResult] = await Promise.all([
      this.db
        .select()
        .from(schema.workShifts)
        .where(where)
        .limit(limit)
        .offset(offset),
      this.db
        .select({ value: count() })
        .from(schema.workShifts)
        .where(where),
    ]);

    const total = totalResult[0]?.value ?? 0;

    return {
      data: rows,
      meta: { total, page, limit },
    };
  }

  async update(id: string, dto: UpdateShiftDto): Promise<WorkShiftRecord> {
    const existingRows = await this.db
      .select()
      .from(schema.workShifts)
      .where(eq(schema.workShifts.id, id))
      .limit(1);

    const existing = existingRows[0];

    if (existing === undefined) {
      throw new NotFoundException(SHIFT_RECORD_NOT_FOUND_MESSAGE);
    }

    const updateValues: Partial<schema.NewWorkShiftRecord> = {};

    if (dto.clockIn !== undefined) {
      updateValues.clockIn = new Date(dto.clockIn);
    }

    if (dto.clockOut !== undefined) {
      updateValues.clockOut = new Date(dto.clockOut);
    }

    if (dto.breakMinutes !== undefined) {
      updateValues.breakMinutes = dto.breakMinutes;
    }

    if (dto.notes !== undefined) {
      updateValues.notes = dto.notes;
    }

    const rows = await this.db
      .update(schema.workShifts)
      .set(updateValues)
      .where(eq(schema.workShifts.id, id))
      .returning();

    const updated = rows[0];

    if (updated === undefined) {
      throw new NotFoundException(SHIFT_RECORD_NOT_FOUND_MESSAGE);
    }

    return updated;
  }
}
