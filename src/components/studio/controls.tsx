"use client";

import { AnimatePresence, motion } from "motion/react";
import { Pipette } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { cn } from "@/lib/cn";
import { INK_SWATCHES } from "@/lib/colors";

export function Section({ title, children, aside, className }: { title?: string; children: ReactNode; aside?: ReactNode; className?: string }) {
  return (
    <section className={cn("border-b border-ink/8 px-4 py-4 last:border-b-0", className)}>
      {(title || aside) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          {title && <h3 className="eyebrow text-smoke">{title}</h3>}
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
  onStart,
  format = (v) => v.toFixed(2),
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  onStart?: () => void;
  format?: (v: number) => string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className="block">
      <span className="flex items-center justify-between text-[13px]">
        <span>{label}</span>
        <span className="font-mono text-xs text-smoke tabular-nums">{format(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onPointerDown={onStart}
        onKeyDown={(e) => {
          if (e.key.startsWith("Arrow")) onStart?.();
        }}
        onChange={(e) => onChange(Number(e.target.value))}
        className="studio-range mt-2 w-full"
        style={{ "--pct": `${pct}%` } as React.CSSProperties}
      />
    </label>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  className,
}: {
  value: T;
  options: { value: T; label: ReactNode; title?: string }[];
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex rounded-xl bg-paper p-1", className)} role="radiogroup">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          title={o.title}
          onClick={() => onChange(o.value)}
          className={cn(
            "flex h-8 flex-1 items-center justify-center rounded-lg text-[13px] transition",
            value === o.value ? "bg-ink text-bone" : "hover:bg-sand",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ColorField({
  value,
  onChange,
  onStart,
  label = "Color",
}: {
  value: string;
  onChange: (v: string) => void;
  onStart?: () => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <p className="mb-2 text-[13px]">{label}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        {INK_SWATCHES.map((c) => (
          <button
            key={c}
            type="button"
            title={c}
            aria-label={`Use ${c}`}
            onClick={() => {
              onStart?.();
              onChange(c);
            }}
            className={cn(
              "size-7 rounded-full border border-ink/15 ring-offset-2 ring-offset-bone transition",
              value.toLowerCase() === c.toLowerCase() ? "ring-2 ring-ink" : "hover:ring-2 hover:ring-ink/25",
            )}
            style={{ background: c }}
          />
        ))}
        <button
          type="button"
          onClick={() => {
            onStart?.();
            setOpen(!open);
          }}
          className="grid size-7 place-items-center rounded-full border border-dashed border-ink/30 hover:border-ink"
          aria-label="Custom color"
          aria-expanded={open}
        >
          <Pipette className="size-3.5" />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute left-0 top-full z-30 mt-2 rounded-2xl bg-bone p-3 shadow-2xl ring-1 ring-ink/10"
          >
            <HexColorPicker color={value} onChange={onChange} />
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-paper px-3">
              <span className="font-mono text-xs text-smoke">#</span>
              <HexColorInput color={value} onChange={onChange} className="h-9 w-full bg-transparent font-mono text-sm uppercase outline-none" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ToolButton({
  children,
  onClick,
  active,
  title,
  disabled,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
  title: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      className={cn(
        "grid size-9 place-items-center rounded-xl transition disabled:opacity-35",
        active ? "bg-ink text-bone" : "hover:bg-paper",
        className,
      )}
    >
      {children}
    </button>
  );
}
