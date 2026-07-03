import {
  ArrowsClockwise,
  Brain,
  ChatCircleDots,
  CloudRain,
  Ear,
  HeadCircuit,
  Lifebuoy,
  Lightning,
  MoonStars,
  Person,
  PuzzlePiece,
  ShieldWarning,
  Sparkle,
  TextAa,
} from "@phosphor-icons/react";
import { Reveal } from "./reveal";

const CONDITIONS = [
  {
    icon: CloudRain,
    name: "Depression",
    blurb: "Including cases that have not responded to medication.",
    featured: true,
  },
  {
    icon: Lightning,
    name: "Anxiety",
    blurb: "Quiet an overactive stress response at its source.",
    featured: true,
  },
  { icon: HeadCircuit, name: "ADHD", blurb: "Focus and follow-through, mapped and trained." },
  { icon: PuzzlePiece, name: "Autism", blurb: "Support for regulation, language, and connection." },
  { icon: Ear, name: "Auditory Processing", blurb: "When hearing is fine but understanding is hard." },
  { icon: ArrowsClockwise, name: "OCD", blurb: "Interrupt looping thought and behavior cycles." },
  { icon: ShieldWarning, name: "PTSD & Trauma", blurb: "Calm a brain stuck in high alert." },
  { icon: TextAa, name: "Dyslexia", blurb: "Strengthen the pathways reading depends on." },
  { icon: Brain, name: "Brain Injury", blurb: "Recovery support after concussion or TBI." },
  { icon: Person, name: "Bipolar Disorder", blurb: "Steadier ground between the highs and lows." },
  { icon: MoonStars, name: "Insomnia", blurb: "Retrain the rhythms that healthy sleep needs." },
  { icon: Sparkle, name: "Memory & Cognition", blurb: "Sharpen recall, clarity, and processing speed." },
  { icon: Lifebuoy, name: "Addiction", blurb: "Address the brain patterns beneath the craving." },
  { icon: ChatCircleDots, name: "Language & Sensory Delays", blurb: "Early support for processing and speech." },
];

export function Conditions() {
  return (
    <section id="conditions" className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6 lg:py-28">
      <Reveal>
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ember">
          Conditions we treat
        </p>
        <h2 className="bwc-display mt-3 max-w-[24ch] text-3xl font-semibold leading-tight text-ink sm:text-4xl">
          Different symptoms, one starting point: the brain itself.
        </h2>
        <p className="mt-4 max-w-[58ch] text-base leading-relaxed text-body">
          A qEEG brain map shows the activity patterns behind each of these
          diagnoses, so care is guided by your brain, not a label.
        </p>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CONDITIONS.map((c, i) => {
          const Icon = c.icon;
          return (
            <Reveal
              key={c.name}
              delay={(i % 4) * 0.05}
              className={c.featured ? "sm:col-span-2" : undefined}
            >
              <div
                className={
                  c.featured
                    ? "flex h-full flex-col justify-between rounded-2xl bg-ink p-6"
                    : "flex h-full flex-col rounded-2xl border border-ink/8 bg-white/70 p-6"
                }
              >
              <Icon
                size={28}
                weight="duotone"
                aria-hidden="true"
                className={c.featured ? "text-aqua" : "text-ink-soft"}
              />
              <div className={c.featured ? "mt-8" : "mt-5"}>
                <h3
                  className={
                    c.featured
                      ? "bwc-display text-2xl font-semibold text-porcelain"
                      : "bwc-display text-lg font-semibold text-ink"
                  }
                >
                  {c.name}
                </h3>
                <p
                  className={
                    c.featured
                      ? "mt-2 max-w-[36ch] text-sm leading-relaxed text-aqua/80"
                      : "mt-1.5 text-sm leading-relaxed text-body"
                  }
                >
                  {c.blurb}
                </p>
              </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      <Reveal delay={0.1}>
        <p className="mt-8 text-sm text-body">
          Not sure your situation fits a category? A free consultation is the
          fastest way to find out whether brain mapping can help.
        </p>
      </Reveal>
    </section>
  );
}
