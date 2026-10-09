import type { Order, Payment, PaymentStatus } from "@/types";
import { round2 } from "../utils";

export function orderCode(existing: Order[]): string {
  const max = existing.reduce((m, o) => {
    const n = Number(o.code.replace(/\D/g, ""));
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `PED-${String(max + 1).padStart(4, "0")}`;
}

/** Pagamento é derivado dos lançamentos; os três status do pedido são independentes entre si. */
export function derivePaymentStatus(total: number, payments: Payment[]): PaymentStatus {
  const paid = payments.filter((p) => p.kind === "pagamento").reduce((s, p) => s + p.amount, 0);
  const refunded = payments.filter((p) => p.kind === "estorno").reduce((s, p) => s + p.amount, 0);
  const net = round2(paid - refunded);
  if (refunded > 0 && net <= 0) return "estornado";
  if (net <= 0) return "pendente";
  if (net + 0.005 >= total && total > 0) return "pago";
  return "parcial";
}

export function netPaid(order: Order): number {
  return round2(
    order.payments.reduce((s, p) => s + (p.kind === "pagamento" ? p.amount : -p.amount), 0),
  );
}

/** Fluxo padrão: confirmado + pagamento integral + prazo definido. */
export function productionBlockers(order: Order): string[] {
  const reasons: string[] = [];
  if (order.commercialStatus !== "confirmado") reasons.push("pedido não confirmado");
  if (order.paymentStatus !== "pago") reasons.push("pagamento não integral");
  if (!order.deadline) reasons.push("prazo não definido");
  return reasons;
}

export function canStartProduction(order: Order): boolean {
  if (order.commercialStatus !== "confirmado") return false;
  return productionBlockers(order).length === 0 || order.productionException !== null;
}

export function orderCost(order: Order): { cost: number; missing: boolean } {
  let missing = false;
  const cost = order.items.reduce((sum, it) => {
    if (it.costSnapshot === null) {
      missing = true;
      return sum;
    }
    return sum + it.costSnapshot * it.quantity;
  }, 0);
  return { cost: round2(cost), missing };
}

export function orderProfit(order: Order) {
  const { cost, missing } = orderCost(order);
  const profit = round2(order.total - order.shipping - cost);
  return { revenue: order.total, cost, profit, missingCost: missing };
}

/** Quantidade de cada produto necessária para o pedido (expande kits). */
export function stockNeeds(order: Order): { productId: string; quantity: number }[] {
  const map = new Map<string, number>();
  for (const item of order.items) {
    for (const c of item.components) {
      map.set(c.productId, (map.get(c.productId) ?? 0) + c.quantity * item.quantity);
    }
  }
  return [...map.entries()].map(([productId, quantity]) => ({ productId, quantity }));
}
