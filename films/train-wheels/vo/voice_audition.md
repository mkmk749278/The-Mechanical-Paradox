# Narrator audition (owner, 2026-10-31: "audition 3 global voices")

Three ElevenLabs library voices, each described by ElevenLabs as suited to documentary or informative narration
(https://elevenlabs.io/voice-library/documentary-narrator-voices, read 2026-10-31). Same paragraph, same settings, so
the voice is the only thing that changes.

| # | Voice (library name) | Voice ID | Library description | Why it's here |
|---|---|---|---|---|
| A | Bill – Informative, Clean and Natural | `lnUnPeUhSI5EcqtFBux7` | American, young male, informative, clean, natural | The US is our largest Tier-1 market; clean and unforced |
| B | Patrick International | `9Ft9sm9dzvprPILZmLJl` | Deep male, international accent, documentary and narration | Neutral for every market; the depth suits the dark, precise look |
| C | Dan – Engaging Science Instructor | `BHr135B5EUBtaWheVj8S` | British male, warm, engaging | Warmth for a science explainer; strong in the UK and India |

**Settings for all three:** Eleven v4, stability 0.50, similarity 0.80, speed 1.0, speaker boost on, style 0 if
shown; no tags. Two takes each. Save as `audition_A1.mp3`, `audition_A2.mp3`, `audition_B1.mp3`… in Drive
`The-Mechanical-Paradox/train-wheels/vo/`, or send them in the chat.

**What we judge:** clarity for a non-native listener, warmth, low-register depth, whether the voice varies its pace on
its own, how it handles numbers ("seven tenths of a millimeter") and the question lines. Each take is measured with
`scripts/vo_review.py` (pace, pauses, pitch range, voice drift) before the owner picks.

The audition paragraph is the bank-card beat from the locked script (VO v6, 2026-11-04): a question, a number, a
punch line and a short-sentence rhythm.

```
How big is that difference? You might guess centimeters. Take the textbook version, two wheels and their axle, which engineers call a wheelset. If you shift it as far as it can go, its two wheels differ in radius by about seven tenths of a millimeter. About the thickness of the bank card in your wallet.

So on a gentle curve, what you are looking at is the whole steering system. No gears, no levers. Just shape.
```
