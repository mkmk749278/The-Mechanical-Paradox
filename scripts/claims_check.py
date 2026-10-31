#!/usr/bin/env python3
"""Fact-check gate for a documentary (PLAYBOOK §12, §22.10).

The fact-check pass (a fresh session or subagent at max effort, see .claude/skills/fact-check) writes
<project>/claims.csv with one row per factual claim in the script:

  id,claim,on_screen,timecode,status,source_url,source_quote,note
  C01,"Prahlad Jani claimed no food or water since 1940",yes,00:18,claim,https://...,"...he said he had...",present as his claim

status: confirmed (2+ independent sources agree, or 1 primary source) | claim (reported as someone's claim, said so in
the VO) | disputed (sources disagree: VO says "as reported", other figure in description) | unverified | wrong.

This gate fails when any row is `unverified` or `wrong`, when a confirmed/claim/disputed row has no source URL and
quote, or when a disputed row has no note. Run it before every render:

  python3 scripts/claims_check.py films/<slug>/claims.csv   (ported from Creator, 2026-10-24)
"""
import csv
import sys
from pathlib import Path

STATUSES = {"confirmed", "claim", "disputed", "unverified", "wrong"}
FIELDS = ["id", "claim", "on_screen", "timecode", "status", "source_url", "source_quote", "note"]


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    path = Path(sys.argv[1])
    with path.open(newline="") as f:
        reader = csv.DictReader(f)
        missing = [c for c in FIELDS if c not in (reader.fieldnames or [])]
        if missing:
            sys.exit(f"{path}: missing columns {missing}")
        rows = list(reader)
    problems = []
    for r in rows:
        rid, st = r["id"] or "?", r["status"].strip().lower()
        if st not in STATUSES:
            problems.append(f"{rid}: unknown status {r['status']!r}")
        elif st in ("unverified", "wrong"):
            problems.append(f"{rid}: {st}: {r['claim'][:80]}  -> fix the script or find a source")
        else:
            if not r["source_url"].startswith("http") or not r["source_quote"].strip():
                problems.append(f"{rid}: {st} without source URL and quote")
            if st == "disputed" and not r["note"].strip():
                problems.append(f"{rid}: disputed without a note (say 'as reported', give the other figure)")
    counts = {s: sum(r["status"].strip().lower() == s for r in rows) for s in STATUSES}
    print(f"{len(rows)} claims: " + ", ".join(f"{k} {v}" for k, v in sorted(counts.items()) if v))
    if problems:
        print("\n".join(problems))
        sys.exit(1)
    print("fact-check gate passed")


if __name__ == "__main__":
    main()
