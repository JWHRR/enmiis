"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { COLORS, FABRICS, THREADS, colorById, threadById } from "@/lib/catalog";
import { suggestPalettes } from "@/lib/design-ai";
import { useDesignStore } from "@/lib/store";
import { SectionLabel, Segmented, Swatch } from "@/components/ui/Kit";
import type { BorderId, CollarId, FinishId } from "@/lib/types";

export default function StepFabric({ onNext }: { onNext: () => void }) {
  const { config, set } = useDesignStore();
  const [showPalettes, setShowPalettes] = useState(false);
  const palettes = suggestPalettes(config);

  return (
    <div className="space-y-6">
      <div>
        <SectionLabel>Step 3 — Fabric & Color</SectionLabel>
        <h2 className="font-display mt-2 text-2xl font-light text-ink">
          Choose your <span className="italic text-gradient-gold">material</span>
        </h2>
      </div>

      {/* AI color assistant */}
      <div className="glass rounded-2xl p-4">
        <button
          onClick={() => setShowPalettes((v) => !v)}
          className="flex w-full items-center justify-between text-left"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-[15px]">✨</span>
            <div>
              <div className="text-[13px] font-medium text-ink">Color Intelligence</div>
              <div className="text-[11px] text-ink-muted">
                University palettes, ranked by embroidery contrast
              </div>
            </div>
          </div>
          <span className={`text-ink-muted transition-transform duration-300 ${showPalettes ? "rotate-180" : ""}`}>
            ⌄
          </span>
        </button>
        <AnimatePresence>
          {showPalettes && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-2">
                {palettes.map((p) => {
                  const activeP =
                    config.colorId === p.colorId && config.threadId === p.threadId;
                  return (
                    <button
                      key={p.name}
                      onClick={() => set({ colorId: p.colorId, threadId: p.threadId })}
                      className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-all duration-300 ${
                        activeP ? "border-gold/60 bg-surface-strong" : "border-line hover:border-line-strong"
                      }`}
                    >
                      <span className="relative h-8 w-8 shrink-0">
                        <span
                          className="absolute inset-0 rounded-full"
                          style={{ background: colorById(p.colorId).hex }}
                        />
                        <span
                          className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2"
                          style={{
                            background: threadById(p.threadId).hex,
                            borderColor: "var(--bg-elevated)",
                          }}
                        />
                      </span>
                      <span className="flex-1">
                        <span className="block text-[12px] font-medium text-ink">{p.name}</span>
                        <span className="block text-[10.5px] text-ink-muted">{p.note}</span>
                      </span>
                      <span className="shrink-0 rounded-full bg-surface-strong px-2 py-0.5 text-[9.5px] text-gold">
                        {p.contrast}:1
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* fabric */}
      <div className="space-y-2.5">
        <div className="text-[11px] uppercase tracking-[0.22em] text-ink-muted">Fabric</div>
        {FABRICS.map((f) => {
          const active = config.fabricId === f.id;
          return (
            <button
              key={f.id}
              onClick={() => set({ fabricId: f.id })}
              className={`glass flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition-all duration-300 ${
                active ? "glass-strong" : "hover:border-line-strong"
              }`}
              style={
                active
                  ? { borderColor: "color-mix(in srgb, var(--gold) 55%, transparent)" }
                  : undefined
              }
            >
              <div>
                <div className="flex items-center gap-2 text-[13px] font-medium text-ink">
                  {f.name}
                  {f.premium && <span className="text-[9px] text-gold">✦ PREMIUM</span>}
                </div>
                <div className="text-[11px] text-ink-muted">{f.description}</div>
              </div>
              <div className="text-right text-[11px] text-ink-muted">
                <div className="tabular text-[12.5px] text-ink-secondary">{f.pricePerMeter}/m</div>
                <div>{f.weightGsm} g/m²</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* color */}
      <div className="space-y-3">
        <div className="text-[11px] uppercase tracking-[0.22em] text-ink-muted">
          Dye — {colorById(config.colorId).name}
        </div>
        <div className="grid grid-cols-5 gap-2.5">
          {COLORS.map((c) => (
            <Swatch
              key={c.id}
              hex={c.hex}
              name={c.name}
              premium={c.premium}
              active={config.colorId === c.id}
              onClick={() => set({ colorId: c.id })}
            />
          ))}
        </div>
      </div>

      {/* thread preview here too — it affects contrast */}
      <div className="space-y-3">
        <div className="text-[11px] uppercase tracking-[0.22em] text-ink-muted">
          Thread — {threadById(config.threadId).name}
        </div>
        <div className="grid grid-cols-5 gap-2.5">
          {THREADS.map((t) => (
            <Swatch
              key={t.id}
              hex={t.hex}
              name={t.name}
              premium={t.metallic}
              active={config.threadId === t.id}
              onClick={() => set({ threadId: t.id })}
            />
          ))}
        </div>
      </div>

      {/* construction */}
      <div className="space-y-4">
        <div>
          <div className="mb-2 text-[11px] uppercase tracking-[0.22em] text-ink-muted">Collar</div>
          <Segmented<CollarId>
            size="sm"
            value={config.collar}
            onChange={(v) => set({ collar: v })}
            options={[
              { value: "classic", label: "Classic" },
              { value: "satin-v", label: "Satin V" },
              { value: "shawl", label: "Shawl" },
            ]}
          />
        </div>
        <div>
          <div className="mb-2 text-[11px] uppercase tracking-[0.22em] text-ink-muted">Border</div>
          <Segmented<BorderId>
            size="sm"
            value={config.border}
            onChange={(v) => set({ border: v })}
            options={[
              { value: "none", label: "Clean" },
              { value: "satin-piping", label: "Satin Piping" },
              { value: "gold-trim", label: "Gold Trim" },
            ]}
          />
        </div>
        <div>
          <div className="mb-2 text-[11px] uppercase tracking-[0.22em] text-ink-muted">Finish</div>
          <Segmented<FinishId>
            size="sm"
            value={config.finish}
            onChange={(v) => set({ finish: v })}
            options={[
              { value: "matte", label: "Matte" },
              { value: "satin", label: "Satin" },
              { value: "velvet", label: "Velvet" },
            ]}
          />
        </div>
      </div>

      <button onClick={onNext} className="btn-gold w-full rounded-2xl py-3.5 text-[13.5px] font-semibold">
        Continue to Embroidery →
      </button>
    </div>
  );
}
