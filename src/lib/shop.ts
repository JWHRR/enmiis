import type { ProductId } from "./types";

/* ------------------------------------------------------------------ */
/*  ENMIIS Shop — ready-to-wear listings                               */
/*  Fixed retail pricing; the 3D atelier is the optional upgrade path. */
/* ------------------------------------------------------------------ */

export interface SizePreset {
  id: "S" | "M" | "L" | "XL" | "XXL";
  height: string;
  measurements: Record<string, number>;
}

export interface Listing {
  product: ProductId;
  name: string;
  blurb: string;
  price: number;
  compareAt?: number;
  premiumColorSurcharge: number;
  colorIds: string[];
  sizes: SizePreset[];
  features: string[];
  deliveryDays: number;
}

export const LISTINGS: Listing[] = [
  {
    product: "robe",
    name: "Graduation Robe",
    blurb:
      "The full ceremonial silhouette — fluid matte tricot, bell sleeves, front placket and a drape that photographs beautifully from every angle.",
    price: 189,
    compareAt: 229,
    premiumColorSurcharge: 12,
    colorIds: ["midnight", "navy", "bordeaux", "emerald", "royal", "graphite", "ivory"],
    sizes: [
      { id: "S", height: "150–160 cm", measurements: { height: 132, shoulder: 42, bottom: 158, sleeveOpen: 44, sleeveLen: 57, chest: 50 } },
      { id: "M", height: "160–170 cm", measurements: { height: 138, shoulder: 44, bottom: 165, sleeveOpen: 46, sleeveLen: 60, chest: 53 } },
      { id: "L", height: "170–180 cm", measurements: { height: 144, shoulder: 46, bottom: 172, sleeveOpen: 48, sleeveLen: 62, chest: 56 } },
      { id: "XL", height: "180–190 cm", measurements: { height: 150, shoulder: 49, bottom: 180, sleeveOpen: 50, sleeveLen: 64, chest: 61 } },
      { id: "XXL", height: "190+ cm", measurements: { height: 156, shoulder: 52, bottom: 188, sleeveOpen: 52, sleeveLen: 66, chest: 66 } },
    ],
    features: [
      "Matte ceremonial tricot, 180 g/m²",
      "Concealed front zip with pleated placket",
      "Matching mortarboard cap included",
      "Ready to ship in 48h",
    ],
    deliveryDays: 4,
  },
  {
    product: "cape",
    name: "Graduation Cape",
    blurb:
      "A dramatic, weightless drape that moves like water. The choice of valedictorians and front-row moments.",
    price: 149,
    compareAt: 179,
    premiumColorSurcharge: 10,
    colorIds: ["midnight", "navy", "bordeaux", "emerald", "ivory"],
    sizes: [
      { id: "S", height: "150–160 cm", measurements: { height: 92, shoulder: 42, bottom: 225, neck: 36 } },
      { id: "M", height: "160–170 cm", measurements: { height: 98, shoulder: 44, bottom: 238, neck: 37 } },
      { id: "L", height: "170–180 cm", measurements: { height: 104, shoulder: 46, bottom: 250, neck: 38 } },
      { id: "XL", height: "180–190 cm", measurements: { height: 110, shoulder: 49, bottom: 264, neck: 40 } },
      { id: "XXL", height: "190+ cm", measurements: { height: 116, shoulder: 52, bottom: 278, neck: 42 } },
    ],
    features: [
      "Deluxe satin face, soft matte reverse",
      "Sculpted collar, hidden clasp",
      "Matching mortarboard cap included",
      "Ready to ship in 48h",
    ],
    deliveryDays: 4,
  },
];

export const listingByProduct = (p: string) =>
  LISTINGS.find((l) => l.product === p) ?? LISTINGS[0];
