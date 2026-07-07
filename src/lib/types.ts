/* ------------------------------------------------------------------ */
/*  ENMIIS — Domain types                                             */
/* ------------------------------------------------------------------ */

export type ProductId =
  | "robe"
  | "cape"
  | "stole-american"
  | "stole-european"
  | "sash";

export type FinishId = "matte" | "satin" | "velvet";
export type CollarId = "classic" | "satin-v" | "shawl";
export type BorderId = "none" | "satin-piping" | "gold-trim";
export type EmbroideryStyle = "satin" | "outline" | "raised";
export type EmbroideryPosition =
  | "panel-right"
  | "panel-left"
  | "panel-both"
  | "chest-center";
export type Urgency = "standard" | "express" | "rush";
export type TextAlign = "left" | "center" | "right";

export interface MeasurementSpec {
  key: string;
  label: string;
  hint: string;
  min: number;
  max: number;
  default: number;
  step: number;
  /** which dimension the SVG guide highlights */
  guide: "height" | "shoulder" | "bottom" | "sleeveOpen" | "sleeveLen" | "chest" | "length" | "width";
}

export interface FabricDef {
  id: string;
  name: string;
  description: string;
  pricePerMeter: number;
  weightGsm: number;
  /** material params for the 3D preview */
  roughness: number;
  sheen: number;
  premium?: boolean;
}

export interface ColorDef {
  id: string;
  name: string;
  hex: string;
  premium?: boolean;
}

export interface ThreadDef {
  id: string;
  name: string;
  hex: string;
  metallic?: boolean;
}

export interface FontDef {
  id: string;
  name: string;
  family: string;
  /** supports Arabic script */
  rtl?: boolean;
}

export interface ProductDef {
  id: ProductId;
  name: string;
  tagline: string;
  measurements: MeasurementSpec[];
  positions: EmbroideryPosition[];
}

export interface EmbroideryText {
  name: string;
  faculty: string;
  year: string;
  custom: string;
}

export interface LogoAsset {
  dataUrl: string;
  fileName: string;
}

export interface DesignConfig {
  product: ProductId;
  measurements: Record<string, number>;

  fabricId: string;
  colorId: string;
  collar: CollarId;
  border: BorderId;
  finish: FinishId;

  threadId: string;
  text: EmbroideryText;
  fontId: string;
  fontScale: number; // 0.6 – 1.6
  align: TextAlign;
  position: EmbroideryPosition;
  style: EmbroideryStyle;

  logo: LogoAsset | null;
  logoScale: number; // 0.5 – 1.5

  accessories: {
    cap: boolean;
    tassel: boolean;
    giftBox: boolean;
  };

  urgency: Urgency;
}

/* ---------------------------- pricing ----------------------------- */

export interface PricingCoefficients {
  baseProduct: Record<ProductId, number>;
  premiumColorSurcharge: number;
  collarSurcharge: Record<CollarId, number>;
  borderSurcharge: Record<BorderId, number>;
  finishSurcharge: Record<FinishId, number>;

  /* embroidery */
  stitchPricePer1000: number;
  threadColorSurcharge: number;
  metallicThreadSurcharge: number;
  densityCoefficientPerCm2: number;
  embroiderySetupFee: number;
  logoDigitizationFee: number;
  positionMultiplier: Record<EmbroideryPosition, number>;
  styleMultiplier: Record<EmbroideryStyle, number>;

  /* production */
  fabricRollWidthCm: number;
  wastePercent: number;
  laborRatePerHour: number;
  machineStitchesPerMinute: number;
  complexityCoefficient: number;

  /* commercial */
  accessories: { cap: number; tassel: number; giftBox: number };
  urgencyMultiplier: Record<Urgency, number>;
  vatPercent: number;
  marginPercent: number;

  /* delivery */
  baseProductionDays: Record<ProductId, number>;
  urgencyDaysFactor: Record<Urgency, number>;
}

export interface PriceLine {
  label: string;
  amount: number;
  detail?: string;
}

export interface Estimates {
  fabricMeters: number;
  fabricWeightKg: number;
  stitchCount: number;
  threadMeters: number;
  machineMinutes: number;
  productionHours: number;
  deliveryDays: number;
  embroideryAreaCm2: number;
}

export interface Quote {
  lines: PriceLine[];
  subtotal: number;
  vat: number;
  total: number;
  estimates: Estimates;
}
