import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/*
 * Signature motif: a quantitative-EEG trace that draws itself.
 * `HeroTrace` draws once on load beneath the hero headline.
 * `SectionTrace` scrubs with scroll as a section divider.
 * Both collapse to a static line under prefers-reduced-motion.
 */

const TRACE_D =
  "M0 32 L60 32 L74 30 L88 34 L104 31 L120 33 L138 32 L150 12 L158 52 L166 6 L174 48 L182 32 L220 32 L238 29 L256 35 L274 30 L292 34 L312 32 L330 32 L344 20 L352 44 L360 16 L368 42 L378 32 L420 32 L442 30 L462 34 L484 31 L506 33 L530 32 L544 8 L552 56 L560 10 L568 46 L578 32 L620 32 L644 30 L668 34 L692 31 L716 33 L740 32 L756 22 L764 42 L772 26 L780 36 L790 32 L840 32 L870 31 L900 33 L930 32 L960 32";

export function HeroTrace({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <svg
      viewBox="0 0 960 64"
      fill="none"
      aria-hidden="true"
      className={className}
      preserveAspectRatio="none"
    >
      <motion.path
        d={TRACE_D}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2.4, ease: "easeInOut", delay: 0.4 }}
      />
    </svg>
  );
}

export function SectionTrace({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 90%", "end 45%"],
  });
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return (
    <div ref={ref} className={className} aria-hidden="true">
      <svg viewBox="0 0 960 64" fill="none" className="h-10 w-full" preserveAspectRatio="none">
        <motion.path
          d={TRACE_D}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={reduce ? undefined : { pathLength }}
        />
      </svg>
    </div>
  );
}
