import React from 'react';
import {colors} from '../../../lib/remotion/brand';
import {WS} from './model';
import {contact, railOutline, WHEEL_SPAN, wheelOutline} from './profiles';

// The wheel-on-rail section pair at true scale, placeable anywhere (generalised from the bank card's panels): the
// inner and outer wheel over their rails, shifted y mm toward the outside of the bend, every point from profiles.ts
// and the contact solver. The rolling radius is the amber drop from the axle to the contact dot.

const pts = (p: [number, number][]): string => p.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ');

/** One wheel over its rail. side +1 = outer (drawn on the right), −1 = inner. cx = rail centre on screen. */
export const SectionWheel: React.FC<{
	side: 1 | -1;
	cx: number;
	railTop: number;
	px: number;
	y: number;
	draw?: number;
	glow?: number;
	id: string;
	/** Highlight the flange (amber) for the flange beats. */
	flange?: number;
}> = ({side, cx, railTop, px, y, draw = 1, glow = 0, id, flange = 0}) => {
	const ys = side * y;
	const c = contact(ys);
	const sx = (v: number): number => cx + side * v * px;
	const sy = (z: number): number => railTop - z * px;
	const rail = railOutline().map(([v, z]) => [sx(v), sy(z)] as [number, number]);
	const outline = wheelOutline().map(([u, r]) => [sx(u + ys), sy(c.axleZ - r)] as [number, number]);
	const zr = (r: number): number => sy(c.axleZ - r);
	const RIM = WS.r0 - 70;
	const top = railTop - 700;
	const wheel: [number, number][] = [
		...outline,
		[sx(WHEEL_SPAN.outer + ys), zr(RIM + 4)],
		[sx(52 + ys), zr(RIM)],
		[sx(44 + ys), zr(RIM - 24)],
		[sx(44 + ys), top],
		[sx(10 + ys), top],
		[sx(10 + ys), zr(RIM - 24)],
		[sx(0 + ys), zr(RIM)],
		[sx(WHEEL_SPAN.back + ys), zr(RIM + 6)],
	];
	const tread = wheelOutline().filter(([u]) => u > -36 && u < 82).map(([u, r]) => [sx(u + ys), sy(c.axleZ - r)] as [number, number]);
	const flangePts = wheelOutline().filter(([u]) => u <= -36).map(([u, r]) => [sx(u + ys), sy(c.axleZ - r)] as [number, number]);
	const contactX = sx(c.v);
	return (
		<g>
			<defs>
				<linearGradient id={`sw-steel-${id}`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#1B2533" />
					<stop offset="0.82" stopColor="#2A3A4F" />
					<stop offset="0.97" stopColor="#56687E" />
					<stop offset="1" stopColor={colors.specular} stopOpacity={0.55} />
				</linearGradient>
				<pattern id={`sw-hatch-${id}`} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
					<line x1="0" y1="0" x2="0" y2="14" stroke={colors.sub} strokeOpacity={0.28} strokeWidth={2} />
				</pattern>
			</defs>
			<polygon points={pts(rail)} fill={colors.bg_lift} />
			<polygon points={pts(rail)} fill={`url(#sw-hatch-${id})`} />
			<polyline points={pts([...rail, rail[0]])} fill="none" stroke={colors.line} strokeWidth={2.5} pathLength={1} strokeDasharray={`${draw} 1`} />
			<polygon points={pts(wheel)} fill={`url(#sw-steel-${id})`} opacity={Math.min(1, draw * 1.4)} />
			<polygon points={pts(wheel)} fill={`url(#sw-hatch-${id})`} opacity={0.6 * Math.min(1, draw * 1.4)} />
			<polyline points={pts([...wheel, wheel[0]])} fill="none" stroke={colors.line} strokeWidth={3} pathLength={1} strokeDasharray={`${draw} 1`} />
			{glow > 0 ? (
				<polyline points={pts(tread)} fill="none" stroke={colors.amber} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={`${glow} 1`} style={{filter: `drop-shadow(0 0 10px ${colors.amber})`}} />
			) : null}
			{flange > 0 ? (
				<polyline points={pts(flangePts)} fill="none" stroke={colors.amber} strokeWidth={7} strokeLinecap="round" opacity={flange} style={{filter: `drop-shadow(0 0 12px ${colors.amber})`}} />
			) : null}
			<line x1={contactX} y1={top} x2={contactX} y2={railTop - 14} stroke={colors.amber} strokeWidth={3} opacity={draw} />
			<polygon points={`${contactX - 9},${railTop - 22} ${contactX + 9},${railTop - 22} ${contactX},${railTop - 4}`} fill={colors.amber} opacity={draw} />
			<circle cx={contactX} cy={railTop} r={7} fill={colors.amber} style={{filter: `drop-shadow(0 0 8px ${colors.amber})`}} opacity={draw} />
		</g>
	);
};

/** Screen x of the contact on a wheel drawn by SectionWheel (for callouts). */
export const contactScreenX = (side: 1 | -1, cx: number, px: number, y: number): number => cx + side * contact(side * y).v * px;
