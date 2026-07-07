"use client";

import { motion } from "framer-motion";
import { PRODUCTS } from "@/lib/catalog";
import { useDesignStore } from "@/lib/store";
import { SectionLabel } from "@/components/ui/Kit";

export default function StepProduct({ onNext }: { onNext: () => void }) {
  const { config, setProduct } = useDesignStore();

  return (
    <div className="space-y-5">
      <div>
        <SectionLabel>Step 1 — Silhouette</SectionLabel>
        <h2 className="font-display mt-2 text-2xl font-light text-ink">
          What are you wearing on <span className="italic text-gradient-gold">your day</span>?
        </h2>
      </div>

      <div className="space-y-2.5">
        {PRODUCTS.map((p, i) => {
          const active = config.product === p.id;
          return (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              onClick={() => setProduct(p.id)}
              className={`glass group flex w-full items-center justify-between rounded-2xl px-5 py-4 text-left transition-all duration-300 ${
                active ? "glass-strong" : "hover:border-line-strong"
              }`}
              style={
                active
                  ? { borderColor: "color-mix(in srgb, var(--gold) 55%, transparent)" }
                  : undefined
              }
            >
              <div className="flex items-center gap-4">
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full border transition-all duration-300 ${
                    active ? "border-gold" : "border-line-strong"
                  }`}
                >
                  {active && <span className="h-2 w-2 rounded-full bg-gold" />}
                </span>
                <div>
                  <div className={`text-[14px] font-medium ${active ? "text-ink" : "text-ink-secondary"}`}>
                    {p.name}
                  </div>
                  <div className="text-[11.5px] text-ink-muted">{p.tagline}</div>
                </div>
              </div>
              <span
                className={`text-[11px] transition-all duration-300 ${
                  active ? "text-gold" : "text-transparent group-hover:text-ink-muted"
                }`}
              >
                {p.measurements.length} measurements
              </span>
            </motion.button>
          );
        })}
      </div>

      <button
        onClick={onNext}
        className="btn-gold w-full rounded-2xl py-3.5 text-[13.5px] font-semibold"
      >
        Continue to Measurements →
      </button>
    </div>
  );
}
