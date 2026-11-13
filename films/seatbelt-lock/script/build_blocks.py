#!/usr/bin/env python3
"""vo.txt → blocks_performance.md: one recording block per chapter (PLAYBOOK §7.7, decision 7).

Blocks are cut from the locked script, never typed by hand, so the recording always matches vo.txt word for word.
Run: python3 films/seatbelt-lock/script/build_blocks.py
"""
import json
from pathlib import Path

HERE = Path(__file__).parent
# Said-as spellings for the recording only (vo.txt and the captions keep the real spelling). Each was tested: the voice
# (none yet for film 3; add one here only when a measured take mispronounces a word)
SAY: dict[str, str] = json.loads((HERE / "say.json").read_text()) if (HERE / "say.json").exists() else {}
chapters: list[tuple[str, list[str]]] = []
for line in (HERE / "vo.txt").read_text().splitlines():
    if line.startswith("## "):
        chapters.append((line[3:].strip(), []))
    elif line.strip():
        chapters[-1][1].append(line.strip())

out = ["# Film 3: recording blocks (generated from vo.txt by build_blocks.py)", "",
       "One block per chapter. The channel voice \"The Mechanical Paradox\", the newest Eleven flagship model, stability",
       "0.50, similarity 0.80, style 0, speed 1.0, speaker boost on; no tags (PLAYBOOK §7.5–7.7). Generated with",
       "`scripts/eleven_tts.py films/seatbelt-lock` (block 1 first, measured, then the rest). Paragraph breaks are kept.", ""]
for i, (name, paras) in enumerate(chapters, 1):
    text = "\n\n".join(paras)
    for real, said in SAY.items():
        text = text.replace(real, said)
    assert not any(c.isdigit() for c in text), f"digits in block {i}: numbers must be words (§7.3)"
    out += [f"## b{i:02d} · {name} · {len(text)} characters", "", "```", text, "```", ""]
(HERE / "blocks_performance.md").write_text("\n".join(out))
print(f"{len(chapters)} blocks, {sum(len(chr) for _, p in chapters for chr in p)} characters")
