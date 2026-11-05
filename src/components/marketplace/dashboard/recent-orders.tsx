import { Package, Printer, Sparkles } from "lucide-react";
import { GarmentMockup } from "@/components/garment/garment-mockup";
import { cn } from "@/lib/cn";
import { colorFor } from "@/lib/colors";
import { getProduct } from "@/lib/data/products";
import { formatPrice } from "@/lib/pricing";
import { ARTIST_SHARE } from "../constants";
import type { DemoOrder, OrderStatus } from "./demo-data";
import { TILE } from "./viz";

// Fulfilment stages are progress, not good/bad states, so they stay neutral: icon + label.
const STATUS: Record<OrderStatus, { label: string; icon: typeof Printer }> = {
  new: { label: "New", icon: Sparkles },
  printing: { label: "Printing", icon: Printer },
  packed: { label: "Packed", icon: Package },
};

export function RecentOrders({
  day,
  count,
  sales,
  orders,
}: {
  day: string;
  count: number;
  sales: number;
  orders: DemoOrder[];
}) {
  return (
    <section className={cn(TILE, "flex flex-col p-5 md:p-7")} aria-labelledby="recent-orders">
      <div>
        <h2 id="recent-orders" className="text-lg font-medium">
          Recent orders
        </h2>
        <p className="mt-0.5 text-sm text-smoke">
          {day} · {count} orders · {formatPrice(sales)}
        </p>
      </div>
      <ul className="mt-4 divide-y divide-ink/8">
        {orders.map((o) => {
          const product = getProduct(o.slug);
          if (!product) return null;
          const color = colorFor(o.color);
          const status = STATUS[o.status];
          const Icon = status.icon;
          return (
            <li key={o.id} className="flex items-center gap-3 py-3.5">
              <span className="size-11 shrink-0 rounded-xl bg-[#e5ddcf] p-1">
                <GarmentMockup
                  garment={product.garment}
                  color={color.hex}
                  layers={product.design.front}
                  shadow={false}
                  className="h-full w-full"
                />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium">{product.title}</p>
                <p className="truncate text-xs text-smoke">
                  {color.name} · {o.size} · {o.city}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-mono text-sm tabular-nums">
                  +{formatPrice(Math.round(product.price * ARTIST_SHARE * 100) / 100, { cents: true })}
                </p>
                <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-smoke">
                  <Icon className="size-3" aria-hidden />
                  {status.label} · {o.time}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-auto pt-4 text-xs text-smoke">Amounts are your 30% of each order.</p>
    </section>
  );
}
