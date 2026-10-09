import Image from "next/image";
import type { ProductArt as ProductArtData } from "@/types";
import { cn } from "@/lib/utils";
import { ProductArt } from "./ProductArt";

/**
 * Exibe a fotografia do produto quando existir; senão, a ilustração provisória.
 * Proporção padrão 3:4 (as fotos originais são 2:3 e recebem corte suave).
 */
export function ProductImage({
  images,
  art,
  alt,
  className,
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 40vw, 80vw",
  priority = false,
}: {
  images: string[];
  art: ProductArtData;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const src = images[0];
  if (!src) {
    return <ProductArt art={art} label={`${alt} (ilustração)`} className={cn("aspect-[3/4]", className)} />;
  }
  return (
    <div className={cn("relative aspect-[3/4] overflow-hidden bg-sand", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}
