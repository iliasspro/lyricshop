"use client";

import { create } from "zustand";

type UIState = {
  cartOpen: boolean;
  searchOpen: boolean;
  menuOpen: boolean;
  hydrated: boolean;
  setCartOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setMenuOpen: (open: boolean) => void;
  setHydrated: () => void;
};

export const useUI = create<UIState>()((set) => ({
  cartOpen: false,
  searchOpen: false,
  menuOpen: false,
  hydrated: false,
  setCartOpen: (cartOpen) => set({ cartOpen }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  setHydrated: () => set({ hydrated: true }),
}));
