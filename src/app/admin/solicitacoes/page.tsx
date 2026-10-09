"use client";

import Link from "next/link";
import { useState } from "react";
import { useAccess } from "@/components/admin/role";
import { AdminPage, EmptyState, FormError, Modal, Pill, Table, Td, Th } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/fields";
import { Notice } from "@/components/ui/primitives";
import { confirmRequest, setRequestNotes, setRequestStatus } from "@/lib/domain/actions";
import { dateTimeBR, formatWhatsapp, money } from "@/lib/format";
import { DELIVERY_MODE_LABELS, REQUEST_LABELS, REQUEST_TONES, toOptions } from "@/lib/labels";
import { cols } from "@/lib/store/collections";
import { useCol } from "@/lib/store/core";
import { normalizeWhatsapp } from "@/lib/utils";
import type { DeliveryMode, RequestRecord } from "@/types";

function ConfirmDialog({ request, onClose }: { request: RequestRecord | null; onClose: () => void }) {
  const [deadline, setDeadline] = useState("");
  const [mode, setMode] = useState<DeliveryMode>("retirada");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!request) return;
    const res = confirmRequest(request.id, {
      deadline: deadline || null,
      deliveryMode: mode,
      customPrice: price === "" ? undefined : Number(price),
    });
    if (!res.ok) return setError(res.error);
    setCreatedCode(res.data.code);
  }

  return (
    <Modal open={request !== null} onClose={onClose} title="Confirmar e criar pedido">
      {request ? (
        createdCode ? (
          <div className="space-y-5">
            <Notice tone="ok">
              Pedido <strong>{createdCode}</strong> criado. O cliente foi cadastrado (ou reaproveitado
              pelo WhatsApp) e o estoque de produtos controlados foi reduzido.
            </Notice>
            <div className="flex gap-3">
              <Link href="/admin/pedidos" className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-cream">
                Ir para Pedidos
              </Link>
              <Button variant="ghost" onClick={onClose}>
                Fechar
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-5">
            <p className="text-sm text-muted">
              A confirmação comercial transforma a solicitação {request.id} em pedido oficial. Pagamento e
              produção continuam independentes.
            </p>
            {request.type === "sob_medida" ? (
              <TextField
                id="cf-preco"
                label="Preço combinado do projeto (R$)"
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                help="Projetos sob medida não têm preço automático: informe o valor combinado."
              />
            ) : null}
            <TextField
              id="cf-prazo"
              label="Prazo de entrega (opcional agora)"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              help="A produção só é liberada com prazo definido, pagamento integral e pedido confirmado (ou exceção autorizada)."
            />
            <SelectField id="cf-modo" label="Modalidade" value={mode} onChange={(e) => setMode(e.target.value as DeliveryMode)}>
              {toOptions(DELIVERY_MODE_LABELS).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </SelectField>
            <FormError message={error} />
            <div className="flex gap-3">
              <Button type="submit">Confirmar pedido</Button>
              <Button variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </form>
        )
      ) : null}
    </Modal>
  );
}

export default function SolicitacoesPage() {
  const [requests] = useCol(cols.requests);
  const { canWrite } = useAccess("solicitacoes");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<RequestRecord | null>(null);
  const [filter, setFilter] = useState<"todas" | RequestRecord["status"]>("todas");

  const selected = requests.find((r) => r.id === selectedId) ?? null;
  const list = filter === "todas" ? requests : requests.filter((r) => r.status === filter);

  return (
    <AdminPage
      module="solicitacoes"
      title="Solicitações"
      description="Pedidos de conversa vindos da loja. Uma solicitação não é venda, não consome estoque e não libera produção. Ela só vira pedido depois da confirmação comercial."
    >
      <div className="mb-6 max-w-xs">
        <SelectField id="sol-filtro" label="Filtrar por status" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
          <option value="todas">Todas</option>
          {toOptions(REQUEST_LABELS).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </SelectField>
      </div>

      {list.length === 0 ? (
        <EmptyState
          title="Nenhuma solicitação"
          text="Quando alguém enviar uma solicitação pela loja (carrinho ou projeto sob medida), ela aparece aqui."
        />
      ) : (
        <Table caption="Solicitações">
          <thead>
            <tr>
              <Th>Código</Th>
              <Th>Data</Th>
              <Th>Cliente</Th>
              <Th>Tipo</Th>
              <Th>Estimado</Th>
              <Th>Status</Th>
              <Th className="text-right">Ações</Th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id}>
                <Td className="font-medium tabular-nums">{r.id}</Td>
                <Td>{dateTimeBR(r.createdAt)}</Td>
                <Td>
                  {r.customer.name}
                  <span className="block text-xs text-muted">{formatWhatsapp(r.customer.whatsapp)}</span>
                </Td>
                <Td>{r.type === "sob_medida" ? "Sob medida" : "Carrinho"}</Td>
                <Td className="tabular-nums">{r.type === "sob_medida" ? "A combinar" : money(r.estimatedTotal)}</Td>
                <Td>
                  <Pill tone={REQUEST_TONES[r.status]}>{REQUEST_LABELS[r.status]}</Pill>
                </Td>
                <Td className="text-right">
                  <Button variant="outline" onClick={() => setSelectedId(r.id)}>
                    Abrir<span className="sr-only"> {r.id}</span>
                  </Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal open={selected !== null} onClose={() => setSelectedId(null)} title={selected ? `Solicitação ${selected.id}` : ""} wide>
        {selected ? (
          <div className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted">Cliente</h3>
                <p className="mt-2 font-medium">{selected.customer.name}</p>
                <p className="text-sm">{formatWhatsapp(selected.customer.whatsapp)}</p>
                <p className="text-sm text-muted">
                  {selected.customer.city}/{selected.customer.state}
                </p>
                {selected.customer.notes ? <p className="mt-2 text-sm">Obs.: {selected.customer.notes}</p> : null}
                <a
                  href={`https://wa.me/55${normalizeWhatsapp(selected.customer.whatsapp)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm underline underline-offset-4"
                >
                  Abrir conversa no WhatsApp
                </a>
              </div>
              <div>
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted">Situação</h3>
                <p className="mt-2">
                  <Pill tone={REQUEST_TONES[selected.status]}>{REQUEST_LABELS[selected.status]}</Pill>
                </p>
                <p className="mt-2 text-sm text-muted">Recebida em {dateTimeBR(selected.createdAt)}</p>
              </div>
            </div>

            {selected.type === "sob_medida" && selected.project ? (
              <section>
                <h3 className="mb-3 font-serif text-xl font-light">Projeto sob medida</h3>
                <dl className="grid gap-2 text-sm sm:grid-cols-[10rem_1fr]">
                  {(
                    [
                      ["Ideia", selected.project.idea],
                      ["Descrição", selected.project.description],
                      ["Referência", selected.project.reference],
                      ["Foto", selected.project.photoName],
                      ["Dimensões", selected.project.dimensions],
                      ["Finalidade", selected.project.purpose],
                      ["Cores", selected.project.colors],
                    ] as const
                  )
                    .filter(([, v]) => v)
                    .map(([k, v]) => (
                      <div key={k} className="contents">
                        <dt className="text-muted">{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                </dl>
              </section>
            ) : (
              <section>
                <h3 className="mb-3 font-serif text-xl font-light">Itens</h3>
                <Table caption="Itens da solicitação">
                  <thead>
                    <tr>
                      <Th>Item</Th>
                      <Th>Qtd.</Th>
                      <Th>Unitário</Th>
                      <Th>Total</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.items.map((i, idx) => (
                      <tr key={idx}>
                        <Td>
                          <span className="font-medium">{i.name}</span>
                          {i.variantLabel ? <span className="block text-xs text-muted">{i.variantLabel}</span> : null}
                          {i.customization.map((c) => (
                            <span key={c.fieldId} className="block text-xs text-muted">
                              {c.label}: {c.value}
                            </span>
                          ))}
                          {i.notes ? <span className="block text-xs text-muted">Obs.: {i.notes}</span> : null}
                        </Td>
                        <Td>{i.quantity}</Td>
                        <Td className="tabular-nums">{money(i.unitPrice)}</Td>
                        <Td className="tabular-nums">{money(i.unitPrice * i.quantity)}</Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <p className="mt-3 text-right text-sm font-medium">Total estimado: {money(selected.estimatedTotal)}</p>
              </section>
            )}

            <TextAreaField
              id="sol-notas"
              label="Notas internas"
              rows={3}
              value={selected.internalNotes}
              disabled={!canWrite}
              onChange={(e) => setRequestNotes(selected.id, e.target.value)}
            />

            {canWrite ? (
              <div className="flex flex-wrap gap-3 border-t border-stone pt-6">
                {selected.status !== "convertida" && selected.status !== "cancelada" ? (
                  <>
                    <Button onClick={() => setConfirming(selected)}>Confirmar e criar pedido</Button>
                    {selected.status === "nova" ? (
                      <Button variant="outline" onClick={() => setRequestStatus(selected.id, "em_analise")}>
                        Marcar em análise
                      </Button>
                    ) : null}
                    <Button variant="ghost" onClick={() => setRequestStatus(selected.id, "cancelada")}>
                      Cancelar solicitação
                    </Button>
                  </>
                ) : null}
                {selected.status === "cancelada" ? (
                  <Button variant="outline" onClick={() => setRequestStatus(selected.id, "nova")}>
                    Reabrir
                  </Button>
                ) : null}
                {selected.status === "convertida" ? (
                  <Link href="/admin/pedidos" className="text-sm underline underline-offset-4">
                    Ver pedido gerado
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog key={confirming?.id ?? "none"} request={confirming} onClose={() => setConfirming(null)} />
    </AdminPage>
  );
}
