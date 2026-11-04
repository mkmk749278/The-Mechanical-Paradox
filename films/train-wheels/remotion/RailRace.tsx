import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {colors} from '../../../lib/remotion/brand';
import {Hud} from '../../../lib/remotion/Hud';
import {ease, tween} from '../../../lib/remotion/motion';
import {SfxCue} from '../../../lib/remotion/sfx';
import {Arrow, H, Label, off, on, pen, Stage, Svg, Tag, TopWheelset} from './kit';
import {pathDifference, WS} from './model';
import {at, span} from './scenes';

// s02 the rail race (signature 2), the locomotive and the differential (scenes/s02_rail_race.md).
// Geometry: over a turn θ the outer contact path is longer than the inner by 2·b0·θ whatever the radius (C04):
// 2.36 m for a right angle. A car fixes it with a differential (C05); a wheelset has one solid axle (C02). Yet on a
// gentle curve neither wheel really slips (C03, C07): the outer wheel rolls on a bigger circle.

const DL = pathDifference(90) / 1000; // 2.356 m
const S = () => span('s02');
const T = () => ({
	bend: at('s02', 'Take a bend'),
	rightAngle: at('s02', 'through a right angle'),
	expect: at('s02', 'Here is the part you might not expect'),
	wide: at('s02', 'Wide or tight'),
	noDiff: at('s02', 'it makes no difference'),
	longer: at('s02', 'two point four meters longer'),
	either: at('s02', 'either way'),
	loco: at('s02', 'And a one-hundred-ton locomotive'),
	ton: at('s02', 'one-hundred-ton'),
	nothing: at('s02', 'has nothing to fix that'),
	steering: at('s02', 'No steering', 'one-hundred-ton'),
	diff: at('s02', 'no differential gears'),
	box: at('s02', 'the box that lets'),
	faster: at('s02', 'outer wheel spin faster'),
	yet: at('s02', 'Yet on a gentle curve'),
	watch: at('s02', 'if you could watch the wheels'),
	neither: at('s02', 'neither one really slips'),
	end: S().dur,
});

// ---- the quarter turn: centre O, the track turns from heading up to heading left (a left-hand bend) ----
const O = {x: 300, y: 880};
const B = 56; // px, half the gauge as drawn (NOT TO SCALE: the gauge is drawn wide so the two rails read)

/** Drawn radius of the bend: wide, then tight and wide again on "Wide or tight". */
const radiusAt = (f: number): number => {
	const t = T();
	const tight = tween(f, t.wide + 10, t.wide + 70, 0, 1, ease.camera) - tween(f, t.noDiff + 10, t.noDiff + 80, 0, 1, ease.camera);
	return 640 - 380 * tight;
};
/** A point on the bend at angle a (0 = start, π/2 = end) on radius r. Start: heading up, at the right of O. */
const P = (r: number, a: number) => ({x: O.x + r * Math.cos(a), y: O.y - r * Math.sin(a)});

const arcPath = (r: number, a0: number, a1: number): string => {
	const n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 0.01));
	const pts: string[] = [];
	for (let i = 0; i <= n; i++) {
		const q = P(r, a0 + ((a1 - a0) * i) / n);
		pts.push(`${q.x.toFixed(1)},${q.y.toFixed(1)}`);
	}
	return pts.join(' ');
};

/** The race: both contacts leave together at the same speed (same spin) unless `cone`, when the outer runs faster. */
const Race: React.FC<{f: number; start: number; dur: number; cone: boolean; r: number; o: number}> = ({f, start, dur, cone, r, o}) => {
	if (o <= 0.01) return null;
	const ri = r - B;
	const ro = r + B;
	const p = tween(f, start, start + dur, 0, 1, ease.camera);
	const aIn = (Math.PI / 2) * p;
	const aOut = cone ? aIn : ((Math.PI / 2) * p * ri) / ro;
	const ci = P(ri, aIn);
	const co = P(ro, aOut);
	const done = p > 0.995;
	const ribbon = !cone && p > 0.02;
	const skew = !cone ? Math.min(1, p * 1.2) : 0;
	return (
		<g opacity={o}>
			{/* the outer rail still to run: the crimson ribbon */}
			{ribbon ? (
				<polyline points={arcPath(ro, aOut, Math.PI / 2)} fill="none" stroke={colors.crimson} strokeWidth={10} strokeLinecap="round" opacity={done ? 1 : 0.35 + 0.65 * p} style={{filter: `drop-shadow(0 0 10px ${colors.crimson})`}} />
			) : null}
			{/* the axle between the two contacts: skewed when the outer one lags (it would have to skid) */}
			<line x1={ci.x} y1={ci.y} x2={co.x} y2={co.y} stroke={skew > 0.2 && !cone ? colors.crimson : colors.line} strokeWidth={5} opacity={0.9} />
			<circle cx={ci.x} cy={ci.y} r={13} fill={colors.amber} style={{filter: `drop-shadow(0 0 10px ${colors.amber})`}} />
			<circle cx={co.x} cy={co.y} r={13} fill={colors.amber} style={{filter: `drop-shadow(0 0 10px ${colors.amber})`}} />
			{cone && done ? <circle cx={(ci.x + co.x) / 2} cy={(ci.y + co.y) / 2} r={90} fill="none" stroke={colors.emerald} strokeWidth={4} style={{filter: `drop-shadow(0 0 12px ${colors.emerald})`}} /> : null}
		</g>
	);
};

const Bend: React.FC<{f: number; o: number}> = ({f, o}) => {
	const t = T();
	if (o <= 0.01) return null;
	const r = radiusAt(f);
	const draw = pen(f, t.bend, 60);
	const ang = on(f, t.rightAngle, 20);
	const lead = 260; // px of straight before and after
	const startIn = P(r - B, 0);
	const startOut = P(r + B, 0);
	const endIn = P(r - B, Math.PI / 2);
	const endOut = P(r + B, Math.PI / 2);
	const raceO = Math.min(on(f, t.expect - 10, 16), off(f, t.loco - 20, 24));
	const coneO = on(f, t.yet + 30, 20);
	return (
		<g opacity={o}>
			{/* straights in and out, then the arcs */}
			<g opacity={draw}>
				<line x1={startIn.x} y1={startIn.y + lead} x2={startIn.x} y2={startIn.y} stroke={colors.line} strokeWidth={4} />
				<line x1={startOut.x} y1={startOut.y + lead} x2={startOut.x} y2={startOut.y} stroke={colors.line} strokeWidth={4} />
				<line x1={endIn.x} y1={endIn.y} x2={endIn.x - lead} y2={endIn.y} stroke={colors.line} strokeWidth={4} />
				<line x1={endOut.x} y1={endOut.y} x2={endOut.x - lead} y2={endOut.y} stroke={colors.line} strokeWidth={4} />
			</g>
			<polyline points={arcPath(r - B, 0, (Math.PI / 2) * draw)} fill="none" stroke={colors.line} strokeWidth={4} />
			<polyline points={arcPath(r + B, 0, (Math.PI / 2) * draw)} fill="none" stroke={colors.line} strokeWidth={4} />
			{/* start and finish lines */}
			<line x1={startIn.x - 30} y1={startIn.y} x2={startOut.x + 30} y2={startOut.y} stroke={colors.sub} strokeWidth={3} strokeDasharray="10 8" opacity={draw} />
			<line x1={endIn.x} y1={endIn.y + 30} x2={endOut.x} y2={endOut.y - 30} stroke={colors.sub} strokeWidth={3} strokeDasharray="10 8" opacity={draw} />
			{/* the right angle at the centre */}
			<g opacity={ang}>
				<line x1={O.x} y1={O.y} x2={startIn.x - 40} y2={O.y} stroke={colors.sub} strokeWidth={2} strokeDasharray="6 8" />
				<line x1={O.x} y1={O.y} x2={O.x} y2={endIn.y + 40} stroke={colors.sub} strokeWidth={2} strokeDasharray="6 8" />
				<polyline points={`${O.x + 40},${O.y} ${O.x + 40},${O.y - 40} ${O.x},${O.y - 40}`} fill="none" stroke={colors.line} strokeWidth={3} />
			</g>
			<Race f={f} start={t.expect + 30} dur={150} cone={false} r={r} o={raceO} />
			<Race f={f} start={t.watch} dur={170} cone r={r} o={coneO} />
		</g>
	);
};

// ---- a generic box-cab electric locomotive in line art (no make, no livery; research/visual_refs.md) ----
const Loco: React.FC<{f: number; o: number}> = ({f, o}) => {
	const t = T();
	if (o <= 0.01) return null;
	const draw = pen(f, t.nothing - 6, 60); // drawn over once the real locomotive's clip has gone (Footage.tsx)
	const k = 54; // px per m (the whole locomotive clears the HUD column)
	const x0 = 200;
	const rail = 470; // screen y of the rail top
	const X = (m: number) => x0 + m * k;
	const Y = (m: number) => rail - m * k;
	const Lb = 19.6; // body length, m
	const wheelR = 0.6;
	const bogies = [4.3, Lb - 4.3];
	const axles = bogies.flatMap((b) => [b - 1.35, b + 1.35]);
	const glow = on(f, t.nothing + 20, 24);
	const stroke = {fill: 'none', stroke: colors.line, strokeWidth: 2.5, pathLength: 1, strokeDasharray: `${draw} 1`} as const;
	const body = [
		[0.35, 1.25],
		[0.35, 2.6],
		[0.9, 3.85],
		[1.6, 4.05],
		[Lb - 1.6, 4.05],
		[Lb - 0.9, 3.85],
		[Lb - 0.35, 2.6],
		[Lb - 0.35, 1.25],
	]
		.map(([x, y]) => `${X(x).toFixed(1)},${Y(y).toFixed(1)}`)
		.join(' ');
	return (
		<g opacity={o}>
			<line x1={X(-1.5)} y1={rail} x2={X(Lb + 1.5)} y2={rail} stroke={colors.sub} strokeWidth={3} opacity={draw} />
			<polygon points={body} fill="rgba(13,20,32,0.85)" opacity={draw} />
			<polyline points={`${body} ${X(0.35).toFixed(1)},${Y(1.25).toFixed(1)}`} {...stroke} />
			{/* underframe, buffers */}
			<rect x={X(0.2)} y={Y(1.25)} width={(Lb - 0.4) * k} height={0.22 * k} fill="none" stroke={colors.line} strokeWidth={2} opacity={draw} />
			{[0, 1].map((e) => (
				<rect key={e} x={e ? X(Lb - 0.05) : X(-0.45)} y={Y(1.15)} width={0.5 * k} height={0.18 * k} fill="none" stroke={colors.line} strokeWidth={2} opacity={draw} />
			))}
			{/* cab windscreens and side windows, doors, louvres */}
			<g opacity={draw}>
				<polyline points={`${X(0.95)},${Y(3.75)} ${X(1.55)},${Y(3.92)} ${X(1.55)},${Y(3.05)} ${X(0.6)},${Y(2.75)}`} fill="none" stroke={colors.line} strokeWidth={2} />
				<polyline points={`${X(Lb - 0.95)},${Y(3.75)} ${X(Lb - 1.55)},${Y(3.92)} ${X(Lb - 1.55)},${Y(3.05)} ${X(Lb - 0.6)},${Y(2.75)}`} fill="none" stroke={colors.line} strokeWidth={2} />
				{[2.1, Lb - 3.0].map((x) => (
					<rect key={x} x={X(x)} y={Y(3.75)} width={0.9 * k} height={0.75 * k} fill="none" stroke={colors.line} strokeWidth={2} />
				))}
				{[2.1, Lb - 3.0].map((x) => (
					<rect key={`d${x}`} x={X(x)} y={Y(2.85)} width={0.9 * k} height={1.5 * k} fill="none" stroke={colors.sub} strokeWidth={1.5} />
				))}
				{Array.from({length: 28}, (_, i) => 4.0 + i * 0.42).map((x) => (
					<line key={x} x1={X(x)} y1={Y(3.65)} x2={X(x)} y2={Y(2.95)} stroke={colors.sub} strokeWidth={1.5} opacity={0.7} />
				))}
				<line x1={X(3.5)} y1={Y(2.35)} x2={X(Lb - 3.5)} y2={Y(2.35)} stroke={colors.sub} strokeWidth={1.5} />
				{/* roof: equipment and a lowered single-arm pantograph */}
				<rect x={X(5.5)} y={Y(4.35)} width={8.6 * k} height={0.3 * k} fill="none" stroke={colors.line} strokeWidth={2} />
				<polyline points={`${X(4.2)},${Y(4.1)} ${X(4.4)},${Y(4.3)} ${X(6.6)},${Y(4.55)} ${X(4.9)},${Y(4.75)}`} fill="none" stroke={colors.line} strokeWidth={2.5} />
				<line x1={X(4.6)} y1={Y(4.75)} x2={X(5.4)} y2={Y(4.75)} stroke={colors.line} strokeWidth={3} />
			</g>
			{/* bogies: frame, springs, axle boxes, wheels */}
			{bogies.map((b) => (
				<g key={b} opacity={draw}>
					<rect x={X(b - 2.05)} y={Y(1.05)} width={4.1 * k} height={0.38 * k} rx={6} fill="rgba(13,20,32,0.9)" stroke={colors.line} strokeWidth={2} />
					{[b - 1.35, b + 1.35].map((a) => (
						<g key={a}>
							<polyline points={Array.from({length: 7}, (_, i) => `${X(a - 0.38 + (i % 2) * 0.12)},${Y(0.72 + i * 0.05)}`).join(' ')} fill="none" stroke={colors.sub} strokeWidth={2} />
							<rect x={X(a - 0.22)} y={Y(0.72)} width={0.44 * k} height={0.3 * k} fill="none" stroke={colors.line} strokeWidth={2} />
						</g>
					))}
				</g>
			))}
			{axles.map((a) => (
				<g key={a}>
					<circle cx={X(a)} cy={Y(wheelR)} r={wheelR * k} fill="rgba(13,20,32,0.95)" stroke={glow > 0.01 ? colors.amber : colors.line} strokeWidth={3} opacity={draw} style={glow > 0.01 ? {filter: `drop-shadow(0 0 ${10 * glow}px ${colors.amber})`} : undefined} />
					<circle cx={X(a)} cy={Y(wheelR)} r={0.16 * k} fill="none" stroke={colors.line} strokeWidth={2} opacity={draw} />
				</g>
			))}
		</g>
	);
};

// ---- a car's differential (top view), and the wheelset that has none ----
const Differential: React.FC<{f: number; o: number}> = ({f, o}) => {
	const t = T();
	if (o <= 0.01) return null;
	const draw = pen(f, t.diff, 50);
	const cx = 520;
	const cy = 800;
	const spin = (f - t.box) / 60; // seconds since "the box"
	const run = on(f, t.box, 20);
	// in a left turn the outer (right) wheel spins faster: here 1.25× the inner (ILLUSTRATIVE)
	const marks = (x: number, rate: number) =>
		Array.from({length: 6}, (_, i) => {
			const ph = ((i / 6 + Math.max(0, spin) * rate * run) % 1) * 2 - 1; // −1…1 along the tyre
			return <line key={i} x1={x - 34} y1={cy + ph * 92} x2={x + 34} y2={cy + ph * 92} stroke={colors.sub} strokeWidth={2} opacity={1 - Math.abs(ph) * 0.7} />;
		});
	const strike = pen(f, t.faster + 40, 20);
	return (
		<g opacity={o}>
			<g opacity={draw}>
				{/* tyres */}
				{[cx - 330, cx + 330].map((x) => (
					<rect key={x} x={x - 40} y={cy - 100} width={80} height={200} rx={18} fill="#141E2C" stroke={colors.line} strokeWidth={2.5} />
				))}
				{marks(cx - 330, 0.8)}
				{marks(cx + 330, 1.0)}
				{/* half-shafts and the housing */}
				<line x1={cx - 290} y1={cy} x2={cx - 70} y2={cy} stroke={colors.line} strokeWidth={8} />
				<line x1={cx + 70} y1={cy} x2={cx + 290} y2={cy} stroke={colors.line} strokeWidth={8} />
				<ellipse cx={cx} cy={cy} rx={80} ry={92} fill="rgba(13,20,32,0.9)" stroke={colors.line} strokeWidth={2.5} />
				{/* side gears and spider gears, as bevel-gear sections */}
				{[-1, 1].map((s) => (
					<polygon key={s} points={`${cx + s * 58},${cy - 40} ${cx + s * 34},${cy - 22} ${cx + s * 34},${cy + 22} ${cx + s * 58},${cy + 40}`} fill="none" stroke={colors.amber} strokeWidth={2.5} />
				))}
				{[-1, 1].map((s) => (
					<polygon key={`p${s}`} points={`${cx - 26},${cy + s * 64} ${cx - 14},${cy + s * 34} ${cx + 14},${cy + s * 34} ${cx + 26},${cy + s * 64}`} fill="none" stroke={colors.amber} strokeWidth={2.5} />
				))}
				{/* the drive in, from the engine */}
				<line x1={cx} y1={cy - 92} x2={cx} y2={cy - 190} stroke={colors.line} strokeWidth={8} />
			</g>
			{/* outer wheel faster: two rotation arrows of different length */}
			<g opacity={on(f, t.faster - 20, 20)}>
				<Arrow x1={cx + 420} y1={cy + 90} x2={cx + 420} y2={cy - 90} color={colors.emerald} width={6} />
				<Arrow x1={cx - 420} y1={cy + 50} x2={cx - 420} y2={cy - 50} color={colors.emerald} width={6} />
			</g>
			{/* a train has none of it: one solid axle */}
			<g opacity={on(f, t.faster + 40, 24)}>
				<TopWheelset pose={{x: 1480, y: 960, heading: 0, k: 0.17}} />
			</g>
			{strike > 0 ? <line x1={cx - 420} y1={cy - 160} x2={cx - 420 + 840 * strike} y2={cy - 160 + 320 * strike} stroke={colors.crimson} strokeWidth={7} strokeLinecap="round" style={{filter: `drop-shadow(0 0 8px ${colors.crimson})`}} /> : null}
		</g>
	);
};

export const RailRace: React.FC = () => {
	const f = useCurrentFrame();
	const t = T();
	const bendO = Math.min(1, off(f, t.loco - 10, 30) + on(f, t.yet - 20, 30));
	const locoO = Math.min(on(f, t.loco - 10, 30), off(f, t.yet - 20, 30));
	const diffO = Math.min(on(f, t.diff - 10, 20), off(f, t.yet - 20, 30));
	const ribbonLabel = Math.min(on(f, t.longer, 20), off(f, t.loco - 10, 24));
	const tight = radiusAt(f) < 450;
	return (
		<Stage
			dur={S().dur}
			light={{x: 0.4, y: 0.6}}
			overlay={
				<Hud
					title="THE BEND"
					start={t.rightAngle}
					end={t.end + 20}
					width={480}
					note="MODEL"
					rows={[
						{label: 'TURN', unit: '°', keys: [{frame: 0, value: 90}], decimals: 0, tone: 'line', source: 'C04'},
						{label: 'b0', unit: 'm', keys: [{frame: 0, value: WS.b0 / 1000}], decimals: 2, tone: 'line', source: 'C04'},
						{label: 'OUTER +', unit: 'm', keys: [{frame: 0, value: DL}], decimals: 2, tone: 'crimson', source: 'C04', from: t.longer},
						{label: 'LOCO', unit: 't', keys: [{frame: 0, value: 98}], decimals: 0, tone: 'line', source: 'C01', from: t.ton},
					]}
				/>
			}
		>
			<AbsoluteFill>
				<Svg>
					<Bend f={f} o={bendO} />
					<Loco f={f} o={locoO} />
					<Differential f={f} o={diffO} />
				</Svg>
				{/* the bend's words */}
				<Label x={O.x + radiusAt(f) + B + 40} y={O.y - 120} size={36} color={colors.line} weight={600} opacity={bendO * on(f, t.wide, 16) * (1 - on(f, t.loco - 30, 20))}>
					{tight ? 'TIGHT' : 'WIDE'}
				</Label>
				<Label x={960} y={380} size={56} color={colors.crimson} weight={700} opacity={ribbonLabel}>
					+{DL.toFixed(2)} m
				</Label>
				<Label x={960} y={450} size={26} color={colors.sub} opacity={ribbonLabel}>
					OUTER RAIL, ANY RADIUS · 2 × b0 × 90°
				</Label>
				<Label x={960} y={620} size={36} color={colors.emerald} weight={700} opacity={on(f, t.neither, 20)}>
					NEITHER WHEEL SLIPS
				</Label>
				<Label x={960} y={672} size={26} color={colors.sub} opacity={on(f, t.neither, 20)}>
					THE OUTER WHEEL ROLLS ON A BIGGER CIRCLE
				</Label>
				<Label x={760} y={490} size={44} color={colors.line} weight={700} opacity={locoO * on(f, t.ton, 20)}>
					≈ 100 t
				</Label>
				<Label x={200} y={496} size={36} color={colors.crimson} weight={600} opacity={locoO * on(f, t.steering, 16)}>
					NO STEERING
				</Label>
				<Label x={1000} y={700} size={36} color={colors.amber} weight={600} opacity={diffO * on(f, t.box, 20)}>
					A CAR'S DIFFERENTIAL
				</Label>
				<Label x={1000} y={752} size={26} color={colors.sub} opacity={diffO * on(f, t.faster - 20, 20)}>
					LETS THE OUTER WHEEL SPIN FASTER
				</Label>
				<Label x={1000} y={830} size={36} color={colors.crimson} weight={700} opacity={diffO * on(f, t.faster + 40, 20)}>
					A WHEELSET HAS NONE
				</Label>
				<Tag x={96} y={H - 110} opacity={bendO * on(f, t.bend + 20, 20)}>
					NOT TO SCALE · GAUGE DRAWN WIDE
				</Tag>
				<Tag x={96} y={H - 110} opacity={locoO}>
					GENERIC LOCOMOTIVE · LINE DRAWING
				</Tag>
			</AbsoluteFill>
		</Stage>
	);
};

export const railRaceCues = (): SfxCue[] => {
	const t = T();
	return [
		{frame: t.bend, sfx: 'pen_scratch', gainDb: -14},
		{frame: t.expect + 30, sfx: 'whoosh', gainDb: -16},
		{frame: t.longer, sfx: 'quartz_tick', gainDb: -10, pan: 0.2},
		{frame: t.loco, sfx: 'pen_scratch', gainDb: -14},
		{frame: t.faster + 40, sfx: 'relay_click', gainDb: -10},
		{frame: t.watch, sfx: 'whoosh', gainDb: -16},
		{frame: t.neither, sfx: 'glass_tone', gainDb: -12},
	];
};

if (Math.abs(DL - 2.356) > 0.001) throw new Error(`rail race: path difference ${DL}`);
