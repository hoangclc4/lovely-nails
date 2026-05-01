import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema/index';
import { EnvConfig } from '../config/env.config';

export const DB_TOKEN = 'DB';

export const databaseProvider = {
  provide: DB_TOKEN,
  inject: [ConfigService],
  useFactory: (configService: ConfigService<EnvConfig, true>) => {
    const pool = new Pool({
      connectionString: configService.get('DATABASE_URL', { infer: true }),
    });

    return drizzle(pool, { schema });
  },
};
