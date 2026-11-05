"use client";

import { useId, useState, type CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/pricing";
import { ARTIST_SHARE } from "./constants";

export type PricePreset = { label: string; price: number };

const PRICE = { min: 20, max: 120, step: 1 };
const UNITS = { min: 0, max: 1000, step: 5 };

const cents = (n: number) => Math.round(n * 100) / 100;

export function EarningsCalculator({
  presets,
  defaultPrice = 36,
  defaultUnits = 120,
}: {
  presets: PricePreset[];
  defaultPrice?: number;
  defaultUnits?: number;
}) {
  const id = useId();
  const [price, setPrice] = useState(defaultPrice);
  const [units, setUnits] = useState(defaultUnits);

  const perPiece = cents(price * ARTIST_SHARE);
  const monthly = Math.round(price * ARTIST_SHARE * units);
  const yearly = monthly * 12;
  const perDay = units / 30;
  const pace =
    units === 0
      ? "Nothing sold yet"
      : perDay < 1
        ? `About ${Math.max(1, Math.round(units / 4.3))} a week`
        : `About ${Math.round(perDay)} a day`;

  return (
    <div className="rounded-[28px] bg-ink-2 p-6 ring-1 ring-bone/10 md:p-10">
      <div className="grid gap-10 md:grid-cols-2 md:gap-12">
        <div>
          <div className="flex items-baseline justify-between gap-4">
            <label htmlFor={`${id}-price`} className="text-[15px] text-bone/70">
              Price per piece
            </label>
            <output htmlFor={`${id}-price`} className="font-mono text-2xl tabular-nums">
              {formatPrice(price)}
            </output>
          </div>
          <Range
            id={`${id}-price`}
            {...PRICE}
            value={price}
            onChange={setPrice}
            valueText={`${formatPrice(price)} per piece, ${formatPrice(perPiece)} to you`}
          />
          <div className="mt-5 flex flex-wrap gap-1.5" role="group" aria-label="Typical prices">
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setPrice(p.price)}
                aria-pressed={price === p.price}
                className={cn(
                  "h-9 rounded-full px-3.5 text-sm transition",
                  price === p.price ? "bg-bone text-ink" : "bg-bone/8 text-bone/75 hover:bg-bone/15 hover:text-bone",
                )}
              >
                {p.label} <span className="font-mono text-xs tabular-nums opacity-70">{formatPrice(p.price)}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-4">
            <label htmlFor={`${id}-units`} className="text-[15px] text-bone/70">
              Pieces sold a month
            </label>
            <output htmlFor={`${id}-units`} className="font-mono text-2xl tabular-nums">
              {units.toLocaleString("en-US")}
            </output>
          </div>
          <Range
            id={`${id}-units`}
            {...UNITS}
            value={units}
            onChange={setUnits}
            valueText={`${units} pieces a month, ${formatPrice(monthly)} a month to you`}
          />
          <p className="mt-5 text-sm text-bone/50">{pace}, across every piece in your storefront.</p>
        </div>
      </div>

      <div className="mt-10 grid gap-8 border-t border-bone/10 pt-8 sm:grid-cols-[1.4fr_1fr_1fr] sm:items-end">
        <div>
          <p className="eyebrow text-bone/50">You&rsquo;d earn a month</p>
          <p className="display mt-3 text-[clamp(3rem,6vw,5.4rem)] tabular-nums text-red">{formatPrice(monthly)}</p>
        </div>
        <div>
          <p className="eyebrow text-bone/50">A year</p>
          <p className="display mt-3 text-[clamp(1.8rem,3vw,2.6rem)] tabular-nums">{formatPrice(yearly)}</p>
        </div>
        <div>
          <p className="eyebrow text-bone/50">Per piece</p>
          <p className="display mt-3 text-[clamp(1.8rem,3vw,2.6rem)] tabular-nums">
            {formatPrice(perPiece, { cents: !Number.isInteger(perPiece) })}
          </p>
        </div>
      </div>
      <p className="mt-8 max-w-xl text-sm leading-relaxed text-bone/45">
        An estimate, not a promise: 30% of the item price × pieces sold. Shipping and sales tax sit on top of the item price, so
        they never shrink your share.
      </p>
    </div>
  );
}

function Range({
  id,
  min,
  max,
  step,
  value,
  onChange,
  valueText,
}: {
  id: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  valueText: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      aria-valuetext={valueText}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ "--fill": `${pct}%` } as CSSProperties}
      className={cn(
        "mt-5 h-2 w-full cursor-pointer appearance-none rounded-full",
        "bg-[linear-gradient(to_right,var(--color-red)_var(--fill),color-mix(in_oklab,var(--color-bone)_14%,transparent)_var(--fill))]",
        "[&::-webkit-slider-thumb]:size-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-bone [&::-webkit-slider-thumb]:shadow-[0_0_0_6px_rgba(255,74,28,.22),0_6px_16px_rgba(0,0,0,.4)] [&::-webkit-slider-thumb]:transition-transform active:[&::-webkit-slider-thumb]:scale-110",
        "[&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:size-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-bone [&::-moz-range-thumb]:shadow-[0_0_0_6px_rgba(255,74,28,.22)]",
      )}
    />
  );
}
