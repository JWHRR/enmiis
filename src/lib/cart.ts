"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ProductId } from "./types";

/* ------------------------------------------------------------------ */
/*  Cart — persisted, drives the marketplace flow                      */
/* ------------------------------------------------------------------ */

export interface CartItem {
  id: string;
  product: ProductId;
  name: string;
  colorId: string;
  size: string;
  qty: number;
  unitPrice: number;
  /** present when the item came from the 3D atelier */
  customized?: boolean;
}

interface CartStore {
  items: CartItem[];
  open: boolean;
  lastOrderRef: string | null;

  add: (item: Omit<CartItem, "id" | "qty">, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  setOpen: (v: boolean) => void;
  placeOrder: () => string;
}

const keyOf = (i: { product: string; colorId: string; size: string; customized?: boolean }) =>
  `${i.product}-${i.colorId}-${i.size}${i.customized ? "-custom" : ""}`;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      open: false,
      lastOrderRef: null,

      add: (item, qty = 1) => {
        const id = keyOf(item);
        const items = [...get().items];
        const existing = items.find((i) => i.id === id);
        if (existing) existing.qty += qty;
        else items.push({ ...item, id, qty });
        set({ items, open: true, lastOrderRef: null });
      },

      remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),

      setQty: (id, qty) =>
        set({
          items:
            qty <= 0
              ? get().items.filter((i) => i.id !== id)
              : get().items.map((i) => (i.id === id ? { ...i, qty } : i)),
        }),

      clear: () => set({ items: [] }),
      setOpen: (v) => set({ open: v }),

      placeOrder: () => {
        const ref = `ENM-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
        set({ items: [], lastOrderRef: ref });
        return ref;
      },
    }),
    {
      name: "enmiis-cart-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items }),
    }
  )
);

export const cartTotal = (items: CartItem[]) =>
  items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
export const cartCount = (items: CartItem[]) =>
  items.reduce((s, i) => s + i.qty, 0);
