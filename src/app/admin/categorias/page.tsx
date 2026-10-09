"use client";

import { CrudPage } from "@/components/admin/CrudPage";
import { cols } from "@/lib/store/collections";
import { readCol } from "@/lib/store/core";
import { slugify, uid } from "@/lib/utils";
import type { Category } from "@/types";

export default function CategoriasPage() {
  return (
    <CrudPage<Category>
      module="categorias"
      title="Categorias"
      description="Um produto pode pertencer a várias categorias. A margem da categoria vale para os produtos que não têm margem própria."
      col={cols.categories}
      itemName="categoria"
      emptyTitle="Nenhuma categoria"
      emptyText="Crie categorias para organizar o catálogo."
      blank={() => ({
        id: uid("cat"),
        slug: "",
        name: "",
        description: "",
        sortOrder: 0,
        marginPercent: null,
        active: true,
      })}
      fields={[
        { key: "name", label: "Nome", type: "text", required: true },
        { key: "slug", label: "Slug (URL)", type: "text", help: "Deixe em branco para gerar a partir do nome." },
        { key: "description", label: "Descrição", type: "textarea", hideInTable: true },
        { key: "sortOrder", label: "Ordem", type: "number" },
        {
          key: "marginPercent",
          label: "Margem de referência (%)",
          type: "number",
          nullable: true,
          help: "Opcional. Prioridade: produto > categoria > global.",
        },
        { key: "active", label: "Ativa", type: "checkbox" },
      ]}
      beforeSave={(d) => ({ ...d, slug: slugify(d.slug || d.name) })}
      validate={(d, all) =>
        all.some((c) => c.id !== d.id && c.slug === d.slug) ? "Já existe uma categoria com esse slug." : null
      }
      canDelete={(row) =>
        readCol(cols.products).some((p) => p.categoryIds.includes(row.id))
          ? "Há produtos nesta categoria. Remova a categoria dos produtos antes de excluir."
          : null
      }
    />
  );
}
