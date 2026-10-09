"use client";

import { useState } from "react";
import { useAccess } from "@/components/admin/role";
import { AdminPage, EmptyState, FormError, Pill } from "@/components/admin/ui";
import { SelectField } from "@/components/ui/fields";
import { setProductionStatus, setStep } from "@/lib/domain/actions";
import { productionBlockers } from "@/lib/domain/orders";
import { dateBR } from "@/lib/format";
import { PRODUCTION_LABELS, STEP_KEYS, STEP_LABELS, STEP_STATE_LABELS, toOptions } from "@/lib/labels";
import { cols } from "@/lib/store/collections";
import { useCol } from "@/lib/store/core";
import type { Order, ProductionStatus, StepKey, StepState } from "@/types";

const COLUMNS: ProductionStatus[] = ["aguardando_producao", "em_producao", "em_acabamento", "pronto"];

function Card({ order, canWrite }: { order: Order; canWrite: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const blockers = productionBlockers(order);
  const done = STEP_KEYS.filter((k) => order.productionSteps[k] !== "pendente").length;

  return (
    <article className="rounded-xl border border-stone bg-white p-4 text-sm">
      <header className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium tabular-nums">{order.code}</p>
          <p className="text-muted">{order.customerSnapshot.name}</p>
        </div>
        <p className="text-xs text-muted">{order.deadline ? `Prazo ${dateBR(order.deadline)}` : "Sem prazo"}</p>
      </header>
      <ul className="mt-3 space-y-0.5 text-xs text-muted">
        {order.items.map((i) => (
          <li key={i.id}>
            {i.quantity}x {i.name}
            {i.variantLabel ? ` (${i.variantLabel})` : ""}
          </li>
        ))}
      </ul>
      <div className="mt-3">
        {blockers.length === 0 ? (
          <Pill tone="ok">Liberado</Pill>
        ) : order.productionException ? (
          <Pill tone="gold">Exceção autorizada</Pill>
        ) : (
          <Pill tone="warn">Bloqueado: {blockers.join(", ")}</Pill>
        )}
      </div>
      <details className="mt-3">
        <summary className="cursor-pointer text-xs text-muted">
          Etapas ({done}/{STEP_KEYS.length})
        </summary>
        <div className="mt-3 space-y-3">
          {STEP_KEYS.map((k) => (
            <SelectField
              key={k}
              id={`${order.id}-${k}`}
              label={STEP_LABELS[k as StepKey]}
              value={order.productionSteps[k]}
              disabled={!canWrite}
              onChange={(e) => setStep(order.id, k, e.target.value as StepState)}
            >
              {toOptions(STEP_STATE_LABELS).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </SelectField>
          ))}
        </div>
      </details>
      <div className="mt-4">
        <SelectField
          id={`${order.id}-status`}
          label="Mover para"
          value={order.productionStatus}
          disabled={!canWrite}
          onChange={(e) => {
            const res = setProductionStatus(order.id, e.target.value as ProductionStatus);
            setError(res.ok ? null : res.error);
          }}
        >
          {COLUMNS.map((c) => (
            <option key={c} value={c}>
              {PRODUCTION_LABELS[c]}
            </option>
          ))}
        </SelectField>
      </div>
      <div className="mt-2">
        <FormError message={error} />
      </div>
    </article>
  );
}

export default function ProducaoPage() {
  const [orders] = useCol(cols.orders);
  const { canWrite } = useAccess("producao");

  const active = orders.filter((o) => o.commercialStatus === "confirmado" && o.deliveryStatus === "aguardando");

  return (
    <AdminPage
      module="producao"
      title="Produção"
      description="Fila dos pedidos confirmados. A produção só é liberada com pagamento integral e prazo definido, ou por exceção autorizada com responsável, data e motivo."
    >
      {active.length === 0 ? (
        <EmptyState
          title="Nada na fila de produção"
          text="Pedidos confirmados que ainda não foram enviados ou entregues aparecem aqui."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-4">
          {COLUMNS.map((col) => {
            const list = active.filter((o) => o.productionStatus === col);
            return (
              <section key={col} aria-labelledby={`col-${col}`}>
                <h2 id={`col-${col}`} className="mb-3 flex items-center justify-between font-serif text-lg font-light">
                  {PRODUCTION_LABELS[col]}
                  <span className="text-sm text-muted">{list.length}</span>
                </h2>
                <div className="space-y-4">
                  {list.length === 0 ? <p className="text-xs text-muted">Vazio</p> : null}
                  {list.map((o) => (
                    <Card key={o.id} order={o} canWrite={canWrite} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </AdminPage>
  );
}
