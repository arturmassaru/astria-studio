import Link from "next/link";
import { InstagramIcon, WhatsAppIcon } from "@/components/ui/icons";
import { Ornament } from "@/components/ui/Ornament";
import { Container } from "@/components/ui/primitives";
import { footerExplore, footerPolicies } from "@/data/navigation";
import { siteConfig, whatsappLink } from "@/lib/site";
import { Logo } from "./Logo";

export function Footer() {
  const linkCls = "text-sm text-muted transition-colors hover:text-ink";
  return (
    <footer className="relative mt-28 border-t border-stone/70 bg-sand/60">
      <Ornament kind="orbit" className="absolute -top-12 right-[8%] hidden h-24 w-24 text-gold/60 sm:block" />
      <Container className="grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-5 font-serif text-lg italic text-muted">{siteConfig.tagline}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Objetos, presentes e peças personalizadas.
          </p>
        </div>

        <nav aria-label="Explorar">
          <h2 className="mb-4 text-[0.72rem] font-medium uppercase tracking-[0.22em]">Explorar</h2>
          <ul className="space-y-2.5">
            {footerExplore.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={linkCls}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Políticas">
          <h2 className="mb-4 text-[0.72rem] font-medium uppercase tracking-[0.22em]">Informações</h2>
          <ul className="space-y-2.5">
            {footerPolicies.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={linkCls}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="mb-4 text-[0.72rem] font-medium uppercase tracking-[0.22em]">Fale com a gente</h2>
          <ul className="space-y-2.5">
            <li>
              <a
                href={siteConfig.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${linkCls} inline-flex items-center gap-2`}
              >
                <InstagramIcon width={18} height={18} /> Instagram
              </a>
            </li>
            <li>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className={`${linkCls} inline-flex items-center gap-2`}
              >
                <WhatsAppIcon width={18} height={18} /> WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </Container>
      <div className="border-t border-stone/70">
        <Container className="flex flex-col gap-2 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Astria Studio. Todos os direitos reservados.</p>
          <p>Um universo de possibilidades.</p>
        </Container>
      </div>
    </footer>
  );
}
