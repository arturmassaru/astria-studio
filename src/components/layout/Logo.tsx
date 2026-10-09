import Link from "next/link";
import { Ornament } from "@/components/ui/Ornament";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2 font-serif text-[1.35rem] font-light tracking-tight ${className ?? ""}`}
      aria-label="Astria Studio, página inicial"
    >
      <Ornament
        kind="star"
        className="h-3.5 w-3.5 text-gold transition-transform duration-700 group-hover:rotate-90"
      />
      <span>
        Astria <span className="italic text-muted">Studio</span>
      </span>
    </Link>
  );
}
