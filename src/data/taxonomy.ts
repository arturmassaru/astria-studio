import type { Category, Tag } from "@/types";

export const categoriesSeed: Category[] = [
  { id: "cat_decoracao", slug: "decoracao", name: "Decoração", description: "Peças para dar personalidade aos ambientes.", sortOrder: 1, active: true, marginPercent: null },
  { id: "cat_utilidades", slug: "utilidades", name: "Utilidades", description: "Objetos úteis com cuidado de design.", sortOrder: 2, active: true, marginPercent: null },
  { id: "cat_presentes", slug: "presentes", name: "Presentes", description: "Para presentear com significado.", sortOrder: 3, active: true, marginPercent: null },
  { id: "cat_natal", slug: "natal", name: "Natal", description: "Peças para a época mais afetiva do ano.", sortOrder: 4, active: true, marginPercent: null },
];

export const tagsSeed: Tag[] = [
  { id: "tag_canelado", slug: "canelado", name: "Canelado" },
  { id: "tag_minimalista", slug: "minimalista", name: "Minimalista" },
  { id: "tag_para_presentear", slug: "para-presentear", name: "Para presentear" },
  { id: "tag_personalizavel", slug: "personalizavel", name: "Personalizável" },
  { id: "tag_mesa_posta", slug: "mesa-posta", name: "Mesa posta" },
];
