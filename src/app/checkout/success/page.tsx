import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderConfirmation } from "@/components/checkout/order-confirmation";
import { ConfirmationSkeleton } from "@/components/checkout/skeletons";

export const metadata: Metadata = {
  title: "Order confirmed",
  description: "Your Lyricshop order is in. Here's your order number and what happens next.",
  robots: { index: false },
};

export default function CheckoutSuccessPage() {
  return (
    <div className="container-page pb-28 pt-12 md:pt-20">
      <Suspense fallback={<ConfirmationSkeleton />}>
        <OrderConfirmation />
      </Suspense>
    </div>
  );
}
