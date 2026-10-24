import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PageFrame } from "@/components/layout/PageFrame";

export default function LojaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-5 focus:py-2.5 focus:text-sm focus:text-cream"
      >
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo">
        <PageFrame>{children}</PageFrame>
      </main>
      <Footer />
    </>
  );
}
