# Brain Wellness Center site build: integration handoff

Target: Higgsfield website `smiling-cove-955` (website_id
`c9527232-c9c5-4397-878a-731d292767d0`), repo
`apps-repos.higgsfield.ai/hfu-user3G05g8kSO8ZFf9OwUtzjglaXt9s/smiling-cove-955-c9527232-c9c5-4397-878a-731d292767d0.git`,
branch `main`.

This directory is a complete overlay for the template's `app/` folder, built
against the website-builder-flow contract (wow-maker + design-taste-frontend).
It was authored in a session whose egress policy blocked
`apps-repos.higgsfield.ai`, so it could not be pushed to the website repo
directly. A session with network access to that host (or a machine with git)
can integrate it in a few minutes.

## Integration steps

1. Call `website_repo_access` for the website_id above, clone the repo.
2. Copy this overlay into the clone:
   - `app/public/assets/*` -> `app/public/assets/` (6 final images + svg mark;
     all already downscaled/optimized, all AI-generated bespoke for this build)
   - `app/src/components/bwc/*` -> `app/src/components/bwc/`
   - `app/src/routes/index.tsx` -> replace the template's index route
3. Fonts + tokens:
   - `bun add motion @phosphor-icons/react @number-flow/react @fontsource-variable/bricolage-grotesque @fontsource-variable/instrument-sans`
     (see `package-additions.md`)
   - Add to the TOP of `app/src/styles.css`:
     `@import "@fontsource-variable/bricolage-grotesque";` and
     `@import "@fontsource-variable/instrument-sans";`
   - Append the contents of `app/src/styles-bwc-tokens.css` to
     `app/src/styles.css` (it is an additive `@theme` block + two helpers;
     do not remove the template's existing Tailwind/Quanta imports).
4. Keep the template's `__root.tsx` shell as-is (design-inspector wiring must
   stay). The index route supplies its own `head()` meta/links.
5. `app/app.manifest.json`: leave every service off (no D1/R2/KV needed).
6. Run `bun run qa:fill -- --strict`, commit, push to `main`, then
   `deploy_website` with `env='preview'` and return the preview URL.

## Design contract notes (for any future editor)

- Theme: light, locked. The `#book` section + footer form the single
  deliberate dark color-block close. Do not add other dark sections.
- Accent: ember `#B6431F` only. No second accent.
- Shape system: pill buttons, 16px card radius.
- Type: Bricolage Grotesque (display) / Instrument Sans (body), self-hosted.
- Signature motif: the self-drawing qEEG trace (`eeg-trace.tsx`), used in the
  hero (draw on load) and as a scroll-scrubbed divider. Keep it singular.
- CTA intent is singular: "Book a Free Consultation" everywhere, resolving to
  `#book` (call/text (925) 837-1100). Location cards use plain tel: links.
- All imagery is bespoke (Seedream 4.5 / Recraft V4.1 / Nano Banana 2), in
  `app/public/assets/`. Same-origin references only; no stock, no hotlinks.
- Reduced motion: every animated element degrades via `useReducedMotion` or
  the ClientOnly gate. Keep it that way.

## Content provenance

Facts (services, conditions, locations, phones, insurance/CareCredit,
credibility) were gathered from public listings for Brain Wellness Center
(brainwellnesscenter.com); copy is original. Testimonials are paraphrased
summaries of public patient reviews, not verbatim quotes. Verify addresses
and phone numbers against the practice before production deploy.
