import { pool } from "./src/config/db.js";

try {
  const result = await pool.query(`
    SELECT
      column_name,
      data_type,
      is_nullable,
      column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'patients'
    ORDER BY ordinal_position
  `);

  console.table(result.rows);
} catch (error) {
  console.error("Schema lookup failed:");
  console.error(error);
  process.exitCode = 1;
} finally {
  await pool.end();
}