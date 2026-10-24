export const siteConfig = {
  name: "Astria Studio",
  slogan: "Um universo de possibilidades.",
  tagline: "Ideias que ganham forma.",
  description:
    "A Astria Studio cria objetos, presentes e peças personalizadas. Design, criatividade e personalização para ideias que ganham forma.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  /** Somente dígitos com DDI + DDD. Configure em NEXT_PUBLIC_WHATSAPP_NUMBER. */
  whatsappNumber: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, ""),
  instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com/",
} as const;

export function whatsappLink(message?: string): string {
  const base = siteConfig.whatsappNumber
    ? `https://wa.me/${siteConfig.whatsappNumber}`
    : "https://wa.me/";
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
