"use client";

import { useMemo } from "react";
import { AdminPage, EmptyState, Panel, Stat, Table, Td, Th } from "@/components/admin/ui";
import { money } from "@/lib/format";
import { COMMERCIAL_LABELS, LOSS_LABELS, UNIT_LABELS } from "@/lib/labels";
import { cols } from "@/lib/store/collections";
import { useCol } from "@/lib/store/core";
import { round2 } from "@/lib/utils";
import type { CommercialStatus, LossReason } from "@/types";

export default function RelatoriosPage() {
  const [orders] = useCol(cols.orders);
  const [requests] = useCol(cols.requests);
  const [materials] = useCol(cols.materials);
  const [moves] = useCol(cols.materialMoves);

  const confirmed = useMemo(() => orders.filter((o) => o.commercialStatus === "confirmado"), [orders]);

  const byProduct = useMemo(() => {
    const map = new Map<string, { name: string; quantity: number; revenue: number }>();
    for (const o of confirmed) {
      for (const i of o.items) {
        const key = `${i.kind}:${i.refId}`;
        const cur = map.get(key) ?? { name: i.name, quantity: 0, revenue: 0 };
        cur.quantity += i.quantity;
        cur.revenue += i.quantity * i.unitPrice;
        map.set(key, cur);
      }
    }
    return [...map.values()].sort((a, b) => b.revenue - a.revenue);
  }, [confirmed]);

  const converted = requests.filter((r) => r.status === "convertida").length;
  const conversion = requests.length > 0 ? Math.round((converted / requests.length) * 100) : null;

  const byStatus = useMemo(() => {
    const counts = new Map<CommercialStatus, number>();
    for (const o of orders) counts.set(o.commercialStatus, (counts.get(o.commercialStatus) ?? 0) + 1);
    return [...counts.entries()];
  }, [orders]);

  const low = materials.filter((m) => m.active && m.stock <= m.minStock);

  const losses = useMemo(() => {
    const map = new Map<LossReason, { count: number; quantity: number; cost: number }>();
    for (const m of moves.filter((x) => x.type === "perda")) {
      const reason = m.lossReason ?? "outros";
      const cur = map.get(reason) ?? { count: 0, quantity: 0, cost: 0 };
      cur.count += 1;
      cur.quantity += m.quantity;
      cur.cost += m.totalCost ?? 0;
      map.set(reason, cur);
    }
    return [...map.entries()];
  }, [moves]);

  return (
    <AdminPage
      module="relatorios"
      title="Relatórios"
      description="Leituras gerenciais calculadas apenas com os registros reais do painel. Sem dados, aparece o estado vazio."
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Solicitações recebidas" value={requests.length} />
        <Stat label="Convertidas em pedido" value={converted} />
        <Stat label="Taxa de conversão" value={conversion === null ? "—" : `${conversion}%`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Vendas por produto" description="Pedidos confirmados, valores do momento da venda.">
          {byProduct.length === 0 ? (
            <EmptyState title="Sem vendas ainda" text="Aparece quando houver pedidos confirmados." />
          ) : (
            <Table caption="Vendas por produto">
              <thead>
                <tr>
                  <Th>Item</Th>
                  <Th>Qtd.</Th>
                  <Th>Receita</Th>
                </tr>
              </thead>
              <tbody>
                {byProduct.map((p) => (
                  <tr key={p.name}>
                    <Td>{p.name}</Td>
                    <Td className="tabular-nums">{p.quantity}</Td>
                    <Td className="tabular-nums">{money(round2(p.revenue))}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Panel>

        <Panel title="Pedidos por status comercial">
          {byStatus.length === 0 ? (
            <EmptyState title="Sem pedidos" />
          ) : (
            <ul className="divide-y divide-stone/60 text-sm">
              {byStatus.map(([s, n]) => (
                <li key={s} className="flex justify-between py-2">
                  <span>{COMMERCIAL_LABELS[s]}</span>
                  <span className="tabular-nums">{n}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Materiais abaixo do mínimo">
          {low.length === 0 ? (
            <EmptyState
              title="Nada abaixo do mínimo"
              text={materials.length === 0 ? "Cadastre materiais para acompanhar." : "Todos os materiais ativos estão acima do mínimo."}
            />
          ) : (
            <ul className="divide-y divide-stone/60 text-sm">
              {low.map((m) => (
                <li key={m.id} className="flex justify-between py-2">
                  <span>{m.name}</span>
                  <span className="tabular-nums">
                    {m.stock} / {m.minStock} {UNIT_LABELS[m.unit]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Perdas por motivo" description="Falhas, testes e protótipos também têm custo.">
          {losses.length === 0 ? (
            <EmptyState title="Nenhuma perda registrada" />
          ) : (
            <Table caption="Perdas por motivo">
              <thead>
                <tr>
                  <Th>Motivo</Th>
                  <Th>Registros</Th>
                  <Th>Custo</Th>
                </tr>
              </thead>
              <tbody>
                {losses.map(([reason, v]) => (
                  <tr key={reason}>
                    <Td>{LOSS_LABELS[reason]}</Td>
                    <Td className="tabular-nums">{v.count}</Td>
                    <Td className="tabular-nums">{money(round2(v.cost))}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Panel>
      </div>
    </AdminPage>
  );
}
