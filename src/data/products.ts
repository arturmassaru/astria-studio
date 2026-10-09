import type { CustomizationField, Product, ProductVariant } from "@/types";

/**
 * Catálogo inicial.
 * - Mini Jesus, Bandeja Nuvem e (kit) Natal: Aconchego são produtos reais da Astria,
 *   com fotografias em /public/products. Os PREÇOS ainda são provisórios.
 * - Os demais itens são demonstrativos (isDemo: true) e servem só para prototipagem.
 * Nunca apresentar dados demonstrativos como dados reais de venda.
 */

const variant = (
  id: string,
  label: string,
  extra: Partial<ProductVariant> = {},
): ProductVariant => ({
  id,
  label,
  price: null,
  promoPrice: null,
  cost: null,
  weightG: null,
  productionDays: null,
  dimensions: null,
  stock: null,
  ...extra,
});

const field = (
  id: string,
  label: string,
  type: CustomizationField["type"],
  extra: Partial<CustomizationField> = {},
): CustomizationField => ({ id, label, type, required: false, options: [], ...extra });

type ProductInput = Partial<Product> &
  Pick<Product, "id" | "slug" | "name" | "shortDescription" | "description" | "art">;

const product = (p: ProductInput): Product => ({
  categoryIds: [],
  tagIds: [],
  price: 0,
  promoPrice: null,
  dimensions: null,
  weightG: null,
  availability: "made_to_order",
  productionDays: null,
  variantLabel: "Opção",
  variants: [],
  customization: [],
  images: [],
  badge: null,
  featured: false,
  featuredOrder: null,
  salesRank: null,
  status: "active",
  isDemo: true,
  trackStock: false,
  stockQty: 0,
  materials: [],
  machineId: null,
  machineHours: null,
  costEstimate: null,
  marginPercent: null,
  ...p,
});

export const productsSeed: Product[] = [
  product({
    id: "prd_mini_jesus",
    slug: "mini-jesus",
    name: "Mini Jesus",
    shortDescription: "Pequena figura sentada para fazer companhia no seu cantinho.",
    description:
      "Um Jesus pequeno e simpático, feito para sentar na borda do monitor, em uma estante ou em qualquer cantinho que mereça um pouco de acolhimento. Uma peça para ter por perto ou para presentear.",
    art: { shape: "figure", tone: "sand" },
    images: ["/products/mini-jesus.jpg"],
    categoryIds: ["cat_presentes", "cat_decoracao"],
    tagIds: ["tag_para_presentear"],
    price: 29.9,
    isDemo: false,
    featured: true,
    featuredOrder: 1,
  }),
  product({
    id: "prd_bandeja_nuvem",
    slug: "bandeja-nuvem",
    name: "Bandeja Nuvem",
    shortDescription: "Bandeja de contorno ondulado em forma de nuvem.",
    description:
      "Uma bandeja de linhas suaves e contorno em forma de nuvem. Organiza perfumes, velas e pequenos objetos, e também serve de base para compor cenas, como um cantinho de Natal.",
    art: { shape: "tray", tone: "peach" },
    images: ["/products/bandeja-nuvem.jpg"],
    categoryIds: ["cat_utilidades", "cat_decoracao"],
    tagIds: ["tag_minimalista", "tag_mesa_posta"],
    price: 59.9,
    isDemo: false,
    featured: true,
    featuredOrder: 2,
  }),
  product({
    id: "prd_sagrada_familia",
    slug: "sagrada-familia",
    name: "Sagrada Família",
    shortDescription: "Conjunto de figuras para presépio minimalista.",
    description:
      "Figuras em harmonia, com formas simplificadas e acabamento delicado. Uma peça para guardar de um Natal ao outro, ou para presentear alguém especial.",
    art: { shape: "family", tone: "lilac" },
    categoryIds: ["cat_natal", "cat_decoracao"],
    tagIds: ["tag_minimalista", "tag_para_presentear"],
    price: 89.9,
    productionDays: 5,
    badge: "Natal",
    featured: true,
    featuredOrder: 3,
  }),
  product({
    id: "prd_mini_arvore",
    slug: "mini-arvore",
    name: "Mini Árvore",
    shortDescription: "Árvore pequena, de linhas limpas, para mesas e estantes.",
    description:
      "Uma árvore de Natal em miniatura, feita para ocupar pouco espaço e trazer o clima da data para qualquer cantinho. Combina com as demais peças da coleção.",
    art: { shape: "tree", tone: "mint" },
    categoryIds: ["cat_natal", "cat_decoracao"],
    tagIds: ["tag_minimalista"],
    price: 34.9,
    productionDays: 3,
    variantLabel: "Altura",
    variants: [variant("v_10", "10 cm", { price: 24.9 }), variant("v_15", "15 cm"), variant("v_22", "22 cm", { price: 49.9 })],
    featured: true,
    featuredOrder: 4,
  }),
  product({
    id: "prd_vaso_canelado",
    slug: "vaso-canelado",
    name: "Vaso Canelado",
    shortDescription: "Vaso decorativo de textura canelada, ótimo para flores secas.",
    description:
      "Silhueta suave e textura canelada. Uma peça que valoriza flores secas, ramos e arranjos simples, e que também se sustenta sozinha como objeto de decoração.",
    art: { shape: "vase", tone: "sky" },
    categoryIds: ["cat_decoracao"],
    tagIds: ["tag_canelado", "tag_minimalista"],
    price: 54.9,
    productionDays: 5,
    variantLabel: "Tamanho",
    variants: [variant("v_p", "P", { price: 44.9 }), variant("v_m", "M"), variant("v_g", "G", { price: 74.9 })],
    customization: [
      field("cor", "Cor", "color", { options: ["Off-white", "Areia", "Azul névoa"], required: true }),
    ],
  }),
  product({
    id: "prd_porta_vela",
    slug: "porta-vela",
    name: "Porta Vela",
    shortDescription: "Porta vela delicado, que pode levar um nome ou uma frase curta.",
    description:
      "Um pequeno objeto para criar atmosfera. Pode ser personalizado com um nome ou uma frase curta, o que o torna um presente com significado.",
    art: { shape: "candle", tone: "rose" },
    categoryIds: ["cat_decoracao", "cat_presentes"],
    tagIds: ["tag_personalizavel", "tag_para_presentear"],
    price: 39.9,
    productionDays: 4,
    variantLabel: "Cor",
    variants: [variant("v_off", "Off-white"), variant("v_rose", "Rosé"), variant("v_grafite", "Grafite")],
    customization: [
      field("texto", "Nome ou frase curta", "text", { maxLength: 20, help: "Até 20 caracteres." }),
    ],
    badge: "Personalizável",
  }),
];
