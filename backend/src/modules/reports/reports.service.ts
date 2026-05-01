import { Inject, Injectable } from '@nestjs/common';
import { and, avg, count, countDistinct, eq, gte, inArray, lte, sql, sum } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DB_TOKEN } from '../../database/database.provider';
import * as schema from '../../database/schema/index';
import { SESSION_STATUS } from '../../common/constants/session.constants';
import type {
  RevenueReportParams,
  RevenueReportData,
  RevenueDataPoint,
  EmployeeReportParams,
  EmployeeReportData,
  EmployeeReportRow,
  ServiceReportParams,
  ServiceReportData,
  ServiceReportRow,
  FinancialReportParams,
  FinancialReportData,
  FinancialEmployeeRow,
} from './schemas/report.schemas';

type DrizzleDB = NodePgDatabase<typeof schema>;

function getDayBounds(dateStr: string): { start: Date; end: Date } {
  const start = new Date(`${dateStr}T00:00:00.000Z`);
  const end = new Date(`${dateStr}T23:59:59.999Z`);
  return { start, end };
}

@Injectable()
export class ReportsService {
  constructor(
    @Inject(DB_TOKEN) private readonly db: DrizzleDB,
  ) {}

  async getRevenueReport(params: RevenueReportParams): Promise<RevenueReportData> {
    const { start } = getDayBounds(params.dateFrom);
    const { end } = getDayBounds(params.dateTo);

    const [sessionRows, tipRows] = await Promise.all([
      this.db
        .select({
          date: sql<string>`DATE(${schema.serviceSessions.startTime})`.as('date'),
          sessionsCount: countDistinct(schema.serviceSessions.id),
          revenue: sum(schema.sessionServices.priceAtTime),
        })
        .from(schema.serviceSessions)
        .leftJoin(schema.sessionServices, eq(schema.sessionServices.sessionId, schema.serviceSessions.id))
        .where(
          and(
            eq(schema.serviceSessions.status, SESSION_STATUS.COMPLETED),
            gte(schema.serviceSessions.startTime, start),
            lte(schema.serviceSessions.startTime, end),
          ),
        )
        .groupBy(sql`DATE(${schema.serviceSessions.startTime})`)
        .orderBy(sql`DATE(${schema.serviceSessions.startTime})`),

      this.db
        .select({
          date: sql<string>`DATE(${schema.tips.createdAt})`.as('date'),
          tips: sum(schema.tips.amount),
        })
        .from(schema.tips)
        .where(
          and(
            gte(schema.tips.createdAt, start),
            lte(schema.tips.createdAt, end),
          ),
        )
        .groupBy(sql`DATE(${schema.tips.createdAt})`),
    ]);

    const tipsMap = new Map<string, string>();
    for (const row of tipRows) {
      tipsMap.set(row.date, row.tips ?? '0');
    }

    const dataPoints: RevenueDataPoint[] = sessionRows.map((row) => ({
      date: row.date,
      sessionsCount: row.sessionsCount,
      revenue: row.revenue ?? '0',
      tips: tipsMap.get(row.date) ?? '0',
    }));

    const totalSessions = dataPoints.reduce((acc, p) => acc + p.sessionsCount, 0);
    const totalRevenue = dataPoints
      .reduce((acc, p) => acc + parseFloat(p.revenue), 0)
      .toFixed(2);
    const totalTips = dataPoints
      .reduce((acc, p) => acc + parseFloat(p.tips), 0)
      .toFixed(2);

    return {
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      dataPoints,
      totalSessions,
      totalRevenue,
      totalTips,
    };
  }

  async getEmployeeReport(params: EmployeeReportParams): Promise<EmployeeReportData> {
    const { start: sessionStart } = getDayBounds(params.dateFrom);
    const { end: sessionEnd } = getDayBounds(params.dateTo);

    const [sessionRows, tipRows] = await Promise.all([
      this.db
        .select({
          employeeId: schema.serviceSessions.employeeId,
          sessionsCount: countDistinct(schema.serviceSessions.id),
          revenue: sum(schema.sessionServices.priceAtTime),
          avgMinutes: avg(schema.sessionServices.durationMinutes),
        })
        .from(schema.serviceSessions)
        .leftJoin(schema.sessionServices, eq(schema.sessionServices.sessionId, schema.serviceSessions.id))
        .where(
          and(
            eq(schema.serviceSessions.status, SESSION_STATUS.COMPLETED),
            gte(schema.serviceSessions.startTime, sessionStart),
            lte(schema.serviceSessions.startTime, sessionEnd),
          ),
        )
        .groupBy(schema.serviceSessions.employeeId),

      this.db
        .select({
          employeeId: schema.tips.employeeId,
          tips: sum(schema.tips.amount),
        })
        .from(schema.tips)
        .where(
          and(
            gte(schema.tips.createdAt, sessionStart),
            lte(schema.tips.createdAt, sessionEnd),
          ),
        )
        .groupBy(schema.tips.employeeId),
    ]);

    const allEmployeeIds = [
      ...new Set([
        ...sessionRows.map((r) => r.employeeId),
      ]),
    ];

    if (allEmployeeIds.length === 0) {
      return { dateFrom: params.dateFrom, dateTo: params.dateTo, employees: [] };
    }

    const employeeRows = await this.db
      .select({ id: schema.employees.id, fullName: schema.employees.fullName })
      .from(schema.employees)
      .where(
        allEmployeeIds.length === 1
          ? eq(schema.employees.id, allEmployeeIds[0] as string)
          : inArray(schema.employees.id, allEmployeeIds),
      );

    const nameMap = new Map<string, string>();
    for (const emp of employeeRows) {
      nameMap.set(emp.id, emp.fullName);
    }

    const sessionMap = new Map<string, (typeof sessionRows)[number]>();
    for (const row of sessionRows) {
      sessionMap.set(row.employeeId, row);
    }

    const tipMap = new Map<string, string>();
    for (const row of tipRows) {
      tipMap.set(row.employeeId, row.tips ?? '0');
    }

    const employees: EmployeeReportRow[] = allEmployeeIds.map((employeeId) => {
      const session = sessionMap.get(employeeId);
      return {
        employeeId,
        fullName: nameMap.get(employeeId) ?? '',
        sessionsCount: session?.sessionsCount ?? 0,
        revenue: session?.revenue ?? '0',
        tips: tipMap.get(employeeId) ?? '0',
        avgSessionMinutes: session?.avgMinutes ?? '0',
      };
    });

    return { dateFrom: params.dateFrom, dateTo: params.dateTo, employees };
  }

  async getServiceReport(params: ServiceReportParams): Promise<ServiceReportData> {
    const { start } = getDayBounds(params.dateFrom);
    const { end } = getDayBounds(params.dateTo);

    const rows = await this.db
      .select({
        serviceId: schema.sessionServices.serviceId,
        usageCount: count(schema.sessionServices.id),
        totalRevenue: sum(schema.sessionServices.priceAtTime),
        avgPrice: avg(schema.sessionServices.priceAtTime),
      })
      .from(schema.sessionServices)
      .innerJoin(schema.serviceSessions, eq(schema.serviceSessions.id, schema.sessionServices.sessionId))
      .where(
        and(
          eq(schema.serviceSessions.status, SESSION_STATUS.COMPLETED),
          gte(schema.serviceSessions.startTime, start),
          lte(schema.serviceSessions.startTime, end),
        ),
      )
      .groupBy(schema.sessionServices.serviceId);

    if (rows.length === 0) {
      return { dateFrom: params.dateFrom, dateTo: params.dateTo, services: [] };
    }

    const serviceIds = rows.map((r) => r.serviceId);

    const serviceRows = await this.db
      .select({ id: schema.services.id, name: schema.services.name })
      .from(schema.services)
      .where(
        serviceIds.length === 1
          ? eq(schema.services.id, serviceIds[0] as string)
          : inArray(schema.services.id, serviceIds),
      );

    const nameMap = new Map<string, string>();
    for (const svc of serviceRows) {
      nameMap.set(svc.id, svc.name);
    }

    const services: ServiceReportRow[] = rows.map((row) => ({
      serviceId: row.serviceId,
      name: nameMap.get(row.serviceId) ?? '',
      usageCount: row.usageCount,
      totalRevenue: row.totalRevenue ?? '0',
      avgPrice: row.avgPrice ?? '0',
    }));

    return { dateFrom: params.dateFrom, dateTo: params.dateTo, services };
  }

  async getFinancialReport(params: FinancialReportParams): Promise<FinancialReportData> {
    const startDate = new Date(Date.UTC(params.year, params.month - 1, 1));
    const endDate = new Date(Date.UTC(params.year, params.month, 0, 23, 59, 59, 999));

    const [revenueResult, payrollResult, tipsResult, employeeSalaryRows, employeeSessionRows] =
      await Promise.all([
        this.db
          .select({ total: sum(schema.sessionServices.priceAtTime) })
          .from(schema.serviceSessions)
          .leftJoin(schema.sessionServices, eq(schema.sessionServices.sessionId, schema.serviceSessions.id))
          .where(
            and(
              eq(schema.serviceSessions.status, SESSION_STATUS.COMPLETED),
              gte(schema.serviceSessions.startTime, startDate),
              lte(schema.serviceSessions.startTime, endDate),
            ),
          ),

        this.db
          .select({ total: sum(schema.salaryRecords.netPay) })
          .from(schema.salaryRecords)
          .where(
            and(
              eq(schema.salaryRecords.month, params.month),
              eq(schema.salaryRecords.year, params.year),
            ),
          ),

        this.db
          .select({ total: sum(schema.tips.amount) })
          .from(schema.tips)
          .where(
            and(
              gte(schema.tips.createdAt, startDate),
              lte(schema.tips.createdAt, endDate),
            ),
          ),

        this.db
          .select({
            employeeId: schema.salaryRecords.employeeId,
            netPay: sum(schema.salaryRecords.netPay),
          })
          .from(schema.salaryRecords)
          .where(
            and(
              eq(schema.salaryRecords.month, params.month),
              eq(schema.salaryRecords.year, params.year),
            ),
          )
          .groupBy(schema.salaryRecords.employeeId),

        this.db
          .select({
            employeeId: schema.serviceSessions.employeeId,
            revenue: sum(schema.sessionServices.priceAtTime),
          })
          .from(schema.serviceSessions)
          .leftJoin(schema.sessionServices, eq(schema.sessionServices.sessionId, schema.serviceSessions.id))
          .where(
            and(
              eq(schema.serviceSessions.status, SESSION_STATUS.COMPLETED),
              gte(schema.serviceSessions.startTime, startDate),
              lte(schema.serviceSessions.startTime, endDate),
            ),
          )
          .groupBy(schema.serviceSessions.employeeId),
      ]);

    const totalRevenue = revenueResult[0]?.total ?? '0';
    const totalPayroll = payrollResult[0]?.total ?? '0';
    const totalTips = tipsResult[0]?.total ?? '0';
    const netProfit = (
      parseFloat(totalRevenue) +
      parseFloat(totalTips) -
      parseFloat(totalPayroll)
    ).toFixed(2);

    const allEmployeeIds = [
      ...new Set([
        ...employeeSalaryRows.map((r) => r.employeeId),
        ...employeeSessionRows.map((r) => r.employeeId),
      ]),
    ];

    if (allEmployeeIds.length === 0) {
      return {
        month: params.month,
        year: params.year,
        totalRevenue,
        totalPayroll,
        totalTips,
        netProfit,
        employees: [],
      };
    }

    const employeeRows = await this.db
      .select({ id: schema.employees.id, fullName: schema.employees.fullName, revenueSharePct: schema.employees.revenueSharePct })
      .from(schema.employees)
      .where(
        allEmployeeIds.length === 1
          ? eq(schema.employees.id, allEmployeeIds[0] as string)
          : inArray(schema.employees.id, allEmployeeIds),
      );

    const nameMap = new Map<string, string>();
    const revenueSharePctMap = new Map<string, string>();
    for (const emp of employeeRows) {
      nameMap.set(emp.id, emp.fullName);
      revenueSharePctMap.set(emp.id, emp.revenueSharePct);
    }

    const salaryMap = new Map<string, string>();
    for (const row of employeeSalaryRows) {
      salaryMap.set(row.employeeId, row.netPay ?? '0');
    }

    const sessionRevenueMap = new Map<string, string>();
    for (const row of employeeSessionRows) {
      sessionRevenueMap.set(row.employeeId, row.revenue ?? '0');
    }

    const employees: FinancialEmployeeRow[] = allEmployeeIds.map((employeeId) => {
      const revenueGenerated = sessionRevenueMap.get(employeeId) ?? '0';
      const salaryPaid = salaryMap.get(employeeId) ?? '0';
      const revenueNum = parseFloat(revenueGenerated);
      const salaryNum = parseFloat(salaryPaid);
      const sharePct = parseFloat(revenueSharePctMap.get(employeeId) ?? '0');
      const revenueShare = (revenueNum * sharePct / 100).toFixed(2);
      const profitMargin =
        revenueNum === 0 ? '0.00' : (((revenueNum - parseFloat(revenueShare)) / revenueNum) * 100).toFixed(2);

      return {
        employeeId,
        fullName: nameMap.get(employeeId) ?? '',
        revenueGenerated,
        revenueShare,
        salaryPaid,
        profitMargin,
      };
    });

    return {
      month: params.month,
      year: params.year,
      totalRevenue,
      totalPayroll,
      totalTips,
      netProfit,
      employees,
    };
  }
}
