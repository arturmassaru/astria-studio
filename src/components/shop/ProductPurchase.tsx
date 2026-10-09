"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CartItem, PublicProduct } from "@/types";
import { Button } from "@/components/ui/Button";
import { Notice, Price } from "@/components/ui/primitives";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { TextAreaField } from "@/components/ui/fields";
import { useCart } from "@/lib/cart";
import { unitPrices } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { CustomizationFields } from "./CustomizationFields";

export function ProductPurchase({ product }: { product: PublicProduct }) {
  const { addItem } = useCart();
  const hasVariants = product.variants.length > 0;
  const [variantId, setVariantId] = useState<string | null>(hasVariants ? product.variants[0].id : null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [added, setAdded] = useState(false);

  const prices = useMemo(() => unitPrices(product, variantId), [product, variantId]);
  const variant = product.variants.find((v) => v.id === variantId) ?? null;
  const soldOut = product.availability === "out_of_stock";

  function handleAdd() {
    const nextErrors: Record<string, string> = {};
    product.customization.forEach((f) => {
      if (f.required && !(values[f.id] ?? "").trim()) nextErrors[f.id] = "Campo obrigatório.";
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const item: Omit<CartItem, "id"> = {
      kind: "product",
      refId: product.id,
      slug: product.slug,
      name: product.name,
      variantId,
      variantLabel: variant?.label ?? null,
      unitPrice: prices.price,
      listPrice: prices.list,
      quantity,
      customization: product.customization
        .filter((f) => (values[f.id] ?? "").trim())
        .map((f) => ({ fieldId: f.id, label: f.label, value: values[f.id].trim() })),
      notes: notes.trim(),
      art: product.art,
      image: product.images[0] ?? null,
    };
    addItem(item);
    setAdded(true);
  }

  return (
    <div className="space-y-8">
      <div>
        <Price price={prices.price} list={prices.list} className="text-2xl" />
        <p className="mt-1 text-xs text-muted">Valor estimado. O pedido é confirmado pelo WhatsApp.</p>
      </div>

      {hasVariants ? (
        <fieldset>
          <legend className="mb-3 text-sm font-medium">{product.variantLabel}</legend>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => {
              const active = v.id === variantId;
              return (
                <label
                  key={v.id}
                  className={cn(
                    "cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink",
                    active ? "border-ink bg-ink text-cream" : "border-stone hover:border-ink",
                  )}
                >
                  <input
                    type="radio"
                    name="variante"
                    value={v.id}
                    checked={active}
                    onChange={() => setVariantId(v.id)}
                    className="sr-only"
                  />
                  {v.label}
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <CustomizationFields
        fields={product.customization}
        values={values}
        errors={errors}
        onChange={(id, v) => setValues((prev) => ({ ...prev, [id]: v }))}
      />

      <TextAreaField
        id="obs-produto"
        label="Observações (opcional)"
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Algo que a gente precise saber?"
      />

      <div className="flex flex-wrap items-center gap-4">
        <QuantityStepper value={quantity} onChange={setQuantity} />
        <Button size="lg" onClick={handleAdd} disabled={soldOut} className="flex-1 sm:flex-none">
          {soldOut ? "Indisponível" : "Adicionar ao carrinho"}
        </Button>
      </div>

      {added ? (
        <Notice tone="ok">
          Adicionado ao carrinho.{" "}
          <Link href="/carrinho" className="font-medium underline underline-offset-4">
            Ver carrinho
          </Link>
        </Notice>
      ) : null}
    </div>
  );
}
