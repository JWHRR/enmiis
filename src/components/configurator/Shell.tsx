"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useDesignStore } from "@/lib/store";
import { PRODUCTS } from "@/lib/catalog";
import type { ProductId } from "@/lib/types";
import { ThemeToggle } from "@/components/ui/Kit";
import StepProduct from "./StepProduct";
import StepMeasurements from "./StepMeasurements";
import StepFabric from "./StepFabric";
import StepEmbroidery from "./StepEmbroidery";
import StepReview from "./StepReview";
import PriceBar from "./PriceBar";

const ConfiguratorStage = dynamic(
  () => import("@/components/three/Stage").then((m) => m.ConfiguratorStage),
  { ssr: false }
);

const STEPS = [
  { id: "product", label: "Silhouette" },
  { id: "measurements", label: "Measurements" },
  { id: "fabric", label: "Fabric & Color" },
  { id: "embroidery", label: "Embroidery" },
  { id: "review", label: "Review" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

export default function Shell() {
  const search = useSearchParams();
  const router = useRouter();
  const { config, hydrate, hydrated, undo, redo, past, future, savedAt, setProduct } =
    useDesignStore();
  const [step, setStep] = useState<StepId>("product");

  /* hydrate saved design + apply ?product= deep link */
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    const p = search.get("product");
    if (p && PRODUCTS.some((x) => x.id === p)) {
      setProduct(p as ProductId);
      setStep("measurements");
      router.replace("/configure", { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  /* keyboard shortcuts */
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      if (e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [undo, redo]);

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const [justSaved, setJustSaved] = useState(false);
  useEffect(() => {
    if (!savedAt) return;
    setJustSaved(true);
    const t = setTimeout(() => setJustSaved(false), 1800);
    return () => clearTimeout(t);
  }, [savedAt]);

  const stage = useMemo(() => <ConfiguratorStage cfg={config} />, [config]);

  if (!hydrated) {
    return (
      <div className="flex h-svh items-center justify-center">
        <div className="font-display animate-pulse text-[13px] tracking-[0.3em] text-ink-muted">
          ENMIIS ATELIER
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-svh flex-col overflow-hidden lg:flex-row">
      {/* ------------------------- 3D preview ------------------------- */}
      <div className="relative order-1 h-[44svh] shrink-0 lg:order-2 lg:h-auto lg:flex-1">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 40%, color-mix(in srgb, var(--gold) 7%, transparent), transparent 70%)",
          }}
        />
        {stage}

        {/* top-right controls */}
        <div className="absolute right-4 top-4 flex items-center gap-2">
          <AnimatePresence>
            {justSaved && (
              <motion.span
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="glass rounded-full px-3 py-1.5 text-[10.5px] uppercase tracking-[0.18em] text-success"
              >
                ● Saved
              </motion.span>
            )}
          </AnimatePresence>
          <button
            onClick={undo}
            disabled={past.length === 0}
            title="Undo (Ctrl+Z)"
            className="glass h-9 w-9 rounded-full text-[13px] text-ink-secondary transition-all hover:scale-110 hover:text-ink disabled:opacity-30 disabled:hover:scale-100"
          >
            ↩
          </button>
          <button
            onClick={redo}
            disabled={future.length === 0}
            title="Redo (Ctrl+Y)"
            className="glass h-9 w-9 rounded-full text-[13px] text-ink-secondary transition-all hover:scale-110 hover:text-ink disabled:opacity-30 disabled:hover:scale-100"
          >
            ↪
          </button>
          <ThemeToggle />
        </div>

        <div className="pointer-events-none absolute bottom-4 left-1/2 hidden -translate-x-1/2 text-[10px] uppercase tracking-[0.24em] text-ink-muted lg:block">
          Drag to rotate · Scroll to zoom
        </div>
      </div>

      {/* ----------------------- control panel ------------------------ */}
      <div className="order-2 flex min-h-0 flex-1 flex-col border-line lg:order-1 lg:w-[460px] lg:flex-none lg:border-r">
        {/* header */}
        <div className="flex items-center justify-between px-6 pb-2 pt-4">
          <Link href="/" className="group flex items-baseline gap-2">
            <span className="font-display text-[15px] font-semibold tracking-[0.18em] text-ink">
              ENMIIS
            </span>
            <span className="text-[8px] uppercase tracking-[0.3em] text-gold">Atelier</span>
          </Link>
          <span className="text-[10.5px] uppercase tracking-[0.2em] text-ink-muted">
            {stepIndex + 1} / {STEPS.length}
          </span>
        </div>

        {/* step tabs */}
        <div className="flex gap-1 overflow-x-auto px-6 py-2">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-[11.5px] transition-all duration-300 ${
                s.id === step
                  ? "bg-ink font-medium text-bg"
                  : i < stepIndex
                    ? "text-gold hover:bg-surface-strong"
                    : "text-ink-muted hover:bg-surface-strong hover:text-ink-secondary"
              }`}
            >
              {i < stepIndex ? "✓ " : ""}
              {s.label}
            </button>
          ))}
        </div>

        <div className="hairline mx-6" />

        {/* step content */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {step === "product" && <StepProduct onNext={() => setStep("measurements")} />}
              {step === "measurements" && <StepMeasurements onNext={() => setStep("fabric")} />}
              {step === "fabric" && <StepFabric onNext={() => setStep("embroidery")} />}
              {step === "embroidery" && <StepEmbroidery onNext={() => setStep("review")} />}
              {step === "review" && <StepReview />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* live price */}
        <PriceBar />
      </div>
    </div>
  );
}
