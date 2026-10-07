import { z } from "zod";
import { goals, plans, units } from "@/data/topfit";

export const statuses = ["novo", "em-atendimento", "concluido", "cancelado"] as const;
export const statusLabels: Record<(typeof statuses)[number], string> = {
  novo: "Novo",
  "em-atendimento": "Em atendimento",
  concluido: "Concluído",
  cancelado: "Cancelado",
};
export const requestSchema = z
  .object({
    requestId: z.string().uuid("Identificador inválido. Atualize a página."),
    kind: z.enum(["experimental", "matricula"]),
    name: z
      .string()
      .trim()
      .min(3, "Informe seu nome (mínimo de 3 caracteres).")
      .max(100, "Nome muito longo.")
      .refine((v) => /\p{L}/u.test(v), "Informe um nome válido."),
    phone: z
      .string()
      .transform((v) => v.replace(/\D/g, ""))
      .transform((v) => (v.startsWith("55") && v.length > 11 ? v.slice(2) : v))
      .refine((v) => /^[1-9]\d9\d{8}$/.test(v), "Informe um celular com DDD e 9 dígitos."),
    email: z
      .string()
      .trim()
      .max(254)
      .refine((v) => !v || z.string().email().safeParse(v).success, "Informe um e-mail válido."),
    unitSlug: z
      .string()
      .refine((v) => units.some((u) => u.slug === v), "Escolha uma unidade válida."),
    planId: z.string().max(80),
    discipline: z.enum(["academia", "crossfit"]),
    goal: z.string().refine((v) => goals.includes(v), "Escolha seu objetivo."),
    notes: z.string().trim().max(500, "Use até 500 caracteres."),
    acknowledged: z.literal(true, {
      errorMap: () => ({ message: "Confirme a leitura do aviso de privacidade." }),
    }),
    website: z.string().max(0, "Solicitação inválida."),
  })
  .strict()
  .superRefine((v, ctx) => {
    if (
      v.kind === "matricula" &&
      !plans.some((p) => p.id === v.planId && p.unitSlug === v.unitSlug)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["planId"],
        message: "Selecione o plano da unidade escolhida.",
      });
    }
    if (v.kind === "matricula" && v.discipline !== "academia")
      ctx.addIssue({
        code: "custom",
        path: ["discipline"],
        message: "Consulte planos de crossfit diretamente com a equipe.",
      });
    if (v.kind === "experimental" && v.planId)
      ctx.addIssue({
        code: "custom",
        path: ["planId"],
        message: "Plano inválido para aula experimental.",
      });
  });
export type ContactRequest = z.infer<typeof requestSchema>;
export type ContactRecord = Omit<ContactRequest, "website" | "acknowledged"> & {
  id: string;
  createdAt: string;
  status: (typeof statuses)[number];
  unitName: string;
  planName: string | null;
  offerPrice: string | null;
};
export const statusSchema = z.object({ status: z.enum(statuses) }).strict();
