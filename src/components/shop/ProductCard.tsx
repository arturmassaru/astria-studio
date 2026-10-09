import Link from "next/link";
import type { Kit, PublicProduct } from "@/types";
import { Badge, Price } from "@/components/ui/primitives";
import { ProductImage } from "@/components/ui/ProductImage";
import { cn } from "@/lib/utils";

interface CardProps {
  href: string;
  name: string;
  category?: string;
  price: number;
  list?: number;
  badge?: string | null;
  images: string[];
  art: PublicProduct["art"] | Kit["art"];
  /** Texto "a partir de" quando há variantes com preços diferentes. */
  from?: boolean;
  className?: string;
  sizes?: string;
}

export function ProductCard({
  href,
  name,
  category,
  price,
  list,
  badge,
  images,
  art,
  from,
  className,
  sizes,
}: CardProps) {
  return (
    <article className={cn("group", className)}>
      <Link href={href} className="block">
        <div className="relative overflow-hidden rounded-[1.25rem] bg-sand">
          <ProductImage
            images={images}
            art={art}
            alt={name}
            sizes={sizes}
            className="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
          {badge ? <Badge className="absolute left-3 top-3">{badge}</Badge> : null}
        </div>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            {category ? (
              <p className="mb-1 text-[0.7rem] uppercase tracking-[0.2em] text-muted">{category}</p>
            ) : null}
            <h3 className="font-serif text-xl font-light leading-snug">{name}</h3>
          </div>
          <div className="pt-1 text-right text-sm">
            {from ? <span className="block text-[0.7rem] text-muted">a partir de</span> : null}
            <Price price={price} list={list} className="justify-end" />
          </div>
        </div>
      </Link>
    </article>
  );
}

/** Menor preço entre produto e variantes, para exibir "a partir de". */
export function productFromPrice(p: PublicProduct): { price: number; list?: number; from: boolean } {
  const prices = [
    p.promoPrice ?? p.price,
    ...p.variants.map((v) => v.promoPrice ?? v.price ?? p.promoPrice ?? p.price),
  ];
  const min = Math.min(...prices);
  const from = new Set(prices).size > 1;
  const list = !from && p.promoPrice !== null ? p.price : undefined;
  return { price: min, list, from };
}
