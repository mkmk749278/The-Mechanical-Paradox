import {cue, timing} from './cues';

// The film's scene list (scenes/README.md). Each scene starts LEAD frames before its first sentence and ends where
// the next begins, so the spans tile the VO with no gap; the next scene dissolves in over XFADE frames on top.
// Scenes work in local frames (0 = their own start); `at()` turns a phrase into a local frame.

export const LEAD = 36;
export const XFADE = 18;
/** The picture holds this long after the last word before the sting. */
export const TAIL = timing.durationInFrames - timing.words[timing.words.length - 1].endFrame;

const OPENINGS = {
	s01: '',
	s02: 'Take a bend that turns',
	s03: 'The answer is in the shape',
	s04: 'So what steers it',
	s05: 'Look closely at the tread',
	s06: 'Now watch the axle enter',
	s07: 'How big is that difference',
	s08: 'It even works on straight',
	s09: 'But shape has a limit',
	s10: 'And on a really tight curve',
	s11: 'On tight curves, the flange does',
	s12: 'And here is the twist',
	s13: "So why isn't your train",
	s14: 'Fast trains have a fix',
	s15: 'So the next time you hear',
} as const;

export type SceneId = keyof typeof OPENINGS;
export const SCENE_IDS = Object.keys(OPENINGS) as SceneId[];

const starts = SCENE_IDS.map((id) => (OPENINGS[id] ? cue.sentence(OPENINGS[id]).from - LEAD : 0));

export const span = (id: SceneId): {from: number; to: number; dur: number} => {
	const i = SCENE_IDS.indexOf(id);
	const from = starts[i];
	const to = i + 1 < starts.length ? starts[i + 1] : timing.durationInFrames;
	return {from, to, dur: to - from};
};

/**
 * A phrase's first frame in the scene's local frames, searched only inside the scene's own span (so a phrase the film
 * says twice is never ambiguous); `after` narrows to the first match after another phrase of the same scene.
 */
export const at = (id: SceneId, phrase: string, after?: string): number => {
	const s = span(id);
	const from = after ? cue.within(after, s.from, s.to).end : s.from;
	return cue.within(phrase, from, s.to).start - s.from;
};
/** A phrase's last frame in the scene's local frames (same search). */
export const endOf = (id: SceneId, phrase: string, after?: string): number => {
	const s = span(id);
	const from = after ? cue.within(after, s.from, s.to).end : s.from;
	return cue.within(phrase, from, s.to).end - s.from;
};

// every scene must have room to breathe, and the spans must tile the VO
for (let i = 0; i < SCENE_IDS.length; i++) {
	const s = span(SCENE_IDS[i]);
	if (s.dur < 240) throw new Error(`scene ${SCENE_IDS[i]} is only ${s.dur} frames`);
	if (i > 0 && span(SCENE_IDS[i - 1]).to !== s.from) throw new Error(`gap before ${SCENE_IDS[i]}`);
}
