"use client";

import { CrudPage } from "@/components/admin/CrudPage";
import { cols } from "@/lib/store/collections";
import { readCol } from "@/lib/store/core";
import { slugify, uid } from "@/lib/utils";
import type { Tag } from "@/types";

export default function TagsPage() {
  return (
    <CrudPage<Tag>
      module="tags"
      title="Tags"
      description="Um produto pode ter várias tags. Elas alimentam os filtros do catálogo."
      col={cols.tags}
      itemName="tag"
      emptyTitle="Nenhuma tag"
      emptyText="Crie tags para facilitar a busca e os filtros."
      blank={() => ({ id: uid("tag"), slug: "", name: "" })}
      fields={[
        { key: "name", label: "Nome", type: "text", required: true },
        { key: "slug", label: "Slug (URL)", type: "text", help: "Deixe em branco para gerar a partir do nome." },
      ]}
      beforeSave={(d) => ({ ...d, slug: slugify(d.slug || d.name) })}
      validate={(d, all) =>
        all.some((t) => t.id !== d.id && t.slug === d.slug) ? "Já existe uma tag com esse slug." : null
      }
      canDelete={(row) =>
        readCol(cols.products).some((p) => p.tagIds.includes(row.id))
          ? "Há produtos usando esta tag. Remova a tag dos produtos antes de excluir."
          : null
      }
    />
  );
}
