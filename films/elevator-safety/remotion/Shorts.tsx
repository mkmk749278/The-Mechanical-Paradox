import React from 'react';
import {resolveShort, Short, shortFrames, ShortsFile} from '../../../lib/remotion/Short';
import shortsFile from '../shorts.json';
import {timing} from './cues';
import {Film} from './Film';

// Film 2's three Shorts (youtube/package.md, step 12): the film's own picture and words, cut by shorts.json.
const FILE = shortsFile as unknown as ShortsFile;
const TITLE = 'What Happens If an Elevator Cable Snaps?';

export const shortSpec = (id: number) => resolveShort(FILE, id, timing);
export const SHORT_FRAMES = (id: number): number => shortFrames(shortSpec(id).segs);

const make = (id: number): React.FC => {
	const C: React.FC = () => {
		const s = shortSpec(id);
		return <Short Film={Film} t={timing} hook={s.hook} segs={s.segs} title={TITLE} labels="SIMPLIFIED · NOT TO SCALE · ILLUSTRATIVE VALUES" credit={s.credit} />;
	};
	return C;
};
export const Short1 = make(1);
export const Short2 = make(2);
export const Short3 = make(3);
