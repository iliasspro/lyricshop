import Link from "next/link";
import { Mark, Wordmark } from "@/components/brand/logo";
import { NewsletterForm } from "./newsletter-form";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "Everything" },
      { href: "/shop?type=hoodie", label: "Hoodies" },
      { href: "/shop?type=tee", label: "Tees" },
      { href: "/shop?type=crewneck", label: "Crewnecks" },
      { href: "/shop?type=tote", label: "Totes & caps" },
      { href: "/collections", label: "Collections" },
    ],
  },
  {
    title: "Make",
    links: [
      { href: "/studio", label: "Design Studio" },
      { href: "/studio?garment=hoodie", label: "Custom hoodie" },
      { href: "/studio?garment=tee", label: "Custom tee" },
      { href: "/artists", label: "Artists" },
      { href: "/sell", label: "Sell with us" },
      { href: "/sell/dashboard", label: "Artist dashboard" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/help#shipping", label: "Shipping" },
      { href: "/help#returns", label: "Returns & exchanges" },
      { href: "/help#sizing", label: "Size guide" },
      { href: "/help#care", label: "Care" },
      { href: "/account", label: "Orders" },
      { href: "/help#contact", label: "Contact" },
    ],
  },
  {
    title: "Lyricshop",
    links: [
      { href: "/about", label: "Our story" },
      { href: "/brand", label: "Brand & logo" },
      { href: "/about#impact", label: "Artist payouts" },
      { href: "/help#privacy", label: "Privacy" },
      { href: "/help#terms", label: "Terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-ink text-bone">
      <div className="container-page grid gap-14 pb-10 pt-20 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Mark tone="bone" className="h-12 w-auto" />
          <p className="display mt-8 max-w-md text-[clamp(2rem,3.4vw,3rem)]">
            Get the next drop <span className="serif-italic font-normal text-red">before</span> it sells out.
          </p>
          <p className="mt-4 max-w-sm text-bone/60">
            One email per drop. New artists, restocks and the occasional voice memo. Unsubscribe whenever.
          </p>
          <NewsletterForm />
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 lg:col-span-7">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="eyebrow mb-5 text-bone/45">{col.title}</p>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="link-underline text-[15px] text-bone/85 hover:text-bone">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="container-page" aria-hidden>
        <Wordmark tone="bone" className="h-auto w-full opacity-[0.07]" />
      </div>

      <div className="container-page flex flex-col gap-3 border-t border-bone/10 py-6 text-sm text-bone/50 md:flex-row md:items-center md:justify-between">
        <p>© {2026} Lyricshop. Artists keep 30% of every sale.</p>
        <p className="flex items-center gap-2">
          <span className="size-1.5 animate-pulse-dot rounded-full bg-red" /> Printed to order · Plastic-free shipping
        </p>
      </div>
    </footer>
  );
}
