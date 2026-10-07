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
  email: string | null;
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
    hours: "Segunda a sexta: 05h às 23h · Sábados e feriados: 08h às 16h · Domingos: 08h às 12h",
    whatsapp: "5592981643664",
    email: "topfitsj@gmail.com",
    mapsQuery: "Academia Top Fit São Jorge Manaus AM",
    modalities: null,
    image: hero,
  },
  {
    slug: "santo-antonio",
    name: "Top Fit Santo Antônio",
    neighborhood: "Santo Antônio",
    address: null,
    hours:
      "Segunda a sexta: 06h às 22h · Sábados e feriados: 08h às 13h · Domingos: horário não informado",
    whatsapp: "5592981524570",
    email: null,
    mapsQuery: "Academia Top Fit Santo Antônio Manaus AM",
    modalities: null,
    image: estrutura,
  },
  {
    slug: "alvorada",
    name: "Top Fit Alvorada",
    neighborhood: "Alvorada",
    address: null,
    hours:
      "Segunda a sexta: 06h às 22h · Sábados e feriados: 08h às 13h · Domingos: horário não informado",
    whatsapp: "5592981691185",
    email: null,
    mapsQuery: "Academia Top Fit Alvorada Manaus AM",
    modalities: null,
    image: cardio,
  },
];

export const getUnit = (slug: string) => units.find((u) => u.slug === slug);
export const mapsLink = (u: Unit) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(u.address ?? u.mapsQuery)}`;
export const whatsappLink = (u: Unit, message = "Olá! Quero saber mais sobre a Top Fit.") =>
  u.whatsapp ? `https://wa.me/${u.whatsapp}?text=${encodeURIComponent(message)}` : null;

export type Plan = {
  id: string;
  unitSlug: string;
  name: string;
  price: string;
  benefits: string[];
};

// Ofertas confirmadas nas artes fornecidas. Valores somente para o primeiro mês.
// Mensalidade posterior, prazo da promoção e outras condições aguardam confirmação.
export const plans: Plan[] = [
  {
    id: "promo-sao-jorge",
    unitSlug: "sao-jorge",
    name: "São Jorge",
    price: "R$ 99,90",
    benefits: ["Para alunos novos e inativos", "Acesso em horário livre"],
  },
  {
    id: "promo-santo-antonio",
    unitSlug: "santo-antonio",
    name: "Santo Antônio",
    price: "R$ 99,90",
    benefits: ["Para alunos novos e inativos", "Acesso em horário livre"],
  },
  {
    id: "promo-alvorada",
    unitSlug: "alvorada",
    name: "Alvorada",
    price: "R$ 89,90",
    benefits: ["Para alunos novos e inativos", "Acesso em horário livre"],
  },
];

export const planWhatsAppLink = (plan: Plan) => {
  const unit = getUnit(plan.unitSlug);
  return unit
    ? whatsappLink(
        unit,
        `Olá! Tenho interesse na promoção da Top Fit ${plan.name}: ${plan.price} no primeiro mês, para alunos novos e inativos, com acesso em horário livre. Pode confirmar a disponibilidade, o valor dos próximos meses e as condições?`,
      )
    : null;
};

/** PLACEHOLDER: manter apenas modalidades realmente oferecidas. */
export const modalities = [
  { name: "Musculação", image: musculacao, size: "lg" },
  { name: "Funcional", image: funcional, size: "md" },
  { name: "Ritmos & Dança", image: danca, size: "md" },
  { name: "Cardio", image: cardio, size: "lg" },
] as const;

export const goals = [
  "Ganhar massa muscular",
  "Emagrecer",
  "Condicionamento",
  "Saúde e qualidade de vida",
  "Outro",
];

export const faq = [
  "Como faço minha matrícula?",
  "Posso conhecer a academia antes?",
  "Quais formas de pagamento são aceitas?",
  "Posso treinar em outras unidades?",
  "Quais modalidades estão incluídas?",
].map((q) => ({ q, a: null as string | null })); // PLACEHOLDER: respostas oficiais

export const INSTAGRAM_URL = "https://www.instagram.com/academiatopfitoficial/";
export const CROSSFIT_WHATSAPP = "5592981643664";

export const CROSSFIT_SCHEDULE = [
  { day: "Segunda a sexta — manhã", time: "06h, 07h e 08h" },
  { day: "Segunda a sexta — tarde", time: "16h e 17h30" },
  { day: "Segunda a sexta — noite", time: "18h30 e 19h30" },
  { day: "Sábado — clínica", time: "08h às 10h" },
  { day: "Domingo — manhã", time: "08h30" },
] as const;

export const PENDING = "Informação em breve";
