import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import { Container, SectionHeading } from "@/components/ui/primitives";

const paths = [
  {
    n: "01",
    title: "Produtos",
    text: "Peças prontas para encontrar um lugar na sua rotina.",
    href: "/produtos",
  },
  {
    n: "02",
    title: "Personalizados",
    text: "Escolha detalhes e transforme uma peça em algo seu.",
    href: "/produtos?tag=personalizavel",
  },
  {
    n: "03",
    title: "Kits",
    text: "Combinações pensadas para presentear.",
    href: "/kits",
  },
  {
    n: "04",
    title: "Seu projeto",
    text: "Você imagina. A gente ajuda a dar forma.",
    href: "/personalizados#projeto",
  },
];

export function FormasDeExplorar() {
  return (
    <section aria-labelledby="explorar-titulo" className="py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading
            eyebrow="Formas de explorar"
            title="Cada caminho leva a um jeito de criar."
            lead="Comece por uma peça pronta, escolha seus detalhes ou conte uma ideia só sua."
          />
          <span id="explorar-titulo" className="sr-only">
            Formas de explorar
          </span>
        </div>

        <ul className="border-b border-stone">
          {paths.map((p) => (
            <li key={p.n} className="border-t border-stone">
              <Link
                href={p.href}
                className="group grid grid-cols-[3rem_1fr_auto] items-center gap-4 py-8 transition-colors hover:bg-sand/50 sm:grid-cols-[4.5rem_1fr_auto] sm:py-10"
              >
                <span className="font-serif text-sm italic text-taupe">{p.n}</span>
                <span>
                  <span className="block font-serif text-3xl font-light tracking-tight sm:text-4xl">
                    {p.title}
                  </span>
                  <span className="mt-2 block max-w-md text-[0.95rem] leading-relaxed text-muted">
                    {p.text}
                  </span>
                </span>
                <ArrowRightIcon
                  width={26}
                  height={26}
                  className="text-ink/50 transition-all duration-500 group-hover:translate-x-1.5 group-hover:text-ink"
                />
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
