"use client";

import { useState } from "react";
import { ProductForm } from "@/components/admin/ProductForm";
import { useAccess } from "@/components/admin/role";
import { AdminPage, EmptyState, FormError, Modal, Pill, Table, Td, Th } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { money } from "@/lib/format";
import { cols } from "@/lib/store/collections";
import { readCol, useCol, useList } from "@/lib/store/core";
import { slugify, uid } from "@/lib/utils";
import type { Product } from "@/types";

const blankProduct = (): Product => ({
  id: uid("prd"),
  slug: "",
  name: "",
  shortDescription: "",
  description: "",
  categoryIds: [],
  tagIds: [],
  price: 0,
  promoPrice: null,
  dimensions: null,
  weightG: null,
  availability: "made_to_order",
  productionDays: null,
  variantLabel: "Opção",
  variants: [],
  customization: [],
  images: [],
  art: { shape: "generic", tone: "sand" },
  badge: null,
  featured: false,
  featuredOrder: null,
  salesRank: null,
  status: "draft",
  isDemo: false,
  trackStock: false,
  stockQty: 0,
  materials: [],
  machineId: null,
  machineHours: null,
  costEstimate: null,
  marginPercent: null,
});

const STATUS: Record<Product["status"], { label: string; tone: "ok" | "neutral" | "warn" }> = {
  active: { label: "Ativo", tone: "ok" },
  draft: { label: "Rascunho", tone: "warn" },
  archived: { label: "Arquivado", tone: "neutral" },
};

export default function ProdutosAdminPage() {
  const { items, upsert, remove } = useList<Product>(cols.products);
  const [categories] = useCol(cols.categories);
  const { canWrite } = useAccess("produtos");
  const { canRead: canSeeCosts } = useAccess("financeiro");
  const [draft, setDraft] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    if (!draft.name.trim()) return setError("Informe o nome do produto.");
    if (draft.price < 0) return setError("O preço não pode ser negativo.");
    if (draft.promoPrice !== null && draft.promoPrice >= draft.price && draft.price > 0)
      return setError("O preço promocional deve ser menor que o preço.");
    const slug = slugify(draft.slug || draft.name);
    if (items.some((p) => p.id !== draft.id && p.slug === slug)) return setError("Já existe um produto com esse slug.");
    if (draft.variants.some((v) => !v.label.trim())) return setError("Toda variante precisa de um nome.");
    if (draft.customization.some((f) => !f.label.trim())) return setError("Todo campo de personalização precisa de um rótulo.");
    upsert({ ...draft, slug });
    setDraft(null);
  }

  function handleDelete(p: Product) {
    const used =
      readCol(cols.kits).some((k) => k.items.some((i) => i.productId === p.id)) ||
      readCol(cols.orders).some((o) => o.items.some((i) => i.refId === p.id));
    if (used) {
      window.alert("Este produto está em kits ou pedidos. Arquive-o em vez de excluir (os pedidos antigos mantêm o histórico).");
      return;
    }
    if (window.confirm(`Excluir o produto ${p.name}?`)) remove(p.id);
  }

  return (
    <AdminPage
      module="produtos"
      title="Produtos"
      description="Cadastro completo. Informações internas (custo, margem, estoque) nunca aparecem na loja."
      actions={
        <Button
          onClick={() => {
            setDraft(blankProduct());
            setIsNew(true);
            setError(null);
          }}
        >
          Novo produto
        </Button>
      }
    >
      {items.length === 0 ? (
        <EmptyState title="Nenhum produto" text="Cadastre o primeiro produto para ele aparecer no catálogo." />
      ) : (
        <Table caption="Produtos">
          <thead>
            <tr>
              <Th>Produto</Th>
              <Th>Categorias</Th>
              <Th>Preço</Th>
              <Th>Status</Th>
              <Th>Estoque</Th>
              <Th className="text-right">Ações</Th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <Td>
                  <span className="font-medium">{p.name}</span>
                  {p.isDemo ? <span className="ml-2 text-xs text-muted">(demonstrativo)</span> : null}
                  {p.featured ? <span className="ml-2 text-xs text-muted">★ destaque</span> : null}
                </Td>
                <Td className="text-muted">
                  {p.categoryIds.map((id) => categories.find((c) => c.id === id)?.name).filter(Boolean).join(", ") || "—"}
                </Td>
                <Td className="tabular-nums">
                  {money(p.promoPrice ?? p.price)}
                  {p.promoPrice !== null ? <s className="ml-2 text-xs text-muted">{money(p.price)}</s> : null}
                </Td>
                <Td>
                  <Pill tone={STATUS[p.status].tone}>{STATUS[p.status].label}</Pill>
                </Td>
                <Td className="tabular-nums">{p.trackStock ? p.stockQty : <span className="text-muted">sob encomenda</span>}</Td>
                <Td className="text-right">
                  {canWrite ? (
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setDraft(structuredClone(p));
                          setIsNew(false);
                          setError(null);
                        }}
                      >
                        Editar<span className="sr-only"> {p.name}</span>
                      </Button>
                      <Button variant="ghost" onClick={() => handleDelete(p)}>
                        Excluir<span className="sr-only"> {p.name}</span>
                      </Button>
                    </div>
                  ) : null}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal open={draft !== null} onClose={() => setDraft(null)} title={isNew ? "Novo produto" : "Editar produto"} wide>
        {draft ? (
          <form onSubmit={save} noValidate className="space-y-6">
            <ProductForm
              draft={draft}
              setDraft={(updater) => setDraft((d) => (d ? updater(d) : d))}
              canSeeCosts={canSeeCosts}
            />
            <FormError message={error} />
            <div className="sticky bottom-0 -mx-6 flex gap-3 border-t border-stone bg-cream px-6 py-4 sm:-mx-8 sm:px-8">
              <Button type="submit">Salvar produto</Button>
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
