import type { Metadata } from "next";
import { RequestForm } from "@/components/shop/RequestForm";
import { Container, SectionHeading } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Enviar solicitação",
  robots: { index: false },
};

export default function SolicitacaoPage() {
  return (
    <Container className="py-14 sm:py-20">
      <SectionHeading
        as="h1"
        eyebrow="Quase lá"
        title="Enviar solicitação"
        lead="Você informa o básico, a gente continua a conversa pelo WhatsApp e confirma tudo antes de qualquer cobrança."
        className="mb-12"
      />
      <RequestForm />
    </Container>
  );
}
