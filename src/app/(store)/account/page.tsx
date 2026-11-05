import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountView } from "@/components/account/account-view";
import { AccountSkeleton } from "@/components/checkout/skeletons";

export const metadata: Metadata = {
  title: "Your account",
  description: "Your orders, saved Studio designs, wishlist and the artists you follow, all kept on this device.",
  robots: { index: false },
};

export default function AccountPage() {
  return (
    <div className="container-page pb-28 pt-10 md:pt-14">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-ink/10 pb-8">
        <div>
          <p className="eyebrow text-smoke">Account</p>
          <h1 className="display mt-4 text-[clamp(3rem,7vw,6.5rem)]">
            Your <span className="serif-italic font-normal">corner.</span>
          </h1>
        </div>
        <p className="max-w-sm text-smoke">
          Orders, saved designs, your wishlist and the artists you follow. It all lives on this device, so there&apos;s no password to
          remember.
        </p>
      </div>
      <Suspense fallback={<AccountSkeleton />}>
        <AccountView />
      </Suspense>
    </div>
  );
}
