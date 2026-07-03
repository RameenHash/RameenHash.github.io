const FOOTER_LINKS = [
  { label: "Conditions", href: "#conditions" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Results", href: "#results" },
  { label: "Financing", href: "#financing" },
  { label: "Locations", href: "#locations" },
];

export function Footer() {
  return (
    <footer className="border-t border-porcelain/10 bg-ink-deep pb-24 pt-14 md:pb-14">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="bwc-display flex items-center gap-2.5 text-[17px] font-semibold text-porcelain">
              <img src="/assets/bwc-mark.png" alt="" className="h-8 w-8 rounded-lg" />
              Brain Wellness Center
            </div>
            <p className="mt-3 max-w-[40ch] text-sm leading-relaxed text-aqua/60">
              qEEG brain mapping and personalized neuromodulation therapy in
              San Ramon, Roseville, and Belmont, California.
            </p>
            <a
              href="tel:+19258371100"
              className="mt-4 inline-block text-sm font-semibold text-porcelain hover:text-white"
            >
              (925) 837-1100
            </a>
          </div>

          <nav className="grid grid-cols-2 gap-x-12 gap-y-3 sm:grid-cols-3" aria-label="Footer">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-aqua/70 transition-colors hover:text-porcelain"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-12 border-t border-porcelain/10 pt-8">
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-aqua/50">
            Medical disclaimer
          </h3>
          <p className="mt-3 max-w-[90ch] text-[13px] leading-relaxed text-aqua/50">
            The information on this website is provided for general education
            only and is not medical advice. It is not a substitute for
            evaluation, diagnosis, or treatment by a qualified healthcare
            professional. Individual results from qEEG brain mapping, TMS,
            neurofeedback, and related therapies vary, and no outcome is
            guaranteed. If you are experiencing a medical or mental health
            emergency, call 911, or call or text 988 for the Suicide and
            Crisis Lifeline.
          </p>
          <p className="mt-6 text-[13px] text-aqua/40">
            {new Date().getFullYear()} Brain Wellness Center. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
