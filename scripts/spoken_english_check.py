#!/usr/bin/env python3
"""Spoken-English gate for English narration. Ported from mkmk749278/Creator (2026-10-24); `--story` added for
story-style films (PLAYBOOK §7.8): a story speaks to the viewer less often than an explainer, so the "you"
and question targets are gentler, and names (words that are always capitalised) don't count as rare words.

Measures a VO the way we measured the Indian explainer channels that hold viewers (study 2026-10-20) and fails
when the script drifts toward "read text": long sentences, no questions, no "you", no narrator, fancy words,
foreign slang, no punch / expansion rhythm, semicolons.

usage: python3 scripts/spoken_english_check.py films/<slug>/script/vo.txt --story [--min-words 1800 --max-words 3200]
       (a script.tsv works too: the `en` column is read)
needs: pip install -e '.[script]'   (wordfreq, for the rare-word check)
"""
import argparse
import csv
import re
import sys

from wordfreq import zipf_frequency

# Words everyday Indian viewers know even though they are rare in global English text.
INDIAN_OK = {"rupee", "rupees", "lakh", "lakhs", "crore", "crores", "kirana", "chai", "salary", "emi", "upi", "qr",
             "debited", "credited", "shopkeeper", "recharge", "aadhaar", "pan", "kyc", "atm", "otp", "metro", "auto",
             "rickshaw", "scooty", "tiffin", "paise", "pin", "app", "apps", "paytm", "phonepe", "gpay", "bhim",
             # Indian places and brands every viewer knows, and the film's own subject words, said and shown (2026-10-21)
             "pune", "kerala", "odisha", "nadu", "andhra", "visakhapatnam", "bajaj", "chetak", "chetaks", "scooter",
             "scooters", "magnet", "magnets", "earths",
             # jet engine film subject words (2026-10-22)
             "afterburner", "kaveri", "kilonewtons", "ghatak", "ilyushin", "compressor", "hangar", "hangars", "bengaluru",
             "kilos", "kishore"}
# Fancy words that make narration sound like a textbook; say the plain word instead.
FANCY = {"utilize": "use", "utilise": "use", "commence": "start", "facilitate": "help", "subsequently": "then",
         "approximately": "about", "numerous": "many", "regarding": "about", "phenomenon": "thing", "conundrum": "puzzle",
         "endeavour": "try", "endeavor": "try", "ascertain": "find out", "terminate": "end", "sufficient": "enough",
         "obtain": "get", "require": "need", "purchase": "buy", "individuals": "people", "prior": "before",
         "however": "but", "therefore": "so", "thus": "so", "hence": "so", "moreover": "also", "furthermore": "also",
         "nevertheless": "still", "whereby": "where", "wherein": "where", "erratically": "strangely",
         "exasperating": "annoying", "initiate": "start", "remitter": "your bank", "beneficiary": "their bank",
         "transaction": "payment", "transactions": "payments",
         "delve": "look at", "harnessing": "using", "harness": "use", "imperative": "important", "testament": "proof",
         "notwithstanding": "despite", "aforementioned": "this", "consequently": "so", "promulgated": "made",
         "optimize": "speed up", "seamless": "smooth", "leverage": "use", "paradigm": "model"}
# Phrases from the owner's blueprint (Part H): formal AI phrases and foreign slang that clash with an Indian voice.
BANNED_PHRASES = ["in conclusion", "it is imperative", "testament to", "in accordance with", "y'all", "stoked",
                  "no cap", "buckle up", "fam", "touch base", "rent-free", "rent free", "ballpark", "bite the bullet",
                  "hello friends", "welcome back", "in this video", "let us understand", "smash that", "hit the bell"]
YOU = {"you", "your", "you're", "you'll", "you've", "yours", "yourself"}
ME = {"i", "me", "my", "i'm", "i'll", "i've", "we", "us", "our", "let's", "we're", "we'll"}
CHECKINS = ("right?", "isn't it?", "makes sense?", "no?", "see,", "you know", "imagine", "tell me", "think about it",
            "here's the catch", "here's the thing", "the reality is", "now notice this", "look at", "put simply")
DOTTED = re.compile(r"\b(?:[A-Z]\.){2,}")


def undot(text):
    """U.P.I. is one word; keep one full stop when the acronym ends a sentence."""
    return re.sub(r"\b((?:[A-Z]\.){2,})(?=(\s+[A-Z\n]|\s*$))?",
                  lambda m: m.group(1).replace(".", "") + ("." if m.group(2) is not None else ""), text, flags=re.M)


def sentences(text):
    text = undot(text)
    parts = re.split(r"(?<=[.?!])\s+", text.replace("...", "… "))
    return [p.strip() for p in parts if re.search(r"[A-Za-z]", p)]


def words(s):
    return re.findall(r"[A-Za-z][A-Za-z'\-]*", undot(s))


def load(path):
    if path.endswith(".tsv"):
        with open(path, newline="", encoding="utf-8") as f:
            return " ".join(r.get("en", "") for r in csv.DictReader(f, delimiter="\t"))
    return open(path, encoding="utf-8").read()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("path")
    ap.add_argument("--min-words", type=int, default=320)
    ap.add_argument("--max-words", type=int, default=440)
    ap.add_argument("--story", action="store_true", help="story-film targets (PLAYBOOK §7.8)")
    ap.add_argument("--terms", help="a film's glossary (one term per line): technical words the film shows and "
                                    "explains on screen, so they don't count as rare (The Mechanical Paradox, PLAYBOOK §7.3)")
    a = ap.parse_args()
    min_q, min_you = (0.08, 1.0) if a.story else (0.10, 3)
    text = load(a.path)
    sents = sentences(text)
    ws = [w.lower().strip("-") for w in words(text)]
    n = len(ws)
    lens = [len(words(s)) for s in sents]
    fails, notes = [], []

    if not a.min_words <= n <= a.max_words:  # a guide, not a cap (owner, 2026-10-20: the narration being good comes first)
        notes.append(f"{n} words, guide {a.min_words}-{a.max_words}: fine if every line earns its place")
    avg = n / len(sents)
    if not 7.5 <= avg <= 14:
        fails.append(f"average sentence {avg:.1f} words, want 7.5-14 (creators: 11-13)")
    for s, l in zip(sents, lens):
        if l > 25:
            fails.append(f"sentence of {l} words (max 25): {s[:70]}…")
    for i in range(len(lens) - 2):
        if max(lens[i:i + 3]) - min(lens[i:i + 3]) <= 1 and min(lens[i:i + 3]) >= 6:
            notes.append(f"three same-length sentences in a row ({lens[i:i + 3]}): {sents[i][:50]}…")
    punch = sum(3 <= l <= 6 for l in lens) / len(lens)
    expand = sum(12 <= l <= 18 for l in lens) / len(lens)
    if punch < 0.15 or expand < 0.15:
        fails.append(f"rhythm: {100 * punch:.0f}% punches (3-6 words) and {100 * expand:.0f}% expansions (12-18), "
                     "want >= 15% each (punch → expansion → checkpoint)")
    q = sum(s.endswith("?") for s in sents)
    if q / len(sents) < min_q:
        fails.append(f"questions are {100 * q / len(sents):.0f}% of sentences, want >= {100 * min_q:.0f}% (creators: 12-22%)")
    you = 100 * sum(w in YOU for w in ws) / n
    if you < min_you:
        fails.append(f"'you/your' {you:.1f} per 100 words, want >= {min_you} (creators: 2-6)")
    me = 100 * sum(w in ME for w in ws) / n
    if me < 1:  # a note since 2026-10-20: audience reviews (§4a-11) flagged forced "I find…" lines as template filler
        notes.append(f"narrator 'I/me/we/let's' {me:.1f} per 100 words (creators: 1-5); add one only where it sounds natural")
    low = text.lower()
    checks = sum(low.count(c) for c in CHECKINS)
    if checks < 2:
        fails.append(f"{checks} check-ins (right? / see, / imagine / tell me …), want >= 2")
    for p in BANNED_PHRASES:
        if re.search(r"\b" + re.escape(p) + r"\b", low):
            fails.append(f"banned phrase '{p}' (Part H)")
    if ";" in text:
        fails.append("semicolon: TTS collapses it; use a full stop or a spaced dash")
    fancy = sorted({w for w in ws if w in FANCY})
    for w in fancy:
        fails.append(f"fancy word '{w}': say '{FANCY[w]}'")
    acronyms = {m.group(0).replace(".", "").lower() for m in DOTTED.finditer(text)}
    names = set()
    if a.story:  # a word that is always written with a capital is a name: say it, don't explain it
        raw = re.findall(r"[A-Za-z][A-Za-z'\-]*", undot(text))
        caps = {w.lower() for w in raw if w[0].isupper()}
        lower = {w for w in raw if w[0].islower()}
        names = caps - lower
    terms = set()
    if a.terms:
        terms = {t.strip().lower() for t in open(a.terms, encoding="utf-8") if t.strip() and not t.startswith("#")}
    content = [w for w in ws if len(w) > 3 and w not in INDIAN_OK | acronyms | names | terms and not w.endswith("'s")]
    rare = sorted({w for w in content if zipf_frequency(w, "en") < 3.5})
    rare_pct = 100 * sum(w in rare for w in content) / max(1, len(content))
    if rare_pct > 4:
        fails.append(f"rare words {rare_pct:.1f}% of content words, want <= 4: {', '.join(rare[:12])}")
    elif rare:
        notes.append(f"rare words (explain each once in plain words): {', '.join(rare)}")
    if re.search(r'[0-9₹!"()\[\]]', text):
        fails.append("digits, ₹, !, double quotes or brackets in VO text")
    bare = sorted(set(re.findall(r"\b[A-Z]{2,}\b", text)))
    if bare:
        fails.append(f"bare capital acronyms (write U.P.I. for Akash): {', '.join(bare)}")

    print(f"{n} words · {len(sents)} sentences · avg {avg:.1f} · questions {100 * q / len(sents):.0f}% · "
          f"you {you:.1f}/100 · I/we {me:.1f}/100 · check-ins {checks} · rare {rare_pct:.1f}% · "
          f"punch {100 * punch:.0f}% · expand {100 * expand:.0f}% · ≈{n / 150 * 60:.0f} s at 150 wpm")
    for m in notes:
        print("  note:", m)
    for m in fails:
        print("  FAIL:", m)
    print("spoken-English check", "failed" if fails else "passed")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
