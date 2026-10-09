"use client";

import { useState } from "react";
import type {
  CommercialStatus,
  DeliveryMode,
  DeliveryStatus,
  Order,
  PaymentMethod,
  ProductionStatus,
  StepKey,
  StepState,
} from "@/types";
import { Button } from "@/components/ui/Button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/fields";
import { Notice } from "@/components/ui/primitives";
import {
  addPayment,
  authorizeProductionException,
  removePayment,
  revokeProductionException,
  saveDistribution,
  setCommercialStatus,
  setDeliveryStatus,
  setProductionStatus,
  setStep,
  updateOrder,
} from "@/lib/domain/actions";
import { netPaid, orderProfit, productionBlockers } from "@/lib/domain/orders";
import { dateBR, dateTimeBR, formatWhatsapp, money, todayISO } from "@/lib/format";
import {
  COMMERCIAL_LABELS,
  COMMERCIAL_TONES,
  DELIVERY_MODE_LABELS,
  DELIVERY_STATUS_LABELS,
  METHOD_LABELS,
  PAYMENT_LABELS,
  PAYMENT_TONES,
  PRODUCTION_LABELS,
  PRODUCTION_TONES,
  STEP_KEYS,
  STEP_LABELS,
  STEP_STATE_LABELS,
  toOptions,
} from "@/lib/labels";
import { cols } from "@/lib/store/collections";
import { useCol } from "@/lib/store/core";
import { useAccess } from "./role";
import { FormError, Panel, Pill, Table, Td, Th } from "./ui";

function Select<V extends string>({
  id,
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  value: V;
  options: { value: V; label: string }[];
  onChange: (v: V) => void;
  disabled?: boolean;
}) {
  return (
    <SelectField id={id} label={label} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value as V)}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </SelectField>
  );
}

export function OrderDetail({ orderId }: { orderId: string }) {
  const [orders] = useCol(cols.orders);
  const [settings] = useCol(cols.settings);
  const { canWrite } = useAccess("pedidos");
  const { canRead: canSeeFinance } = useAccess("financeiro");
  const order = orders.find((o) => o.id === orderId);

  const [prodError, setProdError] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const [excBy, setExcBy] = useState("");
  const [excReason, setExcReason] = useState("");
  const [excError, setExcError] = useState<string | null>(null);
  const [pay, setPay] = useState({
    date: todayISO(),
    method: "pix" as PaymentMethod,
    amount: "",
    kind: "pagamento" as "pagamento" | "estorno",
    note: "",
  });
  const [fees, setFees] = useState<{ shipping: string; discount: string } | null>(null);
  const [parts, setParts] = useState<{ name: string; percent: number }[] | null>(null);
  const [distError, setDistError] = useState<string | null>(null);

  if (!order) return <p className="text-sm text-muted">Pedido não encontrado.</p>;

  const blockers = productionBlockers(order);
  const profit = orderProfit(order);
  const paid = netPaid(order);
  const feeState = fees ?? { shipping: String(order.shipping), discount: String(order.orderDiscount) };
  const partsState = parts ?? (order.distribution
    ? order.distribution.participants.map((p) => ({ name: p.name, percent: p.percent }))
    : settings.participants.length > 0
      ? settings.participants
      : [{ name: "", percent: 100 }]);
  const partsSum = partsState.reduce((s, p) => s + p.percent, 0);

  function changeProduction(v: ProductionStatus) {
    const res = setProductionStatus(order!.id, v);
    setProdError(res.ok ? null : res.error);
  }

  function submitPayment(e: React.FormEvent) {
    e.preventDefault();
    const res = addPayment(order!.id, {
      date: pay.date,
      method: pay.method,
      amount: Number(pay.amount),
      kind: pay.kind,
      note: pay.note,
    });
    if (!res.ok) return setPayError(res.error);
    setPayError(null);
    setPay({ ...pay, amount: "", note: "" });
  }

  function submitException(e: React.FormEvent) {
    e.preventDefault();
    const res = authorizeProductionException(order!.id, excBy, excReason);
    if (!res.ok) return setExcError(res.error);
    setExcError(null);
    setExcBy("");
    setExcReason("");
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-medium">{order.customerSnapshot.name}</p>
          <p className="text-sm text-muted">
            {formatWhatsapp(order.customerSnapshot.whatsapp)} · {order.customerSnapshot.city}/{order.customerSnapshot.state}
          </p>
          <p className="mt-1 text-xs text-muted">
            Criado em {dateTimeBR(order.createdAt)}
            {order.requestId ? ` · a partir da solicitação ${order.requestId}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Pill tone={COMMERCIAL_TONES[order.commercialStatus]}>{COMMERCIAL_LABELS[order.commercialStatus]}</Pill>
          <Pill tone={PAYMENT_TONES[order.paymentStatus]}>Pagamento: {PAYMENT_LABELS[order.paymentStatus]}</Pill>
          <Pill tone={PRODUCTION_TONES[order.productionStatus]}>{PRODUCTION_LABELS[order.productionStatus]}</Pill>
        </div>
      </header>

      <Panel title="Status" description="Os status comercial, de pagamento, de produção e de entrega são independentes.">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Select<CommercialStatus>
            id="od-com"
            label="Comercial"
            value={order.commercialStatus}
            disabled={!canWrite}
            options={toOptions(COMMERCIAL_LABELS)}
            onChange={(v) => setCommercialStatus(order.id, v)}
          />
          <div>
            <p className="mb-1.5 text-sm font-medium">Pagamento</p>
            <p className="rounded-lg border border-stone bg-sand px-4 py-3 text-[0.95rem]">{PAYMENT_LABELS[order.paymentStatus]}</p>
            <p className="mt-1.5 text-xs text-muted">Calculado pelos lançamentos abaixo.</p>
          </div>
          <Select<ProductionStatus>
            id="od-prod"
            label="Produção"
            value={order.productionStatus}
            disabled={!canWrite}
            options={toOptions(PRODUCTION_LABELS)}
            onChange={changeProduction}
          />
          <Select<DeliveryStatus>
            id="od-ent"
            label="Entrega"
            value={order.deliveryStatus}
            disabled={!canWrite}
            options={toOptions(DELIVERY_STATUS_LABELS)}
            onChange={(v) => setDeliveryStatus(order.id, v)}
          />
        </div>
        <div className="mt-4">
          <FormError message={prodError} />
        </div>
        {order.commercialStatus === "cancelado" ? (
          <Notice tone="warn" className="mt-4">
            Pedido cancelado: o estoque de produtos controlados foi estornado. Se houve pagamento, registre
            o estorno em Pagamentos.
          </Notice>
        ) : null}
      </Panel>

      <Panel title="Itens">
        <Table caption="Itens do pedido (snapshot histórico)">
          <thead>
            <tr>
              <Th>Item</Th>
              <Th>Qtd.</Th>
              <Th>Unitário</Th>
              <Th>Desconto</Th>
              <Th>Total</Th>
              {canSeeFinance ? <Th>Custo est.</Th> : null}
            </tr>
          </thead>
          <tbody>
            {order.items.map((i) => (
              <tr key={i.id}>
                <Td>
                  <span className="font-medium">{i.name}</span>
                  {i.variantLabel ? <span className="block text-xs text-muted">{i.variantLabel}</span> : null}
                  {i.customization.map((c) => (
                    <span key={c.fieldId} className="block text-xs text-muted">
                      {c.label}: {c.value}
                    </span>
                  ))}
                  {i.notes ? <span className="block text-xs text-muted">Obs.: {i.notes}</span> : null}
                </Td>
                <Td>{i.quantity}</Td>
                <Td className="tabular-nums">{money(i.unitPrice)}</Td>
                <Td className="tabular-nums">{i.discount > 0 ? money(i.discount) : "—"}</Td>
                <Td className="tabular-nums">{money(i.unitPrice * i.quantity)}</Td>
                {canSeeFinance ? (
                  <Td className="tabular-nums">{i.costSnapshot !== null ? money(i.costSnapshot * i.quantity) : "—"}</Td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </Table>
        <p className="mt-3 text-xs text-muted">
          Valores e custos são um retrato do momento do pedido: alterar o produto depois não muda pedidos antigos.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          <TextField
            id="od-frete"
            label="Frete (R$)"
            type="number"
            step="0.01"
            disabled={!canWrite}
            value={feeState.shipping}
            onChange={(e) => setFees({ ...feeState, shipping: e.target.value })}
          />
          <TextField
            id="od-desc"
            label="Desconto no pedido (R$)"
            type="number"
            step="0.01"
            disabled={!canWrite}
            value={feeState.discount}
            onChange={(e) => setFees({ ...feeState, discount: e.target.value })}
          />
          <div className="flex items-end">
            <Button
              variant="outline"
              disabled={!canWrite || fees === null}
              onClick={() => {
                updateOrder(order.id, { shipping: Number(feeState.shipping || 0), orderDiscount: Number(feeState.discount || 0) });
                setFees(null);
              }}
            >
              Aplicar
            </Button>
          </div>
        </div>
        <p className="mt-4 text-right text-lg font-medium">Total: {money(order.total)}</p>
        {canSeeFinance ? (
          <p className="text-right text-xs text-muted">
            Lucro estimado: {money(profit.profit)}
            {profit.missingCost ? " (há itens sem custo informado)" : ""}
          </p>
        ) : null}
      </Panel>

      <Panel title="Pagamentos" description="Registro manual: Pix, dinheiro, cartão, link, transferência ou outro. Pagamentos parciais são aceitos.">
        <p className="mb-4 text-sm">
          Pago (líquido): <strong>{money(paid)}</strong> · Saldo: <strong>{money(Math.max(0, order.total - paid))}</strong>
        </p>
        {order.payments.length > 0 ? (
          <Table caption="Lançamentos de pagamento">
            <thead>
              <tr>
                <Th>Data</Th>
                <Th>Forma</Th>
                <Th>Tipo</Th>
                <Th>Valor</Th>
                <Th>Obs.</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {order.payments.map((p) => (
                <tr key={p.id}>
                  <Td>{dateBR(p.date)}</Td>
                  <Td>{METHOD_LABELS[p.method]}</Td>
                  <Td>{p.kind === "pagamento" ? "Pagamento" : "Estorno"}</Td>
                  <Td className="tabular-nums">{p.kind === "estorno" ? `- ${money(p.amount)}` : money(p.amount)}</Td>
                  <Td className="text-muted">{p.note || "—"}</Td>
                  <Td className="text-right">
                    {canWrite ? (
                      <Button variant="ghost" onClick={() => removePayment(order.id, p.id)}>
                        Remover
                      </Button>
                    ) : null}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : null}
        {canWrite ? (
          <form onSubmit={submitPayment} noValidate className="mt-5 grid gap-4 sm:grid-cols-5">
            <TextField id="pay-data" label="Data" type="date" value={pay.date} onChange={(e) => setPay({ ...pay, date: e.target.value })} />
            <Select<PaymentMethod>
              id="pay-forma"
              label="Forma"
              value={pay.method}
              options={toOptions(METHOD_LABELS)}
              onChange={(v) => setPay({ ...pay, method: v })}
            />
            <Select<"pagamento" | "estorno">
              id="pay-tipo"
              label="Tipo"
              value={pay.kind}
              options={[
                { value: "pagamento", label: "Pagamento" },
                { value: "estorno", label: "Estorno" },
              ]}
              onChange={(v) => setPay({ ...pay, kind: v })}
            />
            <TextField id="pay-valor" label="Valor (R$)" type="number" step="0.01" value={pay.amount} onChange={(e) => setPay({ ...pay, amount: e.target.value })} />
            <div className="flex items-end">
              <Button type="submit">Registrar</Button>
            </div>
            <div className="sm:col-span-5">
              <TextField id="pay-obs" label="Observação" value={pay.note} onChange={(e) => setPay({ ...pay, note: e.target.value })} />
            </div>
          </form>
        ) : null}
        <div className="mt-3">
          <FormError message={payError} />
        </div>
      </Panel>

      <Panel title="Produção" description="Fluxo padrão: pedido confirmado + pagamento integral + prazo definido. Exceções exigem responsável e motivo.">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="od-prazo"
            label="Prazo de entrega"
            type="date"
            disabled={!canWrite}
            value={order.deadline ?? ""}
            onChange={(e) => updateOrder(order.id, { deadline: e.target.value || null })}
          />
          <div>
            <p className="mb-1.5 text-sm font-medium">Liberação</p>
            {blockers.length === 0 ? (
              <Pill tone="ok">Liberado pelo fluxo padrão</Pill>
            ) : order.productionException ? (
              <Pill tone="gold">Liberado por exceção</Pill>
            ) : (
              <Pill tone="warn">Bloqueado: {blockers.join(", ")}</Pill>
            )}
          </div>
        </div>

        {order.productionException ? (
          <div className="mt-4 rounded-lg bg-gold-soft/60 p-4 text-sm">
            <p>
              Exceção autorizada por <strong>{order.productionException.by}</strong> em{" "}
              {dateTimeBR(order.productionException.date)}.
            </p>
            <p className="mt-1">Motivo: {order.productionException.reason}</p>
            {canWrite ? (
              <Button variant="ghost" className="mt-2" onClick={() => revokeProductionException(order.id)}>
                Revogar exceção
              </Button>
            ) : null}
          </div>
        ) : blockers.length > 0 && canWrite ? (
          <form onSubmit={submitException} noValidate className="mt-4 grid gap-4 rounded-lg border border-stone p-4 sm:grid-cols-[1fr_2fr_auto]">
            <TextField id="exc-resp" label="Responsável" value={excBy} onChange={(e) => setExcBy(e.target.value)} />
            <TextField id="exc-motivo" label="Motivo da exceção" value={excReason} onChange={(e) => setExcReason(e.target.value)} />
            <div className="flex items-end">
              <Button type="submit" variant="outline">
                Autorizar exceção
              </Button>
            </div>
            <div className="sm:col-span-3">
              <FormError message={excError} />
            </div>
          </form>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {STEP_KEYS.map((k) => (
            <Select<StepState>
              key={k}
              id={`step-${k}`}
              label={STEP_LABELS[k as StepKey]}
              value={order.productionSteps[k]}
              disabled={!canWrite}
              options={toOptions(STEP_STATE_LABELS)}
              onChange={(v) => setStep(order.id, k, v)}
            />
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">Produtos simples podem pular etapas (Não se aplica). Ao marcar Pronto, os materiais cadastrados nos produtos são consumidos uma única vez.</p>
      </Panel>

      <Panel title="Entrega">
        <div className="grid gap-5 sm:grid-cols-3">
          <Select<DeliveryMode>
            id="ent-modo"
            label="Modalidade"
            value={order.deliveryMode}
            disabled={!canWrite}
            options={toOptions(DELIVERY_MODE_LABELS)}
            onChange={(v) => updateOrder(order.id, { deliveryMode: v })}
          />
          <TextField id="ent-transp" label="Transportadora" disabled={!canWrite} value={order.carrier} onChange={(e) => updateOrder(order.id, { carrier: e.target.value })} />
          <TextField id="ent-rastreio" label="Rastreamento" disabled={!canWrite} value={order.tracking} onChange={(e) => updateOrder(order.id, { tracking: e.target.value })} />
        </div>
      </Panel>

      {canSeeFinance ? (
        <Panel
          title="Distribuição do resultado"
          description="Divide o lucro estimado do pedido entre participantes. Os percentuais devem somar 100% e o resultado fica salvo como snapshot histórico."
        >
          <p className="mb-4 text-sm">
            Base (lucro estimado): <strong>{money(profit.profit)}</strong>
          </p>
          <div className="space-y-3">
            {partsState.map((p, i) => (
              <div key={i} className="grid grid-cols-[1fr_7rem_auto] items-end gap-3">
                <TextField
                  id={`dist-n-${i}`}
                  label="Participante"
                  disabled={!canWrite}
                  value={p.name}
                  onChange={(e) => setParts(partsState.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                />
                <TextField
                  id={`dist-p-${i}`}
                  label="%"
                  type="number"
                  step="0.01"
                  disabled={!canWrite}
                  value={p.percent}
                  onChange={(e) => setParts(partsState.map((x, j) => (j === i ? { ...x, percent: Number(e.target.value || 0) } : x)))}
                />
                <Button variant="ghost" disabled={!canWrite} onClick={() => setParts(partsState.filter((_, j) => j !== i))}>
                  Remover
                </Button>
              </div>
            ))}
          </div>
          <p className={`mt-3 text-sm ${Math.abs(partsSum - 100) > 0.01 ? "text-red-800" : "text-muted"}`}>
            Soma: {partsSum.toLocaleString("pt-BR")}%
          </p>
          {canWrite ? (
            <div className="mt-3 flex gap-3">
              <Button variant="outline" onClick={() => setParts([...partsState, { name: "", percent: 0 }])}>
                Adicionar participante
              </Button>
              <Button
                onClick={() => {
                  const res = saveDistribution(order.id, partsState);
                  setDistError(res.ok ? null : res.error);
                  if (res.ok) setParts(null);
                }}
              >
                Salvar distribuição
              </Button>
            </div>
          ) : null}
          <div className="mt-3">
            <FormError message={distError} />
          </div>
          {order.distribution ? (
            <p className="mt-4 text-xs text-muted">
              Salvo em {dateTimeBR(order.distribution.at)} com base de {money(order.distribution.basis)}:{" "}
              {order.distribution.participants.map((p) => `${p.name} ${p.percent}% (${money(p.amount)})`).join(" · ")}
            </p>
          ) : null}
        </Panel>
      ) : null}

      <TextAreaField
        id="od-notas"
        label="Notas internas"
        rows={3}
        disabled={!canWrite}
        value={order.notes}
        onChange={(e) => updateOrder(order.id, { notes: e.target.value })}
      />
    </div>
  );
}

export type { Order };
