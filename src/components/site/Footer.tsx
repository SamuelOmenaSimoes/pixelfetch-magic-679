import { Link } from "@tanstack/react-router";
import { units, INSTAGRAM_URL } from "@/data/topfit";
import { Logo } from "./primitives";

export function Footer() {
  const col = "font-display text-xs font-bold uppercase tracking-[0.18em] text-primary mb-4";
  const link = "block py-1 text-sm text-muted-foreground hover:text-foreground";
  return (
    <footer id="contato" className="border-t bg-background pb-24 lg:pb-0">
      <div className="h-2 stripe-brand" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-5">
        <div className="md:col-span-1">
          <Logo className="h-14" />
          <p className="mt-4 text-sm text-muted-foreground">
            Rede de academias em Manaus — Amazonas.
          </p>
        </div>
        <div>
          <p className={col}>Top Fit</p>
          <Link to="/" hash="experiencia" className={link}>
            Sobre
          </Link>
          <Link to="/" hash="estrutura" className={link}>
            Estrutura
          </Link>
          <Link to="/" hash="modalidades" className={link}>
            Modalidades
          </Link>
        </div>
        <div>
          <p className={col}>Academias</p>
          {units.map((u) => (
            <Link key={u.slug} to="/unidades/$slug" params={{ slug: u.slug }} className={link}>
              {u.neighborhood}
            </Link>
          ))}
        </div>
        <div>
          <p className={col}>Ajuda</p>
          <Link to="/" hash="aula-experimental" className={link}>
            Fale conosco
          </Link>
          <Link to="/" hash="faq" className={link}>
            Perguntas frequentes
          </Link>
          {/* PLACEHOLDER: páginas de Política de privacidade e Termos de uso */}
          <Link to="/privacidade" className={link}>
            Privacidade
          </Link>
          <Link to="/termos" className={link}>
            Condições de atendimento
          </Link>
        </div>
        <div>
          <p className={col}>Redes sociais</p>
          {INSTAGRAM_URL ? (
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className={link}>
              Instagram
            </a>
          ) : (
            <span className={link}>Instagram (em breve)</span>
          )}
        </div>
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-7xl px-4 py-6 text-xs text-muted-foreground sm:px-6">
          © TOP FIT — Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
