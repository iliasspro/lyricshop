import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "accent" | "outline" | "ghost" | "bone" | "outline-bone";
type Size = "sm" | "md" | "lg" | "xl";

const base =
  "group/btn relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium tracking-[-0.01em] transition-[background-color,color,border-color,transform,box-shadow] duration-300 ease-[var(--ease-out-expo)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-bone hover:bg-ink-3",
  accent: "bg-red text-ink hover:bg-[#ff6a40] shadow-[0_8px_30px_-12px_rgba(255,74,28,.8)]",
  outline: "border border-ink/20 text-ink hover:border-ink hover:bg-ink hover:text-bone",
  ghost: "text-ink hover:bg-ink/6",
  bone: "bg-bone text-ink hover:bg-white",
  "outline-bone": "border border-bone/30 text-bone hover:border-bone hover:bg-bone hover:text-ink",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-13 px-7 text-base",
  xl: "h-16 px-9 text-lg",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant; size?: Size; children: ReactNode };

export function Button({ variant = "primary", size = "md", className, children, ...props }: ButtonProps) {
  return (
    <button className={buttonClass(variant, size, className)} {...props}>
      {children}
    </button>
  );
}

type LinkProps = ComponentProps<typeof Link> & { variant?: Variant; size?: Size; children: ReactNode };

export function ButtonLink({ variant = "primary", size = "md", className, children, ...props }: LinkProps) {
  return (
    <Link className={buttonClass(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}
