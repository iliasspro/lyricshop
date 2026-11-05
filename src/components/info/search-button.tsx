"use client";

import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { buttonClass } from "@/components/ui/button";
import { useUI } from "@/lib/store/ui";

/** Opens the global search palette (the same one as ⌘K). */
export function SearchButton({ children = "Search the shop", className }: { children?: ReactNode; className?: string }) {
  const setSearchOpen = useUI((s) => s.setSearchOpen);
  return (
    <button type="button" onClick={() => setSearchOpen(true)} className={buttonClass("accent", "lg", className)}>
      <Search className="size-4" />
      {children}
      <kbd className="ml-1 rounded-md bg-ink/10 px-1.5 py-0.5 font-mono text-[11px] max-sm:hidden">⌘K</kbd>
    </button>
  );
}
