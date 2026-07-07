"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import {
  colorById,
  fabricById,
  fontById,
  POSITION_LABELS,
  productById,
  threadById,
} from "@/lib/catalog";
import { renderEmbroideryCanvas } from "@/lib/embroidery";
import { computeQuote, fmt, loadCoefficients } from "@/lib/pricing";
import { useDesignStore } from "@/lib/store";
import { hasEmbroidery } from "@/components/three/Garment";

/* deterministic order reference from the design fingerprint */
function orderRef(json: string): string {
  let h = 5381;
  for (let i = 0; i < json.length; i++) h = ((h << 5) + h + json.charCodeAt(i)) >>> 0;
  return `ENM-${new Date().getFullYear()}-${(h % 100000).toString().padStart(5, "0")}`;
}

export default function SummaryPage() {
  const { config, hydrate, hydrated } = useDesignStore();
  const [qr, setQr] = useState<string>("");
  const [embPreview, setEmbPreview] = useState<string>("");

  useEffect(() => hydrate(), [hydrate]);

  const coeffs = useMemo(() => loadCoefficients(), [hydrated]); // eslint-disable-line react-hooks/exhaustive-deps
  const quote = useMemo(() => computeQuote(config, coeffs), [config, coeffs]);
  const ref = useMemo(() => orderRef(JSON.stringify(config)), [config]);
  const product = productById(config.product);
  const est = quote.estimates;

  useEffect(() => {
    if (!hydrated) return;
    QRCode.toDataURL(
      JSON.stringify({ ref, total: quote.total, days: est.deliveryDays }),
      { margin: 1, width: 220, color: { dark: "#14121a", light: "#ffffff" } }
    ).then(setQr);
  }, [hydrated, ref, quote.total, est.deliveryDays]);

  useEffect(() => {
    if (!hydrated || !hasEmbroidery(config)) {
      setEmbPreview("");
      return;
    }
    const canvas = renderEmbroideryCanvas(config, {
      width: 640,
      height: 640,
      fabricHex: colorById(config.colorId).hex,
    });
    /* composite over fabric color for the paper preview */
    const out = document.createElement("canvas");
    out.width = 640;
    out.height = 640;
    const ctx = out.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = colorById(config.colorId).hex;
    ctx.fillRect(0, 0, 640, 640);
    ctx.drawImage(canvas, 0, 0);
    setEmbPreview(out.toDataURL("image/png"));
  }, [hydrated, config]);

  if (!hydrated) {
    return (
      <div className="flex h-svh items-center justify-center">
        <div className="font-display animate-pulse text-[13px] tracking-[0.3em] text-ink-muted">
          PREPARING QUOTATION
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="min-h-svh px-4 py-10 sm:px-6">
      {/* actions */}
      <div className="no-print mx-auto mb-6 flex max-w-3xl items-center justify-between">
        <Link
          href="/configure"
          className="glass rounded-full px-5 py-2.5 text-[12.5px] text-ink-secondary transition-colors hover:text-ink"
        >
          ← Back to the atelier
        </Link>
        <button
          onClick={() => window.print()}
          className="btn-gold rounded-full px-6 py-2.5 text-[12.5px] font-semibold"
        >
          Download PDF ⤓
        </button>
      </div>

      {/* quotation sheet — always "paper" styled, prints 1:1 */}
      <div
        className="print-page mx-auto max-w-3xl rounded-3xl bg-white p-8 text-[#14121a] shadow-2xl sm:p-12"
        style={{ boxShadow: "var(--shadow-soft)" }}
      >
        {/* letterhead */}
        <div className="flex items-start justify-between border-b border-black/10 pb-6">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-2xl font-semibold tracking-[0.16em]">ENMIIS</span>
              <span className="text-[9px] uppercase tracking-[0.32em] text-[#a1793a]">Atelier</span>
            </div>
            <p className="mt-1 text-[11px] text-black/50">
              Couture graduation apparel · Made to measure
            </p>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-[0.24em] text-black/40">Quotation</div>
            <div className="font-display text-[17px] font-medium">{ref}</div>
            <div className="text-[11px] text-black/50">{today}</div>
          </div>
        </div>

        {/* product + preview */}
        <div className="mt-8 grid gap-8 sm:grid-cols-[1fr_200px]">
          <div>
            <h1 className="font-display text-[26px] font-light leading-tight">
              {product.name}
              <span className="block text-[15px] italic text-[#a1793a]">
                {fabricById(config.fabricId).name} · {colorById(config.colorId).name}
              </span>
            </h1>

            <table className="mt-6 w-full text-[12px]">
              <tbody>
                {product.measurements.map((m) => (
                  <tr key={m.key} className="border-b border-black/5">
                    <td className="py-1.5 text-black/55">{m.label}</td>
                    <td className="tabular py-1.5 text-right font-medium">
                      {config.measurements[m.key] ?? m.default} cm
                    </td>
                  </tr>
                ))}
                <tr className="border-b border-black/5">
                  <td className="py-1.5 text-black/55">Collar / Border / Finish</td>
                  <td className="py-1.5 text-right font-medium capitalize">
                    {config.collar.replace("-", " ")} · {config.border.replace("-", " ")} · {config.finish}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-3">
            {embPreview ? (
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={embPreview}
                  alt="Embroidery preview"
                  className="w-full rounded-2xl border border-black/10"
                />
                <p className="mt-1.5 text-center text-[9.5px] uppercase tracking-[0.18em] text-black/40">
                  Embroidery proof · {POSITION_LABELS[config.position]}
                </p>
              </div>
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-2xl border border-dashed border-black/15 text-[11px] text-black/35">
                No embroidery
              </div>
            )}
          </div>
        </div>

        {/* embroidery spec */}
        <div className="mt-8 rounded-2xl bg-black/[0.03] p-5">
          <div className="text-[10px] uppercase tracking-[0.24em] text-black/40">
            Embroidery specification
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-[12px] sm:grid-cols-3">
            <div><span className="text-black/50">Text — </span>{[config.text.name, config.text.faculty, config.text.year, config.text.custom].filter((t) => t.trim()).join(" · ") || "—"}</div>
            <div><span className="text-black/50">Typeface — </span>{fontById(config.fontId).name}</div>
            <div><span className="text-black/50">Thread — </span>{threadById(config.threadId).name}</div>
            <div><span className="text-black/50">Style — </span>{config.style === "raised" ? "3D raised" : config.style}</div>
            <div><span className="text-black/50">Letter height — </span>{Math.round(22 * config.fontScale) / 10} cm</div>
            <div><span className="text-black/50">Stitches — </span>{est.stitchCount.toLocaleString()}</div>
            {config.logo && (
              <div className="col-span-2 sm:col-span-3">
                <span className="text-black/50">Logo — </span>
                {config.logo.fileName}
                {!config.logo.dataUrl && " (vector source, atelier digitization)"}
              </div>
            )}
          </div>
        </div>

        {/* production + price */}
        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-black/40">Production</div>
            <table className="mt-3 w-full text-[12px]">
              <tbody>
                {[
                  ["Fabric consumption", `${est.fabricMeters} m`],
                  ["Thread", `${est.threadMeters} m`],
                  ["Machine time", `${est.machineMinutes} min`],
                  ["Atelier hours", `${est.productionHours} h`],
                  ["Shipping weight", `${est.fabricWeightKg} kg`],
                  ["Delivery estimate", `${est.deliveryDays} days`],
                ].map(([k, v]) => (
                  <tr key={k} className="border-b border-black/5">
                    <td className="py-1.5 text-black/55">{k}</td>
                    <td className="tabular py-1.5 text-right font-medium">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {qr && (
              <div className="mt-6 flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qr} alt="Order QR" className="h-24 w-24 rounded-lg border border-black/10" />
                <p className="max-w-40 text-[10px] leading-relaxed text-black/45">
                  Scan to verify this quotation at the atelier — {ref}
                </p>
              </div>
            )}
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-black/40">Price breakdown</div>
            <div className="mt-3 space-y-1.5 text-[12px]">
              {quote.lines.map((l) => (
                <div key={l.label} className="flex justify-between gap-3 border-b border-black/5 py-1">
                  <span className="text-black/55">{l.label}</span>
                  <span className="tabular font-medium">{fmt(l.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between py-1 text-black/55">
                <span>VAT {coeffs.vatPercent}%</span>
                <span className="tabular">{fmt(quote.vat)}</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between rounded-xl bg-[#a1793a]/10 px-3 py-2.5">
                <span className="font-medium">Total</span>
                <span className="font-display tabular text-[22px] text-[#a1793a]">
                  {fmt(quote.total)} <span className="text-[11px]">TND</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-10 border-t border-black/10 pt-4 text-center text-[9.5px] leading-relaxed text-black/40">
          This quotation is valid for 14 days. Measurements are the client&apos;s responsibility —
          our atelier verifies every pattern before cutting. ENMIIS · Couture graduation apparel.
        </p>
      </div>
    </main>
  );
}
