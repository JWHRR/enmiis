"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LISTINGS } from "@/lib/shop";
import { fmt } from "@/lib/pricing";
import { SectionLabel, Tilt } from "@/components/ui/Kit";

/* minimal line-art silhouettes per product */
const SILHOUETTES: Record<string, React.ReactNode> = {
  robe: (
    <path d="M35 18 L42 12 H58 L65 18 L74 82 H60 L58 40 L54 84 H46 L42 40 L40 82 H26 Z" />
  ),
  cape: <path d="M50 10 C40 10 36 16 36 20 L18 84 H82 L64 20 C64 16 60 10 50 10 Z" />,
};

export default function ProductGrid() {
  return (
    <section id="collection" className="relative mx-auto max-w-7xl px-6 py-28">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-wrap items-end justify-between gap-6"
      >
        <div>
          <SectionLabel>The Collection</SectionLabel>
          <h2 className="font-display mt-4 max-w-xl text-4xl font-light leading-tight text-ink sm:text-5xl">
            Two silhouettes.
            <span className="italic text-gradient-gold"> One unforgettable day.</span>
          </h2>
        </div>
        <Link
          href="/shop"
          className="text-[13px] font-medium text-gold transition-transform duration-300 hover:translate-x-1"
        >
          View all & order →
        </Link>
      </motion.div>

      <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
        {LISTINGS.map((l, i) => (
          <motion.div
            key={l.product}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <Tilt max={7}>
              <Link
                href="/shop"
                className="glass group flex h-full flex-col justify-between rounded-[2rem] p-8 transition-colors duration-500 hover:border-line-strong"
                style={{ minHeight: 380 }}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-surface-strong px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-gold">
                    Ready in 48h
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.24em] text-ink-muted">
                    0{i + 1}
                  </span>
                </div>

                <svg
                  viewBox="0 0 100 96"
                  className="mx-auto my-8 h-44 w-44 text-ink-secondary transition-all duration-700 group-hover:scale-105 group-hover:text-gold"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                >
                  {SILHOUETTES[l.product]}
                </svg>

                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h3 className="font-display text-[24px] font-medium text-ink">
                      {l.name}
                    </h3>
                    <p className="mt-1 max-w-xs text-[12.5px] leading-relaxed text-ink-muted">
                      {l.blurb.split("—")[0]}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    {l.compareAt && (
                      <div className="tabular text-[12px] text-ink-muted line-through">
                        {fmt(l.compareAt)}
                      </div>
                    )}
                    <div className="font-display tabular text-[22px] text-gold">
                      {fmt(l.price)} <span className="text-[11px]">TND</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
                  <span className="text-[12px] font-medium text-ink transition-colors group-hover:text-gold">
                    Shop now →
                  </span>
                  <span className="text-[11px] text-ink-muted">
                    ✦ embroidery optional
                  </span>
                </div>
              </Link>
            </Tilt>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
