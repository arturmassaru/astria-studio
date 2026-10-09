import type { Metadata } from "next";
import { ProductCard } from "@/components/shop/ProductCard";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { kitPricing } from "@/lib/pricing";
import { getKits, getProducts } from "@/services/catalog";

export const metadata: Metadata = {
  title: "Kits",
  description: "Combinações de peças da Astria pensadas para presentear.",
  alternates: { canonical: "/kits" },
};

export default async function KitsPage() {
  const [kits, products] = await Promise.all([getKits(), getProducts()]);
  return (
    <Container className="py-14 sm:py-20">
      <SectionHeading
        as="h1"
        eyebrow="Para presentear"
        title="Kits"
        lead="Combinações pensadas para presentear. Cada peça continua disponível individualmente."
        className="mb-12"
      />
      {kits.length === 0 ? (
        <p className="text-muted">Em breve, novos kits por aqui.</p>
      ) : (
        <ul className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {kits.map((kit) => {
            const pr = kitPricing(kit, products);
            return (
              <li key={kit.id}>
                <ProductCard
                  href={`/kits/${kit.slug}`}
                  name={kit.name}
                  category="Kit"
                  price={pr.price}
                  list={pr.savings > 0 ? pr.list : undefined}
                  badge={pr.savings > 0 ? "Kit" : null}
                  images={kit.images}
                  art={kit.art}
                />
              </li>
            );
          })}
        </ul>
      )}
    </Container>
  );
}
