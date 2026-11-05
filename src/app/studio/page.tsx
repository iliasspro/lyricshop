import type { Metadata } from "next";
import { Suspense } from "react";
import { Mark } from "@/components/brand/logo";
import { Studio } from "@/components/studio/studio";

export const metadata: Metadata = {
  title: "Design Studio",
  description:
    "Put your own words on a heavyweight hoodie, tee, crewneck, tote or cap. 22 typefaces, curved text, stickers, uploads and AI graphics by Nano Banana Pro.",
};

export default function StudioPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh flex-col items-center justify-center gap-5 bg-bone">
          <Mark className="h-14 w-auto" spin />
          <p className="eyebrow text-smoke">Warming up the press…</p>
        </div>
      }
    >
      <Studio />
    </Suspense>
  );
}
