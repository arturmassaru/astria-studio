"use client";

import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Notice } from "@/components/ui/primitives";
import { ProductImage } from "@/components/ui/ProductImage";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { TextAreaField } from "@/components/ui/fields";
import { useCart } from "@/lib/cart";
import { money } from "@/lib/format";

export function CartView() {
  const { items, totals, hydrated, setQuantity, setNotes, removeItem } = useCart();

  if (!hydrated) return <p className="text-sm text-muted">Carregando seu carrinho…</p>;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md py-10 text-center">
        <p className="font-serif text-3xl font-light">Seu carrinho está vazio</p>
        <p className="mt-3 text-muted">
          Que tal começar por uma peça pronta ou por um kit para presentear?
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/produtos" size="lg">
            Explorar produtos
          </ButtonLink>
          <ButtonLink href="/kits" variant="outline" size="lg">
            Ver kits
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-14 lg:grid-cols-[1.4fr_0.8fr] lg:gap-20">
      <ul className="divide-y divide-stone border-y border-stone" aria-label="Itens do carrinho">
        {items.map((i) => {
          const href = i.kind === "kit" ? `/kits/${i.slug}` : `/produtos/${i.slug}`;
          return (
            <li key={i.id} className="flex gap-5 py-7 sm:gap-7">
              <Link href={href} className="w-24 shrink-0 overflow-hidden rounded-xl sm:w-32">
                <ProductImage images={i.image ? [i.image] : []} art={i.art} alt={i.name} sizes="128px" />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link href={href} className="font-serif text-xl font-light hover:underline">
                      {i.name}
                    </Link>
                    {i.variantLabel ? <p className="mt-1 text-sm text-muted">{i.variantLabel}</p> : null}
                    {i.customization.map((c) => (
                      <p key={c.fieldId} className="text-sm text-muted">
                        {c.label}: {c.value}
                      </p>
                    ))}
                  </div>
                  <p className="text-right font-medium">{money(i.unitPrice * i.quantity)}</p>
                </div>

                <div className="mt-4 max-w-sm">
                  <TextAreaField
                    id={`obs-${i.id}`}
                    label="Observações deste item"
                    rows={2}
                    value={i.notes}
                    onChange={(e) => setNotes(i.id, e.target.value)}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <QuantityStepper
                    value={i.quantity}
                    onChange={(q) => setQuantity(i.id, q)}
                    label={`Quantidade de ${i.name}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(i.id)}
                    className="text-sm text-muted underline underline-offset-4 hover:text-ink"
                  >
                    Remover<span className="sr-only"> {i.name}</span>
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <aside aria-label="Resumo do carrinho" className="h-fit rounded-[1.5rem] bg-sand p-6 sm:p-8">
        <h2 className="font-serif text-2xl font-light">Resumo</h2>
        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal ({totals.count} {totals.count === 1 ? "item" : "itens"})</dt>
            <dd>{money(totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Desconto</dt>
            <dd>{totals.discount > 0 ? `- ${money(totals.discount)}` : "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Frete</dt>
            <dd>A combinar</dd>
          </div>
          <div className="flex justify-between border-t border-stone pt-4 text-base font-medium">
            <dt>Total estimado</dt>
            <dd>{money(totals.total)}</dd>
          </div>
        </dl>
        <ButtonLink href="/solicitacao" size="lg" className="mt-8 w-full">
          Enviar solicitação
        </ButtonLink>
        <Notice className="mt-6">
          Sem pagamento agora. Você envia uma solicitação, conversamos pelo WhatsApp e só depois da
          confirmação o pedido é oficial.
        </Notice>
      </aside>
    </div>
  );
}
