import { Reveal, RevealGroup } from "./reveal";
import { SectionTrace } from "./eeg-trace";
import { ClientOnly } from "./client-only";

const STEPS = [
  {
    title: "Map",
    body: "A quantitative EEG records your brain's electrical activity and turns it into a detailed map, showing exactly which regions and rhythms are out of balance.",
  },
  {
    title: "Target",
    body: "Your clinician reads the map against a normative database and designs a qpTMS protocol aimed at the specific circuits driving your symptoms.",
  },
  {
    title: "Treat",
    body: "Gentle magnetic pulses from FDA-cleared TMS equipment stimulate those circuits in brief office visits. You sit back, fully awake, and most people return straight to their day. A typical course runs 30 to 40 sessions over 6 to 8 weeks.",
  },
  {
    title: "Re-measure",
    body: "Follow-up mapping tracks how your brain is responding, so your protocol is tuned by data at every stage rather than by trial and error.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-mist/60">
      <div className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6 lg:py-28">
        <Reveal>
          <h2 className="bwc-display max-w-[22ch] text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            How qpTMS works: measured, targeted, and tracked.
          </h2>
          <p className="mt-4 max-w-[60ch] text-base leading-relaxed text-body">
            qpTMS is a personalized form of transcranial magnetic stimulation
            guided by your own qEEG brain map. It is non-invasive and does not
            require sedation.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-[5fr_7fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <div className="overflow-hidden rounded-2xl bg-white/60">
                <img
                  src="/assets/qeeg-map.jpg"
                  alt="Stylized qEEG brain map with topographic activity zones"
                  width={880}
                  height={880}
                  loading="lazy"
                  className="aspect-square w-full object-cover"
                />
              </div>
              <p className="mt-3 text-sm text-body">
                The qEEG map: a data picture of how your brain is actually
                working.
              </p>
            </Reveal>
          </div>

          <RevealGroup
            className="flex flex-col"
            stagger={0.1}
            items={STEPS.map((step, i) => (
              <div key={step.title} className={i === 0 ? "py-6" : "border-t border-ink/10 py-6"}>
                <h3 className="bwc-display text-xl font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 max-w-[58ch] text-base leading-relaxed text-body">{step.body}</p>
              </div>
            ))}
          />
        </div>

        <ClientOnly>
          <SectionTrace className="mt-14 text-ink-soft/40" />
        </ClientOnly>
      </div>
    </section>
  );
}
