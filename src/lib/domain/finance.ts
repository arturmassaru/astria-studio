import type { Expense, Order } from "@/types";
import { round2 } from "../utils";
import { orderProfit } from "./orders";

export interface DateRange {
  from: string | null; // YYYY-MM-DD
  to: string | null;
}

function inRange(date: string, range: DateRange): boolean {
  const d = date.slice(0, 10);
  if (range.from && d < range.from) return false;
  if (range.to && d > range.to) return false;
  return true;
}

/**
 * FERRAMENTA GERENCIAL. Não é sistema contábil nem fiscal.
 * Resultado (competência: data do pedido) e fluxo de caixa (data do dinheiro) ficam separados.
 */
export function summarize(orders: Order[], expenses: Expense[], range: DateRange) {
  const confirmed = orders.filter(
    (o) => o.commercialStatus === "confirmado" && inRange(o.createdAt, range),
  );

  let sales = 0;
  let costs = 0;
  let missingCost = false;
  for (const o of confirmed) {
    const p = orderProfit(o);
    sales += p.revenue - o.shipping;
    costs += p.cost;
    if (p.missingCost) missingCost = true;
  }
  const grossProfit = sales - costs;
  const operatingExpenses = expenses
    .filter((e) => e.kind === "despesa" && inRange(e.date, range))
    .reduce((s, e) => s + e.amount, 0);

  const receipts = orders
    .flatMap((o) => o.payments)
    .filter((p) => inRange(p.date, range))
    .reduce((s, p) => s + (p.kind === "pagamento" ? p.amount : -p.amount), 0);
  const outflows = expenses.filter((e) => inRange(e.date, range)).reduce((s, e) => s + e.amount, 0);

  return {
    result: {
      orders: confirmed.length,
      sales: round2(sales),
      costs: round2(costs),
      grossProfit: round2(grossProfit),
      operatingExpenses: round2(operatingExpenses),
      operatingResult: round2(grossProfit - operatingExpenses),
      missingCost,
    },
    cash: {
      receipts: round2(receipts),
      outflows: round2(outflows),
      balance: round2(receipts - outflows),
    },
  };
}

export function monthRange(offset = 0): DateRange {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { from: iso(start), to: iso(end) };
}
