"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo, Mark } from "@/components/brand/logo";
import { cn } from "@/lib/cn";
import { COLLECTIONS } from "@/lib/data/collections";
import { GARMENT_LIST } from "@/lib/garments";
import { cartCount, useCart } from "@/lib/store/cart";
import { useLibrary } from "@/lib/store/library";
import { useUI } from "@/lib/store/ui";

const NAV = [
  { href: "/shop", label: "Shop", mega: true },
  { href: "/collections", label: "Collections" },
  { href: "/artists", label: "Artists" },
  { href: "/studio", label: "Studio", dot: true },
  { href: "/sell", label: "Sell with us" },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  // the mega menu belongs to the page it was opened on, so it closes itself on navigation
  const [megaPath, setMegaPath] = useState<string | null>(null);
  const mega = megaPath === pathname;
  const setMega = (open: boolean) => setMegaPath(open ? pathname : null);
  const lines = useCart((s) => s.lines);
  const wishCount = useLibrary((s) => s.wishlist.length);
  const hydrated = useUI((s) => s.hydrated);
  const { setCartOpen, setSearchOpen, menuOpen, setMenuOpen } = useUI();
  const count = hydrated ? cartCount(lines) : 0;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, setMenuOpen]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 transition-[background-color,box-shadow,backdrop-filter] duration-500",
          scrolled || mega ? "bg-bone/85 shadow-[0_1px_0_rgba(15,14,13,.08)] backdrop-blur-xl" : "bg-bone",
        )}
        onMouseLeave={() => setMega(false)}
      >
        <div className="container-page flex h-16 items-center gap-6 md:h-[72px]">
          <button
            type="button"
            className="-ml-2 grid size-10 place-items-center rounded-full lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>

          <Link href="/" className="group/logo shrink-0" aria-label="Lyricshop home">
            <Logo className="h-[26px] w-auto md:h-[30px]" />
          </Link>

          <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Main">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onMouseEnter={() => setMega(!!item.mega)}
                  onFocus={() => setMega(!!item.mega)}
                  className={cn(
                    "relative flex h-10 items-center gap-1.5 rounded-full px-4 text-[15px] transition-colors",
                    active ? "bg-ink text-bone" : "hover:bg-ink/6",
                  )}
                >
                  {item.label}
                  {item.dot && <span className="size-1.5 animate-pulse-dot rounded-full bg-red" aria-hidden />}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden h-10 items-center gap-3 rounded-full border border-ink/12 pl-4 pr-2 text-sm text-smoke transition hover:border-ink/30 md:flex"
            >
              <Search className="size-4" />
              <span className="pr-6">Search lyrics, artists…</span>
              <kbd className="rounded-md bg-ink/6 px-1.5 py-0.5 font-mono text-[11px] text-ink">⌘K</kbd>
            </button>
            <IconButton label="Search" onClick={() => setSearchOpen(true)} className="md:hidden">
              <Search className="size-5" />
            </IconButton>
            <IconLink href="/account?tab=wishlist" label="Wishlist" badge={hydrated ? wishCount : 0} className="max-sm:hidden">
              <Heart className="size-5" />
            </IconLink>
            <IconLink href="/account" label="Account" className="max-sm:hidden">
              <User className="size-5" />
            </IconLink>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative ml-1 flex h-10 items-center gap-2 rounded-full bg-ink pl-3.5 pr-4 text-sm text-bone transition hover:bg-ink-3"
              aria-label={`Open bag, ${count} items`}
            >
              <ShoppingBag className="size-4" />
              <span className="font-mono tabular-nums">{count}</span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mega && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-x-0 top-full hidden border-t border-ink/8 bg-bone/95 shadow-[0_30px_60px_-30px_rgba(15,14,13,.35)] backdrop-blur-xl lg:block"
            >
              <div className="container-page grid grid-cols-12 gap-8 py-10">
                <div className="col-span-3">
                  <p className="eyebrow mb-5 text-smoke">Shop by piece</p>
                  <ul className="space-y-1">
                    <li>
                      <Link href="/shop" className="display block py-1 text-2xl hover:text-red">
                        Everything
                      </Link>
                    </li>
                    {GARMENT_LIST.map((g) => (
                      <li key={g.id}>
                        <Link href={`/shop?type=${g.id}`} className="display block py-1 text-2xl hover:text-red">
                          {g.short === "Tee" ? "Tees" : g.short === "Long Sleeve" ? "Long Sleeves" : `${g.short}s`}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="col-span-6 grid grid-cols-2 gap-4">
                  {COLLECTIONS.slice(0, 4).map((c) => (
                    <Link
                      key={c.slug}
                      href={`/collections/${c.slug}`}
                      className="group/col relative h-36 overflow-hidden rounded-2xl"
                    >
                      <Image
                        src={c.image}
                        alt=""
                        fill
                        sizes="25vw"
                        className="object-cover transition duration-700 group-hover/col:scale-105"
                        style={{ objectPosition: c.focus }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
                      <div className="absolute inset-x-4 bottom-3 text-bone">
                        <p className="display text-xl">{c.title}</p>
                        <p className="text-xs text-bone/70">{c.tagline}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  href="/studio"
                  className="group/studio relative col-span-3 flex flex-col justify-between overflow-hidden rounded-2xl bg-ink p-6 text-bone"
                >
                  <Mark tone="bone" className="h-10 w-auto self-start" />
                  <div>
                    <p className="display text-3xl">
                      Make it <span className="serif-italic font-normal text-red">yours</span>
                    </p>
                    <p className="mt-2 text-sm text-bone/70">
                      Your lyric, your font, your colorway. Designed in the Studio, printed in 3 days.
                    </p>
                    <p className="mt-4 inline-flex items-center gap-1 text-sm">
                      Open the Studio <ArrowUpRight className="size-4 transition group-hover/studio:-translate-y-0.5 group-hover/studio:translate-x-0.5" />
                    </p>
                  </div>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col bg-ink text-bone lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="container-page flex h-16 items-center justify-between">
              <Logo tone="bone" className="h-[26px] w-auto" />
              <button type="button" onClick={() => setMenuOpen(false)} className="grid size-10 place-items-center" aria-label="Close menu">
                <X className="size-6" />
              </button>
            </div>
            <nav className="container-page mt-6 flex flex-1 flex-col gap-1" aria-label="Mobile">
              {[...NAV, { href: "/account", label: "Account" }].map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link href={item.href} className="display flex items-center gap-3 py-2 text-5xl">
                    {item.label}
                    {"dot" in item && item.dot && <span className="size-3 rounded-full bg-red" />}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <p className="container-page pb-10 font-serif text-2xl italic text-bone/60">Wear your words.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function IconButton({
  label,
  onClick,
  children,
  className,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn("grid size-10 place-items-center rounded-full transition hover:bg-ink/6", className)}
    >
      {children}
    </button>
  );
}

function IconLink({
  href,
  label,
  badge,
  children,
  className,
}: {
  href: string;
  label: string;
  badge?: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn("relative grid size-10 place-items-center rounded-full transition hover:bg-ink/6", className)}
    >
      {children}
      {!!badge && (
        <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-red px-1 font-mono text-[10px] leading-4 text-ink">
          {badge}
        </span>
      )}
    </Link>
  );
}
