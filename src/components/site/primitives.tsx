import { cva, type VariantProps } from "class-variance-authority";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import logoAsset from "@/assets/topfit-logo.jpg.asset.json";

export const cta = cva(
  "inline-flex items-center justify-center gap-2 font-display font-extrabold italic uppercase tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] rounded-sm",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:brightness-110 hover:-translate-y-0.5",
        blue: "bg-secondary text-secondary-foreground hover:brightness-110 hover:-translate-y-0.5",
        outline: "border-2 border-foreground/80 text-foreground hover:bg-foreground hover:text-background",
        ghost: "text-foreground underline-offset-4 hover:text-primary hover:underline",
        dark: "bg-paper-foreground text-paper hover:bg-secondary",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "h-12 px-6 text-sm",
        lg: "h-14 px-8 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);
export type CtaProps = VariantProps<typeof cta>;

export function Logo({ className }: { className?: string }) {
  return <img src={logoAsset.url} alt="Top Fit Academia" className={cn("h-10 w-auto rounded-sm", className)} />;
}

export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          el.dataset["shown"] = "true";
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={cn("reveal", className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function SectionTitle({ eyebrow, lines, className }: { eyebrow?: string; lines: [string, string]; className?: string }) {
  return (
    <div className={className}>
      {eyebrow && <p className="eyebrow mb-4 text-primary">{eyebrow}</p>}
      <h2 className="font-display-x text-5xl sm:text-6xl lg:text-7xl">
        {lines[0]}
        <br />
        <span className="text-primary">{lines[1]}</span>
      </h2>
    </div>
  );
}

export function Pending({ children = "Informação em breve" }: { children?: ReactNode }) {
  return <span className="italic text-muted-foreground">{children}</span>;
}
