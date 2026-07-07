"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useCartStore } from "@/lib/cart";
import { colorById } from "@/lib/catalog";
import { fmt } from "@/lib/pricing";
import { defaultConfig } from "@/lib/store";
import { Swatch } from "@/components/ui/Kit";
import type { Listing } from "@/lib/shop";

const MiniViewer = dynamic(
  () => import("@/components/three/Stage").then((m) => m.MiniStage),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-[11px] uppercase tracking-[0.25em] text-ink-muted">
        Loading…
      </div>
    ),
  }
);

export default function ProductCard({
  listing,
  index,
}: {
  listing: Listing;
  index: number;
}) {
  const add = useCartStore((s) => s.add);
  const [colorId, setColorId] = useState(listing.colorIds[0]);
  const [sizeId, setSizeId] = useState(listing.sizes[1]?.id ?? listing.sizes[0].id);

  const color = colorById(colorId);
  const unitPrice = listing.price + (color.premium ? listing.premiumColorSurcharge : 0);
  const size = listing.sizes.find((s) => s.id === sizeId) ?? listing.sizes[0];

  const cfg = useMemo(() => {
    const c = defaultConfig(listing.product);
    c.colorId = colorId;
    c.measurements = { ...c.measurements, ...size.measurements };
    c.text = { name: "", faculty: "", year: "", custom: "" };
    c.accessories = { cap: listing.product === "robe", tassel: true, giftBox: false };
    return c;
  }, [listing.product, colorId, size]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="glass overflow-hidden rounded-[2rem]"
      style={{ boxShadow: "var(--shadow-soft)" }}
    >
      <div className="grid md:grid-cols-[1.05fr_1fr]">
        {/* 3D product view */}
        <div className="relative h-80 md:h-[520px]">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 55% at 50% 45%, color-mix(in srgb, var(--gold) 8%, transparent), transparent 70%)",
            }}
          />
          <MiniViewer cfg={cfg} />
          {listing.compareAt && (
            <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-black">
              Graduation season −{Math.round((1 - listing.price / listing.compareAt) * 100)}%
            </span>
          )}
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9.5px] uppercase tracking-[0.22em] text-ink-muted">
            Drag to rotate
          </span>
        </div>

        {/* buy panel */}
        <div className="flex flex-col justify-between border-t border-line p-7 md:border-l md:border-t-0 lg:p-9">
          <div>
            <h2 className="font-display text-[28px] font-light leading-tight text-ink">
              {listing.name}
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-secondary">
              {listing.blurb}
            </p>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="font-display tabular text-[26px] text-gold">
                {fmt(unitPrice)} <span className="text-[13px]">TND</span>
              </span>
              {listing.compareAt && (
                <span className="tabular text-[14px] text-ink-muted line-through">
                  {fmt(listing.compareAt)}
                </span>
              )}
            </div>

            {/* colors */}
            <div className="mt-5">
              <div className="mb-2 text-[10.5px] uppercase tracking-[0.22em] text-ink-muted">
                Color — {color.name}
              </div>
              <div className="flex flex-wrap gap-2.5">
                {listing.colorIds.map((cid) => {
                  const c = colorById(cid);
                  return (
                    <Swatch
                      key={cid}
                      hex={c.hex}
                      name={c.name}
                      premium={c.premium}
                      active={colorId === cid}
                      onClick={() => setColorId(cid)}
                    />
                  );
                })}
              </div>
            </div>

            {/* sizes */}
            <div className="mt-4">
              <div className="mb-2 text-[10.5px] uppercase tracking-[0.22em] text-ink-muted">
                Size — fits {size.height}
              </div>
              <div className="flex gap-2">
                {listing.sizes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSizeId(s.id)}
                    className={`glass min-w-11 rounded-xl px-3 py-2 text-[12.5px] font-medium transition-all duration-300 ${
                      sizeId === s.id
                        ? "glass-strong text-ink"
                        : "text-ink-muted hover:text-ink-secondary"
                    }`}
                    style={
                      sizeId === s.id
                        ? { borderColor: "color-mix(in srgb, var(--gold) 55%, transparent)" }
                        : undefined
                    }
                  >
                    {s.id}
                  </button>
                ))}
              </div>
            </div>

            <ul className="mt-5 space-y-1.5">
              {listing.features.map((f) => (
                <li key={f} className="flex gap-2 text-[12px] text-ink-secondary">
                  <span className="text-gold">·</span> {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-7">
            <button
              onClick={() =>
                add({
                  product: listing.product,
                  name: listing.name,
                  colorId,
                  size: sizeId,
                  unitPrice,
                })
              }
              className="btn-gold w-full rounded-2xl py-4 text-[14px] font-semibold"
            >
              Add to Cart — {fmt(unitPrice)} TND
            </button>
            <Link
              href={`/configure?product=${listing.product}`}
              className="mt-3 block text-center text-[12px] text-ink-muted transition-colors duration-300 hover:text-gold"
            >
              ✦ Add embroidery & custom measurements in the 3D Atelier
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
