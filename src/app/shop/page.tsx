import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/ui/Nav";
import ProductCard from "@/components/shop/ProductCard";
import { LISTINGS } from "@/lib/shop";

export const metadata: Metadata = {
  title: "Shop — ENMIIS",
  description:
    "Graduation robes and capes, ready to wear. Premium fabrics, five sizes, shipped in 48 hours. Add embroidery in the 3D Atelier.",
};

export default function ShopPage() {
  return (
    <main className="relative min-h-svh">
      <Nav />

      <div className="mx-auto max-w-6xl px-6 pb-24 pt-32">
        {/* header */}
        <div className="mb-12 max-w-2xl">
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-ink-muted">
            <span className="h-px w-6 bg-gold/60" />
            The Collection · Class of {new Date().getFullYear() + 1}
          </div>
          <h1 className="font-display mt-4 text-4xl font-light leading-tight text-ink sm:text-5xl">
            Ready to wear.
            <span className="italic text-gradient-gold"> Ready to remember.</span>
          </h1>
          <p className="mt-4 text-[14px] leading-relaxed text-ink-secondary">
            Two silhouettes, five sizes, premium dyes — shipped within 48 hours.
            Every piece can be personalized with embroidery in the 3D Atelier.
          </p>
        </div>

        {/* listings */}
        <div className="space-y-10">
          {LISTINGS.map((l, i) => (
            <ProductCard key={l.product} listing={l} index={i} />
          ))}
        </div>

        {/* atelier banner — secondary, but always present */}
        <div className="glass mt-14 flex flex-col items-center justify-between gap-5 rounded-[2rem] px-8 py-8 sm:flex-row">
          <div>
            <div className="font-display text-[20px] text-ink">
              Make it <span className="italic text-gradient-gold">unmistakably yours</span>
            </div>
            <p className="mt-1 text-[12.5px] text-ink-muted">
              Name, faculty and year — embroidered live in real-time 3D, with
              exact measurements and an instant quote.
            </p>
          </div>
          <Link
            href="/configure"
            className="glass-strong shrink-0 rounded-full px-7 py-3.5 text-[13px] font-medium text-ink transition-all duration-300 hover:border-gold/60"
          >
            Open the 3D Atelier ✦
          </Link>
        </div>

        {/* trust strip */}
        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ["48h", "dispatch"],
            ["Free", "delivery in Tunisia"],
            ["5 sizes", "S — XXL"],
            ["Atelier", "quality control"],
          ].map(([n, l]) => (
            <div key={l} className="glass rounded-2xl px-5 py-4 text-center">
              <div className="font-display text-[18px] text-gold">{n}</div>
              <div className="mt-0.5 text-[10.5px] uppercase tracking-[0.16em] text-ink-muted">
                {l}
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 text-[12px] text-ink-muted sm:flex-row">
          <div className="flex items-baseline gap-2">
            <span className="font-display tracking-[0.18em] text-ink">ENMIIS</span>
          </div>
          <p>Graduation robes · Capes · Embroidery</p>
          <p>© {new Date().getFullYear()} Enmiis. Crafted with precision.</p>
        </div>
      </footer>
    </main>
  );
}
