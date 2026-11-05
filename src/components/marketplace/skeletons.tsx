// Layout-shaped placeholders for the dynamic marketplace routes. They make up the
// App Shell on client navigations while the param-specific content streams in.

import { cn } from "@/lib/cn";

function Bar({ className }: { className?: string }) {
  return <div className={cn("rounded-full", className)} />;
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          <div className="aspect-[4/5] animate-pulse rounded-[22px] bg-paper" />
          <Bar className="mt-4 h-4 w-2/3 bg-paper" />
          <Bar className="mt-2 h-3 w-1/3 bg-paper" />
        </div>
      ))}
    </div>
  );
}

function HeadingSkeleton() {
  return (
    <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
      <div className="w-full max-w-xl">
        <Bar className="h-3 w-40 bg-paper" />
        <div className="mt-5 h-[clamp(2.2rem,5vw,4.4rem)] w-3/4 animate-pulse rounded-2xl bg-paper" />
      </div>
      <Bar className="h-4 w-36 bg-paper" />
    </div>
  );
}

export function CollectionSkeleton() {
  return (
    <div aria-busy="true">
      <span className="sr-only" role="status">
        Loading collection…
      </span>
      <section className="relative h-[calc(100svh-6.75rem)] min-h-[600px] max-h-[920px] overflow-hidden bg-ink-2">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-t from-ink via-ink-2 to-ink-3" />
        <div className="container-page relative flex h-full flex-col justify-between pb-10 pt-6 md:pb-16">
          <Bar className="h-4 w-44 bg-bone/10" />
          <div className="max-w-4xl">
            <Bar className="h-3 w-44 bg-bone/15" />
            <div className="mt-6 h-[clamp(3.2rem,9vw,8.6rem)] w-[min(680px,85%)] rounded-3xl bg-bone/10" />
            <Bar className="mt-5 h-8 w-[min(460px,70%)] bg-bone/10" />
            <Bar className="mt-6 h-4 w-[min(560px,90%)] bg-bone/[0.07]" />
            <Bar className="mt-2.5 h-4 w-[min(420px,75%)] bg-bone/[0.07]" />
            <div className="mt-8 flex gap-3">
              <Bar className="h-13 w-52 bg-bone/15" />
              <Bar className="h-13 w-40 border border-bone/15" />
            </div>
          </div>
        </div>
      </section>
      <div className="h-[clamp(5.5rem,10vw,8.5rem)] bg-ink" />
      <section className="container-page py-24 md:py-32">
        <HeadingSkeleton />
        <ProductGridSkeleton count={8} />
      </section>
    </div>
  );
}

export function ArtistSkeleton() {
  return (
    <div aria-busy="true">
      <span className="sr-only" role="status">
        Loading artist…
      </span>
      <section className="relative overflow-hidden bg-ink">
        <div className="container-page pb-16 pt-6 md:pb-24">
          <Bar className="h-4 w-40 bg-bone/10" />
          <div className="mt-8 grid gap-10 md:mt-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-end lg:gap-16">
            <div className="aspect-[4/5] w-full max-w-[520px] animate-pulse rounded-[28px] bg-ink-3" />
            <div>
              <Bar className="h-3 w-36 bg-bone/15" />
              <div className="mt-6 h-[clamp(3rem,7.5vw,7.4rem)] w-[min(620px,90%)] rounded-3xl bg-bone/10" />
              <Bar className="mt-6 h-5 w-[min(420px,80%)] bg-bone/[0.07]" />
              <div className="mt-8 flex gap-3">
                <Bar className="h-13 w-36 bg-bone/15" />
                <Bar className="h-13 w-44 border border-bone/15" />
              </div>
              <div className="mt-10 grid max-w-xl grid-cols-3 gap-6 border-t border-bone/15 pt-6">
                {[0, 1, 2].map((i) => (
                  <div key={i}>
                    <div className="h-10 w-16 rounded-xl bg-bone/10" />
                    <Bar className="mt-2.5 h-3 w-20 bg-bone/[0.07]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="container-page grid gap-14 py-24 md:py-32 lg:grid-cols-12 lg:gap-10">
        <div className="space-y-3 lg:col-span-5">
          <Bar className="mb-6 h-3 w-32 bg-paper" />
          <Bar className="h-5 w-full bg-paper" />
          <Bar className="h-5 w-11/12 bg-paper" />
          <Bar className="h-5 w-4/5 bg-paper" />
        </div>
        <div className="lg:col-span-7 lg:pl-10">
          <div className="h-14 w-24 rounded-2xl bg-paper" />
          <div className="mt-8 h-[clamp(2.4rem,5.2vw,4.8rem)] w-full rounded-2xl bg-paper" />
          <div className="mt-3 h-[clamp(2.4rem,5.2vw,4.8rem)] w-2/3 rounded-2xl bg-paper" />
        </div>
      </section>
      <section className="container-page pb-24 md:pb-32">
        <HeadingSkeleton />
        <ProductGridSkeleton count={4} />
      </section>
    </div>
  );
}
