import type { MetadataRoute } from "next";
import { policyPages } from "@/data/policies";
import { siteConfig } from "@/lib/site";
import { getKits, getProducts } from "@/services/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, kits] = await Promise.all([getProducts(), getKits()]);
  const base = siteConfig.url.replace(/\/$/, "");
  const fixed = ["", "/produtos", "/kits", "/personalizados", "/sobre", "/faq", "/contato"];
  return [
    ...fixed.map((p) => ({ url: `${base}${p}` })),
    ...policyPages.map((p) => ({ url: `${base}/${p.slug}` })),
    ...products.map((p) => ({ url: `${base}/produtos/${p.slug}` })),
    ...kits.map((k) => ({ url: `${base}/kits/${k.slug}` })),
  ];
}
