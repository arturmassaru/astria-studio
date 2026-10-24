import Link from "next/link";
import { Ornament } from "@/components/ui/Ornament";
import { ProductCard, productFromPrice } from "@/components/shop/ProductCard";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { getCategories, getFeaturedProducts } from "@/services/catalog";

export async function Queridinhos() {
  const [products, categories] = await Promise.all([getFeaturedProducts(8), getCategories()]);
  const categoryName = (ids: string[]) => categories.find((c) => ids.includes(c.id))?.name;
  const hasDemo = products.some((p) => p.isDemo);

  return (
    <section aria-labelledby="queridinhos-titulo" className="relative overflow-hidden bg-rose/30 py-20 sm:py-28">
      <Ornament kind="star" className="animate-twinkle absolute right-[8%] top-10 h-6 w-6 text-berry" />
      <Ornament kind="planet" className="animate-float absolute right-[16%] top-24 hidden h-12 w-12 text-lilac sm:block" />
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow className="mb-4">Vitrine</Eyebrow>
            <h2
              id="queridinhos-titulo"
              className="font-serif text-[clamp(2rem,4.2vw,3.25rem)] font-light leading-[1.08] tracking-tight"
            >
              Os queridinhos da Astria
            </h2>
          </div>
          <Link
            href="/produtos"
            className="text-sm font-medium underline decoration-stone underline-offset-[6px] transition-colors hover:decoration-ink"
          >
            Ver todos os produtos
          </Link>
        </div>
      </Container>

      <div
        role="region"
        aria-label="Vitrine de produtos, role para o lado"
        tabIndex={0}
        className="scrollbar-none mt-12 flex gap-6 overflow-x-auto px-6 pb-4 after:w-px after:shrink-0 after:content-[''] sm:px-8 lg:px-[max(3rem,calc((100vw-80rem)/2+3rem))]"
      >
        {products.map((p) => {
          const pr = productFromPrice(p);
          return (
            <div key={p.id} className="w-[72vw] shrink-0 sm:w-[320px]">
              <ProductCard
                href={`/produtos/${p.slug}`}
                name={p.name}
                category={categoryName(p.categoryIds)}
                price={pr.price}
                list={pr.list}
                from={pr.from}
                badge={p.badge}
                images={p.images}
                art={p.art}
                sizes="(min-width: 640px) 320px, 72vw"
              />
            </div>
          );
        })}
      </div>

      {hasDemo ? (
        <Container>
          <p className="mt-6 text-xs text-muted">
            Preços provisórios e alguns itens demonstrativos, usados para prototipagem.
          </p>
        </Container>
      ) : null}
    </section>
  );
}
