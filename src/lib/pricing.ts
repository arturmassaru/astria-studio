import type {
  Category,
  Kit,
  Machine,
  Material,
  MaterialUsage,
  Product,
  Settings,
} from "@/types";
import { round2 } from "./utils";

/* ------------------------------------------------------------------ */
/* Preço de venda (público)                                           */
/* ------------------------------------------------------------------ */

interface PriceSource {
  price: number;
  promoPrice: number | null;
  variants: { id: string; price: number | null; promoPrice: number | null }[];
}

/** Preço cobrado e preço de tabela para um produto (com variante opcional). */
export function unitPrices(
  product: PriceSource,
  variantId?: string | null,
): { price: number; list: number } {
  const variant = variantId ? product.variants.find((v) => v.id === variantId) : undefined;
  if (variant && variant.price !== null) {
    return { list: variant.price, price: variant.promoPrice ?? variant.price };
  }
  return { list: product.price, price: product.promoPrice ?? product.price };
}

export interface KitPricing {
  list: number;
  price: number;
  savings: number;
}

export function kitPricing(
  kit: Pick<Kit, "items" | "fixedPrice" | "discountPercent">,
  products: (PriceSource & { id: string })[],
): KitPricing {
  const list = round2(
    kit.items.reduce((sum, item) => {
      const p = products.find((x) => x.id === item.productId);
      return sum + (p ? unitPrices(p).price * item.quantity : 0);
    }, 0),
  );
  const price =
    kit.fixedPrice !== null && kit.fixedPrice > 0
      ? kit.fixedPrice
      : round2(list * (1 - kit.discountPercent / 100));
  return { list, price, savings: round2(Math.max(0, list - price)) };
}

/* ------------------------------------------------------------------ */
/* Custo (interno)                                                    */
/* ------------------------------------------------------------------ */

export interface CostBreakdown {
  materials: number;
  losses: number;
  energy: number;
  depreciation: number;
  maintenance: number;
  wear: number;
  total: number;
  missingTariff: boolean;
  unknownMaterials: string[];
}

/**
 * Custo ESTIMADO (não é custo real). Mão de obra não é incluída.
 * Energia usa a tarifa configurada em Configurações, nunca um valor fixo.
 */
export function estimateCost(
  input: { materials: MaterialUsage[]; machineHours: number | null; machine: Machine | null },
  materials: Material[],
  settings: Settings,
): CostBreakdown {
  const unknownMaterials: string[] = [];
  const materialsCost = input.materials.reduce((sum, usage) => {
    const m = materials.find((x) => x.id === usage.materialId);
    if (!m) {
      unknownMaterials.push(usage.materialId);
      return sum;
    }
    return sum + m.unitCost * usage.quantity;
  }, 0);

  const hours = input.machineHours ?? 0;
  const machine = input.machine;
  const tariff = settings.energyTariffPerKwh;
  const missingTariff = !!machine && hours > 0 && tariff === null;

  const energy = machine && tariff !== null ? (machine.powerW / 1000) * hours * tariff : 0;
  const depreciation =
    machine && machine.lifetimeHours > 0 ? (machine.purchasePrice / machine.lifetimeHours) * hours : 0;
  const maintenance = machine ? machine.maintenancePerHour * hours : 0;
  const wear = machine ? machine.wearPerHour * hours : 0;
  const losses = materialsCost * (settings.lossPercent / 100);

  const total = materialsCost + losses + energy + depreciation + maintenance + wear;
  return {
    materials: round2(materialsCost),
    losses: round2(losses),
    energy: round2(energy),
    depreciation: round2(depreciation),
    maintenance: round2(maintenance),
    wear: round2(wear),
    total: round2(total),
    missingTariff,
    unknownMaterials,
  };
}

/* ------------------------------------------------------------------ */
/* Margem x markup                                                    */
/* ------------------------------------------------------------------ */

/** Margem = lucro / preço. */
export function marginPercent(price: number, cost: number): number {
  return price > 0 ? ((price - cost) / price) * 100 : 0;
}

/** Markup = lucro / custo. Não é a mesma coisa que margem. */
export function markupPercent(price: number, cost: number): number {
  return cost > 0 ? ((price - cost) / cost) * 100 : 0;
}

/** Preço sugerido para atingir uma margem sobre o preço de venda. */
export function suggestedPrice(cost: number, targetMarginPercent: number): number | null {
  if (targetMarginPercent >= 100 || targetMarginPercent < 0) return null;
  return round2(cost / (1 - targetMarginPercent / 100));
}

export type MarginSource = "produto" | "categoria" | "global";

/** Prioridade: produto > categoria > global. */
export function resolveMargin(
  product: Pick<Product, "marginPercent" | "categoryIds">,
  categories: Category[],
  settings: Settings,
): { value: number; source: MarginSource } | null {
  if (product.marginPercent !== null) return { value: product.marginPercent, source: "produto" };
  for (const id of product.categoryIds) {
    const c = categories.find((x) => x.id === id);
    if (c && c.marginPercent !== null) return { value: c.marginPercent, source: "categoria" };
  }
  if (settings.globalMarginPercent !== null)
    return { value: settings.globalMarginPercent, source: "global" };
  return null;
}

/** Impacto de um desconto no lucro de uma venda. */
export function discountImpact(price: number, cost: number, discountPercent: number) {
  const finalPrice = round2(price * (1 - discountPercent / 100));
  const profit = round2(finalPrice - cost);
  return {
    finalPrice,
    profit,
    margin: marginPercent(finalPrice, cost),
    belowCost: finalPrice < cost,
  };
}
