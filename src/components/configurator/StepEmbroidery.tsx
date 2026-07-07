"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FONTS, POSITION_LABELS, productById } from "@/lib/catalog";
import { suggestLayout } from "@/lib/design-ai";
import { useDesignStore } from "@/lib/store";
import { LuxSlider, SectionLabel, Segmented } from "@/components/ui/Kit";
import type { EmbroideryPosition, EmbroideryStyle, TextAlign } from "@/lib/types";

const PREVIEWABLE = ["png", "jpg", "jpeg", "webp", "svg", "gif"];

function Field({
  label,
  value,
  placeholder,
  onChange,
  dir,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  dir?: "rtl" | "ltr";
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] uppercase tracking-[0.2em] text-ink-muted">
        {label}
      </span>
      <input
        type="text"
        value={value}
        dir={dir ?? "auto"}
        placeholder={placeholder}
        maxLength={42}
        onChange={(e) => onChange(e.target.value)}
        className="glass w-full rounded-xl px-4 py-2.5 text-[14px] text-ink placeholder:text-ink-muted/60 outline-none transition-all duration-300 focus:border-gold/60"
      />
    </label>
  );
}

export default function StepEmbroidery({ onNext }: { onNext: () => void }) {
  const { config, set } = useDesignStore();
  const product = productById(config.product);
  const fileRef = useRef<HTMLInputElement>(null);
  const [rationale, setRationale] = useState<string[] | null>(null);
  const [composing, setComposing] = useState(false);

  const compose = () => {
    setComposing(true);
    setRationale(null);
    /* brief pause so the composition feels deliberate */
    setTimeout(() => {
      const s = suggestLayout(config);
      set(s.patch);
      setRationale(s.rationale);
      setComposing(false);
    }, 650);
  };

  const onFile = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (PREVIEWABLE.includes(ext)) {
      const reader = new FileReader();
      reader.onload = () =>
        set({ logo: { dataUrl: String(reader.result), fileName: file.name } });
      reader.readAsDataURL(file);
    } else {
      /* AI / EPS / PDF — accepted for production, digitized by the atelier */
      set({ logo: { dataUrl: "", fileName: file.name } });
    }
  };

  const setText = (k: keyof typeof config.text, v: string) =>
    set({ text: { ...config.text, [k]: v } });

  return (
    <div className="space-y-6">
      <div>
        <SectionLabel>Step 4 — Embroidery</SectionLabel>
        <h2 className="font-display mt-2 text-2xl font-light text-ink">
          Stitched <span className="italic text-gradient-gold">live</span>, as you type
        </h2>
      </div>

      {/* AI compose */}
      <button
        onClick={compose}
        disabled={composing}
        className="glass-strong group relative w-full overflow-hidden rounded-2xl px-5 py-4 text-left transition-all duration-300 hover:border-gold/50"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.span
              animate={composing ? { rotate: 360 } : { rotate: 0 }}
              transition={composing ? { repeat: Infinity, duration: 1, ease: "linear" } : {}}
              className="text-[17px]"
            >
              ✨
            </motion.span>
            <div>
              <div className="text-[13.5px] font-medium text-ink">
                {composing ? "Composing…" : "Generate Design"}
              </div>
              <div className="text-[11px] text-ink-muted">
                Typography, placement & balance — arranged by design rules
              </div>
            </div>
          </div>
          <span className="text-gold opacity-0 transition-opacity duration-300 group-hover:opacity-100">→</span>
        </div>
      </button>

      <AnimatePresence>
        {rationale && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1.5 overflow-hidden rounded-2xl border border-gold/30 bg-surface p-4"
          >
            {rationale.map((r, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.12 }}
                className="flex gap-2 text-[11.5px] leading-relaxed text-ink-secondary"
              >
                <span className="text-gold">·</span> {r}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* text */}
      <div className="space-y-3.5">
        <Field label="Student name" value={config.text.name} placeholder="Lina Haddad — لينا حداد" onChange={(v) => setText("name", v)} />
        <Field label="Faculty / degree" value={config.text.faculty} placeholder="Faculty of Engineering" onChange={(v) => setText("faculty", v)} />
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="Year" value={config.text.year} placeholder="2027" onChange={(v) => setText("year", v)} />
          <Field label="Special text" value={config.text.custom} placeholder="Summa Cum Laude" onChange={(v) => setText("custom", v)} />
        </div>
      </div>

      {/* typography */}
      <div className="space-y-4">
        <div>
          <div className="mb-2 text-[11px] uppercase tracking-[0.22em] text-ink-muted">Typeface</div>
          <div className="grid grid-cols-2 gap-2">
            {FONTS.map((f) => {
              const active = config.fontId === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => set({ fontId: f.id })}
                  className={`glass rounded-xl px-3 py-3 transition-all duration-300 ${
                    active ? "glass-strong" : "hover:border-line-strong"
                  }`}
                  style={
                    active
                      ? { borderColor: "color-mix(in srgb, var(--gold) 55%, transparent)" }
                      : undefined
                  }
                >
                  <span
                    className="block text-[17px] leading-tight text-ink"
                    style={{ fontFamily: `"${f.family}", serif` }}
                  >
                    {f.rtl ? "تخرّج" : "Aa"}
                  </span>
                  <span className="mt-1 block text-[10px] text-ink-muted">{f.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <LuxSlider
          label="Letter height"
          value={Math.round(22 * config.fontScale) / 10}
          min={1.3}
          max={3.5}
          step={0.1}
          unit="cm"
          hint="Height of the capital letters as embroidered on the fabric."
          onChange={(v) => set({ fontScale: Math.round((v / 2.2) * 100) / 100 })}
        />

        <div>
          <div className="mb-2 text-[11px] uppercase tracking-[0.22em] text-ink-muted">Position</div>
          <Segmented<EmbroideryPosition>
            size="sm"
            value={config.position}
            onChange={(v) => set({ position: v })}
            options={product.positions.map((p) => ({ value: p, label: POSITION_LABELS[p] }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="mb-2 text-[11px] uppercase tracking-[0.22em] text-ink-muted">Stitch style</div>
            <Segmented<EmbroideryStyle>
              size="sm"
              value={config.style}
              onChange={(v) => set({ style: v })}
              options={[
                { value: "satin", label: "Satin" },
                { value: "outline", label: "Outline" },
                { value: "raised", label: "3D" },
              ]}
            />
          </div>
          <div>
            <div className="mb-2 text-[11px] uppercase tracking-[0.22em] text-ink-muted">Alignment</div>
            <Segmented<TextAlign>
              size="sm"
              value={config.align}
              onChange={(v) => set({ align: v })}
              options={[
                { value: "left", label: "⟸" },
                { value: "center", label: "⊙" },
                { value: "right", label: "⟹" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* logo upload */}
      <div className="space-y-3">
        <div className="text-[11px] uppercase tracking-[0.22em] text-ink-muted">
          University / faculty logo
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".png,.jpg,.jpeg,.webp,.svg,.gif,.pdf,.ai,.eps"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = "";
          }}
        />
        {config.logo ? (
          <div className="glass flex items-center gap-3 rounded-2xl p-3">
            {config.logo.dataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={config.logo.dataUrl}
                alt="logo"
                className="h-12 w-12 rounded-lg bg-white/5 object-contain p-1"
              />
            ) : (
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-strong text-[16px]">
                ◆
              </span>
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12.5px] font-medium text-ink">
                {config.logo.fileName}
              </div>
              <div className="text-[10.5px] text-ink-muted">
                {config.logo.dataUrl
                  ? "Vectorized · centered · placed on the garment"
                  : "Vector file received — digitized by the atelier within 24h"}
              </div>
            </div>
            <button
              onClick={() => set({ logo: null })}
              className="shrink-0 rounded-full px-2.5 py-1 text-[11px] text-ink-muted transition-colors hover:text-danger"
            >
              Remove
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="glass w-full rounded-2xl border-dashed px-4 py-6 text-center transition-all duration-300 hover:border-gold/50"
          >
            <div className="text-[13px] text-ink-secondary">Drop your crest here</div>
            <div className="mt-1 text-[10.5px] text-ink-muted">PNG · SVG · PDF · AI · EPS</div>
          </button>
        )}
        {config.logo?.dataUrl && (
          <LuxSlider
            label="Logo size"
            value={Math.round(6 * config.logoScale * 10) / 10}
            min={3}
            max={9}
            step={0.5}
            unit="cm"
            hint="Embroidered logo height on the garment."
            onChange={(v) => set({ logoScale: Math.round((v / 6) * 100) / 100 })}
          />
        )}
      </div>

      <button onClick={onNext} className="btn-gold w-full rounded-2xl py-3.5 text-[13.5px] font-semibold">
        Review my design →
      </button>
    </div>
  );
}
