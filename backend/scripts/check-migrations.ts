import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({ connectionString: process.env['DATABASE_URL'] });

async function main() {
  const client = await pool.connect();
  try {
    const schemasRes = await client.query(`
      SELECT schema_name FROM information_schema.schemata
      WHERE schema_name IN ('drizzle', 'public')
      ORDER BY schema_name
    `);
    console.log('Schemas:', schemasRes.rows.map((r: { schema_name: string }) => r.schema_name));

    const tablesRes = await client.query(`
      SELECT table_schema, table_name FROM information_schema.tables
      WHERE table_name LIKE '%migration%' OR table_name LIKE '%drizzle%'
      ORDER BY table_schema, table_name
    `);
    console.log('Migration-related tables:', tablesRes.rows);

    for (const row of tablesRes.rows as { table_schema: string; table_name: string }[]) {
      const data = await client.query(
        `SELECT * FROM ${row.table_schema}.${row.table_name} ORDER BY created_at`,
      );
      console.log(`\n${row.table_schema}.${row.table_name} (${data.rows.length} rows):`);
      data.rows.forEach((r) => console.log(' ', r));
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main();
