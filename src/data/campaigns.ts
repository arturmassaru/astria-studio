import type { Campaign } from "@/types";

/**
 * Campanhas sazonais. A Home exibe as ativas dentro do período.
 * Futuramente administráveis (imagem, título, descrição, CTA, destino, ordem, período).
 */
export const campaignsSeed: Campaign[] = [
  {
    id: "camp_natal",
    slug: "natal",
    title: "Natal na Astria",
    kicker: "Coleção sazonal",
    description:
      "Presépios, árvores e pequenos objetos para criar um Natal com a sua cara. Peças para guardar, kits para presentear.",
    ctaLabel: "Ver coleção de Natal",
    href: "/produtos?categoria=natal",
    art: { shape: "tree", tone: "mint" },
    image: "/products/kit-natal-aconchego.jpg",
    sortOrder: 1,
    active: true,
    startsAt: "2026-10-01",
    endsAt: "2027-01-06",
  },
  { id: "camp_pascoa", slug: "pascoa", title: "Páscoa", kicker: "Coleção sazonal", description: "Em breve.", ctaLabel: "Ver coleção", href: "/produtos", art: { shape: "generic", tone: "peach" }, sortOrder: 2, active: false, startsAt: null, endsAt: null },
  { id: "camp_maes", slug: "dia-das-maes", title: "Dia das Mães", kicker: "Coleção sazonal", description: "Em breve.", ctaLabel: "Ver coleção", href: "/produtos", art: { shape: "generic", tone: "rose" }, sortOrder: 3, active: false, startsAt: null, endsAt: null },
  { id: "camp_professores", slug: "dia-dos-professores", title: "Dia dos Professores", kicker: "Coleção sazonal", description: "Em breve.", ctaLabel: "Ver coleção", href: "/produtos", art: { shape: "generic", tone: "sky" }, sortOrder: 4, active: false, startsAt: null, endsAt: null },
  { id: "camp_halloween", slug: "halloween", title: "Halloween", kicker: "Coleção sazonal", description: "Em breve.", ctaLabel: "Ver coleção", href: "/produtos", art: { shape: "generic", tone: "lilac" }, sortOrder: 5, active: false, startsAt: null, endsAt: null },
  { id: "camp_especiais", slug: "colecoes-especiais", title: "Coleções especiais", kicker: "Edição limitada", description: "Em breve.", ctaLabel: "Ver coleção", href: "/produtos", art: { shape: "generic", tone: "gold" }, sortOrder: 6, active: false, startsAt: null, endsAt: null },
];

export function isCampaignLive(c: Campaign, now: Date = new Date()): boolean {
  if (!c.active) return false;
  const t = now.getTime();
  if (c.startsAt && t < new Date(c.startsAt).getTime()) return false;
  if (c.endsAt && t > new Date(`${c.endsAt}T23:59:59`).getTime()) return false;
  return true;
}
