"use client";

import Link from "next/link";
import { useState } from "react";
import type { RequestCustomer, RequestRecord } from "@/types";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Notice } from "@/components/ui/primitives";
import { ProductImage } from "@/components/ui/ProductImage";
import { useCart } from "@/lib/cart";
import { submitRequest } from "@/lib/domain/actions";
import { money } from "@/lib/format";
import { emptyCustomer, validateCustomer, type CustomerErrors } from "@/lib/validation";
import { CustomerFields } from "./CustomerFields";
import { requestWhatsappUrl } from "@/lib/whatsapp";
import { RequestSuccess } from "./RequestSuccess";

export function RequestForm() {
  const { items, totals, hydrated, clear } = useCart();
  const [customer, setCustomer] = useState<RequestCustomer>(emptyCustomer);
  const [errors, setErrors] = useState<CustomerErrors>({});
  const [record, setRecord] = useState<RequestRecord | null>(null);

  if (record) return <RequestSuccess record={record} />;

  if (!hydrated) return <p className="text-sm text-muted">Carregando…</p>;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="font-serif text-3xl font-light">Seu carrinho está vazio</p>
        <p className="mt-3 text-muted">Escolha algumas peças antes de enviar uma solicitação.</p>
        <ButtonLink href="/produtos" size="lg" className="mt-8">
          Explorar produtos
        </ButtonLink>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validateCustomer(customer);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    const created = submitRequest({
      customer: {
        name: customer.name.trim(),
        whatsapp: customer.whatsapp.trim(),
        city: customer.city.trim(),
        state: customer.state,
        notes: customer.notes.trim(),
      },
      items,
      project: null,
    });
    clear();
    // Abre o WhatsApp da Astria já com a mensagem pronta (dentro do clique do cliente, para não ser bloqueado).
    window.open(requestWhatsappUrl(created), "_blank", "noopener,noreferrer");
    setRecord(created);
  }

  return (
    <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
      <form onSubmit={handleSubmit} noValidate aria-label="Dados para a solicitação">
        <h2 className="font-serif text-3xl font-light tracking-tight">Seus dados</h2>
        <p className="mt-2 mb-8 text-muted">
          Só o essencial para a gente continuar a conversa pelo WhatsApp.
        </p>
        <CustomerFields
          idPrefix="sol"
          values={customer}
          errors={errors}
          onChange={(key, value) => setCustomer((prev) => ({ ...prev, [key]: value }))}
        />
        <Button type="submit" size="lg" className="mt-10 w-full sm:w-auto">
          Enviar solicitação
        </Button>
        <p className="mt-4 text-xs text-muted">
          Enviar a solicitação não é uma compra: nada é cobrado e nada entra em produção até a
          confirmação.
        </p>
      </form>

      <aside aria-label="Resumo da solicitação" className="h-fit rounded-[1.5rem] bg-sand p-6 sm:p-8">
        <h2 className="font-serif text-2xl font-light">Resumo</h2>
        <ul className="mt-6 space-y-5">
          {items.map((i) => (
            <li key={i.id} className="flex gap-4">
              <div className="w-16 shrink-0 overflow-hidden rounded-lg">
                <ProductImage images={i.image ? [i.image] : []} art={i.art} alt="" sizes="64px" />
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-medium">{i.name}</p>
                {i.variantLabel ? <p className="text-muted">{i.variantLabel}</p> : null}
                {i.customization.map((c) => (
                  <p key={c.fieldId} className="text-muted">
                    {c.label}: {c.value}
                  </p>
                ))}
                <p className="text-muted">
                  {i.quantity} x {money(i.unitPrice)}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <dl className="mt-6 space-y-2 border-t border-stone pt-5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd>{money(totals.subtotal)}</dd>
          </div>
          {totals.discount > 0 ? (
            <div className="flex justify-between">
              <dt className="text-muted">Desconto</dt>
              <dd>- {money(totals.discount)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between">
            <dt className="text-muted">Frete</dt>
            <dd>A combinar</dd>
          </div>
          <div className="flex justify-between pt-2 text-base font-medium">
            <dt>Total estimado</dt>
            <dd>{money(totals.total)}</dd>
          </div>
        </dl>
        <Notice className="mt-6">
          Valores estimados, sujeitos à confirmação. Prazo e frete são combinados com você.
        </Notice>
        <Link href="/carrinho" className="mt-5 inline-block text-sm underline underline-offset-4">
          Voltar ao carrinho
        </Link>
      </aside>
    </div>
  );
}
