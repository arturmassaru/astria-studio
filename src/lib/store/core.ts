"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Armazenamento local reativo (localStorage + useSyncExternalStore).
 *
 * MODO DEMONSTRAÇÃO: enquanto o Supabase não estiver conectado, carrinho,
 * solicitações e dados do painel ficam no navegador. As coleções seguem os
 * mesmos tipos do modelo de dados definitivo (src/types e supabase/migrations).
 */

type Listener = () => void;

const listeners = new Map<string, Set<Listener>>();
const cache = new Map<string, unknown>();

export interface Collection<T> {
  key: string;
  seed: T;
}

function notify(key: string) {
  listeners.get(key)?.forEach((l) => l());
}

export function getStored<T>(key: string, seed: T): T {
  if (typeof window === "undefined") return seed;
  if (cache.has(key)) return cache.get(key) as T;
  let value = seed;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw !== null) value = JSON.parse(raw) as T;
  } catch {
    /* armazenamento indisponível ou JSON inválido: usa seed */
  }
  cache.set(key, value);
  return value;
}

export function setStored<T>(key: string, seed: T, next: T | ((prev: T) => T)): void {
  if (typeof window === "undefined") return;
  const prev = getStored(key, seed);
  const value = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
  cache.set(key, value);
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota ou modo privado: mantém apenas em memória */
  }
  notify(key);
}

export function readCol<T>(col: Collection<T>): T {
  return getStored(col.key, col.seed);
}

export function writeCol<T>(col: Collection<T>, next: T | ((prev: T) => T)): void {
  setStored(col.key, col.seed, next);
}

export function resetCol(col: { key: string }): void {
  if (typeof window === "undefined") return;
  cache.delete(col.key);
  try {
    window.localStorage.removeItem(col.key);
  } catch {
    /* ignore */
  }
  notify(col.key);
}

export function useStored<T>(key: string, seed: T) {
  const subscribe = useCallback(
    (cb: Listener) => {
      let set = listeners.get(key);
      if (!set) {
        set = new Set();
        listeners.set(key, set);
      }
      set.add(cb);
      const onStorage = (e: StorageEvent) => {
        if (e.key === key) {
          cache.delete(key);
          cb();
        }
      };
      window.addEventListener("storage", onStorage);
      return () => {
        set?.delete(cb);
        window.removeEventListener("storage", onStorage);
      };
    },
    [key],
  );

  const value = useSyncExternalStore(
    subscribe,
    () => getStored(key, seed),
    () => seed,
  );

  const set = useCallback(
    (next: T | ((prev: T) => T)) => setStored(key, seed, next),
    [key, seed],
  );

  return [value, set] as const;
}

export function useCol<T>(col: Collection<T>) {
  return useStored<T>(col.key, col.seed);
}

/** Lista com operações básicas de CRUD. */
export function useList<T extends { id: string }>(col: Collection<T[]>) {
  const [items, setItems] = useStored<T[]>(col.key, col.seed);
  const upsert = useCallback(
    (item: T) =>
      setItems((prev) =>
        prev.some((x) => x.id === item.id)
          ? prev.map((x) => (x.id === item.id ? item : x))
          : [...prev, item],
      ),
    [setItems],
  );
  const remove = useCallback(
    (id: string) => setItems((prev) => prev.filter((x) => x.id !== id)),
    [setItems],
  );
  return { items, upsert, remove, setItems };
}

const noopSubscribe = () => () => {};

/** true somente no cliente, após a hidratação. Evita piscar estados vazios. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
