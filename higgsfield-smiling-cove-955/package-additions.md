# Dependencies to add to `app/package.json`

Run from the Higgsfield website repo's `app/` directory:

```bash
bun add motion @phosphor-icons/react @number-flow/react \
  @fontsource-variable/bricolage-grotesque @fontsource-variable/instrument-sans
```

| Package | Why |
|---|---|
| `motion` | Scroll reveals, hero entrance, EEG-trace path drawing (`motion/react`) |
| `@phosphor-icons/react` | Icon family (duotone), one family for the whole page |
| `@number-flow/react` | Animated credibility-bar counters |
| `@fontsource-variable/bricolage-grotesque` | Display typeface (self-hosted) |
| `@fontsource-variable/instrument-sans` | Body typeface (self-hosted) |

No other runtime dependencies are required. No D1/R2/KV: `app/app.manifest.json`
stays all-off (static marketing page, conversion via click-to-call).
