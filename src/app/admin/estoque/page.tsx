"use client";

import Link from "next/link";
import { useState } from "react";
import { AdminPage, EmptyState, FormError, Modal, Panel, Pill, Table, Td, Th } from "@/components/admin/ui";
import { useAccess } from "@/components/admin/role";
import { Button } from "@/components/ui/Button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/fields";
import { dateTimeBR } from "@/lib/format";
import { registerStockMovement } from "@/lib/domain/actions";
import { cols } from "@/lib/store/collections";
import { useCol } from "@/lib/store/core";
import type { Product, StockMovementType } from "@/types";

const TYPE_LABEL: Record<StockMovementType, string> = {
  entrada: "Entrada",
  saida_pedido: "Saída por pedido",
  estorno_cancelamento: "Estorno de cancelamento",
  ajuste: "Ajuste",
};

function MoveModal({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const [type, setType] = useState<"entrada" | "ajuste">("entrada");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;
    const q = Number(quantity);
    const res = registerStockMovement(product.id, type, type === "entrada" ? Math.abs(q) : q, note);
    if (!res.ok) return setError(res.error);
    onClose();
  }

  return (
    <Modal open={product !== null} onClose={onClose} title={product ? `Movimentar: ${product.name}` : ""}>
      {product ? (
        <form onSubmit={submit} noValidate className="space-y-5">
          <SelectField
            id="est-tipo"
            label="Tipo"
            value={type}
            onChange={(e) => setType(e.target.value as "entrada" | "ajuste")}
          >
            <option value="entrada">Entrada (produção concluída, reposição)</option>
            <option value="ajuste">Ajuste de inventário (use negativo para reduzir)</option>
          </SelectField>
          <TextField
            id="est-qtd"
            label="Quantidade"
            type="number"
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          <TextAreaField id="est-nota" label="Observação" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          <FormError message={error} />
          <div className="flex gap-3">
            <Button type="submit">Registrar</Button>
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      ) : null}
    </Modal>
  );
}

export default function EstoquePage() {
  const [products] = useCol(cols.products);
  const [moves] = useCol(cols.stockMoves);
  const { canWrite } = useAccess("estoque");
  const [moveFor, setMoveFor] = useState<Product | null>(null);

  const tracked = products.filter((p) => p.trackStock);
  const untracked = products.length - tracked.length;

  return (
    <AdminPage
      module="estoque"
      title="Estoque"
      description="Produtos acabados. Solicitações não movimentam estoque: só pedidos confirmados reduzem o saldo, e cancelamentos geram movimento reverso."
    >
      {tracked.length === 0 ? (
        <EmptyState
          title="Nenhum produto com controle de estoque"
          text="Ative o controle de estoque no cadastro do produto (peças de pronta entrega). Produtos feitos sob encomenda podem ficar sem controle."
          action={
            <Link href="/admin/produtos" className="text-sm underline underline-offset-4">
              Ir para Produtos
            </Link>
          }
        />
      ) : (
        <Table caption="Estoque de produtos acabados">
          <thead>
            <tr>
              <Th>Produto</Th>
              <Th>Saldo</Th>
              <Th className="text-right">Ações</Th>
            </tr>
          </thead>
          <tbody>
            {tracked.map((p) => (
              <tr key={p.id}>
                <Td className="font-medium">{p.name}</Td>
                <Td className="tabular-nums">
                  {p.stockQty} {p.stockQty < 0 ? <Pill tone="danger">Saldo negativo</Pill> : null}
                </Td>
                <Td className="text-right">
                  {canWrite ? (
                    <Button variant="outline" onClick={() => setMoveFor(p)}>
                      Movimentar<span className="sr-only"> {p.name}</span>
                    </Button>
                  ) : null}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {untracked > 0 ? (
        <p className="mt-4 text-xs text-muted">
          {untracked} produto(s) sem controle de estoque. Materiais de produção ficam em{" "}
          <Link href="/admin/materiais" className="underline underline-offset-4">
            Materiais
          </Link>
          .
        </p>
      ) : null}

      {moves.length > 0 ? (
        <Panel title="Movimentações" description="As 40 mais recentes." className="mt-10">
          <Table caption="Movimentações de estoque">
            <thead>
              <tr>
                <Th>Data</Th>
                <Th>Produto</Th>
                <Th>Tipo</Th>
                <Th>Quantidade</Th>
                <Th>Observação</Th>
              </tr>
            </thead>
            <tbody>
              {moves.slice(0, 40).map((m) => (
                <tr key={m.id}>
                  <Td>{dateTimeBR(m.date)}</Td>
                  <Td>{products.find((p) => p.id === m.productId)?.name ?? "—"}</Td>
                  <Td>{TYPE_LABEL[m.type]}</Td>
                  <Td className="tabular-nums">{m.quantity > 0 ? `+${m.quantity}` : m.quantity}</Td>
                  <Td className="text-muted">{m.note || "—"}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Panel>
      ) : null}

      <MoveModal key={moveFor?.id ?? "none"} product={moveFor} onClose={() => setMoveFor(null)} />
    </AdminPage>
  );
}
