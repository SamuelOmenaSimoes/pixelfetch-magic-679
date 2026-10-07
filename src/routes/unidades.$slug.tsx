import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MapPin, Clock, Phone } from "lucide-react";
import { getUnit, mapsLink, modalities, whatsappLink } from "@/data/topfit";
import estrutura from "@/assets/estrutura.jpg";
import musculacao from "@/assets/musculacao.jpg";
import cardio from "@/assets/cardio.jpg";
import { cta, Pending, SectionTitle } from "@/components/site/primitives";
import { MapEmbed, PlansGrid, TrialForm } from "@/components/site/shared";

export const Route = createFileRoute("/unidades/$slug")({
  loader: ({ params }) => {
    const unit = getUnit(params.slug);
    if (!unit) throw notFound();
    return { unit };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return {
        meta: [
          { title: "Unidade não encontrada — Top Fit" },
          { name: "robots", content: "noindex" },
        ],
      };
    const { unit } = loaderData;
    const title = `${unit.name} — Academia em ${unit.neighborhood}, Manaus`;
    const description = `Conheça a ${unit.name}: estrutura, modalidades, planos e aula experimental no bairro ${unit.neighborhood}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: UnitNotFound,
  component: UnitPage,
});

function UnitNotFound() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-40 sm:px-6">
      <h1 className="font-display-x text-5xl">Unidade não encontrada.</h1>
      <Link to="/" hash="academias" className={cta() + " mt-8"}>
        Ver unidades
      </Link>
    </main>
  );
}

function UnitPage() {
  const { unit } = Route.useLoaderData();
  const wa = whatsappLink(unit);
  return (
    <main>
      <section className="relative flex min-h-[80svh] items-end overflow-hidden">
        <img
          src={unit.image}
          alt={unit.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 overlay-bottom" />
        <div className="absolute inset-0 overlay-hero" />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-32 sm:px-6">
          <p className="eyebrow text-primary">Unidade · Manaus</p>
          <h1 className="font-display-x mt-3 text-6xl sm:text-8xl">
            Top Fit
            <br />
            <span className="text-primary">{unit.neighborhood}.</span>
          </h1>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/comece-agora"
              search={{ unidade: unit.slug }}
              className={cta({ size: "lg" })}
            >
              Comece agora
            </Link>
            <a href="#aula" className={cta({ variant: "outline", size: "lg" })}>
              Aula experimental
            </a>
          </div>
        </div>
      </section>

      <section className="border-b bg-surface">
        <div className="mx-auto grid max-w-7xl gap-px sm:grid-cols-3">
          <Info icon={<MapPin />} label="Endereço" value={unit.address} />
          <Info icon={<Clock />} label="Horários" value={unit.hours} />
          <div className="flex gap-4 px-4 py-8 sm:px-6">
            <Phone className="text-primary" />
            <div>
              <p className="eyebrow text-muted-foreground">WhatsApp</p>
              {wa ? (
                <a
                  href={wa}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block font-semibold text-primary"
                >
                  Falar com a unidade
                </a>
              ) : (
                <p className="mt-1">
                  <Pending>Número em breve</Pending>
                </p>
              )}
            </div>
          </div>
          {unit.email && (
            <div className="px-4 pb-6 sm:col-span-3 sm:px-6">
              <a href={`mailto:${unit.email}`} className="text-sm text-primary hover:underline">
                {unit.email}
              </a>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <SectionTitle eyebrow="Nesta unidade" lines={["Modalidades", "e estrutura."]} />
        <div className="mt-10 flex flex-wrap gap-3">
          {(unit.modalities ?? []).map((m) => (
            <span key={m} className="border px-4 py-2 font-display font-bold uppercase italic">
              {m}
            </span>
          ))}
          {!unit.modalities && (
            <p className="text-muted-foreground">
              Modalidades desta unidade serão confirmadas em breve. Opções da rede:{" "}
              {modalities.map((m) => m.name).join(", ")}.
            </p>
          )}
        </div>
        {/* PLACEHOLDER: substituir pela galeria com fotos reais da unidade */}
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[estrutura, musculacao, cardio].map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Galeria ${unit.name} ${i + 1}`}
              loading="lazy"
              className={`aspect-[4/3] w-full rounded-sm object-cover ${i === 0 ? "md:col-span-2 md:row-span-2 md:aspect-auto md:h-full" : ""}`}
            />
          ))}
        </div>
      </section>

      <section className="bg-surface py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle eyebrow="Planos" lines={["Um plano para", "o seu ritmo."]} />
          <div className="mt-12">
            <PlansGrid unitSlug={unit.slug} />
          </div>
        </div>
      </section>

      <section
        id="aula"
        className="mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2"
      >
        <SectionTitle
          eyebrow="Aula experimental"
          lines={["Venha conhecer", unit.neighborhood + "."]}
        />
        <TrialForm defaultUnit={unit.slug} />
      </section>

      <section className="border-t">
        <MapEmbed query={unit.address ?? unit.mapsQuery} className="h-[400px] w-full grayscale" />
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <a
            href={mapsLink(unit)}
            target="_blank"
            rel="noreferrer"
            className={cta({ variant: "outline" })}
          >
            Como chegar
          </a>
        </div>
      </section>
    </main>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex gap-4 px-4 py-8 sm:px-6 [&>svg]:text-primary">
      {icon}
      <div>
        <p className="eyebrow text-muted-foreground">{label}</p>
        <p className="mt-1">{value ?? <Pending />}</p>
      </div>
    </div>
  );
}
