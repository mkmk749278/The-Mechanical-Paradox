import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {colors} from './brand';
import {fontStacks} from './fonts';
import {ease, envelope} from './motion';

// Live telemetry (owner's blueprint §2.3 rule 4; PLAYBOOK §8.4): a fixed monospace window whose values tick with the
// narration. A value on screen is a claim: it is either a sourced figure (claims.csv row in `source`) or marked
// ILLUSTRATIVE. The HUD never shows a number the voice contradicts.

export type HudKey = {frame: number; value: number};

export type HudRow = {
	label: string;
	unit: string;
	/** Keyframes: the value eases between them. One key = a constant. */
	keys: HudKey[];
	decimals?: number;
	/** Colour = meaning: crimson tension/heat, cyan compression/flow, emerald balance, amber friction. */
	tone?: 'line' | 'crimson' | 'cyan' | 'emerald' | 'amber';
	/** claims.csv row id, or 'ILLUSTRATIVE'. Required: an unsourced number cannot reach the screen. */
	source: string;
};

const toneColour = (t: HudRow['tone']): string => (t && t !== 'line' ? colors[t] : colors.line);

export const valueAt = (keys: HudKey[], frame: number): number => {
	if (keys.length === 1) return keys[0].value;
	return interpolate(
		frame,
		keys.map((k) => k.frame),
		keys.map((k) => k.value),
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.camera},
	);
};

/** Groups thousands with a thin comma; fixed decimals so digits don't jump sideways (tabular figures). */
export const fmt = (v: number, decimals = 0): string =>
	v.toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals});

type HudProps = {
	title: string;
	rows: HudRow[];
	start: number;
	end: number;
	corner?: 'top-right' | 'bottom-right' | 'top-left';
	/** Shown when any row is ILLUSTRATIVE. */
	width?: number;
};

export const Hud: React.FC<HudProps> = ({title, rows, start, end, corner = 'top-right', width = 360}) => {
	const frame = useCurrentFrame();
	const o = envelope(frame, start, end, 18, 14);
	if (o <= 0) return null;
	const illustrative = rows.some((r) => r.source === 'ILLUSTRATIVE');
	const pos: React.CSSProperties =
		corner === 'top-right' ? {top: 64, right: 72} : corner === 'bottom-right' ? {bottom: 150, right: 72} : {top: 64, left: 72};
	// a scan line sweeps the panel when it opens: the instrument powering up
	const scan = interpolate(frame, [start, start + 24], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<div
			style={{
				position: 'absolute',
				...pos,
				width,
				opacity: o,
				fontFamily: fontStacks.mono,
				color: colors.line,
				background: 'rgba(7,10,15,0.72)',
				border: `1px solid ${colors.grid}`,
				boxShadow: `inset 0 0 0 1px rgba(240,244,248,0.04)`,
				padding: '14px 18px 12px',
				overflow: 'hidden',
			}}
		>
			<div style={{display: 'flex', justifyContent: 'space-between', fontSize: 15, letterSpacing: 2.4, color: colors.muted}}>
				<span>
					<span style={{color: colors.amber}}>// </span>
					{title}
				</span>
				<span style={{color: frame % 60 < 40 ? colors.emerald : 'transparent'}}>● LIVE</span>
			</div>
			<div style={{height: 1, background: colors.grid, margin: '10px 0 8px'}} />
			{rows.map((r) => (
				<div key={r.label} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '5px 0'}}>
					<span style={{fontSize: 17, letterSpacing: 1.8, color: colors.sub}}>{r.label}</span>
					<span style={{fontSize: 26, fontWeight: 700, color: toneColour(r.tone), fontVariantNumeric: 'tabular-nums'}}>
						{fmt(valueAt(r.keys, frame), r.decimals)}
						<span style={{fontSize: 15, fontWeight: 500, color: colors.muted, marginLeft: 8}}>{r.unit}</span>
					</span>
				</div>
			))}
			{illustrative ? (
				<div style={{marginTop: 8, fontSize: 12, letterSpacing: 2, color: colors.muted}}>ILLUSTRATIVE VALUES</div>
			) : null}
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: `${scan * 100}%`,
					height: 2,
					background: colors.cyan,
					opacity: scan < 1 ? 0.5 : 0,
				}}
			/>
		</div>
	);
};
