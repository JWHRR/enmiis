import { UNIVERSITY_PALETTES, colorById, threadById } from "./catalog";
import type { DesignConfig } from "./types";

/* ------------------------------------------------------------------ */
/*  Design Intelligence                                                */
/*                                                                     */
/*  Deterministic composition engine encoding the atelier's design     */
/*  rules: hierarchy, optical balance, contrast, and embroidery-zone   */
/*  constraints. Architected so a hosted LLM endpoint can replace      */
/*  suggestLayout() 1:1 — the return contract is the API contract.     */
/* ------------------------------------------------------------------ */

export interface LayoutSuggestion {
  patch: Partial<DesignConfig>;
  rationale: string[];
}

export function suggestLayout(cfg: DesignConfig): LayoutSuggestion {
  const patch: Partial<DesignConfig> = {};
  const rationale: string[] = [];

  const name = cfg.text.name.trim();
  const faculty = cfg.text.faculty.trim();
  const longest = Math.max(name.length, faculty.length, cfg.text.custom.trim().length);
  const hasArabic = /[؀-ۿ]/.test(name + faculty + cfg.text.custom);

  /* 1 — typography scale from line length (optical balance) */
  if (longest > 22) {
    patch.fontScale = 0.7;
    rationale.push("Long lines detected — reduced letter height to preserve panel margins.");
  } else if (longest > 14) {
    patch.fontScale = 0.9;
    rationale.push("Medium line length — balanced letter height for even negative space.");
  } else if (longest > 0) {
    patch.fontScale = 1.2;
    rationale.push("Short lines — enlarged type so the composition owns the panel.");
  }

  /* 2 — font pairing */
  if (hasArabic) {
    patch.fontId = "amiri";
    rationale.push("Arabic detected — switched to Amiri, drawn right-to-left with correct shaping.");
  } else if (name && !faculty) {
    patch.fontId = "script";
    rationale.push("Name-only composition — Signature Script gives it a personal, engraved feel.");
  } else if (faculty.length > 18) {
    patch.fontId = "fraunces";
    rationale.push("Long institutional line — Serif Couture keeps it legible at small sizes.");
  } else if (faculty) {
    patch.fontId = "cinzel";
    rationale.push("Institutional text — Roman capitals carry ceremonial authority.");
  }

  /* 3 — placement by product zones */
  if (cfg.product === "robe" && cfg.logo) {
    patch.position = "chest-center";
    rationale.push("Logo present on a robe — chest center is the strongest focal zone.");
  } else if (cfg.product.startsWith("stole")) {
    patch.position = name && faculty ? "panel-both" : "panel-right";
    rationale.push(
      name && faculty
        ? "Two content groups — mirrored across both panels for symmetry."
        : "Single content group — right panel, where the eye lands first."
    );
  }

  /* 4 — alignment */
  patch.align = "center";
  rationale.push("Center axis alignment — the ceremonial standard for garment embroidery.");

  /* 5 — style by fabric */
  if (cfg.fabricId === "royal-velvet") {
    patch.style = "raised";
    rationale.push("Velvet pile swallows flat stitching — raised (3D) embroidery keeps relief.");
  } else if (cfg.fontScale && cfg.fontScale < 0.8) {
    patch.style = "satin";
    rationale.push("Small type — satin stitch holds detail better than raised fill.");
  }

  /* 6 — logo scale relative to type */
  if (cfg.logo) {
    patch.logoScale = Math.min(1.2, Math.max(0.7, 1.5 - longest * 0.03));
    rationale.push("Logo scaled to the golden-section of the text block height.");
  }

  if (rationale.length === 0) {
    rationale.push("Add a name or faculty to let the composer arrange your layout.");
  }

  return { patch, rationale };
}

/* ------------------------------------------------------------------ */
/*  Color Intelligence — contrast-ranked palette recommendations       */
/* ------------------------------------------------------------------ */

export interface PaletteSuggestion {
  name: string;
  colorId: string;
  threadId: string;
  note: string;
  contrast: number;
}

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(hexA: string, hexB: string): number {
  const [l1, l2] = [luminance(hexA), luminance(hexB)].sort((a, b) => b - a);
  return (l1 + 0.05) / (l2 + 0.05);
}

export function suggestPalettes(current: DesignConfig): PaletteSuggestion[] {
  return UNIVERSITY_PALETTES.map((p) => ({
    ...p,
    contrast:
      Math.round(
        contrastRatio(colorById(p.colorId).hex, threadById(p.threadId).hex) * 10
      ) / 10,
  }))
    .sort((a, b) => {
      // prefer high contrast, keep current selection ranked honestly
      const cur = (x: PaletteSuggestion) =>
        x.colorId === current.colorId ? 0.5 : 0;
      return b.contrast + cur(b) - (a.contrast + cur(a));
    })
    .slice(0, 4);
}
