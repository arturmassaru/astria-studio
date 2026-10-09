"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { Category, PublicProduct, Tag } from "@/types";
import { ProductCard, productFromPrice } from "./ProductCard";
import { cn } from "@/lib/utils";

const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

type Sort = "destaque" | "menor" | "maior" | "nome";

interface Props {
  products: PublicProduct[];
  categories: Category[];
  tags: Tag[];
}

function chip(active: boolean) {
  return cn(
    "rounded-full border px-4 py-2 text-sm transition-colors",
    active ? "border-ink bg-ink text-cream" : "border-stone bg-transparent hover:border-ink",
  );
}

function CatalogInner({
  products,
  categories,
  tags,
  initialQ,
  initialCategory,
  initialTags,
}: Props & { initialQ: string; initialCategory: string; initialTags: string[] }) {
  const [q, setQ] = useState(initialQ);
  const [categorySlug, setCategorySlug] = useState(initialCategory);
  const [tagSlugs, setTagSlugs] = useState<string[]>(initialTags);
  const [sort, setSort] = useState<Sort>("destaque");

  const results = useMemo(() => {
    const term = norm(q.trim());
    const category = categories.find((c) => c.slug === categorySlug);
    const selectedTags = tags.filter((t) => tagSlugs.includes(t.slug));

    const list = products.filter((p) => {
      if (category && !p.categoryIds.includes(category.id)) return false;
      if (selectedTags.some((t) => !p.tagIds.includes(t.id))) return false;
      if (term) {
        const hay = norm(
          [
            p.name,
            p.shortDescription,
            p.description,
            ...p.categoryIds.map((id) => categories.find((c) => c.id === id)?.name ?? ""),
            ...p.tagIds.map((id) => tags.find((t) => t.id === id)?.name ?? ""),
          ].join(" "),
        );
        if (!hay.includes(term)) return false;
      }
      return true;
    });

    const priceOf = (p: PublicProduct) => productFromPrice(p).price;
    return [...list].sort((a, b) => {
      if (sort === "menor") return priceOf(a) - priceOf(b);
      if (sort === "maior") return priceOf(b) - priceOf(a);
      if (sort === "nome") return a.name.localeCompare(b.name, "pt-BR");
      return (a.featuredOrder ?? 999) - (b.featuredOrder ?? 999) || a.name.localeCompare(b.name, "pt-BR");
    });
  }, [products, categories, tags, q, categorySlug, tagSlugs, sort]);

  const hasFilters = !!q || !!categorySlug || tagSlugs.length > 0;

  return (
    <div>
      <div className="grid gap-6 border-b border-stone pb-8">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <div>
            <label htmlFor="catalogo-busca" className="sr-only">
              Buscar produtos
            </label>
            <input
              id="catalogo-busca"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nome, categoria ou tag"
              className="w-full rounded-full border border-stone bg-white px-5 py-3 text-[0.95rem] placeholder:text-taupe focus:border-ink focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="catalogo-ordem" className="sr-only">
              Ordenar por
            </label>
            <select
              id="catalogo-ordem"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="w-full rounded-full border border-stone bg-white px-5 py-3 text-[0.95rem] focus:border-ink focus:outline-none sm:w-auto"
            >
              <option value="destaque">Destaques</option>
              <option value="menor">Menor preço</option>
              <option value="maior">Maior preço</option>
              <option value="nome">Nome (A–Z)</option>
            </select>
          </div>
        </div>

        <div role="group" aria-label="Categorias" className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={categorySlug === ""}
            onClick={() => setCategorySlug("")}
            className={chip(categorySlug === "")}
          >
            Todas
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={categorySlug === c.slug}
              onClick={() => setCategorySlug(categorySlug === c.slug ? "" : c.slug)}
              className={chip(categorySlug === c.slug)}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div role="group" aria-label="Tags" className="flex flex-wrap gap-2">
          {tags.map((t) => {
            const active = tagSlugs.includes(t.slug);
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  setTagSlugs((prev) => (active ? prev.filter((s) => s !== t.slug) : [...prev, t.slug]))
                }
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs transition-colors",
                  active ? "bg-ink text-cream" : "bg-sand text-ink hover:bg-stone/70",
                )}
              >
                #{t.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between py-6">
        <p className="text-sm text-muted" aria-live="polite">
          {results.length} {results.length === 1 ? "produto" : "produtos"}
        </p>
        {hasFilters ? (
          <button
            type="button"
            onClick={() => {
              setQ("");
              setCategorySlug("");
              setTagSlugs([]);
            }}
            className="text-sm underline underline-offset-4"
          >
            Limpar filtros
          </button>
        ) : null}
      </div>

      {results.length === 0 ? (
        <div className="rounded-2xl bg-sand/60 px-6 py-16 text-center">
          <p className="font-serif text-2xl font-light">Nada por aqui ainda.</p>
          <p className="mt-2 text-sm text-muted">
            Tente outra busca, ou conte para a gente o que você imaginou na página Personalizados.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((p) => {
            const pr = productFromPrice(p);
            return (
              <li key={p.id}>
                <ProductCard
                  href={`/produtos/${p.slug}`}
                  name={p.name}
                  category={categories.find((c) => p.categoryIds.includes(c.id))?.name}
                  price={pr.price}
                  list={pr.list}
                  from={pr.from}
                  badge={p.badge}
                  images={p.images}
                  art={p.art}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function Catalog(props: Props) {
  const params = useSearchParams();
  // `key` reinicia os filtros quando a URL muda (ex.: busca do cabeçalho).
  return (
    <CatalogInner
      key={params.toString()}
      {...props}
      initialQ={params.get("q") ?? ""}
      initialCategory={params.get("categoria") ?? ""}
      initialTags={params.getAll("tag")}
    />
  );
}
