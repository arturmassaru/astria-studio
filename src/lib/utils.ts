export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function uid(prefix = "id"): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 10)
      : Math.random().toString(36).slice(2, 12);
  return `${prefix}_${random}`;
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** Normaliza WhatsApp brasileiro para comparar duplicidade (remove DDI 55). */
export function normalizeWhatsapp(value: string): string {
  const digits = onlyDigits(value);
  if (digits.length >= 12 && digits.startsWith("55")) return digits.slice(2);
  return digits;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
