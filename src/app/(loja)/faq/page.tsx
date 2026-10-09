import type { Metadata } from "next";
import { Container, SectionHeading } from "@/components/ui/primitives";
import { faqCategories } from "@/data/faq";
import { getFaq } from "@/services/catalog";

export const metadata: Metadata = {
  title: "Perguntas frequentes",
  description: "Respostas sobre compras, personalizados, prazos, entrega, pagamento e trocas na Astria Studio.",
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const items = await getFaq();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.question,
      acceptedAnswer: { "@type": "Answer", text: i.answer },
    })),
  };

  return (
    <Container className="py-14 sm:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SectionHeading
        as="h1"
        eyebrow="FAQ"
        title="Perguntas frequentes"
        lead="Não achou o que procurava? Fale com a gente pelo WhatsApp."
        className="mb-14"
      />
      <div className="grid gap-14 lg:grid-cols-2">
        {faqCategories.map((cat) => {
          const list = items.filter((i) => i.category === cat);
          if (list.length === 0) return null;
          return (
            <section key={cat} aria-labelledby={`faq-${cat}`}>
              <h2 id={`faq-${cat}`} className="font-serif text-2xl font-light">
                {cat}
              </h2>
              <div className="mt-5 divide-y divide-stone border-y border-stone">
                {list.map((i) => (
                  <details key={i.id} className="group py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[0.95rem] font-medium [&::-webkit-details-marker]:hidden">
                      {i.question}
                      <span aria-hidden="true" className="text-xl font-light transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-muted">{i.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </Container>
  );
}
