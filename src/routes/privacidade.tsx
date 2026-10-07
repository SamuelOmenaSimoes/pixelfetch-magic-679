import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/privacidade")({
  head: () => ({ meta: [{ title: "Aviso de privacidade — Top Fit" }] }),
  component: Privacy,
});
function Privacy() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-32 pt-28 sm:px-6">
      <p className="eyebrow text-primary">Atualizado em 7 de outubro de 2026</p>
      <h1 className="font-display-x mt-3 text-5xl">Seus dados.</h1>
      <div className="mt-8 space-y-6 leading-relaxed text-muted-foreground">
        <p>
          Ao solicitar uma aula experimental ou informações de matrícula, você informa nome,
          celular, unidade, atividade, objetivo e, opcionalmente, e-mail e observações. Esses dados
          são registrados para organizar e atender o seu pedido. Não informe dados de saúde ou
          informações sensíveis nas observações.
        </p>
        <p>
          O pedido fica armazenado na base do site e pode ser consultado pela equipe com acesso
          administrativo. O formulário não realiza cobrança, não ativa matrícula e não garante
          disponibilidade de aula. A promoção divulgada se refere ao primeiro mês; as condições
          posteriores devem ser confirmadas com a unidade.
        </p>
        <p>
          Após registrar o pedido, você pode continuar o atendimento pelo WhatsApp. A mensagem
          somente é enviada quando você a confirma nesse serviço. O WhatsApp e o Instagram possuem
          suas próprias práticas de privacidade. O site também usa Google Maps e fontes do Google,
          que podem receber informações técnicas da conexão ao carregar.
        </p>
        <p>
          A área administrativa utiliza um cookie de sessão restrito para autenticação. Os
          formulários não salvam seus dados em localStorage. O backend mantém contadores temporários
          para limitar tentativas de acesso e abuso.
        </p>
        <p>
          Para solicitar correção, exclusão ou esclarecimentos sobre seus dados, entre em contato
          pelo e-mail{" "}
          <a className="text-primary underline" href="mailto:topfitsj@gmail.com">
            topfitsj@gmail.com
          </a>{" "}
          ou WhatsApp{" "}
          <a
            className="text-primary underline"
            href="https://wa.me/5592981643664"
            target="_blank"
            rel="noopener noreferrer"
          >
            (92) 98164-3664
          </a>
          . Informe o protocolo do pedido, se disponível.
        </p>
        <p>
          A equipe deve conservar os pedidos apenas pelo período necessário ao atendimento e às
          obrigações aplicáveis, revisando e excluindo registros sem necessidade. Este aviso deverá
          ser revisado pelo responsável pela operação antes da publicação, incluindo identificação
          completa da organização e prazo de retenção definido.
        </p>
      </div>
    </main>
  );
}
