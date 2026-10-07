import { Pool } from "pg";
import { readFile } from "node:fs/promises";
if (!process.env.DATABASE_URL) throw new Error("Configure DATABASE_URL no ambiente seguro.");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  connectionTimeoutMillis: 10000,
});
const client = await pool.connect();
try {
  await client.query("BEGIN");
  await client.query("SELECT pg_advisory_xact_lock(hashtext('topfit:migration'))");
  await client.query(
    await readFile(new URL("../migrations/001-attendance.sql", import.meta.url), "utf8"),
  );
  await client.query("COMMIT");
  console.log("Tabelas PostgreSQL configuradas.");
} catch (error) {
  await client.query("ROLLBACK");
  console.error("Falha na migração:", error.code || error.name);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
