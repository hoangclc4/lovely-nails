import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, count, desc, eq, gte, lte } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DB_TOKEN } from '../../database/database.provider';
import * as schema from '../../database/schema/index';
import { BookingIncidentRecord } from '../../database/schema/booking-incidents';
import {
  INCIDENT_NOT_FOUND_MESSAGE,
  INCIDENT_TYPE,
} from '../../common/constants/incident.constants';
import { SETTINGS_KEY } from '../../common/constants/settings.constants';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '../../common/constants/pagination.constants';
import type {
  UpdateIncidentDto,
  IncidentListParams,
  IncidentReportQuery,
  IncidentReport,
} from './schemas/incident.schemas';

type DrizzleDB = NodePgDatabase<typeof schema>;

@Injectable()
export class IncidentsService {
  constructor(@Inject(DB_TOKEN) private readonly db: DrizzleDB) {}

  async findAll(params: IncidentListParams): Promise<{
    data: BookingIncidentRecord[];
    meta: { total: number; page: number; limit: number };
  }> {
    const page = params.page ?? DEFAULT_PAGE;
    const limit = params.limit ?? DEFAULT_LIMIT;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (params.type !== undefined) {
      conditions.push(eq(schema.bookingIncidents.type, params.type));
    }
    if (params.customerId !== undefined) {
      conditions.push(eq(schema.bookingIncidents.customerId, params.customerId));
    }
    if (params.employeeId !== undefined) {
      conditions.push(eq(schema.bookingIncidents.employeeId, params.employeeId));
    }
    if (params.excused !== undefined) {
      conditions.push(eq(schema.bookingIncidents.excused, params.excused));
    }
    if (params.from !== undefined) {
      conditions.push(gte(schema.bookingIncidents.scheduledDate, params.from));
    }
    if (params.to !== undefined) {
      conditions.push(lte(schema.bookingIncidents.scheduledDate, params.to));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, totalResult] = await Promise.all([
      this.db
        .select()
        .from(schema.bookingIncidents)
        .where(where)
        .orderBy(desc(schema.bookingIncidents.createdAt))
        .limit(limit)
        .offset(offset),
      this.db.select({ value: count() }).from(schema.bookingIncidents).where(where),
    ]);

    const total = totalResult[0]?.value ?? 0;

    return { data: rows, meta: { total, page, limit } };
  }

  async findOne(id: string): Promise<BookingIncidentRecord> {
    const rows = await this.db
      .select()
      .from(schema.bookingIncidents)
      .where(eq(schema.bookingIncidents.id, id))
      .limit(1);

    const incident = rows[0];

    if (incident === undefined) {
      throw new NotFoundException(INCIDENT_NOT_FOUND_MESSAGE);
    }

    return incident;
  }

  async update(id: string, dto: UpdateIncidentDto): Promise<BookingIncidentRecord> {
    const incident = await this.findOne(id);

    const isExcusing = dto.excused === true && !incident.excused;
    const isUnexcusing = dto.excused === false && incident.excused;

    if ((isExcusing || isUnexcusing) && incident.customerId !== null) {
      await this.adjustCustomerCounts(incident, isExcusing);
    }

    const updateValues: Partial<schema.NewBookingIncidentRecord> = {};

    if (dto.excused !== undefined) updateValues.excused = dto.excused;
    if (dto.notes !== undefined) updateValues.notes = dto.notes;

    const rows = await this.db
      .update(schema.bookingIncidents)
      .set(updateValues)
      .where(eq(schema.bookingIncidents.id, id))
      .returning();

    const updated = rows[0];

    if (updated === undefined) {
      throw new NotFoundException(INCIDENT_NOT_FOUND_MESSAGE);
    }

    return updated;
  }

  private async adjustCustomerCounts(
    incident: BookingIncidentRecord,
    isExcusing: boolean,
  ): Promise<void> {
    if (incident.customerId === null) return;

    const customerRows = await this.db
      .select({
        noShowCount: schema.customers.noShowCount,
        lateCancelCount: schema.customers.lateCancelCount,
      })
      .from(schema.customers)
      .where(eq(schema.customers.id, incident.customerId))
      .limit(1);

    const customer = customerRows[0];
    if (customer === undefined) return;

    const thresholdRow = await this.db
      .select({ value: schema.salonSettings.value })
      .from(schema.salonSettings)
      .where(eq(schema.salonSettings.key, SETTINGS_KEY.NO_SHOW_THRESHOLD))
      .limit(1);
    const threshold = parseInt(thresholdRow[0]?.value ?? '2', 10);

    if (incident.type === INCIDENT_TYPE.NO_SHOW) {
      const newCount = isExcusing
        ? Math.max(0, customer.noShowCount - 1)
        : customer.noShowCount + 1;

      await this.db
        .update(schema.customers)
        .set({ noShowCount: newCount, isFlagged: newCount >= threshold })
        .where(eq(schema.customers.id, incident.customerId));
    } else {
      const newCount = isExcusing
        ? Math.max(0, customer.lateCancelCount - 1)
        : customer.lateCancelCount + 1;

      await this.db
        .update(schema.customers)
        .set({ lateCancelCount: newCount })
        .where(eq(schema.customers.id, incident.customerId));
    }
  }

  async getReport(query: IncidentReportQuery): Promise<IncidentReport> {
    const year = query.year ?? new Date().getFullYear();
    const month = query.month ?? new Date().getMonth() + 1;

    const monthStr = month.toString().padStart(2, '0');
    const fromDate = `${year}-${monthStr}-01`;
    const toDate = `${year}-${monthStr}-31`;

    const incidents = await this.db
      .select()
      .from(schema.bookingIncidents)
      .where(
        and(
          gte(schema.bookingIncidents.scheduledDate, fromDate),
          lte(schema.bookingIncidents.scheduledDate, toDate),
          eq(schema.bookingIncidents.excused, false),
        ),
      );

    const noShows = incidents.filter((i) => i.type === INCIDENT_TYPE.NO_SHOW);
    const lateCancels = incidents.filter((i) => i.type === INCIDENT_TYPE.LATE_CANCEL);
    const totalRevenueLost = noShows
      .reduce((sum, i) => sum + parseFloat(i.estimatedRevenueLost), 0)
      .toFixed(2);

    const customerCounts = new Map<string, number>();
    for (const incident of incidents) {
      if (incident.customerId === null) continue;
      customerCounts.set(incident.customerId, (customerCounts.get(incident.customerId) ?? 0) + 1);
    }

    const topOffenders = Array.from(customerCounts.entries())
      .map(([customerId, count]) => ({ customerId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      month,
      year,
      totalNoShows: noShows.length,
      totalLateCancels: lateCancels.length,
      totalRevenueLost,
      topOffenders,
    };
  }

  async findByCustomer(customerId: string): Promise<BookingIncidentRecord[]> {
    return this.db
      .select()
      .from(schema.bookingIncidents)
      .where(eq(schema.bookingIncidents.customerId, customerId))
      .orderBy(desc(schema.bookingIncidents.createdAt));
  }
}
