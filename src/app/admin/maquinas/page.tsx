"use client";

import { CrudPage } from "@/components/admin/CrudPage";
import { cols } from "@/lib/store/collections";
import { readCol, useCol } from "@/lib/store/core";
import { uid } from "@/lib/utils";
import type { Machine } from "@/types";

export default function MaquinasPage() {
  const [settings] = useCol(cols.settings);
  const tariff = settings.energyTariffPerKwh;
  return (
    <CrudPage<Machine>
      module="maquinas"
      title="Máquinas"
      description={
        tariff === null
          ? "Cadastre as máquinas usadas na produção. A tarifa de energia ainda não foi definida: configure em Configurações gerais para calcular o custo de energia."
          : "Cadastre as máquinas usadas na produção. A tarifa de energia vem de Configurações gerais."
      }
      col={cols.machines}
      itemName="máquina"
      emptyTitle="Nenhuma máquina cadastrada"
      emptyText="Máquinas alimentam o custo estimado de energia, depreciação, manutenção e desgaste."
      blank={() => ({
        id: uid("mac"),
        name: "",
        model: "",
        powerW: 0,
        purchasePrice: 0,
        lifetimeHours: 0,
        maintenancePerHour: 0,
        wearPerHour: 0,
        active: true,
        notes: "",
      })}
      fields={[
        { key: "name", label: "Nome", type: "text", required: true },
        { key: "model", label: "Modelo", type: "text" },
        { key: "powerW", label: "Potência média (W)", type: "number", help: "Consumo médio durante a operação." },
        { key: "purchasePrice", label: "Valor de compra (R$)", type: "money", hideInTable: true },
        {
          key: "lifetimeHours",
          label: "Vida útil estimada (horas)",
          type: "number",
          help: "Base da depreciação: valor de compra dividido pela vida útil.",
        },
        { key: "maintenancePerHour", label: "Manutenção (R$/hora)", type: "money", step: "0.0001", hideInTable: true },
        { key: "wearPerHour", label: "Desgaste (R$/hora)", type: "money", step: "0.0001", hideInTable: true },
        { key: "active", label: "Ativa", type: "checkbox" },
        { key: "notes", label: "Observações", type: "textarea", hideInTable: true },
      ]}
      validate={(d) => (d.lifetimeHours < 0 || d.powerW < 0 ? "Valores não podem ser negativos." : null)}
      canDelete={(row) =>
        readCol(cols.products).some((p) => p.machineId === row.id)
          ? "Há produtos usando esta máquina no cálculo de custo."
          : null
      }
    />
  );
}
