"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { computeQuote, fmt, loadCoefficients } from "@/lib/pricing";
import { useDesignStore } from "@/lib/store";
import { AnimatedNumber } from "@/components/ui/Kit";

export default function PriceBar() {
  const { config } = useDesignStore();
  const [coeffs, setCoeffs] = useState(loadCoefficients);
  const [open, setOpen] = useState(false);
  useEffect(() => setCoeffs(loadCoefficients()), []);

  const quote = useMemo(() => computeQuote(config, coeffs), [config, coeffs]);

  return (
    <div className="border-t border-line bg-bg-elevated/60 backdrop-blur-xl">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="max-h-56 space-y-1.5 overflow-y-auto px-6 py-4">
              {quote.lines.map((l) => (
                <div key={l.label} className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate text-[11.5px] text-ink-secondary">
                    {l.label}
                    {l.detail && <span className="ml-2 text-[9.5px] text-ink-muted">{l.detail}</span>}
                  </span>
                  <span className="tabular shrink-0 text-[11.5px] text-ink">{fmt(l.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-1 text-[11.5px] text-ink-secondary">
                <span>VAT {coeffs.vatPercent}%</span>
                <span className="tabular">{fmt(quote.vat)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-3.5 text-left"
      >
        <div>
          <div className="text-[10px] uppercase tracking-[0.24em] text-ink-muted">
            Live estimate · {quote.estimates.deliveryDays} days
          </div>
          <div className="font-display flex items-baseline gap-1.5 text-[24px] leading-tight text-ink">
            <AnimatedNumber value={quote.total} />
            <span className="text-[12px] text-gold">TND</span>
          </div>
        </div>
        <span
          className={`glass flex h-8 w-8 items-center justify-center rounded-full text-[12px] text-ink-muted transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        >
          ⌃
        </span>
      </button>
    </div>
  );
}
