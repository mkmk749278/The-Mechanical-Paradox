#!/usr/bin/env python3
"""How many GitHub runners this channel's render may take (PLAYBOOK §3a.4).

The owner's three channels share one account's 20 concurrent jobs (GitHub Free). With `--want auto`, count the jobs
running or queued in all three repos (other than this run's), and take what is free: 20 minus that, never fewer
than this channel's fair share of 7. A number for `--want` is used as given (1-20). Fails soft to 7: no token, an
API error or a timeout never stops a render.

Needs a fine-grained token with Actions: read on the three repos, in env RUNNER_SHARE_TOKEN (repo secret of the same
name). Prints the count on stdout; the reasoning goes to stderr (the workflow log).

  scripts/runner_share.py --want auto --run-id "$GITHUB_RUN_ID"
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.request

ACCOUNT_LIMIT = 20
FAIR_SHARE = 7
REPOS = ("mkmk749278/The-Mechanical-Paradox", "mkmk749278/Creator", "mkmk749278/Built-on-Bharat")
BUSY = {"queued", "in_progress", "waiting", "requested", "pending"}


def get(url: str, token: str) -> dict:
    req = urllib.request.Request(url, headers={
        "Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "runner-share"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.load(r)


def busy_jobs(token: str, own_run: str, repos: tuple[str, ...] = REPOS, fetch=get) -> int:
    """Jobs not yet finished in every unfinished run of the given repos, this run excluded."""
    total = 0
    for repo in repos:
        runs: dict[int, dict] = {}
        for status in ("in_progress", "queued"):
            for run in fetch(f"https://api.github.com/repos/{repo}/actions/runs?status={status}&per_page=100",
                             token).get("workflow_runs", []):
                runs[run["id"]] = run
        for rid in runs:
            if str(rid) == own_run:
                continue
            jobs = fetch(f"https://api.github.com/repos/{repo}/actions/runs/{rid}/jobs?per_page=100",
                         token).get("jobs", [])
            n = sum(1 for j in jobs if j.get("status") in BUSY)
            total += n
            print(f"{repo} run {rid}: {n} busy jobs", file=sys.stderr)
    return total


def share(want: str, token: str, own_run: str, fetch=get) -> int:
    if want != "auto":
        return max(1, min(ACCOUNT_LIMIT, int(want)))
    if not token:
        print(f"no RUNNER_SHARE_TOKEN: fair share {FAIR_SHARE}", file=sys.stderr)
        return FAIR_SHARE
    try:
        busy = busy_jobs(token, own_run, fetch=fetch)
    except Exception as e:  # fail soft per source: never block a render on this
        print(f"runner count failed ({e}): fair share {FAIR_SHARE}", file=sys.stderr)
        return FAIR_SHARE
    n = max(FAIR_SHARE, min(ACCOUNT_LIMIT, ACCOUNT_LIMIT - busy))
    print(f"{busy} jobs busy across the account: taking {n}", file=sys.stderr)
    return n


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--want", default="auto")
    ap.add_argument("--run-id", default=os.environ.get("GITHUB_RUN_ID", ""))
    a = ap.parse_args()
    print(share(a.want.strip().lower(), os.environ.get("RUNNER_SHARE_TOKEN", ""), a.run_id))


if __name__ == "__main__":
    main()
