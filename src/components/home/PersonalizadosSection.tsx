import { ButtonLink } from "@/components/ui/Button";
import { Ornament } from "@/components/ui/Ornament";
import { Container, Eyebrow } from "@/components/ui/primitives";

const steps = [
  { t: "Você conta a ideia", d: "Com palavras, referências ou uma foto." },
  { t: "A gente conversa", d: "Ajustamos detalhes, medidas e possibilidades." },
  { t: "A peça ganha forma", d: "Depois da confirmação, entra em produção." },
];

export function PersonalizadosSection() {
  return (
    <section aria-labelledby="personalizados-titulo" className="py-12 sm:py-20">
      <Container>
        <div className="relative overflow-hidden rounded-[2rem] bg-lilac/45 px-6 py-14 sm:px-12 sm:py-20 lg:px-20">
          <Ornament kind="orbit" className="absolute -right-10 -top-10 h-64 w-64 text-ink/15" />
          <Ornament kind="moon" className="absolute bottom-10 right-12 hidden h-10 w-10 text-ink/40 sm:block" />
          <div className="relative grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <Eyebrow>Personalizados</Eyebrow>
              <h2
                id="personalizados-titulo"
                className="mt-5 font-serif text-[clamp(2.1rem,4.6vw,3.6rem)] font-light leading-[1.06] tracking-tight"
              >
                Você imagina. A Astria dá forma.
              </h2>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-ink/75 sm:text-lg">
                Tem uma ideia própria, um presente em mente ou uma peça que ainda não existe? Traga
                para a gente. Cada projeto é conversado com cuidado, sem preço automático: o valor é
                combinado depois de entender o que você imaginou.
              </p>
              <ButtonLink href="/personalizados" size="lg" className="mt-9">
                Quero criar algo
              </ButtonLink>
            </div>
            <ol className="space-y-6">
              {steps.map((s, i) => (
                <li key={s.t} className="flex gap-5 border-t border-ink/15 pt-5">
                  <span className="font-serif text-lg italic text-ink/50">0{i + 1}</span>
                  <div>
                    <p className="font-serif text-xl font-light">{s.t}</p>
                    <p className="mt-1 text-sm text-ink/70">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Container>
    </section>
  );
}
