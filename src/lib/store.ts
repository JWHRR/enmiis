"use client";

import { create } from "zustand";
import { productById } from "./catalog";
import type { DesignConfig, ProductId } from "./types";

/* ------------------------------------------------------------------ */
/*  Design store — undo/redo, autosave, hydration-safe                 */
/* ------------------------------------------------------------------ */

const SAVE_KEY = "ennmiss-design-v1";
const HISTORY_LIMIT = 60;

export function defaultConfig(product: ProductId = "robe"): DesignConfig {
  const p = productById(product);
  return {
    product,
    measurements: Object.fromEntries(
      p.measurements.map((m) => [m.key, m.default])
    ),
    fabricId: "deluxe-satin",
    colorId: "midnight",
    collar: "classic",
    border: "none",
    finish: "satin",
    threadId: "gold",
    text: { name: "", faculty: "", year: String(new Date().getFullYear() + 1), custom: "" },
    fontId: "fraunces",
    fontScale: 1,
    align: "center",
    position: p.positions[0],
    style: "satin",
    logo: null,
    logoScale: 1,
    accessories: { cap: true, tassel: true, giftBox: false },
    urgency: "standard",
  };
}

interface DesignStore {
  config: DesignConfig;
  past: DesignConfig[];
  future: DesignConfig[];
  hydrated: boolean;
  savedAt: number | null;

  set: (patch: Partial<DesignConfig>, transient?: boolean) => void;
  setMeasurement: (key: string, value: number) => void;
  setProduct: (product: ProductId) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  hydrate: () => void;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleSave(config: DesignConfig, onSaved: () => void) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(config));
      onSaved();
    } catch {
      /* storage full or unavailable — autosave silently skips */
    }
  }, 600);
}

export const useDesignStore = create<DesignStore>()((set, get) => ({
  config: defaultConfig(),
  past: [],
  future: [],
  hydrated: false,
  savedAt: null,

  set: (patch, transient = false) => {
    const { config, past } = get();
    const next = { ...config, ...patch };
    set({
      config: next,
      past: transient ? past : [...past.slice(-HISTORY_LIMIT), config],
      future: transient ? get().future : [],
    });
    scheduleSave(next, () => set({ savedAt: Date.now() }));
  },

  setMeasurement: (key, value) => {
    const { config } = get();
    get().set({ measurements: { ...config.measurements, [key]: value } });
  },

  setProduct: (product) => {
    const { config, past } = get();
    if (config.product === product) return;
    const p = productById(product);
    const next: DesignConfig = {
      ...config,
      product,
      measurements: Object.fromEntries(
        p.measurements.map((m) => {
          const prev = config.measurements[m.key];
          /* carry compatible values over, clamped into this product's range */
          const v =
            prev === undefined ? m.default : Math.min(m.max, Math.max(m.min, prev));
          return [m.key, v];
        })
      ),
      position: p.positions.includes(config.position)
        ? config.position
        : p.positions[0],
    };
    set({ config: next, past: [...past.slice(-HISTORY_LIMIT), config], future: [] });
    scheduleSave(next, () => set({ savedAt: Date.now() }));
  },

  undo: () => {
    const { past, config, future } = get();
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    set({ config: prev, past: past.slice(0, -1), future: [config, ...future] });
    scheduleSave(prev, () => set({ savedAt: Date.now() }));
  },

  redo: () => {
    const { past, config, future } = get();
    if (future.length === 0) return;
    const [next, ...rest] = future;
    set({ config: next, past: [...past, config], future: rest });
    scheduleSave(next, () => set({ savedAt: Date.now() }));
  },

  reset: () => {
    const { config, past } = get();
    const next = defaultConfig(config.product);
    set({ config: next, past: [...past, config], future: [] });
    scheduleSave(next, () => set({ savedAt: Date.now() }));
  },

  hydrate: () => {
    if (get().hydrated) return;
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as DesignConfig;
        const base = defaultConfig(saved.product ?? "robe");
        set({
          config: {
            ...base,
            ...saved,
            text: { ...base.text, ...saved.text },
            accessories: { ...base.accessories, ...saved.accessories },
            measurements: { ...base.measurements, ...saved.measurements },
          },
          hydrated: true,
        });
        return;
      }
    } catch {
      /* corrupted save — fall through to defaults */
    }
    set({ hydrated: true });
  },
}));
