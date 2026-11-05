"use client";

import { motion } from "motion/react";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { GARMENTS, type GarmentId } from "@/lib/garments";
import { SIZE_CHARTS, toCm } from "@/lib/sizes";

export function SizeGuide({ garment, onClose }: { garment: GarmentId; onClose: () => void }) {
  const [unit, setUnit] = useState<"in" | "cm">("in");
  const rows = SIZE_CHARTS[garment] ?? [];
  const g = GARMENTS[garment];
  const fmt = (n: number) => (unit === "in" ? `${n}″` : `${toCm(n)}`);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Size guide">
      <motion.div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        className="relative w-full max-w-xl rounded-t-[28px] bg-bone p-6 shadow-2xl sm:rounded-[28px] sm:p-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-smoke">Size guide</p>
            <p className="display mt-2 text-3xl">{g.name}</p>
          </div>
          <button type="button" onClick={onClose} className="grid size-10 place-items-center rounded-full bg-paper hover:bg-sand" aria-label="Close size guide">
            <X className="size-5" />
          </button>
        </div>
        <p className="mt-3 text-sm text-smoke">{g.fit} Measured flat, pit to pit.</p>
        <div className="mt-5 inline-flex rounded-full bg-paper p-1 text-sm">
          {(["in", "cm"] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={cn("h-8 rounded-full px-4 transition", unit === u ? "bg-ink text-bone" : "")}
            >
              {u === "in" ? "Inches" : "Centimeters"}
            </button>
          ))}
        </div>
        <table className="mt-5 w-full text-left font-mono text-sm">
          <thead>
            <tr className="border-b border-ink/15 text-smoke">
              <th className="py-2 font-normal">Size</th>
              <th className="py-2 font-normal">Chest</th>
              <th className="py-2 font-normal">Length</th>
              {rows[0]?.sleeve && <th className="py-2 font-normal">Sleeve</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.size} className="border-b border-ink/8">
                <td className="py-2.5 font-medium">{r.size}</td>
                <td className="py-2.5">{fmt(r.chest)}</td>
                <td className="py-2.5">{fmt(r.length)}</td>
                {r.sleeve && <td className="py-2.5">{fmt(r.sleeve)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}
