"use client";

import { usePathname } from "next/navigation";
import { CosmosBackground, CosmosBackgroundMobile } from "@/components/ui/CosmosBackground";

/**
 * Moldura das páginas internas da loja: o universo da Astria fica fixo ao
 * fundo e o conteúdo repousa sobre um painel creme translúcido (mesma
 * linguagem do Hero). A home não usa a moldura: ela tem o próprio fundo.
 */
export function PageFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/") return <>{children}</>;
  // Carrinho: painel de ponta a ponta, sem margens laterais
  const fullBleed = pathname.startsWith("/carrinho");

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 md:hidden bg-[radial-gradient(60%_35%_at_15%_8%,#f4c3cf_0%,transparent_70%),radial-gradient(55%_30%_at_90%_50%,#d6c9ec_0%,transparent_70%),radial-gradient(60%_30%_at_10%_90%,#cfe2d4_0%,transparent_70%)]" />
        <CosmosBackgroundMobile className="absolute inset-0 md:hidden" />
        <CosmosBackground className="absolute inset-0 hidden md:block" />
      </div>
      <div
        className={
          fullBleed
            ? "w-full overflow-clip border-y border-white/60 bg-cream/60 backdrop-blur-md sm:bg-cream/75"
            : "mx-auto my-3 w-[calc(100%-1.5rem)] max-w-[88rem] overflow-clip rounded-[1.75rem] border border-white/60 bg-cream/60 shadow-[0_8px_40px_-12px_rgba(113,57,85,0.18)] backdrop-blur-md sm:my-6 sm:w-[calc(100%-3rem)] sm:rounded-[2rem] sm:bg-cream/75"
        }
      >
        {children}
      </div>
    </>
  );
}
