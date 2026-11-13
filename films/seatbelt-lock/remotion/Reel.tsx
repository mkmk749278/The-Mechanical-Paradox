import React from 'react';
import {colors} from '../../../lib/remotion/brand';
import {REEL, spoolRadius} from './model';

// The retractor in front section (ILLUSTRATION after patents US 4,485,986 and US 6,158,685; claims C03, C04): the
// frame's ring of inward ratchet teeth, the spring-loaded spool with its wound webbing, the heavy inertia disc riding
// loosely in front, the sensor arm pivoted on the reel, and below it the car sensor, a steel ball in a cone-shaped cup
// under a lever. Every angle comes from the caller's driver (model.ts), so the HUD and the picture never disagree.

export type ReelState = {
	/** reel (spool) angle, rad, positive = webbing paying out */
	reel: number;
	/** inertia disc angle, rad */
	disc: number;
	/** sensor arm swing 0 (folded) – 1 (in the teeth) */
	arm: number;
	/** visibility of the parts, 0–1 */
	show: {teeth?: number; spool?: number; disc?: number; arm?: number; cup?: number; hook?: number; bar?: number};
	/** the naive hook (scene 2): 0 up – 1 in the teeth */
	hook?: number;
	/** car sensor: ball climb 0–1 up the cup wall; lever lift follows it */
	ball?: number;
	/** the whole housing tilted, rad (gravitational locking) */
	tilt?: number;
	/** amber highlight 0–1 on the decision parts (disc mark, arm, ball) */
	glow?: number;
	/** belt tail leaving the spool, px long */
	tail?: number;
	/** torsion bar twist 0–1 (FEA field along the core) */
	twist?: number;
	/** the disc's lag behind the reel drawn ×lagGain (NOT TO SCALE when > 1) */
	lagGain?: number;
};

const toothPath = (cx: number, cy: number, s: number, rot: number): string => {
	// asymmetric ratchet teeth pointing inward: a steep flank that catches, a long ramp that lets the reel wind back
	const n = REEL.teeth;
	const R = REEL.ring * s;
	const r = (REEL.ring - REEL.toothH) * s;
	const pts: string[] = [];
	for (let i = 0; i < n; i++) {
		const a0 = rot + (i / n) * 2 * Math.PI;
		const a1 = a0 + (0.18 / n) * 2 * Math.PI; // steep flank
		const a2 = a0 + (1 / n) * 2 * Math.PI; // ramp back to the base
		pts.push(`${cx + R * Math.cos(a0)},${cy + R * Math.sin(a0)}`);
		pts.push(`${cx + r * Math.cos(a1)},${cy + r * Math.sin(a1)}`);
		pts.push(`${cx + R * Math.cos(a2)},${cy + R * Math.sin(a2)}`);
	}
	return `M${pts.join(' L')} Z`;
};

/** The arm's pivot and tip, screen px, for a reel angle and a swing 0–1. */
export const armGeom = (cx: number, cy: number, s: number, reel: number, swing: number): {px: number; py: number; tx: number; ty: number} => {
	const pa = reel - Math.PI / 2 - 0.9; // pivot sits up-left of the axle at rest, clear of the belt
	const px = cx + REEL.armPivot * s * Math.cos(pa);
	const py = cy + REEL.armPivot * s * Math.sin(pa);
	// folded: tip lies along the pivot circle (tangent, trailing); swung: tip points out between the teeth
	const folded = pa - Math.PI / 2 - 0.25;
	const out = pa - 0.18;
	const a = folded + (out - folded) * swing;
	return {px, py, tx: px + REEL.armLen * s * Math.cos(a), ty: py + REEL.armLen * s * Math.sin(a)};
};

export const Reel: React.FC<{cx: number; cy: number; s: number; st: ReelState}> = ({cx, cy, s, st}) => {
	const sh = st.show;
	const g = st.glow ?? 0;
	const tilt = ((st.tilt ?? 0) * 180) / Math.PI;
	const rS = spoolRadius() * s;
	const core = REEL.core * s;
	const ringR = (REEL.ring + 7) * s;
	const arm = armGeom(cx, cy, s, st.reel, st.arm);
	const discShown = st.reel - (st.reel - st.disc) * (st.lagGain ?? 1);
	const discMark = discShown - Math.PI / 2;
	const reelMark = st.reel - Math.PI / 2;
	// car sensor geometry, just under the housing: the lever's tip reaches up into the ring of teeth when the ball climbs
	const sg = sensorGeom(cx, cy, s, st.ball ?? 0);
	const {cupY, cupW, cupH, ballR, bx, by, lpX, lpY, lTipX, lTipY} = sg;
	const climb = st.ball ?? 0;
	const hookT = st.hook ?? 0;
	return (
		<g transform={`rotate(${tilt} ${cx} ${cy})`}>
			{/* the frame */}
			<circle cx={cx} cy={cy} r={ringR} fill="rgba(13,20,32,0.85)" stroke={colors.line} strokeWidth={3} opacity={sh.teeth ?? 1} />
			<path d={toothPath(cx, cy, s, 0)} fill="rgba(106,123,140,0.35)" stroke={colors.line} strokeWidth={2.5} strokeLinejoin="round" opacity={sh.teeth ?? 1} />
			{/* the spool: core, wound webbing (cyan = the belt carrying load), a white index mark that turns with it */}
			<g opacity={sh.spool ?? 1}>
				{Array.from({length: REEL.wound}).map((_, i) => (
					<circle key={i} cx={cx} cy={cy} r={core + (i + 0.5) * REEL.webT * s} fill="none" stroke={colors.cyan} strokeWidth={REEL.webT * s * 0.8} opacity={0.75} />
				))}
				<circle cx={cx} cy={cy} r={core} fill="rgba(7,10,15,0.9)" stroke={colors.line} strokeWidth={2.5} />
				{/* torsion bar end, in the core */}
				<circle cx={cx} cy={cy} r={core * 0.45} fill={st.twist ? `rgba(255,${Math.round(225 - 170 * st.twist)},${Math.round(77 - 60 * st.twist)},${0.35 + 0.5 * st.twist})` : 'rgba(106,123,140,0.5)'} stroke={colors.line} strokeWidth={2} opacity={sh.bar ?? 0} />
				<line x1={cx} y1={cy} x2={cx + REEL.disc * s * 0.98 * Math.cos(reelMark)} y2={cy + REEL.disc * s * 0.98 * Math.sin(reelMark)} stroke={colors.ink} strokeWidth={4} strokeLinecap="round" />
				{/* the belt leaving the spool tangentially, up toward the pillar */}
				<rect x={cx + rS - REEL.webT * s} y={cy - (st.tail ?? 300)} width={REEL.webT * s * 2.2} height={st.tail ?? 300} fill={colors.cyan} opacity={0.85} />
			</g>
			{/* the heavy disc riding loosely in front (translucent), its amber mark */}
			<g opacity={sh.disc ?? 0}>
				<circle cx={cx} cy={cy} r={REEL.disc * s} fill="rgba(255,159,28,0.07)" stroke={colors.amber} strokeWidth={3} strokeDasharray="10 7" />
				<line
					x1={cx + core * 1.05 * Math.cos(discMark)}
					y1={cy + core * 1.05 * Math.sin(discMark)}
					x2={cx + REEL.disc * s * Math.cos(discMark)}
					y2={cy + REEL.disc * s * Math.sin(discMark)}
					stroke={colors.amber}
					strokeWidth={6}
					strokeLinecap="round"
					style={g > 0 ? {filter: `drop-shadow(0 0 ${10 * g}px ${colors.amber})`} : undefined}
				/>
			</g>
			{/* the sensor arm on the reel */}
			<g opacity={sh.arm ?? 0}>
				<line x1={arm.px} y1={arm.py} x2={arm.tx} y2={arm.ty} stroke={st.arm > 0.98 ? colors.crimson : colors.amber} strokeWidth={7} strokeLinecap="round" />
				<circle cx={arm.px} cy={arm.py} r={7} fill={colors.bg} stroke={colors.line} strokeWidth={2.5} />
			</g>
			{/* the naive hook (scene 2): a pawl pivoted on the frame, its tip dropping into a tooth gap */}
			<g opacity={sh.hook ?? 0}>
				{(() => {
					const pa = (215 * Math.PI) / 180;
					const ta = (196 * Math.PI) / 180;
					const pr = (REEL.ring + 14) * s;
					const tr = (REEL.ring + 4 - (REEL.toothH + 3) * hookT) * s;
					const px = cx + pr * Math.cos(pa);
					const py = cy + pr * Math.sin(pa);
					return (
						<>
							<line x1={px} y1={py} x2={cx + tr * Math.cos(ta)} y2={cy + tr * Math.sin(ta)} stroke={hookT > 0.95 ? colors.crimson : colors.amber} strokeWidth={9} strokeLinecap="round" />
							<circle cx={px} cy={py} r={9} fill={colors.bg} stroke={colors.line} strokeWidth={2.5} />
						</>
					);
				})()}
			</g>
			{/* the car sensor: cone cup, ball, lever (NOT TO SCALE: enlarged) */}
			<g opacity={sh.cup ?? 0}>
				<path d={`M${cx - cupW} ${cupY - cupH} L${cx} ${cupY} L${cx + cupW} ${cupY - cupH}`} fill="none" stroke={colors.line} strokeWidth={4} strokeLinejoin="round" />
				<line x1={cx - cupW * 1.15} y1={cupY + 8} x2={cx + cupW * 1.15} y2={cupY + 8} stroke={colors.metal} strokeWidth={3} />
				<circle cx={bx} cy={by} r={ballR} fill="url(#steelBall)" stroke={colors.line} strokeWidth={2} style={g > 0 ? {filter: `drop-shadow(0 0 ${12 * g}px ${colors.amber})`} : undefined} />
				<line x1={lpX} y1={lpY} x2={lTipX} y2={lTipY} stroke={climb > 0.95 ? colors.crimson : colors.amber} strokeWidth={6} strokeLinecap="round" />
				<circle cx={lpX} cy={lpY} r={7} fill={colors.bg} stroke={colors.line} strokeWidth={2.5} />
				<defs>
					<radialGradient id="steelBall" cx="35%" cy="30%" r="70%">
						<stop offset="0%" stopColor="#F1F5F9" />
						<stop offset="55%" stopColor="#8B9EB5" />
						<stop offset="100%" stopColor="#3B4A5C" />
					</radialGradient>
				</defs>
			</g>
		</g>
	);
};

/** The car sensor's geometry (screen px): cup, ball, and the lever resting on the ball, whose tip lifts into the teeth.
 * Drawn NOT TO SCALE: the cup's wall at 35° (the model's 19° would lift the ball too little to see); the lever passes
 * through the ball's top point, so the contact is true, and its tip enters a tooth gap at the ring's bottom only when the
 * ball has climbed (solved numerically for these proportions, 2026-11-13). */
export const sensorGeom = (cx: number, cy: number, s: number, climb: number) => {
	const ringR = (REEL.ring + 7) * s;
	const beta = (35 * Math.PI) / 180;
	const cupY = cy + ringR + 14.9 * s;
	const cupW = 14 * s;
	const cupH = cupW * Math.tan(beta);
	const ballR = 4.5 * s;
	const bx = cx + climb * cupW * 0.6;
	const by = cupY - ballR / Math.cos(beta) - climb * cupW * 0.6 * Math.tan(beta);
	const lpX = cx + 21.7 * s;
	const lpY = cy + ringR + 8.1 * s;
	const topY = by - ballR;
	const lTipX = cx - 5.4 * s;
	const lTipY = lpY + (topY - lpY) * ((lTipX - lpX) / (bx - lpX));
	return {cupY, cupW, cupH, ballR, bx, by, lpX, lpY, lTipX, lTipY};
};

/** Where the car sensor's ball sits (for callouts), screen px. */
export const ballPos = (cx: number, cy: number, s: number, climb: number): [number, number] => {
	const g = sensorGeom(cx, cy, s, climb);
	return [g.bx, g.by];
};
