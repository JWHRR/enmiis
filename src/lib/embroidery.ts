"use client";

import { fontById, threadById } from "./catalog";
import type { DesignConfig } from "./types";

/* ------------------------------------------------------------------ */
/*  Live embroidery renderer                                           */
/*                                                                     */
/*  Draws the customer's text + logo onto an offscreen canvas with a   */
/*  simulated thread finish (satin sheen, stitch striping, raised      */
/*  relief). The canvas becomes a THREE.CanvasTexture on the garment.  */
/* ------------------------------------------------------------------ */

export interface EmbroideryCanvasOptions {
  width: number;
  height: number;
  /** garment fabric hex behind the stitching (for shadow blending) */
  fabricHex: string;
  logoImage?: HTMLImageElement | null;
  /** single-line "band" layout for sashes: text runs along the ribbon */
  band?: boolean;
}

const loadedFonts = new Set<string>();

export async function ensureEmbroideryFonts(): Promise<void> {
  if (typeof document === "undefined") return;
  const families = ["Fraunces", "Cinzel", "Great Vibes", "Amiri"];
  await Promise.all(
    families
      .filter((f) => !loadedFonts.has(f))
      .map(async (f) => {
        try {
          await document.fonts.load(`600 48px "${f}"`);
          await document.fonts.load(`400 48px "${f}"`);
          loadedFonts.add(f);
        } catch {
          /* font unavailable — canvas falls back to serif */
        }
      })
  );
}

/** small offscreen pattern simulating parallel satin stitches */
function threadPattern(
  ctx: CanvasRenderingContext2D,
  hex: string,
  metallic: boolean
): CanvasPattern | string {
  const p = document.createElement("canvas");
  p.width = 8;
  p.height = 8;
  const pc = p.getContext("2d");
  if (!pc) return hex;
  pc.fillStyle = hex;
  pc.fillRect(0, 0, 8, 8);
  pc.strokeStyle = shade(hex, metallic ? 34 : 18);
  pc.lineWidth = 1;
  pc.beginPath();
  pc.moveTo(2, 0); pc.lineTo(2, 8);
  pc.moveTo(6, 0); pc.lineTo(6, 8);
  pc.stroke();
  pc.strokeStyle = shade(hex, metallic ? -30 : -16);
  pc.beginPath();
  pc.moveTo(4, 0); pc.lineTo(4, 8);
  pc.stroke();
  return ctx.createPattern(p, "repeat") ?? hex;
}

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp(((n >> 16) & 255) + amt);
  const g = clamp(((n >> 8) & 255) + amt);
  const b = clamp((n & 255) + amt);
  return `rgb(${r},${g},${b})`;
}

interface TextLine {
  text: string;
  size: number;
  weight: number;
}

export function buildLines(cfg: DesignConfig, base: number): TextLine[] {
  const lines: TextLine[] = [];
  const { name, faculty, year, custom } = cfg.text;
  if (name.trim()) lines.push({ text: name.trim(), size: base * 1.0, weight: 600 });
  if (faculty.trim()) lines.push({ text: faculty.trim(), size: base * 0.52, weight: 400 });
  if (custom.trim()) lines.push({ text: custom.trim(), size: base * 0.48, weight: 400 });
  if (year.trim()) lines.push({ text: year.trim(), size: base * 0.62, weight: 600 });
  return lines;
}

export function renderEmbroideryCanvas(
  cfg: DesignConfig,
  opts: EmbroideryCanvasOptions
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = opts.width;
  canvas.height = opts.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.clearRect(0, 0, opts.width, opts.height);

  const thread = threadById(cfg.threadId);
  const font = fontById(cfg.fontId);
  const baseSize = opts.band
    ? opts.height * 0.42 * cfg.fontScale
    : opts.width * 0.16 * cfg.fontScale;
  const lines: TextLine[] = opts.band
    ? [
        {
          text: [cfg.text.name, cfg.text.faculty, cfg.text.year, cfg.text.custom]
            .map((t) => t.trim())
            .filter(Boolean)
            .join("   •   "),
          size: baseSize,
          weight: 600,
        },
      ].filter((l) => l.text)
    : buildLines(cfg, baseSize);

  const isRtl = !!font.rtl;
  ctx.direction = isRtl ? "rtl" : "ltr";
  ctx.textAlign = cfg.align === "left" ? "left" : cfg.align === "right" ? "right" : "center";
  const x =
    cfg.align === "left" ? opts.width * 0.1 :
    cfg.align === "right" ? opts.width * 0.9 :
    opts.width / 2;

  /* vertical layout: logo block + text block, centered together */
  const logoH = opts.logoImage && !opts.band ? opts.width * 0.42 * cfg.logoScale : 0;
  const gap = baseSize * 0.5;
  const lineGap = baseSize * 0.34;
  const textH = lines.reduce((s, l) => s + l.size + lineGap, 0);
  const totalH = logoH + (logoH && textH ? gap : 0) + textH;
  let y = (opts.height - totalH) / 2;

  /* ---- logo ------------------------------------------------------ */
  if (opts.logoImage && logoH > 0) {
    const img = opts.logoImage;
    const ratio = img.width / img.height || 1;
    let w = logoH * ratio;
    let h = logoH;
    const maxW = opts.width * 0.72;
    if (w > maxW) { h *= maxW / w; w = maxW; }
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.55)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;
    ctx.drawImage(img, opts.width / 2 - w / 2, y + (logoH - h) / 2, w, h);
    ctx.restore();
    y += logoH + gap;
  }

  /* ---- text lines with thread simulation -------------------------- */
  const pattern = threadPattern(ctx, thread.hex, !!thread.metallic);

  for (const line of lines) {
    const fontStr = `${line.weight} ${line.size}px "${font.family}", serif`;
    ctx.font = fontStr;
    const baseline = y + line.size;

    if (cfg.style === "outline") {
      /* running-stitch outline */
      ctx.save();
      ctx.strokeStyle = thread.hex;
      ctx.lineWidth = Math.max(2, line.size * 0.045);
      ctx.setLineDash([line.size * 0.09, line.size * 0.055]);
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 2;
      ctx.shadowOffsetY = 1.5;
      ctx.strokeText(line.text, x, baseline);
      ctx.restore();
    } else {
      /* raised relief: dark under-stitch then highlight */
      const depth = cfg.style === "raised" ? line.size * 0.045 : line.size * 0.022;
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillText(line.text, x, baseline + depth);
      ctx.fillStyle = shade(thread.hex, thread.metallic ? 60 : 36);
      ctx.fillText(line.text, x, baseline - depth * 0.6);
      ctx.fillStyle = pattern;
      ctx.shadowColor = "rgba(0,0,0,0.35)";
      ctx.shadowBlur = 1.5;
      ctx.fillText(line.text, x, baseline);
      ctx.restore();

      if (thread.metallic) {
        /* specular shimmer pass */
        ctx.save();
        ctx.globalAlpha = 0.35;
        const grad = ctx.createLinearGradient(0, baseline - line.size, 0, baseline);
        grad.addColorStop(0, "rgba(255,255,255,0.9)");
        grad.addColorStop(0.45, "rgba(255,255,255,0)");
        grad.addColorStop(1, "rgba(255,255,255,0.25)");
        ctx.fillStyle = grad;
        ctx.fillText(line.text, x, baseline);
        ctx.restore();
      }
    }
    y += line.size + lineGap;
  }

  return canvas;
}

/** stable dependency key — texture re-renders only when these change */
export function embroideryKey(cfg: DesignConfig): string {
  return [
    cfg.text.name, cfg.text.faculty, cfg.text.year, cfg.text.custom,
    cfg.fontId, cfg.fontScale, cfg.align, cfg.style, cfg.threadId,
    cfg.position, cfg.logo?.dataUrl?.slice(0, 64) ?? "", cfg.logoScale,
  ].join("|");
}
