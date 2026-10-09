"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BagIcon, CloseIcon, MenuIcon, SearchIcon } from "@/components/ui/icons";
import { Logo } from "./Logo";
import { mainNav } from "@/data/navigation";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { totals, hydrated } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/produtos?q=${encodeURIComponent(q)}` : "/produtos");
  }

  const count = hydrated ? totals.count : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-stone/60 bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-5 sm:px-8 lg:h-[4.5rem] lg:px-12">
        <Logo />

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-9">
            {mainNav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative text-sm tracking-wide text-ink/80 transition-colors hover:text-ink",
                      "after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-ink after:transition-transform after:duration-300 hover:after:scale-x-100",
                      active && "text-ink after:scale-x-100",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            aria-expanded={searchOpen}
            aria-controls="busca-header"
            aria-label="Buscar produtos"
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-sand"
          >
            <SearchIcon />
          </button>
          <Link
            href="/carrinho"
            aria-label={`Carrinho, ${count} ${count === 1 ? "item" : "itens"}`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-sand"
          >
            <BagIcon />
            {count > 0 ? (
              <span className="absolute right-0 top-0 flex h-[1.1rem] min-w-[1.1rem] items-center justify-center rounded-full bg-ink px-1 text-[0.65rem] font-medium text-cream">
                {count}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="menu-mobile"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-sand lg:hidden"
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      <div
        id="busca-header"
        hidden={!searchOpen}
        className="border-t border-stone/60 bg-cream"
      >
        <form
          role="search"
          onSubmit={submitSearch}
          className="mx-auto flex w-full max-w-7xl items-center gap-3 px-5 py-3 sm:px-8 lg:px-12"
        >
          <label htmlFor="busca-input" className="sr-only">
            Buscar produtos
          </label>
          <input
            id="busca-input"
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="O que você procura?"
            className="w-full bg-transparent py-2 font-serif text-xl placeholder:text-taupe focus:outline-none"
          />
          <button type="submit" className="text-sm font-medium underline-offset-4 hover:underline">
            Buscar
          </button>
        </form>
      </div>

      <nav
        id="menu-mobile"
        aria-label="Menu móvel"
        hidden={!menuOpen}
        className="border-t border-stone/60 bg-cream lg:hidden"
      >
        <ul className="mx-auto flex max-w-7xl flex-col px-5 py-3 sm:px-8">
          {mainNav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block border-b border-stone/40 py-4 font-serif text-2xl font-light last:border-0"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
