import type { RequestRecord } from "@/types";
import { money } from "./format";
import { whatsappLink } from "./site";

/** Mensagem estruturada enviada ao WhatsApp após a solicitação. */
export function buildRequestMessage(r: RequestRecord): string {
  const lines: string[] = [];
  lines.push("Olá, Astria! Enviei uma solicitação pelo site.");
  lines.push("");
  lines.push(`*Solicitação:* ${r.id}`);
  lines.push(`*Nome:* ${r.customer.name}`);
  lines.push(`*Cidade/UF:* ${r.customer.city}/${r.customer.state}`);

  if (r.type === "sob_medida" && r.project) {
    const p = r.project;
    lines.push("");
    lines.push("*Projeto sob medida*");
    lines.push(`Ideia: ${p.idea}`);
    if (p.description) lines.push(`Descrição: ${p.description}`);
    if (p.reference) lines.push(`Referência: ${p.reference}`);
    if (p.photoName) lines.push(`Foto: ${p.photoName} (vou enviar por aqui)`);
    if (p.dimensions) lines.push(`Dimensões: ${p.dimensions}`);
    if (p.purpose) lines.push(`Finalidade: ${p.purpose}`);
    if (p.colors) lines.push(`Cores: ${p.colors}`);
  } else {
    lines.push("");
    lines.push("*Itens*");
    r.items.forEach((it, i) => {
      const variant = it.variantLabel ? ` (${it.variantLabel})` : "";
      lines.push(`${i + 1}. ${it.name}${variant} x${it.quantity} - ${money(it.unitPrice * it.quantity)}`);
      it.customization.forEach((c) => {
        if (c.value) lines.push(`   • ${c.label}: ${c.value}`);
      });
      if (it.notes) lines.push(`   • Obs.: ${it.notes}`);
    });
    lines.push("");
    lines.push(`*Valor estimado:* ${money(r.estimatedTotal)}`);
    lines.push("(Sujeito a confirmação. Frete a combinar.)");
  }

  if (r.customer.notes) {
    lines.push("");
    lines.push(`*Observações:* ${r.customer.notes}`);
  }
  return lines.join("\n");
}

export function requestWhatsappUrl(r: RequestRecord): string {
  return whatsappLink(buildRequestMessage(r));
}
