import { Link, useRouterState } from "@tanstack/react-router";
import { MessageCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { units, whatsappLink, CROSSFIT_WHATSAPP } from "@/data/topfit";
import { cta } from "./primitives";

export function WhatsAppButton() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, []);
  return (
    <div className="fixed bottom-20 right-4 z-50 lg:bottom-6">
      {open && (
        <div className="mb-3 w-[min(18rem,calc(100vw-2rem))] rounded-sm border bg-surface p-5 shadow-2xl">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-display font-extrabold italic uppercase">Falar com a Top Fit</p>
            <button aria-label="Fechar" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mb-3 text-sm text-muted-foreground">Selecione a unidade:</p>
          <div className="space-y-2">
            {units.map((u) => {
              const href = whatsappLink(u);
              return href ? (
                <a
                  key={u.slug}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-sm border px-4 py-3 text-sm font-semibold hover:border-primary"
                >
                  {u.neighborhood}
                </a>
              ) : (
                <div
                  key={u.slug}
                  className="flex justify-between rounded-sm border px-4 py-3 text-sm text-muted-foreground"
                >
                  <span className="font-semibold text-foreground">{u.neighborhood}</span>
                  <span className="text-xs">número em breve</span>
                </div>
              );
            })}
            <a
              href={`https://wa.me/${CROSSFIT_WHATSAPP}?text=${encodeURIComponent("Olá! Quero consultar uma aula experimental de crossfit.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-sm border px-4 py-3 text-sm font-semibold hover:border-primary"
            >
              Experimental de crossfit
            </a>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Falar com a Top Fit no WhatsApp"
        aria-expanded={open}
        className="ml-auto grid h-14 w-14 place-items-center rounded-full bg-whatsapp text-background shadow-xl transition-transform hover:scale-105"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
}

export function MobileBar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path.startsWith("/comece-agora")) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t bg-background/95 p-2 backdrop-blur lg:hidden">
      <Link
        to="/"
        hash="academias"
        className={
          cta({ variant: "outline", size: "sm" }) + " h-auto min-h-11 min-w-0 px-2 py-2 text-center"
        }
      >
        Encontrar academia
      </Link>
      <Link to="/comece-agora" className={cta({ size: "sm" }) + " h-11"}>
        Começar
      </Link>
    </div>
  );
}
