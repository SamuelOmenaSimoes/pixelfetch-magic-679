import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, MapPin, Clock } from "lucide-react";
import { ContactForm } from "./ContactForm";
import {
  mapsLink,
  plans,
  planWhatsAppLink,
  units,
  CROSSFIT_SCHEDULE,
  CROSSFIT_WHATSAPP,
  type Unit,
} from "@/data/topfit";
import { cta, Pending, Reveal } from "./primitives";

export function UnitCard({ unit, index }: { unit: Unit; index: number }) {
  return (
    <Reveal delay={index * 80}>
      <article className="group">
        <Link
          to="/unidades/$slug"
          params={{ slug: unit.slug }}
          className="relative block aspect-[4/5] overflow-hidden rounded-sm"
        >
          <img
            src={unit.image}
            alt={`Unidade ${unit.name}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 overlay-bottom" />
          <div className="absolute inset-x-0 bottom-0 p-6">
            <p className="eyebrow text-primary">
              0{units.findIndex((u) => u.slug === unit.slug) + 1} · Manaus
            </p>
            <h3 className="font-display-x mt-2 text-4xl">{unit.neighborhood}</h3>
          </div>
        </Link>
        <div className="mt-5 space-y-2 text-sm">
          <p className="flex gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
            {unit.address ?? <Pending>Endereço em breve</Pending>}
          </p>
          <p className="flex gap-2">
            <Clock className="h-4 w-4 shrink-0 text-primary" />
            {unit.hours ?? <Pending>Horário em breve</Pending>}
          </p>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/unidades/$slug" params={{ slug: unit.slug }} className={cta({ size: "sm" })}>
            Conhecer unidade
          </Link>
          <a
            href={mapsLink(unit)}
            target="_blank"
            rel="noreferrer"
            className={cta({ variant: "outline", size: "sm" })}
          >
            Como chegar
          </a>
        </div>
      </article>
    </Reveal>
  );
}

export function PlansGrid({ unitSlug }: { unitSlug?: string }) {
  const offers = unitSlug ? plans.filter((p) => p.unitSlug === unitSlug) : plans;
  return (
    <div
      className={`grid gap-px overflow-hidden rounded-sm border bg-border ${unitSlug ? "max-w-xl" : "md:grid-cols-3"}`}
    >
      {offers.map((p) => {
        const href = planWhatsAppLink(p);
        return (
          <div key={p.id} className="relative flex flex-col bg-background p-8">
            <p className="eyebrow mb-3 text-muted-foreground">Promoção · primeiro mês</p>
            <h3 className="font-display-x text-3xl">{p.name}</h3>
            <p className="mt-6 font-display text-4xl font-black">{p.price}</p>
            <p className="mt-2 text-sm text-muted-foreground">no 1º mês</p>
            <ul className="mt-6 flex-1 space-y-3 text-sm">
              {p.benefits.map((b) => (
                <li key={b} className="flex gap-2">
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                  {b}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted-foreground">
              Consulte a disponibilidade da promoção, o valor dos próximos meses e as demais
              condições com a unidade.
            </p>
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={cta() + " mt-8 w-full"}
              >
                Falar no WhatsApp <ArrowRight className="h-4 w-4" />
              </a>
            ) : (
              <div className="mt-8">
                <button type="button" disabled className={cta({ variant: "outline" }) + " w-full"}>
                  WhatsApp em breve
                </button>
                <p className="mt-3 text-xs text-muted-foreground">
                  Contato desta unidade ainda não informado.
                </p>
              </div>
            )}
            <Link
              to="/comece-agora"
              search={{ unidade: p.unitSlug, plano: p.id }}
              hash="interesse"
              className="mt-4 text-center text-sm font-semibold underline underline-offset-4"
            >
              Registrar interesse neste plano
            </Link>
          </div>
        );
      })}
    </div>
  );
}

export function TrialForm({ defaultUnit }: { defaultUnit?: string }) {
  return (
    <div className="space-y-8">
      <ContactForm {...(defaultUnit ? { defaultUnit } : {})} />
      <aside
        id="horarios-crosstopfit"
        className="rounded-sm border p-5 sm:p-6"
        aria-label="Horários do CrossTopFit"
      >
        <h3 className="font-display-x text-2xl">Horários do CrossTopFit</h3>
        <dl className="mt-4 space-y-3 text-sm">
          {CROSSFIT_SCHEDULE.map(({ day, time }) => (
            <div key={day} className="flex flex-wrap justify-between gap-x-4 gap-y-1">
              <dt className="text-muted-foreground">{day}</dt>
              <dd className="font-semibold">{time}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs text-muted-foreground">
          Confirme o local e a disponibilidade da aula experimental com a equipe do CrossTopFit.
        </p>
        <a
          href={`https://wa.me/${CROSSFIT_WHATSAPP}?text=${encodeURIComponent("Olá! Gostaria de conhecer o CrossTopFit e agendar uma aula experimental.")}`}
          target="_blank"
          rel="noopener noreferrer"
          className={cta({ variant: "outline", size: "sm" }) + " mt-4"}
        >
          Experimental CrossTopFit
        </a>
      </aside>
    </div>
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
