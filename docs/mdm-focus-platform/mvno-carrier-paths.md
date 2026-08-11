# MVNO / Carrier-Partnership Paths to Make the MVP Easier

Research Aug 2026. Question: would becoming an MVNO or partnering with a carrier make
the [data-only softphone MVP](./mvp-data-only-softphone.md) easier — fewer vendors, no
per-student port, cleaner 911, stronger anti-bypass? Multiple paths below; none ruled
out for being unusual. `[V]` = verified against cited source; `[A]` = assessment.

---

## The load-bearing finding: Operator Determined Barring (ODB)

The current MVP builds anti-bypass from *device-side* pieces (MDM hides native apps) on
a *rented* number + a *separately sourced* data SIM. If you sit anywhere on the
MVNO/MVNE spectrum, anti-bypass and 911 both move **into the network core**, which is
strictly stronger.

The mechanism is **Operator Determined Barring (ODB)** — a standardized 3GPP/GSM feature
(GSM 02.41 / 3GPP TS 22.041 / TS 23.015) that lets the operator bar categories of
outgoing/incoming circuit-switched calls and point-to-point SMS **per subscriber**,
provisioned at the **HLR/HSS**. Crucially, **the Emergency Call teleservice is exempt
from all ODB categories by spec.** `[V — ETSI TS 123 015; 3GPP TS 22.041]`

So on a SIM whose HLR profile has **CS voice + SMS barred but data allowed**, the phone
**physically cannot originate a carrier call or text** — no app to hide, no shadow
number to leak, nothing for MDM to police — **while native 911 still works**, because
emergency is a protected teleservice riding the cellular radio independent of ODB and of
your data path. That is a cleaner, more robust version of exactly what the MDM
app-hiding approximates. It is available **only if you (or your enabler) control the
subscriber's HLR/HSS profile** — i.e. an MVNE-hosted-core or full-MVNO posture, **not** a
CPaaS-SIM or light-reseller posture.

This also fixes the MVP's biggest safety worry: a data-only IoT SIM (Path D) has **no
native 911 fallback** if the app/data is down. A barred-voice-but-emergency-capable SIM
(Paths A/B) keeps native cellular 911 as a free, always-on fallback **on top of** the
softphone's E911. Dual 911 is a real upgrade.

---

## What is and isn't eliminable (the 4 frictions)

1. **Per-student PORT** — unavoidable *only if the product must keep the student's exact
   existing number.* Every path still needs a port-in to move that number onto your
   platform; the better paths make it a **standard API-automated port-in to one
   platform** instead of a bespoke CPaaS hosted-number deal. **If the product can issue a
   fresh number and forward the old one, the port disappears entirely** — worth pricing
   as a product option; it collapses the worst friction. `[A]`
2. **Data line in the same SIM** — solved by every MVNO/MVNE/CPaaS-SIM path.
3. **E911** — you get two independent stories on the good paths: native cellular
   emergency teleservice on the SIM (free, always-on, spec-guaranteed) **and** your
   softphone's interconnected-VoIP E911 (an FCC mandate you inherit anyway). `[V]`
4. **Vendor count** — MVNE (A/E) and CPaaS-super-SIM (D) each collapse the stack.

**Regulatory floor `[V]`:** interconnected VoIP providers must provide E911 as a
mandatory, non-opt-out feature (FCC, 47 CFR Part 9). Routing real PSTN calls over your
softphone almost certainly makes you an interconnected VoIP provider. All wireless
providers (incl. eSIM-only) must file **FCC Form 855**. Any MVNO flavor adds carrier
obligations: 911, CALEA, CPNI, USF, Form 855, possibly state PUC. This is the main
non-obvious cost of A/B/C vs. staying a CPaaS customer.

---

## The paths

### A — MVNE / MVNA "MVNO-in-a-box" (recommended on-ramp)
An enabler runs the core (HLR/HSS, SMSC, often IMS/VoLTE), holds the wholesale MNO deal,
and hands you SIM/eSIM issuance, number provisioning, BSS/OSS, and an API. You get
per-line profile control — including, in principle, the barred-voice ODB profile — plus
inbound routing to your server/IVR (depth is vendor-specific; qualify in the RFP).
Collapses the stack to **enabler + your server**. Launch in **days–weeks**, opex/per-line
(not the capex of a full MVNO). `[V/A]`

US players `[V they exist / market MVNE]`:
- **Gigs** — "MVNO-in-a-box," direct **AT&T** US partnership, API eSIM + real voice/text
  numbers, automated port-in, billing/tax; powers Klarna & Omnipoint; $73M raised (2024).
  Strongest single-integration candidate. Open question: depth of programmable
  routing/ODB self-serve — confirm directly.
- **AireSpring Wireless** — explicit MVNE on AT&T; offers full **and** light MVNO; US,
  enterprise/channel — plausibly willing to do a custom per-line policy build.
- **Plintron** — largest MVNA/MVNE, runs its own IMS/VoLTE core, US presence — native
  ODB/teleservice + routing capability.
- Also: **Ztar Mobile** (US MVNE/MVNA), **Tucows/Wavelo** (BSS/OSS layer — pair with a
  core), **Spenza** (<7-day launch, per-line, API), **Mobilise**, **Syniverse**, **Telgua**.

### B — Full ("thick") MVNO (you run the core)
Own HLR/HSS, IMS voice core, SMSC; lease only RAN. Maximum control: native ODB, native
routing, mint your own numbers (no port at all), design 911 end-to-end. But **12–24
months, ~$5M–$30M+**, a direct MNO volume deal, and the full carrier regulatory load.
**Overkill for a study-focus startup** — an MVNE-hosted core gives the same anti-bypass
commercially without the core build. Revisit only at large scale. `[V ranges]`

### C — Light MVNO / reseller (rebrand stock service)
Cheapest, fastest — but you inherit the host's **stock features only**: no programmable
inbound routing, no per-line ODB API, typically no barred-voice profile. **Insufficient
for the anti-bypass goal.** Useful only as a branding shell to graduate off. `[A]`

### D — CPaaS "super SIM" / programmable data SIM (interim fallback)
Programmable **data-only** SIMs (IoT-oriented) — no dialable voice number, which by our
design is fine. `[V]`
- **Twilio Super SIM** — global data, US on **T-Mobile**; **now a KORE product** (Twilio
  IoT sold to KORE, 2023); "SMS Commands" are machine control messages, **not** consumer
  texting; **no voice, no MSISDN**.
- **Telnyx Wireless** — IoT SIM, US, data-only today (VoLTE/SMS "coming soon"); a "Mobile
  Voice" SKU emerging.
- Emnify / 1NCE / Onomondo / Soracom / Aeris — all data-only IoT.

A "one-vendor Twilio stack" (Super SIM data + hosted number + Voice SDK softphone + Twilio
Programmable Voice E911 + your server) is coherent **but**: Super SIM is now KORE (not
truly one vendor); **no HLR/ODB control** (anti-bypass stays device-side + data-only-by-
nature); and softphone-only 911 means **no native cellular fallback**. Net: D
**modernizes and consolidates the current approach** and removes the data-SIM-sourcing
friction, but does **not** deliver network-level anti-bypass or dual-911. Good v1, not the
end state. `[V/A]`

### E — eSIM-API aggregators
**Gigs** (covered in A) is enabler-class — real voice/text plans, port-in, eSIM, AT&T US.
**Airalo** and travel-eSIM aggregators are data-only consumer retail — **not suitable**.

### F — Direct MNO wholesale (T-Mobile / AT&T / Verizon; DISH/Boost)
MNO wholesale desks want volume commitments and a launch-ready operator; a pre-scale
startup is routed **through an MVNE** instead. **2025 update: EchoStar (DISH/Boost) sold
~$23B of spectrum to AT&T, abandoned its 4th-carrier bid, and is moving Boost onto AT&T +
T-Mobile** — so DISH is **no longer** the scrappy approachable wholesale on-ramp.
Graduation target at scale, not a start. `[V]`

---

## Comparison

| Path | Routing / per-line control | Removes port? | Data SIM incl.? | 911 | Cost | Launch | Anti-bypass fit |
|---|---|---|---|---|---|---|---|
| **A · MVNE (in-a-box)** | High in principle (hosted HLR → ODB + routing); confirm API depth | Reduces; eliminable via issue+forward | Yes (voice+data 1 SIM) | Native **+** softphone (dual) | Opex/per-line | Days–weeks | **Strong** |
| B · Full MVNO | Maximum (own core) | Yes (mint numbers) | Yes | Full, dual | $5–30M+ | 12–24 mo | Strongest but overkill |
| C · Light MVNO | ~None (stock) | No | Yes | Stock only | Low | Fast | Insufficient |
| D · CPaaS super-SIM | Data policy only; no ODB | No | Yes (data-only) | Softphone only; **no native fallback** | Low opex | Days | Medium (device-side) |
| E · eSIM-API (Gigs) | Enabler-class (= A) | Reduces/eliminable | Yes | Dual in principle | Opex/per-line | Days | Strong (confirm depth) |
| F · Direct MNO wholesale | Maximum if granted | Yes | Yes | Full | High commit | Months+ | Strong; not a startup on-ramp |

---

## Recommendation & phasing

**Yes — the MVNO/MVNE spectrum makes the MVP easier and stronger, but the win is the
MVNE-hosted-core tier (A/E), not a full MVNO (B) and not a light reseller (C).** A hosted
core lets you ship a **data-enabled / CS-voice+SMS-barred / emergency-exempt** SIM, which
turns anti-bypass into a network guarantee (no shadow number can exist) and adds a free
always-on native-911 fallback — categorically better than MDM-hides-the-app — while
collapsing the four-vendor stack to **one enabler + your server** and turning the
per-student port into an API port-in (or eliminating it via issue+forward).

1. **Start (0–3 mo): Path A/E with an AT&T-network enabler — shortlist Gigs, AireSpring,
   Plintron.** Make three requirements pass/fail in the RFP: (a) provision a
   **data-enabled / voice+SMS-barred / emergency-exempt** per-line HLR profile;
   (b) **programmatic inbound call+SMS routing to your server/IVR** (for whitelist/hold/
   "delivered soon"); (c) **automated port-in API** + an **issue+forward** option to skip
   the port. Whoever demos (a)+(b) live wins. Keep softphone E911 via Twilio/Telnyx
   Programmable Voice to satisfy the VoIP-911 mandate.
2. **Interim fallback if no enabler exposes ODB/routing at launch: Path D** (Telnyx or
   Twilio/KORE data-only SIM + hosted number + Voice SDK softphone + your server).
   Removes data-SIM friction, ~2 vendors, but keeps anti-bypass device-side and 911
   softphone-only. Acceptable v1.
3. **Graduate (12–24 mo, at scale): Path B or F** only when line volume makes per-line
   enabler margin the dominant cost. Don't budget around DISH/Boost — that on-ramp closed
   in 2025.

**Legal-check regardless of path:** you likely become an interconnected VoIP and/or
wireless provider (FCC 911 non-opt-out, CALEA, CPNI, USF, Form 855, maybe state PUC), and
you must confirm the MNO/enabler contractually permits a **barred-voice consumer
profile** — standard HLR functionality, but a non-default provisioning ask.

## Sources
- ETSI TS 123 015 (ODB): https://www.etsi.org/deliver/etsi_ts/123000_123099/123015/06.00.00_60/ts_123015v060000p.pdf
- 3GPP TS 22.041 (ODB / emergency exemption): https://www.tech-invite.com/3m22/tinv-3gpp-22-041.html
- FCC VoIP & 911: https://www.fcc.gov/consumers/guides/voip-and-911-service · 47 CFR Part 9: https://www.ecfr.gov/current/title-47/chapter-I/subchapter-A/part-9
- FCC Form 855 (all wireless providers): https://commlawgroup.com/2025/advisory-clarification-all-wireless-service-providersmust-file-fcc-form-855/
- Gigs MVNO-in-a-box: https://gigs.com/blog/mvno-in-a-box-the-smartest-way-to-launch-a-mobile-service · https://techcrunch.com/2024/12/12/gigs-mvno-73m-mobile-network-services/
- AireSpring MVNE: https://airespring.com/mvne-services/
- Plintron: https://plintron.com/mvnx-marketplace/
- KORE Super SIM (ex-Twilio): https://docs.korewireless.com/supersim · Twilio Emergency Calling: https://www.twilio.com/docs/voice/tutorials/emergency-calling-for-programmable-voice
- Telnyx US IoT SIM: https://telnyx.com/sim-cards/united-states
- Full-MVNO cost/time: https://spenza.com/mvno/mvno-launch-cost/
- DISH/EchoStar 2025 exit: https://mobile.slashdot.org/story/25/08/26/2052237/dish-gives-up-on-becoming-the-fourth-major-wireless-carrier · https://www.fierce-network.com/operators/dish-signs-5b-mvno-deal-at-t
