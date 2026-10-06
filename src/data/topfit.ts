/**
 * Conteúdo central da Top Fit.
 * IMPORTANTE: tudo marcado com `null` ou PLACEHOLDER aguarda dados oficiais.
 * Não inventar endereços, horários, telefones, preços ou benefícios.
 * Para adicionar uma unidade nova, basta incluir um item em `units`.
 */
import musculacao from "@/assets/musculacao.jpg";
import funcional from "@/assets/funcional.jpg";
import danca from "@/assets/danca.jpg";
import cardio from "@/assets/cardio.jpg";
import estrutura from "@/assets/estrutura.jpg";
import hero from "@/assets/hero.jpg";

export type Unit = {
  slug: string;
  name: string;
  neighborhood: string;
  address: string | null; // PLACEHOLDER: endereço oficial
  hours: string | null; // PLACEHOLDER: horário oficial
  whatsapp: string | null; // PLACEHOLDER: número oficial, formato 5592XXXXXXXXX
  mapsQuery: string; // usado no "Como chegar" e no mapa
  modalities: string[] | null; // PLACEHOLDER: modalidades confirmadas
  image: string;
};

export const units: Unit[] = [
  {
    slug: "sao-jorge",
    name: "Top Fit São Jorge",
    neighborhood: "São Jorge",
    address: null,
    hours: null,
    whatsapp: null,
    mapsQuery: "Academia Top Fit São Jorge Manaus AM",
    modalities: null,
    image: hero,
  },
  {
    slug: "santo-antonio",
    name: "Top Fit Santo Antônio",
    neighborhood: "Santo Antônio",
    address: null,
    hours: null,
    whatsapp: null,
    mapsQuery: "Academia Top Fit Santo Antônio Manaus AM",
    modalities: null,
    image: estrutura,
  },
  {
    slug: "alvorada",
    name: "Top Fit Alvorada",
    neighborhood: "Alvorada",
    address: null,
    hours: null,
    whatsapp: null,
    mapsQuery: "Academia Top Fit Alvorada Manaus AM",
    modalities: null,
    image: cardio,
  },
];

export const getUnit = (slug: string) => units.find((u) => u.slug === slug);
export const mapsLink = (u: Unit) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(u.address ?? u.mapsQuery)}`;
export const whatsappLink = (u: Unit) =>
  u.whatsapp ? `https://wa.me/${u.whatsapp}?text=${encodeURIComponent("Olá! Quero saber mais sobre a Top Fit.")}` : null;

export type Plan = {
  id: string;
  name: string; // PLACEHOLDER: nome oficial
  price: string | null; // PLACEHOLDER: preço oficial
  benefits: string[] | null; // PLACEHOLDER: benefícios oficiais
  featured?: boolean; // marcar "MAIS ESCOLHIDO" quando confirmado
};

export const plans: Plan[] = [
  { id: "plano-1", name: "Plano 1", price: null, benefits: null },
  { id: "plano-2", name: "Plano 2", price: null, benefits: null },
  { id: "plano-3", name: "Plano 3", price: null, benefits: null },
];

/** Linhas da comparação. `included` por plano fica null até confirmação. */
export const comparisonRows: { label: string; included: Record<string, boolean | null> }[] = [
  "Musculação",
  "Aulas coletivas",
  "Acesso às unidades",
  "Benefícios adicionais",
].map((label) => ({ label, included: Object.fromEntries(plans.map((p) => [p.id, null])) }));

/** PLACEHOLDER: manter apenas modalidades realmente oferecidas. */
export const modalities = [
  { name: "Musculação", image: musculacao, size: "lg" },
  { name: "Funcional", image: funcional, size: "md" },
  { name: "Ritmos & Dança", image: danca, size: "md" },
  { name: "Cardio", image: cardio, size: "lg" },
] as const;

export const goals = ["Ganhar massa muscular", "Emagrecer", "Condicionamento", "Saúde e qualidade de vida", "Outro"];

export const faq = [
  "Como faço minha matrícula?",
  "Posso conhecer a academia antes?",
  "Quais formas de pagamento são aceitas?",
  "Posso treinar em outras unidades?",
  "Quais modalidades estão incluídas?",
].map((q) => ({ q, a: null as string | null })); // PLACEHOLDER: respostas oficiais

export const INSTAGRAM_URL: string | null = null; // PLACEHOLDER: perfil oficial

export const PENDING = "Informação em breve";
