import { campaignsSeed, isCampaignLive } from "@/data/campaigns";
import { faqSeed } from "@/data/faq";
import { kitsSeed } from "@/data/kits";
import { productsSeed } from "@/data/products";
import { categoriesSeed, tagsSeed } from "@/data/taxonomy";
import type { Campaign, Category, FaqItem, Kit, Product, PublicProduct, Tag } from "@/types";

/**
 * Camada de serviços da loja pública.
 * Hoje lê dados demonstrativos locais; as assinaturas são assíncronas para que a
 * troca por Supabase não exija alterações nas páginas.
 */

/** Remove tudo que é interno antes de enviar um produto para a loja pública. */
export function toPublicProduct(p: Product): PublicProduct {
  const clone: Partial<Product> = { ...p };
  delete clone.trackStock;
  delete clone.stockQty;
  delete clone.materials;
  delete clone.machineId;
  delete clone.machineHours;
  delete clone.costEstimate;
  delete clone.marginPercent;
  return {
    ...(clone as Omit<Product, "variants">),
    variants: p.variants.map((v) => ({
      id: v.id,
      label: v.label,
      price: v.price,
      promoPrice: v.promoPrice,
      weightG: v.weightG,
      productionDays: v.productionDays,
      dimensions: v.dimensions,
    })),
  };
}

export async function getProducts(): Promise<PublicProduct[]> {
  return productsSeed.filter((p) => p.status === "active").map(toPublicProduct);
}

export async function getProductBySlug(slug: string): Promise<PublicProduct | null> {
  const p = productsSeed.find((x) => x.slug === slug && x.status === "active");
  return p ? toPublicProduct(p) : null;
}

export async function getFeaturedProducts(limit = 8): Promise<PublicProduct[]> {
  // Ordem manual de destaque; no futuro: mais vendidos (por período) via salesRank.
  return productsSeed
    .filter((p) => p.status === "active" && p.featured)
    .sort((a, b) => (a.featuredOrder ?? 999) - (b.featuredOrder ?? 999))
    .slice(0, limit)
    .map(toPublicProduct);
}

export async function getRelatedProducts(product: PublicProduct, limit = 4): Promise<PublicProduct[]> {
  return productsSeed
    .filter(
      (p) =>
        p.status === "active" &&
        p.id !== product.id &&
        p.categoryIds.some((c) => product.categoryIds.includes(c)),
    )
    .slice(0, limit)
    .map(toPublicProduct);
}

export async function getCategories(): Promise<Category[]> {
  return categoriesSeed.filter((c) => c.active).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getTags(): Promise<Tag[]> {
  return tagsSeed;
}

export async function getKits(): Promise<Kit[]> {
  return kitsSeed.filter((k) => k.active);
}

export async function getKitBySlug(slug: string): Promise<Kit | null> {
  return kitsSeed.find((k) => k.slug === slug && k.active) ?? null;
}

export async function getLiveCampaigns(now: Date = new Date()): Promise<Campaign[]> {
  return campaignsSeed.filter((c) => isCampaignLive(c, now)).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getFaq(): Promise<FaqItem[]> {
  return [...faqSeed].sort((a, b) => a.sortOrder - b.sortOrder);
}
