import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/termos")({
  head: () => ({ meta: [{ title: "Condições de atendimento — Top Fit" }] }),
  component: Terms,
});
function Terms() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-32 pt-28 sm:px-6">
      <p className="eyebrow text-primary">Condições de atendimento</p>
      <h1 className="font-display-x mt-3 text-5xl">Antes de começar.</h1>
      <div className="mt-8 space-y-6 leading-relaxed text-muted-foreground">
        <p>
          Este site apresenta informações das unidades e permite registrar pedidos de atendimento.
          Não há compra, cobrança ou contratação online. A matrícula e suas condições serão
          combinadas diretamente com a equipe.
        </p>
        <p>
          As ofertas apresentadas são para alunos novos e inativos, com acesso em horário livre, e
          referem-se ao primeiro mês: São Jorge e Santo Antônio por R$ 99,90; Alvorada por R$ 89,90.
          Consulte a disponibilidade da promoção, a mensalidade posterior e todas as condições com a
          unidade antes de contratar.
        </p>
        <p>
          A solicitação de aula experimental não é reserva automática. Confirme local, atividade,
          horário, disponibilidade e demais condições com a equipe. O atendimento de experimental de
          crossfit usa o contato específico indicado no site.
        </p>
        <p>
          Imagens ilustrativas não comprovam a estrutura ou as modalidades disponíveis em cada
          unidade. Endereços, horários e modalidades ainda não confirmados permanecem indicados como
          pendentes. Consulte a equipe para obter as informações oficiais.
        </p>
      </div>
    </main>
  );
}
