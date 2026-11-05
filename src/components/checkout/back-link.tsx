"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** Back to the bag while paying. Once the order is placed the bag is empty, so it points at the shop. */
export function CheckoutBackLink() {
  const placed = usePathname().startsWith("/checkout/success");
  return (
    <Link
      href={placed ? "/shop" : "/cart"}
      className="group/back inline-flex h-10 items-center gap-2 justify-self-end rounded-full px-3 text-sm transition hover:bg-ink/6 sm:px-4"
    >
      <ArrowLeft className="size-4 transition group-hover/back:-translate-x-0.5" aria-hidden />
      <span className="sm:hidden">{placed ? "Shop" : "Bag"}</span>
      <span className="max-sm:hidden">{placed ? "Keep shopping" : "Back to bag"}</span>
    </Link>
  );
}
