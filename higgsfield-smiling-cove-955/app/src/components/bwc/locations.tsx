import { Clock, MapPin, Phone } from "@phosphor-icons/react";
import { Reveal } from "./reveal";

const LOCATIONS = [
  {
    city: "San Ramon",
    tag: "Headquarters",
    address: "5401 Norris Canyon Rd, Suite 304",
    cityLine: "San Ramon, CA 94583",
    phoneDisplay: "(925) 837-1100",
    phoneHref: "tel:+19258371100",
    hours: "Mon to Fri, 9:00 am to 5:00 pm",
    featured: true,
  },
  {
    city: "San Jose",
    address: "3031 Tisch Way, Suite 309",
    cityLine: "San Jose, CA 95128",
    phoneDisplay: "(408) 740-3100",
    phoneHref: "tel:+14087403100",
  },
  {
    city: "Modesto",
    address: "1524 McHenry Ave, Suite 415",
    cityLine: "Modesto, CA 95350",
    phoneDisplay: "(209) 253-1700",
    phoneHref: "tel:+12092531700",
  },
];

export function Locations() {
  const [hq, ...rest] = LOCATIONS;
  return (
    <section id="locations" className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6 lg:py-28">
      <Reveal>
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-ember">
          Locations
        </p>
        <h2 className="bwc-display mt-3 max-w-[24ch] text-3xl font-semibold leading-tight text-ink sm:text-4xl">
          Three offices across Northern California.
        </h2>
      </Reveal>

      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        <Reveal>
          <div className="flex h-full flex-col justify-between rounded-2xl bg-ink p-8">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="bwc-display text-2xl font-semibold text-porcelain">{hq.city}</h3>
                <span className="rounded-full bg-ink-soft/40 px-3 py-1 text-xs font-semibold text-aqua">
                  {hq.tag}
                </span>
              </div>
              <p className="mt-4 flex items-start gap-2.5 text-base leading-relaxed text-aqua/85">
                <MapPin size={20} weight="duotone" className="mt-0.5 shrink-0" aria-hidden="true" />
                <span>
                  {hq.address}
                  <br />
                  {hq.cityLine}
                </span>
              </p>
              <p className="mt-3 flex items-center gap-2.5 text-sm text-aqua/70">
                <Clock size={18} weight="duotone" aria-hidden="true" />
                {hq.hours}
              </p>
            </div>
            <a
              href={hq.phoneHref}
              className="mt-8 inline-flex w-fit items-center gap-2.5 rounded-full border border-aqua/30 px-5 py-2.5 text-sm font-semibold text-porcelain transition-colors hover:border-aqua/60 hover:text-white"
            >
              <Phone size={17} weight="fill" aria-hidden="true" />
              {hq.phoneDisplay}
            </a>
          </div>
        </Reveal>

        <div className="grid gap-5">
          {rest.map((loc, i) => (
            <Reveal key={loc.city} delay={0.08 + i * 0.08}>
              <div className="flex h-full flex-col justify-between gap-5 rounded-2xl border border-ink/8 bg-white/70 p-7 sm:flex-row sm:items-center">
                <div>
                  <h3 className="bwc-display text-xl font-semibold text-ink">{loc.city}</h3>
                  <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-body">
                    <MapPin size={18} weight="duotone" className="mt-0.5 shrink-0 text-ink-soft" aria-hidden="true" />
                    <span>
                      {loc.address}
                      <br />
                      {loc.cityLine}
                    </span>
                  </p>
                </div>
                <a
                  href={loc.phoneHref}
                  className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:border-ink/40 hover:text-ink"
                >
                  <Phone size={16} weight="fill" aria-hidden="true" />
                  {loc.phoneDisplay}
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
