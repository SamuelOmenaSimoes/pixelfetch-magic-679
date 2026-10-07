import { loadEnvFile } from "node:process";
import { z } from "zod";
import { requestSchema, statuses, statusSchema } from "@/lib/contact-schema";
import { plans, units, CROSSFIT_WHATSAPP, whatsappLink } from "@/data/topfit";
import { consumeLimit, database, listContacts, saveContact } from "./store.server";
import {
  adminHash,
  authenticated,
  newSession,
  revoke,
  sessionCookie,
  verifyPassword,
} from "./auth.server";
try {
  loadEnvFile(".env.local");
} catch {
  /* Environment variables are preferred in deployment. */
}

const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...extra,
    },
  });
async function readJson(request: Request): Promise<unknown> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json"))
    throw new Error("CONTENT_TYPE");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("JSON_INVALID");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    size += chunk.value.length;
    if (size > 8192) {
      await reader.cancel();
      throw new Error("BODY_TOO_LARGE");
    }
    chunks.push(chunk.value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    bytes.set(c, offset);
    offset += c.length;
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new Error("JSON_INVALID");
  }
}
export async function handleApi(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, "");
  const write = request.method !== "GET" && request.method !== "HEAD";
  if (write) {
    const allowed = process.env["TOPFIT_SITE_URL"]
      ? new URL(process.env["TOPFIT_SITE_URL"]!).origin
      : url.origin;
    if (
      request.headers.get("origin") !== allowed ||
      request.headers.get("sec-fetch-site") === "cross-site"
    )
      return json({ error: "Origem não autorizada." }, 403);
  }
  try {
    if (path === "/api/catalog" && request.method === "GET")
      return json({
        units: units.map(({ slug, name, neighborhood, whatsapp }) => ({
          slug,
          name,
          neighborhood,
          whatsapp,
        })),
        plans,
      });
    if (path === "/api/requests" && request.method === "POST") {
      if (!consumeLimit("submissions", 120, 60_000))
        return json({ error: "Muitas solicitações. Tente novamente em um minuto." }, 429, {
          "Retry-After": "60",
        });
      const parsed = requestSchema.safeParse(await readJson(request));
      if (!parsed.success)
        return json(
          { error: "Revise os campos indicados.", fields: parsed.error.flatten().fieldErrors },
          400,
        );
      const result = saveContact(parsed.data);
      if (!result)
        return json(
          { error: "Esta solicitação foi alterada. Atualize a página antes de reenviar." },
          409,
        );
      const unit = units.find((u) => u.slug === parsed.data.unitSlug)!;
      const message = `Olá! Enviei uma solicitação de ${parsed.data.kind === "matricula" ? "matrícula" : "aula experimental"}${parsed.data.discipline === "crossfit" ? " de crossfit" : ""} para ${unit.name}. Protocolo: ${result.id}. Gostaria de confirmar as condições e o atendimento.`;
      const whatsapp =
        parsed.data.discipline === "crossfit"
          ? `https://wa.me/${CROSSFIT_WHATSAPP}?text=${encodeURIComponent(message)}`
          : whatsappLink(unit, message);
      return json(
        { id: result.id, whatsapp, duplicate: result.duplicate },
        result.duplicate ? 200 : 201,
      );
    }
    if (path === "/api/admin/session") {
      if (request.method === "GET")
        return authenticated(request)
          ? json({ authenticated: true })
          : json({ error: "Faça login para continuar." }, 401);
      if (request.method === "POST") {
        if (!adminHash()) return json({ error: "Acesso administrativo não configurado." }, 503);
        if (!consumeLimit("login", 10, 15 * 60_000))
          return json({ error: "Muitas tentativas. Aguarde 15 minutos." }, 429, {
            "Retry-After": "900",
          });
        const parsed = z
          .object({ password: z.string().min(1).max(256) })
          .strict()
          .safeParse(await readJson(request));
        if (!parsed.success || !(await verifyPassword(parsed.data.password)))
          return json({ error: "Credenciais inválidas." }, 401);
        return json({ authenticated: true }, 200, {
          "Set-Cookie": sessionCookie(request, newSession()),
        });
      }
      if (request.method === "DELETE") {
        revoke(request);
        return json({ ok: true }, 200, { "Set-Cookie": sessionCookie(request, "", true) });
      }
    }
    if (path.startsWith("/api/admin/")) {
      if (!authenticated(request)) return json({ error: "Faça login para continuar." }, 401);
      if (path === "/api/admin/requests" && request.method === "GET") {
        const status = url.searchParams.get("status") || "";
        if (status && !statuses.some((s) => s === status))
          return json({ error: "Filtro inválido." }, 400);
        const page = z.coerce
          .number()
          .int()
          .min(1)
          .max(100000)
          .safeParse(url.searchParams.get("page") || "1");
        if (!page.success) return json({ error: "Página inválida." }, 400);
        return json(listContacts(status, page.data));
      }
      const id = path.split("/").at(-1) || "";
      if (path.startsWith("/api/admin/requests/") && z.string().uuid().safeParse(id).success) {
        if (request.method === "PATCH") {
          const parsed = statusSchema.safeParse(await readJson(request));
          if (!parsed.success) return json({ error: "Status inválido." }, 400);
          const result = database()
            .prepare("UPDATE contacts SET status=? WHERE id=?")
            .run(parsed.data.status, id);
          return Number(result.changes)
            ? json({ ok: true })
            : json({ error: "Solicitação não encontrada." }, 404);
        }
        if (request.method === "DELETE") {
          const result = database().prepare("DELETE FROM contacts WHERE id=?").run(id);
          return Number(result.changes)
            ? json({ ok: true })
            : json({ error: "Solicitação não encontrada." }, 404);
        }
      }
    }
    return json({ error: "Endpoint não encontrado." }, 404);
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    if (code === "PHONE_LIMIT")
      return json(
        {
          error: "Limite de solicitações para este celular. Aguarde 30 minutos ou use o WhatsApp.",
        },
        429,
        { "Retry-After": "1800" },
      );
    if (code === "BODY_TOO_LARGE") return json({ error: "Solicitação muito grande." }, 413);
    if (code === "CONTENT_TYPE") return json({ error: "Envie dados em JSON." }, 415);
    if (code === "JSON_INVALID") return json({ error: "Solicitação inválida." }, 400);
    console.error("TOPFIT_API_FAILURE", error instanceof Error ? error.name : "UnknownError");
    return json(
      { error: "Não foi possível concluir. Tente novamente ou fale pelo WhatsApp." },
      503,
    );
  }
}
