import { CreditCard, ShieldCheck } from "@phosphor-icons/react";
import { Reveal } from "./reveal";

export function Financing() {
  return (
    <section id="financing" className="relative overflow-hidden bg-mist/60">
      <img
        src="/assets/wave-texture.jpg"
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div className="relative mx-auto max-w-[1200px] px-4 py-20 sm:px-6 lg:py-24">
        <Reveal>
          <h2 className="bwc-display max-w-[22ch] text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            Care that works with your insurance and your budget.
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <Reveal delay={0.05}>
            <div className="flex h-full flex-col rounded-2xl border border-ink/8 bg-white/85 p-7 backdrop-blur-sm">
              <ShieldCheck size={30} weight="duotone" className="text-ink-soft" aria-hidden="true" />
              <h3 className="bwc-display mt-5 text-xl font-semibold text-ink">
                In-network insurance
              </h3>
              <p className="mt-2 text-base leading-relaxed text-body">
                Brain Wellness Center is in-network with most major commercial
                insurance plans in California. Our team verifies your benefits
                before treatment begins, so costs are clear up front.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="flex h-full flex-col rounded-2xl border border-ink/8 bg-white/85 p-7 backdrop-blur-sm">
              <CreditCard size={30} weight="duotone" className="text-ink-soft" aria-hidden="true" />
              <h3 className="bwc-display mt-5 text-xl font-semibold text-ink">
                CareCredit financing
              </h3>
              <p className="mt-2 text-base leading-relaxed text-body">
                For services insurance does not cover, we accept CareCredit,
                a healthcare credit line that lets you spread treatment costs
                over monthly payments.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <p className="mt-8 text-sm text-body">
            Questions about coverage for your specific plan? Ask during your
            free consultation and we will check it for you.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
