import { ArrowRight, Ban, Box, FileWarning, Package, RotateCcw, Shirt, Sparkles, Thermometer, Truck, WashingMachine, Wind } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { GarmentMockup } from "@/components/garment/garment-mockup";
import { ContactForm } from "@/components/info/contact-form";
import { Faq } from "@/components/info/faq";
import { SectionNav } from "@/components/info/section-nav";
import { SizeGuide } from "@/components/info/size-guide";
import { Eyebrow } from "@/components/ui/bits";
import { cn } from "@/lib/cn";
import { GARMENTS } from "@/lib/garments";
import { FREE_SHIPPING_THRESHOLD, PROMOS, SHIPPING_METHODS, formatPrice } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Help",
  description:
    "Shipping, returns, sizing and care for Lyricshop orders, answers to the questions we hear most, and a way to reach a real person.",
};

const NAV = [
  { id: "shipping", label: "Shipping" },
  { id: "returns", label: "Returns & exchanges" },
  { id: "sizing", label: "Size guide" },
  { id: "care", label: "Care" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contact" },
  { id: "privacy", label: "Privacy" },
  { id: "terms", label: "Terms" },
];

const WELCOME = PROMOS.FIRSTVERSE;
const free = formatPrice(FREE_SHIPPING_THRESHOLD);
const standard = SHIPPING_METHODS.find((m) => m.id === "standard")!;
const express = SHIPPING_METHODS.find((m) => m.id === "express")!;

type Qa = { q: string; a: string; link?: { href: string; label: string } };

const FAQS: Qa[] = [
  {
    q: "Where do the lyrics come from?",
    a: "Every line in the shop was written by the artist who sells it. They upload their own words, license them to us for print, and get credited on every piece.",
  },
  {
    q: "Can I print lyrics from a song I love in the Studio?",
    a: "Only if you wrote them or have permission. Lyrics belong to the people who wrote them, so the Studio is for your own words. We decline orders that use someone else's lyrics without the rights.",
  },
  {
    q: "How much does the artist earn?",
    a: "30% of every sale, paid out monthly.",
    link: { href: "/about#impact", label: "See how one sale splits" },
  },
  {
    q: "How long until my order arrives?",
    a: `Every piece is printed to order and leaves us within three days. ${standard.label} delivery then takes ${standard.detail}, ${express.label} ${express.detail}.`,
  },
  {
    q: "Can I change or cancel my order?",
    a: "Write to us as soon as you can. Once a piece is printed we can't change it, but if it hasn't gone to press yet we'll do our best.",
  },
  {
    q: "Will the print crack or fade?",
    a: "Water-based prints soften and fade gently with wear, a bit like a well-loved record sleeve. Wash cold and inside out and they'll age slowly.",
  },
  {
    q: "Is the packaging really plastic-free?",
    a: "Yes. Orders ship without poly bags or bubble wrap.",
  },
  {
    q: "Do you have a discount code?",
    a: `New here? ${WELCOME.code} takes ${WELCOME.percent}% off your first order.`,
  },
  {
    q: "How do I sell my lyrics on Lyricshop?",
    a: "Open an artist shop, upload your lines and choose your blanks and colorways. You keep 30% of every sale.",
    link: { href: "/sell", label: "Start selling" },
  },
  {
    q: "Do sold-out pieces come back?",
    a: "Most pieces are printed to order, so they never really sell out. Limited runs are the exception: when they're gone, they live in the archive.",
  },
];

const CARE = [
  { icon: WashingMachine, title: "Wash cold, inside out", body: "30 °C / 86 °F at most, with similar colors." },
  { icon: Ban, title: "Skip bleach and softener", body: "Both break down cotton fibers and dull the print." },
  { icon: Wind, title: "Hang to dry", body: "Or tumble on low. High heat is what cracks a print early." },
  { icon: Thermometer, title: "Iron inside out", body: "Never directly on the print, and never on raised puff ink." },
  { icon: Shirt, title: "Fold your fleece", body: "Hangers stretch the shoulders of a heavyweight hoodie. Fold it instead." },
  { icon: Sparkles, title: "Let it age", body: "Prints soften with every wash. A little fade is character." },
];

export default function HelpPage() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, "\\u003c") }} />

      {/* Hero */}
      <section className="container-page grid gap-10 pb-16 pt-10 md:pb-20 md:pt-14 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <Eyebrow dot className="text-smoke">
            Help & info
          </Eyebrow>
          <h1 className="display mt-6 text-[clamp(3.4rem,8.6vw,8.5rem)]">
            Questions, <span className="serif-italic font-normal">answered.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg text-smoke">
            Shipping, returns, sizing and care, plus a real person on the other end of the contact form.
          </p>
        </div>
        <dl className="grid grid-cols-2 overflow-hidden rounded-[28px] bg-ink text-bone lg:col-span-5">
          {[
            ["3 days", "from order to the courier"],
            [`Over ${free}`, "ships free, standard"],
            ["30 days", "to return catalog pieces"],
            ["Free", "size exchanges"],
          ].map(([k, v], i) => (
            <div key={v} className={cn("p-6 md:p-7", i % 2 === 1 && "border-l border-bone/10", i > 1 && "border-t border-bone/10")}>
              <dt className="display text-[clamp(1.9rem,3vw,2.6rem)]">{k}</dt>
              <dd className="mt-1 text-sm text-bone/60">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="container-page grid gap-10 pb-24 md:pb-32 lg:grid-cols-12 lg:gap-12">
        <aside className="min-w-0 lg:col-span-3">
          <SectionNav links={NAV} />
        </aside>

        <div className="min-w-0 space-y-24 md:space-y-32 lg:col-span-9">
          {/* Shipping */}
          <InfoSection
            id="shipping"
            n={1}
            title="Shipping"
            lead="Everything is printed to order. Your piece goes to press after you check out and leaves us within three days. From there, it's up to the courier."
          >
            <ol className="grid gap-px overflow-hidden rounded-[24px] bg-ink/10 sm:grid-cols-4">
              {[
                { icon: Box, k: "Day 0", v: "You order" },
                { icon: Shirt, k: "Days 1–3", v: "We print & pack" },
                { icon: Truck, k: standard.detail, v: "On its way" },
                { icon: Package, k: "Done", v: "At your door" },
              ].map(({ icon: Icon, k, v }, i) => (
                <li key={v} className="flex items-center gap-4 bg-paper p-5 sm:flex-col sm:items-start">
                  <span className={cn("grid size-10 shrink-0 place-items-center rounded-full", i === 3 ? "bg-red text-ink" : "bg-bone")}>
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-wider text-smoke">{k}</p>
                    <p className="mt-0.5 font-medium">{v}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-left">
                <caption className="sr-only">Shipping methods</caption>
                <thead>
                  <tr className="border-b border-ink/15 text-sm">
                    <th scope="col" className="py-3 pr-4 font-medium">
                      Method
                    </th>
                    <th scope="col" className="py-3 pr-4 font-medium">
                      Delivery, after it ships
                    </th>
                    <th scope="col" className="py-3 font-medium">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {SHIPPING_METHODS.map((m) => (
                    <tr key={m.id} className="border-b border-ink/8">
                      <th scope="row" className="py-4 pr-4 font-medium">
                        {m.label}
                      </th>
                      <td className="py-4 pr-4 text-smoke">{m.detail}</td>
                      <td className="py-4 font-mono tabular-nums">
                        {formatPrice(m.price)}
                        {m.id === "standard" && <span className="ml-2 font-sans text-sm text-smoke">free over {free}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="mt-8 grid gap-3 text-smoke sm:grid-cols-2">
              <Bullet>You&apos;ll get a tracking link by email as soon as your order ships.</Bullet>
              <Bullet>Orders with several pieces ship together, once everything is printed.</Bullet>
              <Bullet>Delivery times count business days from the day your order ships.</Bullet>
              <Bullet>Every order ships plastic-free: no poly bags, no bubble wrap.</Bullet>
            </ul>
          </InfoSection>

          {/* Returns */}
          <InfoSection
            id="returns"
            n={2}
            title="Returns & exchanges"
            lead="Changed your mind? You have 30 days from delivery to send back catalog pieces, unworn and unwashed. Size exchanges are free."
          >
            <ol className="grid gap-4 sm:grid-cols-3">
              {[
                { t: "Find your order", b: <>Open <Link href="/account">Orders in your account</Link> and pick the piece.</> },
                { t: "Refund or new size", b: "Choose your money back or a free exchange for another size." },
                { t: "Pack it, drop it off", b: "Use the mailer it came in. We'll email you when it lands." },
              ].map((s, i) => (
                <li key={s.t} className="rounded-[24px] border border-ink/10 p-6 [&_a]:underline [&_a]:decoration-ink/30 [&_a]:underline-offset-4">
                  <span className="grid size-9 place-items-center rounded-full bg-ink font-mono text-sm text-bone">{i + 1}</span>
                  <p className="mt-6 font-medium">{s.t}</p>
                  <p className="mt-1.5 text-sm text-smoke">{s.b}</p>
                </li>
              ))}
            </ol>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] bg-paper p-6 md:p-7">
                <div className="flex items-center gap-3">
                  <RotateCcw className="size-5 text-red" aria-hidden />
                  <p className="font-medium">Catalog pieces</p>
                </div>
                <p className="mt-3 text-smoke">
                  Returnable within 30 days of delivery, unworn and unwashed. Refunds go back to your original payment method once the
                  piece reaches us and is checked.
                </p>
              </div>
              <div className="rounded-[24px] bg-paper p-6 md:p-7">
                <div className="flex items-center gap-3">
                  <Sparkles className="size-5 text-red" aria-hidden />
                  <p className="font-medium">Studio designs</p>
                </div>
                <p className="mt-3 text-smoke">
                  Made just for you, so we can&apos;t take them back for a change of mind. If the print or the garment is faulty, tell us
                  within 30 days and we&apos;ll reprint it free.
                </p>
              </div>
            </div>
            <p className="mt-6 text-smoke">
              Something arrived damaged or misprinted? Send a photo through the <a href="#contact" className="text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink">contact form</a> and we&apos;ll make it right.
            </p>
          </InfoSection>

          {/* Sizing */}
          <InfoSection
            id="sizing"
            n={3}
            title="Size guide"
            lead="Measured flat, in inches or centimeters. Our blanks run roomy, so read the fit notes before you size up."
          >
            <SizeGuide />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {(["cap", "tote"] as const).map((id) => {
                const g = GARMENTS[id];
                return (
                  <div key={id} className="flex items-center gap-5 rounded-[24px] border border-ink/10 p-4 pr-6">
                    <span className="size-24 shrink-0 rounded-2xl bg-paper p-2">
                      <GarmentMockup garment={id} color={id === "cap" ? "#161515" : "#E6D9BF"} shadow={false} className="h-full w-full" title={`${g.name} mockup`} />
                    </span>
                    <div>
                      <p className="font-medium">
                        {g.name} <span className="ml-1 rounded-full bg-tape px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider">One size</span>
                      </p>
                      <p className="mt-1.5 text-sm text-smoke">{g.fit}</p>
                      <p className="mt-1 text-sm text-smoke">{g.fabric}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-6 text-smoke">
              <span className="font-medium text-ink">Between sizes?</span> Lay your favorite tee or hoodie flat, measure armpit to armpit
              and shoulder to hem, then pick the closest row.
            </p>
          </InfoSection>

          {/* Care */}
          <InfoSection id="care" n={4} title="Care" lead="Treat it like a record you love: gently, and often.">
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {CARE.map(({ icon: Icon, title, body }) => (
                <li key={title} className="rounded-[24px] bg-paper p-6">
                  <Icon className="size-5 text-red" aria-hidden />
                  <p className="mt-6 font-medium">{title}</p>
                  <p className="mt-1.5 text-sm text-smoke">{body}</p>
                </li>
              ))}
            </ul>
          </InfoSection>

          {/* FAQ */}
          <InfoSection id="faq" n={5} title="FAQ" lead="The questions we hear most, answered once and for all.">
            <Faq
              items={FAQS.map((f) => ({
                q: f.q,
                a: (
                  <>
                    <p>{f.a}</p>
                    {f.link && (
                      <p className="mt-3">
                        <Link href={f.link.href}>{f.link.label}</Link>
                      </p>
                    )}
                  </>
                ),
              }))}
            />
          </InfoSection>

          {/* Contact */}
          <InfoSection
            id="contact"
            n={6}
            title="Contact"
            lead="Order question, sizing panic, a line you want to sell? Write to us and a real person will get back to you."
          >
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
              <ContactForm />
              <ul className="grid content-start gap-4 sm:grid-cols-3 xl:grid-cols-1">
                {[
                  { t: "About an order?", b: "Add your order number so we can find it fast." },
                  { t: "Sizing help?", b: "Tell us the piece and the size you usually wear." },
                  {
                    t: "Want to sell?",
                    b: (
                      <>
                        Start at <Link href="/sell">Sell with us</Link>. You keep 30% of every sale.
                      </>
                    ),
                  },
                ].map((tip) => (
                  <li key={tip.t} className="rounded-[24px] border border-ink/10 p-5 [&_a]:text-ink [&_a]:underline [&_a]:decoration-ink/30 [&_a]:underline-offset-4">
                    <p className="font-medium">{tip.t}</p>
                    <p className="mt-1.5 text-sm text-smoke">{tip.b}</p>
                  </li>
                ))}
              </ul>
            </div>
          </InfoSection>

          {/* Privacy */}
          <InfoSection id="privacy" n={7} title="Privacy policy" lead="How we handle the information you share with us.">
            <TemplateNotice />
            <Legal>
              <h3>Who we are</h3>
              <p>
                <Ph>Company legal name</Ph> (&ldquo;Lyricshop&rdquo;, &ldquo;we&rdquo;) runs this website and online shop. Questions
                about this policy can go to <Ph>privacy contact email</Ph> or <Ph>postal address</Ph>.
              </p>
              <h3>What we collect</h3>
              <p>
                When you order: your name, email, shipping and billing address, and what you bought. Payments are handled by{" "}
                <Ph>payment processor</Ph>; we never see or store full card numbers. When you write to us: whatever you include in your
                message. When you browse: <Ph>describe analytics or cookies, if any</Ph>.
              </p>
              <h3>What stays on your device</h3>
              <p>
                Your bag and wishlist are saved in your browser&apos;s local storage so they&apos;re still there when you come back.
                Clearing your browser data removes them.
              </p>
              <h3>How we use it</h3>
              <p>
                To print and ship your order, answer your messages, pay artists their share, prevent fraud and, if you opt in, tell you
                about new drops. <Ph>Add any other purposes</Ph>.
              </p>
              <h3>Who we share it with</h3>
              <p>
                Only the partners who help us run the shop: <Ph>printing partner</Ph>, <Ph>shipping carriers</Ph>,{" "}
                <Ph>payment processor</Ph> and <Ph>email provider</Ph>. We don&apos;t sell your personal information.
              </p>
              <h3>Your choices</h3>
              <p>
                You can ask to see, correct or delete your data, and unsubscribe from emails at any time.{" "}
                <Ph>List the rights that apply where you operate, e.g. GDPR or CCPA</Ph>.
              </p>
              <p className="text-sm">
                Last updated: <Ph>date</Ph>.
              </p>
            </Legal>
          </InfoSection>

          {/* Terms */}
          <InfoSection id="terms" n={8} title="Terms of service" lead="The ground rules for buying, designing and selling on Lyricshop.">
            <TemplateNotice />
            <Legal>
              <h3>Using Lyricshop</h3>
              <p>
                By using this site or placing an order you agree to these terms. The shop is operated by <Ph>Company legal name</Ph>,{" "}
                <Ph>registered address</Ph>.
              </p>
              <h3>Orders and pricing</h3>
              <p>
                Prices are shown in US dollars. Taxes and shipping are added at checkout. If a price is listed in error we may cancel the
                order and refund you in full.
              </p>
              <h3>Printed to order</h3>
              <p>
                Pieces are made after you order them. Delivery times are estimates, not guarantees. Returns are covered in{" "}
                <a href="#returns">Returns &amp; exchanges</a>.
              </p>
              <h3>Your Studio designs</h3>
              <p>
                You confirm that you own, or have permission to use, everything you upload: words, images and graphics. We may decline
                designs that infringe someone else&apos;s rights or that are hateful or unlawful.
              </p>
              <h3>Artist shops</h3>
              <p>
                Lines sold in artist shops belong to the artists who wrote them and are licensed to us for printing. Selling on Lyricshop
                is covered by the <Ph>seller agreement</Ph>.
              </p>
              <h3>Liability and governing law</h3>
              <p>
                <Ph>Limitation of liability, to be written with legal advice</Ph>. These terms are governed by the laws of{" "}
                <Ph>jurisdiction</Ph>.
              </p>
              <p className="text-sm">
                Last updated: <Ph>date</Ph>.
              </p>
            </Legal>
          </InfoSection>

          <div className="flex flex-col gap-6 rounded-[28px] bg-ink p-7 text-bone md:flex-row md:items-center md:justify-between md:p-10">
            <p className="display text-[clamp(1.8rem,3vw,2.6rem)]">
              Still stuck? <span className="serif-italic font-normal text-red">Say it back to us.</span>
            </p>
            <a
              href="#contact"
              className="inline-flex h-13 items-center gap-2 self-start rounded-full bg-bone px-7 font-medium text-ink transition hover:bg-white md:self-auto"
            >
              Write to us <ArrowRight className="size-4" aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

function InfoSection({ id, n, title, lead, children }: { id: string; n: number; title: string; lead: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-10">
      <p className="eyebrow text-smoke">{String(n).padStart(2, "0")}</p>
      <h2 id={`${id}-title`} className="display mt-3 text-[clamp(2.2rem,4.4vw,3.8rem)]">
        {title}
      </h2>
      <p className="mt-4 max-w-2xl text-lg text-smoke">{lead}</p>
      <div className="mt-10">{children}</div>
    </section>
  );
}

function Bullet({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-red" aria-hidden />
      <span>{children}</span>
    </li>
  );
}

function TemplateNotice() {
  return (
    <div className="mb-8 flex gap-4 rounded-[20px] bg-tape p-5 text-ink md:p-6">
      <FileWarning className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div>
        <p className="font-medium">Template text: replace before launch.</p>
        <p className="mt-1 text-sm text-ink/75">
          This section is placeholder copy for the store owner to replace with a policy reviewed by a lawyer. Highlighted
          [brackets] mark details to fill in. It is not legal advice.
        </p>
      </div>
    </div>
  );
}

/** A placeholder the store owner needs to fill in. */
function Ph({ children }: { children: ReactNode }) {
  return <span className="marker rounded-sm px-0.5 font-mono text-[0.88em] text-ink">[{children}]</span>;
}

function Legal({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-3xl rounded-[24px] border border-dashed border-ink/20 p-6 text-smoke md:p-8 [&_a]:text-ink [&_a]:underline [&_a]:decoration-ink/30 [&_a]:underline-offset-4 [&_h3]:mt-8 [&_h3]:font-medium [&_h3]:text-ink [&_h3:first-child]:mt-0 [&_p]:mt-2 [&_p]:leading-relaxed">
      {children}
    </div>
  );
}
