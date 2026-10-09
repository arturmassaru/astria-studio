"use client";

import { useState, type ReactNode } from "react";
import type { AdminModule } from "@/types";
import { Button } from "@/components/ui/Button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/fields";
import { money } from "@/lib/format";
import { useList, type Collection } from "@/lib/store/core";
import { AdminPage, CheckField, EmptyState, FormError, Modal, Table, Td, Th } from "./ui";
import { useAccess } from "./role";

export interface FieldDef<T> {
  key: keyof T & string;
  label: string;
  type: "text" | "number" | "textarea" | "select" | "checkbox" | "money";
  options?: { value: string; label: string }[];
  required?: boolean;
  hideInTable?: boolean;
  /** Não aparece no formulário (ex.: saldo alterado só por movimentações). */
  formHidden?: boolean;
  help?: string;
  step?: string;
  nullable?: boolean;
  render?: (row: T) => ReactNode;
}

interface Props<T extends { id: string }> {
  module: AdminModule;
  title: string;
  description?: string;
  col: Collection<T[]>;
  fields: FieldDef<T>[];
  blank: () => T;
  itemName: string;
  emptyTitle: string;
  emptyText: string;
  validate?: (draft: T, all: T[]) => string | null;
  beforeSave?: (draft: T) => T;
  canDelete?: (row: T) => string | null;
  rowActions?: (row: T) => ReactNode;
  extra?: ReactNode;
}

function cell<T>(row: T, f: FieldDef<T>): ReactNode {
  if (f.render) return f.render(row);
  const v = row[f.key] as unknown;
  if (v === null || v === undefined || v === "") return <span className="text-muted">—</span>;
  if (f.type === "checkbox") return v ? "Sim" : "Não";
  if (f.type === "money") return money(Number(v));
  if (f.type === "select") return f.options?.find((o) => o.value === v)?.label ?? String(v);
  if (f.type === "number") return Number(v).toLocaleString("pt-BR", { maximumFractionDigits: 4 });
  return String(v);
}

/** CRUD genérico para cadastros simples (categorias, tags, clientes, máquinas, usuários...). */
export function CrudPage<T extends { id: string }>({
  module,
  title,
  description,
  col,
  fields,
  blank,
  itemName,
  emptyTitle,
  emptyText,
  validate,
  beforeSave,
  canDelete,
  rowActions,
  extra,
}: Props<T>) {
  const { items, upsert, remove } = useList<T>(col);
  const { canWrite } = useAccess(module);
  const [draft, setDraft] = useState<T | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tableFields = fields.filter((f) => !f.hideInTable);
  const formFields = fields.filter((f) => !f.formHidden);

  function openNew() {
    setDraft(blank());
    setIsNew(true);
    setError(null);
  }
  function openEdit(row: T) {
    setDraft({ ...row });
    setIsNew(false);
    setError(null);
  }
  function setValue(key: string, value: unknown) {
    setDraft((d) => (d ? ({ ...d, [key]: value } as T) : d));
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    for (const f of formFields) {
      const v = draft[f.key] as unknown;
      if (f.required && (v === "" || v === null || v === undefined)) {
        setError(`Preencha o campo "${f.label}".`);
        return;
      }
    }
    const prepared = beforeSave ? beforeSave(draft) : draft;
    const msg = validate ? validate(prepared, items) : null;
    if (msg) {
      setError(msg);
      return;
    }
    upsert(prepared);
    setDraft(null);
  }

  function handleDelete(row: T) {
    const blocked = canDelete ? canDelete(row) : null;
    if (blocked) {
      window.alert(blocked);
      return;
    }
    if (window.confirm(`Excluir este registro de ${itemName}? Esta ação não pode ser desfeita.`)) {
      remove(row.id);
    }
  }

  return (
    <AdminPage
      module={module}
      title={title}
      description={description}
      actions={<Button onClick={openNew}>Novo {itemName}</Button>}
    >
      {items.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          text={emptyText}
          action={canWrite ? <Button onClick={openNew}>Cadastrar {itemName}</Button> : undefined}
        />
      ) : (
        <Table caption={title}>
          <thead>
            <tr>
              {tableFields.map((f) => (
                <Th key={f.key}>{f.label}</Th>
              ))}
              <Th className="text-right">Ações</Th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id}>
                {tableFields.map((f) => (
                  <Td key={f.key}>{cell(row, f)}</Td>
                ))}
                <Td className="text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    {rowActions ? rowActions(row) : null}
                    {canWrite ? (
                      <>
                        <Button variant="outline" onClick={() => openEdit(row)}>
                          Editar<span className="sr-only"> {itemName}</span>
                        </Button>
                        <Button variant="ghost" onClick={() => handleDelete(row)}>
                          Excluir<span className="sr-only"> {itemName}</span>
                        </Button>
                      </>
                    ) : null}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {extra}

      <Modal
        open={draft !== null}
        onClose={() => setDraft(null)}
        title={isNew ? `Novo ${itemName}` : `Editar ${itemName}`}
      >
        {draft ? (
          <form onSubmit={save} noValidate className="space-y-5">
            {formFields.map((f) => {
              const id = `crud-${f.key}`;
              const v = draft[f.key] as unknown;
              if (f.type === "checkbox") {
                return (
                  <CheckField
                    key={f.key}
                    id={id}
                    label={f.label}
                    help={f.help}
                    checked={Boolean(v)}
                    onChange={(c) => setValue(f.key, c)}
                  />
                );
              }
              if (f.type === "textarea") {
                return (
                  <TextAreaField
                    key={f.key}
                    id={id}
                    label={f.label}
                    help={f.help}
                    rows={3}
                    value={String(v ?? "")}
                    onChange={(e) => setValue(f.key, e.target.value)}
                  />
                );
              }
              if (f.type === "select") {
                return (
                  <SelectField
                    key={f.key}
                    id={id}
                    label={f.label}
                    help={f.help}
                    value={String(v ?? "")}
                    onChange={(e) => setValue(f.key, e.target.value)}
                  >
                    {f.options?.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </SelectField>
                );
              }
              if (f.type === "number" || f.type === "money") {
                return (
                  <TextField
                    key={f.key}
                    id={id}
                    label={f.label}
                    help={f.help}
                    type="number"
                    inputMode="decimal"
                    step={f.step ?? (f.type === "money" ? "0.01" : "any")}
                    value={v === null || v === undefined ? "" : String(v)}
                    onChange={(e) =>
                      setValue(
                        f.key,
                        e.target.value === "" ? (f.nullable ? null : 0) : Number(e.target.value),
                      )
                    }
                  />
                );
              }
              return (
                <TextField
                  key={f.key}
                  id={id}
                  label={f.label}
                  help={f.help}
                  value={String(v ?? "")}
                  onChange={(e) => setValue(f.key, e.target.value)}
                />
              );
            })}
            <FormError message={error} />
            <div className="flex gap-3 pt-2">
              <Button type="submit">Salvar</Button>
              <Button variant="ghost" onClick={() => setDraft(null)}>
                Cancelar
              </Button>
            </div>
          </form>
        ) : null}
      </Modal>
    </AdminPage>
  );
}
