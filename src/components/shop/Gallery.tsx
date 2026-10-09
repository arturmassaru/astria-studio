"use client";

import { useState } from "react";
import type { ProductArt } from "@/types";
import { ProductImage } from "@/components/ui/ProductImage";
import { cn } from "@/lib/utils";

export function Gallery({
  images,
  art,
  alt,
}: {
  images: string[];
  art: ProductArt;
  alt: string;
}) {
  const [index, setIndex] = useState(0);
  const current = images.length > 0 ? [images[index]] : [];
  return (
    <div>
      <ProductImage
        images={current}
        art={art}
        alt={alt}
        priority
        sizes="(min-width: 1024px) 45vw, 100vw"
        className="rounded-[1.5rem]"
      />
      {images.length > 1 ? (
        <ul className="mt-3 flex gap-3" aria-label="Fotos do produto">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Ver foto ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "w-16 overflow-hidden rounded-lg border-2",
                  i === index ? "border-ink" : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <ProductImage images={[src]} art={art} alt="" sizes="64px" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
