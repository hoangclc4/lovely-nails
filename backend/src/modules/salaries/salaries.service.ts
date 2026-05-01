import {
  BadRequestException,
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { and, count, countDistinct, eq, gte, inArray, lt, sum } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DB_TOKEN } from '../../database/database.provider';
import * as schema from '../../database/schema/index';
import { SalaryRecord } from '../../database/schema/salary-records';
import { SalaryAdjustmentRecord } from '../../database/schema/salary-adjustments';
import {
  SALARY_STATUS,
  ADJUSTMENT_TYPE,
  SALARY_ERROR,
} from '../../common/constants/salary.constants';
import { EMPLOYEE_STATUS } from '../../common/constants/employee.constants';
import { SESSION_STATUS } from '../../common/constants/session.constants';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '../../common/constants/pagination.constants';
import {
  type GenerateSalaryDto,
  type SalaryListParams,
  type UpdateSalaryDto,
  type AddAdjustmentDto,
} from './schemas/salary.schemas';

type DrizzleDB = NodePgDatabase<typeof schema>;

const BONUS_TYPES = [ADJUSTMENT_TYPE.BONUS] as const;
const DEDUCTION_TYPES = [
  ADJUSTMENT_TYPE.DEDUCTION,
  ADJUSTMENT_TYPE.ADVANCE,
  ADJUSTMENT_TYPE.PENALTY,
] as const;

@Injectable()
export class SalariesService {
  constructor(@Inject(DB_TOKEN) private readonly db: DrizzleDB) {}

  async generate(dto: GenerateSalaryDto): Promise<SalaryRecord[]> {
    const startDate = new Date(dto.year, dto.month - 1, 1);
    const endDate = new Date(dto.year, dto.month, 1);

    const activeEmployees = await this.db
      .select()
      .from(schema.employees)
      .where(eq(schema.employees.status, EMPLOYEE_STATUS.ACTIVE));

    const results: SalaryRecord[] = [];

    for (const employee of activeEmployees) {
      const existing = await this.db
        .select()
        .from(schema.salaryRecords)
        .where(
          and(
            eq(schema.salaryRecords.employeeId, employee.id),
            eq(schema.salaryRecords.month, dto.month),
            eq(schema.salaryRecords.year, dto.year),
          ),
        )
        .limit(1);

      if (existing[0] !== undefined) {
        results.push(existing[0]);
        continue;
      }

      const sessions = await this.db
        .select({ id: schema.serviceSessions.id })
        .from(schema.serviceSessions)
        .where(
          and(
            eq(schema.serviceSessions.employeeId, employee.id),
            eq(schema.serviceSessions.status, SESSION_STATUS.COMPLETED),
            gte(schema.serviceSessions.startTime, startDate),
            lt(schema.serviceSessions.startTime, endDate),
          ),
        );

      const sessionIds = sessions.map((s) => s.id);

      let totalServiceRevenue = 0;
      let totalServicesCount = 0;

      if (sessionIds.length > 0) {
        const revenueResult = await this.db
          .select({ total: sum(schema.sessionServices.priceAtTime) })
          .from(schema.sessionServices)
          .where(inArray(schema.sessionServices.sessionId, sessionIds));

        totalServiceRevenue = parseFloat(revenueResult[0]?.total ?? '0');
        const countResult = await this.db
          .select({ total: countDistinct(schema.sessionServices.sessionId) })
          .from(schema.sessionServices)
          .where(inArray(schema.sessionServices.sessionId, sessionIds));

        totalServicesCount = countResult[0]?.total ?? 0;
      }

      const tipsResult = await this.db
        .select({ total: sum(schema.tips.amount) })
        .from(schema.tips)
        .where(
          and(
            eq(schema.tips.employeeId, employee.id),
            gte(schema.tips.createdAt, startDate),
            lt(schema.tips.createdAt, endDate),
          ),
        );

      const totalTips = parseFloat(tipsResult[0]?.total ?? '0');
      const revenueSharePct = parseFloat(employee.revenueSharePct);
      const technicianRevenueShare = totalServiceRevenue * (revenueSharePct / 100);
      const ownerRevenueShare = totalServiceRevenue - technicianRevenueShare;
      const grossPay = technicianRevenueShare + totalTips;
      const netPay = grossPay;

      const inserted = await this.db
        .insert(schema.salaryRecords)
        .values({
          employeeId: employee.id,
          month: dto.month,
          year: dto.year,
          totalServicesCount,
          totalServiceRevenue: String(totalServiceRevenue),
          revenueSharePctSnapshot: String(revenueSharePct),
          technicianRevenueShare: String(technicianRevenueShare),
          ownerRevenueShare: String(ownerRevenueShare),
          totalTips: String(totalTips),
          bonuses: String(0),
          deductions: String(0),
          grossPay: String(grossPay),
          netPay: String(netPay),
        })
        .returning();

      const record = inserted[0];
      if (record === undefined) {
        throw new Error('Failed to insert salary record');
      }

      results.push(record);
    }

    return results;
  }

  async findAll(params: SalaryListParams): Promise<{
    data: SalaryRecord[];
    meta: { total: number; page: number; limit: number };
  }> {
    const page = params.page ?? DEFAULT_PAGE;
    const limit = params.limit ?? DEFAULT_LIMIT;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (params.employeeId !== undefined) {
      conditions.push(eq(schema.salaryRecords.employeeId, params.employeeId));
    }

    if (params.month !== undefined) {
      conditions.push(eq(schema.salaryRecords.month, params.month));
    }

    if (params.year !== undefined) {
      conditions.push(eq(schema.salaryRecords.year, params.year));
    }

    if (params.status !== undefined) {
      conditions.push(eq(schema.salaryRecords.status, params.status));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, totalResult] = await Promise.all([
      this.db
        .select()
        .from(schema.salaryRecords)
        .where(where)
        .limit(limit)
        .offset(offset),
      this.db.select({ value: count() }).from(schema.salaryRecords).where(where),
    ]);

    const total = totalResult[0]?.value ?? 0;

    return { data: rows, meta: { total, page, limit } };
  }

  async findOne(id: string): Promise<SalaryRecord> {
    const rows = await this.db
      .select()
      .from(schema.salaryRecords)
      .where(eq(schema.salaryRecords.id, id))
      .limit(1);

    const record = rows[0];
    if (record === undefined) {
      throw new NotFoundException(SALARY_ERROR.NOT_FOUND);
    }

    return record;
  }

  async getDetail(id: string): Promise<{
    salary: SalaryRecord;
    adjustments: SalaryAdjustmentRecord[];
  }> {
    const salary = await this.findOne(id);

    const [adjustments] = await Promise.all([
      this.db
        .select()
        .from(schema.salaryAdjustments)
        .where(eq(schema.salaryAdjustments.salaryId, id)),
    ]);

    return { salary, adjustments };
  }

  async update(id: string, dto: UpdateSalaryDto): Promise<SalaryRecord> {
    const salary = await this.findOne(id);

    if (salary.status === SALARY_STATUS.PAID) {
      throw new BadRequestException(SALARY_ERROR.ALREADY_PAID);
    }

    if (salary.status === SALARY_STATUS.CONFIRMED) {
      throw new BadRequestException(SALARY_ERROR.CANNOT_MODIFY_CONFIRMED);
    }

    const rows = await this.db
      .update(schema.salaryRecords)
      .set({ notes: dto.notes ?? null })
      .where(eq(schema.salaryRecords.id, id))
      .returning();

    const updated = rows[0];
    if (updated === undefined) {
      throw new NotFoundException(SALARY_ERROR.NOT_FOUND);
    }

    return updated;
  }

  async addAdjustment(
    salaryId: string,
    dto: AddAdjustmentDto,
  ): Promise<{ salary: SalaryRecord; adjustment: SalaryAdjustmentRecord }> {
    await this.findOne(salaryId);

    const insertedRows = await this.db
      .insert(schema.salaryAdjustments)
      .values({
        salaryId,
        type: dto.type,
        amount: String(dto.amount),
        reason: dto.reason,
      })
      .returning();

    const adjustment = insertedRows[0];
    if (adjustment === undefined) {
      throw new Error('Failed to insert salary adjustment');
    }

    const allAdjustments = await this.db
      .select()
      .from(schema.salaryAdjustments)
      .where(eq(schema.salaryAdjustments.salaryId, salaryId));

    let bonuses = 0;
    let deductions = 0;

    for (const adj of allAdjustments) {
      const adjAmount = parseFloat(adj.amount);
      if ((BONUS_TYPES as readonly string[]).includes(adj.type)) {
        bonuses += adjAmount;
        continue;
      }
      if ((DEDUCTION_TYPES as readonly string[]).includes(adj.type)) {
        deductions += adjAmount;
      }
    }

    const salary = await this.findOne(salaryId);
    const technicianRevenueShare = parseFloat(salary.technicianRevenueShare);
    const totalTips = parseFloat(salary.totalTips);
    const grossPay = technicianRevenueShare + totalTips + bonuses - deductions;
    const netPay = grossPay;

    const updatedRows = await this.db
      .update(schema.salaryRecords)
      .set({
        bonuses: String(bonuses),
        deductions: String(deductions),
        grossPay: String(grossPay),
        netPay: String(netPay),
      })
      .where(eq(schema.salaryRecords.id, salaryId))
      .returning();

    const updatedSalary = updatedRows[0];
    if (updatedSalary === undefined) {
      throw new NotFoundException(SALARY_ERROR.NOT_FOUND);
    }

    return { salary: updatedSalary, adjustment };
  }

  async confirm(id: string): Promise<SalaryRecord> {
    const salary = await this.findOne(id);

    if (salary.status === SALARY_STATUS.CONFIRMED) {
      throw new BadRequestException(SALARY_ERROR.ALREADY_CONFIRMED);
    }

    if (salary.status === SALARY_STATUS.PAID) {
      throw new BadRequestException(SALARY_ERROR.ALREADY_PAID);
    }

    const rows = await this.db
      .update(schema.salaryRecords)
      .set({ status: SALARY_STATUS.CONFIRMED, confirmedAt: new Date() })
      .where(eq(schema.salaryRecords.id, id))
      .returning();

    const updated = rows[0];
    if (updated === undefined) {
      throw new NotFoundException(SALARY_ERROR.NOT_FOUND);
    }

    return updated;
  }

  async markPaid(id: string): Promise<SalaryRecord> {
    const salary = await this.findOne(id);

    if (salary.status === SALARY_STATUS.DRAFT) {
      throw new BadRequestException(SALARY_ERROR.CANNOT_MODIFY_CONFIRMED);
    }

    if (salary.status === SALARY_STATUS.PAID) {
      throw new BadRequestException(SALARY_ERROR.ALREADY_PAID);
    }

    const rows = await this.db
      .update(schema.salaryRecords)
      .set({ status: SALARY_STATUS.PAID, paidAt: new Date() })
      .where(eq(schema.salaryRecords.id, id))
      .returning();

    const updated = rows[0];
    if (updated === undefined) {
      throw new NotFoundException(SALARY_ERROR.NOT_FOUND);
    }

    return updated;
  }

  async getPayslip(id: string): Promise<{
    salary: SalaryRecord;
    employeeName: string;
    adjustments: SalaryAdjustmentRecord[];
  }> {
    const salary = await this.findOne(id);

    const [employeeRows, adjustments] = await Promise.all([
      this.db
        .select({ fullName: schema.employees.fullName })
        .from(schema.employees)
        .where(eq(schema.employees.id, salary.employeeId))
        .limit(1),
      this.db
        .select()
        .from(schema.salaryAdjustments)
        .where(eq(schema.salaryAdjustments.salaryId, id)),
    ]);

    const employee = employeeRows[0];
    if (employee === undefined) {
      throw new NotFoundException('Employee not found');
    }

    return { salary, employeeName: employee.fullName, adjustments };
  }
}
