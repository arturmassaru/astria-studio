"use client";

import { useEffect, useState } from "react";
import { AdminPage, FormError, Panel } from "@/components/admin/ui";
import { useAccess } from "@/components/admin/role";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/fields";
import { Notice } from "@/components/ui/primitives";
import { cols } from "@/lib/store/collections";
import { resetCol, useCol } from "@/lib/store/core";
import type { Settings } from "@/types";

const numOrNull = (v: string) => (v.trim() === "" ? null : Number(v));

export default function ConfiguracoesPage() {
  const [settings, setSettings] = useCol<Settings>(cols.settings);
  const { canWrite } = useAccess("configuracoes");
  const [draft, setDraft] = useState<Settings>(settings);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (draft.energyTariffPerKwh !== null && draft.energyTariffPerKwh < 0) return setError("A tarifa não pode ser negativa.");
    if (
      draft.globalMarginPercent !== null &&
      (draft.globalMarginPercent < 0 || draft.globalMarginPercent >= 100)
    )
      return setError("A margem global deve estar entre 0 e 99,99%.");
    if (draft.lossPercent < 0) return setError("O percentual de perdas não pode ser negativo.");
    setError(null);
    setSettings(draft);
    setSaved(true);
  }

  function resetDemo() {
    const keys = Object.values(cols);
    if (
      window.confirm(
        "Apagar TODOS os dados deste navegador (carrinho, solicitações, pedidos, estoque, materiais e cadastros editados)? Os dados de demonstração originais voltam.",
      )
    ) {
      keys.forEach((c) => resetCol(c));
    }
  }

  return (
    <AdminPage
      module="configuracoes"
      title="Configurações gerais"
      description="Parâmetros do negócio usados em custos e precificação. Nada aqui é fixado em código."
    >
      <form onSubmit={save} noValidate className="max-w-2xl space-y-8">
        <Panel title="Negócio">
          <div className="space-y-5">
            <TextField
              id="cfg-nome"
              label="Nome"
              value={draft.businessName}
              disabled={!canWrite}
              onChange={(e) => setDraft({ ...draft, businessName: e.target.value })}
            />
            <TextField
              id="cfg-whats"
              label="WhatsApp da Astria (referência)"
              value={draft.whatsapp}
              disabled={!canWrite}
              onChange={(e) => setDraft({ ...draft, whatsapp: e.target.value })}
              help="O número usado nos links da loja é definido por NEXT_PUBLIC_WHATSAPP_NUMBER."
            />
          </div>
        </Panel>

        <Panel title="Custos e precificação" description="Mão de obra não é incluída no custo nesta versão.">
          <div className="space-y-5">
            <TextField
              id="cfg-tarifa"
              label="Tarifa de energia (R$ por kWh)"
              type="number"
              step="0.0001"
              inputMode="decimal"
              disabled={!canWrite}
              value={draft.energyTariffPerKwh ?? ""}
              onChange={(e) => setDraft({ ...draft, energyTariffPerKwh: numOrNull(e.target.value) })}
              help="Sem tarifa, o custo de energia não é calculado."
            />
            <TextField
              id="cfg-margem"
              label="Margem de referência global (%)"
              type="number"
              step="0.1"
              inputMode="decimal"
              disabled={!canWrite}
              value={draft.globalMarginPercent ?? ""}
              onChange={(e) => setDraft({ ...draft, globalMarginPercent: numOrNull(e.target.value) })}
              help="Margem sobre o preço de venda. Prioridade: produto > categoria > global."
            />
            <TextField
              id="cfg-perdas"
              label="Perdas sobre materiais (%)"
              type="number"
              step="0.1"
              inputMode="decimal"
              disabled={!canWrite}
              value={draft.lossPercent}
              onChange={(e) => setDraft({ ...draft, lossPercent: Number(e.target.value || 0) })}
              help="Acrescentado ao custo de materiais na estimativa."
            />
          </div>
        </Panel>

        <Panel
          title="Participantes da distribuição"
          description="Sugestão inicial para dividir o resultado de cada pedido. Os percentuais devem somar 100%."
        >
          <div className="space-y-3">
            {draft.participants.map((p, i) => (
              <div key={i} className="grid grid-cols-[1fr_7rem_auto] items-end gap-3">
                <TextField
                  id={`part-n-${i}`}
                  label="Nome"
                  value={p.name}
                  disabled={!canWrite}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      participants: draft.participants.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)),
                    })
                  }
                />
                <TextField
                  id={`part-p-${i}`}
                  label="%"
                  type="number"
                  step="0.01"
                  value={p.percent}
                  disabled={!canWrite}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      participants: draft.participants.map((x, j) =>
                        j === i ? { ...x, percent: Number(e.target.value || 0) } : x,
                      ),
                    })
                  }
                />
                <Button
                  variant="ghost"
                  disabled={!canWrite}
                  onClick={() =>
                    setDraft({ ...draft, participants: draft.participants.filter((_, j) => j !== i) })
                  }
                >
                  Remover
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              disabled={!canWrite}
              onClick={() =>
                setDraft({ ...draft, participants: [...draft.participants, { name: "", percent: 0 }] })
              }
            >
              Adicionar participante
            </Button>
          </div>
        </Panel>

        <FormError message={error} />
        {saved && !error ? <Notice tone="ok">Configurações salvas.</Notice> : null}
        {canWrite ? <Button type="submit">Salvar configurações</Button> : null}
      </form>

      {canWrite ? (
        <Panel
          title="Dados de demonstração"
          description="Os dados ficam só neste navegador enquanto o Supabase não estiver conectado."
          className="mt-12 max-w-2xl"
        >
          <Button variant="outline" onClick={resetDemo}>
            Restaurar dados de demonstração
          </Button>
        </Panel>
      ) : null}
    </AdminPage>
  );
}
