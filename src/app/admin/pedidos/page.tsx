"use client";

import { useState } from "react";
import { OrderDetail } from "@/components/admin/OrderDetail";
import { AdminPage, EmptyState, Modal, Pill, Table, Td, Th } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { SelectField, TextField } from "@/components/ui/fields";
import { dateBR, money } from "@/lib/format";
import {
  COMMERCIAL_LABELS,
  COMMERCIAL_TONES,
  PAYMENT_LABELS,
  PAYMENT_TONES,
  PRODUCTION_LABELS,
  PRODUCTION_TONES,
  toOptions,
} from "@/lib/labels";
import { cols } from "@/lib/store/collections";
import { useCol } from "@/lib/store/core";
import type { CommercialStatus } from "@/types";

export default function PedidosPage() {
  const [orders] = useCol(cols.orders);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<"todos" | CommercialStatus>("todos");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const list = orders.filter(
    (o) =>
      (status === "todos" || o.commercialStatus === status) &&
      (!q || o.code.toLowerCase().includes(q) || o.customerSnapshot.name.toLowerCase().includes(q)),
  );
  const selected = orders.find((o) => o.id === selectedId) ?? null;

  return (
    <AdminPage
      module="pedidos"
      title="Pedidos"
      description="Pedidos oficiais, criados depois da confirmação comercial de uma solicitação. Status comercial, pagamento, produção e entrega são independentes."
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
        <TextField id="ped-busca" label="Buscar por código ou cliente" value={query} onChange={(e) => setQuery(e.target.value)} />
        <SelectField id="ped-status" label="Status comercial" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
          <option value="todos">Todos</option>
          {toOptions(COMMERCIAL_LABELS).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </SelectField>
      </div>

      {list.length === 0 ? (
        <EmptyState
          title={orders.length === 0 ? "Nenhum pedido ainda" : "Nenhum pedido encontrado"}
          text={
            orders.length === 0
              ? "Pedidos nascem da confirmação de uma solicitação, em Solicitações."
              : "Ajuste a busca ou o filtro."
          }
        />
      ) : (
        <Table caption="Pedidos">
          <thead>
            <tr>
              <Th>Pedido</Th>
              <Th>Data</Th>
              <Th>Cliente</Th>
              <Th>Total</Th>
              <Th>Comercial</Th>
              <Th>Pagamento</Th>
              <Th>Produção</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {list.map((o) => (
              <tr key={o.id}>
                <Td className="font-medium tabular-nums">{o.code}</Td>
                <Td>{dateBR(o.createdAt)}</Td>
                <Td>{o.customerSnapshot.name}</Td>
                <Td className="tabular-nums">{money(o.total)}</Td>
                <Td>
                  <Pill tone={COMMERCIAL_TONES[o.commercialStatus]}>{COMMERCIAL_LABELS[o.commercialStatus]}</Pill>
                </Td>
                <Td>
                  <Pill tone={PAYMENT_TONES[o.paymentStatus]}>{PAYMENT_LABELS[o.paymentStatus]}</Pill>
                </Td>
                <Td>
                  <Pill tone={PRODUCTION_TONES[o.productionStatus]}>{PRODUCTION_LABELS[o.productionStatus]}</Pill>
                </Td>
                <Td className="text-right">
                  <Button variant="outline" onClick={() => setSelectedId(o.id)}>
                    Abrir<span className="sr-only"> {o.code}</span>
                  </Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal open={selected !== null} onClose={() => setSelectedId(null)} title={selected ? `Pedido ${selected.code}` : ""} wide>
        {selected ? <OrderDetail orderId={selected.id} /> : null}
      </Modal>
    </AdminPage>
  );
}
