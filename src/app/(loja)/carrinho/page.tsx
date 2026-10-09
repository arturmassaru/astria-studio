import type { Metadata } from "next";
import { CartView } from "@/components/shop/CartView";
import { Container, SectionHeading } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Carrinho",
  robots: { index: false },
};

export default function CarrinhoPage() {
  return (
    <Container className="py-14 sm:py-20">
      <SectionHeading as="h1" eyebrow="Seu carrinho" title="Carrinho" className="mb-12" />
      <CartView />
    </Container>
  );
}
