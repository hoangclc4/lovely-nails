import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { EnvConfig } from '../../config/env.config';

const REDIS_EMPLOYEE_STATUS_KEY_PREFIX = 'employee:status:';
const SCAN_COUNT = 100;
const SCAN_CURSOR_DONE = '0';
const INITIAL_CURSOR = '0';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private readonly configService: ConfigService<EnvConfig, true>) {
    this.client = new Redis(this.configService.get('REDIS_URL', { infer: true }));
  }

  onModuleInit(): void {
    // connection is established lazily by ioredis
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }

  async setEmployeeStatus(employeeId: string, status: string): Promise<void> {
    await this.client.set(`${REDIS_EMPLOYEE_STATUS_KEY_PREFIX}${employeeId}`, status);
  }

  async getEmployeeStatus(employeeId: string): Promise<string | null> {
    return this.client.get(`${REDIS_EMPLOYEE_STATUS_KEY_PREFIX}${employeeId}`);
  }

  async getAllEmployeeStatuses(): Promise<Record<string, string>> {
    const pattern = `${REDIS_EMPLOYEE_STATUS_KEY_PREFIX}*`;
    const keys: string[] = [];
    let cursor = INITIAL_CURSOR;

    do {
      const [nextCursor, batch] = await this.client.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        SCAN_COUNT,
      );
      cursor = nextCursor;
      keys.push(...batch);
    } while (cursor !== SCAN_CURSOR_DONE);

    if (keys.length === 0) {
      return {};
    }

    const values = await this.client.mget(...keys);
    const result: Record<string, string> = {};

    keys.forEach((key, index) => {
      const employeeId = key.slice(REDIS_EMPLOYEE_STATUS_KEY_PREFIX.length);
      const value = values[index];
      if (value !== null && value !== undefined) {
        result[employeeId] = value;
      }
    });

    return result;
  }

  async deleteEmployeeStatus(employeeId: string): Promise<void> {
    await this.client.del(`${REDIS_EMPLOYEE_STATUS_KEY_PREFIX}${employeeId}`);
  }


}
