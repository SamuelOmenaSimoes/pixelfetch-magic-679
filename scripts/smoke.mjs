import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, dirname, basename } from "node:path";
import { randomUUID, scryptSync } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import assert from "node:assert/strict";
const dir = mkdtempSync(resolve(tmpdir(), "topfit-smoke-"));
const origin = "http://127.0.0.1:4181";
const password = randomUUID();
const salt = randomUUID().replaceAll("-", "");
const env = {
  ...process.env,
  PORT: "4181",
  HOST: "127.0.0.1",
  TOPFIT_SITE_URL: origin,
  TOPFIT_DATA_DIR: dir,
  TOPFIT_BACKUP_DIR: resolve(dir, "backups"),
  TOPFIT_ADMIN_PASSWORD_HASH: salt + ":" + scryptSync(password, salt, 64).toString("hex"),
};
let child;
async function start() {
  child = spawn(process.execPath, [".output/server/index.mjs"], { env, stdio: "ignore" });
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(origin + "/api/catalog")).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error("Servidor não iniciou");
}
async function stop() {
  if (!child || child.exitCode !== null) return;
  await new Promise((r) => {
    child.once("exit", r);
    child.kill();
  });
}
const api = (path, method = "GET", data, cookie = "") =>
  fetch(origin + path, {
    method,
    headers: { Origin: origin, "Content-Type": "application/json", Cookie: cookie },
    body: data ? JSON.stringify(data) : undefined,
  });
try {
  await start();
  for (const page of [
    "/",
    "/comece-agora",
    "/unidades/alvorada",
    "/privacidade",
    "/termos",
    "/admin",
    "/topfit-logo.jpg",
  ])
    assert.equal((await fetch(origin + page)).status, 200, page);
  assert.equal((await api("/api/admin/requests")).status, 401);
  const payload = {
    requestId: randomUUID(),
    kind: "matricula",
    name: "Teste Produção Local",
    phone: "92999990003",
    email: "",
    unitSlug: "alvorada",
    planId: "promo-alvorada",
    discipline: "academia",
    goal: "Condicionamento",
    notes: "Teste descartável",
    acknowledged: true,
    website: "",
  };
  const submitted = await api("/api/requests", "POST", payload);
  assert.equal(submitted.status, 201);
  const receipt = await submitted.json();
  assert.ok(receipt.whatsapp.startsWith("https://wa.me/5592981691185"));
  await stop();
  await start();
  const login = await api("/api/admin/session", "POST", { password });
  assert.equal(login.status, 200);
  const cookie = login.headers.get("set-cookie").split(";")[0];
  const list = await (await api("/api/admin/requests", "GET", undefined, cookie)).json();
  assert.equal(list.total, 1);
  assert.equal(list.records[0].id, receipt.id);
  assert.equal((await api("/api/requests", "POST", payload)).status, 200);
  assert.equal(
    (await api("/api/admin/requests/" + receipt.id, "PATCH", { status: "concluido" }, cookie))
      .status,
    200,
  );
  const backup = spawnSync(process.execPath, ["scripts/backup.mjs"], { env, encoding: "utf8" });
  assert.equal(backup.status, 0, backup.stderr);
  const db = new DatabaseSync(resolve(dir, "backups", readdirSync(resolve(dir, "backups"))[0]), {
    readOnly: true,
  });
  assert.equal(db.prepare("SELECT count(*) AS n FROM contacts").get().n, 1);
  db.close();
  console.log(
    "Smoke de produção: páginas, API, login, persistência após reiniciar, idempotência, status e backup verificados.",
  );
} finally {
  await stop();
  if (dirname(dir) === tmpdir() && basename(dir).startsWith("topfit-smoke-"))
    rmSync(dir, { recursive: true, force: true });
}
