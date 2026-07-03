import { Phone } from "@phosphor-icons/react";

const NAV_LINKS = [
  { label: "Conditions", href: "#conditions" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Results", href: "#results" },
  { label: "Locations", href: "#locations" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/8 bg-porcelain/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6">
        <a href="#top" className="bwc-display flex items-center gap-2.5 text-[17px] font-semibold text-ink">
          <img src="/assets/bwc-mark.png" alt="" className="h-8 w-8 rounded-lg" />
          <span>
            Brain Wellness Center
          </span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-body transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <a
            href="tel:+19258371100"
            className="hidden items-center gap-1.5 text-sm font-semibold text-ink-soft transition-colors hover:text-ink md:flex"
          >
            <Phone size={16} weight="fill" aria-hidden="true" />
            (925) 837-1100
          </a>
          <a
            href="#book"
            className="rounded-full bg-ember px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-ember-deep active:scale-[0.98]"
          >
            Book a Free Consultation
          </a>
        </div>
      </div>
    </header>
  );
}
