import type { Kit } from "@/types";

/**
 * Kits compostos por produtos existentes (sem duplicar entidades).
 * "Aconchego" é um kit real (com fotografia); "Ornare" ainda é demonstrativo.
 * Preços e descontos são provisórios.
 */
export const kitsSeed: Kit[] = [
  {
    id: "kit_natal_aconchego",
    slug: "kit-natal-aconchego",
    name: "Kit Natal: Aconchego",
    shortDescription: "Um cantinho de Natal pronto para presentear.",
    description:
      "Sagrada Família e mini árvore sobre a Bandeja Nuvem: uma cena pronta para acender o clima de Natal em qualquer mesa ou aparador. Cada peça continua disponível individualmente.",
    items: [
      { productId: "prd_sagrada_familia", quantity: 1 },
      { productId: "prd_mini_arvore", quantity: 1 },
      { productId: "prd_bandeja_nuvem", quantity: 1 },
    ],
    fixedPrice: null,
    discountPercent: 10,
    images: ["/products/kit-natal-aconchego.jpg"],
    art: { shape: "kit", tone: "rose" },
    availability: "made_to_order",
    active: true,
    featured: true,
    isDemo: false,
  },
  {
    id: "kit_natal_ornare",
    slug: "kit-natal-ornare",
    name: "Kit Natal: Ornare",
    shortDescription: "Composição para a mesa e para o presépio.",
    description:
      "Mini Jesus, mini árvore e porta vela reunidos para ornar a casa no Natal. Cada peça continua disponível individualmente.",
    items: [
      { productId: "prd_mini_jesus", quantity: 1 },
      { productId: "prd_mini_arvore", quantity: 1 },
      { productId: "prd_porta_vela", quantity: 1 },
    ],
    fixedPrice: null,
    discountPercent: 8,
    images: [],
    art: { shape: "kit", tone: "mint" },
    availability: "made_to_order",
    active: true,
    featured: false,
    isDemo: true,
  },
];
