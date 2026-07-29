# TMS Instagram avatar

Profile picture for an Instagram account explaining **TMS (transcranial magnetic
stimulation)**.

## The mark

A side profile of a head with a figure-eight (butterfly) treatment coil resting on
the crown, and three pulse waves radiating down into the brain — the actual shape
of a TMS coil and the actual thing it does, reduced to line art.

It's a single-weight, two-colour icon so it survives being shrunk to the 40-ish
pixels Instagram gives you next to a comment.

## Files

| File | Use |
| --- | --- |
| `tms-avatar-1080.png` | **Primary.** Upload this one. Indigo ground, mint mark. |
| `tms-avatar-320.png` | Same mark at the size Instagram displays on a profile. |
| `tms-avatar-light-1080.png` | Light colourway — cream ground, indigo mark. |
| `tms-avatar-mint-1080.png` | Accent colourway — mint ground, indigo mark. |
| `index.html` | Side-by-side preview, circle-cropped at real display sizes. |
| `source-render.png` | The raw render everything is derived from. |
| `build-avatar.py` | Rebuilds every colourway and size from the source render. |

## Palette

| Colour | Hex |
| --- | --- |
| Indigo | `#16233F` |
| Mint | `#5EDCC0` |
| Cream | `#F4EFE3` |

## Notes

Instagram crops avatars to a circle, so the mark is centred inside a 618 px box on
a 1080 px canvas — the corners of the artwork stay well clear of the crop edge, and
the background runs to all four edges so no pale ring shows up after cropping.

To rebuild after changing colours or sizes:

```sh
pip install pillow numpy
python3 build-avatar.py
```
