import type { ID } from "./catalog";

export type MaterialKind = "filamento" | "tinta" | "embalagem" | "etiqueta" | "outro";
export type Unit = "g" | "ml" | "unidade" | "m";

export interface Material {
  id: ID;
  name: string;
  kind: MaterialKind;
  unit: Unit;
  stock: number;
  minStock: number;
  /** Custo por unidade de medida (R$/g, R$/ml...). Pode ter muitas casas decimais. */
  unitCost: number;
  supplier: string;
  active: boolean;
}

export type MaterialMovementType = "compra" | "consumo" | "perda" | "ajuste";
export type LossReason =
  | "falha"
  | "teste"
  | "prototipo"
  | "problema_material"
  | "configuracao"
  | "outros";

export interface MaterialMovement {
  id: ID;
  materialId: ID;
  type: MaterialMovementType;
  /** Sempre positivo; o sinal vem do tipo (ajuste usa `direction`). */
  quantity: number;
  direction: 1 | -1;
  totalCost: number | null;
  unitCost: number | null;
  lossReason: LossReason | null;
  orderId: ID | null;
  date: string;
  note: string;
}

export interface Machine {
  id: ID;
  name: string;
  model: string;
  /** Potência média em watts. */
  powerW: number;
  purchasePrice: number;
  /** Vida útil estimada em horas (base da depreciação). */
  lifetimeHours: number;
  maintenancePerHour: number;
  wearPerHour: number;
  active: boolean;
  notes: string;
}

export type StockMovementType = "entrada" | "saida_pedido" | "estorno_cancelamento" | "ajuste";

export interface StockMovement {
  id: ID;
  productId: ID;
  type: StockMovementType;
  /** Com sinal: entrada positiva, saída negativa. */
  quantity: number;
  orderId: ID | null;
  date: string;
  note: string;
}
