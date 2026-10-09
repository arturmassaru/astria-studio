"use client";

import { useMemo, useState } from "react";
import type {
  Availability,
  CustomizationField,
  CustomizationFieldType,
  Product,
  ProductStatus,
  ProductVariant,
} from "@/types";
import { Button } from "@/components/ui/Button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/fields";
import { Notice } from "@/components/ui/primitives";
import { money, percent } from "@/lib/format";
import {
  discountImpact,
  estimateCost,
  marginPercent,
  markupPercent,
  resolveMargin,
  suggestedPrice,
} from "@/lib/pricing";
import { cols } from "@/lib/store/collections";
import { useCol } from "@/lib/store/core";
import { slugify, uid } from "@/lib/utils";
import { CheckField, Panel } from "./ui";

type SetDraft = (updater: (p: Product) => Product) => void;

const fieldTypeLabels: Record<CustomizationFieldType, string> = {
  text: "Texto",
  name: "Nome",
  color: "Cor",
  model: "Modelo",
  size: "Tamanho",
  select: "Seleção",
  upload: "Upload (nome do arquivo)",
  notes: "Observações",
};
const optionTypes: CustomizationFieldType[] = ["color", "model", "size", "select"];

function Num({
  id,
  label,
  value,
  onChange,
  step = "any",
  help,
  nullable = true,
}: {
  id: string;
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  step?: string;
  help?: string;
  nullable?: boolean;
}) {
  return (
    <TextField
      id={id}
      label={label}
      type="number"
      inputMode="decimal"
      step={step}
      help={help}
      value={value === null ? "" : String(value)}
      onChange={(e) => onChange(e.target.value === "" ? (nullable ? null : 0) : Number(e.target.value))}
    />
  );
}

function OptionsInput({
  id,
  options,
  onCommit,
}: {
  id: string;
  options: string[];
  onCommit: (o: string[]) => void;
}) {
  const [text, setText] = useState(options.join(", "));
  return (
    <TextField
      id={id}
      label="Opções (separadas por vírgula)"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={() =>
        onCommit(
          text
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        )
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* Custo, margem e preço (dados financeiros: acesso restrito)          */
/* ------------------------------------------------------------------ */

function PricingPanel({ draft, setDraft }: { draft: Product; setDraft: SetDraft }) {
  const [materials] = useCol(cols.materials);
  const [machines] = useCol(cols.machines);
  const [categories] = useCol(cols.categories);
  const [settings] = useCol(cols.settings);
  const [discount, setDiscount] = useState(0);

  const machine = machines.find((m) => m.id === draft.machineId) ?? null;
  const breakdown = useMemo(
    () => estimateCost({ materials: draft.materials, machineHours: draft.machineHours, machine }, materials, settings),
    [draft.materials, draft.machineHours, machine, materials, settings],
  );

  const finalPrice = draft.promoPrice ?? draft.price;
  const cost = draft.costEstimate;
  const resolved = resolveMargin(draft, categories, settings);
  const suggested = cost !== null && resolved ? suggestedPrice(cost, resolved.value) : null;
  const profit = cost !== null ? finalPrice - cost : null;
  const impact = cost !== null ? discountImpact(finalPrice, cost, discount) : null;

  return (
    <Panel
      title="Custo, margem e preço (interno)"
      description="Custo ESTIMADO, não custo real. Mão de obra não está incluída. Nada disto aparece na loja."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          id="pf-maquina"
          label="Máquina"
          value={draft.machineId ?? ""}
          onChange={(e) => setDraft((p) => ({ ...p, machineId: e.target.value || null }))}
        >
          <option value="">Nenhuma</option>
          {machines.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </SelectField>
        <Num
          id="pf-horas"
          label="Horas de máquina por unidade"
          value={draft.machineHours}
          onChange={(v) => setDraft((p) => ({ ...p, machineHours: v }))}
        />
      </div>

      <fieldset className="mt-6 space-y-3">
        <legend className="mb-1 text-sm font-medium">Materiais usados por unidade</legend>
        {materials.length === 0 ? (
          <p className="text-sm text-muted">Cadastre materiais em Materiais para compor o custo.</p>
        ) : null}
        {draft.materials.map((u, i) => (
          <div key={i} className="grid grid-cols-[1fr_8rem_auto] items-end gap-3">
            <SelectField
              id={`pf-mat-${i}`}
              label="Material"
              value={u.materialId}
              onChange={(e) =>
                setDraft((p) => ({
                  ...p,
                  materials: p.materials.map((x, j) => (j === i ? { ...x, materialId: e.target.value } : x)),
                }))
              }
            >
              <option value="">Selecione</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.unit})
                </option>
              ))}
            </SelectField>
            <TextField
              id={`pf-mq-${i}`}
              label="Quantidade"
              type="number"
              step="any"
              value={u.quantity}
              onChange={(e) =>
                setDraft((p) => ({
                  ...p,
                  materials: p.materials.map((x, j) => (j === i ? { ...x, quantity: Number(e.target.value || 0) } : x)),
                }))
              }
            />
            <Button
              variant="ghost"
              onClick={() => setDraft((p) => ({ ...p, materials: p.materials.filter((_, j) => j !== i) }))}
            >
              Remover
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          disabled={materials.length === 0}
          onClick={() => setDraft((p) => ({ ...p, materials: [...p.materials, { materialId: "", quantity: 0 }] }))}
        >
          Adicionar material
        </Button>
      </fieldset>

      <dl className="mt-6 grid gap-x-8 gap-y-1 rounded-lg bg-sand p-4 text-sm sm:grid-cols-2">
        {(
          [
            ["Materiais", breakdown.materials],
            ["Perdas", breakdown.losses],
            ["Energia", breakdown.energy],
            ["Depreciação", breakdown.depreciation],
            ["Manutenção", breakdown.maintenance],
            ["Desgaste", breakdown.wear],
          ] as const
        ).map(([k, v]) => (
          <div key={k} className="flex justify-between">
            <dt className="text-muted">{k}</dt>
            <dd className="tabular-nums">{money(v)}</dd>
          </div>
        ))}
        <div className="flex justify-between border-t border-stone pt-2 font-medium sm:col-span-2">
          <dt>Custo calculado</dt>
          <dd className="tabular-nums">{money(breakdown.total)}</dd>
        </div>
      </dl>
      {breakdown.missingTariff ? (
        <Notice tone="warn" className="mt-3">
          A tarifa de energia ainda não foi definida em Configurações gerais, então o custo de energia
          não está incluído.
        </Notice>
      ) : null}

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <Num
            id="pf-custo"
            label="Custo estimado adotado (R$)"
            value={draft.costEstimate}
            step="0.01"
            onChange={(v) => setDraft((p) => ({ ...p, costEstimate: v }))}
            help="Você pode digitar manualmente ou usar o custo calculado."
          />
          <Button
            variant="outline"
            className="mt-3"
            onClick={() => setDraft((p) => ({ ...p, costEstimate: breakdown.total }))}
          >
            Usar custo calculado
          </Button>
        </div>
        <Num
          id="pf-margem"
          label="Margem do produto (%)"
          value={draft.marginPercent}
          step="0.1"
          onChange={(v) => setDraft((p) => ({ ...p, marginPercent: v }))}
          help="Opcional. Prioridade: produto > categoria > global."
        />
      </div>

      <dl className="mt-6 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
        <div className="flex justify-between">
          <dt className="text-muted">Margem de referência</dt>
          <dd>{resolved ? `${percent(resolved.value)} (${resolved.source})` : "não definida"}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Preço sugerido</dt>
          <dd className="tabular-nums">{suggested !== null ? money(suggested) : "—"}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Preço final</dt>
          <dd className="tabular-nums">{money(finalPrice)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Lucro por unidade</dt>
          <dd className="tabular-nums">{profit !== null ? money(profit) : "—"}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Margem real (lucro / preço)</dt>
          <dd>{cost !== null ? percent(marginPercent(finalPrice, cost)) : "—"}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Markup (lucro / custo)</dt>
          <dd>{cost !== null ? percent(markupPercent(finalPrice, cost)) : "—"}</dd>
        </div>
      </dl>

      {cost === null ? (
        <Notice className="mt-4">Informe o custo estimado para ver lucro e margem.</Notice>
      ) : null}
      {resolved === null ? (
        <Notice className="mt-4">
          Nenhuma margem de referência definida (produto, categoria ou global): sem ela não há preço
          sugerido.
        </Notice>
      ) : null}
      {cost !== null && finalPrice < cost ? (
        <Notice tone="error" className="mt-4">
          Atenção: o preço final está abaixo do custo estimado. Cada venda gera prejuízo.
        </Notice>
      ) : null}
      {suggested !== null && cost !== null && finalPrice >= cost && finalPrice < suggested ? (
        <Notice tone="warn" className="mt-4">
          O preço final está abaixo do preço sugerido para a margem de referência.
        </Notice>
      ) : null}

      <div className="mt-6 border-t border-stone pt-5">
        <p className="mb-3 text-sm font-medium">Simular desconto</p>
        <div className="max-w-xs">
          <TextField
            id="pf-desc"
            label="Desconto (%)"
            type="number"
            step="1"
            min={0}
            max={100}
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value || 0))}
          />
        </div>
        {impact ? (
          <p className="mt-3 text-sm">
            Preço com desconto: <strong>{money(impact.finalPrice)}</strong> · lucro:{" "}
            <strong>{money(impact.profit)}</strong> · margem: <strong>{percent(impact.margin)}</strong>
            {impact.belowCost ? <span className="ml-2 font-medium text-red-800">Abaixo do custo!</span> : null}
          </p>
        ) : (
          <p className="mt-3 text-sm text-muted">Informe o custo para ver o impacto no lucro.</p>
        )}
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Formulário principal                                                */
/* ------------------------------------------------------------------ */

export function ProductForm({
  draft,
  setDraft,
  canSeeCosts,
}: {
  draft: Product;
  setDraft: SetDraft;
  canSeeCosts: boolean;
}) {
  const [categories] = useCol(cols.categories);
  const [tags] = useCol(cols.tags);

  const set = <K extends keyof Product>(key: K, value: Product[K]) => setDraft((p) => ({ ...p, [key]: value }));
  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const updateVariant = (id: string, patch: Partial<ProductVariant>) =>
    setDraft((p) => ({ ...p, variants: p.variants.map((v) => (v.id === id ? { ...v, ...patch } : v)) }));
  const updateField = (id: string, patch: Partial<CustomizationField>) =>
    setDraft((p) => ({ ...p, customization: p.customization.map((f) => (f.id === id ? { ...f, ...patch } : f)) }));

  return (
    <div className="space-y-8">
      <Panel title="Informações">
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField id="pf-nome" label="Nome" required value={draft.name} onChange={(e) => set("name", e.target.value)} />
            <TextField
              id="pf-slug"
              label="Slug (URL)"
              value={draft.slug}
              onChange={(e) => set("slug", e.target.value)}
              help={`Em branco: ${slugify(draft.name) || "gerado a partir do nome"}.`}
            />
          </div>
          <TextField
            id="pf-curta"
            label="Descrição curta"
            value={draft.shortDescription}
            onChange={(e) => set("shortDescription", e.target.value)}
          />
          <TextAreaField
            id="pf-desc"
            label="Descrição"
            rows={4}
            value={draft.description}
            onChange={(e) => set("description", e.target.value)}
          />
          <div className="grid gap-5 sm:grid-cols-3">
            <Num id="pf-preco" label="Preço (R$)" value={draft.price} step="0.01" nullable={false} onChange={(v) => set("price", v ?? 0)} />
            <Num id="pf-promo" label="Preço promocional (R$)" value={draft.promoPrice} step="0.01" onChange={(v) => set("promoPrice", v)} />
            <TextField
              id="pf-badge"
              label="Selo (opcional)"
              value={draft.badge ?? ""}
              onChange={(e) => set("badge", e.target.value || null)}
              placeholder="Novo, Natal…"
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <TextField
              id="pf-dim"
              label="Dimensões"
              value={draft.dimensions ?? ""}
              onChange={(e) => set("dimensions", e.target.value || null)}
            />
            <Num id="pf-peso" label="Peso (g)" value={draft.weightG} onChange={(v) => set("weightG", v)} />
            <Num id="pf-prazo" label="Tempo de produção (dias)" value={draft.productionDays} onChange={(v) => set("productionDays", v)} />
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <SelectField
              id="pf-disp"
              label="Disponibilidade"
              value={draft.availability}
              onChange={(e) => set("availability", e.target.value as Availability)}
            >
              <option value="made_to_order">Sob encomenda</option>
              <option value="in_stock">Pronta entrega</option>
              <option value="out_of_stock">Indisponível</option>
            </SelectField>
            <SelectField
              id="pf-status"
              label="Status"
              value={draft.status}
              onChange={(e) => set("status", e.target.value as ProductStatus)}
            >
              <option value="active">Ativo</option>
              <option value="draft">Rascunho</option>
              <option value="archived">Arquivado</option>
            </SelectField>
            <Num id="pf-ordem" label="Ordem no destaque" value={draft.featuredOrder} onChange={(v) => set("featuredOrder", v)} />
          </div>
          <CheckField
            id="pf-dest"
            label="Destacar em Os queridinhos da Astria"
            checked={draft.featured}
            onChange={(v) => set("featured", v)}
          />
        </div>
      </Panel>

      <Panel title="Categorias e tags">
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Categorias</legend>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {categories.map((c) => (
              <CheckField
                key={c.id}
                id={`pf-cat-${c.id}`}
                label={c.name}
                checked={draft.categoryIds.includes(c.id)}
                onChange={() => set("categoryIds", toggle(draft.categoryIds, c.id))}
              />
            ))}
          </div>
        </fieldset>
        <fieldset className="mt-5">
          <legend className="mb-2 text-sm font-medium">Tags</legend>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {tags.map((t) => (
              <CheckField
                key={t.id}
                id={`pf-tag-${t.id}`}
                label={t.name}
                checked={draft.tagIds.includes(t.id)}
                onChange={() => set("tagIds", toggle(draft.tagIds, t.id))}
              />
            ))}
          </div>
        </fieldset>
      </Panel>

      <Panel
        title="Variantes"
        description="Alteram preço, custo, peso, tempo, dimensão e estoque. Exemplos: cor, tamanho, modelo, acabamento."
      >
        <div className="mb-5 max-w-xs">
          <TextField
            id="pf-vlabel"
            label="Nome do eixo de variação"
            value={draft.variantLabel}
            onChange={(e) => set("variantLabel", e.target.value)}
            placeholder="Tamanho, Cor, Modelo…"
          />
        </div>
        <div className="space-y-4">
          {draft.variants.map((v, i) => (
            <div key={v.id} className="rounded-xl border border-stone p-4">
              <div className="grid gap-4 sm:grid-cols-4">
                <TextField id={`pv-l-${i}`} label="Opção" value={v.label} onChange={(e) => updateVariant(v.id, { label: e.target.value })} />
                <Num id={`pv-p-${i}`} label="Preço (R$)" value={v.price} step="0.01" onChange={(x) => updateVariant(v.id, { price: x })} />
                <Num id={`pv-pp-${i}`} label="Promo (R$)" value={v.promoPrice} step="0.01" onChange={(x) => updateVariant(v.id, { promoPrice: x })} />
                {canSeeCosts ? (
                  <Num id={`pv-c-${i}`} label="Custo (R$)" value={v.cost} step="0.01" onChange={(x) => updateVariant(v.id, { cost: x })} />
                ) : null}
                <Num id={`pv-w-${i}`} label="Peso (g)" value={v.weightG} onChange={(x) => updateVariant(v.id, { weightG: x })} />
                <Num id={`pv-d-${i}`} label="Prazo (dias)" value={v.productionDays} onChange={(x) => updateVariant(v.id, { productionDays: x })} />
                <TextField id={`pv-dim-${i}`} label="Dimensões" value={v.dimensions ?? ""} onChange={(e) => updateVariant(v.id, { dimensions: e.target.value || null })} />
                <Num id={`pv-s-${i}`} label="Estoque" value={v.stock} onChange={(x) => updateVariant(v.id, { stock: x })} />
              </div>
              <Button
                variant="ghost"
                className="mt-3"
                onClick={() => set("variants", draft.variants.filter((x) => x.id !== v.id))}
              >
                Remover variante
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() =>
              set("variants", [
                ...draft.variants,
                {
                  id: uid("v"),
                  label: "",
                  price: null,
                  promoPrice: null,
                  cost: null,
                  weightG: null,
                  productionDays: null,
                  dimensions: null,
                  stock: null,
                },
              ])
            }
          >
            Adicionar variante
          </Button>
        </div>
      </Panel>

      <Panel
        title="Personalização"
        description="Campos que o cliente preenche. As escolhas são preservadas no carrinho, na solicitação e no pedido."
      >
        <div className="space-y-4">
          {draft.customization.map((f, i) => (
            <div key={f.id} className="rounded-xl border border-stone p-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <TextField id={`pc-l-${i}`} label="Rótulo" value={f.label} onChange={(e) => updateField(f.id, { label: e.target.value })} />
                <SelectField
                  id={`pc-t-${i}`}
                  label="Tipo"
                  value={f.type}
                  onChange={(e) => updateField(f.id, { type: e.target.value as CustomizationFieldType })}
                >
                  {(Object.keys(fieldTypeLabels) as CustomizationFieldType[]).map((t) => (
                    <option key={t} value={t}>
                      {fieldTypeLabels[t]}
                    </option>
                  ))}
                </SelectField>
                <Num id={`pc-m-${i}`} label="Máx. de caracteres" value={f.maxLength ?? null} onChange={(x) => updateField(f.id, { maxLength: x ?? undefined })} />
              </div>
              {optionTypes.includes(f.type) ? (
                <div className="mt-4">
                  <OptionsInput id={`pc-o-${i}`} options={f.options} onCommit={(o) => updateField(f.id, { options: o })} />
                </div>
              ) : null}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <CheckField id={`pc-r-${i}`} label="Obrigatório" checked={f.required} onChange={(v) => updateField(f.id, { required: v })} />
                <Button variant="ghost" onClick={() => set("customization", draft.customization.filter((x) => x.id !== f.id))}>
                  Remover campo
                </Button>
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() =>
              set("customization", [
                ...draft.customization,
                { id: uid("cf"), label: "", type: "text", required: false, options: [] },
              ])
            }
          >
            Adicionar campo
          </Button>
        </div>
      </Panel>

      <Panel title="Estoque (produto acabado)" description="Só pedidos confirmados reduzem o saldo. Solicitações nunca movimentam estoque.">
        <div className="grid gap-5 sm:grid-cols-2">
          <CheckField id="pf-track" label="Controlar estoque deste produto" checked={draft.trackStock} onChange={(v) => set("trackStock", v)} />
          <p className="text-sm text-muted">Saldo atual: {draft.stockQty}. Para alterar, use Estoque, para manter o histórico.</p>
        </div>
      </Panel>

      {canSeeCosts ? <PricingPanel draft={draft} setDraft={setDraft} /> : (
        <Notice>Custos, margens e precificação ficam visíveis apenas para perfis com acesso ao Financeiro.</Notice>
      )}
    </div>
  );
}
