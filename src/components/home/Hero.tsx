import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { Ornament } from "@/components/ui/Ornament";
import { Container, Eyebrow } from "@/components/ui/primitives";

export function Hero() {
  return (
    <section aria-labelledby="hero-titulo" className="relative overflow-hidden">
      <Ornament kind="orbit" className="absolute -left-24 top-10 h-72 w-72 text-gold/40" />
      <Container className="relative grid items-center gap-14 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:py-28">
        <div className="relative z-10">
          <Eyebrow>Astria Studio</Eyebrow>
          <h1
            id="hero-titulo"
            className="mt-6 font-serif text-[clamp(2.9rem,7.2vw,5.75rem)] font-light leading-[1.02] tracking-tight"
          >
            Um universo de <em className="font-light italic text-muted">possibilidades.</em>
          </h1>
          <p className="mt-7 font-serif text-2xl font-light italic text-ink/80 sm:text-3xl">
            Ideias que ganham forma.
          </p>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted sm:text-lg">
            A Astria cria objetos, presentes e peças personalizadas, pensados com cuidado para
            encontrar um lugar na sua rotina.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/produtos" size="lg">
              Explorar produtos
            </ButtonLink>
            <ButtonLink href="/personalizados" variant="outline" size="lg">
              Quero criar algo
            </ButtonLink>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <Ornament kind="star" className="absolute -right-2 top-6 z-10 h-7 w-7 text-gold" />
          <Ornament kind="star" className="absolute left-[12%] top-0 z-10 h-3.5 w-3.5 text-gold/70" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[1.75rem] bg-sand">
            <Image
              src="/products/bandeja-nuvem.jpg"
              alt="Bandeja Nuvem branca, de contorno ondulado, sobre uma mesa de madeira clara com folhas de eucalipto ao fundo"
              fill
              priority
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -left-3 w-32 overflow-hidden rounded-2xl border-[5px] border-cream bg-sand shadow-sm sm:-left-8 sm:w-40">
            <div className="relative aspect-[3/4]">
              <Image
                src="/products/mini-jesus.jpg"
                alt="Mini Jesus sentado na borda de um monitor"
                fill
                sizes="160px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
