import { DatabaseSync } from "node:sqlite";
import { chmodSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { plans, units } from "@/data/topfit";
import type { ContactRecord, ContactRequest } from "@/lib/contact-schema";

let current: { path: string; db: DatabaseSync } | undefined;
export function database() {
  const configured = process.env["TOPFIT_DATA_DIR"];
  if (process.env["NODE_ENV"] === "production" && !configured)
    throw new Error("TOPFIT_DATA_DIR_REQUIRED");
  const dir = resolve(configured || ".data");
  const path = resolve(dir, "topfit.sqlite");
  if (current?.path === path) return current.db;
  current?.db.close();
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(path);
  chmodSync(path, 0o600);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY, request_id TEXT NOT NULL UNIQUE, payload_hash TEXT NOT NULL,
      name TEXT NOT NULL, phone TEXT NOT NULL, email TEXT NOT NULL,
      kind TEXT NOT NULL CHECK(kind IN ('experimental','matricula')), unit_slug TEXT NOT NULL,
      unit_name TEXT NOT NULL, plan_id TEXT NOT NULL, plan_name TEXT, offer_price TEXT,
      discipline TEXT NOT NULL, goal TEXT NOT NULL, notes TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'novo' CHECK(status IN ('novo','em-atendimento','concluido','cancelado')),
      created_at TEXT NOT NULL, privacy_version TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS contacts_date ON contacts(created_at DESC);
    CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, expires_at INTEGER NOT NULL, auth_version TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS limits (key TEXT PRIMARY KEY, hits INTEGER NOT NULL, expires_at INTEGER NOT NULL);
  `);
  current = { path, db };
  return db;
}
export function closeDatabase() {
  current?.db.close();
  current = undefined;
}
export const digest = (value: string) => createHash("sha256").update(value).digest("hex");
export function consumeLimit(key: string, max: number, windowMs: number) {
  const db = database();
  const now = Date.now();
  db.prepare("DELETE FROM limits WHERE expires_at <= ?").run(now);
  db.prepare(
    "INSERT INTO limits(key,hits,expires_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET hits=hits+1",
  ).run(key, now + windowMs);
  const row = db.prepare("SELECT hits FROM limits WHERE key=?").get(key);
  return Number(row?.["hits"]) <= max;
}
export function saveContact(input: ContactRequest) {
  const db = database();
  const hash = digest(JSON.stringify(input));
  const existing = db
    .prepare("SELECT id,payload_hash FROM contacts WHERE request_id=?")
    .get(input.requestId);
  if (existing)
    return existing["payload_hash"] === hash
      ? { id: String(existing["id"]), duplicate: true }
      : null;
  if (!consumeLimit("phone:" + digest(input.phone), 5, 30 * 60_000)) throw new Error("PHONE_LIMIT");
  const id = randomUUID();
  const unit = units.find((u) => u.slug === input.unitSlug)!;
  const plan = plans.find((p) => p.id === input.planId && p.unitSlug === input.unitSlug);
  db.prepare(
    `INSERT INTO contacts(id,request_id,payload_hash,name,phone,email,kind,unit_slug,unit_name,plan_id,plan_name,offer_price,discipline,goal,notes,created_at,privacy_version)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  ).run(
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
  );
  return { id, duplicate: false };
}
export function listContacts(status: string, page: number) {
  const db = database();
  const where = status ? "WHERE status=?" : "";
  const args = status ? [status] : [];
  const count = db.prepare(`SELECT count(*) AS total FROM contacts ${where}`).get(...args);
  const rows = db
    .prepare(`SELECT * FROM contacts ${where} ORDER BY created_at DESC LIMIT 25 OFFSET ?`)
    .all(...args, (page - 1) * 25);
  return {
    total: Number(count?.["total"]),
    page,
    records: rows.map((r) => ({
      id: r["id"],
      requestId: r["request_id"],
      name: r["name"],
      phone: r["phone"],
      email: r["email"],
      kind: r["kind"],
      unitSlug: r["unit_slug"],
      unitName: r["unit_name"],
      planId: r["plan_id"],
      planName: r["plan_name"],
      offerPrice: r["offer_price"],
      discipline: r["discipline"],
      goal: r["goal"],
      notes: r["notes"],
      createdAt: r["created_at"],
      status: r["status"],
    })) as ContactRecord[],
  };
}
