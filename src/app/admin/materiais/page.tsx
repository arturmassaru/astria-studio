"use client";

import { useState } from "react";
import { CrudPage } from "@/components/admin/CrudPage";
import { useAccess } from "@/components/admin/role";
import { FormError, Modal, Panel, Pill, Table, Td, Th } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/fields";
import { dateTimeBR } from "@/lib/format";
import { registerMaterialMovement } from "@/lib/domain/actions";
import {
  LOSS_LABELS,
  MATERIAL_KIND_LABELS,
  MOVEMENT_LABELS,
  UNIT_LABELS,
  toOptions,
} from "@/lib/labels";
import { cols } from "@/lib/store/collections";
import { readCol, useCol } from "@/lib/store/core";
import { uid } from "@/lib/utils";
import type { LossReason, Material, MaterialMovementType } from "@/types";

function MovementModal({ material, onClose }: { material: Material | null; onClose: () => void }) {
  const [type, setType] = useState<MaterialMovementType>("compra");
  const [quantity, setQuantity] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [loss, setLoss] = useState<LossReason>("falha");
  const [direction, setDirection] = useState<"1" | "-1">("1");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!material) return;
    const res = registerMaterialMovement({
      materialId: material.id,
      type,
      quantity: Number(quantity),
      direction: direction === "1" ? 1 : -1,
      totalCost: totalCost === "" ? null : Number(totalCost),
      lossReason: type === "perda" ? loss : null,
      note,
    });
    if (!res.ok) return setError(res.error);
    onClose();
  }

  return (
    <Modal open={material !== null} onClose={onClose} title={material ? `Movimentar: ${material.name}` : ""}>
      {material ? (
        <form onSubmit={submit} noValidate className="space-y-5">
          <SelectField
            id="mv-tipo"
            label="Tipo"
            value={type}
            onChange={(e) => setType(e.target.value as MaterialMovementType)}
          >
            <option value="compra">Compra (entrada)</option>
            <option value="perda">Perda (falha, teste, protótipo...)</option>
            <option value="consumo">Consumo manual</option>
            <option value="ajuste">Ajuste de inventário</option>
          </SelectField>
          <TextField
            id="mv-qtd"
            label={`Quantidade (${UNIT_LABELS[material.unit]})`}
            type="number"
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          {type === "compra" ? (
            <TextField
              id="mv-custo"
              label="Valor total pago (R$)"
              type="number"
              step="0.01"
              value={totalCost}
              onChange={(e) => setTotalCost(e.target.value)}
              help="O custo unitário é calculado automaticamente."
            />
          ) : null}
          {type === "perda" ? (
            <SelectField
              id="mv-motivo"
              label="Motivo da perda"
              value={loss}
              onChange={(e) => setLoss(e.target.value as LossReason)}
              help="Perdas são registradas à parte e nunca viram produto acabado."
            >
              {toOptions(LOSS_LABELS).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </SelectField>
          ) : null}
          {type === "ajuste" ? (
            <SelectField
              id="mv-dir"
              label="Direção"
              value={direction}
              onChange={(e) => setDirection(e.target.value as "1" | "-1")}
            >
              <option value="1">Aumentar o saldo</option>
              <option value="-1">Diminuir o saldo</option>
            </SelectField>
          ) : null}
          <TextAreaField id="mv-nota" label="Observação" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
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

function History() {
  const [moves] = useCol(cols.materialMoves);
  const [materials] = useCol(cols.materials);
  if (moves.length === 0) return null;
  return (
    <Panel title="Histórico de movimentações" description="As 40 mais recentes." className="mt-10">
      <Table caption="Histórico de movimentações de materiais">
        <thead>
          <tr>
            <Th>Data</Th>
            <Th>Material</Th>
            <Th>Tipo</Th>
            <Th>Quantidade</Th>
            <Th>Detalhe</Th>
          </tr>
        </thead>
        <tbody>
          {moves.slice(0, 40).map((m) => {
            const mat = materials.find((x) => x.id === m.materialId);
            return (
              <tr key={m.id}>
                <Td>{dateTimeBR(m.date)}</Td>
                <Td>{mat?.name ?? "—"}</Td>
                <Td>
                  <Pill tone={m.type === "perda" ? "danger" : m.type === "compra" ? "ok" : "neutral"}>
                    {MOVEMENT_LABELS[m.type]}
                  </Pill>
                </Td>
                <Td className="tabular-nums">
                  {m.direction === 1 ? "+" : "-"}
                  {m.quantity.toLocaleString("pt-BR")} {mat ? UNIT_LABELS[mat.unit] : ""}
                </Td>
                <Td className="text-muted">
                  {m.lossReason ? LOSS_LABELS[m.lossReason] : m.note || "—"}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Panel>
  );
}

export default function MateriaisPage() {
  const [moveFor, setMoveFor] = useState<Material | null>(null);
  const { canWrite } = useAccess("materiais");

  return (
    <CrudPage<Material>
      module="materiais"
      title="Materiais"
      description="Filamento, tinta, embalagem, etiquetas e outros. O saldo só muda por movimentações (compra, consumo, perda, ajuste)."
      col={cols.materials}
      itemName="material"
      emptyTitle="Nenhum material cadastrado"
      emptyText="Cadastre os materiais para controlar saldo, custo unitário e perdas."
      blank={() => ({
        id: uid("mat"),
        name: "",
        kind: "filamento",
        unit: "g",
        stock: 0,
        minStock: 0,
        unitCost: 0,
        supplier: "",
        active: true,
      })}
      fields={[
        { key: "name", label: "Nome", type: "text", required: true },
        { key: "kind", label: "Tipo", type: "select", options: toOptions(MATERIAL_KIND_LABELS) },
        { key: "unit", label: "Unidade", type: "select", options: toOptions(UNIT_LABELS) },
        {
          key: "stock",
          label: "Saldo",
          type: "number",
          formHidden: true,
          render: (r) => (
            <span className="flex items-center gap-2 tabular-nums">
              {r.stock.toLocaleString("pt-BR")} {UNIT_LABELS[r.unit]}
              {r.minStock > 0 && r.stock <= r.minStock ? <Pill tone="danger">Abaixo do mínimo</Pill> : null}
            </span>
          ),
        },
        { key: "minStock", label: "Estoque mínimo", type: "number" },
        {
          key: "unitCost",
          label: "Custo unitário (R$ por unidade)",
          type: "number",
          step: "0.0001",
          help: "Atualizado automaticamente a cada compra.",
          render: (r) =>
            `R$ ${r.unitCost.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}/${UNIT_LABELS[r.unit]}`,
        },
        { key: "supplier", label: "Fornecedor", type: "text", hideInTable: true },
        { key: "active", label: "Ativo", type: "checkbox", hideInTable: true },
      ]}
      canDelete={(row) =>
        readCol(cols.materialMoves).some((m) => m.materialId === row.id) ||
        readCol(cols.products).some((p) => p.materials.some((u) => u.materialId === row.id))
          ? "Este material tem histórico ou é usado em produtos. Desative-o em vez de excluir."
          : null
      }
      rowActions={(row) =>
        canWrite ? (
          <Button variant="outline" onClick={() => setMoveFor(row)}>
            Movimentar<span className="sr-only"> {row.name}</span>
          </Button>
        ) : null
      }
      extra={
        <>
          <History />
          <MovementModal key={moveFor?.id ?? "none"} material={moveFor} onClose={() => setMoveFor(null)} />
        </>
      }
    />
  );
}
