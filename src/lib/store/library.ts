"use client";

// Everything a shopper keeps on this device: wishlist, followed artists,
// saved Studio designs, orders and a lightweight profile.

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Design } from "../design";
import type { GarmentId } from "../garments";
import type { ShippingMethodId, Totals } from "../pricing";
import type { CartLine } from "./cart";

export type SavedDesign = {
  id: string;
  name: string;
  garment: GarmentId;
  color: string;
  design: Design;
  createdAt: number;
  updatedAt: number;
};

export type Address = {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  region: string;
  postal: string;
  country: string;
  phone?: string;
};

export type Order = {
  id: string;
  createdAt: number;
  email: string;
  address: Address;
  method: ShippingMethodId;
  lines: CartLine[];
  totals: Totals;
  promo: string | null;
  status: "confirmed" | "printing" | "shipped" | "delivered";
  paid: "demo" | "stripe";
};

type LibraryState = {
  wishlist: string[];
  following: string[];
  designs: SavedDesign[];
  orders: Order[];
  profile: { name: string; email: string } | null;
  toggleWish: (slug: string) => boolean;
  toggleFollow: (handle: string) => boolean;
  saveDesign: (d: Omit<SavedDesign, "createdAt" | "updatedAt"> & { createdAt?: number }) => void;
  deleteDesign: (id: string) => void;
  addOrder: (o: Order) => void;
  setProfile: (p: { name: string; email: string } | null) => void;
};

export const useLibrary = create<LibraryState>()(
  persist(
    (set, get) => ({
      wishlist: [],
      following: [],
      designs: [],
      orders: [],
      profile: null,
      toggleWish: (slug) => {
        const has = get().wishlist.includes(slug);
        set({ wishlist: has ? get().wishlist.filter((s) => s !== slug) : [slug, ...get().wishlist] });
        return !has;
      },
      toggleFollow: (handle) => {
        const has = get().following.includes(handle);
        set({ following: has ? get().following.filter((s) => s !== handle) : [handle, ...get().following] });
        return !has;
      },
      saveDesign: (d) => {
        const now = Date.now();
        const existing = get().designs.find((x) => x.id === d.id);
        const next: SavedDesign = { ...d, createdAt: existing?.createdAt ?? d.createdAt ?? now, updatedAt: now };
        set({ designs: [next, ...get().designs.filter((x) => x.id !== d.id)] });
      },
      deleteDesign: (id) => set({ designs: get().designs.filter((x) => x.id !== id) }),
      addOrder: (o) => set({ orders: [o, ...get().orders] }),
      setProfile: (profile) => set({ profile }),
    }),
    {
      name: "lyricshop-library",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);
