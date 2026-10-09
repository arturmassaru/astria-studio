import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { Ornament } from "@/components/ui/Ornament";
import { ProductArt } from "@/components/ui/ProductArt";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { getLiveCampaigns } from "@/services/catalog";

/** Estrutura dirigida por dados: exibe as campanhas ativas dentro do período. */
export async function SecaoSazonal() {
  const campaigns = await getLiveCampaigns();
  if (campaigns.length === 0) return null;

  return (
    <section aria-label="Campanhas sazonais" className="py-20 sm:py-28">
      <Container className="space-y-16">
        {campaigns.map((c, i) => (
          <article
            key={c.id}
            className="relative grid items-center gap-10 overflow-hidden rounded-[2rem] bg-peach/40 p-6 sm:p-10 lg:grid-cols-2 lg:gap-16 lg:p-14"
          >
            <Ornament kind="star" className="absolute right-8 top-8 h-5 w-5 text-gold" />
            <Ornament kind="dots" className="absolute bottom-8 left-10 h-4 w-16 text-gold/70" />
            <div className={i % 2 === 1 ? "lg:order-2" : undefined}>
              <Eyebrow>{c.kicker}</Eyebrow>
              <h2 className="mt-5 font-serif text-[clamp(2.2rem,4.6vw,3.75rem)] font-light leading-[1.05] tracking-tight">
                {c.title}
              </h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-ink/75 sm:text-lg">
                {c.description}
              </p>
              <ButtonLink href={c.href} className="mt-8" size="lg">
                {c.ctaLabel}
              </ButtonLink>
            </div>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[1.5rem] lg:max-w-md">
              {c.image ? (
                <Image
                  src={c.image}
                  alt={`Campanha ${c.title}`}
                  fill
                  sizes="(min-width: 1024px) 28rem, 90vw"
                  className="object-cover"
                />
              ) : (
                <ProductArt art={c.art} className="h-full w-full" />
              )}
            </div>
          </article>
        ))}
      </Container>
    </section>
  );
}
