import { NextResponse, type NextRequest } from "next/server";

/**
 * Bloqueio do painel /admin em produção.
 *
 * Enquanto o login real (Supabase) não existe, o painel não deve ficar
 * público: em produção, /admin responde "página não encontrada" para todo
 * mundo. Em desenvolvimento (npm run dev) continua liberado.
 *
 * Para liberar de propósito (apenas para testes), defina na Vercel a
 * variável ADMIN_ENABLED=true. Remover o bloqueio de vez só depois de
 * implementar autenticação.
 */
export function middleware(req: NextRequest) {
  const isProd = process.env.NODE_ENV === "production";
  const enabled = process.env.ADMIN_ENABLED === "true";

  if (isProd && !enabled) {
    return NextResponse.rewrite(new URL("/_admin-indisponivel", req.url), { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
