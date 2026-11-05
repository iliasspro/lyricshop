"use client";

import { Palette, Pencil, Plus, Sparkles, Trash } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { formatDate } from "@/components/checkout/delivery";
import { EmptyState } from "@/components/checkout/summary-bits";
import { GarmentMockup } from "@/components/garment/garment-mockup";
import { ButtonLink } from "@/components/ui/button";
import { colorFor } from "@/lib/colors";
import { hasPrint } from "@/lib/design";
import { BACK_PRINT_PRICE, GARMENTS } from "@/lib/garments";
import { formatPrice } from "@/lib/pricing";
import { useLibrary, type SavedDesign } from "@/lib/store/library";

const studioHref = (id: string) => `/studio?design=${encodeURIComponent(id)}`;

export function DesignsTab() {
  const designs = useLibrary((s) => s.designs);
  const deleteDesign = useLibrary((s) => s.deleteDesign);
  const saveDesign = useLibrary((s) => s.saveDesign);

  if (designs.length === 0) {
    return (
      <EmptyState
        icon={Palette}
        className="mt-10"
        title={
          <>
            Your Studio is <span className="serif-italic font-normal">quiet.</span>
          </>
        }
        body="Designs you save in the Studio land here, ready to tweak or order. Start with the line that's been stuck in your head."
      >
        <ButtonLink href="/studio" variant="accent" size="lg">
          <Sparkles className="size-4" /> Open the Studio
        </ButtonLink>
        <ButtonLink href="/shop" variant="outline" size="lg">
          Remix something from the shop
        </ButtonLink>
      </EmptyState>
    );
  }

  const remove = (design: SavedDesign) => {
    deleteDesign(design.id);
    toast(`Deleted “${design.name}”`, {
      action: { label: "Undo", onClick: () => saveDesign(design) },
    });
  };

  return (
    <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
      {designs.map((d) => (
        <DesignCard key={d.id} design={d} onDelete={() => remove(d)} />
      ))}
      <Link
        href="/studio"
        className="group/new flex aspect-[4/5] flex-col items-center justify-center gap-3 rounded-[22px] border-2 border-dashed border-ink/20 text-smoke transition hover:border-ink hover:text-ink"
      >
        <span className="grid size-12 place-items-center rounded-full bg-paper transition group-hover/new:bg-ink group-hover/new:text-bone">
          <Plus className="size-5" aria-hidden />
        </span>
        <span className="font-medium">New design</span>
      </Link>
    </div>
  );
}

function DesignCard({ design, onDelete }: { design: SavedDesign; onDelete: () => void }) {
  const color = colorFor(design.color);
  const garment = GARMENTS[design.garment];
  const backPrint = hasPrint(design.design, "back");
  const view = !hasPrint(design.design, "front") && backPrint && garment.views.back ? "back" : "front";
  const price = garment.basePrice + (backPrint ? BACK_PRINT_PRICE : 0);

  return (
    <article className="group/design relative flex flex-col">
      <Link
        href={studioHref(design.id)}
        className="relative block aspect-[4/5] overflow-hidden rounded-[22px] bg-[#e5ddcf]"
        aria-label={`Edit ${design.name} in the Studio`}
      >
        <span className="absolute inset-0 flex items-center justify-center p-[7%] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover/design:scale-[1.04]">
          <GarmentMockup
            garment={design.garment}
            color={color.hex}
            view={view}
            layers={design.design[view]}
            className="h-full w-full"
            title={`${design.name} on a ${color.name} ${garment.short.toLowerCase()}`}
          />
        </span>
        {backPrint && (
          <span className="eyebrow absolute bottom-3 left-3 rounded-full bg-bone/85 px-2.5 py-1 !text-[10px] backdrop-blur">
            {view === "back" ? "Back print" : "Front + back"}
          </span>
        )}
      </Link>
      <button
        type="button"
        onClick={onDelete}
        className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-bone/80 backdrop-blur transition hover:bg-bone hover:text-red-deep"
        aria-label={`Delete ${design.name}`}
      >
        <Trash className="size-4" aria-hidden />
      </button>
      <div className="mt-4 flex items-start justify-between gap-3 px-1">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-medium leading-snug">{design.name}</h3>
          <p className="mt-0.5 truncate text-sm text-smoke">
            {garment.short} · {color.name}
          </p>
        </div>
        <p className="shrink-0 font-mono text-sm tabular-nums">{formatPrice(price)}</p>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 px-1">
        <p className="font-mono text-xs text-smoke">Updated {formatDate(design.updatedAt)}</p>
        <ButtonLink href={studioHref(design.id)} variant="outline" size="sm">
          <Pencil className="size-3.5" aria-hidden /> Edit
        </ButtonLink>
      </div>
    </article>
  );
}
