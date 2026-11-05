"use client";

import { useState, type KeyboardEvent } from "react";
import { GarmentMockup } from "@/components/garment/garment-mockup";
import { cn } from "@/lib/cn";
import { GARMENTS, type GarmentId } from "@/lib/garments";
import { SIZE_CHARTS, toCm } from "@/lib/sizes";

type Unit = "in" | "cm";
type Measured = "hoodie" | "tee" | "crewneck" | "longsleeve";

const TABS: { id: Measured; label: string }[] = [
  { id: "hoodie", label: "Hoodie" },
  { id: "tee", label: "Tee" },
  { id: "crewneck", label: "Crewneck" },
  { id: "longsleeve", label: "Long sleeve" },
];

// Where the measuring tape goes on each blank, in mockup coordinates (1000 × 1000).
type Sleeve = { d: string; label: [number, number] };
const TAPE: Record<Measured, { chest: [number, number, number]; length: [number, number, number]; sleeve?: Sleeve; color: string }> = {
  tee: { chest: [263, 737, 380], length: [404, 102, 942], color: "#EFE8DB" },
  longsleeve: {
    chest: [263, 737, 380],
    length: [404, 102, 942],
    sleeve: { d: "M500 104L762 140L884 858", label: [833, 560] },
    color: "#EFE8DB",
  },
  hoodie: {
    chest: [252, 748, 440],
    length: [338, 186, 946],
    sleeve: { d: "M500 186L795 226L868 848", label: [834, 560] },
    color: "#B9B7B2",
  },
  crewneck: {
    chest: [252, 748, 440],
    length: [410, 124, 946],
    sleeve: { d: "M500 112L795 214L868 848", label: [835, 560] },
    color: "#D5C4A7",
  },
};

const fmtIn = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

function Tape({ d, letter, at }: { d: string; letter: string; at: [number, number] }) {
  return (
    <g>
      <path d={d} fill="none" stroke="#FF4A1C" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 12" />
      <path d={d} fill="none" stroke="#FF4A1C" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={at[0]} cy={at[1]} r={34} fill="#0F0E0D" />
      <text
        x={at[0]}
        y={at[1] + 12.5}
        textAnchor="middle"
        fontSize={36}
        fontWeight={700}
        fill="#F3EEE5"
        style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace" }}
      >
        {letter}
      </text>
    </g>
  );
}

function Measurements({ id }: { id: Measured }) {
  const t = TAPE[id];
  const [cx0, cx1, cy] = t.chest;
  const [lx, ly0, ly1] = t.length;
  return (
    <g>
      <Tape d={`M${cx0} ${cy}H${cx1}M${cx0} ${cy - 16}V${cy + 16}M${cx1} ${cy - 16}V${cy + 16}`} letter="A" at={[580, cy]} />
      <Tape d={`M${lx} ${ly0}V${ly1}M${lx - 16} ${ly0}H${lx + 16}M${lx - 16} ${ly1}H${lx + 16}`} letter="B" at={[lx, 700]} />
      {t.sleeve && <Tape d={t.sleeve.d} letter="C" at={t.sleeve.label} />}
    </g>
  );
}

export function SizeGuide() {
  const [tab, setTab] = useState<Measured>("hoodie");
  const [unit, setUnit] = useState<Unit>("in");
  const rows = SIZE_CHARTS[tab] ?? [];
  const hasSleeve = rows.some((r) => r.sleeve !== undefined);
  const g = GARMENTS[tab];
  const v = (n: number | undefined) => (n === undefined ? "–" : unit === "in" ? fmtIn(n) : String(toCm(n)));

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = TABS[(i + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length];
    setTab(next.id);
    document.getElementById(`size-tab-${next.id}`)?.focus();
  };

  return (
    <div className="overflow-hidden rounded-[28px] bg-paper">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 p-3 pl-3 md:p-4">
        <div role="tablist" aria-label="Garment" className="no-scrollbar flex gap-1 overflow-x-auto">
          {TABS.map((t, i) => (
            <button
              key={t.id}
              id={`size-tab-${t.id}`}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              aria-controls="size-panel"
              tabIndex={tab === t.id ? 0 : -1}
              onClick={() => setTab(t.id)}
              onKeyDown={(e) => onTabKey(e, i)}
              className={cn(
                "h-10 shrink-0 rounded-full px-4 text-sm transition-colors",
                tab === t.id ? "bg-ink text-bone" : "hover:bg-ink/6",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div role="radiogroup" aria-label="Units" className="flex rounded-full bg-bone p-1 ring-1 ring-ink/10">
          {(["in", "cm"] as Unit[]).map((u) => (
            <button
              key={u}
              type="button"
              role="radio"
              aria-checked={unit === u}
              onClick={() => setUnit(u)}
              className={cn(
                "h-8 rounded-full px-4 font-mono text-xs uppercase tracking-wider transition-colors",
                unit === u ? "bg-red text-ink" : "text-smoke hover:text-ink",
              )}
            >
              {u === "in" ? "Inches" : "cm"}
            </button>
          ))}
        </div>
      </div>

      <div id="size-panel" role="tabpanel" aria-labelledby={`size-tab-${tab}`} className="grid gap-8 p-5 md:grid-cols-[minmax(0,1fr)_280px] md:p-8 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-left">
              <caption className="sr-only">
                {g.name} measurements in {unit === "in" ? "inches" : "centimeters"}
              </caption>
              <thead>
                <tr className="border-b border-ink/15 text-sm">
                  <th scope="col" className="py-3 pr-4 font-medium">
                    Size
                  </th>
                  <th scope="col" className="py-3 pr-4 font-medium">
                    <span className="mr-2 inline-grid size-5 place-items-center rounded-full bg-ink font-mono text-[10px] text-bone">A</span>
                    Chest
                  </th>
                  <th scope="col" className="py-3 pr-4 font-medium">
                    <span className="mr-2 inline-grid size-5 place-items-center rounded-full bg-ink font-mono text-[10px] text-bone">B</span>
                    Body length
                  </th>
                  {hasSleeve && (
                    <th scope="col" className="py-3 font-medium">
                      <span className="mr-2 inline-grid size-5 place-items-center rounded-full bg-ink font-mono text-[10px] text-bone">C</span>
                      Sleeve
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="font-mono tabular-nums">
                {rows.map((r) => (
                  <tr key={r.size} className="border-b border-ink/8 transition-colors last:border-0 hover:bg-bone/70">
                    <th scope="row" className="py-3.5 pr-4 font-sans font-medium">
                      {r.size}
                    </th>
                    <td className="py-3.5 pr-4">{v(r.chest)}</td>
                    <td className="py-3.5 pr-4">{v(r.length)}</td>
                    {hasSleeve && <td className="py-3.5">{v(r.sleeve)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="eyebrow text-smoke">Fit</dt>
              <dd className="mt-1.5">{g.fit}</dd>
            </div>
            <div>
              <dt className="eyebrow text-smoke">Cloth</dt>
              <dd className="mt-1.5">{g.fabric}</dd>
            </div>
          </dl>
        </div>

        <figure className="flex flex-col">
          <div className="rounded-[22px] bg-bone p-4">
            <GarmentMockup
              garment={tab as GarmentId}
              color={TAPE[tab].color}
              shadow={false}
              className="h-auto w-full"
              title={`How to measure the ${g.short.toLowerCase()}`}
              overlay={(pa) => (
                <g transform={`translate(${-pa.x} ${-pa.y})`}>
                  <Measurements id={tab} />
                </g>
              )}
            />
          </div>
          <figcaption className="mt-4 space-y-1.5 text-sm text-smoke">
            <p>
              <span className="font-mono text-ink">A</span> Chest: armpit to armpit, laid flat.
            </p>
            <p>
              <span className="font-mono text-ink">B</span> Length: from the top of the shoulder to the hem.
            </p>
            {hasSleeve && (
              <p>
                <span className="font-mono text-ink">C</span> Sleeve: from the center of the collar, over the shoulder, to the cuff.
              </p>
            )}
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
