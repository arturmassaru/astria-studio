import type { Metadata } from "next";
import { FormasDeExplorar } from "@/components/home/FormasDeExplorar";
import { Hero } from "@/components/home/Hero";
import { InstagramSection } from "@/components/home/InstagramSection";
import { PersonalizadosSection } from "@/components/home/PersonalizadosSection";
import { Queridinhos } from "@/components/home/Queridinhos";
import { SecaoSazonal } from "@/components/home/SecaoSazonal";
import { SobreSection } from "@/components/home/SobreSection";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.name} · ${siteConfig.slogan}` },
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

/** Revalida a cada hora para que campanhas sazonais entrem e saiam no período certo. */
export const revalidate = 3600;

export default function HomePage() {
  return (
    <>
      <Hero />
      <FormasDeExplorar />
      <Queridinhos />
      <SecaoSazonal />
      <PersonalizadosSection />
      <SobreSection />
      <InstagramSection />
    </>
  );
}
