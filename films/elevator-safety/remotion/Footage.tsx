import React from 'react';
import {AbsoluteFill, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Atmosphere} from '../../../lib/remotion/Blueprint';
import {colors} from '../../../lib/remotion/brand';
import {ease} from '../../../lib/remotion/motion';
import {Label} from '../../../lib/remotion/kit';
import {at, SceneId, span} from './scenes';

// Real footage (owner, 2026-11-04: "use some real clips to show the reality of what we are describing"). Short inserts
// of the real thing, at the moment the narration describes it; then the drawing takes over to explain. Every clip is
// licensed for commercial use (Pixabay Content License), logged in media_manifest.csv, credited on screen. Files:
// public/films/elevator-safety/footage/ (from Drive elevator-safety/render-media/footage on the farm).

type Insert = {
	clip: string;
	credit: string;
	/** The insert's window: from a phrase (minus `pre` frames) to another phrase (minus `post` frames), in its scene. */
	scene: SceneId;
	from: string;
	pre: number;
	to: string;
	post: number;
};

export const INSERTS: Insert[] = [
	{clip: 'f01_atrium', credit: 'Skylent', scene: 's07', from: 'Your car runs between', pre: 6, to: 'height of the shaft', post: 0},
	{clip: 'f02_ride', credit: 'Jesehab', scene: 's09', from: 'Picture an ordinary', pre: 6, to: 'Its brake kicks in', post: 10},
	{clip: 'f03_doors', credit: 'Jesehab', scene: 's16', from: 'So the next time', pre: 6, to: 'picture what is riding', post: 6},
];

const FADE = 14;

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
	const push = interpolate(f, [0, dur], [1.0, 1.06], {extrapolateRight: 'clamp', easing: ease.camera});
	return (
		<AbsoluteFill style={{opacity: o, backgroundColor: colors.bg}}>
			<AbsoluteFill style={{transform: `scale(${push})`}}>
				<OffthreadVideo
					src={staticFile(`films/elevator-safety/footage/${insert.clip}.mp4`)}
					muted
					style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.66) contrast(1.06) brightness(0.94)'}}
				/>
			</AbsoluteFill>
			{/* the channel's cool, dark grade: a navy wash and a soft falloff to the abyss at the edges */}
			<AbsoluteFill style={{background: colors.bg_lift, mixBlendMode: 'multiply', opacity: 0.22}} />
			<Atmosphere vignette={0.5} />
			{/* a low scrim under the credit: on bright footage (snow, sky) the credit vanished (picture gate, 2026-11-04) */}
			<AbsoluteFill style={{background: `linear-gradient(to top, ${colors.bg}D0 0px, ${colors.bg}80 90px, ${colors.bg}00 200px)`}} />
			<Label x={96} y={1080 - 84} size={26} color={colors.line} opacity={0.85}>
				FOOTAGE · PIXABAY / {insert.credit}
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
	if (w.to - w.from < 90 || w.to - w.from > 210) throw new Error(`footage ${i.clip}: ${w.to - w.from} frames`);
}
