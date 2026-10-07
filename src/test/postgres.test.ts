// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { randomUUID, scryptSync } from "node:crypto";
import { handleApi } from "@/server/http.server";
import { closePostgres, query } from "@/server/postgres.server";
const testUrl = process.env["TEST_DATABASE_URL"];
const origin = "https://topfit-test.example";
const password = "synthetic-ci-password";
const previous = {
  database: process.env["DATABASE_URL"],
  hash: process.env["TOPFIT_ADMIN_PASSWORD_HASH"],
  url: process.env["TOPFIT_SITE_URL"],
  vercel: process.env["VERCEL"],
};
const input = (extra: Record<string, unknown> = {}) => ({
  requestId: randomUUID(),
  kind: "matricula",
  name: "Teste PostgreSQL",
  phone: "92999990004",
  email: "",
  unitSlug: "alvorada",
  planId: "promo-alvorada",
  discipline: "academia",
  goal: "Condicionamento",
  notes: "",
  acknowledged: true,
  website: "",
  ...extra,
});
const call = (path: string, method = "GET", body?: unknown, cookie = "") =>
  handleApi(
    new Request(origin + path, {
      method,
      headers: { Origin: origin, "Content-Type": "application/json", Cookie: cookie },
      ...(body ? { body: JSON.stringify(body) } : {}),
    }),
  );
const login = async () => {
  const r = await call("/api/admin/session", "POST", { password });
  expect(r.status).toBe(200);
  return r.headers.get("set-cookie")!.split(";")[0]!;
};
describe.skipIf(!testUrl)("PostgreSQL real (banco descartável de CI)", () => {
  beforeAll(async () => {
    const target = new URL(testUrl!);
    if (!["localhost", "127.0.0.1"].includes(target.hostname) || target.pathname !== "/topfit_test")
      throw new Error("Use apenas PostgreSQL local descartável topfit_test");
    process.env["DATABASE_URL"] = testUrl;
    process.env["VERCEL"] = "1";
    process.env["TOPFIT_SITE_URL"] = origin;
    const salt = "1234567890abcdef1234567890abcdef";
    process.env["TOPFIT_ADMIN_PASSWORD_HASH"] =
      salt + ":" + scryptSync(password, salt, 64).toString("hex");
    await query(
      await readFile(new URL("../../migrations/001-attendance.sql", import.meta.url), "utf8"),
    );
  });
  beforeEach(async () => {
    await query("TRUNCATE contacts,sessions,limits");
  });
  afterAll(async () => {
    await closePostgres();
    for (const [key, value] of Object.entries({
      DATABASE_URL: previous.database,
      TOPFIT_ADMIN_PASSWORD_HASH: previous.hash,
      TOPFIT_SITE_URL: previous.url,
      VERCEL: previous.vercel,
    })) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
  it("salva, autentica, mantém dados após reconectar e permite atualizar/excluir", async () => {
    expect((await call("/api/admin/requests")).status).toBe(401);
    const r = await call("/api/requests", "POST", input({ notes: "' ); DROP TABLE contacts; --" }));
    expect(r.status).toBe(201);
    const receipt = await r.json();
    expect(receipt.whatsapp).toContain("5592981691185");
    await closePostgres();
    const cookie = await login();
    const list = await (await call("/api/admin/requests", "GET", undefined, cookie)).json();
    expect(list.total).toBe(1);
    expect(list.records[0].offerPrice).toBe("R$ 89,90");
    expect(list.records[0].notes).toContain("DROP TABLE");
    expect(
      (await call("/api/admin/requests/" + receipt.id, "PATCH", { status: "concluido" }, cookie))
        .status,
    ).toBe(200);
    const filtered = await (
      await call("/api/admin/requests?status=concluido", "GET", undefined, cookie)
    ).json();
    expect(filtered.total).toBe(1);
    expect((await call("/api/admin/session", "DELETE", undefined, cookie)).status).toBe(200);
    expect((await call("/api/admin/requests", "GET", undefined, cookie)).status).toBe(401);
    expect(
      (await call("/api/admin/requests/" + receipt.id, "DELETE", undefined, await login())).status,
    ).toBe(200);
  });
  it("serializa submissões concorrentes da mesma solicitação", async () => {
    const payload = input();
    const results = await Promise.all(
      Array.from({ length: 6 }, () => call("/api/requests", "POST", payload)),
    );
    expect(results.filter((r) => r.status === 201)).toHaveLength(1);
    expect(results.filter((r) => r.status === 200)).toHaveLength(5);
    expect(Number((await query("SELECT count(*) AS n FROM contacts")).rows[0].n)).toBe(1);
    expect(
      (await call("/api/requests", "POST", { ...payload, name: "Pedido Alterado" })).status,
    ).toBe(409);
  });
  it("aplica limite por telefone entre conexões concorrentes", async () => {
    const results = await Promise.all(
      Array.from({ length: 8 }, () => call("/api/requests", "POST", input())),
    );
    expect(results.filter((r) => r.status === 201)).toHaveLength(5);
    expect(results.filter((r) => r.status === 429)).toHaveLength(3);
  });
  it("rejeita plano inválido e renova janela expirada do limitador", async () => {
    expect((await call("/api/requests", "POST", input({ planId: "promo-sao-jorge" }))).status).toBe(
      400,
    );
    const { consumeLimit } = await import("@/server/postgres.server");
    expect(await consumeLimit("test", 1, 60000)).toBe(true);
    expect(await consumeLimit("test", 1, 60000)).toBe(false);
    await query("UPDATE limits SET expires_at=0 WHERE key=$1", ["test"]);
    expect(await consumeLimit("test", 1, 60000)).toBe(true);
  });
});
