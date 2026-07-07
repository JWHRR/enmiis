"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { defaultConfig } from "@/lib/store";

const HeroStage = dynamic(
  () => import("@/components/three/Stage").then((m) => m.HeroStage),
  { ssr: false }
);

export default function Hero() {
  const showcase = useMemo(() => {
    const cfg = defaultConfig("robe");
    cfg.text = {
      name: "Lina Haddad",
      faculty: "Faculty of Architecture",
      year: "2027",
      custom: "",
    };
    cfg.fontId = "fraunces";
    cfg.threadId = "gold";
    cfg.colorId = "midnight";
    cfg.fabricId = "deluxe-satin";
    cfg.accessories = { cap: true, tassel: true, giftBox: false };
    cfg.collar = "satin-v";
    return cfg;
  }, []);

  return (
    <section className="relative flex min-h-svh flex-col overflow-hidden">
      {/* ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--gold) 14%, transparent) 0%, transparent 65%)",
        }}
      />

      {/* 3D stage */}
      <div className="absolute inset-0">
        <HeroStage cfg={showcase} />
      </div>

      {/* copy overlay */}
      <div className="pointer-events-none relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 pt-24">
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mb-5 text-[11px] uppercase tracking-[0.42em] text-gold"
        >
          Couture graduation apparel
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="font-display max-w-3xl text-[13vw] font-light leading-[0.98] tracking-tight text-ink sm:text-[9vw] lg:text-[104px]"
        >
          Worn once.
          <br />
          <span className="text-gradient-gold font-normal italic">Remembered forever.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-md text-[15px] leading-relaxed text-ink-secondary"
        >
          Premium graduation robes and capes, ready to wear in five sizes —
          shipped in 48 hours. Or make it yours: name and faculty embroidered
          live in real-time 3D.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.68, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-auto mt-10 flex flex-wrap items-center gap-4"
        >
          <Link
            href="/shop"
            className="btn-gold rounded-full px-8 py-4 text-[14px] font-semibold"
          >
            Shop the Collection
          </Link>
          <Link
            href="/configure"
            className="glass rounded-full px-7 py-4 text-[13px] text-ink-secondary transition-colors duration-300 hover:text-ink"
          >
            ✦ Design your own in 3D
          </Link>
        </motion.div>
      </div>

      {/* scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="pointer-events-none relative z-10 mx-auto mb-8 flex flex-col items-center gap-2 text-ink-muted"
      >
        <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="h-8 w-px bg-gradient-to-b from-gold to-transparent"
        />
      </motion.div>
    </section>
  );
}
