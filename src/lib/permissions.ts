import type { Access, AdminModule, Role } from "@/types";

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  operacional: "Operacional",
  financeiro: "Financeiro",
  leitura: "Leitura",
};

export const MODULE_LABELS: Record<AdminModule, string> = {
  dashboard: "Dashboard",
  solicitacoes: "Solicitações",
  pedidos: "Pedidos",
  clientes: "Clientes",
  produtos: "Produtos",
  kits: "Kits",
  producao: "Produção",
  estoque: "Estoque",
  materiais: "Materiais",
  maquinas: "Máquinas",
  financeiro: "Financeiro",
  relatorios: "Relatórios",
  categorias: "Categorias",
  tags: "Tags",
  usuarios: "Usuários",
  configuracoes: "Configurações gerais",
};

const all = (a: Access): Record<AdminModule, Access> => ({
  dashboard: a,
  solicitacoes: a,
  pedidos: a,
  clientes: a,
  produtos: a,
  kits: a,
  producao: a,
  estoque: a,
  materiais: a,
  maquinas: a,
  financeiro: a,
  relatorios: a,
  categorias: a,
  tags: a,
  usuarios: a,
  configuracoes: a,
});

/**
 * Matriz inicial por papel (módulo x acesso).
 * IMPORTANTE: esconder itens na interface NÃO protege dados. A proteção real
 * deve existir no backend (RLS no Supabase, ver supabase/migrations).
 */
export const PERMISSIONS: Record<Role, Record<AdminModule, Access>> = {
  admin: all("write"),
  operacional: {
    ...all("write"),
    financeiro: "none",
    usuarios: "none",
    configuracoes: "read",
    relatorios: "read",
  },
  financeiro: {
    ...all("read"),
    pedidos: "write",
    financeiro: "write",
    relatorios: "write",
    usuarios: "none",
    configuracoes: "read",
  },
  leitura: {
    ...all("read"),
    financeiro: "none",
    usuarios: "none",
  },
};

export function accessFor(role: Role, module: AdminModule): Access {
  return PERMISSIONS[role][module];
}

export function can(role: Role, module: AdminModule, action: "read" | "write"): boolean {
  const a = accessFor(role, module);
  return action === "read" ? a !== "none" : a === "write";
}
