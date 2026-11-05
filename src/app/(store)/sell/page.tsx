import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Camera,
  MessageCircle,
  PenLine,
  Printer,
  RefreshCw,
  Truck,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Mark } from "@/components/brand/logo";
import { GarmentMockup } from "@/components/garment/garment-mockup";
import { AvatarStack } from "@/components/marketplace/avatar-stack";
import { ARTIST_SHARE } from "@/components/marketplace/constants";
import { EarningsCalculator, type PricePreset } from "@/components/marketplace/earnings-calculator";
import { FaqAccordion, type FaqItem } from "@/components/marketplace/faq-accordion";
import { SellerApplicationForm } from "@/components/marketplace/seller-application-form";
import { Eyebrow, SectionHeading } from "@/components/ui/bits";
import { ButtonLink } from "@/components/ui/button";
import { graphic, text } from "@/lib/design";
import { CREATORS } from "@/lib/data/creators";
import { PRODUCTS, getProduct } from "@/lib/data/products";
import { FREE_SHIPPING_THRESHOLD, formatPrice } from "@/lib/pricing";
import { GARMENTS, type GarmentId } from "@/lib/garments";

export const metadata: Metadata = {
  title: "Sell with us",
  description:
    "Turn your lyrics into heavyweight streetwear. Lyricshop prints every piece to order, ships it, handles returns and support. You keep 30% of every sale, paid monthly.",
};

/** Typical catalog price per blank (median), so the calculator starts from real numbers. */
function pricePresets(): PricePreset[] {
  const order: GarmentId[] = ["tote", "cap", "tee", "longsleeve", "crewneck", "hoodie"];
  return order.flatMap((g) => {
    const prices = PRODUCTS.filter((p) => p.garment === g)
      .map((p) => p.price)
      .sort((a, b) => a - b);
    if (prices.length === 0) return [];
    return [{ label: GARMENTS[g].short, price: prices[Math.floor(prices.length / 2)] }];
  });
}

const share = (price: number) => formatPrice(Math.round(price * ARTIST_SHARE * 100) / 100, { cents: true });

const HANDLED = [
  {
    icon: Printer,
    title: "Printing",
    body: "Water-based screen prints, puff and embroidery on heavyweight organic blanks, each one checked before it ships.",
  },
  {
    icon: Truck,
    title: "Shipping",
    body: `Packed plastic-free and out the door within three days, with tracking. Free for fans on orders over ${formatPrice(FREE_SHIPPING_THRESHOLD)}.`,
  },
  {
    icon: RefreshCw,
    title: "Returns",
    body: "30-day returns and free exchanges, handled end to end. No boxes ever come back to your door.",
  },
  {
    icon: MessageCircle,
    title: "Customer service",
    body: "Sizing questions, address changes, the where’s-my-hoodie emails: real people answer them so you don’t have to.",
  },
  {
    icon: Camera,
    title: "Photography",
    body: "Product shots and on-body photos of every piece, ready for your storefront and your socials.",
  },
];

export default function SellPage() {
  const presets = pricePresets();
  const tee = presets.find((p) => p.label === "Tee")?.price ?? 36;
  const hoodie = presets.find((p) => p.label === "Hoodie")?.price ?? 78;
  const sale = getProduct("hum-it-back-crewneck");
  const artists = CREATORS.filter((c) => c.avatar);

  const faq: FaqItem[] = [
    {
      q: "Who can sell on Lyricshop?",
      a: "Songwriters, rappers, poets, producers and bands: anyone with original words. You need to have written the lines you upload, or hold the rights to them as a credited co-writer.",
    },
    {
      q: "Do I need to buy stock?",
      a: "No. Every piece is printed when someone orders it, so there’s nothing to buy up front, nothing to store and nothing left over when a drop ends.",
    },
    {
      q: "How much do I earn per piece?",
      a: `30% of the item price on every piece sold. A ${formatPrice(tee)} tee pays you ${share(tee)}; a ${formatPrice(hoodie)} hoodie pays you ${share(hoodie)}. Shipping and sales tax are charged on top, so they never touch your share.`,
    },
    {
      q: "When do I get paid?",
      a: "Monthly. On the 1st we pay out everything you earned the month before, and your dashboard shows each order the moment it lands.",
    },
    {
      q: "Do I need finished artwork?",
      a: "No. Most artists set their lines in the Studio, with 22 typefaces, arcs, outlines and a sticker sheet. If you already have artwork, upload it instead.",
    },
    {
      q: "Who owns my lyrics?",
      a: "You do. You license us to print and sell the pieces in your storefront, and you can retire a piece whenever you like.",
    },
    {
      q: "Can I sell lines from songs I didn’t write?",
      a: "No covers, quotes or lyrics from other artists. If the words aren’t yours, they can’t go on a Lyricshop piece.",
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="grain relative overflow-hidden bg-ink text-bone">
        <div className="container-page relative z-10 grid items-center gap-14 pb-20 pt-12 md:pb-28 md:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
          <div>
            <Eyebrow dot className="text-bone/60">
              Sell with us · For songwriters, rappers, poets &amp; bands
            </Eyebrow>
            <h1 className="display mt-7 text-[clamp(3.4rem,7.6vw,7.4rem)]">
              <span className="block">You write the line.</span>
              <span className="serif-italic block pl-[0.03em] text-[1.08em] font-normal leading-[0.9] text-red">
                We do the rest.
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-bone/70 md:text-xl">
              Put your lyrics on heavyweight hoodies, tees and totes without buying a single blank. We print every piece to order,
              ship it, take the returns and answer the emails. You keep 30% of every sale.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="#apply" variant="accent" size="lg">
                Apply to sell <ArrowDown className="size-4" />
              </ButtonLink>
              <ButtonLink href="/sell/dashboard" variant="outline-bone" size="lg">
                See the artist dashboard
              </ButtonLink>
            </div>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-bone/15 pt-6">
              {[
                ["30%", "of every sale, yours"],
                ["3 days", "from order to shipped"],
                ["Monthly", "payouts, on the 1st"],
              ].map(([value, label]) => (
                <div key={label} className="flex flex-col-reverse justify-end">
                  <dt className="mt-2 text-sm text-bone/55">{label}</dt>
                  <dd className="display text-[clamp(1.8rem,3vw,2.6rem)]">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[32px] lg:aspect-[5/6]">
              <Image
                src="/images/sell-packing.jpg"
                alt="A musician in his home studio with two folded black hoodies printed with his band’s name"
                fill
                preload
                sizes="(min-width: 1024px) 46vw, 100vw"
                className="object-cover object-[42%_50%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
            </div>
            {sale && (
              <div className="absolute -bottom-6 left-4 right-4 flex items-center gap-4 rounded-3xl bg-bone p-4 pr-5 text-ink shadow-[0_30px_60px_-20px_rgba(0,0,0,.6)] sm:left-auto sm:right-[-0.5rem] sm:w-[24rem] lg:-left-10 lg:right-auto">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-ink" aria-hidden>
                  <Mark tone="bone" detail={false} title="" className="h-5 w-auto" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center justify-between gap-3 text-xs text-smoke">
                    <span className="eyebrow !text-[10px]">Lyricshop · just now</span>
                  </p>
                  <p className="mt-1 truncate text-[15px] font-medium">You sold a {sale.title}</p>
                  <p className="text-sm text-smoke">
                    <span className="font-mono tabular-nums text-ink">+{share(sale.price)}</span> to your next payout
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container-page py-24 md:py-32">
        <SectionHeading
          eyebrow="How it works"
          title={
            <>
              Three steps. <span className="serif-italic font-normal">You</span> only do the first.
            </>
          }
          aside={<p className="max-w-sm text-smoke">No inventory, no minimums, no trips to the post office.</p>}
          className="mb-12"
        />
        <ol className="grid gap-5 md:grid-cols-3">
          <li className="flex flex-col overflow-hidden rounded-[28px] bg-paper">
            <div className="relative grid aspect-[5/4] place-items-center bg-[#e5ddcf] p-6">
              <GarmentMockup
                garment="tee"
                color="#EFE8DB"
                className="h-full w-auto"
                title="A tee with a handwritten line"
                layers={[
                  text({
                    id: "sell-step-line",
                    text: "your line\nhere",
                    font: "permanent-marker",
                    size: 0.17,
                    y: 0.34,
                    color: "#161515",
                    lineHeight: 0.95,
                  }),
                  graphic({ id: "sell-step-heart", graphic: "heart", size: 0.13, y: 0.72, color: "#FF4A1C" }),
                ]}
              />
            </div>
            <Step
              n="01"
              title="Upload your lines"
              body="Set your words in the Studio with 22 typefaces, or bring finished artwork. Choose the blanks and colorways you want to sell."
              link={{ href: "/studio", label: "Open the Studio" }}
            />
          </li>
          <li className="flex flex-col overflow-hidden rounded-[28px] bg-paper">
            <div className="grid aspect-[5/4] content-center gap-3 bg-[#e5ddcf] p-6 md:p-8">
              {[
                { day: "Day 0", label: "A fan orders your hoodie", done: true },
                { day: "Day 1", label: "Printed and checked by hand", done: true },
                { day: "Day 3", label: "Packed plastic-free and shipped", done: false },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3 rounded-2xl bg-bone/80 p-3 pr-4 shadow-sm">
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-full ${s.done ? "bg-ink text-bone" : "bg-red text-ink"}`}
                    aria-hidden
                  >
                    {s.done ? <Printer className="size-4" /> : <Truck className="size-4" />}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[15px]">{s.label}</span>
                  <span className="font-mono text-xs text-smoke">{s.day}</span>
                </div>
              ))}
            </div>
            <Step
              n="02"
              title="We print & ship to order"
              body="Every order is printed on heavyweight organic cotton, packed and shipped within three days. Nothing sits in a warehouse."
            />
          </li>
          <li className="flex flex-col overflow-hidden rounded-[28px] bg-paper">
            <div className="grain relative grid aspect-[5/4] place-items-center overflow-hidden bg-ink text-bone">
              <p className="display relative z-10 text-[clamp(5rem,11vw,9rem)] text-red">30%</p>
              <p className="eyebrow absolute bottom-6 z-10 text-bone/55">of every sale, every month</p>
            </div>
            <Step
              n="03"
              title="You keep 30%"
              body="30% of the item price on every piece, paid out on the 1st. Your dashboard shows each order as it lands."
              link={{ href: "/sell/dashboard", label: "See the demo dashboard" }}
            />
          </li>
        </ol>
      </section>

      {/* Calculator */}
      <section id="earnings" className="grain scroll-mt-6 bg-ink py-24 text-bone md:py-32">
        <div className="container-page relative z-10 grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <p className="eyebrow text-bone/50">Earnings calculator</p>
            <h2 className="display mt-5 text-[clamp(2.6rem,5vw,4.6rem)]">
              Run the <span className="serif-italic font-normal text-red">numbers.</span>
            </h2>
            <p className="mt-6 max-w-sm text-lg text-bone/65">
              Pick a price, guess how many you&rsquo;ll sell in a month and see what 30% adds up to.
            </p>
          </div>
          <div className="lg:col-span-8">
            <EarningsCalculator presets={presets} defaultPrice={tee} defaultUnits={120} />
          </div>
        </div>
      </section>

      {/* What we handle */}
      <section className="container-page py-24 md:py-32">
        <SectionHeading
          eyebrow="What Lyricshop handles"
          title={
            <>
              We sweat the <span className="serif-italic font-normal">boring</span> parts.
            </>
          }
          aside={
            <p className="max-w-sm text-smoke">
              Everything between your notebook and a fan&rsquo;s front door is on us. That&rsquo;s what the other 70% is for.
            </p>
          }
          className="mb-12"
        />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HANDLED.map(({ icon: Icon, title, body }) => (
            <li key={title} className="rounded-[24px] bg-paper p-7">
              <span className="grid size-11 place-items-center rounded-full bg-bone text-red">
                <Icon className="size-5" />
              </span>
              <p className="mt-6 text-lg font-medium">{title}</p>
              <p className="mt-2 leading-relaxed text-smoke">{body}</p>
            </li>
          ))}
          <li className="flex flex-col justify-between rounded-[24px] bg-ink p-7 text-bone">
            <span className="grid size-11 place-items-center rounded-full bg-red text-ink">
              <PenLine className="size-5" />
            </span>
            <div className="mt-6">
              <p className="text-lg font-medium">You handle the words</p>
              <p className="mt-2 leading-relaxed text-bone/65">That&rsquo;s the whole job. Write the line and we&rsquo;ll take it from there.</p>
            </div>
          </li>
        </ul>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-6 bg-paper py-24 md:py-32">
        <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <p className="eyebrow text-smoke">FAQ</p>
            <h2 className="display mt-5 text-[clamp(2.4rem,4.6vw,4.2rem)]">
              Questions, <span className="serif-italic font-normal">answered.</span>
            </h2>
            <p className="mt-6 max-w-sm text-smoke">
              The short version: your words, our printers, your 30%. The long version is right here.
            </p>
          </div>
          <FaqAccordion items={faq} className="lg:col-span-8" />
        </div>
      </section>

      {/* Apply */}
      <section id="apply" className="container-page scroll-mt-6 py-24 md:py-32">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <Eyebrow dot className="text-smoke">
              Applications open
            </Eyebrow>
            <h2 className="display mt-5 text-[clamp(2.6rem,5vw,4.6rem)]">
              Put your words <span className="serif-italic font-normal text-red">on air.</span>
            </h2>
            <p className="mt-6 max-w-md text-lg text-smoke">
              Tell us who you are and where we can hear you. We listen to every application, and if it&rsquo;s a fit we&rsquo;ll help
              you set up your storefront and your first drop.
            </p>
            <AvatarStack creators={artists} tone="light" label="Join" className="mt-10" />
            <Link href="/artists" className="group/all mt-8 inline-flex items-center gap-2 font-medium">
              Meet the artists already here <ArrowUpRight className="size-4 transition group-hover/all:-translate-y-0.5 group-hover/all:translate-x-0.5" />
            </Link>
          </div>
          <div className="lg:col-span-7">
            <SellerApplicationForm />
          </div>
        </div>
      </section>
    </>
  );
}

function Step({
  n,
  title,
  body,
  link,
}: {
  n: string;
  title: string;
  body: string;
  link?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-1 flex-col p-7">
      <p className="font-mono text-xs text-smoke">{n}</p>
      <h3 className="display mt-3 text-[clamp(1.6rem,2.4vw,2.1rem)]">{title}</h3>
      <p className="mt-3 leading-relaxed text-smoke">{body}</p>
      {link && (
        <Link href={link.href} className="group/step mt-auto inline-flex items-center gap-2 pt-6 font-medium">
          {link.label} <ArrowRight className="size-4 transition group-hover/step:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
