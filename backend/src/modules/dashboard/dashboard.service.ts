import { Inject, Injectable } from '@nestjs/common';
import { and, count, countDistinct, eq, gte, inArray, lte, sum } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DB_TOKEN } from '../../database/database.provider';
import * as schema from '../../database/schema/index';
import { RedisService } from '../redis/redis.service';
import { EMPLOYEE_STATUS, EMPLOYEE_WORK_STATUS } from '../../common/constants/employee.constants';
import { SESSION_STATUS } from '../../common/constants/session.constants';
import type { LiveDashboardData, DailySummaryData, DailySummaryEmployee } from './schemas/dashboard.schemas';

type DrizzleDB = NodePgDatabase<typeof schema>;

const DEFAULT_WORK_STATUS = EMPLOYEE_WORK_STATUS.FREE;

function getTodayString(): string {
  return new Date().toISOString().split('T')[0] as string;
}

function getDayBounds(dateStr: string): { start: Date; end: Date } {
  const start = new Date(`${dateStr}T00:00:00.000Z`);
  const end = new Date(`${dateStr}T23:59:59.999Z`);
  return { start, end };
}

@Injectable()
export class DashboardService {
  constructor(
    @Inject(DB_TOKEN) private readonly db: DrizzleDB,
    private readonly redisService: RedisService,
  ) {}

  async getLive(date?: string): Promise<LiveDashboardData> {
    const resolvedDate = date ?? getTodayString();
    const { start, end } = getDayBounds(resolvedDate);

    const [activeEmployees, redisStatuses, bookingRows, activeSessionRows, completedStats, todayTipsResult] =
      await Promise.all([
        this.db
          .select({
            id: schema.employees.id,
            fullName: schema.employees.fullName,
            status: schema.employees.status,
          })
          .from(schema.employees)
          .where(eq(schema.employees.status, EMPLOYEE_STATUS.ACTIVE)),

        this.redisService.getAllEmployeeStatuses(),

        this.db
          .select({
            id: schema.bookings.id,
            employeeId: schema.bookings.employeeId,
            customerId: schema.bookings.customerId,
            startTime: schema.bookings.startTime,
            endTime: schema.bookings.endTime,
            status: schema.bookings.status,
            notes: schema.bookings.notes,
            totalAmount: sum(schema.sessionServices.priceAtTime),
          })
          .from(schema.bookings)
          .leftJoin(schema.serviceSessions, eq(schema.serviceSessions.bookingId, schema.bookings.id))
          .leftJoin(schema.sessionServices, eq(schema.sessionServices.sessionId, schema.serviceSessions.id))
          .where(eq(schema.bookings.bookingDate, resolvedDate))
          .groupBy(
            schema.bookings.id,
            schema.bookings.employeeId,
            schema.bookings.customerId,
            schema.bookings.startTime,
            schema.bookings.endTime,
            schema.bookings.status,
            schema.bookings.notes,
          ),

        this.db
          .select({
            id: schema.serviceSessions.id,
            sessionNumber: schema.serviceSessions.sessionNumber,
            employeeId: schema.serviceSessions.employeeId,
            customerId: schema.serviceSessions.customerId,
            startTime: schema.serviceSessions.startTime,
            status: schema.serviceSessions.status,
          })
          .from(schema.serviceSessions)
          .where(eq(schema.serviceSessions.status, SESSION_STATUS.IN_PROGRESS)),

        this.db
          .select({
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
          ),

        this.db
          .select({ totalTips: sum(schema.tips.amount) })
          .from(schema.tips)
          .where(
            and(
              gte(schema.tips.createdAt, start),
              lte(schema.tips.createdAt, end),
            ),
          ),
      ]);

    const statsRow = completedStats[0];
    const completedSessionsCount = statsRow?.sessionsCount ?? 0;
    const todayRevenue = statsRow?.revenue ?? '0';
    const todayTips = todayTipsResult[0]?.totalTips ?? '0';

    return {
      employeeStatuses: activeEmployees.map((emp) => ({
        id: emp.id,
        fullName: emp.fullName,
        employeeStatus: emp.status,
        workStatus: redisStatuses[emp.id] ?? DEFAULT_WORK_STATUS,
      })),
      todaysBookings: bookingRows.map((b) => ({
        id: b.id,
        employeeId: b.employeeId,
        customerId: b.customerId,
        startTime: b.startTime,
        endTime: b.endTime,
        status: b.status,
        notes: b.notes,
        totalAmount: b.totalAmount,
      })),
      activeSessions: activeSessionRows.map((s) => ({
        id: s.id,
        sessionNumber: s.sessionNumber,
        employeeId: s.employeeId,
        customerId: s.customerId,
        startTime: s.startTime.toISOString(),
        status: s.status,
      })),
      todayStats: {
        customersServed: completedSessionsCount,
        totalRevenue: todayRevenue,
        totalTips: todayTips,
        completedSessions: completedSessionsCount,
      },
    };
  }

  async getDailySummary(date?: string): Promise<DailySummaryData> {
    const resolvedDate = date ?? getTodayString();
    const { start, end } = getDayBounds(resolvedDate);

    const [completedSessions, totalRevenueResult, totalTipsResult] = await Promise.all([
      this.db
        .select({
          id: schema.serviceSessions.id,
          employeeId: schema.serviceSessions.employeeId,
        })
        .from(schema.serviceSessions)
        .where(
          and(
            eq(schema.serviceSessions.status, SESSION_STATUS.COMPLETED),
            gte(schema.serviceSessions.startTime, start),
            lte(schema.serviceSessions.startTime, end),
          ),
        ),

      this.db
        .select({ total: sum(schema.sessionServices.priceAtTime) })
        .from(schema.serviceSessions)
        .leftJoin(schema.sessionServices, eq(schema.sessionServices.sessionId, schema.serviceSessions.id))
        .where(
          and(
            eq(schema.serviceSessions.status, SESSION_STATUS.COMPLETED),
            gte(schema.serviceSessions.startTime, start),
            lte(schema.serviceSessions.startTime, end),
          ),
        ),

      this.db
        .select({ total: sum(schema.tips.amount) })
        .from(schema.tips)
        .where(
          and(
            gte(schema.tips.createdAt, start),
            lte(schema.tips.createdAt, end),
          ),
        ),
    ]);

    const completedSessionIds = completedSessions.map((s) => s.id);

    const employeeBreakdown = await this.buildEmployeeBreakdown(
      completedSessions,
      completedSessionIds,
      start,
      end,
    );

    return {
      date: resolvedDate,
      completedSessionsCount: completedSessions.length,
      totalRevenue: totalRevenueResult[0]?.total ?? '0',
      totalTips: totalTipsResult[0]?.total ?? '0',
      employeeBreakdown,
    };
  }

  private async buildEmployeeBreakdown(
    completedSessions: { id: string; employeeId: string }[],
    completedSessionIds: string[],
    start: Date,
    end: Date,
  ): Promise<DailySummaryEmployee[]> {
    if (completedSessions.length === 0) {
      return [];
    }

    const employeeIds = [...new Set(completedSessions.map((s) => s.employeeId))];

    const [employeeRows, revenueRows, tipRows] = await Promise.all([
      this.db
        .select({ id: schema.employees.id, fullName: schema.employees.fullName })
        .from(schema.employees)
        .where(
          employeeIds.length === 1
            ? eq(schema.employees.id, employeeIds[0] as string)
            : inArray(schema.employees.id, employeeIds),
        ),

      completedSessionIds.length > 0
        ? this.db
            .select({
              sessionId: schema.sessionServices.sessionId,
              revenue: sum(schema.sessionServices.priceAtTime),
            })
            .from(schema.sessionServices)
            .where(inArray(schema.sessionServices.sessionId, completedSessionIds))
            .groupBy(schema.sessionServices.sessionId)
        : Promise.resolve([]),

      this.db
        .select({
          employeeId: schema.tips.employeeId,
          tips: sum(schema.tips.amount),
        })
        .from(schema.tips)
        .where(
          and(
            gte(schema.tips.createdAt, start),
            lte(schema.tips.createdAt, end),
            inArray(schema.tips.employeeId, employeeIds),
          ),
        )
        .groupBy(schema.tips.employeeId),
    ]);

    const sessionRevenueMap = new Map<string, string>();
    for (const row of revenueRows) {
      sessionRevenueMap.set(row.sessionId, row.revenue ?? '0');
    }

    const employeeTipsMap = new Map<string, string>();
    for (const row of tipRows) {
      employeeTipsMap.set(row.employeeId, row.tips ?? '0');
    }

    const employeeNameMap = new Map<string, string>();
    for (const emp of employeeRows) {
      employeeNameMap.set(emp.id, emp.fullName);
    }

    const employeeSessionsMap = new Map<string, string[]>();
    for (const session of completedSessions) {
      const existing = employeeSessionsMap.get(session.employeeId) ?? [];
      existing.push(session.id);
      employeeSessionsMap.set(session.employeeId, existing);
    }

    return employeeIds.map((employeeId) => {
      const sessions = employeeSessionsMap.get(employeeId) ?? [];
      const revenue = sessions.reduce((acc, sessionId) => {
        return acc + parseFloat(sessionRevenueMap.get(sessionId) ?? '0');
      }, 0);

      return {
        employeeId,
        fullName: employeeNameMap.get(employeeId) ?? '',
        sessionsCount: sessions.length,
        revenue: revenue.toFixed(2),
        tips: employeeTipsMap.get(employeeId) ?? '0',
      };
    });
  }
}
