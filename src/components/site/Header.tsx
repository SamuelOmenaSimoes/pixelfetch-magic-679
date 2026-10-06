import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { cta, Logo } from "./primitives";

const nav = [
  { label: "Academias", hash: "academias" },
  { label: "Planos", hash: "planos" },
  { label: "Modalidades", hash: "modalidades" },
  { label: "Estrutura", hash: "estrutura" },
  { label: "Aula experimental", hash: "aula-experimental" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled || open ? "border-b bg-background/95 backdrop-blur" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-20">
        <Link to="/" aria-label="Top Fit — início" className="shrink-0">
          <Logo className="h-9 lg:h-11" />
        </Link>
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Principal">
          {nav.map((n) => (
            <Link
              key={n.hash}
              to="/"
              hash={n.hash}
              className="font-display text-sm font-semibold uppercase tracking-wide text-foreground/80 transition-colors hover:text-primary"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/comece-agora" className={cta({ size: "sm" })}>
            Comece agora
          </Link>
          <button
            className="grid h-10 w-10 place-items-center lg:hidden"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t px-4 pb-6 lg:hidden" aria-label="Menu móvel">
          {[...nav, { label: "Contato", hash: "contato" }].map((n) => (
            <Link
              key={n.hash}
              to="/"
              hash={n.hash}
              onClick={() => setOpen(false)}
              className="block border-b py-4 font-display text-lg font-bold uppercase italic"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
