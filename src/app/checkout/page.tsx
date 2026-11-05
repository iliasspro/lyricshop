import type { Metadata } from "next";
import { CheckoutFlow } from "@/components/checkout/checkout-flow";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Contact, shipping and payment in three quick steps. Payments are handled by Stripe; we never see your card.",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <div className="container-page pb-24 pt-8 md:pt-12">
      <h1 className="sr-only">Checkout</h1>
      <CheckoutFlow />
    </div>
  );
}
