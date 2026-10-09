"use client";

import { useCallback, useMemo } from "react";
import type { CartItem } from "@/types";
import { cols } from "./store/collections";
import { useCol, useHydrated } from "./store/core";
import { round2, uid } from "./utils";

export function cartTotals(items: CartItem[]) {
  const subtotal = round2(items.reduce((s, i) => s + i.listPrice * i.quantity, 0));
  const total = round2(items.reduce((s, i) => s + i.unitPrice * i.quantity, 0));
  return {
    count: items.reduce((s, i) => s + i.quantity, 0),
    subtotal,
    discount: round2(subtotal - total),
    /** Frete é combinado na confirmação e não entra no total estimado. */
    shipping: null as number | null,
    total,
  };
}

export function useCart() {
  const [items, setItems] = useCol<CartItem[]>(cols.cart);
  const hydrated = useHydrated();

  const addItem = useCallback(
    (item: Omit<CartItem, "id">) => {
      setItems((prev) => {
        const sig = (i: Omit<CartItem, "id">) =>
          JSON.stringify([i.kind, i.refId, i.variantId, i.customization, i.notes]);
        const existing = prev.find((p) => sig(p) === sig(item));
        if (existing) {
          return prev.map((p) =>
            p.id === existing.id ? { ...p, quantity: Math.min(99, p.quantity + item.quantity) } : p,
          );
        }
        return [...prev, { ...item, id: uid("ci") }];
      });
    },
    [setItems],
  );

  const setQuantity = useCallback(
    (id: string, quantity: number) =>
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, quantity } : p))),
    [setItems],
  );

  const setNotes = useCallback(
    (id: string, notes: string) =>
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, notes } : p))),
    [setItems],
  );

  const removeItem = useCallback(
    (id: string) => setItems((prev) => prev.filter((p) => p.id !== id)),
    [setItems],
  );

  const clear = useCallback(() => setItems([]), [setItems]);

  const totals = useMemo(() => cartTotals(items), [items]);

  return { items, hydrated, totals, addItem, setQuantity, setNotes, removeItem, clear };
}
