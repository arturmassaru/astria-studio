import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Ornament } from "@/components/ui/Ornament";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Ornament kind="moon" className="h-10 w-10 text-ink/40" />
      <h1 className="mt-6 font-serif text-5xl font-light tracking-tight">Página não encontrada</h1>
      <p className="mt-4 max-w-sm text-muted">
        Parece que esta página saiu de órbita. Vamos voltar para um lugar conhecido?
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/" size="lg">
          Ir para o início
        </ButtonLink>
        <Link href="/produtos" className="inline-flex items-center px-4 text-sm underline underline-offset-4">
          Ver produtos
        </Link>
      </div>
    </main>
  );
}
