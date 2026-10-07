import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { getUnit, plans, units } from "@/data/topfit";
import { cta } from "@/components/site/primitives";
import { ContactForm } from "@/components/site/ContactForm";
import { PlansGrid } from "@/components/site/shared";

export const Route = createFileRoute("/comece-agora")({
  validateSearch: z.object({ unidade: z.string().optional(), plano: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Planos e promoções por unidade — Top Fit" },
      {
        name: "description",
        content:
          "Confira as ofertas do primeiro mês por unidade e fale com a Top Fit pelo WhatsApp.",
      },
      { property: "og:title", content: "Planos e promoções Top Fit" },
      {
        property: "og:description",
        content: "Valores por unidade para alunos novos e inativos. Atendimento pelo WhatsApp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Offers,
});

function Offers() {
  const navigate = useNavigate();
  const { unidade, plano } = Route.useSearch();
  const candidate = plans.find((p) => p.id === plano);
  const unit = unidade ? getUnit(unidade) : candidate ? getUnit(candidate.unitSlug) : undefined;
  const invalid = !!(
    (unidade && !unit) ||
    (plano && (!candidate || (unit && candidate.unitSlug !== unit.slug)))
  );
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pb-32 pt-28 sm:px-6">
      <p className="eyebrow text-primary">{unit ? unit.name : "Planos por unidade"}</p>
      <h1 className="font-display-x mt-3 text-5xl sm:text-6xl">
        Seu primeiro mês
        <br />
        <span className="text-primary">na Top Fit.</span>
      </h1>
      <p className="mt-6 max-w-2xl text-muted-foreground">
        Promoção para alunos novos e inativos, com acesso em horário livre. Escolha sua unidade e
        fale pelo WhatsApp para consultar as condições e começar.
      </p>
      {invalid && (
        <p role="alert" className="mt-6 text-sm text-red-400">
          Unidade ou plano não encontrado. Selecione uma das opções abaixo.
        </p>
      )}
      <label className="mt-8 block max-w-md">
        <span className="eyebrow mb-2 block">Escolha a unidade</span>
        <select
          value={unit?.slug || ""}
          onChange={(e) => {
            const slug = e.target.value;
            void navigate({ to: "/comece-agora", search: slug ? { unidade: slug } : {} });
          }}
          className="h-12 w-full rounded-sm border bg-background px-4"
        >
          <option value="">Todas as unidades</option>
          {units.map((u) => (
            <option key={u.slug} value={u.slug}>
              {u.neighborhood}
            </option>
          ))}
        </select>
      </label>
      <div className="mt-10">
        <PlansGrid {...(unit ? { unitSlug: unit.slug } : {})} />
      </div>
      <p className="mt-8 max-w-2xl text-sm text-muted-foreground">
        Os valores anunciados são referentes ao primeiro mês. Confirme a disponibilidade da
        promoção, a mensalidade dos próximos meses e as demais condições diretamente com a unidade.
      </p>
      <section id="interesse" className="mt-16 max-w-2xl">
        <h2 className="font-display-x text-4xl">Solicite sua matrícula.</h2>
        <p className="mb-8 mt-4 text-muted-foreground">
          Registre seu interesse e continue o atendimento pelo WhatsApp. A matrícula será concluída
          com a equipe.
        </p>
        <ContactForm
          key={unit?.slug || "all"}
          kind="matricula"
          {...(unit ? { defaultUnit: unit.slug } : {})}
          {...(candidate && !invalid ? { defaultPlan: candidate.id } : {})}
        />
      </section>
      {unit && (
        <Link to="/comece-agora" search={{}} className={cta({ variant: "outline" }) + " mt-8"}>
          Ver todas as unidades
        </Link>
      )}
    </main>
  );
}
