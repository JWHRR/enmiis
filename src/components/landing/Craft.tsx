"use client";

import { motion } from "framer-motion";
import { SectionLabel } from "@/components/ui/Kit";

const FEATURES = [
  {
    k: "01",
    title: "Your measurements shape the garment",
    body: "Six precise measurements rebuild the 3D pattern in real time. What you see is your cut — not a stock photo.",
  },
  {
    k: "02",
    title: "Embroidery, stitched live",
    body: "Type your name and watch it appear on the fabric — correct position, correct scale, thread sheen and raised relief simulated stitch by stitch.",
  },
  {
    k: "03",
    title: "A price that thinks",
    body: "Stitch counts, fabric consumption, thread colors, machine minutes — the estimate recalculates on every change. No surprises at checkout.",
  },
  {
    k: "04",
    title: "Design intelligence",
    body: "One tap composes your layout: typography pairing, optical balance, embroidery zones and university color palettes, ranked by contrast.",
  },
];

const STATS = [
  { n: "0.1s", l: "preview latency" },
  { n: "±0.5cm", l: "measurement precision" },
  { n: "3D", l: "physically-based fabric" },
  { n: "∞", l: "combinations" },
];

export default function Craft() {
  return (
    <section id="craft" className="relative mx-auto max-w-7xl px-6 py-28">
      <div className="hairline mb-24" />

      <div className="grid gap-16 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="lg:sticky lg:top-32 lg:self-start"
        >
          <SectionLabel>The Craft</SectionLabel>
          <h2 className="font-display mt-4 text-4xl font-light leading-tight text-ink sm:text-5xl">
            An atelier,
            <br />
            <span className="italic text-gradient-gold">in your browser</span>
          </h2>
          <p className="mt-6 max-w-md text-[14.5px] leading-relaxed text-ink-secondary">
            Every robe we make is cut to one person, for one day they will never
            forget. The configurator gives you the same precision our pattern
            makers use — live fabric simulation, exact embroidery placement and
            production-grade estimates.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-4">
            {STATS.map((s) => (
              <div key={s.l} className="glass rounded-2xl p-5">
                <div className="font-display text-2xl text-gold">{s.n}</div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-ink-muted">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="space-y-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.k}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="glass group rounded-3xl p-8 transition-colors duration-500 hover:border-line-strong"
            >
              <div className="flex items-start gap-6">
                <span className="font-display text-[13px] text-gold">{f.k}</span>
                <div>
                  <h3 className="font-display text-[21px] font-medium leading-snug text-ink">
                    {f.title}
                  </h3>
                  <p className="mt-3 text-[13.5px] leading-relaxed text-ink-secondary">
                    {f.body}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
