// VO timing (PLAYBOOK §10.4): scenes cue to words, never to typed frame numbers. Every cue is a phrase from vo.txt,
// so the recorded VO's timing.json replaces a provisional one without touching scene code. A phrase that is missing
// or ambiguous throws at bundle time, never silently drifts.

export type TimedWord = {s: number; w: string; start: number; end: number; startFrame: number; endFrame: number};
export type TimedSentence = {id: number; chapter: string; text: string; start: number; end: number; startFrame: number; endFrame: number};
export type Timing = {
	fps: number;
	provisional?: boolean;
	duration: number;
	durationInFrames: number;
	sentences: TimedSentence[];
	words: TimedWord[];
	chapters: {title: string; start: number; startFrame: number}[];
};

const norm = (w: string): string => w.toLowerCase().replace(/[^a-z0-9']/g, '');

export type Cues = {
	/** First frame of the phrase's first word. `after` picks the first match after another phrase. */
	at: (phrase: string, after?: string) => number;
	/** Last frame of the phrase's last word. */
	end: (phrase: string, after?: string) => number;
	/** Frame span of the sentence that starts with these words. */
	sentence: (opening: string) => {from: number; to: number};
	total: number;
	provisional: boolean;
};

export const makeCues = (t: Timing): Cues => {
	const words = t.words.map((w) => norm(w.w));
	const find = (phrase: string, from: number): number[] => {
		const p = phrase.split(/\s+/).map(norm).filter(Boolean);
		const hits: number[] = [];
		for (let i = from; i <= words.length - p.length; i++) {
			if (p.every((x, k) => words[i + k] === x)) hits.push(i);
		}
		return hits;
	};
	const locate = (phrase: string, after?: string): [number, number] => {
		let from = 0;
		if (after) {
			const a = find(after, 0);
			if (a.length !== 1) throw new Error(`cue anchor "${after}": ${a.length} matches`);
			from = a[0];
		}
		const hits = find(phrase, from);
		if (hits.length === 0) throw new Error(`cue "${phrase}"${after ? ` after "${after}"` : ''}: not in the VO`);
		if (!after && hits.length > 1) throw new Error(`cue "${phrase}": ${hits.length} matches, give an anchor`);
		return [hits[0], hits[0] + phrase.split(/\s+/).filter((x) => norm(x)).length - 1];
	};
	return {
		at: (phrase, after) => t.words[locate(phrase, after)[0]].startFrame,
		end: (phrase, after) => t.words[locate(phrase, after)[1]].endFrame,
		sentence: (opening) => {
			const [i] = locate(opening);
			const s = t.sentences[t.words[i].s];
			if (t.words[i] !== t.words.find((w) => w.s === s.id)) throw new Error(`"${opening}" does not open a sentence`);
			return {from: s.startFrame, to: s.endFrame};
		},
		total: t.durationInFrames,
		provisional: Boolean(t.provisional),
	};
};
