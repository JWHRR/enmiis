"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { productById } from "@/lib/catalog";
import { useDesignStore } from "@/lib/store";
import { LuxSlider, SectionLabel } from "@/components/ui/Kit";

/* ------------------------------------------------------------------ */
/*  Measurement wizard — each control highlights its dimension on      */
/*  the live tailor's diagram.                                         */
/* ------------------------------------------------------------------ */

function Dim({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <g
      className="transition-all duration-300"
      stroke={active ? "var(--gold)" : "var(--border-strong)"}
      strokeWidth={active ? 2 : 1}
      opacity={active ? 1 : 0.45}
    >
      {children}
    </g>
  );
}

function Guide({ product, active }: { product: string; active: string }) {
  const isRobe = product === "robe";
  const isCape = product === "cape";
  const isStole = product.startsWith("stole");

  return (
    <svg viewBox="0 0 220 240" className="h-full w-full" fill="none">
      {/* garment silhouette */}
      <g stroke="var(--ink-muted)" strokeWidth="1.4" strokeLinejoin="round">
        {isRobe && (
          <>
            <path d="M92 30 Q110 22 128 30 L136 38 L164 118 L148 124 L140 92 L146 200 H74 L80 92 L72 124 L56 118 L84 38 Z" />
            <path d="M100 30 Q110 36 120 30" />
          </>
        )}
        {isCape && (
          <path d="M96 28 Q110 20 124 28 L130 36 L162 200 H58 L90 36 Z" />
        )}
        {isStole && (
          <>
            <path d="M85 30 Q110 16 135 30 L142 44 L124 50 L124 150 L110 170 L96 150 L96 52 Q94 50 92 52 L92 150 L78 170 L64 150 L64 50 L78 44 Z" />
          </>
        )}
        {product === "sash" && (
          <>
            <ellipse cx="110" cy="40" rx="26" ry="14" opacity="0.35" />
            <path d="M96 34 L134 34 L142 200 L104 200 Z" transform="rotate(14 110 110)" />
            <circle cx="146" cy="188" r="12" />
          </>
        )}
      </g>

      {/* dimension lines */}
      {(isRobe || isCape) && (
        <>
          <Dim active={active === "height"}>
            <line x1="34" y1="30" x2="34" y2="200" />
            <line x1="28" y1="30" x2="40" y2="30" />
            <line x1="28" y1="200" x2="40" y2="200" />
          </Dim>
          <Dim active={active === "shoulder"}>
            <line x1="84" y1="20" x2="136" y2="20" />
            <line x1="84" y1="14" x2="84" y2="26" />
            <line x1="136" y1="14" x2="136" y2="26" />
          </Dim>
          <Dim active={active === "bottom"}>
            <line x1="74" y1="212" x2="146" y2="212" />
            <line x1="74" y1="206" x2="74" y2="218" />
            <line x1="146" y1="206" x2="146" y2="218" />
          </Dim>
          <Dim active={active === "neck"}>
            <ellipse cx="110" cy="28" rx="18" ry="8" fill="none" />
          </Dim>
        </>
      )}
      {isRobe && (
        <>
          <Dim active={active === "sleeveOpen"}>
            <line x1="148" y1="124" x2="164" y2="118" />
            <circle cx="156" cy="121" r="7" fill="none" />
          </Dim>
          <Dim active={active === "sleeveLen"}>
            <line x1="130" y1="34" x2="158" y2="116" strokeDasharray="4 3" />
          </Dim>
          <Dim active={active === "chest"}>
            <line x1="84" y1="70" x2="136" y2="70" />
            <line x1="84" y1="64" x2="84" y2="76" />
            <line x1="136" y1="64" x2="136" y2="76" />
          </Dim>
        </>
      )}
      {(isStole || product === "sash") && (
        <>
          <Dim active={active === "length"}>
            <line x1="40" y1="30" x2="40" y2="170" />
            <line x1="34" y1="30" x2="46" y2="30" />
            <line x1="34" y1="170" x2="46" y2="170" />
          </Dim>
          <Dim active={active === "width"}>
            <line x1="64" y1="216" x2="96" y2="216" transform={product === "sash" ? "translate(30 -6)" : ""} />
            <line x1="64" y1="210" x2="64" y2="222" transform={product === "sash" ? "translate(30 -6)" : ""} />
            <line x1="96" y1="210" x2="96" y2="222" transform={product === "sash" ? "translate(30 -6)" : ""} />
          </Dim>
        </>
      )}
    </svg>
  );
}

export default function StepMeasurements({ onNext }: { onNext: () => void }) {
  const { config, setMeasurement } = useDesignStore();
  const product = productById(config.product);
  const [active, setActive] = useState(product.measurements[0]?.guide ?? "height");

  const validCount = product.measurements.filter((m) => {
    const v = config.measurements[m.key];
    return v !== undefined && v >= m.min && v <= m.max;
  }).length;
  const allValid = validCount === product.measurements.length;

  return (
    <div className="space-y-5">
      <div>
        <SectionLabel>Step 2 — Measurements</SectionLabel>
        <h2 className="font-display mt-2 text-2xl font-light text-ink">
          Cut to <span className="italic text-gradient-gold">your body</span>
        </h2>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
          The 3D garment rebuilds instantly from your numbers — what you see is
          your exact pattern.
        </p>
      </div>

      {/* progress */}
      <div className="flex items-center gap-3">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface-strong">
          <motion.div
            className="h-full rounded-full bg-gold"
            animate={{ width: `${(validCount / product.measurements.length) * 100}%` }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <span className="text-[11px] tabular text-ink-muted">
          {validCount}/{product.measurements.length}
        </span>
      </div>

      {/* tailor's diagram */}
      <div className="glass mx-auto h-52 w-full max-w-xs rounded-3xl p-4">
        <Guide product={config.product} active={active} />
      </div>

      <div className="space-y-5">
        {product.measurements.map((m) => (
          <div key={m.key} onPointerEnter={() => setActive(m.guide)} onFocus={() => setActive(m.guide)}>
            <LuxSlider
              label={m.label}
              hint={m.hint}
              value={config.measurements[m.key] ?? m.default}
              min={m.min}
              max={m.max}
              step={m.step}
              onChange={(v) => {
                setActive(m.guide);
                setMeasurement(m.key, v);
              }}
            />
          </div>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!allValid}
        className="btn-gold w-full rounded-2xl py-3.5 text-[13.5px] font-semibold disabled:cursor-not-allowed disabled:opacity-40"
      >
        {allValid ? "Continue to Fabric →" : "Check highlighted measurements"}
      </button>
    </div>
  );
}
