import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {colors} from '../../../lib/remotion/brand';
import {Hud} from '../../../lib/remotion/Hud';
import {ease, physical, tween} from '../../../lib/remotion/motion';
import {SfxCue} from '../../../lib/remotion/sfx';
import {Arrow, Callout, Dim, H, Label, lin, off, on, pen, Stage, Svg, Tag, TopWheelset, W} from './kit';
import {apexDistance, deltaR, klingelWavelength, rollingRadius, shiftNeeded, WS} from './model';
import {SectionWheel} from './Sections';
import {at, endOf, span} from './scenes';

// s06 the drift and the apex cone (signature 4) and s08 self-centering (scenes/s06_drift.md).
// Physics: equal radii roll equal distances, so the wheelset runs straight while the rails curve away; relative to
// the track it drifts outward (C31). That puts the outer contact on the fatter part of its cone and the inner on the
// thinner (C07): r = r0 ± λy. It drifts until 2λy matches the curve, y = b0 r0 / (λR) (C13); then the two rolling
// circles fit one cone whose apex is the curve's centre (C27), and the wheelset rolls round the curve as a cone rolls
// round its apex.

const R_EX = 1500; // m, the example curve (a gentle one: y needed 5.0 mm < 7 mm play)
const Y_NEED = shiftNeeded(R_EX); // 5.0 mm

const S6 = () => span('s06');
const T6 = () => ({
	enter: at('s06', 'Now watch the axle enter a curve'),
	same: at('s06', 'With both wheels the same size'),
	straight: at('s06', 'it rolls straight on'),
	bend: at('s06', 'But the rails bend away'),
	drifts: at('s06', 'so it drifts a few millimeters'),
	outside: at('s06', 'toward the outside of the bend'),
	trick: at('s06', 'And now you have the trick'),
	outerFat: at('s06', 'That moves the outer wheel onto its fatter part'),
	innerThin: at('s06', 'and the inner wheel onto its thinner part'),
	bigger: at('s06', 'So the outer wheel rolls on a bigger circle'),
	smaller: at('s06', 'and the inner wheel on a smaller one'),
	spin: at('s06', 'Same spin'),
	distance: at('s06', 'different distance'),
	keeps: at('s06', 'It keeps drifting until'),
	bigEnough: at('s06', 'just big enough to cover the extra distance'),
	neither: at('s06', 'Now neither wheel really slips'),
	follows: at('s06', 'the axle follows the curve by itself'),
	followsEnd: endOf('s06', 'the axle follows the curve by itself'),
	end: S6().dur,
});

/** The drift, mm: a few millimeters as the rails bend away, then on until the cone matches the curve. */
const driftAt = (f: number, fps: number): number => {
	const t = T6();
	const first = 3.2 * Math.min(1, physical(f, fps, t.drifts + 10, {damping: 30, stiffness: 70}));
	const rest = (Y_NEED - 3.2) * Math.min(1, physical(f, fps, t.keeps + 10, {damping: 30, stiffness: 60}));
	return first + rest;
};

// ---- the top view (left), world in metres; the curve drawn tight (6 m) so it bends inside the frame ----
const RD = 6; // m, drawn radius (NOT TO SCALE)
const pathPoint = (s: number): {x: number; y: number; h: number} => {
	if (s < 0) return {x: 0, y: s, h: 0};
	const th = s / RD;
	return {x: -RD + RD * Math.cos(th), y: RD * Math.sin(th), h: -th};
};
/** Distance along the track at frame f: 0.68 m/s on the straight, easing to 0.32 m/s on the curve. */
const sAtF = (f: number): number => {
	const t = T6();
	let s = -5;
	for (let i = 0; i < f; i++) s += (0.68 - tween(i, t.bend - 20, t.bend + 120, 0, 0.36, ease.camera)) / 60;
	return s;
};

const TopView: React.FC<{f: number}> = ({f}) => {
	const t = T6();
	const s = sAtF(f);
	const p = pathPoint(s);
	const k = 95; // px per m
	// the camera follows the wheelset, which sits at (520, 640) in the panel
	const cx = 520;
	const cy = 660;
	const X = (x: number) => cx + (x - p.x) * k;
	const Y = (y: number) => cy - (y - p.y) * k;
	const draw = pen(f, 0, 50);
	const rail = (off: number): string => {
		const out: string[] = [];
		for (let q = -12; q <= RD * 2.4; q += 0.1) {
			const a = pathPoint(q);
			// offset to the right of the heading: (cos h, −sin h) with h measured from +y, clockwise positive
			const nx = Math.cos(a.h);
			const ny = -Math.sin(a.h);
			out.push(`${X(a.x + nx * off).toFixed(1)},${Y(a.y + ny * off).toFixed(1)}`);
		}
		return out.join(' ');
	};
	const sleepers: React.ReactNode[] = [];
	for (let q = -12; q <= RD * 2.4; q += 0.6) {
		const a = pathPoint(q);
		const nx = Math.cos(a.h);
		const ny = -Math.sin(a.h);
		sleepers.push(<line key={q} x1={X(a.x - nx * 1.3)} y1={Y(a.y - ny * 1.3)} x2={X(a.x + nx * 1.3)} y2={Y(a.y + ny * 1.3)} stroke={colors.muted} strokeWidth={Math.max(2, 0.25 * k * 0.5)} opacity={0.35} />);
	}
	// the ghost: what equal wheels would do, rolling straight on from the curve's start
	const ghostO = Math.min(on(f, t.straight, 24), off(f, t.trick + 40, 30));
	const ghostY = Math.max(0, s);
	const straightLine = pen(f, t.straight, 50);
	const outsideArrow = Math.min(on(f, t.outside - 6, 16), off(f, t.innerThin, 24));
	const heading = p.h; // TopWheelset: + clockwise; the curve turns left, so the heading goes negative
	return (
		<g>
			<defs>
				<clipPath id="top-clip">
					<rect x={0} y={0} width={1040} height={H} />
				</clipPath>
			</defs>
			<g clipPath="url(#top-clip)">
				<g opacity={draw}>
					{sleepers}
					<polyline points={rail(-WS.b0 / 1000)} fill="none" stroke={colors.line} strokeWidth={4} />
					<polyline points={rail(WS.b0 / 1000)} fill="none" stroke={colors.line} strokeWidth={4} />
				</g>
				{/* rolls straight on: the dashed straight from the curve's start, and the ghost wheelset on it */}
				<line x1={X(0)} y1={Y(0)} x2={X(0)} y2={Y(0) - 900 * straightLine} stroke={colors.sub} strokeWidth={3} strokeDasharray="18 12" opacity={ghostO} />
				{ghostO > 0.01 && s > -0.5 ? <TopWheelset pose={{x: X(0), y: Y(ghostY), heading: 0, k: k / 1000}} ghost opacity={ghostO} /> : null}
				<TopWheelset pose={{x: X(p.x), y: Y(p.y), heading, k: k / 1000}} glow={on(f, t.outerFat, 30) * (1 - on(f, t.neither, 30))} />
				{outsideArrow > 0 ? (
					<Arrow x1={X(p.x) + Math.cos(p.h) * 140} y1={Y(p.y) + Math.sin(p.h) * 140} x2={X(p.x) + Math.cos(p.h) * 330} y2={Y(p.y) + Math.sin(p.h) * 330} color={colors.amber} width={6} grow={outsideArrow} />
				) : null}
			</g>
		</g>
	);
};

// ---- the rolling circles: same spin, different distance (exaggerated, NOT TO SCALE) ----
const Circles: React.FC<{f: number; o: number}> = ({f, o}) => {
	const t = T6();
	if (o <= 0.01) return null;
	const ro = 95;
	const ri = 78;
	const turn = tween(f, t.spin, t.spin + 150, 0, 1, ease.camera);
	const x0 = 1180;
	const lanes = [
		{r: ro, y: 700, name: 'OUTER WHEEL', cue: t.bigger},
		{r: ri, y: 960, name: 'INNER WHEEL', cue: t.smaller},
	];
	return (
		<>
			<Svg opacity={o}>
				{lanes.map((l, i) => {
					const cx = x0 + 2 * Math.PI * l.r * turn;
					const a = 2 * Math.PI * turn;
					const show = on(f, l.cue, 24);
					return (
						<g key={i} opacity={show}>
							<line x1={1080} y1={l.y} x2={1890} y2={l.y} stroke={colors.sub} strokeWidth={2} />
							<line x1={x0} y1={l.y} x2={cx} y2={l.y} stroke={colors.amber} strokeWidth={5} style={{filter: `drop-shadow(0 0 8px ${colors.amber})`}} />
							<circle cx={cx} cy={l.y - l.r} r={l.r} fill="#1B2533" stroke={colors.line} strokeWidth={3} />
							<circle cx={cx} cy={l.y - l.r} r={l.r * 0.3} fill="none" stroke={colors.sub} strokeWidth={2} />
							{[0, 1, 2, 3].map((q) => (
								<line key={q} x1={cx + Math.cos(a + (q * Math.PI) / 2) * l.r * 0.3} y1={l.y - l.r + Math.sin(a + (q * Math.PI) / 2) * l.r * 0.3} x2={cx + Math.cos(a + (q * Math.PI) / 2) * l.r * 0.92} y2={l.y - l.r + Math.sin(a + (q * Math.PI) / 2) * l.r * 0.92} stroke={colors.sub} strokeWidth={2} />
							))}
							{/* the mark that shows one turn: it starts at the ground and comes back to it */}
							<circle cx={cx + Math.sin(a) * -l.r} cy={l.y - l.r + Math.cos(a) * l.r} r={9} fill={colors.amber} />
							<line x1={cx} y1={l.y - l.r} x2={cx} y2={l.y} stroke={colors.amber} strokeWidth={3} opacity={0.9} />
						</g>
					);
				})}
				{/* the difference: the outer wheel's extra distance */}
				{turn > 0.98 ? <Dim x1={x0 + 2 * Math.PI * ri} y1={730} x2={x0 + 2 * Math.PI * ro} y2={730} color={colors.amber} draw={on(f, t.distance, 20)} tick={10} /> : null}
			</Svg>
			{lanes.map((l, i) => (
				<Label key={i} x={1090} y={l.y - 2 * l.r - 52} size={26} color={colors.sub} opacity={on(f, l.cue, 24)}>
					{l.name}
				</Label>
			))}
			<Label x={1090} y={1000} size={36} color={colors.amber} weight={600} opacity={on(f, t.spin + 20, 20) * o}>
				ONE TURN EACH
			</Label>
		</>
	);
};

const SectionsColumn: React.FC<{f: number; y: number; o: number}> = ({f, y, o}) => {
	const t = T6();
	if (o <= 0.01) return null;
	const px = 2.0;
	const railTop = 900;
	const ci = 1230;
	const co = 1690;
	const glow = tween(f, t.bigEnough, t.bigEnough + 40, 0, 1, ease.draw);
	const thin = on(f, t.innerThin + 20, 24);
	const fat = on(f, t.outerFat + 30, 24);
	return (
		<>
			<Svg opacity={o}>
				<defs>
					<clipPath id="sec-clip">
						<rect x={1060} y={680} width={850} height={H - 680} />
					</clipPath>
				</defs>
				<g clipPath="url(#sec-clip)">
					<SectionWheel side={-1} cx={ci} railTop={railTop} px={px} y={y} id="di" glow={Math.max(glow, thin * 0.6)} />
					<SectionWheel side={1} cx={co} railTop={railTop} px={px} y={y} id="do" glow={Math.max(glow, fat * 0.6)} />
				</g>
			</Svg>
			<Label x={1080} y={520} size={26} color={colors.sub} opacity={o}>
				SECTIONS · TRUE SCALE
			</Label>
			<Label x={1080} y={566} size={36} color={colors.line} opacity={o} weight={600}>
				INNER<span style={{color: colors.amber, opacity: thin}}> · THINNER PART</span>
			</Label>
			<Label x={1830} y={618} size={36} color={colors.line} align="right" opacity={o} weight={600}>
				<span style={{color: colors.amber, opacity: fat}}>FATTER PART · </span>OUTER
			</Label>
		</>
	);
};

// ---- the apex: the two rolling circles are one cone, its tip on the curve's centre ----
const Apex: React.FC<{f: number; o: number}> = ({f, o}) => {
	const t = T6();
	if (o <= 0.01) return null;
	const O = {x: 330, y: 960};
	const R = 1000; // px
	const b = 150; // px, half the contact spacing as drawn
	const k = b / 750; // px per mm for the wheelset (gauge true to its own size)
	// cone exact by construction: diameters in proportion to the radii they roll on
	const D = (r: number) => 1000 * k * (r / R);
	const roll = tween(f, t.follows - 20, t.end, 0, 1, ease.camera);
	const phi = (-24 - 34 * roll) * (Math.PI / 180);
	const P = (r: number, a: number) => ({x: O.x + r * Math.cos(a), y: O.y + r * Math.sin(a)});
	const cOut = P(R + b, phi);
	const cIn = P(R - b, phi);
	const tx = -Math.sin(phi);
	const ty = Math.cos(phi); // along the travel
	const edge = (c: {x: number; y: number}, d: number, sgn: number) => ({x: c.x + (tx * d * sgn) / 2, y: c.y + (ty * d * sgn) / 2});
	const reach = pen(f, t.neither + 10, 70);
	const lines = [1, -1].map((sgn) => {
		const a = edge(cOut, D(R + b), sgn);
		return {a, b: {x: a.x + (O.x - a.x) * reach, y: a.y + (O.y - a.y) * reach}};
	});
	const meet = on(f, t.neither + 80, 20);
	const arc = (r: number) => {
		const pts: string[] = [];
		for (let a = -95; a <= 5; a += 1) {
			const q = P(r, (a * Math.PI) / 180);
			pts.push(`${q.x.toFixed(1)},${q.y.toFixed(1)}`);
		}
		return pts.join(' ');
	};
	const wheel = (c: {x: number; y: number}, d: number, key: string) => {
		const w = 140 * k * 1.4;
		return <rect key={key} x={-w / 2} y={-d / 2} width={w} height={d} rx={4} fill="#3E4B5C" stroke={colors.line} strokeWidth={2.5} transform={`translate(${c.x} ${c.y}) rotate(${(phi * 180) / Math.PI})`} />;
	};
	return (
		<>
			<Svg opacity={o}>
				{/* the curve: both rails as arcs round one centre */}
				<polyline points={arc(R + b)} fill="none" stroke={colors.line} strokeWidth={4} />
				<polyline points={arc(R - b)} fill="none" stroke={colors.line} strokeWidth={4} />
				{/* the ghost cone */}
				<polygon points={`${lines[0].a.x},${lines[0].a.y} ${lines[0].b.x},${lines[0].b.y} ${lines[1].b.x},${lines[1].b.y} ${lines[1].a.x},${lines[1].a.y}`} fill={colors.amber} opacity={0.12 * reach} />
				{lines.map((l, i) => (
					<line key={i} x1={l.a.x} y1={l.a.y} x2={l.b.x} y2={l.b.y} stroke={colors.amber} strokeWidth={3} strokeDasharray="14 8" style={{filter: `drop-shadow(0 0 6px ${colors.amber})`}} />
				))}
				{/* the axle, pointing at the centre */}
				<line x1={P(R + b + 40, phi).x} y1={P(R + b + 40, phi).y} x2={P(R - b - 40, phi).x} y2={P(R - b - 40, phi).y} stroke={colors.line} strokeWidth={9} strokeLinecap="round" />
				{wheel(cOut, D(R + b), 'o')}
				{wheel(cIn, D(R - b), 'i')}
				{/* the curve's centre */}
				<g opacity={on(f, t.neither - 10, 20)}>
					<line x1={O.x - 26} y1={O.y} x2={O.x + 26} y2={O.y} stroke={colors.line} strokeWidth={3} />
					<line x1={O.x} y1={O.y - 26} x2={O.x} y2={O.y + 26} stroke={colors.line} strokeWidth={3} />
					<circle cx={O.x} cy={O.y} r={40 + 30 * meet} fill="none" stroke={colors.amber} strokeWidth={3} opacity={meet} style={{filter: `drop-shadow(0 0 10px ${colors.amber})`}} />
				</g>
			</Svg>
			<Label x={O.x + 70} y={O.y - 30} size={36} color={colors.amber} weight={700} opacity={meet}>
				CONE TIP = CURVE CENTRE
			</Label>
			<Label x={O.x + 70} y={O.y + 18} size={26} color={colors.sub} opacity={on(f, t.neither - 10, 20)}>
				CENTRE OF THE CURVE
			</Label>
			<Tag x={1824} y={H - 110} align="right" opacity={o}>
				NOT TO SCALE · CURVE AND CONE EXAGGERATED
			</Tag>
		</>
	);
};

export const Drift: React.FC = () => {
	const f = useCurrentFrame();
	const fps = 60;
	const t = T6();
	const y = driftAt(f, fps);
	const toApex = tween(f, t.neither - 30, t.neither + 10, 0, 1, ease.camera);
	const circlesO = Math.min(on(f, t.bigger - 10, 24), off(f, t.keeps - 20, 24));
	const sectionsO = Math.min(on(f, t.same - 30, 30), Math.max(off(f, t.bigger - 30, 24), on(f, t.keeps - 10, 24)));
	return (
		<Stage
			dur={S6().dur}
			light={{x: 0.45, y: 0.55}}
			overlay={
				<Hud
					title="ON A CURVE"
					start={t.same - 20}
					end={t.neither}
					width={520}
					note="TEXTBOOK MODEL"
					rows={[
						{label: 'CURVE R', unit: 'm', keys: [{frame: 0, value: R_EX}], decimals: 0, tone: 'line', source: 'C13'},
						{label: 'SHIFT y', unit: 'mm', at: (fr: number) => driftAt(fr, fps), decimals: 1, tone: 'emerald', source: 'C13', from: t.drifts},
						{label: 'OUTER r', unit: 'mm', at: (fr: number) => rollingRadius(driftAt(fr, fps)), decimals: 2, tone: 'amber', source: 'C10', from: t.outerFat},
						{label: 'INNER r', unit: 'mm', at: (fr: number) => rollingRadius(-driftAt(fr, fps)), decimals: 2, tone: 'amber', source: 'C10', from: t.innerThin},
						{label: 'NEEDED y', unit: 'mm', keys: [{frame: 0, value: Y_NEED}], decimals: 1, tone: 'line', source: 'C13', from: t.keeps},
					]}
				/>
			}
		>
			<AbsoluteFill style={{opacity: 1 - toApex}}>
				<Svg>
					<TopView f={f} />
					<line x1={1050} y1={80} x2={1050} y2={H - 80} stroke={colors.grid} strokeWidth={2} />
				</Svg>
				<SectionsColumn f={f} y={y} o={sectionsO} />
				<Circles f={f} o={circlesO} />
				<Tag x={96} y={H - 110} opacity={on(f, t.bend, 24)}>
					NOT TO SCALE · CURVE DRAWN TIGHTER
				</Tag>
				<Tag x={1824} y={H - 110} align="right" opacity={circlesO}>
					NOT TO SCALE
				</Tag>
			</AbsoluteFill>
			<AbsoluteFill style={{opacity: toApex}}>
				<Apex f={f} o={toApex} />
			</AbsoluteFill>
		</Stage>
	);
};

export const driftCues = (): SfxCue[] => {
	const t = T6();
	return [
		{frame: 0, sfx: 'pen_scratch', gainDb: -14},
		{frame: t.straight, sfx: 'whoosh', gainDb: -18, pan: -0.3},
		{frame: t.drifts, sfx: 'glass_tone', gainDb: -12, pan: 0.4},
		{frame: t.outerFat, sfx: 'quartz_tick', gainDb: -12, pan: 0.5},
		{frame: t.innerThin, sfx: 'quartz_tick', gainDb: -12, pan: 0.2},
		{frame: t.spin, sfx: 'relay_click', gainDb: -12},
		{frame: t.neither + 80, sfx: 'glass_tone', gainDb: -10},
	];
};

// numeric checks: the example curve needs 5 mm (< 7 mm play), the cone's apex sits on the curve's centre there
if (Math.abs(Y_NEED - 5) > 1e-9) throw new Error(`drift: y needed ${Y_NEED}`);
if (Math.abs(apexDistance(Y_NEED) - R_EX) > 1e-6) throw new Error('drift: apex off the curve centre');
if (Math.abs(deltaR(Y_NEED) - 0.5) > 1e-9) throw new Error('drift: Δr at 1,500 m');

// ---------------------------------------------------------------------------------------------------------------
// s08 · self-centering: on straight track, a nudge; the wheel on that side rolls bigger; the axle steers back
// toward the middle (C12). The scene ends as it reaches the middle: what happens next is s12's twist.

const S8 = () => span('s08');
const T8 = () => ({
	straightTrack: at('s08', 'It even works on straight track'),
	nudge: at('s08', 'Imagine you nudge the axle'),
	side: at('s08', 'The wheel on that side gets bigger'),
	back: at('s08', 'so the axle steers itself back'),
	middle: at('s08', 'toward the middle'),
	end: S8().dur,
});
const L8 = klingelWavelength();

export const SelfCentre: React.FC = () => {
	const f = useCurrentFrame();
	const fps = 60;
	const t = T8();
	const v = 0.62; // m/s
	const s = (f * v) / 60;
	const push = Math.min(1, physical(f, fps, t.nudge + 40, {damping: 26}));
	const sPush = ((t.nudge + 80) * v) / 60;
	// after the nudge: the quarter wave back toward the centre (Klingel's wave, C18)
	const yAt = (q: number, pushK: number): number => (q < sPush ? 3 * pushK : 3 * Math.cos((2 * Math.PI * (q - sPush)) / L8));
	const y = yAt(s, push);
	const dy = (yAt(s + 0.05, push) - yAt(s - 0.05, push)) / 0.1;
	const yaw = Math.atan(95 * (dy / 1000));
	const k = 0.3; // px per mm
	const CY = 640;
	const xw = 860;
	const X = (q: number) => xw + (q - s) * 300;
	const sleepers: number[] = [];
	for (let i = Math.ceil((s - 3.2) / 0.6); i <= Math.floor((s + 3.8) / 0.6); i++) sleepers.push(i * 0.6);
	const grow = on(f, t.side, 24);
	const back = on(f, t.back, 24);
	const draw = pen(f, 0, 40);
	const gk = 22;
	return (
		<Stage
			dur={S8().dur}
			light={{x: 0.45, y: 0.55}}
			overlay={
				<Hud
					title="WHEELSET"
					start={20}
					end={t.end + 20}
					width={440}
					note="TEXTBOOK MODEL"
					rows={[
						{label: 'r0', unit: 'mm', keys: [{frame: 0, value: WS.r0}], decimals: 0, tone: 'line', source: 'C10'},
						{label: 'PLAY', unit: '± mm', keys: [{frame: 0, value: WS.clear}], decimals: 0, tone: 'amber', source: 'C09'},
					]}
				/>
			}
		>
			<AbsoluteFill>
				<Svg opacity={draw}>
					{sleepers.map((q) => (
						<rect key={q} x={X(q) - 37} y={CY - 1300 * k} width={75} height={2600 * k} fill={colors.muted} opacity={0.16} />
					))}
					{[-1, 1].map((side) => (
						<g key={side}>
							<rect x={-10} y={CY + side * 750 * k - 32 * k} width={W + 20} height={64 * k} fill={colors.bg_lift} stroke={colors.line} strokeWidth={2} />
						</g>
					))}
					{/* the nudge */}
					<Arrow x1={xw + 60} y1={CY + 560 * k + 40} x2={xw + 60} y2={CY + 470 * k - 50} color={colors.emerald} width={7} grow={Math.min(on(f, t.nudge + 20, 16), off(f, t.nudge + 80, 20))} />
					<TopWheelset pose={{x: xw, y: CY - y * k, heading: Math.PI / 2 - yaw, k}} />
					{/* the bigger wheel: its band glows amber */}
					<g transform={`translate(${xw} ${CY - y * k}) rotate(${((Math.PI / 2 - yaw) * 180) / Math.PI})`}>
						<rect x={-770 * k - 64 * k} y={-490 * k} width={128 * k} height={980 * k} rx={4} fill={colors.amber} opacity={0.5 * grow} style={{filter: `drop-shadow(0 0 12px ${colors.amber})`}} />
					</g>
					{/* steering back: an emerald arc about the axle centre, turning away from the bigger wheel */}
					{back > 0.01 ? (
						<g opacity={back} style={{filter: `drop-shadow(0 0 8px ${colors.emerald})`}}>
							<path d={`M ${xw + 260} ${CY - 260} A 370 370 0 0 1 ${xw + 330} ${CY + 40}`} fill="none" stroke={colors.emerald} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={`${pen(f, t.back, 30)} 1`} />
						</g>
					) : null}
					<circle cx={xw} cy={CY - y * k} r={8} fill={colors.emerald} />
					{/* the true millimetres */}
					<g opacity={on(f, t.nudge, 24)}>
						<line x1={1500} y1={CY - 8 * gk} x2={1500} y2={CY + 8 * gk} stroke={colors.sub} strokeWidth={2} />
						{Array.from({length: 15}, (_, i) => i - 7).map((m) => (
							<line key={m} x1={1500 - (m % 7 === 0 ? 22 : 10)} y1={CY - m * gk} x2={1500} y2={CY - m * gk} stroke={m % 7 === 0 && m !== 0 ? colors.amber : colors.sub} strokeWidth={m % 7 === 0 ? 3 : 1.5} />
						))}
						<polygon points={`${1504},${CY - y * gk} ${1530},${CY - y * gk - 13} ${1530},${CY - y * gk + 13}`} fill={colors.emerald} />
					</g>
				</Svg>
				<Label x={1544} y={CY - 7 * gk - 18} size={26} color={colors.amber} opacity={on(f, t.nudge, 24)}>
					+7 mm FLANGE
				</Label>
				<Label x={1544} y={CY + 7 * gk - 18} size={26} color={colors.amber} opacity={on(f, t.nudge, 24)}>
					−7 mm FLANGE
				</Label>
				<Label x={1544} y={CY - 18} size={26} color={colors.sub} opacity={on(f, t.nudge, 24)}>
					CENTRE
				</Label>
				<Callout x={xw - 230} y={CY - 750 * k - y * k} lx={xw - 420} ly={CY - 330} text="BIGGER" color={colors.amber} t={lin(f, t.side + 20, t.side + 60, 0, 1)} />
				<Tag x={96} y={H - 110} opacity={on(f, t.back, 24)}>
					YAW EXAGGERATED
				</Tag>
			</AbsoluteFill>
		</Stage>
	);
};

export const selfCentreCues = (): SfxCue[] => {
	const t = T8();
	return [
		{frame: t.nudge + 20, sfx: 'glass_tone', gainDb: -12, pan: 0.2},
		{frame: t.side, sfx: 'quartz_tick', gainDb: -12, pan: -0.3},
		{frame: t.back, sfx: 'relay_click', gainDb: -12},
	];
};
