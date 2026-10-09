"use client";

import { CrudPage } from "@/components/admin/CrudPage";
import { Panel, Table, Td, Th } from "@/components/admin/ui";
import { MODULE_LABELS, PERMISSIONS, ROLE_LABELS } from "@/lib/permissions";
import { toOptions } from "@/lib/labels";
import { cols } from "@/lib/store/collections";
import { uid } from "@/lib/utils";
import type { AdminModule, AdminUser, Role } from "@/types";

const ROLES = Object.keys(ROLE_LABELS) as Role[];
const MODULES = Object.keys(MODULE_LABELS) as AdminModule[];
const ACCESS_LABEL = { none: "—", read: "Leitura", write: "Edição" } as const;

function Matrix() {
  return (
    <Panel
      title="Permissões por papel"
      description="Matriz inicial por módulo. No futuro, permissões por módulo e ação poderão ser editadas aqui."
      className="mt-10"
    >
      <Table caption="Matriz de permissões">
        <thead>
          <tr>
            <Th>Módulo</Th>
            {ROLES.map((r) => (
              <Th key={r}>{ROLE_LABELS[r]}</Th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MODULES.map((m) => (
            <tr key={m}>
              <Td className="font-medium">{MODULE_LABELS[m]}</Td>
              {ROLES.map((r) => (
                <Td key={r}>{ACCESS_LABEL[PERMISSIONS[r][m]]}</Td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
      <p className="mt-4 text-xs text-muted">
        Dados financeiros ficam restritos aos papéis Admin e Financeiro. Esconder módulos na interface
        não basta: a proteção real precisa existir também no backend (políticas RLS em
        supabase/migrations).
      </p>
    </Panel>
  );
}

export default function UsuariosPage() {
  return (
    <CrudPage<AdminUser>
      module="usuarios"
      title="Usuários"
      description="Cadastro de pessoas e papéis. As contas de acesso reais serão criadas pelo Supabase Auth quando o backend for conectado."
      col={cols.users}
      itemName="usuário"
      emptyTitle="Nenhum usuário cadastrado"
      emptyText="Cadastre quem vai usar o painel e defina o papel de cada pessoa."
      blank={() => ({ id: uid("usr"), name: "", email: "", role: "leitura", active: true })}
      fields={[
        { key: "name", label: "Nome", type: "text", required: true },
        { key: "email", label: "E-mail", type: "text", required: true },
        { key: "role", label: "Papel", type: "select", options: toOptions(ROLE_LABELS) },
        { key: "active", label: "Ativo", type: "checkbox" },
      ]}
      validate={(d, all) => {
        if (!/^\S+@\S+\.\S+$/.test(d.email)) return "Informe um e-mail válido.";
        return all.some((u) => u.id !== d.id && u.email.toLowerCase() === d.email.toLowerCase())
          ? "Já existe um usuário com esse e-mail."
          : null;
      }}
      extra={<Matrix />}
    />
  );
}
