import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Seamless CSS marquee: the children are rendered twice and translated -50%. */
export function Marquee({
  children,
  className,
  duration = 38,
  reverse = false,
  pauseOnHover = true,
}: {
  children: ReactNode;
  className?: string;
  duration?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
}) {
  return (
    <div className={cn("group/marquee relative flex overflow-hidden", className)}>
      <div
        className={cn(
          "flex w-max shrink-0 items-center",
          reverse ? "animate-marquee-reverse" : "animate-marquee",
          pauseOnHover && "group-hover/marquee:[animation-play-state:paused]",
        )}
        style={{ "--marquee-duration": `${duration}s` } as CSSProperties}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
