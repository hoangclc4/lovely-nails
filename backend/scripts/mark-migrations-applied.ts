import { Pool } from 'pg';
import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MIGRATIONS_FOLDER = path.join(__dirname, '..', 'src', 'database', 'migrations');

const pool = new Pool({ connectionString: process.env['DATABASE_URL'] });

async function main() {
  const client = await pool.connect();
  try {
    const journalPath = path.join(MIGRATIONS_FOLDER, 'meta', '_journal.json');
    const journal = JSON.parse(fs.readFileSync(journalPath, 'utf8')) as {
      entries: { idx: number; tag: string; when: number }[];
    };

    await client.query(`CREATE SCHEMA IF NOT EXISTS drizzle`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS drizzle.drizzle_migrations (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      )
    `);

    const existing = await client.query(
      `SELECT hash FROM drizzle.drizzle_migrations`,
    );
    const existingHashes = new Set(existing.rows.map((r: { hash: string }) => r.hash));

    for (const entry of journal.entries) {
      const sqlPath = path.join(MIGRATIONS_FOLDER, `${entry.tag}.sql`);
      const sqlContent = fs.readFileSync(sqlPath, 'utf8');
      const hash = createHash('sha256').update(sqlContent).digest('hex');

      if (existingHashes.has(hash)) {
        console.log(`[skip] ${entry.tag} (already recorded)`);
        continue;
      }

      await client.query(
        `INSERT INTO drizzle.drizzle_migrations (hash, created_at) VALUES ($1, $2)`,
        [hash, entry.when],
      );
      console.log(`[marked] ${entry.tag}`);
    }

    console.log('Done — all migrations marked as applied.');
  } finally {
    client.release();
    await pool.end();
  }
}

main();
