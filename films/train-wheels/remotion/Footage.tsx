import React from 'react';
import {AbsoluteFill, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Atmosphere} from '../../../lib/remotion/Blueprint';
import {colors} from '../../../lib/remotion/brand';
import {ease} from '../../../lib/remotion/motion';
import {Label} from './kit';
import {at, SceneId, span} from './scenes';

// Real footage (owner, 2026-11-04: "use some real clips to show the reality of what we are describing"). Short inserts
// of the real thing, at the moment the narration describes it; then the drawing takes over to explain. Every clip is
// licensed for commercial use (Pixabay Content License), logged in media_manifest.csv, credited on screen. Files:
// public/films/train-wheels/footage/ (from Drive train-wheels/render-media/footage on the farm).

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
	{clip: 'f01_bogies', credit: 'AleFer', scene: 's01', from: '', pre: 0, to: 'one solid steel axle', post: 0},
	{clip: 'f02_cab_curve', credit: 'adege', scene: 's01', from: 'But on a bend', pre: 6, to: 'farther to go', post: 0},
	{clip: 'f03_loco_curve', credit: 'MixailMixail', scene: 's02', from: 'And a one-hundred-ton locomotive', pre: 10, to: 'has nothing to fix that', post: 0},
	{clip: 'f04_wheels_plant', credit: 'AlexKopeykin', scene: 's03', from: 'The answer is in the shape', pre: 8, to: 'the shape of the wheel', post: -45},
	{clip: 'f05_lathe', credit: 'AlexKopeykin', scene: 's05', from: 'It is tapered', pre: 6, to: 'slightly bigger toward the flange', post: 6},
	{clip: 'f06_scurve', credit: 'svetjekolem', scene: 's06', from: 'Now watch the axle', pre: 6, to: 'With both wheels', post: 4},
	{clip: 'f07_tight', credit: '43552051', scene: 's10', from: 'And on a really tight curve', pre: 8, to: 'The flange presses', post: 4},
	{clip: 'f08_shinkansen', credit: 'Kanenori', scene: 's14', from: "Japan's bullet trains", pre: 6, to: 'one in forty', post: 4},
	{clip: 'f09_bend', credit: 'Gerritsmovieproductions', scene: 's15', from: 'So the next time you hear', pre: 6, to: 'The cone has run out', post: 2},
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
					src={staticFile(`films/train-wheels/footage/${insert.clip}.mp4`)}
					muted
					style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.66) contrast(1.06) brightness(0.94)'}}
				/>
			</AbsoluteFill>
			{/* the channel's cool, dark grade: a navy wash and a soft falloff to the abyss at the edges */}
			<AbsoluteFill style={{background: colors.bg_lift, mixBlendMode: 'multiply', opacity: 0.22}} />
			<Atmosphere vignette={0.5} />
			<Label x={96} y={1080 - 84} size={26} color={colors.sub} opacity={0.9}>
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

// every insert must be short (the drawing explains) and fit its clip (5–6 s files)
for (const i of INSERTS) {
	const w = insertWindow(i);
	if (w.to - w.from < 90 || w.to - w.from > 330) throw new Error(`footage ${i.clip}: ${w.to - w.from} frames`);
}
