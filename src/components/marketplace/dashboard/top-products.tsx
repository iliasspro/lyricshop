import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { GarmentMockup } from "@/components/garment/garment-mockup";
import { ProductBadge } from "@/components/ui/bits";
import { cn } from "@/lib/cn";
import { colorFor } from "@/lib/colors";
import { GARMENTS } from "@/lib/garments";
import { formatPrice } from "@/lib/pricing";
import type { TopProduct } from "./demo-data";
import { TILE } from "./viz";

/**
 * Pieces ranked by revenue. One series (share of revenue) → every bar takes the series hue;
 * bars are thin, square at the baseline with a 4px rounded end, and each carries its value.
 */
export function TopProducts({ rows, period, storefront }: { rows: TopProduct[]; period: string; storefront: string }) {
  const maxShare = Math.max(...rows.map((r) => r.share), 0.0001);
  return (
    <section className={cn(TILE, "p-5 md:p-7")} aria-labelledby="top-pieces">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="top-pieces" className="text-lg font-medium">
            Top pieces
          </h2>
          <p className="mt-0.5 text-sm text-smoke">By revenue · {period}</p>
        </div>
        <Link href={storefront} className="group/sf inline-flex items-center gap-1.5 text-sm font-medium">
          Your storefront
          <ArrowUpRight className="size-4 transition group-hover/sf:-translate-y-0.5 group-hover/sf:translate-x-0.5" />
        </Link>
      </div>

      <div className="-mx-5 mt-5 overflow-x-auto md:-mx-7">
        <table className="w-full min-w-[640px] text-sm">
          <caption className="sr-only">Your pieces ranked by revenue, {period}</caption>
          <thead>
            <tr className="text-left text-smoke">
              <th scope="col" className="py-2 pl-5 pr-3 font-normal md:pl-7">
                Piece
              </th>
              <th scope="col" className="px-3 py-2 text-right font-normal">
                Price
              </th>
              <th scope="col" className="px-3 py-2 text-right font-normal">
                Sold
              </th>
              <th scope="col" className="px-3 py-2 text-right font-normal">
                Revenue
              </th>
              <th scope="col" className="px-3 py-2 text-right font-normal">
                Your 30%
              </th>
              <th scope="col" className="w-[24%] py-2 pl-5 pr-5 font-normal md:pr-7">
                Share of revenue
              </th>
            </tr>
          </thead>
          <tbody className="border-t border-ink/8">
            {rows.map(({ product: p, units, revenue, earnings, share }) => (
              <tr key={p.slug} className="border-b border-ink/8 transition-colors last:border-0 hover:bg-ink/[0.025]">
                <th scope="row" className="py-3 pl-5 pr-3 text-left font-normal md:pl-7">
                  <Link href={`/product/${p.slug}`} className="group/row flex items-center gap-3">
                    <span className="size-12 shrink-0 rounded-xl bg-[#e5ddcf] p-1">
                      <GarmentMockup
                        garment={p.garment}
                        color={colorFor(p.colors[0]).hex}
                        layers={p.design.front}
                        shadow={false}
                        className="h-full w-full"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium group-hover/row:underline group-hover/row:underline-offset-4">
                        {p.title}
                      </span>
                      <span className="mt-1 flex items-center gap-2 text-xs text-smoke">
                        {GARMENTS[p.garment].short}
                        {p.badges[0] && <ProductBadge badge={p.badges[0]} className="!h-5 !px-2" />}
                      </span>
                    </span>
                  </Link>
                </th>
                <td className="px-3 py-3 text-right font-mono tabular-nums text-smoke">{formatPrice(p.price)}</td>
                <td className="px-3 py-3 text-right font-mono tabular-nums">{units}</td>
                <td className="px-3 py-3 text-right font-mono tabular-nums">{formatPrice(revenue)}</td>
                <td className="px-3 py-3 text-right font-mono tabular-nums">{formatPrice(earnings, { cents: true })}</td>
                <td className="py-3 pl-5 pr-5 md:pr-7">
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1" aria-hidden>
                      <div
                        className="h-2 rounded-r-[4px] bg-red"
                        style={{ width: `${Math.max(2, (share / maxShare) * 100)}%` }}
                      />
                    </div>
                    <span className="w-12 text-right font-mono text-xs tabular-nums text-smoke">
                      {(share * 100).toFixed(1)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
