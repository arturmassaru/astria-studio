import type {
  CartItem,
  Customer,
  CustomProject,
  DeliveryMode,
  Expense,
  LossReason,
  Material,
  MaterialMovement,
  MaterialMovementType,
  Order,
  OrderItem,
  Payment,
  ProductionStatus,
  RequestCustomer,
  RequestItem,
  RequestRecord,
  StepKey,
  StepState,
  StockMovement,
} from "@/types";
import { readCol, writeCol } from "../store/core";
import { cols } from "../store/collections";
import { normalizeWhatsapp, round2, uid } from "../utils";
import { derivePaymentStatus, orderCode, orderProfit, productionBlockers, stockNeeds } from "./orders";

export type Result<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}
function fail<T = undefined>(error: string): Result<T> {
  return { ok: false, error };
}
const nowISO = () => new Date().toISOString();

/* ------------------------------------------------------------------ */
/* Solicitações (loja pública)                                         */
/* ------------------------------------------------------------------ */

function requestCode(existing: RequestRecord[]): string {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  let code = "";
  do {
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    code = `AST-${stamp}-${rand}`;
  } while (existing.some((r) => r.id === code));
  return code;
}

/** Solicitação não é venda: não consome estoque, não fatura, não libera produção. */
export function submitRequest(input: {
  customer: RequestCustomer;
  items: CartItem[];
  project: CustomProject | null;
}): RequestRecord {
  const existing = readCol(cols.requests);
  const items: RequestItem[] = input.items.map((i) => ({
    name: i.name,
    kind: i.kind,
    refId: i.refId,
    slug: i.slug,
    variantLabel: i.variantLabel,
    unitPrice: i.unitPrice,
    listPrice: i.listPrice,
    quantity: i.quantity,
    customization: i.customization,
    notes: i.notes,
  }));
  const record: RequestRecord = {
    id: requestCode(existing),
    createdAt: nowISO(),
    status: "nova",
    type: input.project ? "sob_medida" : "carrinho",
    customer: input.customer,
    items,
    estimatedTotal: round2(items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)),
    project: input.project,
    orderId: null,
    internalNotes: "",
  };
  writeCol(cols.requests, (prev) => [record, ...prev]);
  return record;
}

export function setRequestStatus(id: string, status: RequestRecord["status"]): void {
  writeCol(cols.requests, (prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
}

export function setRequestNotes(id: string, internalNotes: string): void {
  writeCol(cols.requests, (prev) => prev.map((r) => (r.id === id ? { ...r, internalNotes } : r)));
}

/* ------------------------------------------------------------------ */
/* Confirmação comercial: solicitação → pedido oficial                 */
/* ------------------------------------------------------------------ */

function upsertCustomer(c: RequestCustomer): Customer {
  const customers = readCol(cols.customers);
  const key = normalizeWhatsapp(c.whatsapp);
  const found = customers.find((x) => normalizeWhatsapp(x.whatsapp) === key);
  if (found) return found;
  const created: Customer = {
    id: uid("cus"),
    name: c.name,
    whatsapp: key,
    city: c.city,
    state: c.state,
    notes: c.notes,
    cpf: "",
    address: "",
    createdAt: nowISO(),
  };
  writeCol(cols.customers, (prev) => [...prev, created]);
  return created;
}

function toOrderItem(item: RequestItem): OrderItem {
  const products = readCol(cols.products);
  const kits = readCol(cols.kits);
  const base = {
    id: uid("oi"),
    kind: item.kind,
    refId: item.refId,
    name: item.name,
    variantLabel: item.variantLabel,
    unitPrice: item.unitPrice,
    listPrice: item.listPrice,
    quantity: item.quantity,
    discount: round2(Math.max(0, item.listPrice - item.unitPrice) * item.quantity),
    customization: item.customization,
    notes: item.notes,
  };

  if (item.kind === "kit") {
    const kit = kits.find((k) => k.id === item.refId);
    const components = (kit?.items ?? []).map((ki) => ({
      productId: ki.productId,
      name: products.find((p) => p.id === ki.productId)?.name ?? ki.productId,
      quantity: ki.quantity,
    }));
    const costs = (kit?.items ?? []).map((ki) => {
      const p = products.find((x) => x.id === ki.productId);
      return p && p.costEstimate !== null ? p.costEstimate * ki.quantity : null;
    });
    const costSnapshot = costs.length > 0 && costs.every((c) => c !== null)
      ? round2((costs as number[]).reduce((a, b) => a + b, 0))
      : null;
    return { ...base, costSnapshot, components };
  }

  const product = products.find((p) => p.id === item.refId);
  const variant = product?.variants.find((v) => v.label === item.variantLabel);
  const costSnapshot = variant?.cost ?? product?.costEstimate ?? null;
  return {
    ...base,
    costSnapshot,
    components: product ? [{ productId: product.id, name: product.name, quantity: 1 }] : [],
  };
}

export function confirmRequest(
  requestId: string,
  opts: { customPrice?: number; deadline?: string | null; deliveryMode?: DeliveryMode } = {},
): Result<Order> {
  const request = readCol(cols.requests).find((r) => r.id === requestId);
  if (!request) return fail("Solicitação não encontrada.");
  if (request.status === "convertida") return fail("Esta solicitação já virou pedido.");
  if (request.status === "cancelada") return fail("Esta solicitação foi cancelada.");

  let items: OrderItem[];
  if (request.type === "sob_medida") {
    if (!opts.customPrice || opts.customPrice <= 0) {
      return fail("Informe o preço combinado do projeto sob medida.");
    }
    const p = request.project;
    items = [
      {
        id: uid("oi"),
        kind: "product",
        refId: "sob-medida",
        name: `Projeto sob medida: ${p?.idea ?? "sem título"}`,
        variantLabel: null,
        unitPrice: opts.customPrice,
        listPrice: opts.customPrice,
        costSnapshot: null,
        quantity: 1,
        discount: 0,
        customization: [],
        notes: p?.description ?? "",
        components: [],
      },
    ];
  } else {
    items = request.items.map(toOrderItem);
  }

  const customer = upsertCustomer(request.customer);
  const orders = readCol(cols.orders);
  const total = round2(items.reduce((s, i) => s + i.unitPrice * i.quantity, 0));

  const order: Order = {
    id: uid("ord"),
    code: orderCode(orders),
    createdAt: nowISO(),
    requestId: request.id,
    customerId: customer.id,
    customerSnapshot: {
      name: request.customer.name,
      whatsapp: customer.whatsapp,
      city: request.customer.city,
      state: request.customer.state,
    },
    items,
    orderDiscount: 0,
    shipping: 0,
    total,
    commercialStatus: "confirmado",
    paymentStatus: "pendente",
    productionStatus: "aguardando_producao",
    deliveryStatus: "aguardando",
    deliveryMode: opts.deliveryMode ?? "retirada",
    carrier: "",
    tracking: "",
    deadline: opts.deadline ?? null,
    payments: [],
    productionSteps: {
      impressao: "pendente",
      pintura: "pendente",
      montagem: "pendente",
      acabamento: "pendente",
      embalagem: "pendente",
    },
    productionException: null,
    materialsConsumed: false,
    stockApplied: null,
    distribution: null,
    notes: "",
  };

  writeCol(cols.orders, (prev) => [order, ...prev]);
  writeCol(cols.requests, (prev) =>
    prev.map((r) => (r.id === request.id ? { ...r, status: "convertida", orderId: order.id } : r)),
  );
  applyStock(order.id);
  return ok(order);
}

/* ------------------------------------------------------------------ */
/* Pedido                                                              */
/* ------------------------------------------------------------------ */

function patchOrder(orderId: string, fn: (o: Order) => Order): void {
  writeCol(cols.orders, (prev) => prev.map((o) => (o.id === orderId ? fn(o) : o)));
}

function findOrder(orderId: string): Order | undefined {
  return readCol(cols.orders).find((o) => o.id === orderId);
}

export function updateOrder(
  orderId: string,
  patch: Partial<
    Pick<Order, "deliveryMode" | "carrier" | "tracking" | "deadline" | "notes" | "shipping" | "orderDiscount" | "deliveryStatus">
  >,
): void {
  patchOrder(orderId, (o) => {
    const next = { ...o, ...patch };
    const itemsTotal = round2(next.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0));
    next.total = round2(itemsTotal - next.orderDiscount + next.shipping);
    next.paymentStatus = derivePaymentStatus(next.total, next.payments);
    return next;
  });
}

/** Pedido confirmado reduz estoque de produto pronto; cancelar gera movimento reverso. */
export function applyStock(orderId: string): void {
  const order = findOrder(orderId);
  if (!order || order.stockApplied) return;
  const needs = stockNeeds(order);
  const products = readCol(cols.products);
  const applied: { productId: string; quantity: number }[] = [];
  const moves: StockMovement[] = [];
  const next = products.map((p) => {
    const need = needs.find((n) => n.productId === p.id);
    if (!need || !p.trackStock) return p;
    applied.push(need);
    moves.push({
      id: uid("sm"),
      productId: p.id,
      type: "saida_pedido",
      quantity: -need.quantity,
      orderId,
      date: nowISO(),
      note: `Pedido ${order.code}`,
    });
    return { ...p, stockQty: p.stockQty - need.quantity };
  });
  if (applied.length > 0) {
    writeCol(cols.products, next);
    writeCol(cols.stockMoves, (prev) => [...moves, ...prev]);
  }
  patchOrder(orderId, (o) => ({ ...o, stockApplied: applied }));
}

export function reverseStock(orderId: string): void {
  const order = findOrder(orderId);
  if (!order || !order.stockApplied) return;
  const applied = order.stockApplied;
  if (applied.length > 0) {
    writeCol(cols.products, (prev) =>
      prev.map((p) => {
        const a = applied.find((x) => x.productId === p.id);
        return a ? { ...p, stockQty: p.stockQty + a.quantity } : p;
      }),
    );
    writeCol(cols.stockMoves, (prev) => [
      ...applied.map<StockMovement>((a) => ({
        id: uid("sm"),
        productId: a.productId,
        type: "estorno_cancelamento",
        quantity: a.quantity,
        orderId,
        date: nowISO(),
        note: `Estorno do pedido ${order.code}`,
      })),
      ...prev,
    ]);
  }
  patchOrder(orderId, (o) => ({ ...o, stockApplied: null }));
}

export function setCommercialStatus(orderId: string, status: Order["commercialStatus"]): void {
  patchOrder(orderId, (o) => ({ ...o, commercialStatus: status }));
  if (status === "confirmado") applyStock(orderId);
  else reverseStock(orderId);
}

/* Pagamento (registro manual) */

export function addPayment(
  orderId: string,
  input: Omit<Payment, "id">,
): Result {
  if (!(input.amount > 0)) return fail("Informe um valor maior que zero.");
  patchOrder(orderId, (o) => {
    const payments = [...o.payments, { ...input, id: uid("pay") }];
    return { ...o, payments, paymentStatus: derivePaymentStatus(o.total, payments) };
  });
  return ok(undefined);
}

export function removePayment(orderId: string, paymentId: string): void {
  patchOrder(orderId, (o) => {
    const payments = o.payments.filter((p) => p.id !== paymentId);
    return { ...o, payments, paymentStatus: derivePaymentStatus(o.total, payments) };
  });
}

/* Produção */

export function setProductionStatus(orderId: string, status: ProductionStatus): Result {
  const order = findOrder(orderId);
  if (!order) return fail("Pedido não encontrado.");
  if (status !== "aguardando_producao") {
    if (order.commercialStatus !== "confirmado") return fail("O pedido precisa estar confirmado.");
    const blockers = productionBlockers(order);
    if (blockers.length > 0 && !order.productionException) {
      return fail(
        `Produção bloqueada: ${blockers.join(", ")}. Autorize uma exceção (responsável e motivo) para liberar.`,
      );
    }
  }
  patchOrder(orderId, (o) => ({ ...o, productionStatus: status }));
  if (status === "pronto") consumeMaterials(orderId);
  return ok(undefined);
}

export function authorizeProductionException(
  orderId: string,
  by: string,
  reason: string,
): Result {
  if (!by.trim() || !reason.trim()) return fail("Informe o responsável e o motivo.");
  patchOrder(orderId, (o) => ({
    ...o,
    productionException: { by: by.trim(), reason: reason.trim(), date: nowISO() },
  }));
  return ok(undefined);
}

export function revokeProductionException(orderId: string): void {
  patchOrder(orderId, (o) => ({ ...o, productionException: null }));
}

export function setStep(orderId: string, step: StepKey, state: StepState): void {
  patchOrder(orderId, (o) => ({ ...o, productionSteps: { ...o.productionSteps, [step]: state } }));
}

export function setDeliveryStatus(orderId: string, status: Order["deliveryStatus"]): void {
  patchOrder(orderId, (o) => ({ ...o, deliveryStatus: status }));
}

/** Produção concluída pode consumir materiais (uma única vez por pedido). */
function consumeMaterials(orderId: string): void {
  const order = findOrder(orderId);
  if (!order || order.materialsConsumed) return;
  const products = readCol(cols.products);
  const usage = new Map<string, number>();
  for (const need of stockNeeds(order)) {
    const p = products.find((x) => x.id === need.productId);
    p?.materials.forEach((m) => {
      usage.set(m.materialId, (usage.get(m.materialId) ?? 0) + m.quantity * need.quantity);
    });
  }
  if (usage.size > 0) {
    const moves: MaterialMovement[] = [...usage.entries()].map(([materialId, quantity]) => ({
      id: uid("mm"),
      materialId,
      type: "consumo",
      quantity,
      direction: -1,
      totalCost: null,
      unitCost: null,
      lossReason: null,
      orderId,
      date: nowISO(),
      note: `Consumo do pedido ${order.code}`,
    }));
    writeCol(cols.materialMoves, (prev) => [...moves, ...prev]);
    writeCol(cols.materials, (prev) =>
      prev.map((m) => {
        const q = usage.get(m.id);
        return q ? { ...m, stock: round2(m.stock - q) } : m;
      }),
    );
  }
  patchOrder(orderId, (o) => ({ ...o, materialsConsumed: true }));
}

/* Distribuição do resultado (snapshot histórico) */

export function saveDistribution(
  orderId: string,
  participants: { name: string; percent: number }[],
): Result {
  const order = findOrder(orderId);
  if (!order) return fail("Pedido não encontrado.");
  const clean = participants.filter((p) => p.name.trim() && p.percent > 0);
  if (clean.length === 0) return fail("Informe ao menos um participante.");
  const sum = round2(clean.reduce((s, p) => s + p.percent, 0));
  if (Math.abs(sum - 100) > 0.01) return fail(`Os percentuais somam ${sum}%. O total deve ser 100%.`);
  const basis = orderProfit(order).profit;
  patchOrder(orderId, (o) => ({
    ...o,
    distribution: {
      at: nowISO(),
      basis,
      participants: clean.map((p) => ({
        name: p.name.trim(),
        percent: p.percent,
        amount: round2((basis * p.percent) / 100),
      })),
    },
  }));
  return ok(undefined);
}

/* ------------------------------------------------------------------ */
/* Estoque de produtos acabados                                        */
/* ------------------------------------------------------------------ */

export function registerStockMovement(
  productId: string,
  type: "entrada" | "ajuste",
  quantity: number,
  note: string,
): Result {
  if (!quantity) return fail("Informe a quantidade.");
  const product = readCol(cols.products).find((p) => p.id === productId);
  if (!product) return fail("Produto não encontrado.");
  if (!product.trackStock) return fail("Ative o controle de estoque neste produto antes.");
  writeCol(cols.products, (prev) =>
    prev.map((p) => (p.id === productId ? { ...p, stockQty: p.stockQty + quantity } : p)),
  );
  writeCol(cols.stockMoves, (prev) => [
    { id: uid("sm"), productId, type, quantity, orderId: null, date: nowISO(), note },
    ...prev,
  ]);
  return ok(undefined);
}

/* ------------------------------------------------------------------ */
/* Materiais                                                           */
/* ------------------------------------------------------------------ */

export function registerMaterialMovement(input: {
  materialId: string;
  type: MaterialMovementType;
  quantity: number;
  direction?: 1 | -1;
  totalCost?: number | null;
  lossReason?: LossReason | null;
  note?: string;
}): Result {
  const material = readCol(cols.materials).find((m) => m.id === input.materialId);
  if (!material) return fail("Material não encontrado.");
  if (!(input.quantity > 0)) return fail("Informe uma quantidade maior que zero.");

  let direction: 1 | -1 = -1;
  let unitCost: number | null = null;
  let totalCost: number | null = null;

  if (input.type === "compra") {
    if (input.totalCost === null || input.totalCost === undefined || input.totalCost < 0) {
      return fail("Informe o valor total pago na compra.");
    }
    direction = 1;
    totalCost = round2(input.totalCost);
    unitCost = input.totalCost / input.quantity;
  } else if (input.type === "perda") {
    if (!input.lossReason) return fail("Informe o motivo da perda.");
  } else if (input.type === "ajuste") {
    direction = input.direction ?? 1;
  }

  const move: MaterialMovement = {
    id: uid("mm"),
    materialId: material.id,
    type: input.type,
    quantity: input.quantity,
    direction,
    totalCost,
    unitCost,
    lossReason: input.type === "perda" ? (input.lossReason ?? null) : null,
    orderId: null,
    date: nowISO(),
    note: input.note ?? "",
  };

  writeCol(cols.materialMoves, (prev) => [move, ...prev]);
  writeCol(cols.materials, (prev) =>
    prev.map<Material>((m) =>
      m.id === material.id
        ? {
            ...m,
            stock: round2(m.stock + direction * input.quantity),
            unitCost: unitCost !== null ? unitCost : m.unitCost,
          }
        : m,
    ),
  );

  // Compra é saída de caixa (e custo), nunca produto acabado.
  if (input.type === "compra" && totalCost !== null) {
    const expense: Expense = {
      id: uid("exp"),
      date: nowISO().slice(0, 10),
      description: `Compra de ${material.name}`,
      category: "material",
      kind: "custo",
      amount: totalCost,
    };
    writeCol(cols.expenses, (prev) => [expense, ...prev]);
  }
  return ok(undefined);
}
