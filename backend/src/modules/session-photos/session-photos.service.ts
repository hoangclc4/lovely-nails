import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, count, desc, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DB_TOKEN } from '../../database/database.provider';
import * as schema from '../../database/schema/index';
import { SessionPhotoRecord } from '../../database/schema/session-photos';
import {
  SESSION_PHOTO_NOT_FOUND_MESSAGE,
  SESSION_PHOTO_MAX_PER_SESSION,
  SESSION_PHOTO_MAX_EXCEEDED_MESSAGE,
} from '../../common/constants/session-photo.constants';
import { DEFAULT_PAGE, DEFAULT_LIMIT } from '../../common/constants/pagination.constants';
import type {
  CreateSessionPhotoDto,
  SessionPhotoListParams,
  PortfolioParams,
} from './schemas/session-photo.schemas';

type DrizzleDB = NodePgDatabase<typeof schema>;

@Injectable()
export class SessionPhotosService {
  constructor(@Inject(DB_TOKEN) private readonly db: DrizzleDB) {}

  async addPhoto(sessionId: string, dto: CreateSessionPhotoDto): Promise<SessionPhotoRecord> {
    const sessionRows = await this.db
      .select({
        employeeId: schema.serviceSessions.employeeId,
        customerId: schema.serviceSessions.customerId,
      })
      .from(schema.serviceSessions)
      .where(eq(schema.serviceSessions.id, sessionId))
      .limit(1);

    const session = sessionRows[0];

    if (session === undefined) {
      throw new NotFoundException('Service session not found');
    }

    const countResult = await this.db
      .select({ value: count() })
      .from(schema.sessionPhotos)
      .where(eq(schema.sessionPhotos.sessionId, sessionId));

    const existingCount = countResult[0]?.value ?? 0;

    if (existingCount >= SESSION_PHOTO_MAX_PER_SESSION) {
      throw new BadRequestException(SESSION_PHOTO_MAX_EXCEEDED_MESSAGE);
    }

    const rows = await this.db
      .insert(schema.sessionPhotos)
      .values({
        sessionId,
        employeeId: session.employeeId,
        customerId: session.customerId,
        photoUrl: dto.photoUrl,
        thumbnailUrl: dto.thumbnailUrl,
        caption: dto.caption,
        isPortfolio: dto.isPortfolio ?? true,
      })
      .returning();

    return rows[0] as SessionPhotoRecord;
  }

  async getSessionPhotos(sessionId: string): Promise<SessionPhotoRecord[]> {
    return this.db
      .select()
      .from(schema.sessionPhotos)
      .where(eq(schema.sessionPhotos.sessionId, sessionId))
      .orderBy(desc(schema.sessionPhotos.createdAt));
  }

  async deletePhoto(sessionId: string, photoId: string): Promise<void> {
    const rows = await this.db
      .select()
      .from(schema.sessionPhotos)
      .where(
        and(
          eq(schema.sessionPhotos.id, photoId),
          eq(schema.sessionPhotos.sessionId, sessionId),
        ),
      )
      .limit(1);

    const photo = rows[0];

    if (photo === undefined) {
      throw new NotFoundException(SESSION_PHOTO_NOT_FOUND_MESSAGE);
    }

    await this.db
      .delete(schema.sessionPhotos)
      .where(
        and(
          eq(schema.sessionPhotos.id, photoId),
          eq(schema.sessionPhotos.sessionId, sessionId),
        ),
      );
  }

  async getCustomerPhotos(
    customerId: string,
    params: SessionPhotoListParams,
  ): Promise<{ data: SessionPhotoRecord[]; meta: { total: number; page: number; limit: number } }> {
    const page = params.page ?? DEFAULT_PAGE;
    const limit = params.limit ?? DEFAULT_LIMIT;
    const offset = (page - 1) * limit;

    const where = eq(schema.sessionPhotos.customerId, customerId);

    const [rows, totalResult] = await Promise.all([
      this.db
        .select()
        .from(schema.sessionPhotos)
        .where(where)
        .orderBy(desc(schema.sessionPhotos.createdAt))
        .limit(limit)
        .offset(offset),
      this.db.select({ value: count() }).from(schema.sessionPhotos).where(where),
    ]);

    const total = totalResult[0]?.value ?? 0;

    return { data: rows, meta: { total, page, limit } };
  }

  async getEmployeePortfolio(
    employeeId: string,
    params: PortfolioParams,
  ): Promise<{ data: SessionPhotoRecord[]; meta: { total: number; page: number; limit: number } }> {
    const page = params.page ?? DEFAULT_PAGE;
    const limit = params.limit ?? DEFAULT_LIMIT;
    const offset = (page - 1) * limit;

    const conditions = [eq(schema.sessionPhotos.employeeId, employeeId)];

    if (params.isPortfolio !== undefined) {
      conditions.push(eq(schema.sessionPhotos.isPortfolio, params.isPortfolio));
    }

    const where = and(...conditions);

    const [rows, totalResult] = await Promise.all([
      this.db
        .select()
        .from(schema.sessionPhotos)
        .where(where)
        .orderBy(desc(schema.sessionPhotos.createdAt))
        .limit(limit)
        .offset(offset),
      this.db.select({ value: count() }).from(schema.sessionPhotos).where(where),
    ]);

    const total = totalResult[0]?.value ?? 0;

    return { data: rows, meta: { total, page, limit } };
  }
}
