"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Design } from "../design";
import type { GarmentId } from "../garments";
import { findPromo } from "../pricing";

export type CartLine = {
  key: string;
  kind: "product" | "custom";
  slug?: string;
  designId?: string;
  title: string;
  creator?: string;
  garment: GarmentId;
  color: string;
  size: string;
  qty: number;
  unitPrice: number;
  design: Design;
};

type CartState = {
  lines: CartLine[];
  promo: string | null;
  add: (line: Omit<CartLine, "key" | "qty"> & { qty?: number }) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  applyPromo: (code: string) => boolean;
  removePromo: () => void;
};

export function lineKey(line: Pick<CartLine, "kind" | "slug" | "designId" | "color" | "size">): string {
  return line.kind === "product"
    ? `p:${line.slug}:${line.color}:${line.size}`
    : `c:${line.designId}:${line.color}:${line.size}`;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      promo: null,
      add: ({ qty = 1, ...line }) => {
        const key = lineKey(line);
        const existing = get().lines.find((l) => l.key === key);
        if (existing) {
          set({ lines: get().lines.map((l) => (l.key === key ? { ...l, qty: Math.min(99, l.qty + qty), design: line.design } : l)) });
        } else {
          set({ lines: [...get().lines, { ...line, key, qty }] });
        }
      },
      setQty: (key, qty) =>
        set({
          lines:
            qty <= 0
              ? get().lines.filter((l) => l.key !== key)
              : get().lines.map((l) => (l.key === key ? { ...l, qty: Math.min(99, qty) } : l)),
        }),
      remove: (key) => set({ lines: get().lines.filter((l) => l.key !== key) }),
      clear: () => set({ lines: [], promo: null }),
      applyPromo: (code) => {
        const promo = findPromo(code);
        if (!promo) return false;
        set({ promo: promo.code });
        return true;
      },
      removePromo: () => set({ promo: null }),
    }),
    {
      name: "lyricshop-cart",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({ lines: s.lines, promo: s.promo }),
    },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.qty, 0);
