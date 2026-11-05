import { CalendarDays, FlaskConical, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { GarmentMockup } from "@/components/garment/garment-mockup";
import { ArtistPortrait } from "@/components/marketplace/artist-portrait";
import {
  artist,
  daily,
  dropAnnotation,
  kpis,
  payouts,
  period,
  recentOrders,
  topProducts,
} from "@/components/marketplace/dashboard/demo-data";
import { PayoutCard } from "@/components/marketplace/dashboard/payout-card";
import { RecentOrders } from "@/components/marketplace/dashboard/recent-orders";
import { SalesChart } from "@/components/marketplace/dashboard/sales-chart";
import { StatTile } from "@/components/marketplace/dashboard/stat-tile";
import { TopProducts } from "@/components/marketplace/dashboard/top-products";
import { formatCompact, formatCount, formatSignedPercent } from "@/components/marketplace/format";
import { ButtonLink } from "@/components/ui/button";
import { text } from "@/lib/design";
import { formatPrice } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Artist dashboard (demo)",
  description:
    "A demo of the Lyricshop artist dashboard: revenue, orders, payouts and followers for Maya Okafor, shown with sample data.",
  robots: { index: false },
};

const NEXT_LINE = [
  text({
    id: "dash-next-line",
    text: "your next\nline here",
    font: "caveat",
    size: 0.17,
    y: 0.42,
    color: "#161515",
    lineHeight: 0.95,
  }),
];

export default function ArtistDashboardPage() {
  const { revenue, orders, payoutDue, followers, sparkLabels, sparkAccentFrom } = kpis;
  const firstName = artist.name.split(" ")[0];
  const storefront = `/artists/${artist.handle}`;

  return (
    <div className="pb-24 md:pb-32">
      {/* Demo label */}
      <div className="container-page pt-6 md:pt-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-tape px-4 py-3 text-sm text-ink md:px-5">
          <span className="eyebrow inline-flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-1 !text-[10px] text-tape">
            <FlaskConical className="size-3" aria-hidden /> Demo dashboard · sample data
          </span>
          <p className="min-w-0 flex-1">
            A preview of what artists see. Revenue, orders, payouts and follower growth are generated sample numbers; the pieces
            are {artist.name}&rsquo;s real catalog.
          </p>
          <Link href="/sell#apply" className="font-medium underline underline-offset-4">
            Apply to sell
          </Link>
        </div>
      </div>

      {/* Header */}
      <header className="container-page mt-10 flex flex-wrap items-end justify-between gap-6 border-b border-ink/10 pb-8 md:mt-14">
        <div className="flex items-center gap-5">
          <ArtistPortrait
            creator={artist}
            sizes="96px"
            preload
            decorative
            className="relative size-16 shrink-0 rounded-full ring-1 ring-ink/10 md:size-24"
          />
          <div>
            <p className="eyebrow text-smoke">Artist dashboard · {artist.name}</p>
            <h1 className="display mt-3 text-[clamp(2.4rem,5.4vw,4.8rem)]">
              Welcome back, <span className="serif-italic font-normal text-red">{firstName}.</span>
            </h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={storefront} variant="outline" size="lg">
            View storefront
          </ButtonLink>
          <ButtonLink href="/studio" variant="accent" size="lg">
            <Plus className="size-4" /> Create a new piece
          </ButtonLink>
        </div>
      </header>

      {/* Scope: one period for everything below */}
      <div className="container-page mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
        <span className="inline-flex h-9 items-center gap-2 rounded-full bg-ink px-4 text-bone">
          <CalendarDays className="size-4" aria-hidden /> Last 30 days · {period.label}
        </span>
        <span className="text-smoke">Changes compare with the 30 days before.</span>
      </div>

      {/* KPIs */}
      <section aria-label="Key numbers" className="container-page mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Revenue"
          value={formatPrice(revenue.value)}
          delta={{
            change: revenue.value - revenue.previous,
            text: formatSignedPercent(revenue.value / revenue.previous - 1),
          }}
          note="vs prior 30 days"
          spark={{
            values: revenue.spark,
            labels: sparkLabels,
            accentFrom: sparkAccentFrom,
            format: "money",
            name: "Revenue",
          }}
        />
        <StatTile
          label="Orders"
          value={formatCount(orders.value)}
          delta={{
            change: orders.value - orders.previous,
            text: formatSignedPercent(orders.value / orders.previous - 1),
          }}
          note="vs prior 30 days"
          spark={{
            values: orders.spark,
            labels: sparkLabels,
            accentFrom: sparkAccentFrom,
            format: "count",
            name: "Orders",
          }}
        />
        <StatTile
          label="Payout due"
          value={formatPrice(payoutDue.value, { cents: true })}
          note={`Pays ${payoutDue.date}`}
          footer={
            <dl className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between rounded-xl bg-ink/[0.04] px-3 py-2">
                <dt className="text-smoke">{payoutDue.range} sales</dt>
                <dd className="font-mono tabular-nums">{formatPrice(payoutDue.sales)}</dd>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-ink/[0.04] px-3 py-2">
                <dt className="text-smoke">Your share</dt>
                <dd className="font-mono tabular-nums">30%</dd>
              </div>
            </dl>
          }
        />
        <StatTile
          label="Followers"
          value={formatCompact(followers.value)}
          delta={{ change: followers.gained, text: `+${formatCount(followers.gained)}` }}
          note={`new in 30 days (${formatSignedPercent(followers.gained / followers.startOfPeriod)})`}
          spark={{
            values: followers.spark,
            labels: sparkLabels,
            accentFrom: sparkAccentFrom,
            format: "count",
            name: "Followers",
          }}
        />
      </section>

      {/* Daily revenue + payouts */}
      <div className="container-page mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <SalesChart points={daily} period={period.short} annotation={dropAnnotation} />
        </div>
        <div className="lg:col-span-4">
          <PayoutCard next={payouts.next} history={payouts.history} />
        </div>
      </div>

      {/* Pieces + orders */}
      <div className="container-page mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-7 xl:col-span-8">
          <TopProducts rows={topProducts} period={period.short} storefront={storefront} />
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
          <RecentOrders {...recentOrders} />
        </div>
      </div>

      {/* Create */}
      <section className="container-page mt-4">
        <div className="grain relative overflow-hidden rounded-[28px] bg-ink px-6 py-10 text-bone md:px-12 md:py-14">
          <div className="relative z-10 grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <p className="eyebrow text-bone/50">Next drop</p>
              <p className="display mt-4 text-[clamp(2.2rem,4.4vw,4rem)]">
                Got another line <span className="serif-italic font-normal text-red">in you?</span>
              </p>
              <p className="mt-4 max-w-lg text-bone/65">
                Set it in the Studio, choose the blanks and colorways, and add it to your storefront next to the rest.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/studio" variant="accent" size="lg">
                  <Plus className="size-4" /> Create a new piece
                </ButtonLink>
                <ButtonLink href={storefront} variant="outline-bone" size="lg">
                  See your storefront
                </ButtonLink>
              </div>
            </div>
            <div className="hidden size-60 rounded-3xl bg-bone/[0.06] p-4 md:block" aria-hidden>
              <GarmentMockup garment="hoodie" color="#C6B6D6" layers={NEXT_LINE} className="h-full w-full" />
            </div>
          </div>
        </div>
      </section>

      <p className="container-page mt-8 text-xs text-smoke">
        Demo dashboard · sample data. Sales, orders, payouts and follower growth are generated for illustration; none of it is real sales data.
      </p>
    </div>
  );
}
