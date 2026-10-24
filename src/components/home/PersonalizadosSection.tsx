import { ButtonLink } from "@/components/ui/Button";
import { Ornament } from "@/components/ui/Ornament";
import { CosmosBackground } from "@/components/ui/CosmosBackground";
import { OrbitRing } from "@/components/ui/OrbitRing";
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
        <div className="relative overflow-hidden rounded-[2rem] bg-lilac/40 px-6 py-14 sm:px-12 sm:py-20 lg:px-20">
          <CosmosBackground className="absolute inset-0 opacity-80" />
          <OrbitRing
            className="-right-24 -top-24 h-[22rem] w-[22rem] border-cream/80"
            planetClassName="bg-berry"
            duration="26s"
          />
          <OrbitRing
            className="-right-12 -top-12 h-[16rem] w-[16rem] border-ink/20"
            planetClassName="bg-cream h-3! w-3!"
            duration="18s"
            reverse
          />
          <Ornament kind="planet" className="animate-float absolute bottom-10 right-16 hidden h-14 w-14 text-rose sm:block" />
          <Ornament kind="star" className="animate-twinkle absolute bottom-24 left-[46%] hidden h-5 w-5 text-cream lg:block" />
          <Ornament kind="star" className="animate-twinkle absolute left-8 top-8 h-4 w-4 text-berry" style={{ animationDelay: "-1.8s" }} />
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
