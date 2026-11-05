import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Mark } from "@/components/brand/logo";
import { SearchButton } from "@/components/info/search-button";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Not on the record",
  description: "This page isn't on the record. Search the shop, head back home or write your own line in the Studio.",
};

const TRACKLIST = [
  { side: "A1", href: "/", title: "Home", note: "Back to the top" },
  { side: "A2", href: "/shop", title: "Shop everything", note: "Every line we've printed" },
  { side: "B1", href: "/studio", title: "The Studio", note: "Write your own" },
  { side: "B2", href: "/collections", title: "Collections", note: "Pick a mood" },
];

const LINE = "lost in the dead wax";

// The root not-found renders outside the (store) layout, so it brings its own chrome.
export default function NotFound() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main id="main" className="flex-1">
        <section className="container-page grid gap-12 py-14 md:py-24 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-7">
            <p className="eyebrow flex items-center gap-2 text-smoke">
              <span className="size-1.5 animate-pulse-dot rounded-full bg-red" aria-hidden />
              Error 404 · Side C, track 4
            </p>
            <h1 className="display mt-6 text-[clamp(3.4rem,8.6vw,8.5rem)]">
              Lost in the <span className="serif-italic font-normal">dead wax.</span>
            </h1>
            <p className="mt-8 max-w-lg text-lg text-smoke">
              The needle ran past the last song. This page isn&apos;t on the record: maybe it was a demo, maybe it never got pressed.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <SearchButton />
              <ButtonLink href="/" variant="outline" size="lg">
                <ArrowLeft className="size-4" /> Back home
              </ButtonLink>
            </div>
            <p className="mt-10 text-smoke">
              Or turn the moment into a line:{" "}
              <Link
                href={`/studio?text=${encodeURIComponent(LINE)}`}
                className="group/line inline-flex items-center gap-1 font-medium text-ink underline decoration-ink/30 underline-offset-4 transition hover:decoration-ink"
              >
                put &ldquo;{LINE}&rdquo; on a tee
                <ArrowUpRight className="size-4 transition group-hover/line:-translate-y-0.5 group-hover/line:translate-x-0.5" aria-hidden />
              </Link>
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="grain relative overflow-hidden rounded-[32px] bg-ink p-6 text-bone md:p-8">
              <div className="eyebrow relative z-10 flex items-center justify-between text-bone/45">
                <span className="flex items-center gap-2">
                  <span className="size-1.5 animate-pulse-dot rounded-full bg-red" aria-hidden /> Now playing
                </span>
                <span>404</span>
              </div>
              <div className="relative z-10 py-12 md:py-14">
                <Mark tone="bone" spin className="mx-auto h-auto w-[68%]" title="The Lyricshop mark, records spinning" />
              </div>
              <nav aria-label="Tracklist" className="relative z-10">
                <p className="eyebrow mb-2 text-bone/45">Tracklist</p>
                <ol className="border-t border-bone/12">
                  {TRACKLIST.map((t) => (
                    <li key={t.href}>
                      <Link
                        href={t.href}
                        className="group/track flex items-center gap-4 border-b border-bone/12 py-3.5 transition-colors hover:text-red"
                      >
                        <span className="w-6 font-mono text-xs text-red">{t.side}</span>
                        <span className="flex-1 font-medium">{t.title}</span>
                        <span className="text-sm text-bone/45 max-sm:hidden">{t.note}</span>
                        <ArrowUpRight
                          className="size-4 text-bone/45 transition group-hover/track:-translate-y-0.5 group-hover/track:translate-x-0.5 group-hover/track:text-red"
                          aria-hidden
                        />
                      </Link>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
