import { Suspense } from "react";
import type { Metadata } from "next";
import Shell from "@/components/configurator/Shell";

export const metadata: Metadata = {
  title: "Configurator — ENMIIS Atelier",
  description:
    "Design your graduation robe, cape, stole or sash in real-time 3D with live embroidery and instant pricing.",
};

export default function ConfigurePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-svh items-center justify-center">
          <div className="font-display animate-pulse text-[13px] tracking-[0.3em] text-ink-muted">
            ENMIIS ATELIER
          </div>
        </div>
      }
    >
      <Shell />
    </Suspense>
  );
}
