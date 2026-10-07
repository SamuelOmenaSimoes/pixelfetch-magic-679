// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, resolve } from "node:path";
import { randomUUID, scryptSync } from "node:crypto";
import { handleApi } from "@/server/http.server";
import { closeDatabase, database } from "@/server/store.server";

const origin = "http://localhost:5173";
const password = "test-only-password-not-a-production-secret";
let dir = "";
const previous = {
  dir: process.env["TOPFIT_DATA_DIR"],
  hash: process.env["TOPFIT_ADMIN_PASSWORD_HASH"],
  url: process.env["TOPFIT_SITE_URL"],
};
const valid = (extra: Record<string, unknown> = {}) => ({
  requestId: randomUUID(),
  kind: "experimental",
  name: "Pessoa de Teste",
  phone: "(92) 99999-0000",
  email: "",
  unitSlug: "alvorada",
  planId: "",
  discipline: "academia",
  goal: "Condicionamento",
  notes: "",
  acknowledged: true,
  website: "",
  ...extra,
});
const call = (path: string, method = "GET", body?: unknown, cookie = "", customOrigin = origin) =>
  handleApi(
    new Request(origin + path, {
      method,
      headers: {
        Origin: customOrigin,
        "Content-Type": "application/json",
        ...(cookie ? { Cookie: cookie } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    }),
  );
const login = async () => {
  const response = await call("/api/admin/session", "POST", { password });
  expect(response.status).toBe(200);
  return response.headers.get("set-cookie")!.split(";")[0]!;
};
beforeEach(() => {
  closeDatabase();
  dir = mkdtempSync(resolve(tmpdir(), "topfit-test-"));
  process.env["TOPFIT_DATA_DIR"] = dir;
  process.env["TOPFIT_SITE_URL"] = origin;
  const salt = "1234567890abcdef1234567890abcdef";
  process.env["TOPFIT_ADMIN_PASSWORD_HASH"] =
    salt + ":" + scryptSync(password, salt, 64).toString("hex");
});
afterEach(() => {
  closeDatabase();
  if (dirname(resolve(dir)) !== resolve(tmpdir()) || !basename(dir).startsWith("topfit-test-"))
    throw new Error("Unsafe cleanup path");
  rmSync(dir, { recursive: true });
  for (const [key, value] of Object.entries({
    TOPFIT_DATA_DIR: previous.dir,
    TOPFIT_ADMIN_PASSWORD_HASH: previous.hash,
    TOPFIT_SITE_URL: previous.url,
  })) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe("Backend de atendimento", () => {
  it("persiste pedido real, normaliza celular, permite leitura somente autenticada e sobrevive à reabertura", async () => {
    const response = await call("/api/requests", "POST", valid());
    expect(response.status).toBe(201);
    const receipt = await response.json();
    expect(receipt.id).toBeTruthy();
    expect(receipt.whatsapp).toContain("wa.me/5592981691185");
    expect((await call("/api/admin/requests")).status).toBe(401);
    const cookie = await login();
    closeDatabase();
    const list = await (await call("/api/admin/requests", "GET", undefined, cookie)).json();
    expect(list.total).toBe(1);
    expect(list.records[0].phone).toBe("92999990000");
    expect(list.records[0].status).toBe("novo");
  });
  it("rejeita dados inválidos, unidade inexistente, honeypot e leitura não confirmada sem gravar", async () => {
    for (const input of [
      valid({ name: "   " }),
      valid({ phone: "abc" }),
      valid({ email: "email-invalido" }),
      valid({ unitSlug: "inexistente" }),
      valid({ acknowledged: false }),
      valid({ website: "spam" }),
    ])
      expect((await call("/api/requests", "POST", input)).status).toBe(400);
    expect(database().prepare("SELECT count(*) AS n FROM contacts").get()?.["n"]).toBe(0);
  });
  it("recusa plano de outra unidade e não aceita preço enviado pelo navegador", async () => {
    expect(
      (await call("/api/requests", "POST", valid({ kind: "matricula", planId: "promo-sao-jorge" })))
        .status,
    ).toBe(400);
    expect(
      (
        await call(
          "/api/requests",
          "POST",
          valid({ kind: "matricula", planId: "promo-alvorada", price: "R$ 0,01" }),
        )
      ).status,
    ).toBe(400);
    const receipt = await (
      await call("/api/requests", "POST", valid({ kind: "matricula", planId: "promo-alvorada" }))
    ).json();
    const cookie = await login();
    const list = await (await call("/api/admin/requests", "GET", undefined, cookie)).json();
    expect(list.records[0].id).toBe(receipt.id);
    expect(list.records[0].offerPrice).toBe("R$ 89,90");
    expect(list.records[0].kind).toBe("matricula");
  });
  it("envia o link de experimental de crossfit para o contato específico", async () => {
    const response = await call("/api/requests", "POST", valid({ discipline: "crossfit" }));
    expect(response.status).toBe(201);
    expect((await response.json()).whatsapp).toContain("wa.me/5592981643664");
  });
  it("não duplica reenvio e rejeita reutilização do identificador com dados alterados", async () => {
    const input = valid();
    const one = await (await call("/api/requests", "POST", input)).json();
    const again = await call("/api/requests", "POST", input);
    expect(again.status).toBe(200);
    expect((await again.json()).id).toBe(one.id);
    expect((await call("/api/requests", "POST", { ...input, name: "Outro Nome" })).status).toBe(
      409,
    );
    expect(database().prepare("SELECT count(*) AS n FROM contacts").get()?.["n"]).toBe(1);
  });
  it("bloqueia origem externa, conteúdo excessivo e corpo malformado", async () => {
    expect(
      (await call("/api/requests", "POST", valid(), "", "https://externo.example")).status,
    ).toBe(403);
    expect((await call("/api/requests", "POST", valid({ notes: "x".repeat(9000) }))).status).toBe(
      413,
    );
    const malformed = new Request(origin + "/api/requests", {
      method: "POST",
      headers: { Origin: origin, "Content-Type": "application/json" },
      body: "{",
    });
    expect((await handleApi(malformed)).status).toBe(400);
  });
  it("protege alteração/exclusão e permite à equipe atualizar e excluir", async () => {
    const { id } = await (
      await call("/api/requests", "POST", valid({ notes: "'); DROP TABLE contacts; --" }))
    ).json();
    expect((await call(`/api/admin/requests/${id}`, "PATCH", { status: "concluido" })).status).toBe(
      401,
    );
    const cookie = await login();
    expect(
      (await call(`/api/admin/requests/${id}`, "PATCH", { status: "invalido" }, cookie)).status,
    ).toBe(400);
    expect(
      (await call(`/api/admin/requests/${id}`, "PATCH", { status: "em-atendimento" }, cookie))
        .status,
    ).toBe(200);
    const list = await (
      await call("/api/admin/requests?status=em-atendimento", "GET", undefined, cookie)
    ).json();
    expect(list.records[0].notes).toBe("'); DROP TABLE contacts; --");
    expect((await call(`/api/admin/requests/${id}`, "DELETE", undefined, cookie)).status).toBe(200);
    expect((await (await call("/api/admin/requests", "GET", undefined, cookie)).json()).total).toBe(
      0,
    );
  });
  it("rejeita senha incorreta, protege cookie e invalida sessão ao sair ou trocar senha", async () => {
    expect((await call("/api/admin/session", "POST", { password: "errada" })).status).toBe(401);
    const response = await call("/api/admin/session", "POST", { password });
    const header = response.headers.get("set-cookie")!;
    expect(header).toContain("HttpOnly");
    expect(header).toContain("SameSite=Strict");
    const cookie = header.split(";")[0]!;
    expect((await call("/api/admin/session", "DELETE", undefined, cookie)).status).toBe(200);
    expect((await call("/api/admin/requests", "GET", undefined, cookie)).status).toBe(401);
    const next = await login();
    process.env["TOPFIT_ADMIN_PASSWORD_HASH"] = "changed";
    expect((await call("/api/admin/requests", "GET", undefined, next)).status).toBe(401);
  });
  it("limita tentativas de login e excesso de pedidos por celular", async () => {
    for (let n = 0; n < 10; n++)
      expect((await call("/api/admin/session", "POST", { password: "errada" })).status).toBe(401);
    expect((await call("/api/admin/session", "POST", { password })).status).toBe(429);
    for (let n = 0; n < 5; n++)
      expect((await call("/api/requests", "POST", valid())).status).toBe(201);
    expect((await call("/api/requests", "POST", valid())).status).toBe(429);
  });
});
