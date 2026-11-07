import React from 'react';
import {colors} from '../../../lib/remotion/brand';
import {H, W} from '../../../lib/remotion/kit';
import {GOV_R, LEVER} from './model';

// The shaft in section (SIMPLIFIED): a traction lift drawn in world metres (y up, x = 0 on the car's centre line),
// shown through a camera. Every moving part takes its state from props, so one driver moves the picture and the HUD
// together (PLAYBOOK §8.4). Layout: car in its sling between two T-rails; ropes up over the machine sheave and a
// deflector down to the counterweight; the governor top-left with its rope loop down to a weighted pulley in the pit,
// hitched to the safety lever on the crosshead; pull rods from the lever to the safety gear under the car.

export const SH = {
	top: 14,
	railX: 0.85,
	carHalf: 0.72,
	carH: 2.3,
	plank: -0.15,
	cross: 2.55,
	sheave: {x: 0.3, y: 13.4, r: 0.3},
	deflect: {x: 1.3, y: 12.9, r: 0.3},
	cwX: 1.6,
	cwRail: [1.43, 1.77] as const,
	cwH: 1.7,
	gov: {x: -1.25, y: 13.5},
	tension: {x: -1.25, y: 0.45},
	pivotX: -0.92,
} as const;

export type Cam = {cx: number; cy: number; s: number};
export const toScreen = (cam: Cam, X: number, Y: number): [number, number] => [W / 2 + (X - cam.cx) * cam.s, H / 2 - (Y - cam.cy) * cam.s];

export type ShaftState = {
	/** height of the car platform, m */
	carY: number;
	/** height of the counterweight's base, m */
	cwY: number;
	/** governor sheave rotation, rad */
	govRot: number;
	/** how far the governor rope has run, m (its marks move with it: you can see it stop) */
	ropeTravel: number;
	/** lever angle, deg (0 = rest) */
	leverDeg: number;
	/** wedge lift at the gear, 0–1 (drawn as 0–60 mm, NOT TO SCALE) */
	wedge: number;
	/** suspension ropes: 1 intact; 0–1 after the snap = how far the broken ends have flown apart */
	snap?: number;
	/** highlight strengths 0–1 */
	glowGovRope?: number;
	glowLever?: number;
	glowGear?: number;
	/** sparks/heat at the rails during braking, 0–1 */
	rub?: number;
	/** scrape marks the wedges cut: from this height (m) up to the gear, 0 = none */
	scrapeFrom?: number;
	scrapeTo?: number;
	scrapeGlow?: number;
	/** dim everything but the highlighted parts, 0–1 */
	focus?: number;
	/** show the machine room parts (sheaves, governor) */
	showTop?: boolean;
};

const steel = '#2A3544';

export const Shaft: React.FC<{cam: Cam; st: ShaftState; opacity?: number}> = ({cam, st, opacity = 1}) => {
	const P = (X: number, Y: number) => toScreen(cam, X, Y);
	const px = (m: number) => m * cam.s;
	const dim = 1 - 0.65 * (st.focus ?? 0);
	const line = (x1: number, y1: number, x2: number, y2: number, stroke: string, w: number, o = 1, dash?: string) => {
		const [a, b] = P(x1, y1);
		const [c, d] = P(x2, y2);
		return <line x1={a} y1={b} x2={c} y2={d} stroke={stroke} strokeWidth={w} opacity={o} strokeDasharray={dash} />;
	};
	const rect = (x: number, y: number, w: number, h: number, fill: string, stroke: string, sw: number, o = 1) => {
		const [a, b] = P(x, y + h);
		return <rect x={a} y={b} width={px(w)} height={px(h)} fill={fill} stroke={stroke} strokeWidth={sw} opacity={o} />;
	};
	const circ = (x: number, y: number, r: number, fill: string, stroke: string, sw: number, o = 1) => {
		const [a, b] = P(x, y);
		return <circle cx={a} cy={b} r={px(r)} fill={fill} stroke={stroke} strokeWidth={sw} opacity={o} />;
	};
	const top = st.carY + SH.cross;
	const snap = st.snap ?? 0;

	// ---- the suspension ropes: car hitch → main sheave (left tangent) → over → deflector → counterweight ----
	const s1 = SH.sheave;
	const s2 = SH.deflect;
	const dx = s2.x - s1.x;
	const dy = s2.y - s1.y;
	const len = Math.hypot(dx, dy);
	const nx = -dy / len;
	const ny = dx / len; // the upward normal of the line between centres
	const t1: [number, number] = [s1.x + s1.r * nx, s1.y + s1.r * ny];
	const t2: [number, number] = [s2.x + s2.r * nx, s2.y + s2.r * ny];
	const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
		const n = 24;
		const pts: string[] = [];
		for (let i = 0; i <= n; i++) {
			const a = a0 + ((a1 - a0) * i) / n;
			const [u, v] = P(cx + r * Math.cos(a), cy + r * Math.sin(a));
			pts.push(`${u.toFixed(1)},${v.toFixed(1)}`);
		}
		return pts.join(' ');
	};
	const aN = Math.atan2(ny, nx);
	const breakY = top + 3.2;
	const ropes = (
		<g opacity={dim}>
			{[-0.05, 0, 0.05].map((o, i) => {
				if (snap <= 0) return <g key={o}>{line(o, top, o, s1.y, colors.line, 3)}</g>;
				// broken: the car's ends fall slack and curl; the upper ends recoil up and whip
				const side = i - 1 || 0.6;
				const lo = breakY - 0.35 * snap;
				const [ax, ay] = P(o, top);
				const [bx, by] = P(o + side * 0.22 * snap, lo);
				const [cx, cy] = P(o + side * 0.35 * snap, (top + lo) / 2);
				const upY = breakY + 0.25 + 1.1 * snap;
				const pts: string[] = [];
				for (let k = 0; k <= 30; k++) {
					const y = upY + ((s1.y - upY) * k) / 30;
					const wob = Math.sin(k * 0.9 + snap * 7) * 0.06 * (1 - k / 30) * snap;
					const [u, v] = P(o + wob, y);
					pts.push(`${u.toFixed(1)},${v.toFixed(1)}`);
				}
				const [ux, uy] = P(o, upY);
				return (
					<g key={o}>
						<path d={`M ${ax} ${ay} Q ${cx} ${cy} ${bx} ${by}`} fill="none" stroke={colors.line} strokeWidth={3} />
						<polyline points={pts.join(' ')} fill="none" stroke={colors.line} strokeWidth={3} />
						{[[bx, by], [ux, uy]].map(([x, y], k) => (
							<g key={k} style={{filter: `drop-shadow(0 0 8px ${colors.crimson})`}}>
								{[-1, 0, 1].map((j) => (
									<line key={j} x1={x} y1={y} x2={x + j * 7} y2={y + (k ? 12 : -12)} stroke={colors.crimson} strokeWidth={2.5} />
								))}
							</g>
						))}
					</g>
				);
			})}
			<polyline points={arc(s1.x, s1.y, s1.r, Math.PI, aN)} fill="none" stroke={colors.line} strokeWidth={3} />
			{line(t1[0], t1[1], t2[0], t2[1], colors.line, 3)}
			<polyline points={arc(s2.x, s2.y, s2.r, aN, 0)} fill="none" stroke={colors.line} strokeWidth={3} />
			{line(SH.cwX, s2.y, SH.cwX, st.cwY + SH.cwH, colors.line, 3)}
		</g>
	);

	// ---- the governor and its rope loop ----
	const gx = SH.gov.x;
	const tx = SH.tension.x;
	const rL = gx - GOV_R;
	const rR = gx + GOV_R;
	const govRopeCol = (st.glowGovRope ?? 0) > 0.01 ? colors.amber : colors.sub;
	const govRope = (hy: number) => (
		<g style={(st.glowGovRope ?? 0) > 0.01 ? {filter: `drop-shadow(0 0 ${8 * (st.glowGovRope ?? 0)}px ${colors.amber})`} : undefined}>
			{line(rL, SH.gov.y, rL, SH.tension.y, govRopeCol, 2.2)}
			{line(rR, SH.gov.y, rR, hy, govRopeCol, 2.2)}
			{line(rR, hy, rR, SH.tension.y, govRopeCol, 2.2)}
			{/* rope marks that travel with the rope: you can see it stop */}
			{Array.from({length: 40}, (_, i) => {
				const y = SH.tension.y + ((((i * 0.37 - st.ropeTravel) % 14) + 14) % 14);
				if (y > SH.gov.y || y < SH.tension.y) return null;
				const [a, b] = P(rR, y);
				return <line key={i} x1={a - 5} y1={b} x2={a + 5} y2={b} stroke={govRopeCol} strokeWidth={2} />;
			})}
		</g>
	);
	const sheaveSpokes = (cx: number, cy: number, r: number, rot: number, col: string) =>
		Array.from({length: 6}, (_, i) => {
			const a = rot + (i * Math.PI) / 3;
			return <g key={i}>{line(cx, cy, cx + r * 0.85 * Math.cos(a), cy + r * 0.85 * Math.sin(a), col, 2)}</g>;
		});

	// ---- the lever on the crosshead: pivot moves with the car; the hitch end follows the rope ----
	const th = (st.leverDeg * Math.PI) / 180;
	const lev = {
		px: SH.pivotX,
		py: top,
		hx: SH.pivotX - (LEVER.arm / 1000) * Math.cos(th),
		hy: top + (LEVER.arm / 1000) * Math.sin(th),
		// the bell crank's other arm drives the pull rod down to the gear
		rx: SH.pivotX + 0.08 * Math.cos(th),
		ry: top - 0.08 * Math.sin(th),
	};
	const levCol = (st.glowLever ?? 0) > 0.01 ? colors.amber : colors.line;

	// ---- the safety gear at the plank, both rails ----
	const wedgeLift = st.wedge * 0.06;
	const gear = (side: 1 | -1) => {
		const x = side * SH.railX;
		const y = st.carY + SH.plank - 0.11;
		const glow = st.glowGear ?? 0;
		return (
			<g key={side} style={glow > 0.01 ? {filter: `drop-shadow(0 0 ${10 * glow}px ${colors.amber})`} : undefined}>
				{rect(x - 0.1, y, 0.2, 0.22, steel, glow > 0.01 ? colors.amber : colors.line, 2)}
				{/* two wedges, one each side of the rail blade, lifted by the pull rod */}
				{rect(x - 0.045, y + 0.03 + wedgeLift, 0.025, 0.12, glow > 0.01 ? colors.amber : colors.metal, colors.line, 1.2)}
				{rect(x + 0.02, y + 0.03 + wedgeLift, 0.025, 0.12, glow > 0.01 ? colors.amber : colors.metal, colors.line, 1.2)}
			</g>
		);
	};

	const rub = st.rub ?? 0;
	return (
		<g opacity={opacity}>
			{/* shaft walls and pit floor */}
			<g opacity={0.6 * dim}>
				{line(-1.75, 0, -1.75, SH.top, colors.sub, 2)}
				{line(1.95, 0, 1.95, SH.top, colors.sub, 2)}
				{line(-1.75, 0, 1.95, 0, colors.sub, 2)}
				{Array.from({length: 60}, (_, i) => line(-1.75, i * 0.25, -1.9, i * 0.25 - 0.15, colors.grid, 2))}
				{Array.from({length: 60}, (_, i) => line(1.95, i * 0.25, 2.1, i * 0.25 - 0.15, colors.grid, 2))}
			</g>
			{/* guide rails (T-section blades seen edge-on) */}
			<g opacity={dim}>
				{[-1, 1].map((s) => (
					<g key={s}>{rect(s * SH.railX - 0.008, 0, 0.016, SH.top - 0.5, '#3B4A5C', colors.line, 1.2)}</g>
				))}
				{Array.from({length: 11}, (_, i) =>
					[-1, 1].map((sd) => <g key={`${i}${sd}`}>{rect(sd * SH.railX - (sd < 0 ? 0.09 : -0.0), 0.6 + i * 1.25, 0.09, 0.05, '#2A3544', colors.sub, 1)}</g>),
				)}
				{SH.cwRail.map((x) => (
					<g key={x}>{rect(x - 0.006, 0, 0.012, SH.top - 0.5, '#3B4A5C', colors.sub, 1)}</g>
				))}
			</g>
			{/* braking: the rail face lit where the wedges slide */}
			{rub > 0.01
				? [-1, 1].map((s) => {
						const [a, b] = P(s * SH.railX, st.carY + SH.plank);
						return <ellipse key={s} cx={a} cy={b} rx={px(0.03)} ry={px(0.12)} fill={colors.crimson} opacity={0.75 * rub} style={{filter: `drop-shadow(0 0 14px ${colors.crimson})`}} />;
					})
				: null}
			{st.scrapeFrom !== undefined && st.scrapeTo !== undefined
				? [-1, 1].map((sd) => {
						const g = st.scrapeGlow ?? 0;
						return (
							<g key={sd}>
								{[-0.004, 0.004].map((o) => (
									<g key={o}>{line(sd * SH.railX + o, st.scrapeFrom ?? 0, sd * SH.railX + o, st.scrapeTo ?? 0, g > 0.02 ? colors.crimson : '#C9D3DE', 2.2, 0.55 + 0.45 * g)}</g>
								))}
							</g>
						);
					})
				: null}
			{ropes}
			{/* counterweight */}
			<g opacity={dim}>
				{rect(SH.cwX - 0.15, st.cwY, 0.3, SH.cwH, '#1A2330', colors.line, 2)}
				{Array.from({length: 7}, (_, i) => line(SH.cwX - 0.15, st.cwY + 0.22 * (i + 1), SH.cwX + 0.15, st.cwY + 0.22 * (i + 1), colors.sub, 1.2))}
			</g>
			{/* car: body, door line, sling (stiles, crosshead, safety plank) */}
			<g opacity={dim}>
				{rect(-SH.carHalf, st.carY, SH.carHalf * 2, SH.carH, '#121B27', colors.line, 2.5)}
				{line(0, st.carY + 0.05, 0, st.carY + 2.05, colors.sub, 1.5)}
				{rect(-0.5, st.carY + 0.05, 1.0, 2.0, 'none', colors.sub, 1.5)}
				{[-1, 1].map((s) => (
					<g key={s}>{rect(s * 0.8 - 0.025, st.carY + SH.plank, 0.05, SH.cross - SH.plank, steel, colors.line, 2)}</g>
				))}
				{rect(-0.83, top - 0.06, 1.66, 0.12, steel, colors.line, 2)}
				{rect(-0.83, st.carY + SH.plank - 0.06, 1.66, 0.12, steel, colors.line, 2)}
				{/* the crosshead's arm out to the lever pivot */}
				{line(-0.83, top, SH.pivotX, top, colors.line, 3)}
			</g>
			{/* pull rods: lever → down the stile → the left gear; a cross rod to the right gear */}
			<g opacity={Math.max(dim, st.glowLever ?? 0)}>
				{line(lev.rx, lev.ry, lev.rx, st.carY + SH.plank + 0.05 + wedgeLift, levCol, 2.5)}
				{line(-SH.railX, st.carY + SH.plank - 0.02 + wedgeLift, SH.railX, st.carY + SH.plank - 0.02 + wedgeLift, levCol, 2, 1, '10 6')}
			</g>
			{gear(-1)}
			{gear(1)}
			{/* lever */}
			<g style={(st.glowLever ?? 0) > 0.01 ? {filter: `drop-shadow(0 0 ${10 * (st.glowLever ?? 0)}px ${colors.amber})`} : undefined}>
				{line(lev.hx, lev.hy, lev.rx, lev.ry, levCol, 5)}
				{circ(lev.px, lev.py, 0.022, colors.bg, levCol, 2.5)}
				{circ(lev.hx, lev.hy, 0.016, levCol, levCol, 1)}
			</g>
			{govRope(lev.hy)}
			{st.showTop !== false ? (
				<g opacity={dim}>
					{/* machine: main sheave + deflector */}
					{circ(s1.x, s1.y, s1.r, '#141E2C', colors.line, 2.5)}
					{circ(s2.x, s2.y, s2.r, '#141E2C', colors.line, 2)}
					{rect(s1.x - 0.45, s1.y + 0.1, 0.9, 0.35, steel, colors.sub, 1.5)}
					{/* the controller cabinet beside the machine */}
					{rect(0.78, 13.4, 0.38, 0.5, '#141E2C', colors.sub, 1.5)}
					{Array.from({length: 4}, (_, i) => line(0.84, 13.5 + i * 0.09, 1.1, 13.5 + i * 0.09, colors.grid, 1.5))}
				</g>
			) : null}
			{/* governor sheave and the tension pulley with its weight */}
			<g>
				{circ(gx, SH.gov.y, GOV_R, '#141E2C', (st.glowGovRope ?? 0) > 0.01 ? colors.amber : colors.line, 2.5)}
				{sheaveSpokes(gx, SH.gov.y, GOV_R, st.govRot, colors.line)}
				{circ(tx, SH.tension.y, GOV_R, '#141E2C', colors.sub, 2)}
				{sheaveSpokes(tx, SH.tension.y, GOV_R, -st.govRot, colors.sub)}
				{rect(tx - 0.12, SH.tension.y - 0.45, 0.24, 0.22, steel, colors.sub, 1.5)}
				{line(tx, SH.tension.y, tx, SH.tension.y - 0.23, colors.sub, 2)}
			</g>
		</g>
	);
};
