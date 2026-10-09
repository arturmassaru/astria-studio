import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/shop/Gallery";
import { KitPurchase } from "@/components/shop/KitPurchase";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { kitPricing } from "@/lib/pricing";
import { money } from "@/lib/format";
import { getKitBySlug, getKits, getProducts } from "@/services/catalog";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const kits = await getKits();
  return kits.map((k) => ({ slug: k.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const kit = await getKitBySlug(slug);
  if (!kit) return { title: "Kit não encontrado" };
  return {
    title: kit.name,
    description: kit.shortDescription,
    alternates: { canonical: `/kits/${kit.slug}` },
    openGraph: {
      title: kit.name,
      description: kit.shortDescription,
      images: kit.images[0] ? [{ url: kit.images[0] }] : undefined,
    },
  };
}

export default async function KitPage({ params }: Params) {
  const { slug } = await params;
  const kit = await getKitBySlug(slug);
  if (!kit) notFound();

  const products = await getProducts();
  const pricing = kitPricing(kit, products);
  const composition = kit.items
    .map((item) => ({ item, product: products.find((p) => p.id === item.productId) }))
    .filter((c): c is { item: typeof c.item; product: NonNullable<typeof c.product> } => !!c.product);

  return (
    <Container className="py-10 sm:py-16">
      <nav aria-label="Você está em" className="mb-8 text-sm text-muted">
        <ol className="flex flex-wrap gap-2">
          <li>
            <Link href="/" className="hover:text-ink">
              Início
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/kits" className="hover:text-ink">
              Kits
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink">
            {kit.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
        <Gallery images={kit.images} art={kit.art} alt={kit.name} />

        <div className="lg:py-4">
          <Eyebrow>Kit</Eyebrow>
          <h1 className="mt-4 font-serif text-[clamp(2.2rem,4.6vw,3.5rem)] font-light leading-[1.05] tracking-tight">
            {kit.name}
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted sm:text-lg">{kit.description}</p>

          <div className="my-9 border-t border-stone pt-9">
            <KitPurchase kit={kit} price={pricing.price} list={pricing.savings > 0 ? pricing.list : pricing.price} />
          </div>

          <section aria-labelledby="composicao" className="border-t border-stone pt-8">
            <h2 id="composicao" className="font-serif text-2xl font-light">
              O que vem no kit
            </h2>
            <ul className="mt-5 divide-y divide-stone/70">
              {composition.map(({ item, product }) => (
                <li key={product.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <Link href={`/produtos/${product.slug}`} className="underline-offset-4 hover:underline">
                    {item.quantity > 1 ? `${item.quantity} x ` : ""}
                    {product.name}
                  </Link>
                  <span className="text-muted">{money(product.promoPrice ?? product.price)}</span>
                </li>
              ))}
            </ul>
            {pricing.savings > 0 ? (
              <p className="mt-4 text-sm text-muted">
                Comprando separado: {money(pricing.list)}. No kit você economiza {money(pricing.savings)}.
              </p>
            ) : null}
          </section>
        </div>
      </div>
    </Container>
  );
}
