import { motion, useReducedMotion } from "motion/react";
import { ClientOnly } from "./client-only";
import { HeroTrace } from "./eeg-trace";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-4 pb-10 pt-8 sm:px-6 lg:grid-cols-[7fr_5fr] lg:gap-14 lg:pb-14 lg:pt-12">
        <div>
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="bwc-display max-w-[22ch] text-4xl font-semibold leading-[1.05] text-ink sm:text-5xl lg:text-6xl"
          >
            Relief starts with a map of your brain.
          </motion.h1>

          <ClientOnly fallback={<div className="mt-5 h-10 w-full max-w-md" />}>
            <HeroTrace className="mt-5 h-10 w-full max-w-md text-ember" />
          </ClientOnly>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            className="mt-5 max-w-[44ch] text-lg leading-relaxed text-body"
          >
            qEEG brain mapping reveals what is driving your symptoms, so
            treatment can target the cause instead of guessing.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.28, ease: EASE }}
            className="mt-8 flex flex-wrap items-center gap-5"
          >
            <a
              href="#book"
              className="rounded-full bg-ember px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-ember/20 transition-all hover:bg-ember-deep active:scale-[0.98]"
            >
              Book a Free Consultation
            </a>
            <a
              href="#conditions"
              className="text-base font-semibold text-ink-soft underline decoration-aqua decoration-2 underline-offset-4 transition-colors hover:text-ink"
            >
              Conditions we treat
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: EASE }}
          className="relative"
        >
          <div className="overflow-hidden rounded-2xl bg-mist">
            <img
              src="/assets/hero-brain.jpg"
              alt="Illustration of a brain drawn from flowing neural pathways and EEG traces"
              width={1280}
              height={720}
              fetchPriority="high"
              className="aspect-[4/3] w-full object-cover object-[70%_center] lg:aspect-[5/6]"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
