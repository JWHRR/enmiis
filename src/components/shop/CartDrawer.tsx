"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cartTotal, useCartStore } from "@/lib/cart";
import { colorById } from "@/lib/catalog";
import { fmt } from "@/lib/pricing";

export default function CartDrawer() {
  const { items, open, setOpen, setQty, remove, placeOrder, lastOrderRef } =
    useCartStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const total = cartTotal(items);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed right-0 top-0 z-[61] flex h-svh w-full max-w-md flex-col border-l border-line bg-bg-elevated"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <div className="font-display text-[17px] text-ink">Your Order</div>
              <button
                onClick={() => setOpen(false)}
                className="glass flex h-9 w-9 items-center justify-center rounded-full text-ink-secondary transition-transform hover:scale-110"
              >
                ✕
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-5">
              {lastOrderRef ? (
                <div className="glass mt-8 rounded-3xl p-8 text-center">
                  <div className="text-[28px]">✦</div>
                  <div className="font-display mt-3 text-[20px] text-ink">
                    Order received
                  </div>
                  <div className="mt-2 text-[13px] text-ink-secondary">
                    Reference{" "}
                    <span className="font-medium text-gold">{lastOrderRef}</span>
                  </div>
                  <p className="mt-3 text-[12px] leading-relaxed text-ink-muted">
                    Our atelier will contact you within 24h to confirm sizing
                    and delivery. Thank you for choosing ENMIIS.
                  </p>
                </div>
              ) : items.length === 0 ? (
                <div className="mt-10 text-center">
                  <div className="text-[26px] opacity-40">◇</div>
                  <p className="mt-3 text-[13px] text-ink-muted">
                    Your cart is empty.
                  </p>
                  <Link
                    href="/shop"
                    onClick={() => setOpen(false)}
                    className="mt-4 inline-block text-[13px] font-medium text-gold hover:underline"
                  >
                    Browse the collection →
                  </Link>
                </div>
              ) : (
                items.map((i) => (
                  <div key={i.id} className="glass flex items-center gap-4 rounded-2xl p-4">
                    <span
                      className="h-10 w-10 shrink-0 rounded-full border border-line-strong"
                      style={{ background: colorById(i.colorId).hex }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13.5px] font-medium text-ink">
                        {i.name}
                        {i.customized && (
                          <span className="ml-2 text-[9px] uppercase tracking-[0.16em] text-gold">
                            ✦ Custom
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-ink-muted">
                        {colorById(i.colorId).name} · Size {i.size}
                      </div>
                      <div className="mt-1.5 flex items-center gap-3">
                        <div className="glass flex items-center rounded-full">
                          <button
                            onClick={() => setQty(i.id, i.qty - 1)}
                            className="px-2.5 py-0.5 text-[13px] text-ink-secondary hover:text-ink"
                          >
                            −
                          </button>
                          <span className="tabular w-5 text-center text-[12px] text-ink">
                            {i.qty}
                          </span>
                          <button
                            onClick={() => setQty(i.id, i.qty + 1)}
                            className="px-2.5 py-0.5 text-[13px] text-ink-secondary hover:text-ink"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => remove(i.id)}
                          className="text-[11px] text-ink-muted transition-colors hover:text-danger"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="tabular shrink-0 text-[13.5px] text-ink">
                      {fmt(i.qty * i.unitPrice)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && !lastOrderRef && (
              <div className="border-t border-line px-6 py-5">
                <div className="flex justify-between text-[13px] text-ink-secondary">
                  <span>Subtotal · VAT included</span>
                  <span className="tabular text-[15px] font-medium text-ink">
                    {fmt(total)} TND
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] text-ink-muted">
                  Free delivery in Tunisia · ships within 48h
                </p>
                <button
                  onClick={placeOrder}
                  className="btn-gold mt-4 w-full rounded-2xl py-4 text-[14px] font-semibold"
                >
                  Place Order ✦
                </button>
                <Link
                  href="/configure"
                  onClick={() => setOpen(false)}
                  className="mt-3 block text-center text-[11.5px] text-ink-muted transition-colors hover:text-gold"
                >
                  Want your name embroidered? Open the 3D Atelier →
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
