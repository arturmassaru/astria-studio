import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const inputBase =
  "w-full rounded-lg border border-stone bg-white px-4 py-3 text-[0.95rem] text-ink placeholder:text-taupe transition-colors focus:border-ink focus:outline-none focus-visible:outline-none";

function FieldShell({
  id,
  label,
  help,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  help?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
        {required ? <span className="text-muted"> *</span> : null}
      </label>
      {children}
      {help && !error ? (
        <p id={`${id}-help`} className="mt-1.5 text-xs text-muted">
          {help}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-red-800">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type Common = { id: string; label: string; help?: string; error?: string };

export function TextField({
  id,
  label,
  help,
  error,
  className,
  ...rest
}: Common & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldShell id={id} label={label} help={help} error={error} required={rest.required}>
      <input
        id={id}
        className={cn(inputBase, error && "border-red-400", className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : help ? `${id}-help` : undefined}
        {...rest}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  id,
  label,
  help,
  error,
  className,
  ...rest
}: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldShell id={id} label={label} help={help} error={error} required={rest.required}>
      <textarea
        id={id}
        rows={4}
        className={cn(inputBase, "resize-y", error && "border-red-400", className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : help ? `${id}-help` : undefined}
        {...rest}
      />
    </FieldShell>
  );
}

export function SelectField({
  id,
  label,
  help,
  error,
  className,
  children,
  ...rest
}: Common & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <FieldShell id={id} label={label} help={help} error={error} required={rest.required}>
      <select
        id={id}
        className={cn(inputBase, "appearance-none bg-[length:1rem] pr-10", error && "border-red-400", className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : help ? `${id}-help` : undefined}
        {...rest}
      >
        {children}
      </select>
    </FieldShell>
  );
}

export const BR_STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
] as const;
