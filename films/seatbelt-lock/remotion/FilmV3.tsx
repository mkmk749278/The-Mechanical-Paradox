import React from 'react';
import {AbsoluteFill, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Atmosphere} from '../../../lib/remotion/Blueprint';
import {colors} from '../../../lib/remotion/brand';
import {ease, physical} from '../../../lib/remotion/motion';
import {Callout, Label, W, H} from '../../../lib/remotion/kit';
import {SfxCue, SfxName} from '../../../lib/remotion/sfx';
import {ChannelSting, endScreenCues, OUTRO_FRAMES, stingCues} from '../../../src/channel/ChannelSting';
import {shiftCues} from '../../../lib/remotion/sfx';
import {cue} from './cues';
import {EDIT_END, Cam, Overlay, PLATE_FPS, Shot, SHOTS, Vec3} from './edit';
import {FPS} from './model';

// Film 3, cut v3: the edit (edit.ts) played shot by shot. Real clips play as they are (a light cool grade, never a
// heavy filter: the owner wants reality); plates are the Blender frames (Cycles, rendered on the runners from
// blender/render.py); over both, the accent layer: honesty labels, credits, callouts pinned to the 3D parts by the
// plate's own camera, a few HUD values, and one statement where the narration lands a number.

const COLOR = {amber: colors.amber, cyan: colors.cyan, crimson: colors.crimson, emerald: colors.emerald, line: colors.line} as const;
const pad = (n: number): string => String(n).padStart(5, '0');

/** Blender's pinhole (blender/common.py set_camera: 36 mm sensor, horizontal fit, no shift), world → frame px. */
export const project = (c: Cam, p: Vec3): [number, number] | null => {
	const d = [c.target[0] - c.pos[0], c.target[1] - c.pos[1], c.target[2] - c.pos[2]];
	const dl = Math.hypot(d[0], d[1], d[2]);
	const f = [d[0] / dl, d[1] / dl, d[2] / dl];
	// right = forward × world up (z); up = right × forward
	let r = [f[1], -f[0], 0];
	const rl = Math.hypot(r[0], r[1]) || 1;
	r = [r[0] / rl, r[1] / rl, 0];
	const u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
	const v = [p[0] - c.pos[0], p[1] - c.pos[1], p[2] - c.pos[2]];
	const z = v[0] * f[0] + v[1] * f[1] + v[2] * f[2];
	if (z <= 0.001) return null;
	const k = (c.lens / 36) * W;
	return [W / 2 + ((v[0] * r[0] + v[1] * r[1] + v[2] * r[2]) / z) * k, H / 2 - ((v[0] * u[0] + v[1] * u[1] + v[2] * u[2]) / z) * k];
};

/** A retractor point after the housing's tilt (blender/retractor.py: the root turns about y by −tilt). */
const tilted = (p: Vec3, tilt: number): Vec3 => {
	const a = -tilt;
	return [p[0] * Math.cos(a) + p[2] * Math.sin(a), p[1], -p[0] * Math.sin(a) + p[2] * Math.cos(a)];
};

const phraseIn = (phrase: string | undefined, s: Shot): number => {
	if (!phrase) return s.from + 12;
	return cue.within(phrase, s.from - 30, s.to + 30).start;
};

const OverlayLayer: React.FC<{shot: Shot; ov: Overlay; credit?: string}> = ({shot, ov, credit}) => {
	const f = useCurrentFrame();
	const g = shot.from + f;
	const t = f / FPS;
	const cam = shot.kind === 'plate' ? shot.cam(t) : null;
	const st = shot.kind === 'plate' ? (shot.state(t, g) as {tilt?: number}) : {};
	return (
		<AbsoluteFill>
			{/* a low scrim so the labels hold on bright footage */}
			<AbsoluteFill style={{background: `linear-gradient(to top, ${colors.bg}C0 0px, ${colors.bg}60 110px, ${colors.bg}00 230px)`}} />
			{cam && ov.callouts
				? ov.callouts.map((c, i) => {
						const p = project(cam, shot.kind === 'plate' && shot.set === 'retractor' ? tilted(c.p, st.tilt ?? 0) : c.p);
						if (!p) return null;
						const a = phraseIn(c.at, shot) - shot.from;
						const k = interpolate(f, [a, a + 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
						// the label must fit inside the frame (gate, cut v3: a right-hand label ran off the edge) and labels
						// stack, never collide
						const tw = String(c.text).length * 36 * 0.62 + 24;
						const right = p[0] < W * 0.55;
						const lx = right ? Math.min(W - 96 - tw, p[0] + 170) : Math.max(96 + tw, p[0] - 170);
						const ly = Math.max(150, Math.min(H - 220, p[1] - 110 + i * 84));
						return <Callout key={i} x={p[0]} y={p[1]} lx={lx} ly={ly} text={c.text} color={COLOR[c.color ?? 'line']} t={k} />;
					})
				: null}
			{ov.hud ? (
				<>
					{ov.hud.map((r, i) => (
						<React.Fragment key={r.k}>
							<Label x={W - 96} y={96 + i * 96} size={26} color={colors.sub} align="right">
								{r.k}
							</Label>
							<Label x={W - 96} y={126 + i * 96} size={44} color={colors.line} align="right" weight={600}>
								{r.v(t)}
							</Label>
						</React.Fragment>
					))}
					<Label x={W - 96} y={96 + ov.hud.length * 96 + 6} size={26} color={colors.sub} align="right">
						{ov.hud.every((r) => r.source === 'ILLUSTRATIVE') ? 'ILLUSTRATIVE VALUES' : ov.hud.filter((r) => r.source !== 'ILLUSTRATIVE').map((r) => r.source).join(' · ')}
					</Label>
				</>
			) : null}
			{ov.big
				? (() => {
						const a = phraseIn(ov.big.at, shot) - shot.from;
						const k = physical(f, FPS, a);
						if (f < a) return null;
						return (
							<div style={{position: 'absolute', left: 0, right: 0, top: H * 0.66, textAlign: 'center', opacity: Math.min(1, k * 1.4), transform: `translateY(${(1 - k) * 30}px)`}}>
								<Label x={W / 2} y={0} size={72} color={COLOR[ov.big.color ?? 'line']} align="center" weight={700} font="display">
									{ov.big.text}
								</Label>
							</div>
						);
					})()
				: null}
			{ov.label ? (
				<Label x={96} y={H - 88} size={30} color={colors.line} opacity={0.92}>
					{ov.label}
				</Label>
			) : null}
			{credit ? (
				<Label x={W - 96} y={H - 88} size={30} color={colors.line} align="right" opacity={0.92}>
					{credit}
				</Label>
			) : null}
		</AbsoluteFill>
	);
};

const ShotView: React.FC<{shot: Shot}> = ({shot}) => {
	const f = useCurrentFrame();
	const dur = shot.to - shot.from;
	let base: React.ReactNode;
	if (shot.kind === 'clip') {
		// a slow push keeps even a held clip alive (nothing static over 2.5 s)
		const push = interpolate(f, [0, dur], [1.0, 1.05], {extrapolateRight: 'clamp', easing: ease.camera});
		base = (
			<AbsoluteFill style={{transform: `scale(${push})`}}>
				<OffthreadVideo
					src={staticFile(`films/seatbelt-lock/footage/${shot.file}.mp4`)}
					startFrom={Math.round(shot.in * FPS)}
					playbackRate={shot.rate ?? 1}
					muted
					style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.9) contrast(1.03)'}}
				/>
			</AbsoluteFill>
		);
	} else {
		const n = Math.floor((f * PLATE_FPS) / FPS);
		base = <Img src={staticFile(`films/seatbelt-lock/plates/${shot.id}/${pad(n)}.webp`)} style={{width: '100%', height: '100%'}} />;
	}
	return (
		<AbsoluteFill style={{backgroundColor: colors.bg}}>
			{base}
			<Atmosphere grain={0.05} vignette={0.4} />
			<OverlayLayer shot={shot} ov={shot.overlay ?? {}} credit={shot.kind === 'clip' ? shot.credit : undefined} />
		</AbsoluteFill>
	);
};

export const VO_FRAMES_V3 = EDIT_END;
export const FILM_FRAMES_V3 = EDIT_END + OUTRO_FRAMES;

export const FilmV3: React.FC = () => (
	<AbsoluteFill style={{backgroundColor: colors.bg}}>
		{SHOTS.map((s) => (
			<Sequence key={s.id} from={s.from} durationInFrames={s.to - s.from} name={s.id}>
				<ShotView shot={s} />
			</Sequence>
		))}
		<Sequence from={EDIT_END} durationInFrames={OUTRO_FRAMES} name="sting">
			<ChannelSting endScreen />
		</Sequence>
	</AbsoluteFill>
);

/** Every sound cue of cut v3 on the film's clock (the mix reads these; picture and sound never drift). */
export const filmCuesV3 = (): SfxCue[] => [
	...SHOTS.flatMap((s) => (s.sfx ?? []).map((c) => ({frame: c.at, sfx: c.sfx as SfxName, gainDb: c.gainDb}))),
	...shiftCues([...stingCues, ...endScreenCues], EDIT_END),
];

/** export_cues.mjs reads filmCues() */
export const filmCues = filmCuesV3;
