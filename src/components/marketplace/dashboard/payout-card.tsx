import { CircleCheck, Clock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/pricing";
import { TILE } from "./viz";

type Payout = { date: string; period: string; amount: number };

export function PayoutCard({
  next,
  history,
}: {
  next: Payout & { sales: number };
  history: Payout[];
}) {
  return (
    <section className={cn(TILE, "flex h-full flex-col p-5 md:p-7")} aria-labelledby="payouts">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="payouts" className="text-lg font-medium">
            Payouts
          </h2>
          <p className="mt-0.5 text-sm text-smoke">Monthly, on the 1st</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/6 px-2.5 py-1 text-xs">
          <Clock className="size-3.5" aria-hidden /> Accruing
        </span>
      </div>

      <div className="mt-6 rounded-2xl bg-ink p-5 text-bone">
        <p className="text-sm text-bone/60">Next payout · {next.date}</p>
        <p className="mt-2 font-sans text-[2.5rem] font-semibold leading-none tracking-[-0.035em]">
          {formatPrice(next.amount, { cents: true })}
        </p>
        <p className="mt-3 text-sm text-bone/60">
          30% of <span className="font-mono tabular-nums text-bone">{formatPrice(next.sales)}</span> in sales, {next.period}
        </p>
      </div>

      <h3 className="mt-7 text-sm text-smoke">History</h3>
      <ul className="mt-2 divide-y divide-ink/8">
        {history.map((p) => (
          <li key={p.date} className="flex items-center justify-between gap-3 py-3 text-sm">
            <div>
              <p className="font-medium">{p.date}</p>
              <p className="text-xs text-smoke">{p.period} sales</p>
            </div>
            <div className="text-right">
              <p className="font-mono tabular-nums">{formatPrice(p.amount, { cents: true })}</p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-xs">
                <CircleCheck className="size-3.5 text-ok" aria-hidden /> Paid
              </p>
            </div>
          </li>
        ))}
      </ul>
      <Link href="/sell#faq" className="link-underline mt-auto w-fit pt-5 text-sm text-smoke hover:text-ink">
        How payouts work
      </Link>
    </section>
  );
}
