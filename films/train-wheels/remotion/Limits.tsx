import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {colors, feaRamp} from '../../../lib/remotion/brand';
import {Hud} from '../../../lib/remotion/Hud';
import {ease, tween} from '../../../lib/remotion/motion';
import {SfxCue} from '../../../lib/remotion/sfx';
import {Arrow, Callout, H, Label, lin, off, on, pen, Stage, Svg, Tag, TopWheelset} from './kit';
import {shiftNeeded, tightestCurve, WS} from './model';
import {contact, railOutline, wheelOutline} from './profiles';
import {at, span} from './scenes';

// s09 where the cone runs out, s10 the screech, s11 Nadal's limit (scenes/s09_s11_limits.md).

// ================================================================================================================
// s09 · the curve limit: y_needed = b0 r0 / (λ R) (C13) against the ±7 mm play (C09); the line at 1,071 m (C14)

const R_LIM = tightestCurve(); // 1,071 m
const S9 = () => span('s09');
const T9 = () => ({
	limit: at('s09', 'But shape has a limit'),
	seven: at('s09', 'can only shift about seven millimeters'),
	meets: at('s09', 'before the flange meets the rail'),
	five: at('s09', 'a radius of five hundred meters'),
	fifteen: at('s09', 'it would need to shift fifteen'),
	twice: at('s09', 'That is about twice what it has'),
	gentle: at('s09', 'curves you would call gentle'),
	km: at('s09', 'about a kilometer in radius'),
	tighter: at('s09', 'Any tighter'),
	touch: at('s09', 'the flange starts to touch the rail'),
	end: S9().dur,
});

// the chart: R from 250 to 3,000 m across, y from 0 to 32 mm up
const CX0 = 200;
const CX1 = 1260;
const CY0 = 900;
const CY1 = 200;
const RX = (R: number) => CX0 + ((R - 250) / (3000 - 250)) * (CX1 - CX0);
const YY = (y: number) => CY0 - (y / 32) * (CY0 - CY1);

/** The radius the sweep marker sits on: 3,000 m down to just past the limit, then tighter. */
const sweepR = (f: number): number => {
	const t = T9();
	const a = tween(f, t.gentle - 20, t.km + 60, 3000, R_LIM, ease.camera);
	return a - tween(f, t.tighter - 10, t.touch + 60, 0, R_LIM - 420, ease.camera);
};

export const CurveLimit: React.FC = () => {
	const f = useCurrentFrame();
	const t = T9();
	const axes = pen(f, t.limit - 20, 50);
	const have = on(f, t.seven, 20);
	// the curve draws down to 500 m when that radius is named, then on to the tightest
	const d1 = pen(f, t.five - 10, 60);
	const d2 = pen(f, t.gentle - 30, 90);
	const p500 = on(f, t.fifteen, 20);
	const bars = Math.min(on(f, t.twice, 20), off(f, t.gentle - 30, 24));
	const zones = on(f, t.km, 30);
	const Rm = sweepR(f);
	const sweepO = on(f, t.gentle - 20, 20);
	const need = shiftNeeded(Rm);
	const ok = need <= WS.clear;
	// the hyperbola
	const pts: string[] = [];
	const Rmin = d2 > 0 ? 500 - 250 * d2 : 3000 - 2500 * d1;
	for (let R = 3000; R >= Math.max(250, Rmin); R -= 10) {
		const y = shiftNeeded(R);
		if (y > 32) break;
		pts.push(`${RX(R).toFixed(1)},${YY(y).toFixed(1)}`);
	}
	const crossX = RX(R_LIM);
	// the curve map: the drawn arc's curvature follows the marker's radius. It arrives on "But shape has a limit", with
	// the sleepers running under the wheelset, so the scene opens on its subject; the rails sit under the treads (the
	// tread contact line is 750 mm from the axle's middle), not inside the flanges (picture gate, 2026-11-04)
	// before the sweep the panel follows the HUD's CURVE R row: a gentle 3,000 m curve, then 500 m when it is named
	const preR = 3000 - tween(f, t.five, t.five + 40, 0, 2500, ease.camera);
	const pre = f < t.gentle - 20;
	const Rmap = pre ? preR : Rm;
	const okMap = shiftNeeded(Rmap) <= WS.clear;
	const mapO = pre ? on(f, t.limit, 24) * off(f, t.gentle - 32, 12) : sweepO;
	const map = () => {
		const cx = 1580;
		const cy = 700;
		const k = 0.08; // px per mm for the wheelset and the track (NOT TO SCALE: the curve is drawn tighter)
		const Rd = Math.max(220, (Rmap / 3000) * 2600);
		const half = 260 / Rd;
		const g = 750 * k; // half the contact-line spacing
		const arc = (r: number) => {
			const out: string[] = [];
			for (let a = -half; a <= half + 1e-6; a += half / 30) out.push(`${(cx + r * Math.sin(a)).toFixed(1)},${(cy + Rd - r * Math.cos(a)).toFixed(1)}`);
			return out.join(' ');
		};
		// sleepers 600 mm apart, running back under the wheelset (rolling forward, to the right)
		const gap = 600 * k;
		const phase = ((f * 2.2) % gap) / Rd;
		const sleepers = [];
		for (let i = -12; i <= 12; i++) {
			const a = i * (gap / Rd) - phase;
			if (Math.abs(a) > half) continue;
			const r0 = Rd - 1300 * k;
			const r1 = Rd + 1300 * k;
			sleepers.push(
				<line key={i} x1={cx + r0 * Math.sin(a)} y1={cy + Rd - r0 * Math.cos(a)} x2={cx + r1 * Math.sin(a)} y2={cy + Rd - r1 * Math.cos(a)} stroke={colors.sub} strokeWidth={7} opacity={0.35 * (1 - Math.abs(a) / half)} />,
			);
		}
		return (
			<g opacity={mapO}>
				{sleepers}
				<polyline points={arc(Rd + g)} fill="none" stroke={colors.line} strokeWidth={3} />
				<polyline points={arc(Rd - g)} fill="none" stroke={colors.line} strokeWidth={3} />
				<g transform={`translate(${cx} ${cy})`}>
					<TopWheelset pose={{x: 0, y: 0, heading: Math.PI / 2, k}} glow={okMap ? 0.8 : 0} heatL={okMap ? 0 : 1} heatR={okMap ? 0 : 1} />
				</g>
			</g>
		);
	};
	return (
		<Stage
			dur={S9().dur}
			light={{x: 0.4, y: 0.55}}
			overlay={
				<Hud
					title="THE LIMIT"
					start={t.seven - 20}
					end={t.end + 20}
					width={480}
					note="MODEL · CONE 1:20"
					rows={[
						{label: 'HAVE', unit: 'mm', keys: [{frame: 0, value: WS.clear}], decimals: 0, tone: 'amber', source: 'C09'},
						{label: 'CURVE R', unit: 'm', at: (fr: number) => (fr < t.gentle - 20 ? 500 : sweepR(fr)), decimals: 0, tone: 'line', source: 'C14', from: t.five},
						{label: 'NEED', unit: 'mm', at: (fr: number) => shiftNeeded(fr < t.gentle - 20 ? 500 : sweepR(fr)), decimals: 1, tone: 'crimson', source: 'C13', from: t.fifteen},
						{label: 'LIMIT R', unit: 'm', keys: [{frame: 0, value: R_LIM}], decimals: 0, tone: 'emerald', source: 'C14', from: t.km},
					]}
				/>
			}
		>
			<AbsoluteFill>
				<Svg>
					{/* zones */}
					<rect x={crossX} y={CY1} width={CX1 - crossX} height={CY0 - CY1} fill={colors.emerald} opacity={0.08 * zones} />
					<rect x={CX0} y={CY1} width={crossX - CX0} height={CY0 - CY1} fill={colors.crimson} opacity={0.08 * zones} />
					{/* axes */}
					<g opacity={axes}>
						<line x1={CX0} y1={CY0} x2={CX1 + 20} y2={CY0} stroke={colors.line} strokeWidth={2.5} />
						<line x1={CX0} y1={CY0} x2={CX0} y2={CY1 - 20} stroke={colors.line} strokeWidth={2.5} />
						{[500, 1000, 1500, 2000, 2500, 3000].map((R) => (
							<line key={R} x1={RX(R)} y1={CY0} x2={RX(R)} y2={CY0 + 12} stroke={colors.line} strokeWidth={2} />
						))}
						{[0, 7, 15, 30].map((y) => (
							<line key={y} x1={CX0 - 12} y1={YY(y)} x2={CX0} y2={YY(y)} stroke={colors.line} strokeWidth={2} />
						))}
					</g>
					{/* what it has: the flange meets the rail at 7 mm */}
					<line x1={CX0} y1={YY(WS.clear)} x2={CX0 + (CX1 - CX0) * have} y2={YY(WS.clear)} stroke={colors.amber} strokeWidth={4} strokeDasharray="18 10" />
					{/* what it needs: y = b0 r0 / (λ R) */}
					<polyline points={pts.join(' ')} fill="none" stroke={colors.line} strokeWidth={4} />
					{/* R 500 m needs 15 mm */}
					<g opacity={p500 * (1 - zones * 0.5)}>
						<line x1={RX(500)} y1={CY0} x2={RX(500)} y2={YY(15)} stroke={colors.crimson} strokeWidth={2.5} strokeDasharray="8 6" />
						<line x1={CX0} y1={YY(15)} x2={RX(500)} y2={YY(15)} stroke={colors.crimson} strokeWidth={2.5} strokeDasharray="8 6" />
						<circle cx={RX(500)} cy={YY(15)} r={11} fill={colors.crimson} style={{filter: `drop-shadow(0 0 8px ${colors.crimson})`}} />
					</g>
					{/* twice: the two bars side by side */}
					<g opacity={bars}>
						<rect x={RX(500) + 60} y={YY(15)} width={44} height={YY(0) - YY(15)} fill={colors.crimson} opacity={0.75} />
						<rect x={RX(500) + 120} y={YY(7)} width={44} height={YY(0) - YY(7)} fill={colors.amber} opacity={0.75} />
					</g>
					{/* the crossing: about a kilometer */}
					<g opacity={zones}>
						<line x1={crossX} y1={CY1} x2={crossX} y2={CY0} stroke={colors.emerald} strokeWidth={3} />
						<circle cx={crossX} cy={YY(WS.clear)} r={12} fill={colors.emerald} style={{filter: `drop-shadow(0 0 10px ${colors.emerald})`}} />
					</g>
					{/* the sweep marker */}
					{sweepO > 0.01 && need <= 32 ? <circle cx={RX(Rm)} cy={YY(need)} r={13} fill={ok ? colors.emerald : colors.crimson} opacity={sweepO} style={{filter: `drop-shadow(0 0 10px ${ok ? colors.emerald : colors.crimson})`}} /> : null}
					{map()}
				</Svg>
				{/* axis words and values */}
				<Label x={(CX0 + CX1) / 2} y={CY0 + 44} size={26} color={colors.sub} align="center" opacity={axes}>
					CURVE RADIUS · m
				</Label>
				{[500, 1000, 1500, 2000, 2500, 3000].map((R) => (
					<Label key={R} x={RX(R)} y={CY0 + 16} size={26} color={colors.sub} align="center" opacity={axes}>
						{R.toLocaleString('en-US')}
					</Label>
				))}
				<Label x={CX0 - 24} y={CY1 - 70} size={26} color={colors.sub} opacity={axes}>
					SHIFT NEEDED · mm
				</Label>
				{[7, 15, 30].map((y) => (
					<Label key={y} x={CX0 - 22} y={YY(y) - 16} size={26} color={colors.sub} align="right" opacity={axes}>
						{y}
					</Label>
				))}
				<Label x={CX1 - 10} y={YY(WS.clear) - 52} size={36} color={colors.amber} weight={600} align="right" opacity={have}>
					HAS 7 mm · THEN THE FLANGE
				</Label>
				<Label x={RX(500) + 26} y={YY(15) - 60} size={36} color={colors.crimson} weight={700} opacity={p500 * (1 - zones)}>
					R 500 m NEEDS 15 mm
				</Label>
				<Label x={RX(500) + 180} y={YY(9)} size={44} color={colors.line} weight={700} opacity={bars}>
					≈ 2×
				</Label>
				<Label x={crossX + 18} y={CY1 + 16} size={36} color={colors.emerald} weight={700} opacity={zones}>
					{Math.round(R_LIM).toLocaleString('en-US')} m · SHAPE ALONE →
				</Label>
				<Label x={CX0 + 30} y={CY0 - 60} size={36} color={colors.crimson} weight={700} opacity={on(f, t.tighter, 20)}>
					FLANGE TOUCHES
				</Label>
				<Label x={1580} y={880} size={26} color={colors.sub} align="center" opacity={mapO}>
					THE CURVE · NOT TO SCALE
				</Label>
			</AbsoluteFill>
		</Stage>
	);
};

export const curveLimitCues = (): SfxCue[] => {
	const t = T9();
	return [
		{frame: t.limit - 20, sfx: 'pen_scratch', gainDb: -14},
		{frame: t.fifteen, sfx: 'quartz_tick', gainDb: -10},
		{frame: t.km, sfx: 'glass_tone', gainDb: -12},
		{frame: t.touch, sfx: 'torque_whine', gainDb: -16},
	];
};

// ================================================================================================================
// s10 · the screech: on a tight curve the flange presses and drags the axle round at an angle (angle of attack, C15);
// the tread is scraped sideways; most researchers attribute the squeal to the tread's lateral stick-slip and the
// wheel ringing (C16, disputed: said as "most researchers").

const S10 = () => span('s10');
const T10 = () => ({
	tight: at('s10', 'And on a really tight curve'),
	presses: at('s10', 'The flange presses hard against the rail'),
	angle: at('s10', 'but at a slight angle'),
	scraped: at('s10', 'the tread is scraped sideways'),
	screech: at('s10', 'And that is the screech you hear'),
	rubbing: at('s10', 'flange rubbing'),
	researchers: at('s10', 'But most researchers say'),
	sticking: at('s10', 'sticking and slipping'),
	bell: at('s10', 'rings like a bell'),
	end: S10().dur,
});

/** The wheel seen from the side, ringing in a three-nodal-diameter mode (ILLUSTRATION; slowed down). */
const RingingWheel: React.FC<{f: number; amp: number; cx: number; cy: number; R: number}> = ({f, amp, cx, cy, R}) => {
	const rings = 12;
	const sectors = 144;
	const n = 3;
	const phase = Math.sin((f / 60) * 2 * Math.PI * 1.6); // slow motion
	const cells: React.ReactNode[] = [];
	const rHub = R * 0.28;
	for (let i = 0; i < rings; i++) {
		const r0 = rHub + ((R - rHub) * i) / rings;
		const r1 = rHub + ((R - rHub) * (i + 1)) / rings;
		const radial = (i + 0.5) / rings;
		for (let j = 0; j < sectors; j++) {
			const a0 = (j / sectors) * 2 * Math.PI;
			const a1 = ((j + 1) / sectors) * 2 * Math.PI;
			const am = (a0 + a1) / 2;
			const v = Math.abs(radial * Math.cos(n * am) * phase) * amp; // 0…1
			const col = v > 0.8 ? feaRamp[4] : v > 0.6 ? feaRamp[3] : v > 0.4 ? feaRamp[2] : v > 0.2 ? feaRamp[1] : feaRamp[0];
			const p = (r: number, a: number) => `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
			cells.push(<polygon key={`${i}-${j}`} points={`${p(r0, a0)} ${p(r1, a0)} ${p(r1, a1)} ${p(r0, a1)}`} fill={col} stroke={col} strokeWidth={0.6} />);
		}
	}
	// the nodal diameters: where the web does not move
	const nodes = Array.from({length: n}, (_, k) => ((k + 0.5) * Math.PI) / n);
	return (
		<g>
			{cells}
			<circle cx={cx} cy={cy} r={R} fill="none" stroke={colors.line} strokeWidth={4} />
			<circle cx={cx} cy={cy} r={R + 18} fill="none" stroke={colors.line} strokeWidth={2.5} />
			<circle cx={cx} cy={cy} r={rHub} fill={colors.bg_lift} stroke={colors.line} strokeWidth={3} />
			<circle cx={cx} cy={cy} r={rHub * 0.45} fill="none" stroke={colors.sub} strokeWidth={2} />
			{nodes.map((a) => (
				<line key={a} x1={cx + Math.cos(a) * rHub} y1={cy + Math.sin(a) * rHub} x2={cx + Math.cos(a) * R} y2={cy + Math.sin(a) * R} stroke={colors.line} strokeWidth={1.5} strokeDasharray="6 6" opacity={0.6 * amp} />
			))}
			{nodes.map((a) => (
				<line key={`m${a}`} x1={cx - Math.cos(a) * rHub} y1={cy - Math.sin(a) * rHub} x2={cx - Math.cos(a) * R} y2={cy - Math.sin(a) * R} stroke={colors.line} strokeWidth={1.5} strokeDasharray="6 6" opacity={0.6 * amp} />
			))}
		</g>
	);
};

// TopWheelset's axle runs along its local +x, (cos h, sin h) on screen; at zero attack it must lie on the radius at phi
// (viewer review v3 found it drawn along the track): the build fails if the convention ever drifts.
const screechHeading = (phi: number, attackDeg: number): number => phi + (attackDeg * Math.PI) / 180;
for (const phi of [-1.5, -68 * (Math.PI / 180), -0.4]) {
	const h = screechHeading(phi, 0);
	const dot = Math.cos(h) * Math.cos(phi) + Math.sin(h) * Math.sin(phi); // axle · radius
	if (Math.abs(Math.abs(dot) - 1) > 1e-9) throw new Error(`Screech: axle not radial (dot ${dot})`);
}

export const Screech: React.FC = () => {
	const f = useCurrentFrame();
	const t = T10();
	// phase A: top view on a tight curve
	const toB = tween(f, t.screech - 20, t.screech + 20, 0, 1, ease.camera);
	const O = {x: 200, y: 1260};
	const R = 1000; // px, drawn radius
	const b = 150;
	const phi = (-68 * Math.PI) / 180; // where the wheelset sits on the arc
	const alpha = tween(f, t.presses + 40, t.angle + 30, 0, 9, ease.camera); // angle of attack, drawn (exaggerated)
	const wc = {x: O.x + R * Math.cos(phi), y: O.y + R * Math.sin(phi)};
	// travel anticlockwise round O (toward the top-left). TopWheelset's heading 0 is up the screen, + clockwise, and its
	// forward is (sin h, −cos h): along the tangent at phi when h = phi, so the axle lies on the radius. The angle of
	// attack turns the front outward (away from O), which is + here (viewer review v3: the axle had been drawn along the
	// track, 90° off).
	const heading = screechHeading(phi, alpha);
	const kW = 0.2; // px per mm for the wheelset: its contact lines (±750 mm) land on the drawn rails (R ± b)
	const toScreen = (lx: number, ly: number) => ({
		x: wc.x + lx * Math.cos(heading) - ly * Math.sin(heading),
		y: wc.y + lx * Math.sin(heading) + ly * Math.cos(heading),
	});
	const arc = (r: number) => {
		const out: string[] = [];
		for (let a = -110; a <= -20; a += 1) out.push(`${(O.x + r * Math.cos((a * Math.PI) / 180)).toFixed(1)},${(O.y + r * Math.sin((a * Math.PI) / 180)).toFixed(1)}`);
		return out.join(' ');
	};
	const press = on(f, t.presses, 20);
	const scrape = on(f, t.scraped, 20);
	// the leading end of the outer wheel's flange (its wheelset frame: +x outward, −y forward), where it meets the rail
	const flangePt = toScreen((750 - 70) * kW, -400 * kW);
	const slipT = (f - t.scraped) / 60;
	// phase B: stick-slip and the ringing wheel
	const ring = Math.max(0.4 * on(f, t.screech, 30), on(f, t.bell - 30, 30));
	const stickO = on(f, t.sticking - 20, 20);
	const sawPts: string[] = [];
	const sx0 = 1060;
	const sw = 700;
	const drawn = tween(f, t.sticking - 20, t.sticking + 140, 0, 1, ease.draw);
	for (let i = 0; i <= 500 * drawn; i++) {
		const u = i / 500;
		const ph = (u * 9) % 1;
		const v = ph < 0.72 ? -0.8 + (ph / 0.72) * 1.6 : 0.8 - ((ph - 0.72) / 0.28) * 1.6; // stick (slow rise) then slip (fast drop)
		sawPts.push(`${(sx0 + u * sw).toFixed(1)},${(780 - v * 90).toFixed(1)}`);
	}
	return (
		<Stage
			dur={S10().dur}
			light={{x: 0.45, y: 0.55}}
			overlay={
				<Hud
					title="TIGHT CURVE"
					start={t.presses - 20}
					end={t.end + 20}
					width={480}
					rows={[{label: 'PLAY LEFT', unit: 'mm', keys: [{frame: 0, value: 0}], decimals: 0, tone: 'crimson', source: 'C15'}]}
					note="FLANGE CONTACT"
				/>
			}
		>
			<AbsoluteFill style={{opacity: 1 - toB}}>
				<Svg>
					<polyline points={arc(R + b)} fill="none" stroke={colors.line} strokeWidth={5} />
					<polyline points={arc(R - b)} fill="none" stroke={colors.line} strokeWidth={5} />
					{/* the radial line: where an axle would point to follow the curve exactly */}
					<line x1={O.x + (R - b - 120) * Math.cos(phi)} y1={O.y + (R - b - 120) * Math.sin(phi)} x2={O.x + (R + b + 120) * Math.cos(phi)} y2={O.y + (R + b + 120) * Math.sin(phi)} stroke={colors.sub} strokeWidth={2.5} strokeDasharray="14 10" opacity={on(f, t.angle - 20, 20)} />
					<TopWheelset pose={{x: wc.x, y: wc.y, heading, k: kW}} heatL={scrape} heatR={scrape} />
					{/* the flange pressed on the outer rail */}
					<circle cx={flangePt.x} cy={flangePt.y} r={18 + 6 * Math.sin(f / 5)} fill={colors.crimson} opacity={0.8 * press} style={{filter: `drop-shadow(0 0 12px ${colors.crimson})`}} />
					{press > 0.01 ? <Arrow x1={flangePt.x + 140 * Math.cos(phi)} y1={flangePt.y + 140 * Math.sin(phi)} x2={flangePt.x + 30 * Math.cos(phi)} y2={flangePt.y + 30 * Math.sin(phi)} color={colors.crimson} width={7} grow={press} /> : null}
					{/* sideways scraping at the treads: short slip streaks along the axle */}
					{scrape > 0.01
						? [-1, 1].map((s) => {
								const r = R + s * b;
								const cx = O.x + r * Math.cos(phi);
								const cy = O.y + r * Math.sin(phi);
								const dx = Math.cos(phi);
								const dy = Math.sin(phi);
								return Array.from({length: 4}, (_, i) => {
									const ph = ((slipT * 2.2 + i / 4) % 1) * 80 - 40;
									return <line key={`${s}${i}`} x1={cx + dx * ph} y1={cy + dy * ph} x2={cx + dx * (ph + 26)} y2={cy + dy * (ph + 26)} stroke={colors.crimson} strokeWidth={4} opacity={scrape * (1 - Math.abs(ph) / 50)} />;
								});
							})
						: null}
				</Svg>
				<Label x={1320} y={380} size={36} color={colors.line} weight={600} opacity={on(f, t.angle, 20)}>
					ANGLE OF ATTACK
				</Label>
				<Label x={1320} y={426} size={26} color={colors.sub} opacity={on(f, t.angle, 20)}>
					TURNED FROM THE RADIUS
				</Label>
				<Label x={1320} y={460} size={26} color={colors.sub} opacity={on(f, t.angle, 20)}>
					ANGLE EXAGGERATED
				</Label>
				<Callout x={flangePt.x} y={flangePt.y} lx={1320} ly={560} text="FLANGE PRESSED" color={colors.crimson} t={lin(f, t.presses + 20, t.presses + 60, 0, 1)} />
				<Callout x={O.x + (R - b) * Math.cos(phi)} y={O.y + (R - b) * Math.sin(phi)} lx={1320} ly={700} text="TREAD SLIDES SIDEWAYS" color={colors.crimson} t={lin(f, t.scraped + 10, t.scraped + 50, 0, 1)} />
				<Tag x={96} y={H - 110} opacity={1}>
					NOT TO SCALE
				</Tag>
			</AbsoluteFill>
			<AbsoluteFill style={{opacity: toB}}>
				<Svg>
					<RingingWheel f={f} amp={ring} cx={520} cy={560} R={330} />
					<g opacity={stickO}>
						<rect x={sx0 - 20} y={640} width={sw + 40} height={280} fill="rgba(7,10,15,0.8)" stroke={colors.sub} strokeWidth={1.5} />
						<line x1={sx0} y1={780} x2={sx0 + sw} y2={780} stroke={colors.grid} strokeWidth={2} />
						<polyline points={sawPts.join(' ')} fill="none" stroke={colors.crimson} strokeWidth={3.5} style={{filter: `drop-shadow(0 0 6px ${colors.crimson})`}} />
					</g>
					{/* "flange rubbing?" struck */}
					<line x1={1040} y1={385} x2={1040 + 560 * pen(f, t.researchers, 20)} y2={385} stroke={colors.crimson} strokeWidth={5} />
				</Svg>
				<Label x={1060} y={360} size={44} color={colors.line} weight={700} opacity={on(f, t.rubbing, 16)}>
					FLANGE RUBBING?
				</Label>
				<Label x={1060} y={440} size={36} color={colors.amber} weight={700} opacity={on(f, t.researchers + 30, 20)}>
					MOST RESEARCHERS: THE TREAD
				</Label>
				<Label x={sx0} y={600} size={26} color={colors.sub} opacity={stickO}>
					SIDEWAYS SLIP · STICK, SLIP, STICK…
				</Label>
				<Label x={sx0} y={930} size={26} color={colors.sub} opacity={stickO}>
					STICK (SLOW) · SLIP (FAST)
				</Label>
				<Label x={520} y={150} size={36} color={colors.line} weight={600} align="center" opacity={on(f, t.bell - 30, 30)}>
					THE WHEEL RINGS
				</Label>
				<Tag x={96} y={H - 110} opacity={toB}>
					ILLUSTRATION · SLOWED DOWN
				</Tag>
			</AbsoluteFill>
		</Stage>
	);
};

export const screechCues = (): SfxCue[] => {
	const t = T10();
	return [
		{frame: t.presses, sfx: 'metal_jam_sub', gainDb: -16, pan: 0.3},
		{frame: t.scraped, sfx: 'flow_sweep', gainDb: -14},
		{frame: t.researchers, sfx: 'relay_click', gainDb: -12},
		{frame: t.bell - 30, sfx: 'glass_tone', gainDb: -10},
	];
};

// ================================================================================================================
// s11 · Nadal's limit (C17): (Y/Q) = (tan β − μ) / (1 + μ tan β); for this drawing's 70° flank and μ 0.35, 1.22.

const BETA = 70;
const MU = 0.35;
const NADAL = (Math.tan((BETA * Math.PI) / 180) - MU) / (1 + MU * Math.tan((BETA * Math.PI) / 180));
const S11 = () => span('s11');
const T11 = () => ({
	hard: at('s11', 'the flange does the hard work'),
	how: at('s11', 'But how hard can you push it'),
	nadal: at('s11', 'an engineer named Nadal'),
	push: at('s11', 'Once the sideways push gets roughly as big'),
	weight: at('s11', 'the weight on that wheel'),
	climb: at('s11', 'can climb up and over the rail'),
	off: at('s11', 'That is one way a train comes off the track'),
	end: S11().dur,
});

export const Nadal: React.FC = () => {
	const f = useCurrentFrame();
	const t = T11();
	const k = 5.2; // px per mm
	const cx = 440;
	const cy = 600;
	const c = contact(WS.clear);
	const yq = tween(f, t.push - 10, t.weight + 60, 0.15, NADAL, ease.camera);
	// the climb (ILLUSTRATION): the wheel lifts and slides outward over the rail head
	// it keeps rising, slowing, to the end of the scene (viewer review v3: a 2.7 s still after "comes off the track")
	const climb = tween(f, t.climb, t.end, 0, 1, ease.camera);
	const lift = 28 * climb; // mm
	const slide = 12 * climb; // mm
	const sx = (v: number) => cx + v * k;
	const sy = (z: number) => cy - z * k;
	const rail = railOutline().map(([v, z]) => `${sx(v).toFixed(1)},${sy(z).toFixed(1)}`).join(' ');
	const wheelPts = wheelOutline().map(([u, r]) => [sx(u + WS.clear + slide), sy(c.axleZ - r + lift)] as [number, number]);
	// a proper section: the rim (70 mm deep) and the web rising out of frame, as on a wheel drawing
	const wz = (r: number) => sy(c.axleZ - r + lift);
	const wu = (u: number) => sx(u + WS.clear + slide);
	const rim = WS.r0 - 70;
	const wheel = [
		...wheelPts,
		[wu(96), wz(rim + 4)],
		[wu(52), wz(rim)],
		[wu(44), wz(rim - 24)],
		[wu(44), -20],
		[wu(10), -20],
		[wu(10), wz(rim - 24)],
		[wu(0), wz(rim)],
		[wheelPts[0][0], wz(rim + 6)],
	]
		.map(([x, y]) => `${(x as number).toFixed(1)},${(y as number).toFixed(1)}`)
		.join(' ');
	// the flange contact on the flank (closest outline points), for the forces
	let best = {d: Infinity, x: 0, y: 0};
	for (const [wx, wy] of wheelPts) {
		if (wx > sx(-20 + WS.clear + slide)) continue;
		for (const r of railOutline()) {
			const rx = sx(r[0]);
			const ry = sy(r[1]);
			const d = Math.hypot(wx - rx, wy - ry);
			if (d < best.d) best = {d, x: (wx + rx) / 2, y: (wy + ry) / 2};
		}
	}
	const forces = on(f, t.how, 20);
	const Qlen = 260;
	const Ylen = Qlen * yq;
	const danger = Math.max(0, Math.min(1, (yq - 0.8) / (NADAL - 0.8)));
	const fx = 'JetBrains Mono, monospace';
	const fo = on(f, t.nadal + 20, 24);
	return (
		<Stage
			dur={S11().dur}
			light={{x: 0.45, y: 0.55}}
			overlay={
				<Hud
					title="NADAL"
					start={t.nadal}
					end={t.end + 20}
					width={540}
					note="FLANGE 70° · μ 0.35"
					rows={[
						{label: 'Y / Q', unit: '', at: (fr: number) => tween(fr, t.push - 10, t.weight + 60, 0.15, NADAL, ease.camera), decimals: 2, tone: 'crimson', source: 'C17', from: t.push - 10},
						{label: 'LIMIT', unit: '', keys: [{frame: 0, value: NADAL}], decimals: 2, tone: 'amber', source: 'C17', from: t.push},
					]}
				/>
			}
		>
			<AbsoluteFill>
				<Svg>
					<defs>
						<pattern id="nd-hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
							<line x1="0" y1="0" x2="0" y2="14" stroke={colors.sub} strokeOpacity={0.25} strokeWidth={2} />
						</pattern>
						<linearGradient id="nd-steel" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor="#1B2533" />
							<stop offset="0.9" stopColor="#2E3F55" />
							<stop offset="1" stopColor="#5B6E85" />
						</linearGradient>
					</defs>
					<polygon points={rail} fill={colors.bg_lift} />
					<polygon points={rail} fill="url(#nd-hatch)" stroke={colors.line} strokeWidth={3} />
					<polygon points={wheel} fill="url(#nd-steel)" />
					<polygon points={wheel} fill="url(#nd-hatch)" stroke={colors.line} strokeWidth={3} />
					{/* the contact on the flank: amber, crimson as it nears the limit */}
					<circle cx={best.x} cy={best.y} r={14 + 10 * danger} fill={danger > 0.5 ? colors.crimson : colors.amber} style={{filter: `drop-shadow(0 0 12px ${danger > 0.5 ? colors.crimson : colors.amber})`}} opacity={on(f, t.hard, 20)} />
					{/* Q: the weight on the wheel (cyan, compression), Y: the sideways push (crimson) */}
					{forces > 0.01 ? (
						<>
							<Arrow x1={best.x + 40} y1={best.y - 40 - Qlen} x2={best.x + 40} y2={best.y - 40} color={colors.cyan} width={8} grow={forces} />
							<Arrow x1={best.x + 60 + Ylen} y1={best.y - 10} x2={best.x + 60} y2={best.y - 10} color={colors.crimson} width={8} grow={forces} />
						</>
					) : null}
					{/* the formula */}
					<g opacity={fo}>
						{/* two lines: on one, the formula ran past the frame's central 90 % (viewer review v3) */}
						<text x={1060} y={486} fontFamily={fx} fontSize={40} fontWeight={700} fill={colors.line}>
							Y / Q ≤
						</text>
						<text x={1060} y={538} fontFamily={fx} fontSize={40} fontWeight={700} fill={colors.line}>
							(tan β − μ) / (1 + μ tan β)
						</text>
						<text x={1060} y={592} fontFamily={fx} fontSize={30} fill={colors.sub} opacity={on(f, t.push, 20)}>
							β 70° · μ 0.35 → {NADAL.toFixed(2)}
						</text>
					</g>
					{/* the meter: Y/Q against the limit */}
					<g opacity={on(f, t.push - 20, 20)}>
						<rect x={1060} y={680} width={720} height={36} fill="none" stroke={colors.sub} strokeWidth={2} />
						<rect x={1060} y={680} width={720 * Math.min(1, yq / 1.5)} height={36} fill={danger > 0.5 ? colors.crimson : colors.amber} opacity={0.85} />
						<line x1={1060 + (720 * NADAL) / 1.5} y1={666} x2={1060 + (720 * NADAL) / 1.5} y2={730} stroke={colors.line} strokeWidth={4} />
						<line x1={1060 + 720 / 1.5} y1={672} x2={1060 + 720 / 1.5} y2={724} stroke={colors.sub} strokeWidth={2} strokeDasharray="4 4" />
					</g>
				</Svg>
				<Label x={best.x + 70} y={best.y - 40 - Qlen - 10} size={36} color={colors.cyan} weight={700} opacity={forces}>
					Q · WEIGHT ON THE WHEEL
				</Label>
				<Label x={best.x + 70} y={best.y + 30} size={36} color={colors.crimson} weight={700} opacity={forces}>
					Y · SIDEWAYS PUSH
				</Label>
				<Label x={1060} y={400} size={36} color={colors.sub} opacity={fo}>
					NADAL · MORE THAN A CENTURY AGO
				</Label>
				<Label x={1060 + (720 * NADAL) / 1.5} y={736} size={26} color={colors.line} align="center" opacity={on(f, t.push, 20)}>
					LIMIT {NADAL.toFixed(2)}
				</Label>
				<Label x={1060 + 720 / 1.5} y={630} size={26} color={colors.sub} align="center" opacity={on(f, t.push, 20)}>
					Y = Q
				</Label>
				<Label x={1060} y={850} size={44} color={colors.crimson} weight={700} opacity={on(f, t.climb + 20, 20)}>
					THE FLANGE CLIMBS
				</Label>
				<Tag x={96} y={H - 110} opacity={on(f, t.hard, 20)}>
					SECTION · GENERIC PROFILE{climb > 0 ? ' · CLIMB: ILLUSTRATION' : ''}
				</Tag>
			</AbsoluteFill>
		</Stage>
	);
};

export const nadalCues = (): SfxCue[] => {
	const t = T11();
	return [
		{frame: t.how, sfx: 'glass_tone', gainDb: -12, pan: 0.2},
		{frame: t.nadal + 20, sfx: 'pen_scratch', gainDb: -14},
		{frame: t.push, sfx: 'torque_whine', gainDb: -14},
		{frame: t.climb, sfx: 'metal_snap_sub', gainDb: -10},
	];
};

// checks: Nadal's limit for 70° and μ 0.35 is C17's 1.22; the tightest clean curve is 1,071 m (C14)
if (Math.abs(NADAL - 1.22) > 0.005) throw new Error(`Nadal: ${NADAL}`);
if (Math.abs(R_LIM - 1071.43) > 0.01) throw new Error(`limit: ${R_LIM}`);
