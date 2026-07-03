import { Reveal, RevealGroup } from "./reveal";

/*
 * Paraphrased summaries of public patient reviews, not verbatim quotes.
 * Attribution follows the practice's own style: first name + last initial,
 * or the reviewer's role where the review was anonymous.
 */
const STORIES = [
  {
    quote:
      "After living with depression for most of my life, I came in skeptical. This treatment genuinely changed my life.",
    name: "Gianella A.",
    context: "qpTMS patient",
  },
  {
    quote:
      "Medications kept failing me. The sessions were quick and painless, and within eight weeks life was better than I had imagined it could be.",
    name: "Verified patient",
    context: "Depression care, San Ramon",
  },
  {
    quote:
      "After twelve years of severe social anxiety, our son is finally out in the world and starting his life at 24.",
    name: "A parent",
    context: "Family of an adult patient",
  },
  {
    quote:
      "My focus was slipping even with medication. A brain map, then neurofeedback, and I felt the difference within weeks.",
    name: "Verified patient",
    context: "Neurofeedback for ADHD",
  },
  {
    quote:
      "Every step was explained in plain language. The team is friendly, patient, and clearly knows this field deeply.",
    name: "Jason J.",
    context: "Patient",
  },
];

export function Testimonials() {
  return (
    <section id="results" className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6 lg:py-28">
      <Reveal>
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ember">
          Patient stories
        </p>
        <h2 className="bwc-display mt-3 max-w-[22ch] text-3xl font-semibold leading-tight text-ink sm:text-4xl">
          What changes when treatment fits the brain.
        </h2>
      </Reveal>

      <RevealGroup
        className="mt-12 columns-1 gap-5 md:columns-2 lg:columns-3 [&>div]:mb-5 [&>div]:break-inside-avoid"
        stagger={0.08}
        items={STORIES.map((s) => (
          <figure key={s.quote} className="rounded-2xl border border-ink/8 bg-white/70 p-6">
            <blockquote className="text-base leading-relaxed text-ink">
              {"“"}{s.quote}{"”"}
            </blockquote>
            <figcaption className="mt-4 text-sm text-body">
              <span className="font-semibold text-ink-soft">{s.name}</span>
              <br />
              {s.context}
            </figcaption>
          </figure>
        ))}
      />

      <Reveal delay={0.1}>
        <p className="mt-6 text-[13px] text-body/80">
          Summaries of public patient reviews, lightly edited for length.
          Individual results vary.
        </p>
      </Reveal>
    </section>
  );
}
