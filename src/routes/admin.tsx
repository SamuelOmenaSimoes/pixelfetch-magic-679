import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { statusLabels, statuses, type ContactRecord } from "@/lib/contact-schema";
import { cta } from "@/components/site/primitives";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Atendimento — Top Fit" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: Admin,
});
function Admin() {
  const [logged, setLogged] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [records, setRecords] = useState<ContactRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const expire = () => {
    setLogged(false);
    setRecords([]);
    setTotal(0);
  };
  const load = useCallback(
    async (signal?: AbortSignal) => {
      const response = await fetch(
        `/api/admin/requests?page=${page}&status=${encodeURIComponent(filter)}`,
        { ...(signal ? { signal } : {}) },
      );
      if (response.status === 401) {
        expire();
        throw new Error("Sessão encerrada. Faça login novamente.");
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Falha ao consultar pedidos.");
      setRecords(result.records);
      setTotal(result.total);
    },
    [page, filter],
  );
  useEffect(() => {
    const abort = new AbortController();
    fetch("/api/admin/session", { signal: abort.signal })
      .then((r) => {
        if (r.ok) setLogged(true);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError("Não foi possível consultar sua sessão.");
      })
      .finally(() => setChecking(false));
    return () => abort.abort();
  }, []);
  useEffect(() => {
    if (!logged) return;
    const abort = new AbortController();
    setBusy(true);
    load(abort.signal)
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => {
        if (!abort.signal.aborted) setBusy(false);
      });
    return () => abort.abort();
  }, [logged, load]);
  const login = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setPassword("");
      setLogged(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao entrar.");
    } finally {
      setBusy(false);
    }
  };
  const mutate = async (id: string, method: "PATCH" | "DELETE", status?: string) => {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/requests/${id}`, {
        method,
        headers: { "Content-Type": "application/json" },
        ...(status ? { body: JSON.stringify({ status }) } : {}),
      });
      const data = await response.json();
      if (response.status === 401) expire();
      if (!response.ok) throw new Error(data.error);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao atualizar.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pb-32 pt-28 sm:px-6">
      <p className="eyebrow text-primary">Área da equipe</p>
      <h1 className="font-display-x mt-3 text-5xl">Atendimento.</h1>
      {checking ? (
        <p className="mt-8" role="status">
          Verificando acesso…
        </p>
      ) : !logged ? (
        <form onSubmit={login} className="mt-10 max-w-md space-y-4">
          <label className="block">
            <span className="eyebrow mb-2 block">Senha administrativa</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              maxLength={256}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 w-full rounded-sm border bg-background px-4"
            />
          </label>
          <button disabled={busy} className={cta() + " w-full"}>
            {busy ? "Entrando…" : "Entrar"}
          </button>
          <p className="text-sm text-muted-foreground">Acesso restrito à equipe autorizada.</p>
        </form>
      ) : (
        <>
          <div className="mt-8 flex flex-wrap items-end gap-4">
            <label>
              <span className="eyebrow mb-2 block">Status</span>
              <select
                value={filter}
                onChange={(e) => {
                  setPage(1);
                  setFilter(e.target.value);
                  setError("");
                }}
                className="h-12 rounded-sm border bg-background px-4"
              >
                <option value="">Todos</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {statusLabels[s]}
                  </option>
                ))}
              </select>
            </label>
            <button
              disabled={busy}
              className={cta({ variant: "outline" })}
              onClick={() => {
                setBusy(true);
                setError("");
                load()
                  .catch((e) => setError(e.message))
                  .finally(() => setBusy(false));
              }}
            >
              Atualizar
            </button>
            <button
              disabled={busy}
              className={cta({ variant: "ghost" })}
              onClick={async () => {
                setBusy(true);
                try {
                  const r = await fetch("/api/admin/session", { method: "DELETE" });
                  if (!r.ok) throw new Error("Não foi possível sair. Tente novamente.");
                  expire();
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Falha ao sair.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              Sair
            </button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground" role="status">
            {busy ? "Atualizando…" : `${total} pedido(s). Página ${page}.`}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Pedidos de matrícula são solicitações de atendimento. O status concluído não ativa plano
            nem confirma pagamento.
          </p>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {records.map((r) => (
              <article key={r.id} className="min-w-0 rounded-sm border p-5">
                <div className="flex flex-wrap justify-between gap-3">
                  <h2 className="font-display text-xl font-bold">{r.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
                <p className="mt-2 text-primary">
                  {r.kind === "matricula" ? "Solicitação de matrícula" : "Aula experimental"} ·{" "}
                  {r.unitName}
                  {r.discipline === "crossfit" ? " · Crossfit" : ""}
                </p>
                <dl className="mt-4 space-y-2 break-words text-sm">
                  <div>
                    <dt className="inline text-muted-foreground">Telefone: </dt>
                    <dd className="inline">{r.phone}</dd>
                  </div>
                  {r.email && (
                    <div>
                      <dt className="inline text-muted-foreground">E-mail: </dt>
                      <dd className="inline">{r.email}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="inline text-muted-foreground">Objetivo: </dt>
                    <dd className="inline">{r.goal}</dd>
                  </div>
                  {r.offerPrice && (
                    <div>
                      <dt className="inline text-muted-foreground">Oferta solicitada: </dt>
                      <dd className="inline">{r.offerPrice} no 1º mês</dd>
                    </div>
                  )}
                  {r.notes && (
                    <div>
                      <dt className="text-muted-foreground">Observações:</dt>
                      <dd className="whitespace-pre-wrap">{r.notes}</dd>
                    </div>
                  )}
                </dl>
                <p className="mt-4 break-all text-xs text-muted-foreground">Protocolo: {r.id}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <label>
                    <span className="sr-only">Status de {r.name}</span>
                    <select
                      disabled={busy}
                      value={r.status}
                      onChange={(e) => void mutate(r.id, "PATCH", e.target.value)}
                      className="h-10 rounded-sm border bg-background px-3"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {statusLabels[s]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    disabled={busy}
                    className="px-3 text-sm text-red-400 underline"
                    onClick={() => {
                      if (
                        window.confirm("Excluir definitivamente este pedido e seus dados pessoais?")
                      )
                        void mutate(r.id, "DELETE");
                    }}
                  >
                    Excluir pedido
                  </button>
                </div>
              </article>
            ))}
          </div>
          {!busy && !records.length && <p className="mt-8">Nenhum pedido encontrado.</p>}
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              disabled={busy || page <= 1}
              className={cta({ variant: "outline" })}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </button>
            <button
              disabled={busy || page * 25 >= total}
              className={cta({ variant: "outline" })}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </button>
          </div>
        </>
      )}
      {error && (
        <p role="alert" className="mt-6 text-red-400">
          {error}
        </p>
      )}
    </main>
  );
}
