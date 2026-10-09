import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalog } from "@/components/shop/Catalog";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { getCategories, getProducts, getTags } from "@/services/catalog";

export const metadata: Metadata = {
  title: "Produtos",
  description: "Objetos decorativos, utilidades e presentes da Astria Studio.",
  alternates: { canonical: "/produtos" },
};

export default async function ProdutosPage() {
  const [products, categories, tags] = await Promise.all([getProducts(), getCategories(), getTags()]);
  return (
    <Container className="py-14 sm:py-20">
      <SectionHeading
        as="h1"
        eyebrow="Catálogo"
        title="Produtos"
        lead="Peças prontas para encontrar um lugar na sua rotina."
        className="mb-12"
      />
      <Suspense fallback={<p className="text-sm text-muted">Carregando produtos…</p>}>
        <Catalog products={products} categories={categories} tags={tags} />
      </Suspense>
    </Container>
  );
}
