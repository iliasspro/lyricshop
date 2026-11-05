import type { Metadata } from "next";
import { CartView } from "./cart-view";

export const metadata: Metadata = {
  title: "Your bag",
  description: "Review the pieces in your bag, add a promo code and head to secure checkout.",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <div className="container-page pb-28 pt-10 md:pt-14">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-ink/10 pb-8">
        <div>
          <p className="eyebrow text-smoke">Bag</p>
          <h1 className="display mt-4 text-[clamp(3rem,7vw,6.5rem)]">
            Your <span className="serif-italic font-normal">bag.</span>
          </h1>
        </div>
        <p className="max-w-sm text-smoke">
          Printed to order on heavyweight organic blanks. Free standard shipping over $100, and every piece pays the artist who wrote the line.
        </p>
      </div>
      <CartView />
    </div>
  );
}
