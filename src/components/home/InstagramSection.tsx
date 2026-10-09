import Image from "next/image";
import { InstagramIcon } from "@/components/ui/icons";
import { ProductArt } from "@/components/ui/ProductArt";
import { Container, Eyebrow } from "@/components/ui/primitives";
import type { ProductArt as Art } from "@/types";
import { siteConfig } from "@/lib/site";

type Tile = { photo: string; alt: string } | { art: Art };

/**
 * Estrutura visual do Instagram. A integração com a API NÃO foi implementada:
 * os quadros abaixo são estáticos e serão substituídos por publicações reais depois.
 */
const tiles: Tile[] = [
  { photo: "/products/kit-natal-aconchego.jpg", alt: "Kit Natal Aconchego sobre a Bandeja Nuvem" },
  { art: { shape: "vase", tone: "sky" } },
  { photo: "/products/mini-jesus.jpg", alt: "Mini Jesus sentado na borda de um monitor" },
  { art: { shape: "candle", tone: "rose" } },
  { photo: "/products/bandeja-nuvem.jpg", alt: "Bandeja Nuvem sobre uma mesa de madeira" },
  { art: { shape: "tree", tone: "mint" } },
];

export function InstagramSection() {
  return (
    <section aria-labelledby="instagram-titulo" className="py-16 sm:py-24">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow className="mb-4">Instagram</Eyebrow>
            <h2
              id="instagram-titulo"
              className="font-serif text-[clamp(1.9rem,3.8vw,2.9rem)] font-light leading-[1.1] tracking-tight"
            >
              Bastidores e novidades
            </h2>
          </div>
          <a
            href={siteConfig.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium underline decoration-stone underline-offset-[6px] hover:decoration-ink"
          >
            <InstagramIcon width={18} height={18} /> Seguir no Instagram
          </a>
        </div>

        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {tiles.map((t, i) => (
            <li key={i}>
              <a
                href={siteConfig.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Abrir o Instagram da Astria"
                className="relative block aspect-square overflow-hidden rounded-xl bg-sand"
              >
                {"photo" in t ? (
                  <Image
                    src={t.photo}
                    alt={t.alt}
                    fill
                    sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                ) : (
                  <ProductArt art={t.art} className="h-full w-full" />
                )}
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
