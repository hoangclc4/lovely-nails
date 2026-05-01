import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DB_TOKEN } from '../../database/database.provider';
import * as schema from '../../database/schema/index';
import { SETTINGS_DEFAULTS, SETTINGS_KEY } from '../../common/constants/settings.constants';
import { type UpdateSettingsDto, type SalonSettings } from './schemas/settings.schemas';

type DrizzleDB = NodePgDatabase<typeof schema>;

const STRING_TRUE = 'true';

@Injectable()
export class SettingsService {
  constructor(@Inject(DB_TOKEN) private readonly db: DrizzleDB) {}

  async getAll(): Promise<SalonSettings> {
    const rows = await this.db.select().from(schema.salonSettings);

    const dbMap: Record<string, string> = {};
    for (const row of rows) {
      dbMap[row.key] = row.value;
    }

    const merged = { ...SETTINGS_DEFAULTS, ...dbMap };

    return this.toSalonSettings(merged);
  }

  async update(dto: UpdateSettingsDto): Promise<SalonSettings> {
    const pairs: { key: string; value: string }[] = [];

    if (dto.salonName !== undefined) {
      pairs.push({ key: SETTINGS_KEY.SALON_NAME, value: dto.salonName });
    }
    if (dto.salonAddress !== undefined) {
      pairs.push({ key: SETTINGS_KEY.SALON_ADDRESS, value: dto.salonAddress });
    }
    if (dto.salonPhone !== undefined) {
      pairs.push({ key: SETTINGS_KEY.SALON_PHONE, value: dto.salonPhone });
    }
    if (dto.currency !== undefined) {
      pairs.push({ key: SETTINGS_KEY.CURRENCY, value: dto.currency });
    }
    if (dto.timezone !== undefined) {
      pairs.push({ key: SETTINGS_KEY.TIMEZONE, value: dto.timezone });
    }
    if (dto.tipPoolingEnabled !== undefined) {
      pairs.push({ key: SETTINGS_KEY.TIP_POOLING_ENABLED, value: String(dto.tipPoolingEnabled) });
    }
    if (dto.tipPoolPercentage !== undefined) {
      pairs.push({ key: SETTINGS_KEY.TIP_POOL_PERCENTAGE, value: String(dto.tipPoolPercentage) });
    }
    if (dto.defaultBookingBuffer !== undefined) {
      pairs.push({ key: SETTINGS_KEY.DEFAULT_BOOKING_BUFFER, value: String(dto.defaultBookingBuffer) });
    }
    if (dto.autoLogoutMinutes !== undefined) {
      pairs.push({ key: SETTINGS_KEY.AUTO_LOGOUT_MINUTES, value: String(dto.autoLogoutMinutes) });
    }
    if (dto.receiptFooterText !== undefined) {
      pairs.push({ key: SETTINGS_KEY.RECEIPT_FOOTER_TEXT, value: dto.receiptFooterText });
    }

    if (pairs.length > 0) {
      await Promise.all(
        pairs.map((pair) =>
          this.db
            .insert(schema.salonSettings)
            .values({ key: pair.key, value: pair.value })
            .onConflictDoUpdate({
              target: schema.salonSettings.key,
              set: { value: pair.value, updatedAt: new Date() },
            }),
        ),
      );
    }

    return this.getAll();
  }

  private toSalonSettings(map: Record<string, string>): SalonSettings {
    return {
      salonName: map[SETTINGS_KEY.SALON_NAME] ?? 'Lovely Nails',
      salonAddress: map[SETTINGS_KEY.SALON_ADDRESS] ?? null,
      salonPhone: map[SETTINGS_KEY.SALON_PHONE] ?? null,
      currency: map[SETTINGS_KEY.CURRENCY] ?? 'USD',
      timezone: map[SETTINGS_KEY.TIMEZONE] ?? 'Pacific/Guam',
      tipPoolingEnabled: map[SETTINGS_KEY.TIP_POOLING_ENABLED] === STRING_TRUE,
      tipPoolPercentage: Number(map[SETTINGS_KEY.TIP_POOL_PERCENTAGE] ?? '0'),
      defaultBookingBuffer: Number(map[SETTINGS_KEY.DEFAULT_BOOKING_BUFFER] ?? '15'),
      autoLogoutMinutes: Number(map[SETTINGS_KEY.AUTO_LOGOUT_MINUTES] ?? '30'),
      receiptFooterText: map[SETTINGS_KEY.RECEIPT_FOOTER_TEXT] ?? null,
    };
  }
}
