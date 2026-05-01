import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { and, count, eq, gt, lt, notInArray } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DB_TOKEN } from '../../database/database.provider';
import * as schema from '../../database/schema/index';
import { EMPLOYEE_STATUS } from '../../common/constants/employee.constants';
import { BOOKING_STATUS, BOOKING_CONFLICT_MESSAGE } from '../../common/constants/booking.constants';
import {
  type PublicAvailabilityQueryDto,
  type PublicCreateBookingDto,
  type PublicService as PublicServiceDto,
  type PublicEmployee,
  type PublicBookingResult,
} from './schemas/public.schemas';

type DrizzleDB = NodePgDatabase<typeof schema>;

const CANCELLED_STATUSES = [BOOKING_STATUS.CANCELLED, BOOKING_STATUS.NO_SHOW] as const;

const NO_AVAILABLE_TECHNICIAN_MESSAGE = 'No technicians available for this time slot.';

const FIRST_AVAILABLE_INDEX = 0;

@Injectable()
export class PublicService {
  constructor(@Inject(DB_TOKEN) private readonly db: DrizzleDB) {}

  async getServices(): Promise<PublicServiceDto[]> {
    const rows = await this.db
      .select({
        id: schema.services.id,
        name: schema.services.name,
        description: schema.services.description,
        price: schema.services.price,
        durationMinutes: schema.services.durationMinutes,
        categoryId: schema.services.categoryId,
        categoryName: schema.serviceCategories.name,
        imageUrl: schema.services.imageUrl,
      })
      .from(schema.services)
      .leftJoin(
        schema.serviceCategories,
        eq(schema.services.categoryId, schema.serviceCategories.id),
      )
      .where(eq(schema.services.isActive, true));

    return rows.map((row): PublicServiceDto => ({
      id: row.id,
      name: row.name,
      description: row.description ?? null,
      price: row.price,
      durationMinutes: row.durationMinutes,
      categoryId: row.categoryId ?? null,
      categoryName: row.categoryName ?? null,
      imageUrl: row.imageUrl ?? null,
    }));
  }

  async getAvailableEmployees(query: PublicAvailabilityQueryDto): Promise<PublicEmployee[]> {
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
      .select({ employeeId: schema.bookings.employeeId })
      .from(schema.bookings)
      .where(
        and(
          eq(schema.bookings.bookingDate, query.date),
          notInArray(schema.bookings.status, [...CANCELLED_STATUSES]),
          lt(schema.bookings.startTime, query.endTime),
          gt(schema.bookings.endTime, query.startTime),
        ),
      );

    const busyEmployeeIds = new Set(conflictingBookings.map((b) => b.employeeId));

    const available: PublicEmployee[] = [];

    for (const employee of activeEmployees) {
      if (offEmployeeIds.has(employee.id)) {
        continue;
      }
      if (busyEmployeeIds.has(employee.id)) {
        continue;
      }
      available.push({ id: employee.id, fullName: employee.fullName });
    }

    return available;
  }

  async createPublicBooking(dto: PublicCreateBookingDto): Promise<PublicBookingResult> {
    const existingCustomers = await this.db
      .select()
      .from(schema.customers)
      .where(eq(schema.customers.phone, dto.customerPhone))
      .limit(1);

    const existingCustomer = existingCustomers[FIRST_AVAILABLE_INDEX];

    const customer = existingCustomer ?? await this.insertNewCustomer(dto.customerName, dto.customerPhone);

    const resolvedEmployeeId = await this.resolveEmployeeId(dto);

    const bookingNumber = await this.generateBookingNumber(dto.bookingDate);

    const rows = await this.db
      .insert(schema.bookings)
      .values({
        bookingNumber,
        employeeId: resolvedEmployeeId,
        customerId: customer.id,
        serviceIds: dto.serviceIds,
        bookingDate: dto.bookingDate,
        startTime: dto.startTime,
        endTime: dto.endTime,
        notes: dto.notes ?? null,
      })
      .returning();

    const created = rows[FIRST_AVAILABLE_INDEX];

    if (created === undefined) {
      throw new Error('Failed to create booking');
    }

    return {
      bookingNumber: created.bookingNumber,
      status: created.status,
      bookingDate: dto.bookingDate,
      startTime: dto.startTime,
      endTime: dto.endTime,
      customerName: dto.customerName,
    };
  }

  private async insertNewCustomer(fullName: string, phone: string): Promise<{ id: string }> {
    const rows = await this.db
      .insert(schema.customers)
      .values({ fullName, phone })
      .returning({ id: schema.customers.id });

    const inserted = rows[FIRST_AVAILABLE_INDEX];

    if (inserted === undefined) {
      throw new Error('Failed to create customer');
    }

    return inserted;
  }

  private async resolveEmployeeId(dto: PublicCreateBookingDto): Promise<string> {
    if (dto.employeeId !== undefined) {
      await this.checkConflict(dto.employeeId, dto.bookingDate, dto.startTime, dto.endTime);
      return dto.employeeId;
    }

    const available = await this.getAvailableEmployees({
      date: dto.bookingDate,
      startTime: dto.startTime,
      endTime: dto.endTime,
    });

    const first = available[FIRST_AVAILABLE_INDEX];

    if (first === undefined) {
      throw new ConflictException(NO_AVAILABLE_TECHNICIAN_MESSAGE);
    }

    return first.id;
  }

  private async checkConflict(
    employeeId: string,
    bookingDate: string,
    startTime: string,
    endTime: string,
  ): Promise<void> {
    const conflicts = await this.db
      .select({ id: schema.bookings.id })
      .from(schema.bookings)
      .where(
        and(
          eq(schema.bookings.employeeId, employeeId),
          eq(schema.bookings.bookingDate, bookingDate),
          notInArray(schema.bookings.status, [...CANCELLED_STATUSES]),
          lt(schema.bookings.startTime, endTime),
          gt(schema.bookings.endTime, startTime),
        ),
      )
      .limit(1);

    if (conflicts.length > 0) {
      throw new ConflictException(BOOKING_CONFLICT_MESSAGE);
    }
  }

  private async generateBookingNumber(bookingDate: string): Promise<string> {
    const datePrefix = bookingDate.replace(/-/g, '');
    const result = await this.db
      .select({ value: count() })
      .from(schema.bookings)
      .where(eq(schema.bookings.bookingDate, bookingDate));
    const existingCount = result[FIRST_AVAILABLE_INDEX]?.value ?? 0;
    return `BKG-${datePrefix}-${existingCount + 1}`;
  }
}
