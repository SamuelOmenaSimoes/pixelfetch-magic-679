import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Search, Check } from "lucide-react";
import { useState, type FormEvent } from "react";
import hero from "@/assets/hero.jpg";
import estrutura from "@/assets/estrutura.jpg";
import cardio from "@/assets/cardio.jpg";
import musculacao from "@/assets/musculacao.jpg";
import funcional from "@/assets/funcional.jpg";
import ctaImg from "@/assets/cta.jpg";
import { faq, INSTAGRAM_URL, mapsLink, modalities, units } from "@/data/topfit";
import { cta, Pending, Reveal, SectionTitle } from "@/components/site/primitives";
import { MapEmbed, PlansGrid, TrialForm, UnitCard } from "@/components/site/shared";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Top Fit Academia — Rede de academias em Manaus" },
      {
        name: "description",
        content:
          "Três unidades em Manaus: São Jorge, Santo Antônio e Alvorada. Estrutura completa, modalidades e planos para o seu ritmo.",
      },
      { property: "og:title", content: "Top Fit Academia — Vem ser Top Fit" },
      {
        property: "og:description",
        content: "Rede de academias em Manaus com três unidades. Encontre a sua e comece agora.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <main>
      <Hero />
      <Benefits />
      <FindUnit />
      <Plans />
      <Modalities />
      <Structure />
      <Experience />
      <Trial />
      <MapSection />
      <Social />
      <Faq />
      <FinalCta />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative flex min-h-[100svh] items-end overflow-hidden lg:items-center">
      <img
        src={hero}
        alt="Imagem ilustrativa de treino de musculação"
        width={1920}
        height={1088}
        className="absolute inset-0 h-full w-full object-cover object-[70%_center] animate-in fade-in zoom-in-105 duration-1000"
      />
      <div className="absolute inset-0 overlay-hero" />
      <div className="absolute inset-0 overlay-bottom lg:hidden" />
      <div className="relative mx-auto w-full max-w-7xl px-4 pb-28 pt-32 sm:px-6 lg:pb-0">
        <h1 className="font-display-x text-[17vw] sm:text-8xl lg:text-[9rem] animate-in fade-in slide-in-from-bottom-4 duration-700">
          Vem ser
          <br />
          <span className="text-primary">Top Fit.</span>
        </h1>
        <p className="mt-6 max-w-md text-lg text-foreground/85">
          Estrutura completa, diversas modalidades e três unidades para você treinar em Manaus.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/comece-agora" className={cta({ size: "lg" })}>
            Comece agora <ArrowRight className="h-5 w-5" />
          </Link>
          <Link to="/" hash="academias" className={cta({ variant: "outline", size: "lg" })}>
            Encontre sua unidade
          </Link>
        </div>
        <p className="eyebrow mt-10 text-foreground/60">
          3 unidades em Manaus — São Jorge · Santo Antônio · Alvorada
        </p>
      </div>
    </section>
  );
}

function Benefits() {
  const items = [
    "3 unidades em Manaus",
    "Diversas modalidades",
    "Estrutura completa",
    "Treino para diferentes objetivos",
  ];
  return (
    <section className="bg-primary text-primary-foreground">
      <ul className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
        {items.map((t, i) => (
          <li
            key={t}
            className={`font-display px-4 py-6 text-sm font-black italic uppercase sm:px-6 sm:text-base ${i % 2 ? "border-l border-primary-foreground/20" : ""} ${i > 1 ? "border-t border-primary-foreground/20 lg:border-t-0" : ""} lg:border-l lg:first:border-l-0`}
          >
            {t}
          </li>
        ))}
      </ul>
    </section>
  );
}

function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function FindUnit() {
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setQuery(q.trim().replace(/\s+/g, " "));
  };
  // Busca simples por nome do bairro. INTEGRAÇÃO FUTURA: geolocalização / mapa.
  const filtered = query
    ? units.filter((u) =>
        normalize(u.neighborhood + " " + (u.address ?? "")).includes(normalize(query)),
      )
    : units;
  return (
    <section id="academias" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-end">
        <Reveal>
          <SectionTitle eyebrow="Nossas academias" lines={["Encontre sua", "Top Fit."]} />
        </Reveal>
        <Reveal delay={100}>
          <p className="mb-5 text-muted-foreground">Escolha a unidade ideal para o seu treino.</p>
          <form onSubmit={submit} className="flex gap-2">
            <label className="relative flex-1">
              <span className="sr-only">Digite seu bairro ou localização</span>
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Digite seu bairro ou localização"
                className="h-14 w-full rounded-sm border border-input bg-surface pl-12 pr-4 text-base outline-none focus:border-primary"
              />
            </label>
            <button className={cta({ size: "lg" })}>Buscar</button>
          </form>
        </Reveal>
      </div>
      {query && filtered.length === 0 && (
        <p className="mt-10 text-muted-foreground">
          Nenhuma unidade encontrada para “{query}”. Veja todas as unidades abaixo.
        </p>
      )}
      <div className="mt-14 grid gap-12 md:grid-cols-3">
        {(filtered.length ? filtered : units).map((u, i) => (
          <UnitCard key={u.slug} unit={u} index={i} />
        ))}
      </div>
    </section>
  );
}

function Plans() {
  return (
    <section
      id="planos"
      className="bg-paper py-24 text-paper-foreground lg:py-32 [&_.text-muted-foreground]:text-paper-foreground/60"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="mb-14 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <h2 className="font-display-x text-5xl sm:text-6xl lg:text-7xl">
            Um plano para
            <br />
            <span className="text-secondary">o seu ritmo.</span>
          </h2>
          <p className="max-w-sm text-paper-foreground/70">
            Escolha a melhor forma de começar a treinar.
          </p>
        </Reveal>
        <div className="[&_.bg-background]:bg-paper [&_.bg-border]:bg-paper-foreground/15 [&_.border]:border-paper-foreground/15">
          <PlansGrid />
        </div>
        <p className="mt-8 text-sm text-paper-foreground/70">
          Ofertas por unidade para alunos novos e inativos. Valores válidos para o primeiro mês;
          consulte as condições e a mensalidade posterior com a unidade. Atendimento pelo WhatsApp.
        </p>
      </div>
    </section>
  );
}

function Modalities() {
  return (
    <section id="modalidades" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
      <Reveal>
        <SectionTitle eyebrow="Modalidades" lines={["Treine do", "seu jeito."]} />
      </Reveal>
      <div className="-mx-4 mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-6 md:overflow-visible md:px-0">
        {modalities.map((m, i) => (
          <Reveal
            key={m.name}
            delay={i * 60}
            className={`w-[78vw] shrink-0 snap-start md:w-auto ${m.size === "lg" ? "md:col-span-4" : "md:col-span-2"} ${i === 2 ? "md:col-span-2" : ""} ${i === 3 ? "md:col-span-4" : ""}`}
          >
            <div className="group relative h-[420px] overflow-hidden rounded-sm">
              <img
                src={m.image}
                alt={m.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 overlay-bottom" />
              <h3 className="font-display-x absolute bottom-6 left-6 text-4xl transition-colors group-hover:text-primary">
                {m.name}
              </h3>
            </div>
          </Reveal>
        ))}
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        A grade de modalidades por unidade será confirmada em breve.
      </p>
    </section>
  );
}

function Structure() {
  return (
    <section id="estrutura" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionTitle eyebrow="Estrutura" lines={["Estrutura para", "você ir além."]} />
        </Reveal>
      </div>
      <Reveal className="mt-14">
        <img
          src={estrutura}
          alt="Área de musculação com halteres e bancos"
          loading="lazy"
          className="h-[60vh] min-h-[320px] w-full object-cover"
        />
      </Reveal>
      <div className="mx-auto mt-4 grid max-w-7xl grid-cols-2 gap-4 px-4 sm:px-6 md:grid-cols-3">
        {[
          { src: musculacao, alt: "Pesos livres" },
          { src: cardio, alt: "Área de cardio" },
          { src: funcional, alt: "Espaço de aulas" },
        ].map((img, i) => (
          <Reveal
            key={img.alt}
            delay={i * 80}
            className={i === 2 ? "col-span-2 md:col-span-1" : ""}
          >
            <figure>
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="aspect-[4/3] w-full rounded-sm object-cover"
              />
              <figcaption className="eyebrow mt-3 text-muted-foreground">{img.alt}</figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
      <p className="mx-auto mt-6 max-w-7xl px-4 text-xs text-muted-foreground sm:px-6">
        Imagens ilustrativas — fotos oficiais das unidades em breve.
      </p>
    </section>
  );
}

function Experience() {
  return (
    <section id="experiencia" className="bg-secondary text-secondary-foreground">
      <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
        <div className="px-4 py-24 sm:px-6 lg:py-32 lg:pr-16">
          <Reveal>
            <h2 className="font-display-x text-5xl sm:text-6xl lg:text-7xl">
              Mais que
              <br />
              <span className="text-primary">um treino.</span>
            </h2>
            <p className="mt-8 max-w-md text-lg text-secondary-foreground/85">
              A Top Fit reúne estrutura, variedade de modalidades e um ambiente para pessoas com
              diferentes objetivos — de quem está começando a quem já treina há anos.
            </p>
            <p className="mt-4 max-w-md text-secondary-foreground/70">
              Três unidades em Manaus, uma só rede. Seu treino, no seu ritmo.
            </p>
          </Reveal>
        </div>
        <img
          src={funcional}
          alt="Aula de treino funcional em grupo"
          loading="lazy"
          className="h-full min-h-[360px] w-full object-cover"
        />
      </div>
    </section>
  );
}

function Trial() {
  return (
    <section
      id="aula-experimental"
      className="mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:py-32"
    >
      <Reveal>
        <SectionTitle eyebrow="Aula experimental" lines={["Que tal conhecer", "a Top Fit?"]} />
        <p className="mt-6 max-w-sm text-muted-foreground">
          Escolha uma unidade e venha conhecer nossa estrutura.
        </p>
      </Reveal>
      <Reveal delay={100}>
        <TrialForm />
      </Reveal>
    </section>
  );
}

function MapSection() {
  return (
    <section className="border-y bg-surface">
      <div className="mx-auto grid max-w-7xl lg:grid-cols-[2fr_3fr]">
        <div className="px-4 py-20 sm:px-6">
          <SectionTitle lines={["Top Fit", "perto de você."]} />
          <ul className="mt-10 divide-y">
            {units.map((u) => (
              <li key={u.slug} className="py-5">
                <p className="font-display text-xl font-black italic uppercase">{u.name}</p>
                <p className="mt-1 text-sm">{u.address ?? <Pending>Endereço em breve</Pending>}</p>
                <p className="text-sm">{u.hours ?? <Pending>Horário em breve</Pending>}</p>
                <a
                  href={mapsLink(u)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
                >
                  Como chegar <ArrowRight className="h-4 w-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>
        {/* INTEGRAÇÃO FUTURA: mapa com marcadores das três unidades */}
        <MapEmbed
          query="Academia Top Fit Manaus AM"
          className="h-[420px] w-full grayscale lg:h-full"
        />
      </div>
    </section>
  );
}

function Social() {
  return (
    <section className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 py-20 sm:px-6 md:flex-row md:items-end">
      <SectionTitle lines={["Acompanhe", "a Top Fit."]} />
      {/* INTEGRAÇÃO FUTURA: feed do Instagram com publicações reais */}
      {INSTAGRAM_URL ? (
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noreferrer"
          className={cta({ variant: "outline", size: "lg" })}
        >
          Seguir no Instagram
        </a>
      ) : (
        <span
          className={cta({ variant: "outline", size: "lg" }) + " pointer-events-none opacity-60"}
        >
          Instagram em breve
        </span>
      )}
    </section>
  );
}

function Faq() {
  return (
    <section
      id="faq"
      className="mx-auto grid max-w-7xl gap-12 border-t px-4 py-24 sm:px-6 lg:grid-cols-[1fr_2fr]"
    >
      <h2 className="font-display-x text-[clamp(2rem,9vw,3rem)]">
        Perguntas
        <br />
        <span className="text-primary">frequentes.</span>
      </h2>
      <Accordion type="single" collapsible className="min-w-0">
        {faq.map((f) => (
          <AccordionItem key={f.q} value={f.q}>
            <AccordionTrigger className="text-left font-display text-lg font-bold">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {f.a ?? "Resposta em breve. Enquanto isso, fale com a gente pelo WhatsApp."}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="relative overflow-hidden">
      <img
        src={ctaImg}
        alt="Aluna fazendo levantamento terra"
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover object-[75%_center]"
      />
      <div className="absolute inset-0 overlay-hero" />
      <div className="relative mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:py-44">
        <h2 className="font-display-x max-w-3xl text-5xl sm:text-7xl lg:text-8xl">
          O melhor momento
          <br />
          para começar <span className="text-primary">é agora.</span>
        </h2>
        <div className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <Link to="/comece-agora" className={cta({ size: "lg" }) + " h-16 px-10 text-lg"}>
            Comece agora
          </Link>
          <Link to="/" hash="academias" className={cta({ variant: "ghost" })}>
            Encontrar uma unidade
          </Link>
        </div>
      </div>
    </section>
  );
}
