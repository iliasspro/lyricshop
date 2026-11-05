// Loading placeholders. No "use client": server pages use them as <Suspense>
// fallbacks and client components show them until the persisted stores hydrate.

import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

export function Skeleton({ className, style }: { className?: string; style?: CSSProperties }) {
  return <div className={cn("animate-pulse rounded-2xl bg-paper", className)} style={style} aria-hidden />;
}

function LineSkeleton() {
  return (
    <div className="flex gap-4 py-6">
      <Skeleton className="size-32 shrink-0" />
      <div className="flex-1 space-y-3 pt-1">
        <Skeleton className="h-4 w-2/3 rounded-lg" />
        <Skeleton className="h-3 w-1/3 rounded-lg" />
        <Skeleton className="mt-6 h-9 w-28 rounded-full" />
      </div>
    </div>
  );
}

export function BagSkeleton() {
  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-14" role="status" aria-label="Loading your bag">
      <div>
        <Skeleton className="h-[74px]" />
        <div className="divide-y divide-ink/10">
          <LineSkeleton />
          <LineSkeleton />
        </div>
      </div>
      <Skeleton className="h-[460px] rounded-[28px]" />
    </div>
  );
}

export function CheckoutSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-16" role="status" aria-label="Loading checkout">
      <div className="space-y-8">
        <Skeleton className="h-9 w-80 max-w-full rounded-full" />
        <Skeleton className="h-14 w-3/4 rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-14" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </div>
          <Skeleton className="h-14" />
        </div>
        <Skeleton className="h-16 w-64 rounded-full" />
      </div>
      <Skeleton className="hidden h-[560px] rounded-[28px] lg:block" />
    </div>
  );
}

export function ConfirmationSkeleton() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center" role="status" aria-label="Loading your order">
      <Skeleton className="size-24 rounded-full" />
      <Skeleton className="mt-8 h-4 w-40 rounded-lg" />
      <Skeleton className="mt-5 h-16 w-full max-w-2xl rounded-xl" />
      <Skeleton className="mt-4 h-5 w-full max-w-lg rounded-lg" />
      <div className="mt-14 grid w-full gap-6 lg:grid-cols-2">
        <Skeleton className="h-[420px] rounded-[28px]" />
        <Skeleton className="h-[420px] rounded-[28px]" />
      </div>
    </div>
  );
}

/** `bare` skips the tab bar, for when the real tabs are already on screen. */
export function AccountSkeleton({ bare = false }: { bare?: boolean }) {
  return (
    <div role="status" aria-label="Loading your account">
      {!bare && (
        <div className="mt-8 flex gap-2 overflow-hidden">
          {[124, 104, 112, 112, 124].map((w, i) => (
            <Skeleton key={i} className="h-11 shrink-0 rounded-full" style={{ width: w }} />
          ))}
        </div>
      )}
      <div className="mt-10 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <Skeleton className="h-[380px] rounded-[28px]" />
        <Skeleton className="h-[380px] rounded-[28px]" />
      </div>
    </div>
  );
}
