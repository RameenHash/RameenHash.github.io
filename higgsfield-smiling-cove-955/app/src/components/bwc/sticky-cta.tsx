import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/*
 * The one persistent conversion element on small screens: a fixed bottom
 * bar that appears once the hero CTA has scrolled away. Desktop keeps the
 * sticky header CTA instead, so the intent stays singular on every viewport.
 */
export function StickyCta() {
  const [visible, setVisible] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { rootMargin: "-64px 0px 0px 0px" },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={reduce ? false : { y: 72 }}
          animate={{ y: 0 }}
          exit={reduce ? undefined : { y: 72 }}
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-porcelain/95 p-3 backdrop-blur-md md:hidden"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <a
            href="#book"
            className="block w-full rounded-full bg-ember px-5 py-3.5 text-center text-[15px] font-semibold text-white shadow-lg shadow-ember/20 active:scale-[0.98]"
          >
            Book a Free Consultation
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
