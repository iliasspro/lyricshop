"use client";

import { ArrowRight, BadgeCheck, Plus, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Mark } from "@/components/brand/logo";
import { EmptyState } from "@/components/checkout/summary-bits";
import { Button, ButtonLink } from "@/components/ui/button";
import { CREATORS, CREATOR_BY_HANDLE, type Creator } from "@/lib/data/creators";
import { productsByCreator } from "@/lib/data/products";
import { useLibrary } from "@/lib/store/library";

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

export function FollowingTab() {
  const following = useLibrary((s) => s.following);
  const toggleFollow = useLibrary((s) => s.toggleFollow);
  const artists = following.filter((h) => Object.hasOwn(CREATOR_BY_HANDLE, h)).map((h) => CREATOR_BY_HANDLE[h]);

  const follow = (a: Creator) => {
    toggleFollow(a.handle);
    toast.success(`Following ${a.name}`, { description: "Their new lines will be one tap away." });
  };
  const unfollow = (a: Creator) => {
    toggleFollow(a.handle);
    toast(`Unfollowed ${a.name}`, { action: { label: "Undo", onClick: () => toggleFollow(a.handle) } });
  };

  if (artists.length === 0) {
    const suggestions = CREATORS.filter((c) => c.avatar).slice(0, 3);
    return (
      <div className="mt-10">
        <EmptyState
          icon={Users}
          title={
            <>
              Find your <span className="serif-italic font-normal">people.</span>
            </>
          }
          body="Follow the songwriters behind the lines you love and keep their newest drops close."
        >
          <ButtonLink href="/artists" size="lg">
            Meet the artists <ArrowRight className="size-4" />
          </ButtonLink>
        </EmptyState>
        <p className="eyebrow mb-4 mt-12 text-smoke">Start with</p>
        <div className="grid gap-4 md:grid-cols-3">
          {suggestions.map((a) => (
            <div key={a.handle} className="flex items-center gap-4 rounded-[24px] border border-ink/10 p-4">
              <Avatar artist={a} className="size-14 rounded-full" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{a.name}</p>
                <p className="truncate text-sm text-smoke">
                  {a.genre} · {a.location}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => follow(a)} aria-label={`Follow ${a.name}`}>
                <Plus className="size-3.5" aria-hidden /> Follow
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {artists.map((a) => {
        const pieces = productsByCreator(a.handle).length;
        return (
          <article key={a.handle} className="flex gap-5 rounded-[28px] bg-paper p-5">
            <Link href={`/artists/${a.handle}`} className="shrink-0" aria-label={`${a.name}'s shop`}>
              <Avatar artist={a} className="h-32 w-24 rounded-2xl" />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center gap-1.5">
                <Link href={`/artists/${a.handle}`} className="truncate font-medium hover:underline">
                  {a.name}
                </Link>
                {a.verified && <BadgeCheck className="size-4 shrink-0 text-red" aria-label="Verified artist" />}
              </div>
              <p className="truncate text-sm text-smoke">
                {a.role} · {a.location}
              </p>
              <p className="serif-italic mt-3 line-clamp-2 text-lg leading-snug">&ldquo;{a.quote}&rdquo;</p>
              <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                <ButtonLink href={`/artists/${a.handle}`} size="sm">
                  {pieces} {pieces === 1 ? "piece" : "pieces"}
                </ButtonLink>
                <Button size="sm" variant="outline" onClick={() => unfollow(a)} aria-label={`Unfollow ${a.name}`}>
                  Unfollow
                </Button>
                <span className="ml-auto font-mono text-xs text-smoke">{compact.format(a.followers)} fans</span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function Avatar({ artist, className }: { artist: Creator; className?: string }) {
  return (
    <span className={`relative block overflow-hidden bg-ink ${className ?? ""}`}>
      {artist.avatar ? (
        <Image src={artist.avatar} alt="" fill sizes="128px" className="object-cover" />
      ) : (
        <span className="absolute inset-0 grid place-items-center">
          <Mark tone="bone" detail={false} className="h-6 w-auto" />
        </span>
      )}
    </span>
  );
}
