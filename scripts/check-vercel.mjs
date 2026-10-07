import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
const output = resolve(".vercel/output");
const config = JSON.parse(await readFile(resolve(output, "config.json"), "utf8"));
assert.equal(config.version, 3);
assert.ok(config.routes.some((r) => r.dest === "/__server"));
const fn = resolve(output, "functions/__server.func");
const metadata = JSON.parse(await readFile(resolve(fn, ".vc-config.json"), "utf8"));
assert.equal(metadata.runtime, "nodejs24.x");
await access(resolve(output, "static/topfit-logo.jpg"));
process.env.VERCEL = "1";
process.env.VERCEL_ENV = "preview";
process.env.VERCEL_URL = "topfit-ci.vercel.app";
delete process.env.DATABASE_URL;
const { default: app } = await import(pathToFileURL(resolve(fn, metadata.handler)).href);
const origin = "https://topfit-ci.vercel.app";
const catalogue = await app.fetch(new Request(origin + "/api/catalog"));
assert.equal(catalogue.status, 200);
assert.equal((await catalogue.json()).units.length, 3);
const page = await app.fetch(new Request(origin + "/comece-agora"));
assert.equal(page.status, 200);
assert.ok((await page.text()).includes("89,90"));
const response = await app.fetch(
  new Request(origin + "/api/requests", {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: JSON.stringify({
      requestId: randomUUID(),
      kind: "experimental",
      name: "Teste Vercel",
      phone: "92999990000",
      email: "",
      unitSlug: "alvorada",
      planId: "",
      discipline: "academia",
      goal: "Condicionamento",
      notes: "",
      acknowledged: true,
      website: "",
    }),
  }),
);
assert.equal(
  response.status,
  503,
  "Sem banco, deve falhar com mensagem controlada e nunca escrever SQLite",
);
console.log("Vercel: estrutura, runtime, SSR, catálogo e falha segura sem banco verificados.");
