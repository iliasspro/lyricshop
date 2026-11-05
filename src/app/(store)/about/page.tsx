import { ArrowRight, ArrowUpRight, Droplets, Leaf, Package, PenLine, Printer, Shirt, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Wordmark } from "@/components/brand/logo";
import { GarmentMockup } from "@/components/garment/garment-mockup";
import { Eyebrow, SectionHeading } from "@/components/ui/bits";
import { ButtonLink } from "@/components/ui/button";
import { colorFor } from "@/lib/colors";
import { text } from "@/lib/design";
import { CREATORS, CREATOR_BY_HANDLE } from "@/lib/data/creators";
import { getProduct } from "@/lib/data/products";
import { formatPrice } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Our story",
  description:
    "Lyricshop is streetwear built from the lines independent songwriters write. Artists keep 30% of every sale, and every piece is printed to order on organic cotton.",
};

const ARTIST_SHARE = 0.3;

const STEPS = [
  {
    icon: PenLine,
    title: "An artist writes the line.",
    body: "Songwriters, rappers and poets open a shop and upload words they wrote. Their lines, their rights, their name on every piece.",
  },
  {
    icon: Shirt,
    title: "You pick the piece.",
    body: "A hoodie, tee, crewneck, long sleeve, tote or cap, in the colorway the line deserves.",
  },
  {
    icon: Printer,
    title: "We print it to order.",
    body: "Nothing is printed until somebody wants it. Yours is pressed, packed and on its way in three days.",
  },
  {
    icon: Wallet,
    title: "The writer gets paid.",
    body: "30% of every sale goes to the artist, paid out monthly. In money, not exposure.",
  },
];

const VALUES = [
  {
    icon: Printer,
    title: "Printed to order",
    body: "No warehouse of guesses. Every piece is printed after it's ordered, so there's no deadstock to burn or bury.",
  },
  {
    icon: Leaf,
    title: "Organic cotton",
    body: "Heavyweight organic cotton blanks, 240 to 450 gsm, garment dyed so the color settles into the cloth.",
  },
  {
    icon: Package,
    title: "Plastic-free shipping",
    body: "Every order ships without plastic: no poly bags, no bubble wrap. Paper outside, cotton inside.",
  },
  {
    icon: Droplets,
    title: "Soft-hand inks",
    body: "Water-based prints by default, so a line fades like a favorite record instead of peeling like a sticker.",
  },
];

export default function AboutPage() {
  const example = getProduct("no-skips-hoodie");
  const writer = example ? CREATOR_BY_HANDLE[example.creator] : undefined;
  const payout = example ? Math.round(example.price * ARTIST_SHARE * 100) / 100 : 0;
  const artists = CREATORS.filter((c) => c.avatar);

  return (
    <>
      {/* Hero */}
      <section className="container-page pb-16 pt-10 md:pb-20 md:pt-14">
        <Eyebrow dot className="text-smoke">
          Our story
        </Eyebrow>
        <h1 className="display mt-6 max-w-6xl text-[clamp(3.4rem,9vw,9rem)]">
          Every song starts{" "}
          <span className="whitespace-nowrap">
            as <span className="serif-italic font-normal">a line.</span>
          </span>
        </h1>
        <div className="mt-10 grid gap-6 md:mt-14 lg:grid-cols-12">
          <p className="text-xl leading-snug md:text-2xl lg:col-span-6">
            Lyricshop is lyrics plus a shop: streetwear built from the lines independent songwriters write.
          </p>
          <p className="text-lg text-smoke lg:col-span-5 lg:col-start-8">
            They bring the words. We print them to order on heavyweight organic cotton. They keep 30% of every sale. That&apos;s the
            whole idea, and we think it&apos;s a good one.
          </p>
        </div>
      </section>

      {/* The name */}
      <section className="container-page" aria-labelledby="the-name">
        <h2 id="the-name" className="sr-only">
          Where the name comes from
        </h2>
        <div className="rounded-[32px] bg-paper px-6 py-14 md:px-12 md:py-20">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:gap-x-10">
            <span className="serif-italic text-[clamp(3.2rem,8vw,7.5rem)] leading-none">lyric</span>
            <span className="font-mono text-2xl text-smoke md:text-4xl" aria-hidden>
              +
            </span>
            <span className="display text-[clamp(3.2rem,8vw,7.5rem)]">shop</span>
            <span className="font-mono text-2xl text-smoke md:text-4xl" aria-hidden>
              =
            </span>
            <Wordmark className="h-[clamp(3rem,7.4vw,7rem)] w-auto" />
          </div>
          <dl className="mx-auto mt-14 grid max-w-4xl gap-8 border-t border-ink/10 pt-10 md:grid-cols-2 md:gap-14">
            <div>
              <dt className="flex items-baseline gap-3">
                <span className="serif-italic text-3xl">lyric</span>
                <span className="font-mono text-xs text-smoke">noun</span>
              </dt>
              <dd className="mt-3 text-smoke">
                The words of a song. Also: the line you catch yourself humming on the bus, three days after you first heard it.
              </dd>
            </div>
            <div>
              <dt className="flex items-baseline gap-3">
                <span className="display text-3xl">shop</span>
                <span className="font-mono text-xs text-smoke">noun</span>
              </dt>
              <dd className="mt-3 text-smoke">
                A place to find things worth keeping. Ours is stocked by the people who wrote what&apos;s printed on the shelves.
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Why we started */}
      <section className="container-page grid gap-12 py-24 md:py-32 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Eyebrow className="text-smoke">Why we started</Eyebrow>
          <p className="display mt-5 text-[clamp(2.2rem,4.4vw,3.8rem)]">
            Good lines deserve <span className="serif-italic font-normal">more than one listen.</span>
          </p>
        </div>
        <div className="space-y-6 text-lg leading-relaxed lg:col-span-6 lg:col-start-7">
          <p>
            Songwriters fill notebooks, voice memos and the backs of setlists with lines that stop people in their tracks. Most of
            them get one listen, maybe a stream, and then they&apos;re gone.
          </p>
          <p className="text-smoke">
            We wanted somewhere a line could live longer: on the hoodie you wear to the show, on the tote that rides the train every
            morning, on the tee a stranger asks about in the line for coffee.
          </p>
          <p className="text-smoke">
            And we wanted the person who wrote it to be named, and to be paid. Every piece credits its writer, and every sale sends
            them a share.
          </p>
          <p className="serif-italic pt-2 text-3xl">So: lyrics, and a shop.</p>
        </div>
      </section>

      {/* Store */}
      <section className="relative isolate overflow-hidden bg-ink text-bone">
        <div className="relative h-[82vh] min-h-[560px] w-full">
          <Image
            src="/images/store-interior.jpg"
            alt="A shop floor with hoodies on the walls, record crates on wooden tables and a red lyricshop neon sign on the back wall"
            fill
            sizes="100vw"
            className="-z-10 object-cover object-[68%_50%]"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/50 to-ink/10 md:bg-gradient-to-r md:from-ink md:via-ink/55 md:to-transparent" />
          <div className="container-page flex h-full flex-col justify-end pb-14 md:justify-center md:pb-0">
            <Eyebrow className="text-bone/60">Why a shop</Eyebrow>
            <h2 className="display mt-5 max-w-2xl text-[clamp(2.8rem,6.4vw,6.2rem)]">
              Record stores sell the songs. <span className="serif-italic font-normal text-red">We sell the lines.</span>
            </h2>
            <p className="mt-6 max-w-md text-lg text-bone/75">
              Between the crates and the merch table is the part people actually quote to each other. That&apos;s the part we put on
              a hoodie.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-paper py-24 md:py-32">
        <div className="container-page">
          <SectionHeading
            eyebrow="How the marketplace works"
            title={
              <>
                From notebook <span className="serif-italic font-normal">to front row.</span>
              </>
            }
            aside={
              <p className="max-w-sm text-smoke">
                Four tracks, no filler. Every piece on Lyricshop goes from the writer&apos;s page to your wardrobe the same way.
              </p>
            }
            className="mb-12"
          />
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="flex flex-col rounded-[28px] bg-bone p-6 md:p-7">
                <div className="flex items-center justify-between">
                  <span className="eyebrow text-smoke">Track {String(i + 1).padStart(2, "0")}</span>
                  <span className="grid size-11 place-items-center rounded-full bg-ink text-bone">
                    <Icon className="size-5" aria-hidden />
                  </span>
                </div>
                <p className="display mt-14 text-[1.9rem]">{title}</p>
                <p className="mt-3 text-smoke">{body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-4 flex flex-col gap-6 rounded-[28px] bg-ink p-7 text-bone md:flex-row md:items-center md:justify-between md:p-10 lg:mt-5">
            <div>
              <p className="display text-[clamp(1.8rem,3vw,2.6rem)]">
                Got a line of <span className="serif-italic font-normal text-red">your own?</span>
              </p>
              <p className="mt-2 max-w-xl text-bone/65">
                The Studio puts your words on any of our blanks. Same cloth, same press, same three days.
              </p>
            </div>
            <ButtonLink href="/studio" variant="bone" size="lg" className="self-start md:self-auto">
              Open the Studio <ArrowRight className="size-4" />
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* Impact */}
      <section id="impact" className="grain scroll-mt-6 bg-ink py-24 text-bone md:py-32">
        <div className="container-page relative z-10 grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-6">
            <Eyebrow className="text-bone/50">Artist payouts</Eyebrow>
            <h2 className="display mt-5 text-[clamp(2.8rem,6vw,5.6rem)]">
              Artists keep <span className="text-red">30%</span> <span className="serif-italic font-normal">of every sale.</span>
            </h2>
            <p className="mt-6 max-w-lg text-lg text-bone/70">
              Thirty percent of the price of every piece with their words on it, paid out monthly. The lines stay theirs: we license
              them for print and never buy them outright.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink href="/sell" variant="accent" size="lg">
                Sell your lyrics <ArrowRight className="size-4" />
              </ButtonLink>
              <ButtonLink href="/artists" variant="outline-bone" size="lg">
                Meet the artists
              </ButtonLink>
            </div>
          </div>

          {example && writer && (
            <div className="lg:col-span-6">
              <figure className="rounded-[28px] border border-bone/10 bg-bone/[0.04] p-6 md:p-8">
                <figcaption className="eyebrow text-bone/50">How one sale splits</figcaption>
                <Link href={`/product/${example.slug}`} className="group/ex mt-6 flex items-center gap-5">
                  <span className="size-24 shrink-0 rounded-2xl bg-[#e5ddcf] p-1.5">
                    <GarmentMockup
                      garment={example.garment}
                      color={colorFor(example.colors[0]).hex}
                      layers={example.design.front}
                      shadow={false}
                      className="h-full w-full"
                      title={`${example.title} mockup`}
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium group-hover/ex:underline group-hover/ex:underline-offset-4">{example.title}</span>
                    <span className="block text-sm text-bone/60">Written by {writer.name}</span>
                  </span>
                  <span className="font-mono text-lg tabular-nums">{formatPrice(example.price)}</span>
                </Link>
                <div className="mt-8 flex h-14 overflow-hidden rounded-2xl font-mono text-sm" aria-hidden>
                  <div className="flex items-center bg-red px-4 text-ink" style={{ width: `${ARTIST_SHARE * 100}%` }}>
                    30%
                  </div>
                  <div className="flex flex-1 items-center bg-bone/10 px-4 text-bone/60">70%</div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-6">
                  <div>
                    <p className="display text-[clamp(2.2rem,4vw,3.2rem)] text-red">{formatPrice(payout, { cents: true })}</p>
                    <p className="mt-1 text-sm text-bone/60">to {writer.name.split(" ")[0]}, who wrote it</p>
                  </div>
                  <div>
                    <p className="display text-[clamp(2.2rem,4vw,3.2rem)]">{formatPrice(example.price - payout, { cents: true })}</p>
                    <p className="mt-1 text-sm text-bone/60">covers the blank, the print, the shipping and the shop</p>
                  </div>
                </div>
                <p className="mt-6 border-t border-bone/10 pt-4 text-xs text-bone/40">Worked example at the list price of a catalog piece.</p>
              </figure>
            </div>
          )}
        </div>

        <div className="container-page relative z-10 mt-16 flex flex-col gap-5 border-t border-bone/10 pt-10 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center">
            {artists.map((a, i) => (
              <Link
                key={a.handle}
                href={`/artists/${a.handle}`}
                className="relative -ml-3 size-14 overflow-hidden rounded-full ring-4 ring-ink transition hover:-translate-y-1 first:ml-0"
                style={{ zIndex: artists.length - i }}
                aria-label={a.name}
              >
                <Image src={a.avatar!} alt="" fill sizes="56px" className="object-cover" />
              </Link>
            ))}
          </div>
          <p className="max-w-md text-bone/60 md:text-right">
            {artists.map((a) => a.name.split(" ")[0]).join(", ").replace(/, ([^,]*)$/, " and $1")}: every artist on the shop is
            paid the same way.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="container-page py-24 md:py-32">
        <SectionHeading
          eyebrow="How it's made"
          title={
            <>
              Made like we <span className="serif-italic font-normal">mean it.</span>
            </>
          }
          aside={<p className="max-w-sm text-smoke">Printed to order, cut from organic cotton, shipped without plastic.</p>}
          className="mb-12"
        />
        <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
          <figure className="relative isolate min-h-[420px] overflow-hidden rounded-[28px] lg:col-span-5">
            <Image
              src="/images/studio-flatlay.jpg"
              alt="A bone tee on a workbench under a screen printing frame that reads Wear Your Words, with ink pots and a notebook"
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="-z-10 object-cover"
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/75 via-transparent to-transparent" />
            <figcaption className="absolute inset-x-6 bottom-6 text-bone">
              <p className="eyebrow text-bone/60">On the press</p>
              <p className="serif-italic mt-1 text-2xl">One piece at a time, after you order it.</p>
            </figcaption>
          </figure>
          <ul className="grid gap-4 sm:grid-cols-2 lg:col-span-7 lg:gap-5">
            {VALUES.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex flex-col rounded-[28px] bg-paper p-6 md:p-8">
                <Icon className="size-6 text-red" aria-hidden />
                <p className="display mt-10 text-[1.9rem]">{title}</p>
                <p className="mt-3 text-smoke">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTAs */}
      <section className="container-page pb-24 md:pb-32">
        <div className="border-t border-ink/10 pt-16 md:pt-24">
          <h2 className="display text-[clamp(2.4rem,5.6vw,5rem)]">
            Find your line. <br className="max-sm:hidden" />
            <span className="serif-italic font-normal">Or write one.</span>
          </h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3 lg:gap-5">
          <CtaCard
            href="/shop"
            eyebrow="Shop"
            title="Shop the lines"
            body="Hoodies, tees and more, each one written by an independent artist."
            image="/images/lookbook-say-it-back.jpg"
            alt="Someone in a red Say It Back hoodie browsing records"
          />
          <Link href="/studio" className="group/cta relative flex min-h-[460px] flex-col overflow-hidden rounded-[28px] bg-ink p-6 text-bone md:p-8">
            <span className="eyebrow text-bone/50">Studio</span>
            <div className="flex flex-1 items-center justify-center py-6">
              <GarmentMockup
                garment="tee"
                color="#5A1D29"
                layers={[
                  text({ id: "about-cta-1", text: "your words\nhere", font: "yellowtail", size: 0.3, y: 0.36, color: "#F3EEE5", lineHeight: 0.9 }),
                ]}
                shadow={false}
                className="h-auto w-[78%] transition duration-700 ease-[var(--ease-out-expo)] group-hover/cta:scale-[1.04] group-hover/cta:-rotate-2"
                title="A burgundy tee with your words here printed across the chest"
              />
            </div>
            <CtaFooter title="Design your own" body="Your words, 22 typefaces, any blank. Printed in three days." />
          </Link>
          <CtaCard
            href="/sell"
            eyebrow="Sell"
            title="Sell your lyrics"
            body="Open a shop, put your lines on cloth, keep 30% of every sale."
            image="/images/sell-packing.jpg"
            alt="A musician at home folding hoodies into shipping boxes"
          />
        </div>
      </section>
    </>
  );
}

function CtaFooter({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="display text-[2.2rem]">{title}</p>
        <p className="mt-1 max-w-xs text-bone/70">{body}</p>
      </div>
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-bone text-ink transition group-hover/cta:bg-red">
        <ArrowUpRight className="size-5 transition group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" aria-hidden />
      </span>
    </div>
  );
}

function CtaCard({
  href,
  eyebrow,
  title,
  body,
  image,
  alt,
}: {
  href: string;
  eyebrow: string;
  title: string;
  body: string;
  image: string;
  alt: string;
}) {
  return (
    <Link href={href} className="group/cta relative isolate flex min-h-[460px] flex-col justify-between overflow-hidden rounded-[28px] p-6 text-bone md:p-8">
      <Image
        src={image}
        alt={alt}
        fill
        sizes="(min-width: 768px) 33vw, 100vw"
        className="-z-10 object-cover transition duration-[1.2s] ease-[var(--ease-out-expo)] group-hover/cta:scale-105"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/90 via-ink/30 to-ink/20" />
      <span className="eyebrow text-bone/70">{eyebrow}</span>
      <CtaFooter title={title} body={body} />
    </Link>
  );
}
