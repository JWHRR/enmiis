"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  colorById,
  fabricById,
  fontById,
  POSITION_LABELS,
  productById,
  threadById,
} from "@/lib/catalog";
import { computeQuote, fmt, loadCoefficients } from "@/lib/pricing";
import { useDesignStore } from "@/lib/store";
import { LuxToggle, SectionLabel, Segmented } from "@/components/ui/Kit";
import type { Urgency } from "@/lib/types";

export default function StepReview() {
  const { config, set } = useDesignStore();
  const [coeffs, setCoeffs] = useState(loadCoefficients);
  useEffect(() => setCoeffs(loadCoefficients()), []);

  const quote = useMemo(() => computeQuote(config, coeffs), [config, coeffs]);
  const est = quote.estimates;

  const facts: [string, string][] = [
    ["Silhouette", productById(config.product).name],
    ["Fabric", `${fabricById(config.fabricId).name} · ${colorById(config.colorId).name}`],
    ["Thread", threadById(config.threadId).name],
    ["Typeface", fontById(config.fontId).name],
    ["Placement", POSITION_LABELS[config.position]],
    [
      "Embroidery",
      [config.text.name, config.text.faculty, config.text.year, config.text.custom]
        .filter((t) => t.trim())
        .join(" · ") || "—",
    ],
  ];

  return (
    <div className="space-y-6">
      <div>
        <SectionLabel>Step 5 — Review</SectionLabel>
        <h2 className="font-display mt-2 text-2xl font-light text-ink">
          Your <span className="italic text-gradient-gold">specification</span>
        </h2>
      </div>

      {/* summary facts */}
      <div className="glass divide-y divide-[var(--border)] rounded-2xl">
        {facts.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-4 px-4 py-2.5">
            <span className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-ink-muted">{k}</span>
            <span className="truncate text-right text-[12.5px] text-ink">{v}</span>
          </div>
        ))}
      </div>

      {/* accessories */}
      <div className="space-y-2.5">
        <div className="text-[11px] uppercase tracking-[0.22em] text-ink-muted">Finishing touches</div>
        <LuxToggle
          label="Mortarboard cap"
          detail="Matched fabric, structured board"
          checked={config.accessories.cap}
          onChange={(v) => set({ accessories: { ...config.accessories, cap: v } })}
        />
        <LuxToggle
          label="Silk tassel"
          detail="In your thread color, year charm included"
          checked={config.accessories.tassel}
          onChange={(v) => set({ accessories: { ...config.accessories, tassel: v } })}
        />
        <LuxToggle
          label="Signature gift box"
          detail="Rigid box, tissue, ribbon seal"
          checked={config.accessories.giftBox}
          onChange={(v) => set({ accessories: { ...config.accessories, giftBox: v } })}
        />
      </div>

      {/* urgency */}
      <div>
        <div className="mb-2 text-[11px] uppercase tracking-[0.22em] text-ink-muted">Production</div>
        <Segmented<Urgency>
          value={config.urgency}
          onChange={(v) => set({ urgency: v })}
          options={[
            { value: "standard", label: "Standard" },
            { value: "express", label: "Express" },
            { value: "rush", label: "Rush" },
          ]}
        />
        <p className="mt-2 text-[11.5px] text-ink-muted">
          Estimated delivery:{" "}
          <span className="font-medium text-gold">{est.deliveryDays} days</span> — includes
          production and transit.
        </p>
      </div>

      {/* atelier estimates */}
      <div>
        <div className="mb-2 text-[11px] uppercase tracking-[0.22em] text-ink-muted">
          Production estimate
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            [est.fabricMeters + " m", "fabric consumption"],
            [est.stitchCount.toLocaleString(), "embroidery stitches"],
            [est.threadMeters + " m", "thread"],
            [est.machineMinutes + " min", "machine time"],
            [est.productionHours + " h", "atelier hours"],
            [est.fabricWeightKg + " kg", "shipping weight"],
          ].map(([n, l]) => (
            <div key={l as string} className="glass rounded-xl px-3.5 py-2.5">
              <div className="tabular text-[15px] font-medium text-ink">{n}</div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-ink-muted">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* price breakdown */}
      <div>
        <div className="mb-2 text-[11px] uppercase tracking-[0.22em] text-ink-muted">
          Price composition
        </div>
        <div className="glass rounded-2xl p-4">
          <div className="space-y-1.5">
            {quote.lines.map((l) => (
              <div key={l.label} className="flex items-baseline justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[12px] text-ink-secondary">{l.label}</span>
                  {l.detail && (
                    <span className="ml-2 text-[10px] text-ink-muted">{l.detail}</span>
                  )}
                </div>
                <span className="tabular shrink-0 text-[12px] text-ink">{fmt(l.amount)}</span>
              </div>
            ))}
          </div>
          <div className="hairline my-3" />
          <div className="flex justify-between text-[12px] text-ink-secondary">
            <span>Subtotal</span>
            <span className="tabular">{fmt(quote.subtotal)}</span>
          </div>
          <div className="mt-1 flex justify-between text-[12px] text-ink-secondary">
            <span>VAT {coeffs.vatPercent}%</span>
            <span className="tabular">{fmt(quote.vat)}</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-[13px] font-medium text-ink">Total</span>
            <span className="font-display tabular text-[22px] text-gold">
              {fmt(quote.total)} <span className="text-[11px]">TND</span>
            </span>
          </div>
        </div>
      </div>

      <Link
        href="/summary"
        className="btn-gold block w-full rounded-2xl py-4 text-center text-[14px] font-semibold"
      >
        Generate my Quotation ✦
      </Link>
      <p className="text-center text-[10.5px] text-ink-muted">
        A detailed PDF specification with QR code — nothing is ordered yet.
      </p>
    </div>
  );
}
