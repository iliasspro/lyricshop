"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, CircleAlert } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function fieldClass(invalid?: boolean, className?: string) {
  return cn(
    "h-14 w-full rounded-2xl border bg-white/55 px-4 text-[15px] text-ink outline-none transition-[border-color,box-shadow,background-color] duration-200",
    "placeholder:text-smoke/60 focus:bg-white focus:ring-4 focus:ring-red/20 disabled:opacity-50",
    invalid ? "border-red focus:border-red" : "border-ink/15 hover:border-ink/30 focus:border-ink",
    className,
  );
}

export const errorId = (id: string) => `${id}-error`;
export const hintId = (id: string) => `${id}-hint`;

/** Label + control + animated inline error. Pass the same `id` to the control. */
export function Field({
  id,
  label,
  error,
  hint,
  optional,
  className,
  children,
}: {
  id: string;
  label: ReactNode;
  error?: string | null;
  hint?: ReactNode;
  optional?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 flex items-baseline justify-between gap-3 text-sm font-medium">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal text-smoke">Optional</span>}
      </label>
      {children}
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            key="error"
            id={errorId(id)}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden text-sm text-red-deep"
          >
            <span className="flex items-center gap-1.5 pt-2">
              <CircleAlert className="size-4 shrink-0" aria-hidden />
              {error}
            </span>
          </motion.p>
        )}
      </AnimatePresence>
      {hint && !error && (
        <p id={hintId(id)} className="pt-2 text-xs text-smoke">
          {hint}
        </p>
      )}
    </div>
  );
}

type ControlProps = { id: string; invalid?: boolean; hasHint?: boolean };

function describedBy(id: string, invalid?: boolean, hasHint?: boolean) {
  return invalid ? errorId(id) : hasHint ? hintId(id) : undefined;
}

export function TextInput({ id, invalid, hasHint, className, ...props }: ControlProps & Omit<ComponentProps<"input">, "id">) {
  return (
    <input
      id={id}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy(id, invalid, hasHint)}
      className={fieldClass(invalid, className)}
      {...props}
    />
  );
}

export function SelectInput({
  id,
  invalid,
  hasHint,
  className,
  children,
  ...props
}: ControlProps & Omit<ComponentProps<"select">, "id">) {
  return (
    <div className="relative">
      <select
        id={id}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy(id, invalid, hasHint)}
        className={fieldClass(invalid, cn("cursor-pointer appearance-none pr-11", className))}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-smoke" aria-hidden />
    </div>
  );
}
