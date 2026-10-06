import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { plans, units } from "@/data/topfit";
import { cta } from "@/components/site/primitives";
import { PlansGrid } from "@/components/site/shared";

export const Route = createFileRoute("/comece-agora")({
  validateSearch: z.object({ unidade: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Comece agora — Matrícula Top Fit" },
      { name: "description", content: "Escolha sua unidade e seu plano e comece a treinar na Top Fit em Manaus." },
      { property: "og:title", content: "Comece agora na Top Fit" },
      { property: "og:description", content: "Matrícula em etapas: unidade, plano, dados e revisão." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Signup,
});

const steps = ["Unidade", "Plano", "Seus dados", "Revisão", "Pagamento"];
const fields = [
  { name: "nome", label: "Nome completo", type: "text", auto: "name" },
  { name: "cpf", label: "CPF", type: "text", auto: "off" },
  { name: "email", label: "E-mail", type: "email", auto: "email" },
  { name: "telefone", label: "Telefone", type: "tel", auto: "tel" },
  { name: "nascimento", label: "Data de nascimento", type: "date", auto: "bday" },
] as const;

function Signup() {
  const search = Route.useSearch();
  const [step, setStep] = useState(search.unidade ? 1 : 0);
  const [unit, setUnit] = useState(search.unidade ?? "");
  const [plan, setPlan] = useState("");
  const [data, setData] = useState<Record<string, string>>({});
  const canNext = [!!unit, !!plan, fields.every((f) => data[f.name]?.trim()), true, false][step];
  const u = units.find((x) => x.slug === unit);
  const p = plans.find((x) => x.id === plan);

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 pb-32 pt-28 sm:px-6">
      <ol className="mb-12 grid grid-cols-5 gap-2">
        {steps.map((s, i) => (
          <li key={s}>
            <div className={`h-1.5 rounded-sm ${i <= step ? "bg-primary" : "bg-muted"}`} />
            <p className={`eyebrow mt-2 hidden sm:block ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{i + 1}. {s}</p>
          </li>
        ))}
      </ol>
      <p className="eyebrow text-primary">Etapa {step + 1} de 5</p>

      {step === 0 && (
        <>
          <h1 className="font-display-x mt-3 text-5xl sm:text-6xl">Escolha sua<br /><span className="text-primary">unidade.</span></h1>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {units.map((x) => (
              <button key={x.slug} onClick={() => setUnit(x.slug)} className={`group relative aspect-[4/3] overflow-hidden rounded-sm text-left ring-2 transition ${unit === x.slug ? "ring-primary" : "ring-transparent"}`}>
                <img src={x.image} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 overlay-bottom" />
                <span className="font-display-x absolute bottom-4 left-4 text-3xl">{x.neighborhood}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <h1 className="font-display-x mt-3 text-5xl sm:text-6xl">Escolha seu<br /><span className="text-primary">plano.</span></h1>
          <div className="mt-10"><PlansGrid onPick={setPlan} selected={plan} /></div>
        </>
      )}

      {step === 2 && (
        <>
          <h1 className="font-display-x mt-3 text-5xl sm:text-6xl">Seus<br /><span className="text-primary">dados.</span></h1>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {fields.map((f) => (
              <label key={f.name} className={f.name === "nome" ? "sm:col-span-2" : ""}>
                <span className="eyebrow mb-2 block text-muted-foreground">{f.label}</span>
                <input type={f.type} autoComplete={f.auto} value={data[f.name] ?? ""} onChange={(e) => setData({ ...data, [f.name]: e.target.value })} className="h-12 w-full rounded-sm border border-input bg-transparent px-4 text-base outline-none focus:border-primary" />
              </label>
            ))}
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h1 className="font-display-x mt-3 text-5xl sm:text-6xl">Revise sua<br /><span className="text-primary">matrícula.</span></h1>
          <dl className="mt-10 divide-y border-y">
            <Row k="Unidade" v={u?.name} />
            <Row k="Plano" v={p?.name} />
            {fields.map((f) => <Row key={f.name} k={f.label} v={data[f.name]} />)}
          </dl>
        </>
      )}

      {step === 4 && (
        <>
          <h1 className="font-display-x mt-3 text-5xl sm:text-6xl">Pagamento<br /><span className="text-primary">em breve.</span></h1>
          {/* INTEGRAÇÃO PENDENTE: gateway de pagamento. Nenhum pagamento é processado aqui. */}
          <div className="mt-10 flex gap-4 rounded-sm border p-6">
            <Lock className="shrink-0 text-primary" />
            <p className="text-muted-foreground">O pagamento online ainda está sendo configurado. Para finalizar sua matrícula agora, fale com a unidade escolhida.</p>
          </div>
          <Link to="/" className={cta({ variant: "outline" }) + " mt-8"}>Voltar ao início</Link>
        </>
      )}

      {step < 4 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur">
          <div className="mx-auto flex max-w-5xl justify-between gap-3">
            <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className={cta({ variant: "ghost" })}><ArrowLeft className="h-4 w-4" /> Voltar</button>
            <button onClick={() => setStep((s) => s + 1)} disabled={!canNext} className={cta()}>Continuar <ArrowRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </main>
  );
}

function Row({ k, v }: { k: string; v?: string | undefined }) {
  return (
    <div className="flex justify-between gap-4 py-4">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-right font-semibold">{v || "—"}</dd>
    </div>
  );
}
