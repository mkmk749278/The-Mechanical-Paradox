import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {Blueprint} from './Blueprint';
import {colors} from './brand';
import {fontStacks} from './fonts';
import {ease, tween} from './motion';
import type {Timing} from './timing';

// A vertical Short (1080×1920, PLAYBOOK §13.6) cut from a film's own picture and words: the hook on top from the first
// frame, the film's frame cropped in the middle (scale K around a chosen centre, so its labels stay readable on a
// phone), the spoken sentence word by word below, and an end card that sends the viewer to the full film. Segments
// come from films/<slug>/shorts.json, resolved against vo/timing.json by resolveShort (the audio cutter,
// scripts/short_audio.py, resolves the same file the same way).

export type ShortsFile = {
	lead: number;
	tail: number;
	end: number;
	shorts: {id: number; hook: [string, string]; credit?: string; segs: {open: string; close: string; cx: number; k?: number; cont?: boolean}[]}[];
};
/** cont: continues the previous segment with no cut (same film clock), panning the crop to its own cx. */
export type Seg = {from: number; to: number; cx: number; k?: number; cont?: boolean};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();

/** Film frames of each segment: from the start of the sentence opening with `open` (minus lead) to the end of the
 * first sentence after it opening with `close` (plus tail; the last segment also holds `end` frames). */
export const resolveShort = (file: ShortsFile, id: number, t: Timing): {hook: [string, string]; segs: Seg[]; credit?: string} => {
	const sh = file.shorts.find((s) => s.id === id);
	if (!sh) throw new Error(`no short ${id}`);
	const segs: Seg[] = [];
	sh.segs.forEach((g, k) => {
		const i = t.sentences.findIndex((s) => norm(s.text).startsWith(norm(g.open)));
		if (i < 0) throw new Error(`short ${id}: no sentence opens "${g.open}"`);
		const j = t.sentences.findIndex((s, n) => n >= i && norm(s.text).startsWith(norm(g.close)));
		if (j < 0) throw new Error(`short ${id}: no sentence opens "${g.close}" after "${g.open}"`);
		const last = k === sh.segs.length - 1;
		const from = g.cont && segs.length ? segs[segs.length - 1].to : t.sentences[i].startFrame - file.lead;
		if (g.cont && segs.length && t.sentences[i].startFrame < from) throw new Error(`short ${id}: "${g.open}" starts inside the previous segment`);
		segs.push({from, to: t.sentences[j].endFrame + file.tail + (last ? file.end : 0), cx: g.cx, k: g.k, cont: g.cont});
	});
	return {hook: sh.hook, segs, credit: sh.credit};
};

export const shortFrames = (segs: Seg[]): number => segs.reduce((n, s) => n + s.to - s.from, 0);

// the crop's side edges fade out, so the film's own edge labels and HUD never stop mid-word at a hard edge; the Short
// carries the honesty labels itself (`labels`)
const EDGE = 'linear-gradient(to right, transparent 0, transparent 30px, black 210px, black 870px, transparent 1050px, transparent 1080px)';
const PAN = 45; // frames a continuing segment takes to pan to its centre
const K = 0.95; // the film frame's scale in the Short: 1920 → 1824 px wide, of which 1080 show
const PIC_TOP = 470;
const PIC_H = Math.round(1080 * K);

/** The spoken words, a phrase at a time (≤ 7 words, broken after commas), the current word amber. */
const chunks = <T extends {w: string}>(ws: T[]): T[][] => {
	const out: T[][] = [[]];
	for (const w of ws) {
		const c = out[out.length - 1];
		c.push(w);
		if (c.length >= 7 || (/[,;:]$/.test(w.w) && c.length >= 3)) out.push([]);
	}
	return out.filter((c) => c.length);
};

const Captions: React.FC<{t: Timing; filmFrame: number}> = ({t, filmFrame}) => {
	const w = t.words.find((x) => x.startFrame <= filmFrame && filmFrame < x.endFrame + 6) ?? [...t.words].reverse().find((x) => x.startFrame <= filmFrame);
	if (!w) return null;
	const s = t.sentences[w.s];
	if (filmFrame > s.endFrame + 20) return null; // nothing between sentences
	const chunk = chunks(t.words.filter((x) => x.s === w.s)).find((c) => c.includes(w)) ?? [];
	return (
		<div style={{position: 'absolute', left: 70, right: 70, top: PIC_TOP + PIC_H + 150, textAlign: 'center', fontFamily: fontStacks.display, fontWeight: 800, fontSize: 68, lineHeight: 1.16, color: colors.ink, textShadow: '0 4px 0 rgba(0,0,0,0.6)'}}>
			{chunk.map((x, i) => (
				<span key={i} style={{color: x === w ? colors.amber : x.startFrame <= filmFrame ? colors.ink : 'rgba(232,238,245,0.4)'}}>
					{x.w}{' '}
				</span>
			))}
		</div>
	);
};

export const Short: React.FC<{Film: React.FC; t: Timing; hook: [string, string]; segs: Seg[]; title: string; labels: string; credit?: string}> = ({Film, t, hook, segs, title, labels, credit}) => {
	const f = useCurrentFrame();
	const total = shortFrames(segs);
	// where each segment sits in the Short
	let acc = 0;
	const placed = segs.map((s) => {
		const at = acc;
		acc += s.to - s.from;
		return {...s, at};
	});
	const cur = placed.find((s) => f >= s.at && f < s.at + s.to - s.from) ?? placed[placed.length - 1];
	const filmFrame = cur.from + (f - cur.at);
	const endIn = tween(f, total - 130, total - 105, 0, 1, ease.arrive);
	return (
		<AbsoluteFill style={{backgroundColor: colors.bg}}>
			<Blueprint light={{x: 0.5, y: 0.4}} gridOpacity={0.6} duration={total}>
				{placed.map((s, i) => (
					<Sequence key={i} from={s.at - s.from} durationInFrames={s.from + (s.to - s.from)} layout="none">
						{/* the film runs on its own clock; only this segment's frames show */}
						<SegWindow k={s.k ?? K} show={f >= s.at && f < s.at + s.to - s.from} cx={s.cont && i > 0 ? placed[i - 1].cx + (s.cx - placed[i - 1].cx) * tween(f, s.at, s.at + PAN, 0, 1, ease.camera) : s.cx}>
							<Film />
						</SegWindow>
					</Sequence>
				))}
			</Blueprint>
			{/* the hook: from the first frame */}
			<div style={{position: 'absolute', left: 60, right: 60, top: 120, textAlign: 'center', fontFamily: fontStacks.display, fontWeight: 900, fontSize: 92, lineHeight: 1.0, letterSpacing: -1, textShadow: '0 6px 0 rgba(0,0,0,0.55)'}}>
				<div style={{color: colors.ink}}>{hook[0]}</div>
				<div style={{color: colors.amber}}>{hook[1]}</div>
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: PIC_TOP + PIC_H + 40, textAlign: 'center', fontFamily: fontStacks.mono, fontSize: 30, letterSpacing: 3, color: colors.sub}}>
				{labels}
				{credit ? <div style={{fontSize: 26, letterSpacing: 2, marginTop: 6}}>{credit}</div> : null}
			</div>
			<Captions t={t} filmFrame={filmFrame} />
			{/* the end card: the full film */}
			<div style={{position: 'absolute', left: 60, right: 60, top: PIC_TOP + PIC_H + 120, textAlign: 'center', opacity: endIn, transform: `translateY(${(1 - endIn) * 20}px)`, background: colors.bg, paddingTop: 10}}>
				<div style={{fontFamily: fontStacks.mono, fontSize: 36, letterSpacing: 4, color: colors.amber}}>THE FULL FILM</div>
				<div style={{fontFamily: fontStacks.display, fontWeight: 800, fontSize: 58, lineHeight: 1.1, color: colors.ink, marginTop: 14}}>{title}</div>
				<div style={{fontFamily: fontStacks.text, fontSize: 38, color: colors.sub, marginTop: 18}}>on the channel</div>
			</div>
		</AbsoluteFill>
	);
};

/** k < K: a wide beat shown smaller (its labels still ≥ about 28 px), centred in the picture band. */
const SegWindow: React.FC<{show: boolean; cx: number; k: number; children: React.ReactNode}> = ({show, cx, k, children}) =>
	show ? (
		<div style={{position: 'absolute', left: 0, top: PIC_TOP, width: 1080, height: PIC_H, overflow: 'hidden', WebkitMaskImage: EDGE, maskImage: EDGE}}>
			<div style={{position: 'absolute', left: 540 - cx * k, top: (PIC_H - 1080 * k) / 2, width: 1920, height: 1080, transform: `scale(${k})`, transformOrigin: '0 0'}}>{children}</div>
		</div>
	) : null;
