import type {
  ColorDef,
  FabricDef,
  FontDef,
  ProductDef,
  ThreadDef,
} from "./types";

/* ------------------------------------------------------------------ */
/*  Product catalog — measurement specs mirror the atelier's           */
/*  production sheets (all values in cm).                              */
/* ------------------------------------------------------------------ */

export const PRODUCTS: ProductDef[] = [
  {
    id: "robe",
    name: "Graduation Robe",
    tagline: "The full ceremonial silhouette",
    measurements: [
      { key: "height", label: "Height", hint: "From the top of the shoulder to the hem, standing straight.", min: 120, max: 160, default: 140, step: 1, guide: "height" },
      { key: "shoulder", label: "Shoulder Width", hint: "Across the back, from shoulder seam to shoulder seam.", min: 38, max: 60, default: 46, step: 0.5, guide: "shoulder" },
      { key: "bottom", label: "Bottom Width", hint: "The full sweep of the hem when laid flat.", min: 120, max: 220, default: 170, step: 1, guide: "bottom" },
      { key: "sleeveOpen", label: "Sleeve Opening", hint: "Circumference of the bell sleeve at the wrist.", min: 30, max: 70, default: 48, step: 1, guide: "sleeveOpen" },
      { key: "sleeveLen", label: "Sleeve Length", hint: "From shoulder seam to the sleeve edge.", min: 50, max: 75, default: 62, step: 0.5, guide: "sleeveLen" },
      { key: "chest", label: "Chest Width", hint: "Across the chest, armpit to armpit, laid flat.", min: 44, max: 80, default: 56, step: 0.5, guide: "chest" },
    ],
    positions: ["chest-center", "panel-right", "panel-left", "panel-both"],
  },
  {
    id: "cape",
    name: "Graduation Cape",
    tagline: "A dramatic, weightless drape",
    measurements: [
      { key: "height", label: "Cape Length", hint: "From the collar to the hem.", min: 70, max: 130, default: 100, step: 1, guide: "height" },
      { key: "shoulder", label: "Shoulder Width", hint: "Across the back between shoulder points.", min: 38, max: 60, default: 46, step: 0.5, guide: "shoulder" },
      { key: "bottom", label: "Bottom Sweep", hint: "The full circumference of the hem.", min: 180, max: 320, default: 240, step: 2, guide: "bottom" },
      { key: "neck", label: "Neck Circumference", hint: "Around the base of the neck, one finger of ease.", min: 32, max: 48, default: 38, step: 0.5, guide: "width" },
    ],
    positions: ["chest-center", "panel-right", "panel-left"],
  },
];

export const FABRICS: FabricDef[] = [
  { id: "matte-tricot", name: "Matte Tricot", description: "The ceremonial standard. Fluid, opaque, dignified.", pricePerMeter: 9, weightGsm: 180, roughness: 0.85, sheen: 0.15 },
  { id: "deluxe-satin", name: "Deluxe Satin", description: "Liquid light. A soft lustre that moves with you.", pricePerMeter: 14, weightGsm: 160, roughness: 0.35, sheen: 0.6 },
  { id: "silk-touch", name: "Silk Touch", description: "Featherweight with a whispered shine.", pricePerMeter: 21, weightGsm: 120, roughness: 0.4, sheen: 0.8, premium: true },
  { id: "royal-velvet", name: "Royal Velvet", description: "Deep pile, absolute presence. For the front row.", pricePerMeter: 28, weightGsm: 320, roughness: 0.95, sheen: 1.0, premium: true },
];

export const COLORS: ColorDef[] = [
  { id: "midnight", name: "Midnight Black", hex: "#15151c" },
  { id: "navy", name: "Oxford Navy", hex: "#1b2a4a" },
  { id: "bordeaux", name: "Bordeaux", hex: "#5c1f2e" },
  { id: "emerald", name: "Emerald", hex: "#1a4a38" },
  { id: "royal", name: "Royal Blue", hex: "#1e3d8f" },
  { id: "graphite", name: "Graphite", hex: "#3a3a42" },
  { id: "ivory", name: "Ivory", hex: "#efe9da" },
  { id: "crimson", name: "Crimson", hex: "#8f1f2e", premium: true },
  { id: "sapphire", name: "Sapphire", hex: "#0f2f6e", premium: true },
  { id: "champagne", name: "Champagne Gold", hex: "#c9b078", premium: true },
];

export const THREADS: ThreadDef[] = [
  { id: "gold", name: "Gold Metallic", hex: "#d4af5e", metallic: true },
  { id: "silver", name: "Silver Metallic", hex: "#c8cdd6", metallic: true },
  { id: "white", name: "Pearl White", hex: "#f2efe6" },
  { id: "black", name: "Jet Black", hex: "#1a1a1e" },
  { id: "royal-thread", name: "Royal Blue", hex: "#2d4fa8" },
  { id: "crimson-thread", name: "Crimson", hex: "#a32638" },
  { id: "emerald-thread", name: "Emerald", hex: "#1f6e4e" },
];

export const FONTS: FontDef[] = [
  { id: "fraunces", name: "Serif Couture", family: "Fraunces" },
  { id: "cinzel", name: "Roman Capital", family: "Cinzel" },
  { id: "script", name: "Signature Script", family: "Great Vibes" },
  { id: "amiri", name: "Amiri — عربي", family: "Amiri", rtl: true },
];

export const POSITION_LABELS: Record<string, string> = {
  "panel-right": "Right Panel",
  "panel-left": "Left Panel",
  "panel-both": "Both Panels",
  "chest-center": "Chest Center",
};

export const productById = (id: string) =>
  PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0];
export const fabricById = (id: string) =>
  FABRICS.find((f) => f.id === id) ?? FABRICS[0];
export const colorById = (id: string) =>
  COLORS.find((c) => c.id === id) ?? COLORS[0];
export const threadById = (id: string) =>
  THREADS.find((t) => t.id === id) ?? THREADS[0];
export const fontById = (id: string) =>
  FONTS.find((f) => f.id === id) ?? FONTS[0];

/* Curated university palettes for the AI color assistant */
export const UNIVERSITY_PALETTES: {
  name: string;
  colorId: string;
  threadId: string;
  note: string;
}[] = [
  { name: "Heritage Navy & Gold", colorId: "navy", threadId: "gold", note: "The timeless academic pairing — maximum authority." },
  { name: "Bordeaux & Pearl", colorId: "bordeaux", threadId: "white", note: "Warm, literary, quietly luxurious." },
  { name: "Emerald & Gold", colorId: "emerald", threadId: "gold", note: "Regal depth with a jewelled accent." },
  { name: "Midnight & Silver", colorId: "midnight", threadId: "silver", note: "Modern monochrome — architectural and sharp." },
  { name: "Ivory & Gold", colorId: "ivory", threadId: "gold", note: "Ceremonial white for milestone moments." },
  { name: "Sapphire & Pearl", colorId: "sapphire", threadId: "white", note: "Deep-sea blue with crisp contrast." },
];
