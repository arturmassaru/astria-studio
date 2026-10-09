import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/shop/Gallery";
import { ProductCard, productFromPrice } from "@/components/shop/ProductCard";
import { ProductPurchase } from "@/components/shop/ProductPurchase";
import { Badge, Container, Eyebrow } from "@/components/ui/primitives";
import {
  getCategories,
  getProductBySlug,
  getProducts,
  getRelatedProducts,
  getTags,
} from "@/services/catalog";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produto não encontrado" };
  return {
    title: product.name,
    description: product.shortDescription,
    alternates: { canonical: `/produtos/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.images[0] ? [{ url: product.images[0] }] : undefined,
    },
  };
}

const availabilityLabel = {
  in_stock: "Pronta entrega",
  made_to_order: "Feita sob encomenda",
  out_of_stock: "Indisponível no momento",
} as const;

export default async function ProdutoPage({ params }: Params) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [categories, tags, related] = await Promise.all([
    getCategories(),
    getTags(),
    getRelatedProducts(product),
  ]);
  const productCategories = categories.filter((c) => product.categoryIds.includes(c.id));
  const productTags = tags.filter((t) => product.tagIds.includes(t.id));

  const specs: [string, string][] = [];
  if (product.dimensions) specs.push(["Dimensões", product.dimensions]);
  if (product.weightG) specs.push(["Peso", `${product.weightG} g`]);
  if (product.productionDays) specs.push(["Produção", `Prazo estimado de ${product.productionDays} dias`]);
  specs.push(["Disponibilidade", availabilityLabel[product.availability]]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    image: product.images,
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: (product.promoPrice ?? product.price).toFixed(2),
    },
  };

  return (
    <Container className="py-10 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="Você está em" className="mb-8 text-sm text-muted">
        <ol className="flex flex-wrap gap-2">
          <li>
            <Link href="/" className="hover:text-ink">
              Início
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/produtos" className="hover:text-ink">
              Produtos
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
        <Gallery images={product.images} art={product.art} alt={product.name} />

        <div className="lg:py-4">
          <Eyebrow>{productCategories.map((c) => c.name).join(" · ")}</Eyebrow>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-[clamp(2.2rem,4.6vw,3.5rem)] font-light leading-[1.05] tracking-tight">
              {product.name}
            </h1>
            {product.badge ? <Badge className="bg-sand">{product.badge}</Badge> : null}
          </div>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted sm:text-lg">
            {product.description}
          </p>

          <div className="my-9 border-t border-stone pt-9">
            <ProductPurchase product={product} />
          </div>

          <dl className="grid gap-3 border-t border-stone pt-8 text-sm">
            {specs.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[8rem_1fr] gap-4">
                <dt className="text-muted">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>

          {productTags.length > 0 ? (
            <ul className="mt-8 flex flex-wrap gap-2">
              {productTags.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/produtos?tag=${t.slug}`}
                    className="rounded-full bg-sand px-3 py-1.5 text-xs hover:bg-stone/70"
                  >
                    #{t.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      {related.length > 0 ? (
        <section aria-labelledby="relacionados" className="mt-28">
          <h2 id="relacionados" className="mb-10 font-serif text-3xl font-light tracking-tight">
            Para combinar
          </h2>
          <ul className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
            {related.map((p) => {
              const pr = productFromPrice(p);
              return (
                <li key={p.id}>
                  <ProductCard
                    href={`/produtos/${p.slug}`}
                    name={p.name}
                    price={pr.price}
                    list={pr.list}
                    from={pr.from}
                    badge={p.badge}
                    images={p.images}
                    art={p.art}
                  />
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </Container>
  );
}
