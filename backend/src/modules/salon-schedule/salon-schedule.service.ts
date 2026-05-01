import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DB_TOKEN } from '../../database/database.provider';
import * as schema from '../../database/schema/index';
import { SalonScheduleRecord } from '../../database/schema/salon-schedule';
import { type UpsertSalonScheduleDto } from './schemas/salon-schedule.schemas';

type DrizzleDB = NodePgDatabase<typeof schema>;

@Injectable()
export class SalonScheduleService {
  constructor(@Inject(DB_TOKEN) private readonly db: DrizzleDB) {}

  async findAll(): Promise<SalonScheduleRecord[]> {
    return this.db.select().from(schema.salonSchedule);
  }

  async upsert(dayOfWeek: number, dto: UpsertSalonScheduleDto): Promise<SalonScheduleRecord> {
    const existing = await this.db
      .select()
      .from(schema.salonSchedule)
      .where(eq(schema.salonSchedule.dayOfWeek, dayOfWeek))
      .limit(1);

    const row = existing[0];

    if (row !== undefined) {
      const rows = await this.db
        .update(schema.salonSchedule)
        .set({
          openTime: dto.openTime,
          closeTime: dto.closeTime,
          isClosed: dto.isClosed ?? false,
        })
        .where(eq(schema.salonSchedule.id, row.id))
        .returning();

      const updated = rows[0];

      if (updated === undefined) {
        throw new Error('Failed to update salon schedule');
      }

      return updated;
    }

    const rows = await this.db
      .insert(schema.salonSchedule)
      .values({
        dayOfWeek,
        openTime: dto.openTime,
        closeTime: dto.closeTime,
        isClosed: dto.isClosed ?? false,
      })
      .returning();

    const created = rows[0];

    if (created === undefined) {
      throw new Error('Failed to create salon schedule');
    }

    return created;
  }
}
