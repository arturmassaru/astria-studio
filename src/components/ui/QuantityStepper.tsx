"use client";

import { MinusIcon, PlusIcon } from "./icons";

export function QuantityStepper({
  value,
  onChange,
  label = "Quantidade",
  min = 1,
  max = 99,
}: {
  value: number;
  onChange: (next: number) => void;
  label?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex items-center rounded-full border border-stone bg-white"
    >
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-sand disabled:opacity-40"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Diminuir quantidade"
      >
        <MinusIcon width={16} height={16} />
      </button>
      <span className="min-w-8 text-center text-sm tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-sand disabled:opacity-40"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Aumentar quantidade"
      >
        <PlusIcon width={16} height={16} />
      </button>
    </div>
  );
}
