import { Pool, type PoolClient } from "pg";
import { createHash, randomUUID } from "node:crypto";
import { plans, units } from "@/data/topfit";
import type { ContactRequest } from "@/lib/contact-schema";
let pool: Pool | undefined;
const reportPoolError = () => console.error("TOPFIT_POSTGRES_IDLE_ERROR");
export function postgres() {
  const connectionString = process.env["DATABASE_URL"];
  if (!connectionString) throw new Error("DATABASE_URL_REQUIRED");
  pool ??= new Pool({
    connectionString,
    max: 3,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 10000,
    query_timeout: 10000,
    allowExitOnIdle: true,
  });
  if (!pool.listenerCount("error")) pool.on("error", reportPoolError);
  return pool;
}
export async function closePostgres() {
  await pool?.end();
  pool = undefined;
}
export async function query(sql: string, args: unknown[] = []) {
  return postgres().query(sql, args);
}
const digest = (s: string) => createHash("sha256").update(s).digest("hex");
async function limitWith(
  client: Pick<PoolClient, "query">,
  key: string,
  max: number,
  windowMs: number,
) {
  const now = Date.now();
  const result = await client.query(
    `INSERT INTO limits(key,hits,expires_at) VALUES($1,1,$2)
    ON CONFLICT(key) DO UPDATE SET hits=CASE WHEN limits.expires_at <= $3 THEN 1 ELSE limits.hits+1 END,
    expires_at=CASE WHEN limits.expires_at <= $3 THEN $2 ELSE limits.expires_at END RETURNING hits`,
    [key, now + windowMs, now],
  );
  return Number(result.rows[0].hits) <= max;
}
export async function consumeLimit(key: string, max: number, windowMs: number) {
  return limitWith(postgres(), key, max, windowMs);
}
export async function saveContact(input: ContactRequest) {
  const client = await postgres().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
      "request:" + input.requestId,
    ]);
    const hash = digest(JSON.stringify(input));
    const existing = (
      await client.query("SELECT id,payload_hash FROM contacts WHERE request_id=$1", [
        input.requestId,
      ])
    ).rows[0];
    if (existing) {
      await client.query("COMMIT");
      return existing.payload_hash === hash ? { id: String(existing.id), duplicate: true } : null;
    }
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
      "phone:" + digest(input.phone),
    ]);
    if (!(await limitWith(client, "phone:" + digest(input.phone), 5, 30 * 60_000))) {
      await client.query("COMMIT");
      throw new Error("PHONE_LIMIT");
    }
    const id = randomUUID();
    const unit = units.find((u) => u.slug === input.unitSlug)!;
    const plan = plans.find((p) => p.id === input.planId && p.unitSlug === input.unitSlug);
    await client.query(
      `INSERT INTO contacts(id,request_id,payload_hash,name,phone,email,kind,unit_slug,unit_name,plan_id,plan_name,offer_price,discipline,goal,notes,created_at,privacy_version)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
      [
        id,
        input.requestId,
        hash,
        input.name,
        input.phone,
        input.email,
        input.kind,
        unit.slug,
        unit.name,
        input.planId,
        plan?.name ?? null,
        plan?.price ?? null,
        input.discipline,
        input.goal,
        input.notes,
        new Date().toISOString(),
        "2026-10-07",
      ],
    );
    await client.query("COMMIT");
    return { id, duplicate: false };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}
export async function listContacts(status: string, page: number) {
  const where = status ? "WHERE status=$1" : "";
  const args = status ? [status] : [];
  const count = await query(`SELECT count(*) AS total FROM contacts ${where}`, args);
  const result = await query(
    `SELECT * FROM contacts ${where} ORDER BY created_at DESC,id DESC LIMIT 25 OFFSET $${args.length + 1}`,
    [...args, (page - 1) * 25],
  );
  return {
    total: Number(count.rows[0].total),
    page,
    records: result.rows.map((r) => ({
      id: r.id,
      requestId: r.request_id,
      name: r.name,
      phone: r.phone,
      email: r.email,
      kind: r.kind,
      unitSlug: r.unit_slug,
      unitName: r.unit_name,
      planId: r.plan_id,
      planName: r.plan_name,
      offerPrice: r.offer_price,
      discipline: r.discipline,
      goal: r.goal,
      notes: r.notes,
      createdAt: r.created_at,
      status: r.status,
    })),
  };
}
