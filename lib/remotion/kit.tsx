import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {Atmosphere, Blueprint} from './Blueprint';
import {colors} from './brand';
import {fontStacks} from './fonts';
import {ease, tween} from './motion';

// The shared drawing kit (promoted from film 1's kit, 2026-11-07): type, honesty tags, callouts, dimension lines and
// force arrows, all on the §6.4a legibility floors (≥ 36 px for what the narration points to, ≥ 26 px for every other fact; muted never
// carries a label).

export const W = 1920;
export const H = 1080;

type LabelProps = {
	x: number;
	y: number;
	size: number;
	color: string;
	align?: 'left' | 'right' | 'center';
	children: React.ReactNode;
	opacity?: number;
	weight?: number;
	font?: 'mono' | 'display';
	spacing?: number;
};

/** A line of type placed in frame pixels; `y` is the top of the line box. */
export const Label: React.FC<LabelProps> = ({x, y, size, color, align = 'left', children, opacity = 1, weight = 500, font = 'mono', spacing}) => (
	<div
		style={{
			position: 'absolute',
			left: align === 'right' ? undefined : x,
			right: align === 'right' ? W - x : undefined,
			top: y,
			transform: align === 'center' ? 'translateX(-50%)' : undefined,
			fontFamily: font === 'mono' ? fontStacks.mono : fontStacks.display,
			fontSize: size,
			fontWeight: weight,
			letterSpacing: spacing ?? (size > 30 ? 1 : 1.6),
			color,
			opacity,
			whiteSpace: 'nowrap',
			fontVariantNumeric: 'tabular-nums',
			lineHeight: 1.15,
		}}
	>
		{children}
	</div>
);

/** An honesty label (NOT TO SCALE, ILLUSTRATION, MODEL…): 36 px, ink, with a hairline box. */
export const Tag: React.FC<{x: number; y: number; children: React.ReactNode; opacity?: number; align?: 'left' | 'right'}> = ({x, y, children, opacity = 1, align = 'left'}) => (
	<div
		style={{
			position: 'absolute',
			left: align === 'left' ? x : undefined,
			right: align === 'right' ? W - x : undefined,
			top: y,
			fontFamily: fontStacks.mono,
			fontSize: 36,
			letterSpacing: 2.2,
			color: colors.ink,
			opacity,
			padding: '6px 14px 5px',
			border: `1.5px solid ${colors.sub}`,
			background: 'rgba(7,10,15,0.6)',
			whiteSpace: 'nowrap',
		}}
	>
		{children}
	</div>
);

/** The standard stage: blueprint canvas, the scene, then atmosphere over everything except the overlay (HUD). */
export const Stage: React.FC<{dur: number; light?: {x: number; y: number}; children: React.ReactNode; overlay?: React.ReactNode; grid?: number}> = ({
	dur,
	light,
	children,
	overlay,
	grid,
}) => (
	<AbsoluteFill>
		<Blueprint duration={dur} light={light} gridOpacity={grid}>
			{children}
		</Blueprint>
		<Atmosphere />
		{overlay}
	</AbsoluteFill>
);

/** A full-frame SVG layer. */
export const Svg: React.FC<{children: React.ReactNode; opacity?: number; style?: React.CSSProperties}> = ({children, opacity = 1, style}) => (
	<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, opacity, overflow: 'visible', ...style}}>
		{children}
	</svg>
);

/** Arrowhead polygon at (x, y) pointing along angle a (rad). */
export const head = (x: number, y: number, a: number, size = 18): string => {
	const p = (ang: number, r: number) => `${(x + r * Math.cos(ang)).toFixed(1)},${(y + r * Math.sin(ang)).toFixed(1)}`;
	return `${p(a, 0)} ${p(a + Math.PI - 0.42, size)} ${p(a + Math.PI + 0.42, size)}`;
};

/** A force or motion arrow from (x1,y1) to (x2,y2); `grow` 0–1 draws it from the tail. */
export const Arrow: React.FC<{x1: number; y1: number; x2: number; y2: number; color: string; width?: number; grow?: number; glow?: boolean; dashed?: boolean}> = ({
	x1,
	y1,
	x2,
	y2,
	color,
	width = 5,
	grow = 1,
	glow = true,
	dashed = false,
}) => {
	if (grow <= 0.001) return null;
	const x = x1 + (x2 - x1) * grow;
	const y = y1 + (y2 - y1) * grow;
	const a = Math.atan2(y - y1, x - x1);
	const hs = 12 + width * 2.6;
	const bx = x - Math.cos(a) * hs * 0.7;
	const by = y - Math.sin(a) * hs * 0.7;
	return (
		<g style={glow ? {filter: `drop-shadow(0 0 8px ${color})`} : undefined}>
			<line x1={x1} y1={y1} x2={bx} y2={by} stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={dashed ? '14 10' : undefined} />
			<polygon points={head(x, y, a, hs)} fill={color} />
		</g>
	);
};

/** A dimension line between two points with extension ticks and its text centred above. */
export const Dim: React.FC<{x1: number; y1: number; x2: number; y2: number; color?: string; draw?: number; tick?: number}> = ({
	x1,
	y1,
	x2,
	y2,
	color = colors.line,
	draw = 1,
	tick = 14,
}) => {
	if (draw <= 0.001) return null;
	const a = Math.atan2(y2 - y1, x2 - x1);
	const nx = -Math.sin(a) * tick;
	const ny = Math.cos(a) * tick;
	const mx = (x1 + x2) / 2;
	const my = (y1 + y2) / 2;
	const hx = ((x2 - x1) / 2) * draw;
	const hy = ((y2 - y1) / 2) * draw;
	return (
		<g>
			<line x1={mx - hx} y1={my - hy} x2={mx + hx} y2={my + hy} stroke={color} strokeWidth={2.5} />
			{draw > 0.98 ? (
				<>
					<line x1={x1 - nx} y1={y1 - ny} x2={x1 + nx} y2={y1 + ny} stroke={color} strokeWidth={2.5} />
					<line x1={x2 - nx} y1={y2 - ny} x2={x2 + nx} y2={y2 + ny} stroke={color} strokeWidth={2.5} />
					<polygon points={head(x1, y1, a + Math.PI, 14)} fill={color} />
					<polygon points={head(x2, y2, a, 14)} fill={color} />
				</>
			) : null}
		</g>
	);
};

/** A callout: a dot on the subject, a leader with an elbow, and a label (≥ 36 px: the narration points to it). */
export const Callout: React.FC<{
	x: number;
	y: number;
	lx: number;
	ly: number;
	text: React.ReactNode;
	color?: string;
	t: number;
	size?: number;
	sub?: React.ReactNode;
}> = ({x, y, lx, ly, text, color = colors.line, t, size = 36, sub}) => {
	if (t <= 0.001) return null;
	const line = tween(t, 0, 0.6, 0, 1, ease.draw);
	const txt = tween(t, 0.45, 1, 0, 1, ease.arrive);
	const right = lx >= x;
	const ex = lx + (right ? -18 : 18);
	return (
		<>
			<Svg>
				<circle cx={x} cy={y} r={7} fill={color} opacity={Math.min(1, t * 3)} style={{filter: `drop-shadow(0 0 6px ${color})`}} />
				<polyline
					points={`${x},${y} ${ex},${ly} ${lx},${ly}`}
					fill="none"
					stroke={color}
					strokeWidth={2.5}
					pathLength={1}
					strokeDasharray={`${line} 1`}
				/>
			</Svg>
			<Label x={right ? lx + 14 : lx - 14} y={ly - size * 0.62} size={size} color={color === colors.muted ? colors.sub : color} align={right ? 'left' : 'right'} opacity={txt} weight={600}>
				{text}
			</Label>
			{sub ? (
				<Label x={right ? lx + 14 : lx - 14} y={ly + size * 0.55} size={26} color={colors.sub} align={right ? 'left' : 'right'} opacity={txt}>
					{sub}
				</Label>
			) : null}
		</>
	);
};

/** Fade a value in at frame a over n frames (eased), for the many "appears on its word" beats. */
export const on = (f: number, a: number, n = 18): number => tween(f, a, a + n, 0, 1, ease.arrive);
/** Fade out at frame a over n frames. */
export const off = (f: number, a: number, n = 18): number => tween(f, a, a + n, 1, 0, ease.leave);
/** Pen-draw progress 0–1 from a over n frames. */
export const pen = (f: number, a: number, n = 40): number => tween(f, a, a + n, 0, 1, ease.draw);
/** A clamped linear map, for kinematics that must stay exact (never for bodies' motion). */
export const lin = (f: number, a: number, b: number, from: number, to: number): number =>
	interpolate(f, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
