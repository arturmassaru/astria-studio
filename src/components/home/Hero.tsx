import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { Ornament } from "@/components/ui/Ornament";
import { CosmosBackground, CosmosBackgroundMobile } from "@/components/ui/CosmosBackground";
import { OrbitRing } from "@/components/ui/OrbitRing";
import { Container, Eyebrow } from "@/components/ui/primitives";

export function Hero() {
  return (
    <section aria-labelledby="hero-titulo" className="relative overflow-hidden">
      {/* Fundo cósmico da marca, com esmaecimento para o creme embaixo */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* celular: versão vertical, mais colorida, com manchas de cor suaves */}
        <div className="absolute inset-0 md:hidden bg-[radial-gradient(60%_35%_at_15%_8%,#f4c3cf_0%,transparent_70%),radial-gradient(55%_30%_at_90%_45%,#d6c9ec_0%,transparent_70%),radial-gradient(60%_30%_at_10%_85%,#cfe2d4_0%,transparent_70%)]" />
        <CosmosBackgroundMobile className="absolute inset-0 md:hidden" />
        <CosmosBackground className="absolute inset-0 hidden opacity-95 md:block" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-cream" />
      </div>
      <Container className="relative grid grid-cols-[minmax(0,1fr)] items-center gap-14 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:py-28">
        <div className="relative z-10 min-w-0 rounded-[2rem] border border-white/60 bg-cream/55 p-5 sm:bg-cream/70 shadow-[0_8px_40px_-12px_rgba(113,57,85,0.18)] backdrop-blur-md sm:p-10">
          <Eyebrow>Astria Studio</Eyebrow>
          <h1
            id="hero-titulo"
            className="mt-6 font-serif text-[clamp(2.3rem,8.4vw,5.75rem)] [overflow-wrap:anywhere] font-light leading-[1.02] tracking-tight"
          >
            Um universo de <em className="font-light italic text-plum">possibilidades.</em>
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
          <OrbitRing
            className="left-1/2 top-1/2 hidden h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 border-ink/20 md:block"
            planetClassName="bg-berry"
            duration="34s"
          />
          <OrbitRing
            className="left-1/2 top-1/2 hidden h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 border-gold/60 md:block"
            planetClassName="bg-mint h-3! w-3!"
            duration="22s"
            reverse
          />
          <Ornament kind="planet" className="animate-float absolute -right-4 top-1/3 z-10 h-14 w-14 text-lilac" />
          <Ornament kind="star" className="animate-twinkle absolute -right-2 top-6 z-10 h-7 w-7 text-gold" />
          <Ornament kind="star" className="animate-twinkle absolute left-[12%] top-0 z-10 h-3.5 w-3.5 text-berry" style={{ animationDelay: "-2s" }} />
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
          <div className="animate-float absolute -bottom-6 -left-3 z-10 w-32 overflow-hidden rounded-2xl border-[5px] border-cream bg-sand shadow-sm sm:-left-8 sm:w-40" style={{ animationDelay: "-3s" }}>
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
