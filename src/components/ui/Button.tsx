import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost";
type Size = "md" | "lg";

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-300",
    "disabled:cursor-not-allowed disabled:opacity-50",
    size === "lg" ? "px-7 py-3.5 text-[0.95rem]" : "px-5 py-2.5 text-sm",
    variant === "primary" && "bg-ink text-cream hover:bg-ink/85",
    variant === "outline" && "border border-ink/30 text-ink hover:border-ink hover:bg-sand",
    variant === "ghost" && "text-ink hover:bg-sand",
    className,
  );
}

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function Button({
  variant,
  size,
  className,
  children,
  type = "button",
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={buttonClasses(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant,
  size,
  className,
  children,
  external,
}: CommonProps & { href: string; external?: boolean }) {
  const cls = buttonClasses(variant, size, className);
  if (external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
