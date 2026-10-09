import Link from "next/link";
import { Ornament } from "@/components/ui/Ornament";
import { Container, Eyebrow } from "@/components/ui/primitives";

const values = ["Criatividade", "Design", "Personalização", "Possibilidade"];

export function SobreSection() {
  return (
    <section aria-labelledby="sobre-titulo" className="relative py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-2 lg:gap-24">
        <div>
          <Eyebrow>Sobre</Eyebrow>
          <h2
            id="sobre-titulo"
            className="mt-5 font-serif text-[clamp(2.1rem,4.6vw,3.6rem)] font-light leading-[1.06] tracking-tight"
          >
            A Astria transforma ideias em objetos.
          </h2>
        </div>
        <div className="relative">
          <Ornament kind="star" className="absolute -left-8 top-1 hidden h-4 w-4 text-gold lg:block" />
          <p className="text-base leading-relaxed text-muted sm:text-lg">
            Somos um estúdio criativo. Desenhamos e produzimos objetos decorativos, peças úteis,
            presentes e projetos sob medida. A impressão 3D é uma das nossas ferramentas, mas o que
            nos move é o design e a vontade de criar coisas com significado.
          </p>
          <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3 font-serif text-xl font-light italic text-ink/80">
            {values.map((v) => (
              <li key={v} className="flex items-center gap-2">
                <Ornament kind="star" className="h-2.5 w-2.5 text-gold" />
                {v}
              </li>
            ))}
          </ul>
          <Link
            href="/sobre"
            className="mt-8 inline-block text-sm font-medium underline decoration-stone underline-offset-[6px] hover:decoration-ink"
          >
            Conheça a Astria
          </Link>
        </div>
      </Container>
    </section>
  );
}
