export type ID = string;

export interface Category {
  id: ID;
  slug: string;
  name: string;
  description?: string;
  sortOrder: number;
  active: boolean;
  /** Margem de referência da categoria (%). Sobrescreve a global; o produto sobrescreve a categoria. */
  marginPercent: number | null;
}

export interface Tag {
  id: ID;
  slug: string;
  name: string;
}

/** Ilustração provisória até existirem fotografias reais dos produtos. */
export type ArtShape =
  | "figure"
  | "family"
  | "tray"
  | "vase"
  | "candle"
  | "tree"
  | "kit"
  | "generic";
export type ArtTone = "rose" | "lilac" | "sky" | "mint" | "peach" | "sand" | "gold";
export interface ProductArt {
  shape: ArtShape;
  tone: ArtTone;
}

export type CustomizationFieldType =
  | "text"
  | "name"
  | "color"
  | "model"
  | "size"
  | "select"
  | "upload"
  | "notes";

export interface CustomizationField {
  id: ID;
  label: string;
  type: CustomizationFieldType;
  required: boolean;
  options: string[];
  help?: string;
  maxLength?: number;
}

export interface ProductVariant {
  id: ID;
  label: string;
  /** Preço próprio da variante; se nulo, usa o do produto. */
  price: number | null;
  promoPrice: number | null;
  /** INTERNO */
  cost: number | null;
  weightG: number | null;
  productionDays: number | null;
  dimensions: string | null;
  /** INTERNO */
  stock: number | null;
}

export type ProductStatus = "draft" | "active" | "archived";
export type Availability = "in_stock" | "made_to_order" | "out_of_stock";

export interface MaterialUsage {
  materialId: ID;
  quantity: number;
}

export interface Product {
  id: ID;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  categoryIds: ID[];
  tagIds: ID[];
  price: number;
  promoPrice: number | null;
  dimensions: string | null;
  weightG: number | null;
  availability: Availability;
  productionDays: number | null;
  /** Nome do eixo de variação (ex.: Tamanho, Cor, Modelo, Acabamento). */
  variantLabel: string;
  variants: ProductVariant[];
  customization: CustomizationField[];
  images: string[];
  art: ProductArt;
  badge: string | null;
  featured: boolean;
  featuredOrder: number | null;
  /** Posição em "mais vendidos" (preenchido pelo sistema no futuro). */
  salesRank: number | null;
  status: ProductStatus;
  /** Dado demonstrativo; nunca apresentar como venda real. */
  isDemo: boolean;

  // ---- INTERNO (nunca exibir publicamente) ----
  trackStock: boolean;
  stockQty: number;
  materials: MaterialUsage[];
  machineId: ID | null;
  machineHours: number | null;
  costEstimate: number | null;
  marginPercent: number | null;
}

export type PublicVariant = Omit<ProductVariant, "cost" | "stock">;

/** O que a loja pública pode receber. Campos internos são removidos. */
export type PublicProduct = Omit<
  Product,
  | "trackStock"
  | "stockQty"
  | "materials"
  | "machineId"
  | "machineHours"
  | "costEstimate"
  | "marginPercent"
  | "variants"
> & { variants: PublicVariant[] };

export interface KitItem {
  productId: ID;
  quantity: number;
}

export interface Kit {
  id: ID;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  items: KitItem[];
  /** Preço fixo opcional; se nulo, soma dos itens menos o desconto. */
  fixedPrice: number | null;
  discountPercent: number;
  images: string[];
  art: ProductArt;
  availability: Availability;
  active: boolean;
  featured: boolean;
  isDemo: boolean;
}

export interface Campaign {
  id: ID;
  slug: string;
  title: string;
  kicker: string;
  description: string;
  ctaLabel: string;
  href: string;
  art: ProductArt;
  /** Fotografia da campanha (opcional); sem ela usa a ilustração. */
  image?: string | null;
  sortOrder: number;
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
}

export type FaqCategory =
  | "Como comprar"
  | "Personalizados"
  | "Produção e prazo"
  | "Entrega"
  | "Pagamento"
  | "Trocas e cancelamentos"
  | "Sobre a Astria";

export interface FaqItem {
  id: ID;
  category: FaqCategory;
  question: string;
  answer: string;
  sortOrder: number;
}
