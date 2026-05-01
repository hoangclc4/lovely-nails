import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, count, desc, eq, gte, inArray, lte, lt, gt, ne, notInArray } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DB_TOKEN } from '../../database/database.provider';
import * as schema from '../../database/schema/index';
import { BookingRecord, NewBookingRecord } from '../../database/schema/bookings';
import { BookingIncidentRecord } from '../../database/schema/booking-incidents';
import { RedisService } from '../redis/redis.service';
import { EMPLOYEE_STATUS, EMPLOYEE_WORK_STATUS } from '../../common/constants/employee.constants';
import {
  BOOKING_STATUS,
  BOOKING_NOT_FOUND_MESSAGE,
  BOOKING_CONFLICT_MESSAGE,
} from '../../common/constants/booking.constants';
import {
  INCIDENT_TYPE,
  INCIDENT_ALREADY_RECORDED_MESSAGE,
} from '../../common/constants/incident.constants';
import { SETTINGS_KEY } from '../../common/constants/settings.constants';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '../../common/constants/pagination.constants';
import {
  type CreateBookingDto,
  type UpdateBookingDto,
  type UpdateBookingStatusDto,
  type AvailabilityQueryDto,
  type BookingListParams,
  type CalendarQueryDto,
  type AvailableEmployee,
} from './schemas/booking.schemas';

type DrizzleDB = NodePgDatabase<typeof schema>;

export type BookingWithSession = BookingRecord & { sessionId: string | null; customerName: string | null };

const BOOKING_SELECT_FIELDS = {
  id: schema.bookings.id,
  bookingNumber: schema.bookings.bookingNumber,
  customerId: schema.bookings.customerId,
  employeeId: schema.bookings.employeeId,
  serviceIds: schema.bookings.serviceIds,
  bookingDate: schema.bookings.bookingDate,
  startTime: schema.bookings.startTime,
  endTime: schema.bookings.endTime,
  status: schema.bookings.status,
  notes: schema.bookings.notes,
  createdAt: schema.bookings.createdAt,
  updatedAt: schema.bookings.updatedAt,
  sessionId: schema.serviceSessions.id,
  customerName: schema.customers.fullName,
} as const;

const CANCELLED_STATUSES = [BOOKING_STATUS.CANCELLED, BOOKING_STATUS.NO_SHOW] as const;

@Injectable()
export class BookingsService {
  constructor(
    @Inject(DB_TOKEN) private readonly db: DrizzleDB,
    private readonly redisService: RedisService,
  ) {}

  async checkAvailability(query: AvailabilityQueryDto): Promise<AvailableEmployee[]> {
    const date = new Date(query.date);
    const dayOfWeek = date.getUTCDay();

    const activeEmployees = await this.db
      .select({
        id: schema.employees.id,
        fullName: schema.employees.fullName,
      })
      .from(schema.employees)
      .where(eq(schema.employees.status, EMPLOYEE_STATUS.ACTIVE));

    const employeeSchedules = await this.db
      .select()
      .from(schema.employeeSchedule)
      .where(eq(schema.employeeSchedule.dayOfWeek, dayOfWeek));

    const offEmployeeIds = new Set(
      employeeSchedules
        .filter((s) => s.isOff)
        .map((s) => s.employeeId),
    );

    const conflictingBookings = await this.db
      .select({
        employeeId: schema.bookings.employeeId,
        endTime: schema.bookings.endTime,
      })
      .from(schema.bookings)
      .where(
        and(
          eq(schema.bookings.bookingDate, query.date),
          notInArray(schema.bookings.status, [...CANCELLED_STATUSES]),
          lt(schema.bookings.startTime, query.endTime),
          gt(schema.bookings.endTime, query.startTime),
        ),
      );

    const busyEmployeeMap = new Map<string, string>();
    for (const b of conflictingBookings) {
      const existing = busyEmployeeMap.get(b.employeeId);
      if (existing === undefined || b.endTime > existing) {
        busyEmployeeMap.set(b.employeeId, b.endTime);
      }
    }

    const redisStatuses = await this.redisService.getAllEmployeeStatuses();

    const result: AvailableEmployee[] = [];

    for (const employee of activeEmployees) {
      if (offEmployeeIds.has(employee.id)) {
        continue;
      }
      const busyUntil = busyEmployeeMap.get(employee.id);
      result.push({
        id: employee.id,
        fullName: employee.fullName,
        workStatus: redisStatuses[employee.id] ?? EMPLOYEE_WORK_STATUS.OFF,
        available: busyUntil === undefined,
        busyUntil,
      });
    }

    return result.sort((a, b) => {
      if (a.available === b.available) return 0;
      return a.available ? -1 : 1;
    });
  }

  private async checkConflict(
    employeeId: string,
    bookingDate: string,
    startTime: string,
    endTime: string,
    excludeId?: string,
  ): Promise<void> {
    const conditions = [
      eq(schema.bookings.employeeId, employeeId),
      eq(schema.bookings.bookingDate, bookingDate),
      notInArray(schema.bookings.status, [...CANCELLED_STATUSES]),
      lt(schema.bookings.startTime, endTime),
      gt(schema.bookings.endTime, startTime),
    ];

    if (excludeId !== undefined) {
      conditions.push(ne(schema.bookings.id, excludeId));
    }

    const conflicts = await this.db
      .select({ id: schema.bookings.id })
      .from(schema.bookings)
      .where(and(...conditions))
      .limit(1);

    if (conflicts.length > 0) {
      throw new ConflictException(BOOKING_CONFLICT_MESSAGE);
    }
  }

  async getNextNumber(bookingDate: string): Promise<string> {
    return this.generateBookingNumber(bookingDate);
  }

  private async generateBookingNumber(bookingDate: string): Promise<string> {
    const datePrefix = bookingDate.replace(/-/g, '');
    const result = await this.db
      .select({ value: count() })
      .from(schema.bookings)
      .where(eq(schema.bookings.bookingDate, bookingDate));
    const existingCount = result[0]?.value ?? 0;
    return `BKG-${datePrefix}-${existingCount + 1}`;
  }

  async create(dto: CreateBookingDto): Promise<BookingRecord> {
    await this.checkConflict(
      dto.employeeId,
      dto.bookingDate,
      dto.startTime,
      dto.endTime,
    );

    const bookingNumber = await this.generateBookingNumber(dto.bookingDate);

    const values: NewBookingRecord = {
      bookingNumber,
      employeeId: dto.employeeId,
      customerId: dto.customerId ?? null,
      serviceIds: dto.serviceIds,
      bookingDate: dto.bookingDate,
      startTime: dto.startTime,
      endTime: dto.endTime,
      notes: dto.notes ?? null,
    };

    const rows = await this.db.insert(schema.bookings).values(values).returning();

    const created = rows[0];

    if (created === undefined) {
      throw new Error('Failed to create booking');
    }

    return created;
  }

  async findAll(params: BookingListParams): Promise<{
    data: BookingWithSession[];
    meta: { total: number; page: number; limit: number };
  }> {
    const page = params.page ?? DEFAULT_PAGE;
    const limit = params.limit ?? DEFAULT_LIMIT;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (params.date !== undefined) {
      conditions.push(eq(schema.bookings.bookingDate, params.date));
    }

    if (params.employeeId !== undefined) {
      conditions.push(eq(schema.bookings.employeeId, params.employeeId));
    }

    if (params.status !== undefined) {
      conditions.push(eq(schema.bookings.status, params.status));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, totalResult] = await Promise.all([
      this.db
        .select(BOOKING_SELECT_FIELDS)
        .from(schema.bookings)
        .leftJoin(schema.serviceSessions, eq(schema.serviceSessions.bookingId, schema.bookings.id))
        .leftJoin(schema.customers, eq(schema.customers.id, schema.bookings.customerId))
        .where(where)
        .orderBy(desc(schema.bookings.bookingDate), desc(schema.bookings.bookingNumber))
        .limit(limit)
        .offset(offset),
      this.db.select({ value: count() }).from(schema.bookings).where(where),
    ]);

    const total = totalResult[0]?.value ?? 0;

    return { data: rows, meta: { total, page, limit } };
  }

  async findOne(id: string): Promise<BookingWithSession> {
    const rows = await this.db
      .select(BOOKING_SELECT_FIELDS)
      .from(schema.bookings)
      .leftJoin(schema.serviceSessions, eq(schema.serviceSessions.bookingId, schema.bookings.id))
      .leftJoin(schema.customers, eq(schema.customers.id, schema.bookings.customerId))
      .where(eq(schema.bookings.id, id))
      .limit(1);

    const booking = rows[0];

    if (booking === undefined) {
      throw new NotFoundException(BOOKING_NOT_FOUND_MESSAGE);
    }

    return booking;
  }

  async update(id: string, dto: UpdateBookingDto): Promise<BookingRecord> {
    const existing = await this.findOne(id);

    const resolvedEmployeeId = dto.employeeId ?? existing.employeeId;
    const resolvedDate = dto.bookingDate ?? existing.bookingDate;
    const resolvedStartTime = dto.startTime ?? existing.startTime;
    const resolvedEndTime = dto.endTime ?? existing.endTime;

    if (
      dto.employeeId !== undefined ||
      dto.bookingDate !== undefined ||
      dto.startTime !== undefined ||
      dto.endTime !== undefined
    ) {
      await this.checkConflict(resolvedEmployeeId, resolvedDate, resolvedStartTime, resolvedEndTime, id);
    }

    const updateValues: Partial<NewBookingRecord> = {};

    if (dto.employeeId !== undefined) updateValues.employeeId = dto.employeeId;
    if (dto.customerId !== undefined) updateValues.customerId = dto.customerId;
    if (dto.serviceIds !== undefined) updateValues.serviceIds = dto.serviceIds;
    if (dto.bookingDate !== undefined) updateValues.bookingDate = dto.bookingDate;
    if (dto.startTime !== undefined) updateValues.startTime = dto.startTime;
    if (dto.endTime !== undefined) updateValues.endTime = dto.endTime;
    if (dto.notes !== undefined) updateValues.notes = dto.notes;

    const rows = await this.db
      .update(schema.bookings)
      .set(updateValues)
      .where(eq(schema.bookings.id, id))
      .returning();

    const updated = rows[0];

    if (updated === undefined) {
      throw new NotFoundException(BOOKING_NOT_FOUND_MESSAGE);
    }

    return updated;
  }

  async updateStatus(id: string, dto: UpdateBookingStatusDto): Promise<BookingRecord> {
    const booking = await this.findOne(id);

    if (dto.status === BOOKING_STATUS.CANCELLED) {
      await this.recordLateCancelIfApplicable(booking);
    }

    const rows = await this.db
      .update(schema.bookings)
      .set({ status: dto.status })
      .where(eq(schema.bookings.id, id))
      .returning();

    const updated = rows[0];

    if (updated === undefined) {
      throw new NotFoundException(BOOKING_NOT_FOUND_MESSAGE);
    }

    return updated;
  }

  async markNoShow(id: string): Promise<BookingIncidentRecord> {
    const booking = await this.findOne(id);

    if (booking.status === BOOKING_STATUS.NO_SHOW) {
      throw new ConflictException(INCIDENT_ALREADY_RECORDED_MESSAGE);
    }

    const existingIncident = await this.db
      .select({ id: schema.bookingIncidents.id })
      .from(schema.bookingIncidents)
      .where(eq(schema.bookingIncidents.bookingId, id))
      .limit(1);

    if (existingIncident.length > 0) {
      throw new ConflictException(INCIDENT_ALREADY_RECORDED_MESSAGE);
    }

    const estimatedRevenueLost = await this.computeRevenueLost(booking.serviceIds);

    const thresholdRow = await this.db
      .select({ value: schema.salonSettings.value })
      .from(schema.salonSettings)
      .where(eq(schema.salonSettings.key, SETTINGS_KEY.NO_SHOW_THRESHOLD))
      .limit(1);
    const threshold = parseInt(thresholdRow[0]?.value ?? '2', 10);

    const [incidentRows] = await Promise.all([
      this.db
        .insert(schema.bookingIncidents)
        .values({
          bookingId: id,
          customerId: booking.customerId,
          employeeId: booking.employeeId,
          type: INCIDENT_TYPE.NO_SHOW,
          scheduledDate: booking.bookingDate,
          scheduledTime: booking.startTime,
          estimatedRevenueLost,
        })
        .returning(),
      this.db
        .update(schema.bookings)
        .set({ status: BOOKING_STATUS.NO_SHOW })
        .where(eq(schema.bookings.id, id)),
    ]);

    const incident = incidentRows[0];

    if (incident === undefined) {
      throw new Error('Failed to create incident');
    }

    if (booking.customerId !== null) {
      await this.updateCustomerNoShowCount(booking.customerId, threshold);
    }

    return incident;
  }

  private async recordLateCancelIfApplicable(booking: BookingRecord): Promise<void> {
    const windowRow = await this.db
      .select({ value: schema.salonSettings.value })
      .from(schema.salonSettings)
      .where(eq(schema.salonSettings.key, SETTINGS_KEY.CANCELLATION_WINDOW_HOURS))
      .limit(1);
    const windowHours = parseInt(windowRow[0]?.value ?? '24', 10);

    const now = new Date();
    const scheduledDateTime = new Date(`${booking.bookingDate}T${booking.startTime}:00`);
    const diffHours = (scheduledDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < 0 || diffHours > windowHours) {
      return;
    }

    const existing = await this.db
      .select({ id: schema.bookingIncidents.id })
      .from(schema.bookingIncidents)
      .where(eq(schema.bookingIncidents.bookingId, booking.id))
      .limit(1);

    if (existing.length > 0) {
      return;
    }

    await this.db.insert(schema.bookingIncidents).values({
      bookingId: booking.id,
      customerId: booking.customerId,
      employeeId: booking.employeeId,
      type: INCIDENT_TYPE.LATE_CANCEL,
      scheduledDate: booking.bookingDate,
      scheduledTime: booking.startTime,
    });

    if (booking.customerId !== null) {
      const customerRows = await this.db
        .select({ lateCancelCount: schema.customers.lateCancelCount })
        .from(schema.customers)
        .where(eq(schema.customers.id, booking.customerId))
        .limit(1);

      const customer = customerRows[0];
      if (customer !== undefined) {
        await this.db
          .update(schema.customers)
          .set({ lateCancelCount: customer.lateCancelCount + 1 })
          .where(eq(schema.customers.id, booking.customerId));
      }
    }
  }

  private async updateCustomerNoShowCount(customerId: string, threshold: number): Promise<void> {
    const customerRows = await this.db
      .select({ noShowCount: schema.customers.noShowCount, isFlagged: schema.customers.isFlagged })
      .from(schema.customers)
      .where(eq(schema.customers.id, customerId))
      .limit(1);

    const customer = customerRows[0];
    if (customer === undefined) return;

    const newNoShowCount = customer.noShowCount + 1;
    const newIsFlagged = customer.isFlagged || newNoShowCount >= threshold;

    await this.db
      .update(schema.customers)
      .set({ noShowCount: newNoShowCount, isFlagged: newIsFlagged })
      .where(eq(schema.customers.id, customerId));
  }

  private async computeRevenueLost(serviceIds: string[]): Promise<string> {
    if (serviceIds.length === 0) return '0';

    const serviceRows = await this.db
      .select({ price: schema.services.price })
      .from(schema.services)
      .where(inArray(schema.services.id, serviceIds));

    const total = serviceRows.reduce((sum, s) => sum + parseFloat(s.price), 0);
    return total.toFixed(2);
  }

  async remove(id: string): Promise<BookingRecord> {
    await this.findOne(id);

    const rows = await this.db
      .update(schema.bookings)
      .set({ status: BOOKING_STATUS.CANCELLED })
      .where(eq(schema.bookings.id, id))
      .returning();

    const updated = rows[0];

    if (updated === undefined) {
      throw new NotFoundException(BOOKING_NOT_FOUND_MESSAGE);
    }

    return updated;
  }

  async getCalendar(query: CalendarQueryDto): Promise<Record<string, (BookingRecord & { employeeName: string })[]>> {
    const rows = await this.db
      .select({
        id: schema.bookings.id,
        bookingNumber: schema.bookings.bookingNumber,
        customerId: schema.bookings.customerId,
        employeeId: schema.bookings.employeeId,
        serviceIds: schema.bookings.serviceIds,
        bookingDate: schema.bookings.bookingDate,
        startTime: schema.bookings.startTime,
        endTime: schema.bookings.endTime,
        status: schema.bookings.status,
        notes: schema.bookings.notes,
        createdAt: schema.bookings.createdAt,
        updatedAt: schema.bookings.updatedAt,
        employeeName: schema.employees.fullName,
      })
      .from(schema.bookings)
      .innerJoin(schema.employees, eq(schema.bookings.employeeId, schema.employees.id))
      .where(
        and(
          gte(schema.bookings.bookingDate, query.startDate),
          lte(schema.bookings.bookingDate, query.endDate),
        ),
      );

    const grouped: Record<string, (BookingRecord & { employeeName: string })[]> = {};

    for (const booking of rows) {
      const date = booking.bookingDate;
      if (grouped[date] === undefined) {
        grouped[date] = [];
      }
      grouped[date].push(booking);
    }

    return grouped;
  }
}
