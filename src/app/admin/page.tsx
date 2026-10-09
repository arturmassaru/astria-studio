"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AdminPage, EmptyState, Panel, Pill, Stat } from "@/components/admin/ui";
import { dateBR, money } from "@/lib/format";
import { PAYMENT_LABELS, PAYMENT_TONES } from "@/lib/labels";
import { monthRange, summarize } from "@/lib/domain/finance";
import { cols } from "@/lib/store/collections";
import { useCol } from "@/lib/store/core";

export default function DashboardPage() {
  const [requests] = useCol(cols.requests);
  const [orders] = useCol(cols.orders);
  const [expenses] = useCol(cols.expenses);
  const [materials] = useCol(cols.materials);
  const [products] = useCol(cols.products);

  const newRequests = requests.filter((r) => r.status === "nova");
  const queue = orders.filter((o) => o.commercialStatus === "confirmado" && o.deliveryStatus === "aguardando");
  const awaitingPayment = orders.filter(
    (o) => o.commercialStatus === "confirmado" && o.paymentStatus !== "pago",
  );
  const lowMaterials = materials.filter((m) => m.active && m.stock <= m.minStock);
  const lowProducts = products.filter((p) => p.trackStock && p.stockQty <= 0);
  const month = useMemo(() => summarize(orders, expenses, monthRange(0)), [orders, expenses]);
  const upcoming = [...queue].filter((o) => o.deadline).sort((a, b) => (a.deadline! < b.deadline! ? -1 : 1)).slice(0, 5);

  return (
    <AdminPage
      module="dashboard"
      title="Dashboard"
      description="Visão do que precisa de atenção hoje. Todos os números vêm de registros reais; sem registros, nada é inventado."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Solicitações novas" value={newRequests.length} hint="Aguardando resposta" />
        <Stat label="Na fila de produção" value={queue.length} hint="Pedidos confirmados não entregues" />
        <Stat label="Pagamento pendente" value={awaitingPayment.length} hint="Pedidos confirmados" />
        <Stat label="Vendas do mês" value={money(month.result.sales)} hint={`${month.result.orders} pedido(s)`} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel
          title="Solicitações para responder"
          actions={
            <Link href="/admin/solicitacoes" className="text-sm underline underline-offset-4">
              Ver todas
            </Link>
          }
        >
          {newRequests.length === 0 ? (
            <EmptyState title="Nenhuma solicitação nova" text="Quando alguém pedir conversa pela loja, aparece aqui." />
          ) : (
            <ul className="divide-y divide-stone/60 text-sm">
              {newRequests.slice(0, 5).map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-2">
                  <span>
                    <span className="font-medium tabular-nums">{r.id}</span> · {r.customer.name}
                  </span>
                  <span className="text-muted">{r.type === "sob_medida" ? "Sob medida" : money(r.estimatedTotal)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Próximas entregas"
          actions={
            <Link href="/admin/producao" className="text-sm underline underline-offset-4">
              Produção
            </Link>
          }
        >
          {upcoming.length === 0 ? (
            <EmptyState title="Sem prazos definidos" text="Pedidos confirmados com prazo aparecem aqui, do mais próximo ao mais distante." />
          ) : (
            <ul className="divide-y divide-stone/60 text-sm">
              {upcoming.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-2">
                  <span>
                    <span className="font-medium tabular-nums">{o.code}</span> · {o.customerSnapshot.name}
                  </span>
                  <span className="flex items-center gap-2">
                    <Pill tone={PAYMENT_TONES[o.paymentStatus]}>{PAYMENT_LABELS[o.paymentStatus]}</Pill>
                    <span className="text-muted">{dateBR(o.deadline!)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Alertas de estoque">
          {lowMaterials.length === 0 && lowProducts.length === 0 ? (
            <EmptyState title="Sem alertas" text="Materiais no mínimo e produtos sem saldo aparecem aqui." />
          ) : (
            <ul className="divide-y divide-stone/60 text-sm">
              {lowMaterials.map((m) => (
                <li key={m.id} className="flex justify-between py-2">
                  <span>Material: {m.name}</span>
                  <span className="tabular-nums text-muted">
                    {m.stock} / mín. {m.minStock}
                  </span>
                </li>
              ))}
              {lowProducts.map((p) => (
                <li key={p.id} className="flex justify-between py-2">
                  <span>Produto: {p.name}</span>
                  <span className="text-muted">sem saldo</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Resultado do mês" description="Visão gerencial, não contábil.">
          {orders.length === 0 && expenses.length === 0 ? (
            <EmptyState title="Sem movimentação no mês" text="Pedidos confirmados e lançamentos alimentam este resumo." />
          ) : (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt>Lucro bruto</dt>
                <dd className="tabular-nums">{money(month.result.grossProfit)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Resultado operacional</dt>
                <dd className="tabular-nums">{money(month.result.operatingResult)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Saldo de caixa</dt>
                <dd className="tabular-nums">{money(month.cash.balance)}</dd>
              </div>
              <Link href="/admin/financeiro" className="inline-block pt-2 underline underline-offset-4">
                Abrir financeiro
              </Link>
            </dl>
          )}
        </Panel>
      </div>
    </AdminPage>
  );
}
