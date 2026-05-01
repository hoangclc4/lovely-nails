import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DB_TOKEN } from '../../database/database.provider';
import * as schema from '../../database/schema/index';
import { EmployeeScheduleRecord } from '../../database/schema/employee-schedule';
import {
  type UpsertEmployeeScheduleDto,
  type EmployeeScheduleListParams,
} from './schemas/employee-schedule.schemas';

type DrizzleDB = NodePgDatabase<typeof schema>;

@Injectable()
export class EmployeeScheduleService {
  constructor(@Inject(DB_TOKEN) private readonly db: DrizzleDB) {}

  async findAll(params: EmployeeScheduleListParams): Promise<EmployeeScheduleRecord[]> {
    if (params.employeeId !== undefined) {
      return this.db
        .select()
        .from(schema.employeeSchedule)
        .where(eq(schema.employeeSchedule.employeeId, params.employeeId));
    }

    return this.db.select().from(schema.employeeSchedule);
  }

  async upsert(
    employeeId: string,
    dayOfWeek: number,
    dto: UpsertEmployeeScheduleDto,
  ): Promise<EmployeeScheduleRecord> {
    const existing = await this.db
      .select()
      .from(schema.employeeSchedule)
      .where(
        and(
          eq(schema.employeeSchedule.employeeId, employeeId),
          eq(schema.employeeSchedule.dayOfWeek, dayOfWeek),
        ),
      )
      .limit(1);

    const row = existing[0];

    if (row !== undefined) {
      const rows = await this.db
        .update(schema.employeeSchedule)
        .set({
          startTime: dto.startTime,
          endTime: dto.endTime,
          isOff: dto.isOff ?? false,
        })
        .where(eq(schema.employeeSchedule.id, row.id))
        .returning();

      const updated = rows[0];

      if (updated === undefined) {
        throw new Error('Failed to update employee schedule');
      }

      return updated;
    }

    const rows = await this.db
      .insert(schema.employeeSchedule)
      .values({
        employeeId,
        dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
        isOff: dto.isOff ?? false,
      })
      .returning();

    const created = rows[0];

    if (created === undefined) {
      throw new Error('Failed to create employee schedule');
    }

    return created;
  }
}
