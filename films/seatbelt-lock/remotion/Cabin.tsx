import React from 'react';
import {useCurrentFrame} from 'remotion';
import {colors} from '../../../lib/remotion/brand';

// One front seat in side section (ILLUSTRATION): the car's floor, pillar, roof and dash in blueprint lines, the seat,
// a neutral occupant outline (no face, no identity: posture only), and the belt from the pillar's guide across the
// chest to the buckle. The torso pivots at the hip; the belt follows the shoulder, so a lean or a surge visibly pays
// belt out of the pillar. The retractor box sits low in the pillar, where the film dives in.

export type CabinState = {
	/** torso pitch forward, deg (0 = upright against the seat back) */
	pitch: number;
	/** whole-body slide forward along the seat, px */
	surge?: number;
	/** the belt's colour state: 'free' cyan (paying out), 'locked' crimson-edged */
	locked?: number;
	/** front crumple 0–1 (the bonnet's lines fold) */
	crumple?: number;
	/** chest load field 0–1 (FEA ramp under the belt) */
	chest?: number;
	/** airbag 0–1 */
	airbag?: number;
	/** barrier shown at the front, 0–1 */
	barrier?: number;
	/** the retractor box highlighted 0–1 */
	reelGlow?: number;
	/** the whole car rolled, deg */
	roll?: number;
	/** a larger occupant outline (scale) */
	big?: number;
	/** the road under the car: the frame it stopped dead (a crash), or undefined = always moving */
	stopAt?: number;
};

export const HIP: [number, number] = [860, 700];
export const PILLAR = {x: 640, guideY: 420, reelY: 760};

const feaColor = (t: number): string => {
	const stops = ['#0B1F4D', '#00E5FF', '#FFE14D', '#FF3B30'];
	const x = Math.max(0, Math.min(0.999, t)) * (stops.length - 1);
	return stops[Math.floor(x)];
};

/** Shoulder position for a pitch, px (for callouts and belt geometry). */
export const shoulder = (pitch: number, surge = 0, big = 1): [number, number] => {
	const L = 250 * big;
	const a = ((-100 + pitch) * Math.PI) / 180;
	return [HIP[0] + surge + L * Math.cos(a), HIP[1] + L * Math.sin(a)];
};

export const Cabin: React.FC<{st: CabinState}> = ({st}) => {
	const frame = useCurrentFrame();
	// the road scrolls under the car (14 px a frame, about driving pace on this scale); a crash stops it dead
	const roadF = st.stopAt !== undefined ? Math.min(frame, st.stopAt) : frame;
	const roadX = -((roadF * 14) % 160);
	const push = 1 + 0.03 * Math.min(1, frame / 600);
	const surge = st.surge ?? 0;
	const big = st.big ?? 1;
	const [sx, sy] = shoulder(st.pitch, surge, big);
	const hx = HIP[0] + surge;
	const hy = HIP[1];
	const headA = ((-100 + st.pitch * 1.15) * Math.PI) / 180;
	const headX = hx + 330 * big * Math.cos(headA);
	const headY = hy + 330 * big * Math.sin(headA);
	const knee: [number, number] = [hx + 250, hy - 10];
	const foot: [number, number] = [hx + 330, hy + 120];
	const hand: [number, number] = [1210 + st.pitch * 2.5, 520 + st.pitch * 2];
	const elbow: [number, number] = [(sx + hand[0]) / 2 + 10, (sy + hand[1]) / 2 + 60];
	const crumple = st.crumple ?? 0;
	const front = 1700 - 180 * crumple;
	const locked = st.locked ?? 0;
	const beltColor = locked > 0.5 ? colors.crimson : colors.cyan;
	const chest = st.chest ?? 0;
	const roll = st.roll ?? 0;
	const buckle: [number, number] = [hx + 40, hy + 30];
	const guide: [number, number] = [PILLAR.x + 10, PILLAR.guideY];
	return (
		<g transform={`translate(960 600) scale(${push}) translate(-960 -600) rotate(${roll} 1000 600)`}>
			{/* road dashes under the car */}
			<g opacity={0.5}>
				{Array.from({length: 16}).map((_, i) => (
					<line key={i} x1={roadX + i * 160} y1={950} x2={roadX + i * 160 + 70} y2={950} stroke={colors.metal} strokeWidth={5} strokeLinecap="round" />
				))}
				<line x1={0} y1={940} x2={1920} y2={940} stroke={colors.metal} strokeWidth={2} opacity={0.6} />
			</g>
			{/* the car: floor, pillar, roof, windscreen, dash, bonnet (folds with crumple) */}
			<g fill="none" stroke={colors.line} strokeWidth={3} strokeLinejoin="round" opacity={0.9}>
				<path d={`M300 820 L${front - 60} 820`} />
				<path d={`M${PILLAR.x - 30} 820 L${PILLAR.x - 30} 300 L${PILLAR.x + 30} 300 L${PILLAR.x + 30} 820`} />
				<path d={`M220 300 L1150 300 L1420 470`} />
				<path d={`M1290 560 L1420 470 L${front - 120 + crumple * 40} ${560 - crumple * 30} L${front} ${640 + crumple * 40} L${front - 60} 820`} />
				<path d="M1150 560 L1300 560 L1300 640 L1180 640" />
				{/* rear and front side windows, the door's shut line, the sill */}
				<path d={`M260 320 L${PILLAR.x - 50} 320 L${PILLAR.x - 50} 520 L300 520 Z`} strokeWidth={2} opacity={0.55} />
				<path d={`M${PILLAR.x + 50} 320 L1140 320 L1330 470 L${PILLAR.x + 50} 470 Z`} strokeWidth={2} opacity={0.55} />
				<path d={`M${PILLAR.x + 30} 520 L1290 560`} strokeWidth={2} opacity={0.45} />
				<path d={`M300 860 L${front - 80} 860`} strokeWidth={2} opacity={0.5} />
			</g>
			{/* wheels */}
			<g fill="none" stroke={colors.metal} strokeWidth={5}>
				<circle cx={430} cy={860} r={78} />
				<circle cx={430} cy={860} r={40} strokeWidth={3} />
				<circle cx={front - 300} cy={860} r={78} />
				<circle cx={front - 300} cy={860} r={40} strokeWidth={3} />
			</g>
			{/* the retractor, low in the pillar: a small reel the film dives into */}
			<g opacity={0.45 + 0.55 * (st.reelGlow ?? 0)} style={(st.reelGlow ?? 0) > 0.1 ? {filter: `drop-shadow(0 0 ${10 * (st.reelGlow ?? 0)}px ${colors.amber})`} : undefined}>
				<circle cx={PILLAR.x} cy={PILLAR.reelY} r={26} fill="rgba(13,20,32,0.9)" stroke={colors.amber} strokeWidth={3} />
				<circle cx={PILLAR.x} cy={PILLAR.reelY} r={15} fill="none" stroke={colors.cyan} strokeWidth={6} />
				<circle cx={PILLAR.x} cy={PILLAR.reelY} r={5} fill={colors.line} />
			</g>
			{/* steering wheel */}
			<line x1={1150} y1={600} x2={1215} y2={450} stroke={colors.line} strokeWidth={10} strokeLinecap="round" opacity={0.85} />
			{/* the seat */}
			<path d={`M${hx - 60} ${hy + 50} L${hx + 230} ${hy + 30} L${hx + 230} ${hy + 70} L${hx - 70} ${hy + 90} Z`} fill="rgba(106,123,140,0.18)" stroke={colors.metal} strokeWidth={3} />
			<path d={`M${HIP[0] - 70} ${HIP[1] + 60} L${HIP[0] - 140} ${HIP[1] - 300} L${HIP[0] - 90} ${HIP[1] - 310} L${HIP[0] - 20} ${HIP[1] + 40} Z`} fill="rgba(106,123,140,0.18)" stroke={colors.metal} strokeWidth={3} />
			{/* occupant outline: torso, head, arm, leg (posture only) */}
			<g stroke={colors.sub} strokeWidth={28 * big} strokeLinecap="round" fill="none" opacity={0.85}>
				<line x1={hx} y1={hy} x2={sx} y2={sy} />
				<polyline points={`${hx},${hy} ${knee[0]},${knee[1]} ${foot[0]},${foot[1]}`} strokeLinejoin="round" />
				<polyline points={`${sx},${sy} ${elbow[0]},${elbow[1]} ${hand[0]},${hand[1]}`} strokeWidth={20 * big} strokeLinejoin="round" />
			</g>
			<circle cx={headX} cy={headY} r={52 * big} fill="rgba(139,158,181,0.25)" stroke={colors.sub} strokeWidth={5} />
			{/* chest load field under the belt */}
			{chest > 0.01 ? (
				<line x1={sx + 6} y1={sy + 20} x2={(sx + buckle[0]) / 2} y2={(sy + buckle[1]) / 2} stroke={feaColor(chest)} strokeWidth={70} strokeLinecap="round" opacity={0.55 * Math.min(1, chest * 1.6)} style={{filter: `blur(10px)`}} />
			) : null}
			{/* the belt: guide → shoulder → across the chest → buckle; lap part → outboard anchor */}
			<polyline points={`${PILLAR.x + 21},${PILLAR.reelY} ${PILLAR.x + 14},${guide[1] + 20} ${guide[0]},${guide[1]} ${sx + 6},${sy + 4} ${buckle[0]},${buckle[1]}`} fill="none" stroke={beltColor} strokeWidth={14} strokeLinejoin="round" style={locked > 0.5 ? {filter: `drop-shadow(0 0 8px ${colors.crimson})`} : undefined} />
			<line x1={buckle[0]} y1={buckle[1]} x2={hx - 90} y2={hy + 40} stroke={beltColor} strokeWidth={14} strokeLinecap="round" />
			<circle cx={guide[0]} cy={guide[1]} r={10} fill={colors.bg} stroke={colors.line} strokeWidth={3} />
			<rect x={buckle[0] - 14} y={buckle[1] - 10} width={28} height={22} rx={4} fill={colors.metal} />
			{/* airbag */}
			{(st.airbag ?? 0) > 0.01 ? (
				<ellipse cx={1170} cy={470} rx={120 * (st.airbag ?? 0)} ry={150 * (st.airbag ?? 0)} fill="rgba(241,245,249,0.12)" stroke={colors.line} strokeWidth={3} />
			) : null}
			{/* barrier */}
			<g opacity={st.barrier ?? 0}>
				<rect x={front} y={430} width={70} height={390} fill="rgba(255,59,48,0.12)" stroke={colors.crimson} strokeWidth={3} />
				{Array.from({length: 6}).map((_, i) => (
					<line key={i} x1={front} y1={450 + i * 64} x2={front + 70} y2={490 + i * 64} stroke={colors.crimson} strokeWidth={2} opacity={0.6} />
				))}
			</g>
		</g>
	);
};
