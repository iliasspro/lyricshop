"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { Heart, LayoutGrid, Palette, Receipt, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AccountSkeleton } from "@/components/checkout/skeletons";
import { cn } from "@/lib/cn";
import { useLibrary } from "@/lib/store/library";
import { useUI } from "@/lib/store/ui";
import { DesignsTab } from "./designs-tab";
import { FollowingTab } from "./following-tab";
import { OrdersTab } from "./orders-tab";
import { OverviewTab } from "./overview-tab";
import { ACCOUNT_TABS, tabHref, type AccountTab } from "./tabs";
import { WishlistTab } from "./wishlist-tab";

const TABS: { id: AccountTab; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "orders", label: "Orders", icon: Receipt },
  { id: "designs", label: "Designs", icon: Palette },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "following", label: "Following", icon: Users },
];

/** The active tab comes from ?tab=, so it survives reloads, back/forward and shared links. */
export function AccountView() {
  const params = useSearchParams();
  const raw = params.get("tab");
  const tab: AccountTab = ACCOUNT_TABS.find((t) => t === raw) ?? "overview";
  const hydrated = useUI((s) => s.hydrated);
  const orders = useLibrary((s) => s.orders.length);
  const designs = useLibrary((s) => s.designs.length);
  const wishlist = useLibrary((s) => s.wishlist.length);
  const following = useLibrary((s) => s.following.length);
  const counts: Partial<Record<AccountTab, number>> = { orders, designs, wishlist, following };

  return (
    <MotionConfig reducedMotion="user">
      <nav aria-label="Account sections" className="no-scrollbar -mx-4 mt-8 flex gap-1 overflow-x-auto px-4 md:mx-0 md:px-0">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = id === tab;
          const count = hydrated ? counts[id] : undefined;
          return (
            <Link
              key={id}
              href={tabHref(id)}
              scroll={false}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative isolate flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-[15px] transition-colors duration-300",
                active ? "text-bone" : "hover:bg-ink/6",
              )}
            >
              {active && (
                <motion.span
                  layoutId="account-tab"
                  className="absolute inset-0 -z-10 rounded-full bg-ink"
                  transition={{ type: "spring", bounce: 0.18, duration: 0.5 }}
                />
              )}
              <Icon className="size-4" aria-hidden />
              {label}
              {!!count && (
                <span className={cn("rounded-full px-1.5 font-mono text-[11px] leading-5", active ? "bg-bone/15" : "bg-ink/8")}>{count}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {!hydrated ? (
        <AccountSkeleton bare />
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            {tab === "overview" && <OverviewTab />}
            {tab === "orders" && <OrdersTab />}
            {tab === "designs" && <DesignsTab />}
            {tab === "wishlist" && <WishlistTab />}
            {tab === "following" && <FollowingTab />}
          </motion.div>
        </AnimatePresence>
      )}
    </MotionConfig>
  );
}
