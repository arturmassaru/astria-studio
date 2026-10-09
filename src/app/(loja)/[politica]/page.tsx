import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container, Notice, SectionHeading } from "@/components/ui/primitives";
import { policyPages } from "@/data/policies";

/** Privacidade, Termos, Entrega e Trocas e cancelamentos compartilham esta estrutura. */
export const dynamicParams = false;

interface Params {
  params: Promise<{ politica: string }>;
}

export function generateStaticParams() {
  return policyPages.map((p) => ({ politica: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { politica } = await params;
  const page = policyPages.find((p) => p.slug === politica);
  if (!page) return { title: "Página não encontrada" };
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/${page.slug}` },
  };
}

export default async function PoliticaPage({ params }: Params) {
  const { politica } = await params;
  const page = policyPages.find((p) => p.slug === politica);
  if (!page) notFound();

  return (
    <Container className="max-w-3xl py-14 sm:py-20">
      <SectionHeading as="h1" eyebrow="Informações" title={page.title} lead={page.description} className="mb-10" />
      <Notice tone="warn" className="mb-12">
        Conteúdo em elaboração. O texto definitivo será inserido pela Astria Studio e, quando
        necessário, revisado por um profissional.
      </Notice>
      <div className="space-y-10">
        {page.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="font-serif text-2xl font-light">{s.heading}</h2>
            <p className="mt-3 leading-relaxed text-muted">{s.body}</p>
          </section>
        ))}
      </div>
    </Container>
  );
}
