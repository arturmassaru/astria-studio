import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { Ornament } from "@/components/ui/Ornament";
import { Container, Eyebrow, SectionHeading } from "@/components/ui/primitives";
import { CustomProjectForm } from "@/components/shop/CustomProjectForm";

export const metadata: Metadata = {
  title: "Personalizados",
  description:
    "Escolha detalhes de uma peça pronta ou traga uma ideia própria: a Astria ajuda a dar forma.",
  alternates: { canonical: "/personalizados" },
};

const levels = [
  {
    kicker: "Produto pronto",
    title: "Prontas para sua rotina",
    text: "Peças que já existem no catálogo, do jeito que foram pensadas.",
    cta: { label: "Ver produtos", href: "/produtos" },
  },
  {
    kicker: "Produto personalizável",
    title: "Escolha os detalhes",
    text: "Algumas peças aceitam nome, frase curta, cor ou modelo. Os campos aparecem na página de cada produto.",
    cta: { label: "Ver personalizáveis", href: "/produtos?tag=personalizavel" },
  },
  {
    kicker: "Projeto sob medida",
    title: "Você imagina. A gente dá forma.",
    text: "Uma ideia só sua, do zero. Analisamos juntos e combinamos valor e prazo, sem preço automático.",
    cta: { label: "Contar minha ideia", href: "#projeto" },
  },
];

export default function PersonalizadosPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <Ornament kind="orbit" className="absolute -right-20 top-6 h-72 w-72 text-gold/40" />
        <Container className="relative py-14 sm:py-24">
          <SectionHeading
            as="h1"
            eyebrow="Personalizados"
            title="Você imagina. A Astria dá forma."
            lead="Do detalhe em uma peça pronta a um projeto inteiramente seu: existe mais de um caminho para ter algo com a sua cara."
          />
        </Container>
      </section>

      <section aria-label="Três formas de personalizar" className="pb-8">
        <Container>
          <ol className="grid border-t border-stone md:grid-cols-3 md:divide-x md:divide-stone">
            {levels.map((l, i) => (
              <li key={l.kicker} className="border-b border-stone py-10 md:border-b-0 md:px-8 md:first:pl-0 md:last:pr-0">
                <span className="font-serif text-lg italic text-muted">0{i + 1}</span>
                <Eyebrow className="mt-3">{l.kicker}</Eyebrow>
                <h2 className="mt-3 font-serif text-2xl font-light leading-snug">{l.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">{l.text}</p>
                <ButtonLink href={l.cta.href} variant="outline" className="mt-6">
                  {l.cta.label}
                </ButtonLink>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section id="projeto" aria-labelledby="projeto-titulo" className="scroll-mt-24 py-16 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <Eyebrow>Projeto sob medida</Eyebrow>
              <h2
                id="projeto-titulo"
                className="mt-4 font-serif text-[clamp(1.9rem,3.6vw,2.8rem)] font-light leading-[1.1] tracking-tight"
              >
                Conte sua ideia
              </h2>
              <p className="mt-5 leading-relaxed text-muted">
                Quanto mais detalhes, melhor. Mas não precisa estar tudo definido: a conversa serve
                justamente para isso.
              </p>
            </div>
            <CustomProjectForm />
          </div>
        </Container>
      </section>
    </>
  );
}
