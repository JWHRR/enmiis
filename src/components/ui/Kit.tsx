"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/*  ENMIIS UI kit — glass, gold, motion                               */
/* ------------------------------------------------------------------ */

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-ink-muted">
      <span className="h-px w-6 bg-gold/60" />
      {children}
    </div>
  );
}

export function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`glass rounded-3xl ${className}`} style={{ boxShadow: "var(--shadow-soft)" }}>
      {children}
    </div>
  );
}

/* ------------------------- segmented control ----------------------- */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = "md",
}: {
  options: { value: T; label: string; hint?: string }[];
  value: T;
  onChange: (v: T) => void;
  size?: "sm" | "md";
}) {
  return (
    <div className="glass flex flex-wrap gap-1 rounded-2xl p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            title={o.hint}
            className={`relative flex-1 whitespace-nowrap rounded-xl px-3 ${
              size === "sm" ? "py-1.5 text-[12px]" : "py-2 text-[13px]"
            } font-medium transition-colors duration-300 ${
              active ? "text-bg" : "text-ink-secondary hover:text-ink"
            }`}
          >
            {active && (
              <motion.span
                layoutId={undefined}
                className="absolute inset-0 rounded-xl bg-ink"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
            <span className="relative z-10">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ----------------------------- slider ------------------------------ */

export function LuxSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
  hint?: string;
}) {
  const fill = ((value - min) / (max - min)) * 100;
  const invalid = value < min || value > max;
  return (
    <div className="group space-y-2">
      <div className="flex items-baseline justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-ink">{label}</span>
          {hint && (
            <span className="relative inline-flex">
              <span className="cursor-help text-[11px] text-ink-muted transition-colors hover:text-gold">ⓘ</span>
              <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-52 -translate-x-1/2 rounded-xl border border-line-strong bg-bg-elevated p-3 text-[11px] leading-relaxed text-ink-secondary opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100">
                {hint}
              </span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange(Number(e.target.value))}
            className={`tabular w-16 rounded-lg border bg-transparent px-1.5 py-0.5 text-right text-[13px] outline-none transition-colors ${
              invalid ? "border-danger text-danger" : "border-transparent text-ink hover:border-line focus:border-gold"
            }`}
          />
          <span className="text-[11px] text-ink-muted">{unit ?? "cm"}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={Math.min(max, Math.max(min, value))}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ "--fill": `${fill}%` } as React.CSSProperties}
      />
      <div className="flex justify-between text-[10px] text-ink-muted">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

/* ----------------------------- swatch ------------------------------ */

export function Swatch({
  hex,
  name,
  active,
  premium,
  onClick,
}: {
  hex: string;
  name: string;
  active: boolean;
  premium?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={name}
      className="group relative flex flex-col items-center gap-1.5"
    >
      <span
        className={`relative h-9 w-9 rounded-full transition-all duration-300 ${
          active ? "scale-110" : "group-hover:scale-105"
        }`}
        style={{
          background: hex,
          boxShadow: active
            ? `0 0 0 2px var(--bg), 0 0 0 4px var(--gold), 0 6px 20px -4px ${hex}`
            : `inset 0 0 0 1px rgba(255,255,255,0.12), 0 4px 12px -4px rgba(0,0,0,0.5)`,
        }}
      >
        {premium && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gold text-[8px] text-black">
            ✦
          </span>
        )}
      </span>
      <span
        className={`max-w-14 truncate text-center text-[9.5px] leading-tight transition-colors ${
          active ? "text-gold" : "text-ink-muted group-hover:text-ink-secondary"
        }`}
      >
        {name}
      </span>
    </button>
  );
}

/* ------------------------ animated number -------------------------- */

export function AnimatedNumber({ value, className = "" }: { value: number; className?: string }) {
  const mv = useMotionValue(value);
  const spring = useSpring(mv, { stiffness: 90, damping: 20 });
  const display = useTransform(spring, (v) =>
    v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );
  useEffect(() => {
    mv.set(value);
  }, [value, mv]);
  return <motion.span className={`tabular ${className}`}>{display}</motion.span>;
}

/* ----------------------------- toggle ------------------------------ */

export function LuxToggle({
  label,
  detail,
  checked,
  onChange,
}: {
  label: string;
  detail?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`glass flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition-all duration-300 ${
        checked ? "border-gold/50" : "hover:border-line-strong"
      }`}
      style={checked ? { borderColor: "color-mix(in srgb, var(--gold) 50%, transparent)" } : undefined}
    >
      <div>
        <div className="text-[13px] font-medium text-ink">{label}</div>
        {detail && <div className="text-[11px] text-ink-muted">{detail}</div>}
      </div>
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-300 ${
          checked ? "bg-gold" : "bg-surface-strong"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-bg-elevated shadow transition-all duration-300 ${
            checked ? "left-[18px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

/* -------------------------- tilt wrapper ---------------------------- */

export function Tilt({
  children,
  className = "",
  max = 8,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  return (
    <div
      ref={ref}
      className={className}
      style={{ perspective: 900, ...style, transition: "transform 0.25s ease" }}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        setStyle({
          transform: `perspective(900px) rotateY(${px * max}deg) rotateX(${-py * max}deg) translateY(-4px)`,
        });
      }}
      onMouseLeave={() =>
        setStyle({ transform: "perspective(900px) rotateY(0deg) rotateX(0deg)" })
      }
    >
      {children}
    </div>
  );
}

/* -------------------------- theme toggle ---------------------------- */

export function ThemeToggle() {
  const [theme, setTheme] = useState<string>("dark");
  useEffect(() => {
    setTheme(document.documentElement.getAttribute("data-theme") ?? "dark");
  }, []);
  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    if (next === "dark") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", "light");
    try {
      localStorage.setItem("ennmiss-theme", next === "dark" ? "" : next);
    } catch {}
  };
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="glass flex h-9 w-9 items-center justify-center rounded-full text-[14px] transition-transform hover:scale-110"
    >
      {theme === "light" ? "☾" : "☀"}
    </button>
  );
}
