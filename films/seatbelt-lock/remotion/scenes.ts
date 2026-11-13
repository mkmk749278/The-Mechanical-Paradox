import {cue, timing} from './cues';

// Film 3's scene list (script/screenplay.md). Each scene starts LEAD frames before its first sentence and ends where
// the next begins, so the spans tile the VO; the next scene dissolves in over XFADE frames on top. Scenes work in local
// frames; `at()` turns a phrase into a local frame, searched only inside the scene's own span.

export const LEAD = 30;
export const XFADE = 18;
/** The landing image holds after the last word before the sting (film 2 lesson, PLAYBOOK §5.4). */
export const LANDING_HOLD = 120;

const OPENINGS = {
	s01: '',
	s02: 'Imagine the simplest lock',
	s03: 'Start with the belt',
	s04: 'But now imagine a real crash',
	s05: 'So the lock works',
	s06: 'Engineers did two things',
	s07: 'And the second fix',
	s08: 'But what does letting go',
	s09: 'Ever pulled your belt',
	s10: 'Want to feel it yourself',
} as const;

export type SceneId = keyof typeof OPENINGS;
export const SCENE_IDS = Object.keys(OPENINGS) as SceneId[];

const starts = SCENE_IDS.map((id) => (OPENINGS[id] ? cue.sentence(OPENINGS[id]).from - LEAD : 0));

export const span = (id: SceneId): {from: number; to: number; dur: number} => {
	const i = SCENE_IDS.indexOf(id);
	const from = starts[i];
	const to = i + 1 < starts.length ? starts[i + 1] : timing.durationInFrames + LANDING_HOLD;
	return {from, to, dur: to - from};
};

/** A phrase's first frame in the scene's local frames (`after` narrows to the first match after another phrase). */
export const at = (id: SceneId, phrase: string, after?: string): number => {
	const s = span(id);
	const from = after ? cue.within(after, s.from, s.to).end : s.from;
	return cue.within(phrase, from, s.to).start - s.from;
};
/** A phrase's last frame in the scene's local frames. */
export const endOf = (id: SceneId, phrase: string, after?: string): number => {
	const s = span(id);
	const from = after ? cue.within(after, s.from, s.to).end : s.from;
	return cue.within(phrase, from, s.to).end - s.from;
};

for (let i = 0; i < SCENE_IDS.length; i++) {
	const s = span(SCENE_IDS[i]);
	if (s.dur < 240) throw new Error(`scene ${SCENE_IDS[i]} is only ${s.dur} frames`);
	if (i > 0 && span(SCENE_IDS[i - 1]).to !== s.from) throw new Error(`gap before ${SCENE_IDS[i]}`);
}
