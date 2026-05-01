import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, count, eq, getTableColumns, gte, lte, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DB_TOKEN } from '../../database/database.provider';
import * as schema from '../../database/schema/index';
import { ServiceSessionRecord } from '../../database/schema/service-sessions';
import { SessionServiceRecord } from '../../database/schema/session-services';
import { SessionAddOnRecord } from '../../database/schema/session-add-ons';
import { SessionTimeExtensionRecord } from '../../database/schema/session-time-extensions';
import { RedisService } from '../redis/redis.service';
import { EMPLOYEE_WORK_STATUS } from '../../common/constants/employee.constants';
import { SESSION_STATUS, SESSION_ERROR } from '../../common/constants/session.constants';
import { BOOKING_STATUS } from '../../common/constants/booking.constants';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '../../common/constants/pagination.constants';
import {
  type CreateSessionDto,
  type AddSessionServiceDto,
  type AddSessionAddOnDto,
  type AddTimeExtensionDto,
  type SessionListParams,
} from './schemas/service-session.schemas';

type DrizzleDB = NodePgDatabase<typeof schema>;

export interface SessionDetail extends ServiceSessionRecord {
  services: SessionServiceRecord[];
  addOns: SessionAddOnRecord[];
  extensions: SessionTimeExtensionRecord[];
}

@Injectable()
export class ServiceSessionsService {
  constructor(
    @Inject(DB_TOKEN) private readonly db: DrizzleDB,
    private readonly redisService: RedisService,
  ) {}

  async getNextNumber(date: string): Promise<string> {
    return this.generateSessionNumber(date);
  }

  async create(dto: CreateSessionDto): Promise<SessionDetail> {
    const startTime = dto.startTime !== undefined ? new Date(dto.startTime) : new Date();
    const sessionDate = startTime.toISOString().slice(0, 10);
    const sessionNumber = await this.generateSessionNumber(sessionDate);

    const sessionRows = await this.db.transaction(async (tx) => {
      const inserted = await tx
        .insert(schema.serviceSessions)
        .values({
          sessionNumber,
          employeeId: dto.employeeId,
          customerId: dto.customerId ?? null,
          customerName: dto.customerName ?? null,
          bookingId: dto.bookingId ?? null,
          startTime,
          notes: dto.notes ?? null,
          status: SESSION_STATUS.IN_PROGRESS,
        })
        .returning();

      const session = inserted[0];
      if (session === undefined) {
        throw new Error('Failed to create session');
      }

      const serviceRecords = await Promise.all(
        dto.serviceIds.map(async (serviceId) => {
          const serviceRows = await tx
            .select()
            .from(schema.services)
            .where(eq(schema.services.id, serviceId))
            .limit(1);

          const service = serviceRows[0];
          if (service === undefined) {
            throw new NotFoundException(`Service not found: ${serviceId}`);
          }

          const rows = await tx
            .insert(schema.sessionServices)
            .values({
              sessionId: session.id,
              serviceId,
              priceAtTime: service.price,
              durationMinutes: service.durationMinutes,
            })
            .returning();

          const row = rows[0];
          if (row === undefined) {
            throw new Error('Failed to insert session service');
          }
          return row;
        }),
      );

      const addOns = dto.addOns ?? [];
      const addOnRecords = await Promise.all(
        addOns.map(async (addOn) => {
          const rows = await tx
            .insert(schema.sessionAddOns)
            .values({
              sessionId: session.id,
              name: addOn.name,
              priceAtTime: String(addOn.price),
            })
            .returning();

          const row = rows[0];
          if (row === undefined) {
            throw new Error('Failed to insert session add-on');
          }
          return row;
        }),
      );

      return { session, serviceRecords, addOnRecords };
    });

    await this.redisService.setEmployeeStatus(dto.employeeId, EMPLOYEE_WORK_STATUS.BUSY);

    return {
      ...sessionRows.session,
      services: sessionRows.serviceRecords,
      addOns: sessionRows.addOnRecords,
      extensions: [],
    };
  }

  async complete(id: string): Promise<ServiceSessionRecord> {
    const session = await this.findSessionRecord(id);

    if (session.status === SESSION_STATUS.COMPLETED) {
      throw new BadRequestException(SESSION_ERROR.ALREADY_COMPLETED);
    }

    if (session.status === SESSION_STATUS.CANCELLED) {
      throw new BadRequestException(SESSION_ERROR.ALREADY_CANCELLED);
    }

    const rows = await this.db
      .update(schema.serviceSessions)
      .set({ status: SESSION_STATUS.COMPLETED, endTime: new Date() })
      .where(eq(schema.serviceSessions.id, id))
      .returning();

    const updated = rows[0];
    if (updated === undefined) {
      throw new NotFoundException(SESSION_ERROR.NOT_FOUND);
    }

    await this.redisService.setEmployeeStatus(session.employeeId, EMPLOYEE_WORK_STATUS.FREE);

    if (session.bookingId !== null) {
      await this.db
        .update(schema.bookings)
        .set({ status: BOOKING_STATUS.COMPLETED })
        .where(eq(schema.bookings.id, session.bookingId));
    }

    return updated;
  }

  async cancel(id: string): Promise<ServiceSessionRecord> {
    const session = await this.findSessionRecord(id);

    if (session.status === SESSION_STATUS.COMPLETED) {
      throw new BadRequestException(SESSION_ERROR.ALREADY_COMPLETED);
    }

    if (session.status === SESSION_STATUS.CANCELLED) {
      throw new BadRequestException(SESSION_ERROR.ALREADY_CANCELLED);
    }

    const rows = await this.db
      .update(schema.serviceSessions)
      .set({ status: SESSION_STATUS.CANCELLED, endTime: new Date() })
      .where(eq(schema.serviceSessions.id, id))
      .returning();

    const updated = rows[0];
    if (updated === undefined) {
      throw new NotFoundException(SESSION_ERROR.NOT_FOUND);
    }

    await this.redisService.setEmployeeStatus(session.employeeId, EMPLOYEE_WORK_STATUS.FREE);

    return updated;
  }

  async findAll(params: SessionListParams): Promise<{
    data: (ServiceSessionRecord & { totalAmount: string })[];
    meta: { total: number; page: number; limit: number };
  }> {
    const page = params.page ?? DEFAULT_PAGE;
    const limit = params.limit ?? DEFAULT_LIMIT;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (params.employeeId !== undefined) {
      conditions.push(eq(schema.serviceSessions.employeeId, params.employeeId));
    }

    if (params.customerId !== undefined) {
      conditions.push(eq(schema.serviceSessions.customerId, params.customerId));
    }

    if (params.status !== undefined) {
      conditions.push(eq(schema.serviceSessions.status, params.status));
    }

    if (params.dateFrom !== undefined) {
      conditions.push(gte(schema.serviceSessions.startTime, new Date(params.dateFrom)));
    }

    if (params.dateTo !== undefined) {
      conditions.push(lte(schema.serviceSessions.startTime, new Date(params.dateTo)));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const totalAmountExpr = sql<string>`(
      COALESCE((SELECT SUM(ss.price_at_time) FROM session_services ss WHERE ss.session_id = service_sessions.id), 0) +
      COALESCE((SELECT SUM(sa.price_at_time) FROM session_add_ons sa WHERE sa.session_id = service_sessions.id), 0)
    )::numeric`;

    const [rows, totalResult] = await Promise.all([
      this.db
        .select({ ...getTableColumns(schema.serviceSessions), totalAmount: totalAmountExpr })
        .from(schema.serviceSessions)
        .where(where)
        .limit(limit)
        .offset(offset),
      this.db.select({ value: count() }).from(schema.serviceSessions).where(where),
    ]);

    const total = totalResult[0]?.value ?? 0;

    return { data: rows, meta: { total, page, limit } };
  }

  async findOne(id: string): Promise<SessionDetail> {
    const session = await this.findSessionRecord(id);

    const [services, addOns, extensions] = await Promise.all([
      this.db
        .select()
        .from(schema.sessionServices)
        .where(eq(schema.sessionServices.sessionId, id)),
      this.db
        .select()
        .from(schema.sessionAddOns)
        .where(eq(schema.sessionAddOns.sessionId, id)),
      this.db
        .select()
        .from(schema.sessionTimeExtensions)
        .where(eq(schema.sessionTimeExtensions.sessionId, id)),
    ]);

    let resolvedCustomerName = session.customerName;
    if (session.customerId !== null && session.customerName === null) {
      const customerRows = await this.db
        .select({ fullName: schema.customers.fullName })
        .from(schema.customers)
        .where(eq(schema.customers.id, session.customerId))
        .limit(1);
      resolvedCustomerName = customerRows[0]?.fullName ?? null;
    }

    return { ...session, customerName: resolvedCustomerName, services, addOns, extensions };
  }

  async addService(id: string, dto: AddSessionServiceDto): Promise<SessionServiceRecord> {
    const session = await this.findSessionRecord(id);

    if (session.status !== SESSION_STATUS.IN_PROGRESS) {
      throw new BadRequestException(SESSION_ERROR.NOT_IN_PROGRESS);
    }

    const serviceRows = await this.db
      .select()
      .from(schema.services)
      .where(eq(schema.services.id, dto.serviceId))
      .limit(1);

    const service = serviceRows[0];
    if (service === undefined) {
      throw new NotFoundException(`Service not found: ${dto.serviceId}`);
    }

    const rows = await this.db
      .insert(schema.sessionServices)
      .values({
        sessionId: id,
        serviceId: dto.serviceId,
        priceAtTime: service.price,
        durationMinutes: service.durationMinutes,
      })
      .returning();

    const inserted = rows[0];
    if (inserted === undefined) {
      throw new Error('Failed to add service to session');
    }

    return inserted;
  }

  async addAddOn(id: string, dto: AddSessionAddOnDto): Promise<SessionAddOnRecord> {
    const session = await this.findSessionRecord(id);

    if (session.status !== SESSION_STATUS.IN_PROGRESS) {
      throw new BadRequestException(SESSION_ERROR.NOT_IN_PROGRESS);
    }

    const rows = await this.db
      .insert(schema.sessionAddOns)
      .values({
        sessionId: id,
        name: dto.name,
        priceAtTime: String(dto.price),
      })
      .returning();

    const inserted = rows[0];
    if (inserted === undefined) {
      throw new Error('Failed to add add-on to session');
    }

    return inserted;
  }

  async extendTime(id: string, dto: AddTimeExtensionDto): Promise<SessionTimeExtensionRecord> {
    await this.findSessionRecord(id);

    const rows = await this.db
      .insert(schema.sessionTimeExtensions)
      .values({
        sessionId: id,
        extraMinutes: dto.extraMinutes,
        reason: dto.reason,
      })
      .returning();

    const inserted = rows[0];
    if (inserted === undefined) {
      throw new Error('Failed to add time extension');
    }

    return inserted;
  }

  async findExtensions(id: string): Promise<SessionTimeExtensionRecord[]> {
    await this.findSessionRecord(id);

    return this.db
      .select()
      .from(schema.sessionTimeExtensions)
      .where(eq(schema.sessionTimeExtensions.sessionId, id));
  }

  private async findSessionRecord(id: string): Promise<ServiceSessionRecord> {
    const rows = await this.db
      .select()
      .from(schema.serviceSessions)
      .where(eq(schema.serviceSessions.id, id))
      .limit(1);

    const record = rows[0];
    if (record === undefined) {
      throw new NotFoundException(SESSION_ERROR.NOT_FOUND);
    }

    return record;
  }

  private async generateSessionNumber(sessionDate: string): Promise<string> {
    const datePrefix = sessionDate.replace(/-/g, '');
    const dayStart = new Date(`${sessionDate}T00:00:00.000Z`);
    const dayEnd = new Date(`${sessionDate}T23:59:59.999Z`);
    const result = await this.db
      .select({ value: count() })
      .from(schema.serviceSessions)
      .where(
        and(
          gte(schema.serviceSessions.startTime, dayStart),
          lte(schema.serviceSessions.startTime, dayEnd),
        ),
      );
    const existingCount = result[0]?.value ?? 0;
    return `SSN-${datePrefix}-${existingCount + 1}`;
  }
}
