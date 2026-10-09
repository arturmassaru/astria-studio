"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Access, AdminModule, Role } from "@/types";
import { accessFor } from "@/lib/permissions";
import { ROLE_KEY } from "@/lib/store/collections";
import { useStored } from "@/lib/store/core";

interface RoleCtx {
  role: Role;
  setRole: (r: Role) => void;
}

const Ctx = createContext<RoleCtx | null>(null);

/**
 * Perfil ativo (MODO DEMONSTRAÇÃO): permite visualizar o painel como cada papel.
 * Em produção o papel vem da sessão autenticada (Supabase Auth) e a proteção real
 * é feita no backend (RLS). Esconder módulos na interface não protege dados.
 */
export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useStored<Role>(ROLE_KEY, "admin");
  return <Ctx.Provider value={{ role, setRole }}>{children}</Ctx.Provider>;
}

export function useRole(): RoleCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useRole deve ser usado dentro de RoleProvider");
  return ctx;
}

export function useAccess(module: AdminModule): { access: Access; canRead: boolean; canWrite: boolean } {
  const { role } = useRole();
  const access = accessFor(role, module);
  return { access, canRead: access !== "none", canWrite: access === "write" };
}
