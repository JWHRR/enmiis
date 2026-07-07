import Link from "next/link";
import Nav from "@/components/ui/Nav";
import Hero from "@/components/landing/Hero";
import ProductGrid from "@/components/landing/ProductGrid";
import Craft from "@/components/landing/Craft";

export default function Home() {
  return (
    <main className="relative">
      <Nav />
      <Hero />
      <ProductGrid />
      <Craft />

      {/* closing CTA */}
      <section className="relative mx-auto max-w-7xl px-6 pb-32 pt-10">
        <div
          className="glass relative overflow-hidden rounded-[2.5rem] px-8 py-20 text-center sm:px-16"
          style={{ boxShadow: "var(--shadow-glow)" }}
        >
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-64 w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50"
            style={{
              background:
                "radial-gradient(closest-side, color-mix(in srgb, var(--gold) 22%, transparent), transparent)",
            }}
          />
          <p className="text-[11px] uppercase tracking-[0.4em] text-gold">
            Your moment awaits
          </p>
          <h2 className="font-display mx-auto mt-5 max-w-2xl text-4xl font-light leading-tight sm:text-5xl">
            Your robe is ready. Your day is coming.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[14px] leading-relaxed text-ink-secondary">
            Robes and capes in five sizes, shipped in 48 hours — with optional
            live-embroidered personalization from our 3D Atelier.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/shop"
              className="btn-gold inline-block rounded-full px-10 py-4 text-[14px] font-semibold"
            >
              Shop the Collection
            </Link>
            <Link
              href="/configure"
              className="glass inline-block rounded-full px-8 py-4 text-[13px] text-ink-secondary transition-colors duration-300 hover:text-ink"
            >
              ✦ Personalize in 3D
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 text-[12px] text-ink-muted sm:flex-row">
          <div className="flex items-baseline gap-2">
            <span className="font-display tracking-[0.18em] text-ink">ENMIIS</span>
            <span className="text-[9px] uppercase tracking-[0.3em] text-gold">Atelier</span>
          </div>
          <p>Graduation robes · Capes · Stoles · Sashes · Embroidery</p>
          <p>© {new Date().getFullYear()} Enmiis. Crafted with precision.</p>
        </div>
      </footer>
    </main>
  );
}
