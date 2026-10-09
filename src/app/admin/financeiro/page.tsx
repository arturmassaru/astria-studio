"use client";

import { useMemo, useState } from "react";
import { useAccess } from "@/components/admin/role";
import { AdminPage, EmptyState, FormError, Modal, Panel, Stat, Table, Td, Th } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { SelectField, TextField } from "@/components/ui/fields";
import { Notice } from "@/components/ui/primitives";
import { summarize, monthRange, type DateRange } from "@/lib/domain/finance";
import { dateBR, money, todayISO } from "@/lib/format";
import { EXPENSE_LABELS, toOptions } from "@/lib/labels";
import { cols } from "@/lib/store/collections";
import { useCol, useList } from "@/lib/store/core";
import { uid } from "@/lib/utils";
import type { Expense, ExpenseCategory } from "@/types";

type Period = "mes" | "anterior" | "tudo" | "custom";

const blank = (): Expense => ({
  id: uid("exp"),
  date: todayISO(),
  description: "",
  category: "outros",
  kind: "despesa",
  amount: 0,
});

function Line({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 py-2 text-sm ${strong ? "border-t border-stone pt-3 font-medium" : ""}`}>
      <dt>{label}</dt>
      <dd className="tabular-nums">{money(value)}</dd>
    </div>
  );
}

export default function FinanceiroPage() {
  const [orders] = useCol(cols.orders);
  const { items: expenses, upsert, remove } = useList<Expense>(cols.expenses);
  const { canWrite } = useAccess("financeiro");

  const [period, setPeriod] = useState<Period>("mes");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [draft, setDraft] = useState<Expense | null>(null);
  const [error, setError] = useState<string | null>(null);

  const range: DateRange = useMemo(() => {
    if (period === "mes") return monthRange(0);
    if (period === "anterior") return monthRange(-1);
    if (period === "custom") return { from: from || null, to: to || null };
    return { from: null, to: null };
  }, [period, from, to]);

  const { result, cash } = useMemo(() => summarize(orders, expenses, range), [orders, expenses, range]);
  const sorted = useMemo(() => [...expenses].sort((a, b) => b.date.localeCompare(a.date)), [expenses]);
  const empty = orders.length === 0 && expenses.length === 0;

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    if (!draft.description.trim()) return setError("Descreva o lançamento.");
    if (!(draft.amount > 0)) return setError("Informe um valor maior que zero.");
    if (!draft.date) return setError("Informe a data.");
    upsert(draft);
    setDraft(null);
  }

  return (
    <AdminPage
      module="financeiro"
      title="Financeiro"
      description="Resultado (competência, pela data do pedido) e fluxo de caixa (data do dinheiro) são visões separadas. Ferramenta gerencial, não contábil nem fiscal."
      actions={
        <Button
          onClick={() => {
            setDraft(blank());
            setError(null);
          }}
        >
          Novo lançamento
        </Button>
      }
    >
      <div className="mb-6 grid max-w-3xl gap-4 sm:grid-cols-3">
        <SelectField id="fin-periodo" label="Período" value={period} onChange={(e) => setPeriod(e.target.value as Period)}>
          <option value="mes">Mês atual</option>
          <option value="anterior">Mês anterior</option>
          <option value="tudo">Todo o histórico</option>
          <option value="custom">Personalizado</option>
        </SelectField>
        {period === "custom" ? (
          <>
            <TextField id="fin-de" label="De" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            <TextField id="fin-ate" label="Até" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </>
        ) : null}
      </div>

      {empty ? (
        <div className="mb-8">
          <EmptyState
            title="Nada lançado ainda"
            text="Os números nascem de pedidos confirmados, pagamentos registrados e lançamentos manuais. Nenhum valor é inventado."
          />
        </div>
      ) : null}

      {result.missingCost ? (
        <div className="mb-6">
          <Notice tone="warn">
            Há itens vendidos sem custo estimado cadastrado. O lucro abaixo está superestimado até que o custo desses
            produtos seja informado.
          </Notice>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Resultado" description="Pedidos confirmados no período, sem frete.">
          <div className="mb-5 grid gap-4 sm:grid-cols-2">
            <Stat label="Pedidos" value={result.orders} />
            <Stat label="Resultado operacional" value={money(result.operatingResult)} />
          </div>
          <dl>
            <Line label="Vendas" value={result.sales} />
            <Line label="(−) Custos estimados" value={-result.costs} />
            <Line label="Lucro bruto" value={result.grossProfit} strong />
            <Line label="(−) Despesas operacionais" value={-result.operatingExpenses} />
            <Line label="Resultado operacional" value={result.operatingResult} strong />
          </dl>
        </Panel>

        <Panel title="Fluxo de caixa" description="Dinheiro que entrou e saiu no período, independente do pedido.">
          <div className="mb-5 grid gap-4 sm:grid-cols-2">
            <Stat label="Entradas" value={money(cash.receipts)} />
            <Stat label="Saldo do período" value={money(cash.balance)} />
          </div>
          <dl>
            <Line label="Recebimentos (líquidos de estornos)" value={cash.receipts} />
            <Line label="(−) Saídas lançadas" value={-cash.outflows} />
            <Line label="Saldo" value={cash.balance} strong />
          </dl>
        </Panel>
      </div>

      <h2 className="mb-4 mt-10 font-serif text-2xl font-light">Lançamentos manuais</h2>
      {sorted.length === 0 ? (
        <EmptyState title="Nenhum lançamento" text="Registre despesas e custos pagos, como materiais, embalagens e marketing." />
      ) : (
        <Table caption="Lançamentos manuais">
          <thead>
            <tr>
              <Th>Data</Th>
              <Th>Descrição</Th>
              <Th>Categoria</Th>
              <Th>Tipo</Th>
              <Th>Valor</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {sorted.map((x) => (
              <tr key={x.id}>
                <Td>{dateBR(x.date)}</Td>
                <Td>{x.description}</Td>
                <Td>{EXPENSE_LABELS[x.category]}</Td>
                <Td>{x.kind === "custo" ? "Custo" : "Despesa"}</Td>
                <Td className="tabular-nums">{money(x.amount)}</Td>
                <Td className="text-right">
                  {canWrite ? (
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setDraft({ ...x });
                          setError(null);
                        }}
                      >
                        Editar<span className="sr-only"> {x.description}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          if (window.confirm(`Excluir o lançamento "${x.description}"?`)) remove(x.id);
                        }}
                      >
                        Excluir<span className="sr-only"> {x.description}</span>
                      </Button>
                    </div>
                  ) : null}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <p className="mt-3 text-xs text-muted">
        “Custo” já compõe o custo dos pedidos e não entra duas vezes no resultado; apenas “Despesa” reduz o resultado
        operacional. Ambos contam como saída no fluxo de caixa.
      </p>

      <Modal open={draft !== null} onClose={() => setDraft(null)} title="Lançamento">
        {draft ? (
          <form onSubmit={save} noValidate className="space-y-5">
            <TextField
              id="exp-desc"
              label="Descrição"
              required
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                id="exp-data"
                label="Data"
                type="date"
                required
                value={draft.date}
                onChange={(e) => setDraft({ ...draft, date: e.target.value })}
              />
              <TextField
                id="exp-valor"
                label="Valor (R$)"
                type="number"
                step="0.01"
                min="0"
                required
                value={draft.amount || ""}
                onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) })}
              />
              <SelectField
                id="exp-cat"
                label="Categoria"
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value as ExpenseCategory })}
              >
                {toOptions(EXPENSE_LABELS).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </SelectField>
              <SelectField
                id="exp-tipo"
                label="Tipo"
                value={draft.kind}
                onChange={(e) => setDraft({ ...draft, kind: e.target.value as Expense["kind"] })}
              >
                <option value="despesa">Despesa (reduz o resultado)</option>
                <option value="custo">Custo (já está nos pedidos)</option>
              </SelectField>
            </div>
            <FormError message={error} />
            <div className="flex gap-3">
              <Button type="submit">Salvar</Button>
              <Button variant="ghost" onClick={() => setDraft(null)}>
                Cancelar
              </Button>
            </div>
          </form>
        ) : null}
      </Modal>
    </AdminPage>
  );
}
