import { fabricById, colorById, threadById, productById } from "./catalog";
import type {
  DesignConfig,
  Estimates,
  PriceLine,
  PricingCoefficients,
  Quote,
} from "./types";

/* ------------------------------------------------------------------ */
/*  Default coefficients — every value is editable from /admin         */
/*  without touching code. Stored in localStorage, merged over these.  */
/* ------------------------------------------------------------------ */

export const DEFAULT_COEFFICIENTS: PricingCoefficients = {
  baseProduct: {
    robe: 38,
    cape: 30,
    "stole-american": 14,
    "stole-european": 16,
    sash: 12,
  },
  premiumColorSurcharge: 6,
  collarSurcharge: { classic: 0, "satin-v": 5, shawl: 9 },
  borderSurcharge: { none: 0, "satin-piping": 7, "gold-trim": 14 },
  finishSurcharge: { matte: 0, satin: 4, velvet: 11 },

  stitchPricePer1000: 0.9,
  threadColorSurcharge: 1.5,
  metallicThreadSurcharge: 3.5,
  densityCoefficientPerCm2: 0.055,
  embroiderySetupFee: 6,
  logoDigitizationFee: 12,
  positionMultiplier: {
    "panel-right": 1,
    "panel-left": 1,
    "panel-both": 1.85,
    "chest-center": 1.1,
  },
  styleMultiplier: { satin: 1, outline: 0.75, raised: 1.4 },

  fabricRollWidthCm: 150,
  wastePercent: 12,
  laborRatePerHour: 8,
  machineStitchesPerMinute: 750,
  complexityCoefficient: 1.08,

  accessories: { cap: 15, tassel: 6, giftBox: 9 },
  urgencyMultiplier: { standard: 1, express: 1.2, rush: 1.45 },
  vatPercent: 19,
  marginPercent: 22,

  baseProductionDays: {
    robe: 7,
    cape: 6,
    "stole-american": 4,
    "stole-european": 4,
    sash: 3,
  },
  urgencyDaysFactor: { standard: 1, express: 0.6, rush: 0.35 },
};

const COEFF_KEY = "ennmiss-coefficients-v1";

export function loadCoefficients(): PricingCoefficients {
  if (typeof window === "undefined") return DEFAULT_COEFFICIENTS;
  try {
    const raw = localStorage.getItem(COEFF_KEY);
    if (!raw) return DEFAULT_COEFFICIENTS;
    return deepMerge(DEFAULT_COEFFICIENTS, JSON.parse(raw));
  } catch {
    return DEFAULT_COEFFICIENTS;
  }
}

export function saveCoefficients(c: PricingCoefficients) {
  localStorage.setItem(COEFF_KEY, JSON.stringify(c));
}

export function resetCoefficients() {
  localStorage.removeItem(COEFF_KEY);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepMerge<T>(base: T, patch: any): T {
  if (typeof base !== "object" || base === null) return (patch ?? base) as T;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const out: any = Array.isArray(base) ? [...base] : { ...base };
  for (const k of Object.keys(base as object)) {
    if (patch && Object.prototype.hasOwnProperty.call(patch, k)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      out[k] = deepMerge((base as any)[k], patch[k]);
    }
  }
  return out as T;
}

/* ------------------------------------------------------------------ */
/*  Estimation engine                                                  */
/* ------------------------------------------------------------------ */

/** Approximate character stitch counts by embroidery style, per cm of letter height */
const STITCHES_PER_CHAR_PER_CM = 220;
const LOGO_STITCHES_PER_CM2 = 180;

export function countEmbroideryChars(cfg: DesignConfig): number {
  const { name, faculty, year, custom } = cfg.text;
  return [name, faculty, year, custom].join("").replace(/\s/g, "").length;
}

export function computeEstimates(
  cfg: DesignConfig,
  c: PricingCoefficients
): Estimates {
  const fabric = fabricById(cfg.fabricId);
  const m = cfg.measurements;

  /* -------- fabric consumption (all cm → meters) ------------------ */
  let areaCm2 = 0;
  switch (cfg.product) {
    case "robe": {
      const body = ((m.chest ?? 56) + (m.bottom ?? 170)) * 0.5 * (m.height ?? 140) * 2; // front + back trapezoid
      const sleeves = (m.sleeveLen ?? 62) * (m.sleeveOpen ?? 48) * 1.4 * 2;
      areaCm2 = body + sleeves;
      break;
    }
    case "cape": {
      areaCm2 = ((m.bottom ?? 240) + (m.neck ?? 38) * 2) * 0.5 * (m.height ?? 100) * 1.15;
      break;
    }
    case "stole-american":
    case "stole-european": {
      areaCm2 = (m.length ?? 80) * 2 * (m.width ?? 14) * 2.1; // two panels, doubled fabric
      break;
    }
    case "sash": {
      areaCm2 = (m.length ?? 170) * (m.width ?? 10) * 2.1;
      break;
    }
  }
  const waste = 1 + c.wastePercent / 100;
  const fabricMeters = (areaCm2 / (c.fabricRollWidthCm * 100)) * waste;
  const fabricWeightKg = (areaCm2 / 10000) * (fabric.weightGsm / 1000) * waste;

  /* -------- embroidery ------------------------------------------- */
  const letterHeightCm = 2.2 * cfg.fontScale;
  const chars = countEmbroideryChars(cfg);
  const styleMul = c.styleMultiplier[cfg.style];
  const positionMul = c.positionMultiplier[cfg.position];

  let stitchCount = chars * STITCHES_PER_CHAR_PER_CM * letterHeightCm * styleMul;
  const logoAreaCm2 = cfg.logo ? 36 * cfg.logoScale * cfg.logoScale : 0;
  stitchCount += logoAreaCm2 * LOGO_STITCHES_PER_CM2;
  stitchCount *= positionMul;
  stitchCount = Math.round(stitchCount);

  const textAreaCm2 = chars * letterHeightCm * letterHeightCm * 0.62;
  const embroideryAreaCm2 = Math.round((textAreaCm2 + logoAreaCm2) * positionMul);

  const threadMeters = Math.round((stitchCount * 0.7) / 100) * 10; // ~7mm per stitch incl. bobbin
  const machineMinutes = Math.ceil(stitchCount / c.machineStitchesPerMinute);

  /* -------- production time -------------------------------------- */
  const cutSewHours =
    cfg.product === "robe" ? 2.4 : cfg.product === "cape" ? 1.8 : 0.9;
  const productionHours =
    Math.round((cutSewHours + machineMinutes / 60 + 0.4) * 10) / 10;

  const deliveryDays = Math.max(
    2,
    Math.ceil(
      (c.baseProductionDays[cfg.product] + productionHours / 8) *
        c.urgencyDaysFactor[cfg.urgency]
    ) + 2 // transit
  );

  return {
    fabricMeters: Math.round(fabricMeters * 100) / 100,
    fabricWeightKg: Math.round(fabricWeightKg * 100) / 100,
    stitchCount,
    threadMeters,
    machineMinutes,
    productionHours,
    deliveryDays,
    embroideryAreaCm2,
  };
}

/* ------------------------------------------------------------------ */
/*  Price engine                                                       */
/*                                                                     */
/*  Price = Base + Fabric + Embroidery + Logo + Thread + Complexity    */
/*          + Accessories + Rush + Margin + VAT                        */
/*                                                                     */
/*  Embroidery = (stitches × price/1000) + (threads × surcharge)       */
/*             + (area × density coefficient) + setup fee              */
/* ------------------------------------------------------------------ */

export function computeQuote(
  cfg: DesignConfig,
  c: PricingCoefficients
): Quote {
  const est = computeEstimates(cfg, c);
  const fabric = fabricById(cfg.fabricId);
  const color = colorById(cfg.colorId);
  const thread = threadById(cfg.threadId);
  const product = productById(cfg.product);
  const lines: PriceLine[] = [];

  const base = c.baseProduct[cfg.product];
  lines.push({ label: `${product.name} — base`, amount: base });

  const fabricCost = est.fabricMeters * fabric.pricePerMeter;
  lines.push({
    label: `Fabric — ${fabric.name}`,
    amount: fabricCost,
    detail: `${est.fabricMeters} m × ${fabric.pricePerMeter}/m`,
  });

  if (color.premium) {
    lines.push({ label: `Premium dye — ${color.name}`, amount: c.premiumColorSurcharge });
  }

  const construction =
    c.collarSurcharge[cfg.collar] +
    c.borderSurcharge[cfg.border] +
    c.finishSurcharge[cfg.finish];
  if (construction > 0) {
    lines.push({ label: "Construction — collar, border, finish", amount: construction });
  }

  const hasEmbroidery = est.stitchCount > 0;
  if (hasEmbroidery) {
    const stitchCost = (est.stitchCount / 1000) * c.stitchPricePer1000;
    const densityCost = est.embroideryAreaCm2 * c.densityCoefficientPerCm2;
    lines.push({
      label: "Embroidery — stitching",
      amount: stitchCost + densityCost + c.embroiderySetupFee,
      detail: `${est.stitchCount.toLocaleString()} stitches · ${est.embroideryAreaCm2} cm² · setup`,
    });

    const threadCost =
      c.threadColorSurcharge + (thread.metallic ? c.metallicThreadSurcharge : 0);
    lines.push({
      label: `Thread — ${thread.name}`,
      amount: threadCost,
      detail: `${est.threadMeters} m estimated`,
    });
  }

  if (cfg.logo) {
    lines.push({
      label: "Logo digitization & vectorization",
      amount: c.logoDigitizationFee,
      detail: cfg.logo.fileName,
    });
  }

  const labor = est.productionHours * c.laborRatePerHour;
  lines.push({
    label: "Atelier labor",
    amount: labor,
    detail: `${est.productionHours} h × ${c.laborRatePerHour}/h`,
  });

  const acc = cfg.accessories;
  if (acc.cap) lines.push({ label: "Mortarboard cap", amount: c.accessories.cap });
  if (acc.tassel) lines.push({ label: "Silk tassel", amount: c.accessories.tassel });
  if (acc.giftBox) lines.push({ label: "Signature gift box", amount: c.accessories.giftBox });

  let subtotal = lines.reduce((s, l) => s + l.amount, 0);

  /* complexity applies when embroidery + premium construction combine */
  if (hasEmbroidery && (cfg.border !== "none" || cfg.collar !== "classic")) {
    const complexity = subtotal * (c.complexityCoefficient - 1);
    lines.push({ label: "Complexity coefficient", amount: complexity });
    subtotal += complexity;
  }

  const rushMul = c.urgencyMultiplier[cfg.urgency];
  if (rushMul > 1) {
    const rush = subtotal * (rushMul - 1);
    lines.push({
      label: cfg.urgency === "rush" ? "Rush production" : "Express production",
      amount: rush,
    });
    subtotal += rush;
  }

  const margin = subtotal * (c.marginPercent / 100);
  lines.push({ label: "Atelier margin", amount: margin });
  subtotal += margin;

  const vat = subtotal * (c.vatPercent / 100);
  const total = subtotal + vat;

  return {
    lines: lines.map((l) => ({ ...l, amount: round2(l.amount) })),
    subtotal: round2(subtotal),
    vat: round2(vat),
    total: round2(total),
    estimates: est,
  };
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export const fmt = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
