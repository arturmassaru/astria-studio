import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { siteConfig, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a Astria Studio pelo WhatsApp ou pelo Instagram.",
  alternates: { canonical: "/contato" },
};

export default function ContatoPage() {
  return (
    <Container className="py-14 sm:py-20">
      <SectionHeading
        as="h1"
        eyebrow="Contato"
        title="Vamos conversar?"
        lead="O WhatsApp é o nosso canal principal: é por lá que combinamos detalhes, prazo e entrega."
        className="mb-12"
      />
      <div className="grid gap-px overflow-hidden rounded-[1.5rem] bg-stone sm:grid-cols-2">
        <section className="bg-cream p-8 sm:p-10">
          <h2 className="font-serif text-2xl font-light">WhatsApp</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Tire dúvidas, conte uma ideia ou acompanhe uma solicitação.
          </p>
          <ButtonLink href={whatsappLink("Olá, Astria! Vim pelo site.")} external className="mt-6">
            Chamar no WhatsApp
          </ButtonLink>
        </section>
        <section className="bg-cream p-8 sm:p-10">
          <h2 className="font-serif text-2xl font-light">Instagram</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Bastidores, novidades e inspirações de peças.
          </p>
          <ButtonLink href={siteConfig.instagramUrl} external variant="outline" className="mt-6">
            Ver no Instagram
          </ButtonLink>
        </section>
      </div>
    </Container>
  );
}
