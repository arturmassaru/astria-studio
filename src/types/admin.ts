import type { ID } from "./catalog";

export type Role = "admin" | "operacional" | "financeiro" | "leitura";

export type AdminModule =
  | "dashboard"
  | "solicitacoes"
  | "pedidos"
  | "clientes"
  | "produtos"
  | "kits"
  | "producao"
  | "estoque"
  | "materiais"
  | "maquinas"
  | "financeiro"
  | "relatorios"
  | "categorias"
  | "tags"
  | "usuarios"
  | "configuracoes";

export type Access = "none" | "read" | "write";

export interface AdminUser {
  id: ID;
  name: string;
  email: string;
  role: Role;
  active: boolean;
}

export interface Settings {
  businessName: string;
  whatsapp: string;
  /** Tarifa configurável (R$/kWh). Nunca fixada em código. */
  energyTariffPerKwh: number | null;
  /** Margem de referência global (%). */
  globalMarginPercent: number | null;
  /** Percentual de perdas aplicado sobre materiais na estimativa de custo. */
  lossPercent: number;
  participants: { name: string; percent: number }[];
}

export type ExpenseCategory =
  | "material"
  | "energia"
  | "embalagem"
  | "frete"
  | "marketing"
  | "ferramentas"
  | "outros";

export interface Expense {
  id: ID;
  date: string;
  description: string;
  category: ExpenseCategory;
  /** "custo" já compõe o custo dos pedidos; "despesa" entra no resultado operacional. */
  kind: "custo" | "despesa";
  amount: number;
}
