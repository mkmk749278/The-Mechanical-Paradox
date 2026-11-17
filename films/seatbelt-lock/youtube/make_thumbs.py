"""Film 3 thumbnails (step 11): real Pixabay photos (Pixabay Content License, media_manifest.csv), graded and lettered
in the channel's display font. No generated imagery. Usage: python3 make_thumbs.py PHOTO_DIR FONT_DIR OUT_DIR"""
import sys
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageChops

src, fonts, out = sys.argv[1:4]
W, H = 1280, 720
AMBER, WHITE, CRIMSON = (255, 159, 28), (255, 255, 255), (255, 59, 48)


def grade(im, bright=0.8, sat=0.75, cool=True):
    im = ImageEnhance.Color(im).enhance(sat)
    im = ImageEnhance.Brightness(im).enhance(bright)
    im = ImageEnhance.Contrast(im).enhance(1.2)
    if cool:
        r, g, b = im.split()
        r = r.point(lambda v: int(v * 0.88)); b = b.point(lambda v: min(255, int(v * 1.06 + 6)))
        im = Image.merge("RGB", (r, g, b))
    return im


def cover(im, box, focus=(0.5, 0.5), zoom=1.0):
    """crop im to fill box (w,h) at zoom, centred on focus (fractions)"""
    bw, bh = box
    s = max(bw / im.width, bh / im.height) * zoom
    im = im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)
    x = int(min(max(focus[0] * im.width - bw / 2, 0), im.width - bw))
    y = int(min(max(focus[1] * im.height - bh / 2, 0), im.height - bh))
    return im.crop((x, y, x + bw, y + bh))


def left_fade(im, start=0.0, end=0.55, dark=(7, 10, 15), strength=0.92):
    m = Image.new("L", (W, 1))
    for x in range(W):
        t = (x / W - start) / (end - start)
        m.putpixel((x, 0), int(255 * strength * max(0.0, min(1.0, 1 - t))))
    m = m.resize((W, H))
    return Image.composite(Image.new("RGB", (W, H), dark), im, m)


def vignette(im, k=0.55):
    m = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(m)
    d.ellipse((-W * 0.25, -H * 0.3, W * 1.25, H * 1.3), fill=255)
    m = m.filter(ImageFilter.GaussianBlur(160))
    dark = ImageEnhance.Brightness(im).enhance(1 - k)
    return Image.composite(im, dark, m)


def glow_line(im, p0, p1, colour, width=26, blur=22, alpha=0.85):
    layer = Image.new("RGB", (W, H), (0, 0, 0))
    ImageDraw.Draw(layer).line([p0, p1], fill=colour, width=width)
    layer = layer.filter(ImageFilter.GaussianBlur(blur))
    return ImageChops.add(im, ImageEnhance.Brightness(layer).enhance(alpha))


def glow_spot(im, c, r, colour, alpha=1.0):
    layer = Image.new("RGB", (W, H), (0, 0, 0))
    ImageDraw.Draw(layer).ellipse((c[0] - r, c[1] - r, c[0] + r, c[1] + r), fill=colour)
    layer = layer.filter(ImageFilter.GaussianBlur(r * 0.7))
    return ImageChops.add(im, ImageEnhance.Brightness(layer).enhance(alpha))


def text(im, lines, x, y, size, gap=0.02, font="archivo_black.ttf"):
    """lines: [(str, colour)], stacked from y; a soft shadow under each"""
    f = ImageFont.truetype(f"{fonts}/{font}", size)
    sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ds = ImageDraw.Draw(sh)
    yy = y
    pos = []
    for s, c in lines:
        pos.append((s, c, yy))
        ds.text((x + 4, yy + 6), s, font=f, fill=(0, 0, 0, 220))
        yy += int(size * (1.0 + gap))
    sh = sh.filter(ImageFilter.GaussianBlur(10))
    im = Image.alpha_composite(im.convert("RGBA"), sh)
    d = ImageDraw.Draw(im)
    for s, c, yy in pos:
        d.text((x, yy), s, font=f, fill=c)
    return im.convert("RGB")


hand = Image.open(f"{src}/p4227630.jpg").convert("RGB")
back = Image.open(f"{src}/p1865856.jpg").convert("RGB")
pov = Image.open(f"{src}/p2942982.jpg").convert("RGB")

# A · NO CHIP?  the hand yanking the belt, pushed right; the belt's run toward the pillar lit amber
def hand_plate(zoom=1.18, focus=(0.42, 0.42)):
    im = cover(grade(hand, 0.78, 0.55), (W, H), focus, zoom)
    canvas = Image.new("RGB", (W, H), (7, 10, 15))
    canvas.paste(im.crop((0, 0, int(W * 0.78), H)), (int(W * 0.22), 0))
    return canvas

def hand_plate2(zoom=1.0, focus=(0.5, 0.45), x0=0.30):
    im = grade(hand, 0.8, 0.3)
    im = cover(im, (int(W * (1 - x0)), H), focus, zoom)
    canvas = Image.new("RGB", (W, H), (7, 10, 15))
    canvas.paste(im, (int(W * x0), 0))
    return canvas

a = hand_plate2(1.0, (0.5, 0.42))
a = left_fade(vignette(a, 0.45), 0.25, 0.48)
a1 = text(a, [("NO", WHITE), ("CHIP?", AMBER)], 56, 150, 200)
a1.save(f"{out}/thumb_a_no-chip.jpg", quality=92)
a2 = text(a, [("IT", WHITE), ("KNOWS?", AMBER)], 56, 150, 180)
a2.save(f"{out}/thumb_b_it-knows.jpg", quality=92)

# C · JERK IT. LOCKED.  the same hand, closer; a crimson glow where the belt stops
c = hand_plate2(1.0, (0.5, 0.42))
c = glow_spot(c, (1100, 60), 90, CRIMSON, 0.35)
c = left_fade(vignette(c, 0.5), 0.1, 0.48)
c = text(c, [("SLOW: OK", WHITE), ("FAST:", WHITE), ("LOCKED", CRIMSON)], 56, 120, 140)
c.save(f"{out}/thumb_c_slow-fast.jpg", quality=92)

# D · the back seat view, belt across the shoulder lit amber; NO CHIP?
d = cover(grade(back, 0.85, 0.6), (W, H), (0.6, 0.5), 1.05)
d = glow_line(d, (870, 520), (1200, 150), AMBER, 22, 26, 0.55)
d = left_fade(vignette(d, 0.45), 0.05, 0.5)
d = text(d, [("NO", WHITE), ("CHIP?", AMBER)], 56, 150, 200)
d.save(f"{out}/thumb_d_back-seat.jpg", quality=92)

# E · the driver's view, belt across the frame
e = cover(grade(pov, 0.8, 0.5), (W, H), (0.55, 0.5), 1.0)
e = left_fade(vignette(e, 0.4), 0.0, 0.42, strength=0.85)
e = text(e, [("WHY IT", WHITE), ("LOCKS", AMBER)], 56, 170, 170)
e.save(f"{out}/thumb_e_why-locks.jpg", quality=92)

# F · the real belt, and the hidden part: our Cycles render of the retractor (not a photograph) in a cut-out disc
reel = Image.open(f"{src}/reel.jpg").convert("RGB")
f_ = hand_plate2(1.0, (0.5, 0.42), 0.22)
f_ = left_fade(vignette(f_, 0.5), 0.22, 0.46, strength=0.95)
R = 265; cx, cy = 985, 445
disc = cover(reel, (2 * R, 2 * R), (0.5, 0.45), 1.0)
mask = Image.new("L", (2 * R, 2 * R), 0); ImageDraw.Draw(mask).ellipse((0, 0, 2 * R - 1, 2 * R - 1), fill=255)
f_ = glow_spot(f_, (cx, cy), R + 40, AMBER, 0.35)
sh = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ImageDraw.Draw(sh).ellipse((cx - R - 10, cy - R + 6, cx + R + 10, cy + R + 26), fill=(0, 0, 0, 200))
f_ = Image.alpha_composite(f_.convert("RGBA"), sh.filter(ImageFilter.GaussianBlur(18))).convert("RGB")
f_.paste(disc, (cx - R, cy - R), mask)
ImageDraw.Draw(f_).ellipse((cx - R, cy - R, cx + R, cy + R), outline=AMBER, width=9)
f_ = text(f_, [("NO", WHITE), ("CHIP?", AMBER)], 48, 170, 190)
f_.save(f"{out}/thumb_f_inside.jpg", quality=92)

# G · the retractor render full frame, the teeth lit; IT KNOWS?
g = cover(reel, (W, H), (0.55, 0.45), 1.0)
g = left_fade(vignette(g, 0.4), 0.0, 0.38, strength=0.9)
g = text(g, [("NO", WHITE), ("CHIP?", AMBER)], 56, 150, 200)
g.save(f"{out}/thumb_g_reel.jpg", quality=92)

# F2 · the panel's change (review/package_v1.md): the reel with its webbing, bigger, so the gear reads as the belt's own
hk = Image.open(f"{src}/hk_60.jpg").convert("RGB").crop((290, 0, 960, 670))
hk = ImageEnhance.Brightness(hk).enhance(1.25)
f2 = hand_plate2(1.0, (0.5, 0.42), 0.22)
f2 = left_fade(vignette(f2, 0.5), 0.22, 0.46, strength=0.95)
R = 300; cx, cy = 960, 410
disc = hk.resize((2 * R, 2 * R), Image.LANCZOS)
mask = Image.new("L", (2 * R, 2 * R), 0); ImageDraw.Draw(mask).ellipse((0, 0, 2 * R - 1, 2 * R - 1), fill=255)
f2 = glow_spot(f2, (cx, cy), R + 40, AMBER, 0.35)
sh = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ImageDraw.Draw(sh).ellipse((cx - R - 10, cy - R + 6, cx + R + 10, cy + R + 26), fill=(0, 0, 0, 200))
f2 = Image.alpha_composite(f2.convert("RGBA"), sh.filter(ImageFilter.GaussianBlur(18))).convert("RGB")
f2.paste(disc, (cx - R, cy - R), mask)
ImageDraw.Draw(f2).ellipse((cx - R, cy - R, cx + R, cy + R), outline=AMBER, width=9)
f2 = text(f2, [("NO", WHITE), ("CHIP?", AMBER)], 48, 170, 190)
f2.save(f"{out}/thumb_f2_reel-webbing.jpg", quality=92)
print("ok")
