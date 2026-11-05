import { Lock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { CheckoutBackLink } from "@/components/checkout/back-link";

export const metadata: Metadata = {
  description: "Secure checkout for your Lyricshop order.",
  robots: { index: false },
};

/** A quiet frame for paying: no announcement bar, no footer, one way back. */
export default function CheckoutLayout({ children }: LayoutProps<"/checkout">) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-ink/8 bg-bone/85 backdrop-blur-xl">
        <div className="container-page grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-3 md:h-[72px]">
          <Link href="/" className="justify-self-start" aria-label="Lyricshop home">
            <Logo className="h-[22px] w-auto sm:h-[26px] md:h-[30px]" />
          </Link>
          <p className="eyebrow inline-flex items-center gap-2 text-smoke">
            <Lock className="size-3.5 text-ink" aria-hidden />
            Secure checkout
          </p>
          <CheckoutBackLink />
        </div>
      </header>
      <main id="main" className="flex-1">
        {children}
      </main>
    </>
  );
}
