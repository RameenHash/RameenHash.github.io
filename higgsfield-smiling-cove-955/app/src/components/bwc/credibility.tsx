import { useRef } from "react";
import { useInView, useReducedMotion } from "motion/react";
import NumberFlow from "@number-flow/react";
import { Reveal } from "./reveal";
import { ClientOnly } from "./client-only";

const STATS = [
  { value: 1992, label: "Serving California since", plain: true },
  { value: 10000, suffix: "+", label: "TMS treatments delivered each year" },
  { value: 3, label: "Offices across Northern California" },
];

function StatNumber({ value, suffix, plain }: { value: number; suffix?: string; plain?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const shown = reduce || inView ? value : 0;
  return (
    <span ref={ref} className="bwc-display text-4xl font-semibold text-ink sm:text-5xl">
      <NumberFlow
        value={shown}
        format={plain ? { useGrouping: false } : undefined}
        suffix={suffix}
      />
    </span>
  );
}

export function Credibility() {
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6 lg:py-24">
      <div className="grid gap-12 lg:grid-cols-[5fr_7fr] lg:gap-16">
        <Reveal>
          <h2 className="bwc-display max-w-[16ch] text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            Three decades of looking at symptoms through the brain.
          </h2>
          <p className="mt-4 max-w-[48ch] text-base leading-relaxed text-body">
            The practice is led by founder Ali Hashemian, PhD, who trained in
            TMS at Harvard Medical School, alongside board-certified
            psychiatrists and one of the most experienced qEEG teams in the
            field. Our physicians hold affiliations with San Ramon Regional
            Medical Center, John Muir Health Walnut Creek, and Sutter Tracy
            Community Hospital.
          </p>
        </Reveal>

        <div className="flex flex-col justify-center">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08}>
              <div className={i === 0 ? "flex items-baseline justify-between gap-6 py-5" : "flex items-baseline justify-between gap-6 border-t border-ink/10 py-5"}>
                <span className="text-base text-body">{stat.label}</span>
                <ClientOnly
                  fallback={
                    <span className="bwc-display text-4xl font-semibold text-ink sm:text-5xl">
                      {stat.plain ? String(stat.value) : stat.value.toLocaleString("en-US")}
                      {stat.suffix ?? ""}
                    </span>
                  }
                >
                  <StatNumber value={stat.value} suffix={stat.suffix} plain={stat.plain} />
                </ClientOnly>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
