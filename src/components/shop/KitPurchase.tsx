"use client";

import Link from "next/link";
import { useState } from "react";
import type { Kit } from "@/types";
import { Button } from "@/components/ui/Button";
import { Notice, Price } from "@/components/ui/primitives";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { TextAreaField } from "@/components/ui/fields";
import { useCart } from "@/lib/cart";

export function KitPurchase({ kit, price, list }: { kit: Kit; price: number; list: number }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [added, setAdded] = useState(false);
  const soldOut = kit.availability === "out_of_stock";

  function handleAdd() {
    addItem({
      kind: "kit",
      refId: kit.id,
      slug: kit.slug,
      name: kit.name,
      variantId: null,
      variantLabel: null,
      unitPrice: price,
      listPrice: list,
      quantity,
      customization: [],
      notes: notes.trim(),
      art: kit.art,
      image: kit.images[0] ?? null,
    });
    setAdded(true);
  }

  return (
    <div className="space-y-8">
      <div>
        <Price price={price} list={list} className="text-2xl" />
        <p className="mt-1 text-xs text-muted">Valor estimado. O pedido é confirmado pelo WhatsApp.</p>
      </div>
      <TextAreaField
        id="obs-kit"
        label="Observações (opcional)"
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Cores, presente, dedicatória…"
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
