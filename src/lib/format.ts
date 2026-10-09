const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function money(value: number): string {
  return brl.format(Number.isFinite(value) ? value : 0);
}

export function percent(value: number, digits = 1): string {
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: digits })}%`;
}

export function dateBR(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}

export function dateTimeBR(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function formatWhatsapp(value: string): string {
  const d = value.replace(/\D/g, "");
  const local = d.length >= 12 && d.startsWith("55") ? d.slice(2) : d;
  if (local.length === 11) return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
  if (local.length === 10) return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  return value;
}

export function todayISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}
