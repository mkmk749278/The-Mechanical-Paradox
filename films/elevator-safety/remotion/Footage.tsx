import React from 'react';
import {AbsoluteFill, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Atmosphere} from '../../../lib/remotion/Blueprint';
import {colors} from '../../../lib/remotion/brand';
import {ease} from '../../../lib/remotion/motion';
import {Label} from '../../../lib/remotion/kit';
import {at, SceneId, span} from './scenes';

// Real footage (owner, 2026-11-04: "use some real clips to show the reality of what we are describing"). Short inserts
// of the real thing, at the moment the narration describes it; then the drawing takes over to explain. Every clip is
// licensed for commercial use (Pixabay Content License), logged in media_manifest.csv, credited on screen. Files:
// public/films/elevator-safety/footage/ (from Drive elevator-safety/render-media/footage on the farm).
//
// Owner, 2026-11-08: "show what the audience regularly sees, then explain the mechanism inside it". So each insert
// opens on the everyday thing (the ride, the doors, the numbers, a glass lift) or on a real photo of the hidden part
// (a governor, a guide rail), and ends in an x-ray reveal: the blueprint grid and scan lines rise through the image in
// its last frames before it dissolves into the drawing of the same thing. The words say the same hook.

type Insert = {
	clip: string;
	credit: string;
	/** The insert's window: from a phrase (minus `pre` frames) to another phrase (minus `post` frames), in its scene. */
	scene: SceneId;
	from: string;
	pre: number;
	to: string;
	post: number;
	/** 'video' (default) or a photo, pushed slowly toward (fx, fy) in 0–1 of the frame. */
	kind?: 'video' | 'photo';
	fx?: number;
	fy?: number;
	/** The credit line (photos carry their own licence). */
	creditLine?: string;
};

const WITTUR = 'PHOTO · CARLO FERRARI / WIKIMEDIA COMMONS · CC BY-SA 4.0';
export const INSERTS: Insert[] = [
	{clip: 'c01_atrium', credit: 'Skylent', scene: 's01', from: '', pre: 0, to: 'The doors close', post: 0},
	{clip: 'c02_doors_numbers', credit: 'Jesehab', scene: 's01', from: 'The doors close', pre: 0, to: 'Now imagine its ropes', post: -4},
	{clip: 's03_governor', credit: '', creditLine: WITTUR, kind: 'photo', fx: 0.56, fy: 0.42, scene: 's03', from: 'You have never seen it', pre: 6, to: 'So what is it for', post: 0},
	{clip: 's07_rail', credit: '', creditLine: WITTUR, kind: 'photo', fx: 0.3, fy: 0.5, scene: 's07', from: 'You never see them', pre: 6, to: 'On each rail', post: 0},
	{clip: 'f02_ride', credit: 'Jesehab', scene: 's09', from: 'Picture an ordinary', pre: 6, to: 'Its brake kicks in', post: 10},
	{clip: 'c14_going_up', credit: 'Coverr-Free-Footage', scene: 's14', from: 'You never see it, but every', pre: 6, to: 'To save energy', post: 0},
	{clip: 'c16_doors_numbers', credit: 'Jesehab', scene: 's16', from: 'So the next time', pre: 6, to: 'Picture what is riding', post: 6},
];

const FADE = 30; // a longer dissolve: the cut into bright footage read as a flash (viewer review v2)

/** An insert's window on the film's clock. */
export const insertWindow = (i: Insert): {from: number; to: number} => {
	const s = span(i.scene);
	const from = (i.from ? at(i.scene, i.from) - i.pre : 0) + s.from;
	const to = at(i.scene, i.to) - i.post + s.from;
	return {from, to};
};

const Clip: React.FC<{insert: Insert; dur: number}> = ({insert, dur}) => {
	const f = useCurrentFrame();
	const o = Math.min(
		interpolate(f, [0, FADE], [insert.from ? 0 : 1, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.camera}),
		interpolate(f, [dur - FADE, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.camera}),
	);
	const photo = insert.kind === 'photo';
	const push = interpolate(f, [0, dur], [1.0, photo ? 1.16 : 1.06], {extrapolateRight: 'clamp', easing: ease.camera});
	// the x-ray: in the last 50 frames the blueprint grid and a rising scan line come up through the image
	const xr = interpolate(f, [dur - 50, dur - 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.camera});
	const scanY = 1080 * (1 - xr);
	const filt = 'saturate(0.66) contrast(1.04) brightness(0.78)';
	return (
		<AbsoluteFill style={{opacity: o, backgroundColor: colors.bg}}>
			<AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: `${(insert.fx ?? 0.5) * 100}% ${(insert.fy ?? 0.5) * 100}%`}}>
				{photo ? (
					<Img src={staticFile(`films/elevator-safety/footage/${insert.clip}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: filt}} />
				) : (
					<OffthreadVideo src={staticFile(`films/elevator-safety/footage/${insert.clip}.mp4`)} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: filt}} />
				)}
			</AbsoluteFill>
			<AbsoluteFill
				style={{
					opacity: 0.85 * xr,
					backgroundImage: "linear-gradient(rgba(232,238,244,0.28) 2px, transparent 2px), linear-gradient(90deg, rgba(232,238,244,0.28) 2px, transparent 2px)",
					backgroundSize: '96px 96px',
					mixBlendMode: 'screen',
					clipPath: `inset(${scanY}px 0 0 0)`,
				}}
			/>
			<AbsoluteFill style={{background: colors.bg, opacity: 0.55 * xr, clipPath: `inset(${scanY}px 0 0 0)`}} />
			{xr > 0.001 && xr < 0.999 ? <div style={{position: 'absolute', left: 0, right: 0, top: scanY - 2, height: 4, background: colors.cyan, boxShadow: `0 0 24px ${colors.cyan}`, opacity: 0.9}} /> : null}
			{/* the channel's cool, dark grade: a navy wash and a soft falloff to the abyss at the edges */}
			<AbsoluteFill style={{background: colors.bg_lift, mixBlendMode: 'multiply', opacity: 0.22}} />
			<Atmosphere vignette={0.5} />
			{/* a low scrim under the credit: on bright footage (snow, sky) the credit vanished (picture gate, 2026-11-04) */}
			<AbsoluteFill style={{background: `linear-gradient(to top, ${colors.bg}D0 0px, ${colors.bg}80 90px, ${colors.bg}00 200px)`}} />
			{/* bottom-right: the scenes' honesty tags own bottom-left (viewer review v1: the two blended in a dissolve) */}
			<Label x={1824} y={1080 - 88} size={30} color={colors.line} align="right" opacity={0.9}>
				{insert.creditLine ?? `FOOTAGE · PIXABAY / ${insert.credit}`}
			</Label>
		</AbsoluteFill>
	);
};

/** All inserts, over the scenes, on the film's clock. */
export const FootageLayer: React.FC = () => (
	<>
		{INSERTS.map((i) => {
			const w = insertWindow(i);
			const dur = w.to - w.from;
			return (
				<Sequence key={i.clip} from={w.from} durationInFrames={dur} name={`footage ${i.clip}`}>
					<Clip insert={i} dur={dur} />
				</Sequence>
			);
		})}
	</>
);

// every insert must be short (the drawing explains) and fit its clip (3.6–5 s files)
for (const i of INSERTS) {
	const w = insertWindow(i);
	if (w.to - w.from < 90 || w.to - w.from > 330) throw new Error(`footage ${i.clip}: ${w.to - w.from} frames`);
}
