"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { useCart } from "@/lib/store/cart";
import { useLibrary } from "@/lib/store/library";
import { useUI } from "@/lib/store/ui";
import { SearchPalette } from "./search-palette";

/** Client-only singletons: persisted stores, the bag drawer, search and toasts. */
export function Providers() {
  useEffect(() => {
    Promise.all([useCart.persist.rehydrate(), useLibrary.persist.rehydrate()]).then(() =>
      useUI.getState().setHydrated(),
    );
  }, []);

  return (
    <>
      <CartDrawer />
      <SearchPalette />
      <Toaster
        position="bottom-center"
        toastOptions={{
          classNames: {
            toast: "!rounded-2xl !border-0 !bg-ink !text-bone !shadow-2xl !font-sans",
            description: "!text-bone/60",
            actionButton: "!bg-red !text-ink",
          },
        }}
      />
    </>
  );
}
