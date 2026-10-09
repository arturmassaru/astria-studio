"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import type { AdminModule, Role } from "@/types";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import { Ornament } from "@/components/ui/Ornament";
import { can, ROLE_LABELS } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { RoleProvider, useRole } from "./role";

interface NavItem {
  label: string;
  href: string;
  module: AdminModule;
}

const NAV: { group: string; items: NavItem[] }[] = [
  { group: "Visão geral", items: [{ label: "Dashboard", href: "/admin", module: "dashboard" }] },
  {
    group: "Comercial",
    items: [
      { label: "Solicitações", href: "/admin/solicitacoes", module: "solicitacoes" },
      { label: "Pedidos", href: "/admin/pedidos", module: "pedidos" },
      { label: "Clientes", href: "/admin/clientes", module: "clientes" },
    ],
  },
  {
    group: "Operação",
    items: [
      { label: "Produtos", href: "/admin/produtos", module: "produtos" },
      { label: "Kits", href: "/admin/kits", module: "kits" },
      { label: "Produção", href: "/admin/producao", module: "producao" },
      { label: "Estoque", href: "/admin/estoque", module: "estoque" },
      { label: "Materiais", href: "/admin/materiais", module: "materiais" },
      { label: "Máquinas", href: "/admin/maquinas", module: "maquinas" },
    ],
  },
  {
    group: "Gestão",
    items: [
      { label: "Financeiro", href: "/admin/financeiro", module: "financeiro" },
      { label: "Relatórios", href: "/admin/relatorios", module: "relatorios" },
    ],
  },
  {
    group: "Configurações",
    items: [
      { label: "Categorias", href: "/admin/categorias", module: "categorias" },
      { label: "Tags", href: "/admin/tags", module: "tags" },
      { label: "Usuários", href: "/admin/usuarios", module: "usuarios" },
      { label: "Configurações gerais", href: "/admin/configuracoes", module: "configuracoes" },
    ],
  },
];

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { role, setRole } = useRole();

  return (
    <div className="flex h-full flex-col">
      <Link href="/admin" onClick={onNavigate} className="flex items-center gap-2 px-6 py-6 font-serif text-xl">
        <Ornament kind="star" className="h-4 w-4 text-gold" />
        Astria <span className="text-sm text-muted">Admin</span>
      </Link>

      <nav aria-label="Painel administrativo" className="flex-1 overflow-y-auto px-3 pb-6">
        {NAV.map((g) => {
          const items = g.items.filter((i) => can(role, i.module, "read"));
          if (items.length === 0) return null;
          return (
            <div key={g.group} className="mt-6 first:mt-0">
              <p className="px-3 pb-2 text-[0.68rem] font-medium uppercase tracking-[0.2em] text-muted">
                {g.group}
              </p>
              <ul>
                {items.map((i) => {
                  const active = i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href);
                  return (
                    <li key={i.href}>
                      <Link
                        href={i.href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "block rounded-lg px-3 py-2 text-sm transition-colors",
                          active ? "bg-ink text-cream" : "hover:bg-sand",
                        )}
                      >
                        {i.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-stone p-4">
        <label htmlFor="perfil-demo" className="mb-1.5 block text-xs text-muted">
          Ver painel como (demonstração)
        </label>
        <select
          id="perfil-demo"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="w-full rounded-lg border border-stone bg-white px-3 py-2 text-sm"
        >
          {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
        <Link href="/" className="mt-4 block text-xs text-muted underline underline-offset-4">
          Ver a loja
        </Link>
      </div>
    </div>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-cream lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-stone bg-cream lg:block">
        <Sidebar />
      </aside>

      <div className="flex items-center justify-between border-b border-stone px-5 py-3 lg:hidden">
        <Link href="/admin" className="font-serif text-lg">
          Astria <span className="text-sm text-muted">Admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="menu-admin"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          className="rounded-full p-2 hover:bg-sand"
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>
      {open ? (
        <div id="menu-admin" className="border-b border-stone bg-cream lg:hidden">
          <Sidebar onNavigate={() => setOpen(false)} />
        </div>
      ) : null}

      <main className="min-w-0 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        <p className="mb-8 rounded-lg border border-gold/50 bg-gold-soft/50 px-4 py-3 text-xs leading-relaxed">
          <strong className="font-medium">Modo demonstração.</strong> Enquanto o Supabase não estiver
          conectado, os dados deste painel ficam salvos apenas neste navegador. Não há login real
          nesta versão.
        </p>
        {children}
      </main>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <RoleProvider>
      <Shell>{children}</Shell>
    </RoleProvider>
  );
}
