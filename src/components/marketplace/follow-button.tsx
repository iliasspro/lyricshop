"use client";

import { Check, Plus } from "lucide-react";
import { toast } from "sonner";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useLibrary } from "@/lib/store/library";
import { useUI } from "@/lib/store/ui";

/** Follow / unfollow an artist. Persisted in the library store, so it waits for hydration. */
export function FollowButton({
  handle,
  name,
  tone = "dark",
  size = "lg",
  className,
}: {
  handle: string;
  name: string;
  /** The surface the button sits on. */
  tone?: "dark" | "light";
  size?: "md" | "lg";
  className?: string;
}) {
  const hydrated = useUI((s) => s.hydrated);
  const following = useLibrary((s) => s.following.includes(handle));
  const toggleFollow = useLibrary((s) => s.toggleFollow);
  const on = hydrated && following;

  const variant = on ? (tone === "dark" ? "outline-bone" : "outline") : tone === "dark" ? "bone" : "primary";

  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => {
        const now = toggleFollow(handle);
        if (now) toast.success(`You're following ${name}`);
        else toast(`Unfollowed ${name}`);
      }}
      className={cn(buttonClass(variant, size), "min-w-36", className)}
    >
      {on ? <Check className="size-4" /> : <Plus className="size-4" />}
      {on ? "Following" : "Follow"}
    </button>
  );
}
