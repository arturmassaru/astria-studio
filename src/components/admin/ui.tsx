"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import type { AdminModule } from "@/types";
import { CloseIcon } from "@/components/ui/icons";
import { MODULE_LABELS } from "@/lib/permissions";
import { useHydrated } from "@/lib/store/core";
import type { Tone } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { useAccess } from "./role";

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */

export function AdminPage({
  module,
  title,
  description,
  actions,
  children,
}: {
  module: AdminModule;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const hydrated = useHydrated();
  const { canRead, canWrite } = useAccess(module);

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-light tracking-tight sm:text-4xl">{title}</h1>
          {description ? <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p> : null}
        </div>
        {hydrated && canRead && canWrite ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </header>

      {!hydrated ? (
        <p className="text-sm text-muted">Carregando…</p>
      ) : !canRead ? (
        <EmptyState
          title="Sem permissão"
          text={`O perfil atual não tem acesso ao módulo ${MODULE_LABELS[module]}.`}
        />
      ) : (
        <>
          {!canWrite ? (
            <p className="mb-6 rounded-lg border border-stone bg-sand px-4 py-3 text-sm">
              Modo somente leitura neste módulo para o perfil atual.
            </p>
          ) : null}
          {children}
        </>
      )}
    </div>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-stone bg-white p-5 sm:p-6", className)}>
      {title ? (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-light">{title}</h2>
            {description ? <p className="mt-1 text-xs text-muted">{description}</p> : null}
          </div>
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: Tone;
}) {
  return (
    <div className="rounded-2xl border border-stone bg-white p-5">
      <p className="text-xs uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-3 font-serif text-3xl font-light tabular-nums">{value}</p>
      {hint ? (
        <p className={cn("mt-2 text-xs", tone === "danger" ? "text-red-800" : "text-muted")}>{hint}</p>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  text,
  action,
}: {
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-stone px-6 py-14 text-center">
      <p className="font-serif text-2xl font-light">{title}</p>
      {text ? <p className="mx-auto mt-2 max-w-md text-sm text-muted">{text}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

const pillTones: Record<Tone, string> = {
  neutral: "bg-sand text-ink",
  ok: "bg-mint text-ink",
  warn: "bg-peach text-ink",
  info: "bg-sky text-ink",
  danger: "bg-rose text-ink",
  gold: "bg-gold-soft text-ink",
};

export function Pill({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium",
        pillTones[tone],
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Tabela                                                              */
/* ------------------------------------------------------------------ */

export function Table({ children, caption }: { children: ReactNode; caption?: string }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-stone bg-white">
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        {children}
      </table>
    </div>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={cn(
        "border-b border-stone bg-sand/60 px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn("border-b border-stone/60 px-4 py-3 align-top", className)}>{children}</td>;
}

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        "m-auto max-h-[92vh] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl border border-stone bg-cream p-0 text-ink backdrop:bg-ink/40",
        wide ? "max-w-4xl" : "max-w-xl",
      )}
    >
      {open ? (
        <div className="p-6 sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <h2 id={titleId} className="font-serif text-2xl font-light">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="rounded-full p-2 hover:bg-sand"
            >
              <CloseIcon width={18} height={18} />
            </button>
          </div>
          {children}
        </div>
      ) : null}
    </dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Campos auxiliares                                                   */
/* ------------------------------------------------------------------ */

export function CheckField({
  id,
  label,
  checked,
  onChange,
  help,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  help?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-center gap-3 text-sm">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 accent-ink"
        />
        {label}
      </label>
      {help ? <p className="mt-1 pl-7 text-xs text-muted">{help}</p> : null}
    </div>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
      {message}
    </p>
  );
}
