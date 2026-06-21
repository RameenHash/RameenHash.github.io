# Brain Wellness Center — qpTMS 30s Ad

Assembles a **30s 16:9 master** + **9:16 vertical** from Higgsfield-generated
clips, with the voiceover laid under. Beat plan (seconds): **4 / 5 / 6 / 6 / 5 / 4**.

```
hook → pivot → science → treatment → transformation → CTA card
 4s     5s       6s         6s            5s            4s      = 30s
```

## Assets (Higgsfield library)

| Beat | Role | Higgsfield job | 16:9 source | 9:16 (Reframe) |
|------|------|----------------|-------------|----------------|
| 1 | hook | `44d97d1e` | seedance_2_0 | `0b2eb24c` |
| 2 | pivot | `8dcc08c3` | seedance_2_0 | `e34ad6d8` |
| 3 | science | `e7e5be39` | seedance_2_0 | `f8cd4eb6` |
| 4 | treatment | `6bfb3e8c` | seedance_2_0 | `559b7f51` |
| 5 | transformation | `c0849c0c` | seedance_2_0 | `ac125e4f` |
| 6 | CTA end card | `07ce8618` | nano_banana_2 image (2752×1536) | center-safe crop |
| — | voiceover | `c8b699b9` | Higgsfield "Voiceover" (laid under) | same |

Notes:
- The 9:16 master uses the user's existing Higgsfield **Reframe** renders of each
  clip (true reframing), not a naive center-crop.
- The CTA card was authored with all copy inside a center safe-zone, so the 9:16
  variant center-crops it (`crop=ih*9/16:ih`) and the text stays intact.
- Higgsfield also has 4K Topaz upscales of hook (`1b330851`) and science
  (`97e12d67`); not used for the 1080p masters.

## Render variant

**Clean** (no burned captions). Audio = voiceover only (no music bed was
specified), normalized to ≈ -16 LUFS and laid full-length under the cut.

## Build

```bash
./build.sh                      # download sources + silent masters -> out/
VO=/path/to/vo.wav ./build.sh   # also render out/{16x9,9x16}_master_final.mp4
```

Outputs (git-ignored, see `.gitignore`):
- `out/16x9_master_silent.mp4`, `out/9x16_master_silent.mp4`
- `out/16x9_master_final.mp4`, `out/9x16_master_final.mp4` (when `VO` is set)

## Voiceover note

Higgsfield's MCP API does not surface "Voiceover" jobs through
`show_generations`/`show_medias`, and fetch-by-id needs the full job UUID
(only the `c8b699b9` prefix is known). The VO is therefore supplied out-of-band
(upload widget / direct download URL) and passed to `build.sh` via `VO=`.
