"""Turn the chosen render into a clean, reusable avatar set.

The source render is reduced to a single coverage mask (0 = ground, 1 = ink),
which kills the model's vignette and colour drift. Every colourway is then
recomposited from that one mask, so all variants are the same mark."""

import os
import numpy as np
from PIL import Image, ImageDraw

OUT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(OUT, "source-render.png")

CANVAS = 1080        # Instagram uploads and stores at 1080
MARK = 618           # longest edge of the mark, leaves room for the circular crop


def coverage(src):
    """Project pixels onto the ground->ink axis and return coverage in [0,1]."""
    a = np.asarray(Image.open(src).convert("RGB")).astype(np.float32)
    ground = np.median(a[:24, :24].reshape(-1, 3), axis=0)

    d = np.linalg.norm(a - ground, axis=2)
    ink = np.median(a[d > np.percentile(d, 99.5)].reshape(-1, 3), axis=0)

    axis = ink - ground
    t = ((a - ground) @ axis) / (axis @ axis)
    return np.clip(t, 0.0, 1.0)


def rgb(h):
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], dtype=np.float32)


def compose(t, bg_hex, fg_hex):
    out = rgb(bg_hex) * (1 - t[..., None]) + rgb(fg_hex) * t[..., None]
    return Image.fromarray(out.round().astype(np.uint8))


def fit(im, t, bg_hex):
    """Crop to the mark, scale to a fixed size, centre it on a flat ground."""
    ys, xs = np.where(t > 0.5)
    art = im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    k = MARK / max(art.size)
    art = art.resize((round(art.width * k), round(art.height * k)), Image.LANCZOS)

    out = Image.new("RGB", (CANVAS, CANVAS), tuple(int(c) for c in rgb(bg_hex)))
    out.paste(art, ((CANVAS - art.width) // 2, (CANVAS - art.height) // 2))
    return out


def circle_preview(im, path):
    """How the avatar actually appears on Instagram: cropped to a circle."""
    n = im.size[0]
    mask = Image.new("L", (n, n), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, n - 1, n - 1), fill=255)
    out = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    out.paste(im.convert("RGBA"), (0, 0), mask)
    out.save(path)


COLOURWAYS = {
    "tms-avatar":       ("#16233F", "#5EDCC0"),   # primary — indigo ground, mint mark
    "tms-avatar-light": ("#F4EFE3", "#16233F"),   # light   — cream ground, indigo mark
    "tms-avatar-mint":  ("#5EDCC0", "#16233F"),   # accent  — mint ground, indigo mark
}

t = coverage(SRC)
for name, (bg_hex, fg_hex) in COLOURWAYS.items():
    full = fit(compose(t, bg_hex, fg_hex), t, bg_hex)
    full.save(os.path.join(OUT, f"{name}-1080.png"))
    for px in (320, 150, 64):
        full.resize((px, px), Image.LANCZOS).save(os.path.join(OUT, f"{name}-{px}.png"))
    circle_preview(full.resize((320, 320), Image.LANCZOS),
                   os.path.join(OUT, f"{name}-circle.png"))
    print("built", name)
