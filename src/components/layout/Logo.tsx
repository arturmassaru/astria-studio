import Image from "next/image";
import Link from "next/link";

/** Monograma oficial da Astria + nome na fonte do site. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 font-serif text-[1.35rem] font-light tracking-tight ${className ?? ""}`}
      aria-label="Astria Studio, página inicial"
    >
      <Image
        src="/brand/astria-monogram-plum.png"
        alt=""
        width={765}
        height={796}
        className="h-9 w-auto transition-transform duration-700 group-hover:rotate-6"
      />
      <span>
        Astria <span className="italic text-muted">Studio</span>
      </span>
    </Link>
  );
}
