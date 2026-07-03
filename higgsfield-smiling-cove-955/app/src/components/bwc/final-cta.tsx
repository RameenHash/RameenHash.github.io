import { ChatText, Phone } from "@phosphor-icons/react";
import { Reveal } from "./reveal";

export function FinalCta() {
  return (
    <section id="book" className="bg-ink-deep">
      <div className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[7fr_5fr]">
          <Reveal>
            <h2 className="bwc-display max-w-[18ch] text-3xl font-semibold leading-tight text-porcelain sm:text-4xl lg:text-5xl">
              Talk it through with us. The consultation is free.
            </h2>
            <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-aqua/85">
              A short, no-pressure phone or video conversation about your
              symptoms, your history, and whether qEEG-guided treatment is a
              fit. Call or text, whichever is easier.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-5">
              <a
                href="tel:+19258371100"
                className="inline-flex items-center gap-2.5 rounded-full bg-ember px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-ember/25 transition-all hover:bg-ember-deep active:scale-[0.98]"
              >
                <Phone size={20} weight="fill" aria-hidden="true" />
                Call (925) 837-1100
              </a>
              <a
                href="sms:+19258371100"
                className="inline-flex items-center gap-2.5 text-base font-semibold text-porcelain underline decoration-ink-soft decoration-2 underline-offset-4 transition-colors hover:text-white"
              >
                <ChatText size={20} weight="fill" aria-hidden="true" />
                Text us instead
              </a>
            </div>

            <p className="mt-6 text-sm text-aqua/60">
              Once your consultation is complete, treatment can often begin
              within days.
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="overflow-hidden rounded-2xl">
              <img
                src="/assets/patient-window.jpg"
                alt="A patient resting comfortably by a bright clinic window"
                width={928}
                height={1152}
                loading="lazy"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
