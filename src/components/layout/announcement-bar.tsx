import { Marquee } from "@/components/ui/marquee";

const MESSAGES = [
  "Free shipping on orders over $100",
  "Artists keep 30% of every sale",
  "New drop: Night Shift by Rumi Sato",
  "Design your own in the Studio, printed in 3 days",
  "Use code FIRSTVERSE for 15% off your first order",
  "Plastic-free packaging, always",
];

export function AnnouncementBar() {
  return (
    <div className="relative z-50 bg-ink text-bone">
      <Marquee duration={50} className="h-9">
        {MESSAGES.map((m) => (
          <span key={m} className="eyebrow flex items-center gap-6 px-6 !text-[11px] text-bone/80">
            {m}
            <span className="size-1 rounded-full bg-red" />
          </span>
        ))}
      </Marquee>
    </div>
  );
}
