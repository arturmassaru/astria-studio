import type { Metadata } from "next";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { Ornament } from "@/components/ui/Ornament";
import { Container, Eyebrow, SectionHeading } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "A Astria Studio transforma ideias em objetos: criatividade, design, personalização e possibilidade.",
  alternates: { canonical: "/sobre" },
};

const pillars = [
  { t: "Criatividade", d: "Tudo começa em uma ideia, e toda ideia merece espaço para ganhar forma." },
  { t: "Design", d: "Linhas limpas, proporção e cuidado com o detalhe em cada peça." },
  { t: "Personalização", d: "Um nome, uma cor, um modelo: pequenas escolhas que tornam a peça sua." },
  { t: "Possibilidade", d: "Um universo aberto: o que você imaginar pode ser o próximo objeto." },
];

export default function SobrePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <Ornament kind="moon" className="absolute right-[10%] top-14 h-12 w-12 text-ink/30" />
        <Container className="grid items-center gap-14 py-14 sm:py-24 lg:grid-cols-[1.1fr_0.9fr]">
          <SectionHeading
            as="h1"
            eyebrow="Sobre a Astria"
            title="A Astria transforma ideias em objetos."
            lead="Somos um estúdio criativo de objetos decorativos, úteis e personalizados. A impressão 3D é uma das ferramentas que usamos, mas o centro de tudo é o design, a criatividade e a vontade de criar algo com significado."
          />
          <div className="relative mx-auto w-full max-w-sm">
            <div className="relative aspect-[3/4] overflow-hidden rounded-t-[999px] rounded-b-[1.75rem] bg-sand">
              <Image
                src="/products/kit-natal-aconchego.jpg"
                alt="Cantinho de Natal com Sagrada Família, mini árvore e pinhas sobre uma bandeja branca em forma de nuvem"
                fill
                sizes="(min-width: 1024px) 30vw, 80vw"
                className="object-cover"
              />
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="pilares" className="border-t border-stone py-16 sm:py-24">
        <Container>
          <h2 id="pilares" className="sr-only">
            Nossos pilares
          </h2>
          <dl className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((p) => (
              <div key={p.t}>
                <Ornament kind="star" className="mb-4 h-4 w-4 text-gold" />
                <dt className="font-serif text-2xl font-light">{p.t}</dt>
                <dd className="mt-3 text-sm leading-relaxed text-muted">{p.d}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <section className="pb-20">
        <Container className="text-center">
          <Eyebrow>Um universo de possibilidades</Eyebrow>
          <p className="mx-auto mt-5 max-w-xl font-serif text-3xl font-light italic leading-snug">
            Ideias que ganham forma.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/produtos" size="lg">
              Explorar produtos
            </ButtonLink>
            <ButtonLink href="/personalizados" variant="outline" size="lg">
              Quero criar algo
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
