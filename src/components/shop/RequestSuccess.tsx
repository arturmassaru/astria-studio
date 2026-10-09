"use client";

import type { RequestRecord } from "@/types";
import { ButtonLink } from "@/components/ui/Button";
import { Notice } from "@/components/ui/primitives";
import { Ornament } from "@/components/ui/Ornament";
import { siteConfig } from "@/lib/site";
import { requestWhatsappUrl } from "@/lib/whatsapp";

export function RequestSuccess({ record }: { record: RequestRecord }) {
  return (
    <div className="mx-auto max-w-xl text-center">
      <Ornament kind="star" className="mx-auto h-8 w-8 text-gold" />
      <h2 className="mt-6 font-serif text-4xl font-light tracking-tight">Solicitação enviada</h2>
      <p className="mt-4 text-muted">
        Código da solicitação:{" "}
        <strong className="font-medium tracking-wider text-ink">{record.id}</strong>
      </p>
      <p className="mx-auto mt-6 max-w-md leading-relaxed text-muted">
        Agora é só abrir o WhatsApp: a mensagem já vai preenchida com os detalhes. Vamos conferir
        tudo com você, combinar prazo e frete e, depois da confirmação, o pedido é oficializado.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href={requestWhatsappUrl(record)} external size="lg">
          Abrir WhatsApp
        </ButtonLink>
        <ButtonLink href="/produtos" variant="outline" size="lg">
          Continuar explorando
        </ButtonLink>
      </div>

      {!siteConfig.whatsappNumber ? (
        <Notice tone="warn" className="mt-8 text-left">
          O número de WhatsApp da Astria ainda não foi configurado neste ambiente
          (NEXT_PUBLIC_WHATSAPP_NUMBER). O WhatsApp abrirá com a mensagem pronta para você escolher o
          contato.
        </Notice>
      ) : null}

      <p className="mt-8 text-xs text-muted">
        Importante: esta solicitação não é uma compra. Ela não gera cobrança, não reserva estoque e
        não inicia a produção.
      </p>
    </div>
  );
}
