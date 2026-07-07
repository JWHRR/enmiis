"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./Kit";
import { cartCount, useCartStore } from "@/lib/cart";
import CartDrawer from "@/components/shop/CartDrawer";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { items, setOpen } = useCartStore();

  useEffect(() => {
    setMounted(true);
    const fn = () => setScrolled(window.scrollY > 24);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const count = mounted ? cartCount(items) : 0;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled ? "py-3" : "py-6"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <Link href="/" className="group flex items-baseline gap-2">
            <span className="font-display text-[19px] font-semibold tracking-[0.18em] text-ink">
              ENMIIS
            </span>
            <span className="text-[9px] uppercase tracking-[0.34em] text-gold transition-colors">
              Graduation
            </span>
          </Link>

          <nav
            className={`hidden items-center gap-1 rounded-full px-2 py-1.5 transition-all duration-500 md:flex ${
              scrolled ? "glass" : ""
            }`}
          >
            {[
              { href: "/shop", label: "Shop" },
              { href: "/#collection", label: "Collection" },
              { href: "/configure", label: "3D Atelier" },
              { href: "/admin", label: "Console" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href as "/shop"}
                className="rounded-full px-4 py-1.5 text-[12.5px] text-ink-secondary transition-colors duration-300 hover:bg-surface-strong hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setOpen(true)}
              aria-label="Cart"
              className="glass relative flex h-9 w-9 items-center justify-center rounded-full text-[13px] text-ink-secondary transition-transform hover:scale-110 hover:text-ink"
            >
              ◇
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-gold px-1 text-[9.5px] font-bold text-black">
                  {count}
                </span>
              )}
            </button>
            <Link
              href="/shop"
              className="btn-gold hidden rounded-full px-5 py-2 text-[12.5px] font-semibold sm:block"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </header>
      <CartDrawer />
    </>
  );
}
