import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { goals, getUnit, plans, units, CROSSFIT_WHATSAPP, whatsappLink } from "@/data/topfit";
import { requestSchema } from "@/lib/contact-schema";
import { cta } from "./primitives";

type Draft = {
  name: string;
  phone: string;
  email: string;
  unitSlug: string;
  discipline: "academia" | "crossfit";
  goal: string;
  notes: string;
  acknowledged: boolean;
  website: string;
};
type Receipt = { id: string; whatsapp: string | null };
export function ContactForm({
  kind = "experimental",
  defaultUnit = "",
  defaultPlan = "",
}: {
  kind?: "experimental" | "matricula";
  defaultUnit?: string;
  defaultPlan?: string;
}) {
  const initialPlan = plans.find(
    (p) => p.id === defaultPlan && (!defaultUnit || p.unitSlug === defaultUnit),
  );
  const [draft, setDraft] = useState<Draft>({
    name: "",
    phone: "",
    email: "",
    unitSlug: getUnit(defaultUnit)?.slug || initialPlan?.unitSlug || "",
    discipline: "academia",
    goal: "",
    notes: "",
    acknowledged: false,
    website: "",
  });
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const attempt = useRef({ payload: "", id: "" });
  const busy = useRef(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const unit = getUnit(draft.unitSlug);
  const selectedPlan =
    kind === "matricula" ? plans.find((p) => p.unitSlug === draft.unitSlug) : undefined;
  const dirty = !!(draft.name || draft.phone || draft.email || draft.notes);
  useEffect(() => {
    if (!dirty || receipt) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, receipt]);
  useEffect(() => {
    if (receipt) statusRef.current?.focus();
  }, [receipt]);
  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    setError("");
  };
  const field = (name: keyof Draft) => `${name}-${kind}`;
  const issue = (name: string) =>
    errors[name]?.length ? (
      <p id={`${name}-${kind}-error`} className="mt-2 text-sm text-red-400">
        {errors[name]?.join(" ")}
      </p>
    ) : null;
  const attrs = (name: keyof Draft) => ({
    id: field(name),
    "aria-invalid": !!errors[name]?.length,
    "aria-describedby": errors[name]?.length ? `${field(name)}-error` : undefined,
  });
  const input =
    "h-12 w-full min-w-0 rounded-sm border border-input bg-background px-4 text-base outline-none focus:border-primary";
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy.current) return;
    const payload = { ...draft, kind, planId: selectedPlan?.id || "" };
    const fingerprint = JSON.stringify(payload);
    if (attempt.current.payload !== fingerprint)
      attempt.current = { payload: fingerprint, id: crypto.randomUUID() };
    const parsed = requestSchema.safeParse({ ...payload, requestId: attempt.current.id });
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      setError("Revise os campos indicados.");
      requestAnimationFrame(() =>
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      );
      return;
    }
    busy.current = true;
    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
        signal: AbortSignal.timeout(15000),
      });
      const result = await response.json();
      if (!response.ok) {
        setErrors(result.fields || {});
        throw new Error(result.error || "Não foi possível registrar. Tente novamente.");
      }
      setReceipt({ id: result.id, whatsapp: result.whatsapp });
    } catch (err) {
      setError(
        err instanceof Error && err.name !== "TimeoutError"
          ? err.message
          : "O envio demorou mais que o esperado. Tente novamente; pedidos repetidos não serão duplicados.",
      );
    } finally {
      busy.current = false;
      setSending(false);
    }
  };
  const direct =
    draft.discipline === "crossfit"
      ? `https://wa.me/${CROSSFIT_WHATSAPP}?text=${encodeURIComponent("Olá! Gostaria de consultar uma aula experimental de crossfit.")}`
      : unit
        ? whatsappLink(unit)
        : null;
  if (receipt)
    return (
      <div
        ref={statusRef}
        tabIndex={-1}
        className="rounded-sm border border-primary p-6 outline-none sm:p-8"
        role="status"
      >
        <p className="font-display-x text-3xl text-primary">Pedido registrado.</p>
        <p className="mt-3 text-muted-foreground">
          {kind === "matricula"
            ? "Sua solicitação de matrícula foi salva. A contratação será combinada com a equipe pelo WhatsApp."
            : "Seu interesse foi salvo. Combine a disponibilidade e o horário da aula com a equipe pelo WhatsApp."}
        </p>
        <p className="mt-4 break-all text-xs text-muted-foreground">Protocolo: {receipt.id}</p>
        {receipt.whatsapp && (
          <a
            href={receipt.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className={cta() + " mt-6 w-full"}
          >
            Continuar no WhatsApp <ArrowRight className="h-4 w-4" />
          </a>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          A mensagem só será enviada quando você confirmar no WhatsApp. Este pedido não confirma
          horário, pagamento ou matrícula ativa.
        </p>
        <button
          type="button"
          className={cta({ variant: "ghost" }) + " mt-4"}
          onClick={() => {
            setReceipt(null);
            setDraft((d) => ({
              ...d,
              name: "",
              phone: "",
              email: "",
              notes: "",
              acknowledged: false,
            }));
            attempt.current = { payload: "", id: "" };
          }}
        >
          Novo pedido
        </button>
      </div>
    );
  return (
    <form
      ref={formRef}
      onSubmit={submit}
      noValidate
      className="grid min-w-0 gap-4 sm:grid-cols-2"
      aria-label={kind === "matricula" ? "Solicitação de matrícula" : "Aula experimental"}
    >
      <div className="sm:col-span-2">
        <label htmlFor={field("name")} className="eyebrow mb-2 block text-muted-foreground">
          Nome
        </label>
        <input
          {...attrs("name")}
          name="name"
          value={draft.name}
          onChange={(e) => update("name", e.target.value)}
          autoComplete="name"
          maxLength={100}
          required
          className={input}
        />
        {issue("name")}
      </div>
      <div>
        <label htmlFor={field("phone")} className="eyebrow mb-2 block text-muted-foreground">
          WhatsApp
        </label>
        <input
          {...attrs("phone")}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={draft.phone}
          onChange={(e) => update("phone", e.target.value)}
          maxLength={20}
          required
          placeholder="(92) 9 0000-0000"
          className={input}
        />
        {issue("phone")}
      </div>
      <div>
        <label htmlFor={field("email")} className="eyebrow mb-2 block text-muted-foreground">
          E-mail (opcional)
        </label>
        <input
          {...attrs("email")}
          name="email"
          type="email"
          autoComplete="email"
          value={draft.email}
          onChange={(e) => update("email", e.target.value)}
          maxLength={254}
          className={input}
        />
        {issue("email")}
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={field("unitSlug")} className="eyebrow mb-2 block text-muted-foreground">
          Unidade
        </label>
        <select
          {...attrs("unitSlug")}
          value={draft.unitSlug}
          onChange={(e) => update("unitSlug", e.target.value)}
          required
          className={input}
        >
          <option value="">Selecione</option>
          {units.map((u) => (
            <option key={u.slug} value={u.slug}>
              {u.neighborhood}
            </option>
          ))}
        </select>
        {issue("unitSlug")}
      </div>
      {kind === "experimental" && (
        <div className="sm:col-span-2">
          <label htmlFor={field("discipline")} className="eyebrow mb-2 block text-muted-foreground">
            Atividade de interesse
          </label>
          <select
            {...attrs("discipline")}
            value={draft.discipline}
            onChange={(e) => update("discipline", e.target.value as Draft["discipline"])}
            className={input}
          >
            <option value="academia">Academia</option>
            <option value="crossfit">Crossfit</option>
          </select>
          <p className="mt-2 text-xs text-muted-foreground">
            Crossfit tem atendimento próprio. Confirme com a equipe os locais e horários
            disponíveis.
          </p>
        </div>
      )}
      {selectedPlan && (
        <div className="rounded-sm border p-4 sm:col-span-2">
          <p className="font-display font-bold">
            {selectedPlan.name} · {selectedPlan.price} no 1º mês
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Para alunos novos e inativos, com acesso em horário livre. Consulte disponibilidade,
            mensalidade posterior e demais condições com a unidade.
          </p>
        </div>
      )}
      {issue("planId")}
      <div className="sm:col-span-2">
        <label htmlFor={field("goal")} className="eyebrow mb-2 block text-muted-foreground">
          Objetivo
        </label>
        <select
          {...attrs("goal")}
          value={draft.goal}
          onChange={(e) => update("goal", e.target.value)}
          required
          className={input}
        >
          <option value="">Selecione</option>
          {goals.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
        {issue("goal")}
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={field("notes")} className="eyebrow mb-2 block text-muted-foreground">
          Observações (opcional)
        </label>
        <textarea
          {...attrs("notes")}
          value={draft.notes}
          onChange={(e) => update("notes", e.target.value)}
          maxLength={500}
          rows={3}
          className={input + " h-auto py-3"}
          placeholder="Conte seu objetivo ou sua preferência de horário. Evite informações de saúde ou outros dados sensíveis."
        />
        {issue("notes")}
      </div>
      <div className="hidden" aria-hidden="true">
        <label>
          Site
          <input
            name="website"
            value={draft.website}
            onChange={(e) => update("website", e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>
      <div className="sm:col-span-2">
        <label className="flex items-start gap-3 text-sm text-muted-foreground">
          <input
            {...attrs("acknowledged")}
            type="checkbox"
            checked={draft.acknowledged}
            onChange={(e) => update("acknowledged", e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-primary"
          />
          <span>
            Li o{" "}
            <Link
              to="/privacidade"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              aviso de privacidade
            </Link>{" "}
            e estou ciente do uso dos dados para atender esta solicitação.
          </span>
        </label>
        {issue("acknowledged")}
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-400 sm:col-span-2">
          {error}
        </p>
      )}
      <button
        disabled={sending}
        aria-busy={sending}
        className={cta({ size: "lg" }) + " w-full sm:col-span-2"}
      >
        {sending
          ? "Registrando…"
          : kind === "matricula"
            ? "Solicitar matrícula"
            : "Solicitar aula experimental"}
        <ArrowRight className="h-4 w-4 shrink-0" />
      </button>
      <p className="text-xs text-muted-foreground sm:col-span-2">
        Seus dados serão registrados para atendimento. Preencher não confirma matrícula ou aula.
        Você também pode falar diretamente pelo WhatsApp.
      </p>
      {direct && (
        <a
          href={direct}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-primary underline sm:col-span-2"
        >
          Falar diretamente no WhatsApp
        </a>
      )}
    </form>
  );
}
