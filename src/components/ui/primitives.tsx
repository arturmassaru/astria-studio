import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { money } from "@/lib/format";

export function Container({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "header" | "footer" | "nav";
}) {
  return <Tag className={cn("mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12", className)}>{children}</Tag>;
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-[0.72rem] font-medium uppercase tracking-[0.22em] text-muted", className)}>
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  className,
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow ? <Eyebrow className="mb-4">{eyebrow}</Eyebrow> : null}
      <Tag className="font-serif text-[clamp(2rem,4.2vw,3.25rem)] font-light leading-[1.08] tracking-tight">
        {title}
      </Tag>
      {lead ? <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">{lead}</p> : null}
    </div>
  );
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-cream/90 px-2.5 py-1 text-[0.68rem] font-medium uppercase tracking-wider text-ink",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Price({
  price,
  list,
  className,
}: {
  price: number;
  list?: number;
  className?: string;
}) {
  const hasPromo = typeof list === "number" && list > price;
  return (
    <p className={cn("flex items-baseline gap-2", className)}>
      <span className="font-medium">{money(price)}</span>
      {hasPromo ? (
        <>
          <s className="text-sm text-muted">
            <span className="sr-only">De </span>
            {money(list)}
          </s>
        </>
      ) : null}
    </p>
  );
}

export function Notice({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "warn" | "error" | "ok";
  className?: string;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-lg border px-4 py-3 text-sm leading-relaxed",
        tone === "neutral" && "border-stone bg-sand text-ink",
        tone === "warn" && "border-gold/50 bg-gold-soft/60 text-ink",
        tone === "error" && "border-red-300 bg-red-50 text-red-900",
        tone === "ok" && "border-mint bg-mint/60 text-ink",
        className,
      )}
    >
      {children}
    </div>
  );
}
