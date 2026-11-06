#!/usr/bin/env bash
# apt-get install on a GitHub runner with a time limit per try: the Ubuntu mirror sometimes hangs a runner for hours
# (film 1, 2026-11-05/06: a Blender block cancelled after 6 h in Install; four 4K render jobs stuck 25+ min).
# Usage: scripts/apt_retry.sh PACKAGE…
set -uo pipefail
for i in 1 2 3 4; do
  if timeout 240 sudo apt-get update -qq && timeout 600 sudo apt-get install -y -qq "$@" > /dev/null; then exit 0; fi
  echo "::warning::apt-get try $i failed or timed out; retrying"
  sleep $((i * 15))
done
echo "::error::apt-get install $* failed 4 times"; exit 1
