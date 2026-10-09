import { cn } from "@/lib/utils";

/**
 * Assinatura celestial da Astria: estrelas, luas, órbitas e pontos.
 * Sempre decorativa (aria-hidden) e usada com muita discrição.
 */
type Kind = "star" | "moon" | "orbit" | "dots";

export function Ornament({
  kind,
  className,
}: {
  kind: Kind;
  className?: string;
}) {
  const common = {
    "aria-hidden": true as const,
    focusable: false as const,
    className: cn("pointer-events-none select-none", className),
  };

  if (kind === "star") {
    return (
      <svg viewBox="0 0 40 40" fill="currentColor" {...common}>
        <path d="M20 2c.9 8.7 3.3 14.6 6.9 17.2C30.5 21.8 34.8 20.9 38 20c-3.2-.9-7.5-1.8-11.1.8C23.3 23.4 20.9 29.3 20 38c-.9-8.7-3.3-14.6-6.9-17.2C9.5 18.2 5.2 19.1 2 20c3.2.9 7.5 1.8 11.1-.8C16.7 16.6 19.1 10.7 20 2Z" />
      </svg>
    );
  }
  if (kind === "moon") {
    return (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.2" {...common}>
        <path d="M27 6.5A14 14 0 1 0 33.5 27 11.5 11.5 0 0 1 27 6.5Z" />
      </svg>
    );
  }
  if (kind === "orbit") {
    return (
      <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="0.8" {...common}>
        <ellipse cx="60" cy="60" rx="54" ry="22" transform="rotate(-24 60 60)" />
        <ellipse cx="60" cy="60" rx="38" ry="14" transform="rotate(-24 60 60)" opacity="0.6" />
        <circle cx="104" cy="44" r="2.4" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 60 20" fill="currentColor" {...common}>
      <circle cx="4" cy="10" r="1.6" />
      <circle cx="22" cy="5" r="1" />
      <circle cx="36" cy="14" r="1.3" />
      <circle cx="54" cy="8" r="0.9" />
    </svg>
  );
}
