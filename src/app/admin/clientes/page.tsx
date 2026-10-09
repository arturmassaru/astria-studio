"use client";

import { CrudPage } from "@/components/admin/CrudPage";
import { BR_STATES } from "@/components/ui/fields";
import { formatWhatsapp } from "@/lib/format";
import { cols } from "@/lib/store/collections";
import { readCol } from "@/lib/store/core";
import { normalizeWhatsapp, uid } from "@/lib/utils";
import type { Customer } from "@/types";

export default function ClientesPage() {
  return (
    <CrudPage<Customer>
      module="clientes"
      title="Clientes"
      description="O WhatsApp é o identificador principal e evita cadastros duplicados. CPF e endereço completo só quando forem necessários."
      col={cols.customers}
      itemName="cliente"
      emptyTitle="Nenhum cliente ainda"
      emptyText="Clientes são criados automaticamente quando uma solicitação vira pedido, ou manualmente aqui."
      blank={() => ({
        id: uid("cus"),
        name: "",
        whatsapp: "",
        city: "",
        state: "",
        notes: "",
        cpf: "",
        address: "",
        createdAt: new Date().toISOString(),
      })}
      fields={[
        { key: "name", label: "Nome", type: "text", required: true },
        {
          key: "whatsapp",
          label: "WhatsApp",
          type: "text",
          required: true,
          render: (r) => formatWhatsapp(r.whatsapp),
        },
        { key: "city", label: "Cidade", type: "text" },
        {
          key: "state",
          label: "Estado",
          type: "select",
          options: [{ value: "", label: "—" }, ...BR_STATES.map((u) => ({ value: u, label: u }))],
        },
        { key: "notes", label: "Observações", type: "textarea", hideInTable: true },
        { key: "cpf", label: "CPF (somente se necessário)", type: "text", hideInTable: true },
        { key: "address", label: "Endereço completo (somente se necessário)", type: "textarea", hideInTable: true },
      ]}
      beforeSave={(d) => ({ ...d, whatsapp: normalizeWhatsapp(d.whatsapp) })}
      validate={(d, all) => {
        if (d.whatsapp.length < 10) return "Informe um WhatsApp válido com DDD.";
        return all.some((c) => c.id !== d.id && normalizeWhatsapp(c.whatsapp) === d.whatsapp)
          ? "Já existe um cliente com esse WhatsApp."
          : null;
      }}
      canDelete={(row) =>
        readCol(cols.orders).some((o) => o.customerId === row.id)
          ? "Este cliente tem pedidos e não pode ser excluído."
          : null
      }
    />
  );
}
