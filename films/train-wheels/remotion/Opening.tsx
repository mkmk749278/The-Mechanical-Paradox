import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {colors} from '../../../lib/remotion/brand';
import {Hud} from '../../../lib/remotion/Hud';
import {ease, tween} from '../../../lib/remotion/motion';
import {SfxCue} from '../../../lib/remotion/sfx';
import {H, Label, off, on, Stage, Svg, W} from './kit';
import {WS} from './model';
import {span} from './scenes';
import {Shot3DView} from './plates';
import {T1, T3, V1} from './shots3d';

// s01 cold open and s03 the promise (scenes/s01_cold_open.md). The wheelset is the one solid, lit object.

// s01's 3D state (camera, wheelset, track, the two rail paths) lives in shots3d.ts: the Blender plate uses it too
const S1 = () => span('s01');

/** Two dials, one per wheel, turning with it: locked together. */
const Dials: React.FC<{spin: number; o: number}> = ({spin, o}) => {
	if (o <= 0.01) return null;
	const dial = (cx: number, label: string) => (
		<g key={label}>
			<circle cx={cx} cy={930} r={46} fill="rgba(7,10,15,0.7)" stroke={colors.sub} strokeWidth={2} />
			{Array.from({length: 12}, (_, i) => (i * Math.PI) / 6).map((a) => (
				<line key={a} x1={cx + Math.cos(a) * 38} y1={930 + Math.sin(a) * 38} x2={cx + Math.cos(a) * 46} y2={930 + Math.sin(a) * 46} stroke={colors.sub} strokeWidth={2} />
			))}
			<line x1={cx} y1={930} x2={cx + Math.cos(spin - Math.PI / 2) * 40} y2={930 + Math.sin(spin - Math.PI / 2) * 40} stroke={colors.amber} strokeWidth={5} strokeLinecap="round" />
			<circle cx={cx} cy={930} r={6} fill={colors.amber} />
		</g>
	);
	return (
		<>
			<Svg opacity={o}>
				{dial(180, 'L')}
				{dial(330, 'R')}
				<line x1={226} y1={930} x2={284} y2={930} stroke={colors.amber} strokeWidth={4} />
			</Svg>
			<Label x={180} y={990} size={26} color={colors.sub} align="center" opacity={o}>
				LEFT
			</Label>
			<Label x={330} y={990} size={26} color={colors.sub} align="center" opacity={o}>
				RIGHT
			</Label>
			<Label x={400} y={908} size={36} color={colors.amber} weight={600} opacity={o}>
				LOCKED TOGETHER
			</Label>
		</>
	);
};

export const ColdOpen: React.FC = () => {
	const f = useCurrentFrame();
	const t = T1();
	const spin = (V1 * f) / 60 / (WS.r0 / 1000);
	const rpm = ((V1 / (2 * Math.PI * (WS.r0 / 1000))) * 60);
	return (
		<Stage
			dur={S1().dur}
			light={{x: 0.5, y: 0.5}}
			overlay={
				<Hud
					title="WHEELSET"
					start={t.together - 20}
					end={t.end + 20}
					width={440}
					rows={[
						{label: 'LEFT', unit: 'rpm', keys: [{frame: 0, value: rpm}], decimals: 1, tone: 'amber', source: 'ILLUSTRATIVE', from: t.together},
						{label: 'RIGHT', unit: 'rpm', keys: [{frame: 0, value: rpm}], decimals: 1, tone: 'amber', source: 'ILLUSTRATIVE', from: t.together},
					]}
				/>
			}
		>
			<AbsoluteFill>
				<Shot3DView id="s01" f={f} width={W} height={H} />
				<Dials spin={spin} o={Math.min(on(f, t.together - 10, 20), off(f, t.bend, 24))} />
				<Label x={130} y={470} size={44} color={colors.crimson} weight={700} opacity={Math.min(on(f, t.farther, 20), off(f, t.end - 30, 20))}>
					OUTER RAIL: FARTHER TO GO
				</Label>
			</AbsoluteFill>
		</Stage>
	);
};

export const coldOpenCues = (): SfxCue[] => {
	const t = T1();
	return [
		{frame: t.locked, sfx: 'relay_click', gainDb: -14},
		{frame: t.bend, sfx: 'pen_scratch', gainDb: -14},
		{frame: t.farther, sfx: 'whoosh', gainDb: -16, pan: 0.3},
		{frame: t.skid, sfx: 'glass_tone', gainDb: -14, pan: 0.4},
	];
};

// ---- s03 ---- (its 3D state, T3 included, lives in shots3d.ts)
const S3 = () => span('s03');

/** An oscilloscope strip: a trace that draws itself (and, for the screech, stops short: a loop left open). */
const Scope: React.FC<{x: number; y: number; w: number; h: number; t: number; color: string; label: string; kind: 'ring' | 'sway'; o: number}> = ({x, y: y0, w, h, t, color, label, kind, o}) => {
	const y = y0 + 34; // the label sits in the strip's top line
	if (o <= 0.01) return null;
	const n = 400;
	const stop = kind === 'ring' ? 0.62 : 1; // the screech is cut short
	const pts: string[] = [];
	for (let i = 0; i <= n * Math.min(t, stop); i++) {
		const u = i / n;
		const v = kind === 'ring' ? Math.sin(u * 2 * Math.PI * 34) * (0.25 + 0.75 * Math.min(1, u * 3)) * 0.9 : Math.sin(u * 2 * Math.PI * 2.2) * 0.8;
		pts.push(`${(x + u * w).toFixed(1)},${(y + h / 2 - (v * h) / 2).toFixed(1)}`);
	}
	return (
		<>
			<Svg opacity={o}>
				<rect x={x - 12} y={y0 - 12} width={w + 24} height={h + 52} fill="rgba(7,10,15,0.85)" stroke={colors.sub} strokeWidth={1.5} />
				<line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} stroke={colors.grid} strokeWidth={2} />
				<polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={3} style={{filter: `drop-shadow(0 0 6px ${color})`}} />
			</Svg>
			<Label x={x} y={y0 - 4} size={26} color={colors.sub} opacity={o}>
				{label}
			</Label>
		</>
	);
};

export const Promise: React.FC = () => {
	const f = useCurrentFrame();
	const t = T3();
	return (
		<Stage
			dur={S3().dur}
			light={{x: 0.6, y: 0.5}}
			overlay={
				<Hud
					title="THE WHEEL"
					start={20}
					end={t.end + 20}
					width={440}
					note="TEXTBOOK MODEL"
					rows={[{label: 'r0', unit: 'mm', keys: [{frame: 0, value: WS.r0}], decimals: 0, tone: 'line', source: 'C10'}]}
				/>
			}
		>
			<AbsoluteFill>
				<Shot3DView id="s03" f={f} width={W} height={H} />
				<Label x={110} y={150} size={44} color={colors.amber} weight={700} opacity={on(f, t.shape + 10, 20)}>
					THE SHAPE
				</Label>
				<Scope x={120} y={800} w={560} h={110} t={tween(f, t.screech + 10, t.screech + 120, 0, 1, ease.draw)} color={colors.crimson} label="THE SCREECH" kind="ring" o={on(f, t.screech, 16)} />
				<Scope x={1200} y={800} w={560} h={110} t={tween(f, t.sway, t.sway + 80, 0, 1, ease.draw)} color={colors.emerald} label="THE SWAY" kind="sway" o={on(f, t.sway - 10, 16)} />
			</AbsoluteFill>
		</Stage>
	);
};

export const promiseCues = (): SfxCue[] => {
	const t = T3();
	return [
		{frame: t.shape, sfx: 'glass_tone', gainDb: -14},
		{frame: t.screech + 10, sfx: 'relay_click', gainDb: -14, pan: -0.4},
		{frame: t.sway, sfx: 'relay_click', gainDb: -14, pan: 0.4},
	];
};
