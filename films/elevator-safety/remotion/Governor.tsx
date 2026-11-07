import React from 'react';
import {colors} from '../../../lib/remotion/brand';
import {FLY, GOV_R} from './model';

// The governor in close-up (SIMPLIFIED classic flyweight governor): a rope sheave carrying two pivoted weights held in
// by springs; outside them, a fixed ring of ratchet teeth. As the sheave spins faster the weights swing out (radius from
// model.flyRadius); at the latch radius their tips catch a tooth and the sheave locks. An overspeed switch arm sits
// just inside the weights' path and flips a little before the latch. Drawn in mm around (cx, cy), k px per mm.

export const GovernorCloseUp: React.FC<{
	cx: number;
	cy: number;
	k: number;
	rot: number;
	r: number;
	locked: boolean;
	switchOn?: number;
	glowWeights?: number;
	glowRope?: number;
	ropeTravel: number;
	showSwitch?: boolean;
	/** the switch's opacity (it fades with its callout: viewer review v2 read it as a leftover box) */
	switchOpacity?: number;
	/** the frame plate behind the wheel; off in the close-up, where its edges ran through labels (viewer review v2) */
	plate?: boolean;
}> = ({cx, cy, k, rot, r, locked, switchOn = 0, glowWeights = 0, glowRope = 0, ropeTravel, showSwitch = false, switchOpacity = 1, plate = true}) => {
	const R = GOV_R * 1000; // pitch radius, mm
	const P = (x: number, y: number): [number, number] => [cx + x * k, cy - y * k];
	const rotPt = (x: number, y: number, a: number): [number, number] => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
	const ringR = FLY.rLatch + 20; // ratchet teeth just outside the latched weight tips
	const teeth = 18;
	const teethPath = Array.from({length: teeth}, (_, i) => {
		const a0 = (i / teeth) * 2 * Math.PI;
		const a1 = ((i + 0.65) / teeth) * 2 * Math.PI;
		const [x0, y0] = P((ringR + 10) * Math.cos(a0), (ringR + 10) * Math.sin(a0));
		const [x1, y1] = P(ringR * Math.cos(a1), ringR * Math.sin(a1));
		const [x2, y2] = P((ringR + 10) * Math.cos(a1 + 0.12), (ringR + 10) * Math.sin(a1 + 0.12));
		return `${i === 0 ? 'M' : 'L'} ${x0.toFixed(1)} ${y0.toFixed(1)} L ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)}`;
	}).join(' ');
	const wCol = glowWeights > 0.01 ? colors.amber : colors.line;
	const rCol = glowRope > 0.01 ? colors.amber : colors.sub;
	// the rope leaves the sheave at both sides, straight down
	const ropeMarks = (x: number) =>
		Array.from({length: 26}, (_, i) => {
			const y = -((((i * 22 + ropeTravel * 1000 * (x > 0 ? 1 : -1)) % 572) + 572) % 572) - 10;
			const [a, b] = P(x, y);
			return <line key={i} x1={a - 6} y1={b} x2={a + 6} y2={b} stroke={rCol} strokeWidth={2} />;
		});
	return (
		<g>
			{/* frame plates */}
			{plate ? <rect x={P(-210, 0)[0]} y={P(0, 210)[1]} width={420 * k} height={420 * k} rx={14} fill="rgba(13,20,32,0.65)" stroke={colors.sub} strokeWidth={2} /> : null}
			{/* rope down both sides */}
			<g style={glowRope > 0.01 ? {filter: `drop-shadow(0 0 8px ${colors.amber})`} : undefined}>
				{[-R, R].map((x) => {
					const [a, b] = P(x, 0);
					const [c, d] = P(x, -600);
					return <line key={x} x1={a} y1={b} x2={c} y2={d} stroke={rCol} strokeWidth={4} />;
				})}
				{ropeMarks(-R)}
				{ropeMarks(R)}
			</g>
			{/* ratchet ring (fixed) */}
			<path d={teethPath + ' Z'} fill="none" stroke={locked ? colors.amber : colors.sub} strokeWidth={2.5} />
			{/* sheave */}
			<circle cx={cx} cy={cy} r={R * k} fill="none" stroke={colors.line} strokeWidth={3} />
			<circle cx={cx} cy={cy} r={(R - 8) * k} fill="none" stroke={colors.grid} strokeWidth={6} />
			{Array.from({length: 6}, (_, i) => {
				const [x1, y1] = P(...rotPt(0, 22, rot + (i * Math.PI) / 3));
				const [x2, y2] = P(...rotPt(0, R - 12, rot + (i * Math.PI) / 3));
				return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={colors.metal} strokeWidth={3} />;
			})}
			{/* two flyweights: pivot at 30 mm, weight centre at radius r, tip 18 mm beyond */}
			{[0, Math.PI].map((side) => {
				const a = rot + side;
				const [pvx, pvy] = P(...rotPt(-30, 0, a));
				const [wx, wy] = P(...rotPt(-6, r, a));
				const [tx, ty] = P(...rotPt(-6, r + 18, a));
				const [sx, sy] = P(...rotPt(20, 18, a));
				// spring: zigzag from the weight back to the hub
				const n = 8;
				const zig = Array.from({length: n + 1}, (_, i) => {
					const u = i / n;
					const off = i === 0 || i === n ? 0 : (i % 2 ? 7 : -7);
					const bx = sx + (wx - sx) * u;
					const by = sy + (wy - sy) * u;
					const nx = -(wy - sy);
					const ny = wx - sx;
					const L = Math.hypot(nx, ny) || 1;
					return `${(bx + (nx / L) * off * k).toFixed(1)},${(by + (ny / L) * off * k).toFixed(1)}`;
				}).join(' ');
				return (
					<g key={side} style={glowWeights > 0.01 ? {filter: `drop-shadow(0 0 ${10 * glowWeights}px ${colors.amber})`} : undefined}>
						<line x1={pvx} y1={pvy} x2={wx} y2={wy} stroke={wCol} strokeWidth={5} />
						<polyline points={zig} fill="none" stroke={colors.cyan} strokeWidth={2.5} />
						<circle cx={wx} cy={wy} r={13 * k} fill="#2A3544" stroke={wCol} strokeWidth={3} />
						<line x1={wx} y1={wy} x2={tx} y2={ty} stroke={wCol} strokeWidth={6} strokeLinecap="round" />
						<circle cx={pvx} cy={pvy} r={4 * k} fill={colors.bg} stroke={wCol} strokeWidth={2} />
					</g>
				);
			})}
			<circle cx={cx} cy={cy} r={20 * k} fill="#2A3544" stroke={colors.line} strokeWidth={2.5} />
			{showSwitch ? (
				<g opacity={switchOpacity}>{(() => {
					const [bx, by] = P(150, 150);
					const ang = (-30 + 50 * switchOn) * (Math.PI / 180);
					return (
						<g>
							<rect x={bx - 18 * k} y={by - 14 * k} width={56 * k} height={30 * k} fill="#141E2C" stroke={switchOn > 0.5 ? colors.crimson : colors.sub} strokeWidth={2} />
							<line x1={bx} y1={by} x2={bx - 60 * k * Math.cos(ang)} y2={by + 60 * k * Math.sin(ang)} stroke={switchOn > 0.5 ? colors.crimson : colors.line} strokeWidth={4} strokeLinecap="round" />
						</g>
					);
				})()}</g>
			) : null}
		</g>
	);
};
