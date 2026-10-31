#!/usr/bin/env python3
# Ported from Built-on-Bharat (2026-10-31; originally mkmk749278/Creator) for sourcing and review (PLAYBOOK §11, §14).
"""Timecoded contact sheets of a video (or a folder of images) for review on a phone or by Opus (PLAYBOOK §14).

  python3 scripts/contact_sheet.py CUT.mp4 --out runs/<slug>/qa --every 2      # one frame every 2 s
  python3 scripts/contact_sheet.py media/folder --out qa                         # every image, labelled by name

Writes sheet-NN.jpg (3x3 tiles, 1536 px wide: sharp enough for Opus to read on-screen numbers, small enough for
SendUserFile) and frames.json (sheet, tile, time/file). Each tile carries its timecode or file name.
"""
import argparse
import json
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

TILE_W, TILE_H, COLS, ROWS = 512, 288, 3, 3
IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp"}


def font(size):
    for f in ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf"):
        if Path(f).exists():
            return ImageFont.truetype(f, size)
    return ImageFont.load_default()


def tc(t):
    return f"{int(t // 60):02d}:{t % 60:05.2f}"


def video_frames(path: Path, every: float, tmp: Path):
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                                str(path)], capture_output=True, text=True, check=True).stdout.strip())
    subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-vf", f"fps=1/{every},scale={TILE_W}:{TILE_H}:"
                    f"force_original_aspect_ratio=decrease,pad={TILE_W}:{TILE_H}:(ow-iw)/2:(oh-ih)/2",
                    str(tmp / "f%05d.png")], check=True)
    files = sorted(tmp.glob("f*.png"))
    # fps=1/N samples the middle of each N-second window.
    return [(f, tc(min(dur, (i + 0.5) * every))) for i, f in enumerate(files)]


def image_frames(folder: Path):
    files = sorted(p for p in folder.iterdir() if p.suffix.lower() in IMAGE_EXT)
    return [(f, f.name) for f in files]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("src", type=Path)
    ap.add_argument("--out", type=Path, required=True)
    ap.add_argument("--every", type=float, default=2.0, help="seconds between frames (video input)")
    a = ap.parse_args()
    a.out.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        frames = image_frames(a.src) if a.src.is_dir() else video_frames(a.src, a.every, Path(tmp))
        if not frames:
            sys.exit("no frames")
        per = COLS * ROWS
        label_font = font(22)
        index = []
        for s in range(0, len(frames), per):
            sheet = Image.new("RGB", (COLS * TILE_W, ROWS * TILE_H), (12, 12, 12))
            draw = ImageDraw.Draw(sheet)
            for k, (f, label) in enumerate(frames[s:s + per]):
                im = Image.open(f).convert("RGB")
                im.thumbnail((TILE_W, TILE_H))
                x, y = (k % COLS) * TILE_W, (k // COLS) * TILE_H
                sheet.paste(im, (x + (TILE_W - im.width) // 2, y + (TILE_H - im.height) // 2))
                box = draw.textbbox((0, 0), label, font=label_font)
                draw.rectangle((x, y, x + box[2] + 16, y + box[3] + 10), fill=(0, 0, 0))
                draw.text((x + 8, y + 4), label, fill=(255, 220, 60), font=label_font)
                index.append({"sheet": s // per + 1, "tile": k + 1, "label": label})
            sheet.save(a.out / f"sheet-{s // per + 1:02d}.jpg", quality=88)
        (a.out / "frames.json").write_text(json.dumps(index, indent=1))
    print(f"{len(frames)} frames -> {(len(frames) + per - 1) // per} sheet(s) in {a.out}")


if __name__ == "__main__":
    main()
