import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, MapPin, Clock } from "lucide-react";
import { useState, type FormEvent } from "react";
import { goals, mapsLink, plans, units, type Unit } from "@/data/topfit";
import { cta, Pending, Reveal } from "./primitives";

export function UnitCard({ unit, index }: { unit: Unit; index: number }) {
  return (
    <Reveal delay={index * 80}>
      <article className="group">
        <Link to="/unidades/$slug" params={{ slug: unit.slug }} className="relative block aspect-[4/5] overflow-hidden rounded-sm">
          <img src={unit.image} alt={`Unidade ${unit.name}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 overlay-bottom" />
          <div className="absolute inset-x-0 bottom-0 p-6">
            <p className="eyebrow text-primary">0{index + 1} · Manaus</p>
            <h3 className="font-display-x mt-2 text-4xl">{unit.neighborhood}</h3>
          </div>
        </Link>
        <div className="mt-5 space-y-2 text-sm">
          <p className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-primary" />{unit.address ?? <Pending>Endereço em breve</Pending>}</p>
          <p className="flex gap-2"><Clock className="h-4 w-4 shrink-0 text-primary" />{unit.hours ?? <Pending>Horário em breve</Pending>}</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/unidades/$slug" params={{ slug: unit.slug }} className={cta({ size: "sm" })}>Conhecer unidade</Link>
          <a href={mapsLink(unit)} target="_blank" rel="noreferrer" className={cta({ variant: "outline", size: "sm" })}>Como chegar</a>
        </div>
      </article>
    </Reveal>
  );
}

export function PlansGrid({ onPick, selected }: { onPick?: (id: string) => void; selected?: string }) {
  return (
    <div className="grid gap-px overflow-hidden rounded-sm border bg-border md:grid-cols-3">
      {plans.map((p) => (
        <div key={p.id} className={`relative flex flex-col bg-background p-8 ${selected === p.id ? "ring-2 ring-inset ring-primary" : ""}`}>
          {p.featured && <span className="eyebrow absolute right-6 top-6 bg-primary px-2 py-1 text-primary-foreground">Mais escolhido</span>}
          {/* PLACEHOLDER: nome, preço e benefícios oficiais em src/data/topfit.ts */}
          <h3 className="font-display-x text-3xl">{p.name}</h3>
          <p className="mt-6 font-display text-4xl font-black">{p.price ?? <span className="text-2xl text-muted-foreground">Valor em breve</span>}</p>
          <ul className="mt-6 flex-1 space-y-3 text-sm">
            {p.benefits ? p.benefits.map((b) => (
              <li key={b} className="flex gap-2"><Check className="h-4 w-4 text-primary" />{b}</li>
            )) : <li><Pending>Benefícios serão divulgados em breve</Pending></li>}
          </ul>
          {onPick ? (
            <button onClick={() => onPick(p.id)} className={cta({ variant: selected === p.id ? "primary" : "outline" }) + " mt-8 w-full"}>
              {selected === p.id ? "Selecionado" : "Escolher"}
            </button>
          ) : (
            <Link to="/comece-agora" className={cta() + " mt-8 w-full"}>Começar agora</Link>
          )}
        </div>
      ))}
    </div>
  );
}

const field = "h-12 w-full rounded-sm border border-input bg-transparent px-4 text-base outline-none focus:border-primary";

export function TrialForm({ defaultUnit }: { defaultUnit?: string }) {
  const [sent, setSent] = useState(false);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // INTEGRAÇÃO PENDENTE: enviar para WhatsApp / CRM / banco de dados.
    setSent(true);
  };
  if (sent)
    return (
      <div className="rounded-sm border border-primary p-8">
        <p className="font-display-x text-3xl text-primary">Recebemos!</p>
        <p className="mt-3 text-muted-foreground">Obrigado pelo interesse. O envio automático para a equipe ainda está sendo configurado.</p>
      </div>
    );
  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <label className="sm:col-span-2"><span className="eyebrow mb-2 block text-muted-foreground">Nome</span><input required name="nome" className={field} autoComplete="name" /></label>
      <label><span className="eyebrow mb-2 block text-muted-foreground">WhatsApp</span><input required name="whatsapp" type="tel" inputMode="tel" className={field} placeholder="(92) 9 0000-0000" /></label>
      <label><span className="eyebrow mb-2 block text-muted-foreground">Unidade</span>
        <select required name="unidade" defaultValue={defaultUnit ?? ""} className={field + " bg-background"}>
          <option value="" disabled>Selecione</option>
          {units.map((u) => <option key={u.slug} value={u.slug}>{u.neighborhood}</option>)}
        </select>
      </label>
      <label className="sm:col-span-2"><span className="eyebrow mb-2 block text-muted-foreground">Objetivo</span>
        <select required name="objetivo" defaultValue="" className={field + " bg-background"}>
          <option value="" disabled>Selecione</option>
          {goals.map((g) => <option key={g}>{g}</option>)}
        </select>
      </label>
      <button className={cta({ size: "lg" }) + " sm:col-span-2"}>Quero conhecer a Top Fit <ArrowRight className="h-5 w-5" /></button>
    </form>
  );
}

export function MapEmbed({ query, className }: { query: string; className?: string }) {
  return (
    <iframe
      title="Mapa Top Fit"
      loading="lazy"
      className={className}
      src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`}
    />
  );
}
