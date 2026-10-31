#!/usr/bin/env python3
"""Measure YouTube demand and supply for candidate topics, for topic choice and packaging (PLAYBOOK §4.3, §13.1).
Ported from Built-on-Bharat (2026-10-31); the region is now a setting: GL=US (default), GB, IN … in the environment.

For each topic: YouTube autocomplete phrases (gl=$GL, hl=en) for its seed queries (demand: what people type), and the
top 20 search results for its main query (supply: what exists, with views, age, length, channel).
Study data only; nothing here goes into a film.

Usage: scripts/yt_demand.py topics.tsv OUTDIR
  topics.tsv: slug<TAB>main query<TAB>seed1|seed2|...   (lines starting with # are skipped)
Writes OUTDIR/<slug>.json and OUTDIR/summary.tsv. Polite: ~1.5 s between requests.
"""
import json
import re
import sys
import time
import urllib.parse
import urllib.request
import os
from pathlib import Path

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36"
PAUSE = 1.5
GL = os.environ.get("GL", "US")


def get(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "en-US,en;q=0.9"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")


def autocomplete(q: str) -> list[str]:
    url = ("https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&gl=" + GL + "&hl=en&q="
           + urllib.parse.quote(q))
    txt = get(url)
    m = re.search(r"\((\[.*\])\)\s*$", txt, re.S)
    if not m:
        return []
    return [row[0] for row in json.loads(m.group(1))[1]]


def views(text: str) -> int:
    m = re.match(r"([\d,]+)", text or "")
    return int(m.group(1).replace(",", "")) if m else 0


def search(q: str, n: int = 20) -> list[dict]:
    url = "https://www.youtube.com/results?hl=en&gl=" + GL + "&search_query=" + urllib.parse.quote(q)
    html = get(url)
    m = re.search(r"var ytInitialData = (\{.*?\});</script>", html, re.S)
    if not m:
        return []
    data = json.loads(m.group(1))
    out: list[dict] = []

    def walk(o):
        if len(out) >= n:
            return
        if isinstance(o, dict):
            if "videoRenderer" in o:
                v = o["videoRenderer"]
                out.append({
                    "id": v.get("videoId"),
                    "title": "".join(r.get("text", "") for r in v.get("title", {}).get("runs", [])),
                    "channel": "".join(r.get("text", "") for r in v.get("ownerText", {}).get("runs", [])),
                    "views": views(v.get("viewCountText", {}).get("simpleText", "")),
                    "age": v.get("publishedTimeText", {}).get("simpleText", ""),
                    "length": v.get("lengthText", {}).get("simpleText", ""),
                })
                return
            for val in o.values():
                walk(val)
        elif isinstance(o, list):
            for val in o:
                walk(val)

    walk(data)
    return out


def minutes(length: str) -> float:
    parts = [int(p) for p in length.split(":") if p.isdigit()]
    s = 0
    for p in parts:
        s = s * 60 + p
    return s / 60


def main() -> None:
    topics, outdir = Path(sys.argv[1]), Path(sys.argv[2])
    outdir.mkdir(parents=True, exist_ok=True)
    rows = []
    for line in topics.read_text().splitlines():
        if not line.strip() or line.startswith("#"):
            continue
        slug, main_q, seeds = line.split("\t")
        dest = outdir / f"{slug}.json"
        if dest.exists():
            rec = json.loads(dest.read_text())
        else:
            phrases = {}
            for s in seeds.split("|"):
                try:
                    phrases[s] = autocomplete(s)
                except Exception as e:  # fail soft per source
                    phrases[s] = [f"ERROR {e}"]
                time.sleep(PAUSE)
            try:
                results = search(main_q)
            except Exception as e:
                results = [{"error": str(e)}]
            time.sleep(PAUSE)
            rec = {"slug": slug, "query": main_q, "autocomplete": phrases, "results": results}
            dest.write_text(json.dumps(rec, indent=1, ensure_ascii=False))
        res = [r for r in rec["results"] if "views" in r]
        long_ = [r for r in res if minutes(r["length"]) >= 6]
        top = max(long_, key=lambda r: r["views"], default={})
        n_ac = sum(len(v) for v in rec["autocomplete"].values())
        rows.append([slug, main_q, str(n_ac), str(len(res)),
                     str(sum(1 for r in long_ if r["views"] >= 1_000_000)),
                     str(sum(1 for r in long_ if r["views"] >= 100_000)),
                     str(top.get("views", 0)), top.get("title", "")[:70], top.get("channel", ""), top.get("age", "")])
        print("\t".join(rows[-1]), flush=True)
    hdr = ["slug", "query", "autocomplete_n", "results", "long_1M+", "long_100K+", "top_long_views", "top_long_title",
           "top_channel", "top_age"]
    (outdir / "summary.tsv").write_text("\n".join("\t".join(r) for r in [hdr] + rows) + "\n")


if __name__ == "__main__":
    main()
