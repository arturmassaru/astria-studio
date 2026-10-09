"use client";

import { useState } from "react";
import { AdminPage, CheckField, EmptyState, FormError, Modal, Pill, Table, Td, Th } from "@/components/admin/ui";
import { useAccess } from "@/components/admin/role";
import { Button } from "@/components/ui/Button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/fields";
import { money } from "@/lib/format";
import { kitPricing } from "@/lib/pricing";
import { cols } from "@/lib/store/collections";
import { useCol, useList } from "@/lib/store/core";
import { slugify, uid } from "@/lib/utils";
import type { Availability, Kit } from "@/types";

const blankKit = (): Kit => ({
  id: uid("kit"),
  slug: "",
  name: "",
  shortDescription: "",
  description: "",
  items: [],
  fixedPrice: null,
  discountPercent: 0,
  images: [],
  art: { shape: "kit", tone: "sand" },
  availability: "made_to_order",
  active: true,
  featured: false,
  isDemo: false,
});

export default function KitsAdminPage() {
  const { items, upsert, remove } = useList<Kit>(cols.kits);
  const [products] = useCol(cols.products);
  const { canWrite } = useAccess("kits");
  const [draft, setDraft] = useState<Kit | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof Kit>(key: K, value: Kit[K]) => setDraft((d) => (d ? { ...d, [key]: value } : d));

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    if (!draft.name.trim()) return setError("Informe o nome do kit.");
    if (draft.items.length === 0) return setError("Um kit precisa de ao menos um produto.");
    if (draft.items.some((i) => !i.productId || i.quantity < 1)) return setError("Revise os itens do kit.");
    const slug = slugify(draft.slug || draft.name);
    if (items.some((k) => k.id !== draft.id && k.slug === slug)) return setError("Já existe um kit com esse slug.");
    upsert({ ...draft, slug });
    setDraft(null);
  }

  const preview = draft ? kitPricing(draft, products) : null;

  return (
    <AdminPage
      module="kits"
      title="Kits"
      description="Kits são compostos por produtos existentes, que continuam vendáveis individualmente. Nada é duplicado."
      actions={
        <Button
          onClick={() => {
            setDraft(blankKit());
            setIsNew(true);
            setError(null);
          }}
        >
          Novo kit
        </Button>
      }
    >
      {items.length === 0 ? (
        <EmptyState title="Nenhum kit" text="Combine produtos existentes em kits para presentear." />
      ) : (
        <Table caption="Kits">
          <thead>
            <tr>
              <Th>Kit</Th>
              <Th>Composição</Th>
              <Th>Preço</Th>
              <Th>Status</Th>
              <Th className="text-right">Ações</Th>
            </tr>
          </thead>
          <tbody>
            {items.map((k) => {
              const pr = kitPricing(k, products);
              return (
                <tr key={k.id}>
                  <Td className="font-medium">{k.name}</Td>
                  <Td className="text-muted">
                    {k.items.map((i) => products.find((p) => p.id === i.productId)?.name ?? "?").join(", ") || "—"}
                  </Td>
                  <Td className="tabular-nums">
                    {money(pr.price)}
                    {pr.savings > 0 ? <span className="block text-xs text-muted">de {money(pr.list)}</span> : null}
                  </Td>
                  <Td>
                    <Pill tone={k.active ? "ok" : "neutral"}>{k.active ? "Ativo" : "Inativo"}</Pill>
                  </Td>
                  <Td className="text-right">
                    {canWrite ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setDraft({ ...k });
                            setIsNew(false);
                            setError(null);
                          }}
                        >
                          Editar<span className="sr-only"> {k.name}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            if (window.confirm(`Excluir o kit ${k.name}?`)) remove(k.id);
                          }}
                        >
                          Excluir<span className="sr-only"> {k.name}</span>
                        </Button>
                      </div>
                    ) : null}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}

      <Modal open={draft !== null} onClose={() => setDraft(null)} title={isNew ? "Novo kit" : "Editar kit"} wide>
        {draft ? (
          <form onSubmit={save} noValidate className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField id="kit-nome" label="Nome" required value={draft.name} onChange={(e) => set("name", e.target.value)} />
              <TextField
                id="kit-slug"
                label="Slug (URL)"
                value={draft.slug}
                onChange={(e) => set("slug", e.target.value)}
                help="Em branco: gerado a partir do nome."
              />
            </div>
            <TextField
              id="kit-curta"
              label="Descrição curta"
              value={draft.shortDescription}
              onChange={(e) => set("shortDescription", e.target.value)}
            />
            <TextAreaField
              id="kit-desc"
              label="Descrição"
              rows={3}
              value={draft.description}
              onChange={(e) => set("description", e.target.value)}
            />

            <fieldset className="space-y-3">
              <legend className="mb-1 text-sm font-medium">Composição</legend>
              {draft.items.map((it, i) => (
                <div key={i} className="grid grid-cols-[1fr_6rem_auto] items-end gap-3">
                  <SelectField
                    id={`kit-item-${i}`}
                    label="Produto"
                    value={it.productId}
                    onChange={(e) =>
                      set(
                        "items",
                        draft.items.map((x, j) => (j === i ? { ...x, productId: e.target.value } : x)),
                      )
                    }
                  >
                    <option value="">Selecione</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </SelectField>
                  <TextField
                    id={`kit-qtd-${i}`}
                    label="Qtd."
                    type="number"
                    min={1}
                    value={it.quantity}
                    onChange={(e) =>
                      set(
                        "items",
                        draft.items.map((x, j) => (j === i ? { ...x, quantity: Number(e.target.value || 1) } : x)),
                      )
                    }
                  />
                  <Button variant="ghost" onClick={() => set("items", draft.items.filter((_, j) => j !== i))}>
                    Remover
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => set("items", [...draft.items, { productId: "", quantity: 1 }])}
              >
                Adicionar produto
              </Button>
            </fieldset>

            <div className="grid gap-5 sm:grid-cols-3">
              <TextField
                id="kit-desconto"
                label="Desconto (%)"
                type="number"
                step="0.1"
                value={draft.discountPercent}
                onChange={(e) => set("discountPercent", Number(e.target.value || 0))}
              />
              <TextField
                id="kit-fixo"
                label="Preço fixo (opcional)"
                type="number"
                step="0.01"
                value={draft.fixedPrice ?? ""}
                onChange={(e) => set("fixedPrice", e.target.value === "" ? null : Number(e.target.value))}
                help="Se preenchido, substitui o desconto."
              />
              <SelectField
                id="kit-disp"
                label="Disponibilidade"
                value={draft.availability}
                onChange={(e) => set("availability", e.target.value as Availability)}
              >
                <option value="made_to_order">Sob encomenda</option>
                <option value="in_stock">Pronta entrega</option>
                <option value="out_of_stock">Indisponível</option>
              </SelectField>
            </div>

            {preview ? (
              <p className="rounded-lg bg-sand px-4 py-3 text-sm">
                Preço de tabela dos itens: <strong>{money(preview.list)}</strong>. Preço do kit:{" "}
                <strong>{money(preview.price)}</strong>
                {preview.savings > 0 ? ` (economia de ${money(preview.savings)})` : ""}.
              </p>
            ) : null}

            <div className="flex flex-wrap gap-6">
              <CheckField id="kit-ativo" label="Ativo na loja" checked={draft.active} onChange={(v) => set("active", v)} />
              <CheckField id="kit-dest" label="Destaque" checked={draft.featured} onChange={(v) => set("featured", v)} />
            </div>

            <FormError message={error} />
            <div className="flex gap-3">
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
