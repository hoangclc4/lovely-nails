import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({ connectionString: process.env['DATABASE_URL'] });

async function main() {
  const client = await pool.connect();
  try {
    const colRes = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'drizzle' AND table_name = '__drizzle_migrations'
      ORDER BY ordinal_position
    `);
    console.log('__drizzle_migrations columns:', colRes.rows.map((r: { column_name: string }) => r.column_name));

    const result = await client.query(`
      INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
      SELECT hash, created_at FROM drizzle.drizzle_migrations
      ON CONFLICT DO NOTHING
      RETURNING id, hash, created_at
    `);
    console.log(`Inserted ${result.rows.length} rows into __drizzle_migrations`);
    result.rows.forEach((r) => console.log(' -', r.created_at, r.hash.slice(0, 16) + '...'));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
