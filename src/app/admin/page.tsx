"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  DEFAULT_COEFFICIENTS,
  computeQuote,
  fmt,
  loadCoefficients,
  resetCoefficients,
  saveCoefficients,
} from "@/lib/pricing";
import { useDesignStore } from "@/lib/store";
import { SectionLabel, ThemeToggle } from "@/components/ui/Kit";
import type { PricingCoefficients } from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Atelier Console — every pricing coefficient is editable here.      */
/*  No deploy, no code change: the engine reads these live.            */
/* ------------------------------------------------------------------ */

type Path = (string | number)[];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getPath = (obj: any, path: Path) => path.reduce((o, k) => o?.[k], obj);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setPath(obj: any, path: Path, value: number): any {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  return { ...obj, [head]: setPath(obj[head] ?? {}, rest, value) };
}

interface FieldDef {
  label: string;
  path: Path;
  unit?: string;
  step?: number;
}

const GROUPS: { title: string; note: string; fields: FieldDef[] }[] = [
  {
    title: "Base product prices",
    note: "Starting price per silhouette, before fabric and embroidery.",
    fields: [
      { label: "Graduation robe", path: ["baseProduct", "robe"] },
      { label: "Cape", path: ["baseProduct", "cape"] },
      { label: "American stole", path: ["baseProduct", "stole-american"] },
      { label: "European stole", path: ["baseProduct", "stole-european"] },
      { label: "Miss sash", path: ["baseProduct", "sash"] },
      { label: "Premium dye surcharge", path: ["premiumColorSurcharge"] },
    ],
  },
  {
    title: "Embroidery formula",
    note: "Cost = stitches × price/1000 + thread surcharges + area × density + setup.",
    fields: [
      { label: "Price per 1000 stitches", path: ["stitchPricePer1000"], step: 0.05 },
      { label: "Thread color surcharge", path: ["threadColorSurcharge"], step: 0.5 },
      { label: "Metallic thread surcharge", path: ["metallicThreadSurcharge"], step: 0.5 },
      { label: "Density coefficient", path: ["densityCoefficientPerCm2"], unit: "/cm²", step: 0.005 },
      { label: "Setup fee", path: ["embroiderySetupFee"] },
      { label: "Logo digitization fee", path: ["logoDigitizationFee"] },
      { label: "Both-panels multiplier", path: ["positionMultiplier", "panel-both"], unit: "×", step: 0.05 },
      { label: "3D raised multiplier", path: ["styleMultiplier", "raised"], unit: "×", step: 0.05 },
    ],
  },
  {
    title: "Construction surcharges",
    note: "Collar, border and finish options.",
    fields: [
      { label: "Satin V collar", path: ["collarSurcharge", "satin-v"] },
      { label: "Shawl collar", path: ["collarSurcharge", "shawl"] },
      { label: "Satin piping border", path: ["borderSurcharge", "satin-piping"] },
      { label: "Gold trim border", path: ["borderSurcharge", "gold-trim"] },
      { label: "Satin finish", path: ["finishSurcharge", "satin"] },
      { label: "Velvet finish", path: ["finishSurcharge", "velvet"] },
    ],
  },
  {
    title: "Production",
    note: "Drives fabric consumption, labor and machine-time estimates.",
    fields: [
      { label: "Fabric roll width", path: ["fabricRollWidthCm"], unit: "cm" },
      { label: "Waste", path: ["wastePercent"], unit: "%" },
      { label: "Labor rate", path: ["laborRatePerHour"], unit: "/h" },
      { label: "Machine speed", path: ["machineStitchesPerMinute"], unit: "spm", step: 10 },
      { label: "Complexity coefficient", path: ["complexityCoefficient"], unit: "×", step: 0.01 },
    ],
  },
  {
    title: "Commercial",
    note: "Margins, urgency multipliers, taxes and accessories.",
    fields: [
      { label: "Margin", path: ["marginPercent"], unit: "%" },
      { label: "VAT", path: ["vatPercent"], unit: "%" },
      { label: "Express multiplier", path: ["urgencyMultiplier", "express"], unit: "×", step: 0.05 },
      { label: "Rush multiplier", path: ["urgencyMultiplier", "rush"], unit: "×", step: 0.05 },
      { label: "Mortarboard cap", path: ["accessories", "cap"] },
      { label: "Silk tassel", path: ["accessories", "tassel"] },
      { label: "Gift box", path: ["accessories", "giftBox"] },
    ],
  },
  {
    title: "Delivery",
    note: "Base production days per product; urgency compresses them.",
    fields: [
      { label: "Robe production days", path: ["baseProductionDays", "robe"] },
      { label: "Cape production days", path: ["baseProductionDays", "cape"] },
      { label: "Stole (US) days", path: ["baseProductionDays", "stole-american"] },
      { label: "Stole (EU) days", path: ["baseProductionDays", "stole-european"] },
      { label: "Sash days", path: ["baseProductionDays", "sash"] },
      { label: "Rush days factor", path: ["urgencyDaysFactor", "rush"], unit: "×", step: 0.05 },
    ],
  },
];

export default function AdminPage() {
  const [coeffs, setCoeffs] = useState<PricingCoefficients>(DEFAULT_COEFFICIENTS);
  const [dirty, setDirty] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const { config, hydrate, hydrated } = useDesignStore();

  useEffect(() => {
    setCoeffs(loadCoefficients());
    hydrate();
  }, [hydrate]);

  const sample = useMemo(() => computeQuote(config, coeffs), [config, coeffs]);

  const update = (path: Path, v: number) => {
    setCoeffs((c) => setPath(c, path, v) as PricingCoefficients);
    setDirty(true);
  };

  const save = () => {
    saveCoefficients(coeffs);
    setDirty(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1600);
  };

  const reset = () => {
    resetCoefficients();
    setCoeffs(DEFAULT_COEFFICIENTS);
    setDirty(false);
  };

  return (
    <main className="mx-auto min-h-svh max-w-6xl px-6 py-10">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-display text-[17px] font-semibold tracking-[0.18em] text-ink">ENMIIS</span>
            <span className="text-[8px] uppercase tracking-[0.3em] text-gold">Atelier Console</span>
          </Link>
          <p className="mt-2 text-[12.5px] text-ink-muted">
            Pricing engine coefficients — changes apply live to every configurator session on this device.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={reset}
            className="glass rounded-full px-5 py-2.5 text-[12px] text-ink-secondary transition-colors hover:text-danger"
          >
            Reset defaults
          </button>
          <button
            onClick={save}
            disabled={!dirty}
            className="btn-gold rounded-full px-6 py-2.5 text-[12.5px] font-semibold disabled:opacity-40"
          >
            {savedFlash ? "Saved ✓" : "Save coefficients"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {GROUPS.map((g, gi) => (
            <motion.section
              key={g.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.05, duration: 0.5 }}
              className="glass rounded-3xl p-6"
            >
              <SectionLabel>{g.title}</SectionLabel>
              <p className="mt-2 text-[11.5px] text-ink-muted">{g.note}</p>
              <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                {g.fields.map((f) => {
                  const v = getPath(coeffs, f.path) as number;
                  return (
                    <label
                      key={f.label}
                      className="flex items-center justify-between gap-3 border-b border-line py-1.5"
                    >
                      <span className="text-[12.5px] text-ink-secondary">{f.label}</span>
                      <span className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={v}
                          step={f.step ?? 1}
                          onChange={(e) => update(f.path, Number(e.target.value))}
                          className="tabular w-20 rounded-lg border border-transparent bg-transparent px-2 py-1 text-right text-[13px] text-ink outline-none transition-colors hover:border-line focus:border-gold"
                        />
                        <span className="w-8 text-[10px] text-ink-muted">{f.unit ?? "TND"}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </motion.section>
          ))}
        </div>

        {/* live sample quote */}
        <div className="lg:sticky lg:top-10 lg:self-start">
          <div className="glass rounded-3xl p-6" style={{ boxShadow: "var(--shadow-glow)" }}>
            <SectionLabel>Live sample quote</SectionLabel>
            <p className="mt-2 text-[11.5px] text-ink-muted">
              {hydrated
                ? "Computed from the design currently saved in the configurator."
                : "Loading design…"}
            </p>
            <div className="mt-5 space-y-1.5">
              {sample.lines.slice(0, 8).map((l) => (
                <div key={l.label} className="flex justify-between gap-3 text-[11.5px]">
                  <span className="truncate text-ink-secondary">{l.label}</span>
                  <span className="tabular shrink-0 text-ink">{fmt(l.amount)}</span>
                </div>
              ))}
              {sample.lines.length > 8 && (
                <div className="text-[10.5px] text-ink-muted">
                  + {sample.lines.length - 8} more lines
                </div>
              )}
            </div>
            <div className="hairline my-4" />
            <div className="flex items-baseline justify-between">
              <span className="text-[12.5px] text-ink-secondary">Total incl. VAT</span>
              <span className="font-display tabular text-[26px] text-gold">{fmt(sample.total)}</span>
            </div>
            <div className="mt-1 text-right text-[10.5px] text-ink-muted">
              {sample.estimates.stitchCount.toLocaleString()} stitches ·{" "}
              {sample.estimates.fabricMeters} m fabric · {sample.estimates.deliveryDays} days
            </div>
          </div>

          <p className="mt-4 px-2 text-[10.5px] leading-relaxed text-ink-muted">
            In production these coefficients live in the database (see
            docs/ARCHITECTURE.md) with role-based access, audit history and
            per-market overrides. This console persists to this browser.
          </p>
        </div>
      </div>
    </main>
  );
}
