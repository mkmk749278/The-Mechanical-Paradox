import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {colors, feaRamp} from '../../../lib/remotion/brand';
import {Hud} from '../../../lib/remotion/Hud';
import {Arrow, Callout, Label, lin, off, on, pen, Stage, Svg, Tag} from '../../../lib/remotion/kit';
import {ease, shudder, tween} from '../../../lib/remotion/motion';
import {SfxCue} from '../../../lib/remotion/sfx';
import {camPath} from './camera';
import {GovernorCloseUp} from './Governor';
import {climbToContact, climbToSpring, counterweight, flyRadius, LIFT, SPRING_TRAVEL, stop, upAccel, wedgeState} from './model';
import {Drift} from './Drift';
import {at, span} from './scenes';
import {Cam, Shaft, SH, toScreen} from './Shaft';
import {WedgeGear} from './Wedge';

// s12–s16: the spring sets the limit; the rail is scraped; the counterweight pulls an empty car up; the brake that
// faces up; the landing.

const FULL = climbToContact + climbToSpring;

// ---------------- s12: the spring ----------------
const b12 = () => ({
	how: at('s12', 'So how do you stop a wedge'),
	limit: at('s12', 'You give it a limit'),
	jaws: at('s12', 'The jaws that hold'),
	behind: at('s12', 'Behind them, stacks'),
	climbs: at('s12', 'The wedge climbs only'),
	steady: at('s12', 'A steady squeeze'),
	slides: at('s12', 'So your car slides'),
	depending: at('s12', 'Depending on how the springs'),
	end: span('s12').dur,
});

const climb12 = (fr: number): number => {
	const b = b12();
	return tween(fr, b.behind - 20, b.climbs + 200, climbToContact, FULL, ease.camera);
};

export const Spring: React.FC = () => {
	const f = useCurrentFrame();
	const b = b12();
	const c = climb12(f);
	const ws = wedgeState(c);
	// chart 1: clamp (spring force, as a share of its maximum) against wedge climb; chart 2: speed against time
	const cx0 = 960;
	const cy0 = 880;
	const cw = 760;
	const ch = 360;
	const chart1 = Math.min(on(f, b.climbs - 20, 20), off(f, b.steady + 20, 20));
	const chart2 = Math.min(on(f, b.steady + 10, 20), off(f, b.depending, 20));
	const bars = on(f, b.depending, 20);
	const cxMap = (climb: number) => cx0 + (climb / (FULL + 12)) * cw;
	const cyMap = (clamp: number) => cy0 - clamp * ch;
	const clampOf = (climb: number) => wedgeState(climb).jaw / SPRING_TRAVEL;
	const trace = Array.from({length: 120}, (_, i) => {
		const cl = ((FULL + 12) * i) / 119;
		return `${cxMap(cl).toFixed(1)},${cyMap(clampOf(Math.min(cl, FULL))).toFixed(1)}`;
	}).join(' ');
	const t06 = stop(0.6).t;
	const speedPts = Array.from({length: 60}, (_, i) => {
		const tt = (t06 * 1.3 * i) / 59;
		const v = Math.max(0, LIFT.vTrip - 0.6 * 9.80665 * tt);
		return `${(cx0 + (tt / (t06 * 1.3)) * cw).toFixed(1)},${(cy0 - (v / LIFT.vTrip) * ch).toFixed(1)}`;
	}).join(' ');
	const speedDraw = pen(f, b.steady + 30, 110);
	const stops = [
		{g: 1, d: stop(1).d, label: 'SPRINGS SET HARD'},
		{g: 0.6, d: stop(0.6).d, label: 'IN BETWEEN'},
		{g: 0.2, d: stop(0.2).d, label: 'SET SOFT / CAR FULL'},
	];
	return (
		<Stage
			dur={b.end}
			light={{x: 0.3, y: 0.5}}
			overlay={
				<Hud
					labelSize={30}
					title="THE SPRING"
					start={b.behind - 10}
					end={b.end + 20}
					width={460}
					note="MODEL · NOT TO SCALE"
					rows={[
						{label: 'WEDGE CLIMB', unit: 'mm', at: (fr) => climb12(fr), decimals: 1, tone: 'amber', source: 'ILLUSTRATIVE'},
						{label: 'JAWS OPEN', unit: 'mm', at: (fr) => wedgeState(climb12(fr)).jaw, decimals: 2, tone: 'cyan', source: 'ILLUSTRATIVE'},
					]}
				/>
			}
		>
			<AbsoluteFill>
				<Drift f={f} from={0} to={b.behind} ox={1760} oy={540} s={1.08}>
				<Drift f={f} from={b.steady - 30} to={b.end} ox={1760} oy={540} s={1.07}>
				<Svg>
					<WedgeGear cx={430} cy={600} k={4.4} housingY={0} climb={c} glowWedge={on(f, b.how, 16)} springs={on(f, b.limit, 16)} squeeze={ws.gap < 1e-6 ? 0.4 + 0.6 * (ws.jaw / SPRING_TRAVEL) : 0} />
					{/* chart 1: clamp vs climb, rising then flat */}
					<g opacity={chart1}>
						<line x1={cx0} y1={cy0} x2={cx0 + cw} y2={cy0} stroke={colors.sub} strokeWidth={2} />
						<line x1={cx0} y1={cy0} x2={cx0} y2={cy0 - ch - 20} stroke={colors.sub} strokeWidth={2} />
						<polyline points={trace} fill="none" stroke={colors.cyan} strokeWidth={4} style={{filter: `drop-shadow(0 0 6px ${colors.cyan})`}} />
						<circle cx={cxMap(c)} cy={cyMap(clampOf(c))} r={10} fill={colors.amber} />
					</g>
					{/* chart 2: speed falling in a straight line */}
					<g opacity={chart2}>
						<line x1={cx0} y1={cy0} x2={cx0 + cw} y2={cy0} stroke={colors.sub} strokeWidth={2} />
						<line x1={cx0} y1={cy0} x2={cx0} y2={cy0 - ch - 20} stroke={colors.sub} strokeWidth={2} />
						<polyline points={speedPts} fill="none" stroke={colors.amber} strokeWidth={5} pathLength={1} strokeDasharray={`${speedDraw} 1`} />
					</g>
					{/* the stopping distances */}
					<g opacity={bars}>
						{stops.map((s, i) => (
							<rect key={s.g} x={cx0 + 40} y={470 + i * 140} width={(s.d / 1.1) * 640 * tween(f, b.depending + i * 12, b.depending + 40 + i * 12, 0, 1, ease.arrive)} height={44} fill={colors.emerald} opacity={0.55 + 0.15 * i} />
						))}
					</g>
				</Svg>
				<Callout subSize={30} x={430 + 96 * 4.4} y={600 - 30 * 4.4} lx={1010} ly={820} text="DISC SPRINGS" color={colors.cyan} t={Math.min(on(f, b.behind + 20, 26), off(f, b.climbs - 10, 14))} sub="THEY LET THE JAWS OPEN" />
				<Label x={cx0} y={cy0 - ch - 70} size={36} color={colors.cyan} opacity={chart1}>
					SQUEEZE ↑
				</Label>
				<Label x={cx0 + cw} y={cy0 + 16} size={30} color={colors.sub} align="right" opacity={chart1}>
					WEDGE CLIMB →
				</Label>
				<Label x={cx0 + cw} y={cyMap(1) - 64} size={36} color={colors.cyan} weight={600} align="right" opacity={chart1 * on(f, b.climbs + 140, 16)}>
					THE SPRINGS DECIDE
				</Label>
				<Label x={cx0} y={cy0 - ch - 70} size={36} color={colors.amber} opacity={chart2}>
					SPEED · 2.0 → 0 m/s
				</Label>
				<Label x={cx0 + cw} y={cy0 + 16} size={30} color={colors.sub} align="right" opacity={chart2}>
					TIME → (0.34 s AT 0.6 g)
				</Label>
				{stops.map((s, i) => (
					<React.Fragment key={s.g}>
						<Label x={cx0 + 40} y={422 + i * 140} size={30} color={colors.sub} opacity={bars}>
							{`${s.g} g · ${s.label}`}
						</Label>
						<Label x={cx0 + 60 + (s.d / 1.1) * 640} y={474 + i * 140} size={36} color={colors.line} weight={600} opacity={on(f, b.depending + 40 + i * 12, 14)}>
							{`${s.d.toFixed(2)} m`}
						</Label>
					</React.Fragment>
				))}
				<Label x={960} y={960} size={48} color={colors.cyan} weight={700} opacity={Math.min(on(f, b.limit + 10, 14), off(f, b.steady, 16))}>
					THE LIMIT IS A SPRING
				</Label>
				</Drift>
				</Drift>
				<Tag x={96} y={970} opacity={off(f, b.end - 16, 14)}>
					MODEL · NOT TO SCALE
				</Tag>
			</AbsoluteFill>
		</Stage>
	);
};
export const springCues = (): SfxCue[] => {
	const b = b12();
	return [
		{frame: b.limit, sfx: 'glass_tone', gainDb: -14},
		{frame: b.behind, sfx: 'torque_whine', gainDb: -16},
		{frame: b.steady + 30, sfx: 'pen_scratch', gainDb: -16},
		{frame: b.depending, sfx: 'quartz_tick', gainDb: -16},
	];
};

// ---------------- s13: the rail is scraped; ground smooth; released by raising; built to slip ----------------
const b13 = () => ({
	gentle: at('s13', 'Is it gentle on the rail'),
	scrape: at('s13', 'The wedges actually scrape'),
	manual: at('s13', "One maker's manual"),
	ground: at('s13', 'Afterward, the marks'),
	raised: at('s13', 'The car can only be released'),
	trained: at('s13', 'a trained person'),
	grabs: at('s13', 'So the wedge grabs'),
	slip: at('s13', 'built to slip'),
	end: span('s13').dur,
});

export const Rail: React.FC = () => {
	const f = useCurrentFrame();
	const b = b13();
	// a macro of the rail face: the wedge slides down it, leaving bright tracks; then a grinder; then the car lifts
	const slide = tween(f, b.gentle, b.manual + 120, 0, 1, ease.camera);
	const wedgeY = 200 + slide * 520;
	const grind = tween(f, b.ground, b.ground + 100, 0, 1, ease.camera);
	// the car is raised off the wedges over the whole line (viewer review v1: a hold once it had finished)
	const lift = tween(f, b.raised + 20, b.grabs - 10, 0, 1, ease.camera);
	const heat = Math.min(on(f, b.scrape, 12), 1 - slide * 0.6) * off(f, b.ground, 30);
	// the summary beat: the wedge grabs and slips again, slowing to rest (viewer review v1: a 10 s hold here)
	const slip = tween(f, b.grabs, b.end, 0, 1, ease.leave);
	const slipY = slip * 230;
	const slipHeat = on(f, b.grabs, 14) * (1 - slip * 0.7);
	const railX = 760;
	const railW = 260;
	return (
		<Stage dur={b.end} light={{x: 0.45, y: 0.5}}>
			<AbsoluteFill>
				<Drift f={f} from={0} to={b.grabs - 20} ox={760} oy={360} s={1.05}>
				<Drift f={f} from={b.grabs - 20} to={b.end} ox={760} oy={360} s={1.05}>
				<Svg>
					<defs>
						<radialGradient id="el-heat">
							<stop offset="0" stopColor={feaRamp[3]} stopOpacity={0.95} />
							<stop offset="0.35" stopColor={feaRamp[2]} stopOpacity={0.7} />
							<stop offset="0.7" stopColor={feaRamp[1]} stopOpacity={0.35} />
							<stop offset="1" stopColor={feaRamp[0]} stopOpacity={0} />
						</radialGradient>
					</defs>
					{/* the rail's face, edge to edge, seen head-on */}
					<rect x={railX - railW / 2} y={0} width={railW} height={1080} fill="#2E3A49" stroke={colors.line} strokeWidth={3} />
					{/* scrape tracks: drawn from the wedge's start down to where it is now; the grinder wipes them away */}
					{[-70, -40, -12, 18, 46, 74].map((x, i) => (
						<line key={x} x1={railX + x} y1={200} x2={railX + x} y2={wedgeY} stroke={i % 2 ? '#E8EEF4' : '#B7C3CF'} strokeWidth={i % 3 ? 3 : 5} opacity={(1 - grind) * 0.9} />
					))}
					{/* the grinding wheel passing down the rail */}
					<g opacity={Math.min(on(f, b.ground, 12), off(f, b.raised, 20))}>
						<circle cx={railX} cy={180 + grind * 620} r={90} fill="#141E2C" stroke={colors.line} strokeWidth={3} />
						<circle cx={railX} cy={180 + grind * 620} r={12} fill={colors.line} />
						{Array.from({length: 8}, (_, i) => {
							const a = f / 4 + (i * Math.PI) / 4;
							return <line key={i} x1={railX} y1={180 + grind * 620} x2={railX + Math.cos(a) * 80} y2={180 + grind * 620 + Math.sin(a) * 80} stroke={colors.sub} strokeWidth={2} />;
						})}
					</g>
					{/* the wedge on the face, with heat at the contact */}
					{/* fresh tracks from the slip */}
					{[-70, -40, -12, 18, 46, 74].map((x, i) => (
						<line key={`s${x}`} x1={railX + x} y1={wedgeY - 260} x2={railX + x} y2={wedgeY - 260 + slipY} stroke={i % 2 ? '#E8EEF4' : '#B7C3CF'} strokeWidth={i % 3 ? 3 : 5} opacity={on(f, b.grabs, 10) * 0.9} />
					))}
					<g transform={`translate(0 ${-lift * 260 + slipY})`}>
						<rect x={railX - 110} y={wedgeY - 130} width={220} height={130} fill="rgba(255,159,28,0.25)" stroke={colors.amber} strokeWidth={4} opacity={1 - grind * 0.0} />
						<ellipse cx={railX} cy={wedgeY - 10} rx={150} ry={70} fill="url(#el-heat)" opacity={Math.max(heat, slipHeat)} />
					</g>
					<Arrow x1={railX + 300} y1={700} x2={railX + 300} y2={460} color={colors.emerald} width={7} grow={Math.min(on(f, b.raised + 10, 20), off(f, b.grabs, 20))} />
				</Svg>
				<Label x={1040} y={300} size={44} color={colors.line} weight={700} opacity={Math.min(on(f, 10, 14), off(f, b.scrape - 10, 12))}>
					THE RAIL, SEEN FROM THE FRONT
				</Label>
				<Label x={1040} y={300} size={46} color={colors.crimson} weight={700} opacity={Math.min(on(f, b.scrape, 12), off(f, b.ground, 16))}>
					IT SCRAPES THE RAIL
				</Label>
				<Label x={1040} y={370} size={36} color={colors.sub} opacity={Math.min(on(f, b.manual + 20, 14), off(f, b.ground, 16))}>
					FRICTION + STEEL SHAVED OFF
				</Label>
				<Label x={1040} y={300} size={44} color={colors.line} weight={700} opacity={Math.min(on(f, b.ground + 10, 14), off(f, b.raised - 14, 14))}>
					MARKS GROUND SMOOTH
				</Label>
				<Label x={1040} y={300} size={44} color={colors.emerald} weight={700} opacity={Math.min(on(f, b.raised + 10, 14), off(f, b.grabs, 16))}>
					RELEASED BY RAISING THE CAR
				</Label>
				<Label x={1040} y={370} size={36} color={colors.emerald} opacity={Math.min(on(f, b.trained, 14), off(f, b.grabs, 16))}>
					✓ CHECKED BY A TRAINED PERSON
				</Label>
				<Label x={1000} y={300} size={46} color={colors.amber} weight={700} opacity={Math.min(on(f, b.grabs, 14), 1)}>
					THE WEDGE GRABS
				</Label>
				<Label x={1000} y={380} size={46} color={colors.cyan} weight={700} opacity={on(f, b.grabs + 70, 14)}>
					THE SPRING HOLDS IT BACK
				</Label>
				<Label x={1000} y={500} size={60} color={colors.amber} weight={700} opacity={on(f, b.slip, 14)}>
					BUILT TO SLIP
				</Label>
				</Drift>
				</Drift>
				<Tag x={96} y={970} opacity={off(f, b.end - 16, 14)}>
					ILLUSTRATION · SOURCE: SLC BF_D-1 MANUAL
				</Tag>
			</AbsoluteFill>
		</Stage>
	);
};
export const railCues = (): SfxCue[] => {
	const b = b13();
	return [
		{frame: b.scrape, sfx: 'flow_sweep', gainDb: -12},
		{frame: b.scrape + 10, sfx: 'transformer_rise', gainDb: -16},
		{frame: b.ground, sfx: 'torque_whine', gainDb: -16},
		{frame: b.raised + 20, sfx: 'relay_click', gainDb: -16},
		{frame: b.slip, sfx: 'glass_tone', gainDb: -14},
	];
};

// ---------------- s14: the counterweight; the empty car runs away upward ----------------
const b14 = () => ({
	promised: at('s14', 'Now, the danger I promised'),
	oneway: at('s14', 'All of this only works'),
	down: at('s14', 'Down', 'All of this only works'),
	balanced: at('s14', 'An elevator like yours'),
	save: at('s14', 'To save energy'),
	empty: at('s14', 'Now imagine the car is empty'),
	lighter: at('s14', 'Which side is lighter'),
	answer: at('s14', 'The car', 'Which side is lighter'),
	fail: at('s14', 'Suppose the'),
	drop: at('s14', 'The counterweight can drop'),
	end: span('s14').dur,
});

/** Upward run (m) and speed (m/s) after the machine brake lets go (MODEL, frictionless), from frame `start`. */
const runaway = (fr: number, start: number) => {
	const t = Math.max(0, (fr - start) / 60);
	return {d: 0.5 * upAccel * t * t, v: upAccel * t};
};

export const Counterweight: React.FC = () => {
	const f = useCurrentFrame();
	const b = b14();
	const goF = b.drop;
	const r = runaway(Math.min(f, goF + 150), goF);
	const carY = 2.0 + r.d;
	const cwY = 9.6 - r.d;
	const cam: Cam = camPath(f, [
		{f: 0, cam: {cx: 0.3, cy: 5.6, s: 120}},
		{f: b.balanced, cam: {cx: 0.6, cy: 7.0, s: 74}},
		{f: b.end, cam: {cx: 0.6, cy: 7.2, s: 70}},
	]);
	// the balance: car (+ 45 % of a full load) against the counterweight; the load leaves on "empty"
	const load = 1 - tween(f, b.empty + 20, b.empty + 60, 0, 1, ease.camera);
	const tip = tween(f, b.empty + 40, b.lighter + 40, 0, 1, ease.arrive) * 9;
	const bx = 1450;
	const by = 760;
	const [cwx, cwy] = toScreen(cam, SH.cwX, cwY + 0.8);
	const [mx, my] = toScreen(cam, SH.sheave.x, SH.sheave.y);
	const [tx, ty] = toScreen(cam, 0, SH.top - 0.2);
	return (
		<Stage
			dur={b.end}
			light={{x: 0.4, y: 0.4}}
			overlay={
				<Hud
					labelSize={30}
					title="THE OTHER WAY"
					start={b.balanced - 10}
					end={b.end + 20}
					width={480}
					note="MODEL VALUES"
					rows={[
						{label: 'CAR (EMPTY)', unit: 'kg', at: () => LIFT.car, decimals: 0, tone: 'line', source: 'ILLUSTRATIVE'},
						{label: 'COUNTERWEIGHT', unit: 'kg', at: () => counterweight, decimals: 0, tone: 'emerald', source: 'C24'},
						{label: 'CAR SPEED ↑', unit: 'm/s', at: (fr) => runaway(Math.min(fr, b.drop + 150), b.drop).v, decimals: 2, tone: 'crimson', source: 'ILLUSTRATIVE', from: b.fail},
					]}
				/>
			}
		>
			<AbsoluteFill>
				<Drift f={f} from={b.lighter + 60} to={b.drop + 60} ox={150} oy={560} s={1.05} release={b.drop + 60}>
				<Drift f={f} from={b.drop + 120} to={b.end} ox={150} oy={560} s={1.08}>
				<Svg>
					<Shaft cam={cam} st={{carY, cwY, govRot: 0, ropeTravel: -r.d, leverDeg: 0, wedge: 0, glowGear: Math.min(on(f, b.oneway, 14), off(f, b.balanced, 20))}} />
					{/* the machine brake, fading on "fail" */}
					<rect x={mx - 40} y={my - 70} width={80} height={30} fill={f > b.fail + 20 ? colors.crimson : colors.emerald} opacity={on(f, b.fail - 20, 14) * (f > b.fail + 20 ? 0.5 + 0.5 * Math.abs(Math.sin(f / 6)) : 1)} />
					{/* the overhead the car runs toward */}
					<line x1={tx - 120} y1={ty} x2={tx + 120} y2={ty} stroke={colors.crimson} strokeWidth={6} opacity={on(f, b.drop, 16)} />
					<Arrow x1={tx - 260} y1={ty + 400} x2={tx - 260} y2={ty + 140} color={colors.crimson} width={7} grow={on(f, b.drop + 30, 20)} />
					{/* the balance beam */}
					<g opacity={Math.min(on(f, b.save, 20), off(f, b.fail + 40, 20))} transform={`rotate(${tip} ${bx} ${by})`}>
						<line x1={bx - 260} y1={by} x2={bx + 260} y2={by} stroke={colors.line} strokeWidth={6} />
						<rect x={bx - 320} y={by - 110} width={120} height={110} fill="#121B27" stroke={colors.line} strokeWidth={3} />
						<rect x={bx - 312} y={by - 160} width={104} height={50} fill={colors.amber} opacity={load} />
						<rect x={bx + 200} y={by - 150} width={120} height={150} fill="#1A2330" stroke={colors.emerald} strokeWidth={3} />
					</g>
					<polygon points={`${bx},${by} ${bx - 30},${by + 60} ${bx + 30},${by + 60}`} fill={colors.sub} opacity={Math.min(on(f, b.save, 20), off(f, b.fail + 40, 20))} />
				</Svg>
				<Label x={150} y={150} size={52} color={colors.crimson} weight={700} opacity={Math.min(on(f, b.promised, 14), off(f, b.balanced, 16))}>
					THE DANGER
				</Label>
				<Label x={150} y={220} size={44} color={colors.emerald} weight={700} opacity={Math.min(on(f, b.down, 10), off(f, b.balanced, 16))}>
					IT ONLY GRIPS GOING DOWN
				</Label>
				<Callout subSize={30} x={cwx} y={cwy} lx={cwx + 200} ly={cwy + 200} text="COUNTERWEIGHT" color={colors.emerald} t={Math.min(on(f, b.balanced + 30, 26), off(f, b.empty, 16))} sub="CAR + 40–50 % OF A FULL LOAD" />
				<Label x={bx - 230} y={by + 90} size={30} color={colors.sub} align="center" opacity={Math.min(on(f, b.save, 20), off(f, b.fail + 40, 20))}>
					CAR {load > 0.5 ? '+ 45 % LOAD' : '(EMPTY)'}
				</Label>
				<Label x={bx + 250} y={by + 90} size={30} color={colors.emerald} align="center" opacity={Math.min(on(f, b.save, 20), off(f, b.fail + 40, 20))}>
					COUNTERWEIGHT
				</Label>
				<Label x={bx} y={by - 260} size={48} color={colors.amber} weight={700} align="center" opacity={Math.min(on(f, b.answer, 10), off(f, b.fail + 40, 16))}>
					THE CAR IS LIGHTER
				</Label>
				<Label x={150} y={560} size={44} color={colors.crimson} weight={700} opacity={on(f, b.drop + 30, 14)}>
					UP, FASTER AND FASTER
				</Label>
				</Drift>
				</Drift>
				<Tag x={96} y={970} opacity={off(f, b.end - 16, 14)}>
					ILLUSTRATION · MODEL · NOT TO SCALE
				</Tag>
			</AbsoluteFill>
		</Stage>
	);
};
export const counterweightCues = (): SfxCue[] => {
	const b = b14();
	return [
		{frame: b.promised, sfx: 'glass_tone', gainDb: -14},
		{frame: b.down, sfx: 'relay_click', gainDb: -14},
		{frame: b.empty + 40, sfx: 'whoosh', gainDb: -16},
		{frame: b.fail + 20, sfx: 'metal_snap_sub', gainDb: -12},
		{frame: b.drop, sfx: 'torque_whine', gainDb: -12},
	];
};

// ---------------- s15: the brake that faces up ----------------
const MINE = {x0: 560, x1: 1000, beamY: 300, carH: 280, carTop0: 780} as const;
const b15 = () => ({
	wedges: at('s15', 'And the wedges you just'),
	cannot: at('s15', 'They cannot help'),
	only: at('s15', 'They only grip going'),
	really: at('s15', 'Does that really happen'),
	study: at('s15', 'One study looked'),
	eighteen: at('s15', 'In just five years'),
	codes: at('s15', 'So the codes added'),
	canada: at('s15', 'Canada made it a rule'),
	europe: at('s15', 'Europe requires it'),
	both: at('s15', 'Often the same governor'),
	clamp: at('s15', 'For example, a clamp'),
	twoway: at('s15', 'or wedges that grip both'),
	end: span('s15').dur,
});

export const UpBrake: React.FC = () => {
	const f = useCurrentFrame();
	const b = b15();
	// the wedges start parked (viewer review v2: they began orange and gripping). On "They cannot help" the lever lifts
	// them to the rail, and the rail, moving down past a car going up, drags them back down and out of the slot
	const lifted = tween(f, b.cannot, b.cannot + 30, 0, climbToContact, ease.camera);
	const climb = lifted + tween(f, b.cannot + 40, b.only + 60, 0, -10 - climbToContact, ease.camera);
	const touching = Math.min(on(f, b.cannot + 24, 8), off(f, b.cannot + 60, 20));
	// the strike lands on "In just five years"; the count runs once the beam has been hit
	const hitF = b.eighteen;
	const rise = Math.min(1, Math.max(0, (f - (b.really + 10)) / (hitF - (b.really + 10))));
	const first = MINE.carTop0 + (MINE.beamY - MINE.carTop0) * rise * rise; // from rest, constant acceleration
	// on "So the codes added a brake that faces up": the run again, with that brake. The car rewinds to its start, then
	// rises again from rest at the same acceleration; at the governor's trip point the up-facing wedges grip and it slows
	// at a steady rate to a stop below the beam (viewer review v2: the brake had been drawn on a car already crashed).
	const R0 = b.codes + 50;
	const ACC_F = 100; // frames of acceleration, from rest, before the trip
	const tripY = MINE.beamY + 260;
	const stopY = MINE.beamY + 120;
	const vTrip = (2 * (MINE.carTop0 - tripY)) / ACC_F; // px per frame at the trip
	const BRK_F = (2 * (tripY - stopY)) / vTrip; // frames to stop at a constant deceleration
	const second = (fr: number): number => {
		const t = fr - R0;
		if (t < 0) return tween(fr, b.codes, b.codes + 40, MINE.beamY, MINE.carTop0, ease.camera);
		if (t < ACC_F) return MINE.carTop0 - (MINE.carTop0 - tripY) * (t / ACC_F) ** 2;
		const t2 = Math.min(t - ACC_F, BRK_F);
		return tripY - (vTrip * t2 - (0.5 * vTrip * t2 * t2) / BRK_F);
	};
	const carY15 = f < b.codes ? first : second(f);
	const grip = on(f, R0 + ACC_F, 10);
	const stopped = R0 + ACC_F + BRK_F;
	const rise15 = on(f, b.really + 10, 30) * off(f, hitF, 20) + on(f, R0, 20) * off(f, R0 + ACC_F, 20);
	const jolt15 = f >= hitF ? shudder(f, 60, hitF, 7, 11) : 0;
	const heat15 = (f < hitF ? 0 : Math.max(0.35, tween(f, hitF, hitF + 50, 1, 0.35, ease.leave))) * off(f, b.codes, 30);
	const count = f < hitF + 6 ? 0 : Math.round(tween(f, hitF + 6, hitF + 96, 1, 18, ease.camera));
	const sceneA = off(f, b.really + 10, 20);
	const sceneB = Math.min(on(f, b.really + 10, 20), off(f, b.both - 10, 20));
	const sceneC = on(f, b.both - 10, 20);
	const v = lin(f, b.both, b.both + 120, -LIFT.vRated, -LIFT.vTrip);
	return (
		<Stage dur={b.end} light={{x: 0.4, y: 0.5}}>
			<AbsoluteFill>
				<Drift f={f} from={b.eighteen + 100} to={b.both} ox={780} oy={330} s={1.06} dx={-40} dy={30}>
				<Svg opacity={sceneA}>
					<WedgeGear cx={600} cy={560} k={4.6} housingY={0} climb={climb} glowWedge={touching} />
					<Arrow x1={1100} y1={760} x2={1100} y2={360} color={colors.crimson} width={8} grow={on(f, b.wedges, 20)} />
					<Arrow x1={760} y1={420} x2={760} y2={640} color={colors.sub} width={5} grow={on(f, b.cannot, 20)} />
				</Svg>
				<Label x={1140} y={540} size={36} color={colors.crimson} opacity={sceneA * on(f, b.wedges + 10, 14)}>
					CAR GOING UP
				</Label>
				<Label x={1140} y={620} size={44} color={colors.line} weight={700} opacity={sceneA * on(f, b.cannot, 14)}>
					THE WEDGE IS PULLED OUT
				</Label>
				<Label x={1140} y={690} size={36} color={colors.sub} opacity={sceneA * on(f, b.only, 14)}>
					NO GRIP GOING UP
				</Label>
				{/* the count: the top of a shaft, an empty car accelerating up into the overhead (uniform acceleration from
				rest, so it covers the shaft faster and faster), the strike as a stress field in the beam, and the tally as
				dents along the beam's underside, one per count (not an icon grid) */}
				<Svg opacity={sceneB}>
					<defs>
						<radialGradient id="el-strike">
							<stop offset="0" stopColor={feaRamp[3]} stopOpacity={0.95} />
							<stop offset="0.35" stopColor={feaRamp[2]} stopOpacity={0.7} />
							<stop offset="0.7" stopColor={feaRamp[1]} stopOpacity={0.35} />
							<stop offset="1" stopColor={feaRamp[0]} stopOpacity={0} />
						</radialGradient>
					</defs>
					<g transform={`translate(0 ${jolt15})`}>
						{/* overhead beam */}
						<rect x={MINE.x0 - 60} y={MINE.beamY - 70} width={MINE.x1 - MINE.x0 + 120} height={70} fill="#1A2330" stroke={colors.line} strokeWidth={3} />
						{Array.from({length: 14}, (_, i) => (
							<line key={i} x1={MINE.x0 - 40 + i * 44} y1={MINE.beamY - 66} x2={MINE.x0 - 10 + i * 44} y2={MINE.beamY - 4} stroke={colors.grid} strokeWidth={2} />
						))}
						<ellipse cx={(MINE.x0 + MINE.x1) / 2} cy={MINE.beamY - 20} rx={260} ry={90} fill="url(#el-strike)" opacity={heat15} />
						{/* the tally: one strike mark scored into the beam's face per count */}
						{Array.from({length: 18}, (_, i) => (
							<line key={i} x1={MINE.x0 - 22 + i * 27} y1={MINE.beamY - 58} x2={MINE.x0 - 10 + i * 27} y2={MINE.beamY - 12} stroke={colors.crimson} strokeWidth={4} strokeLinecap="round" opacity={i < count ? 1 : 0} />
						))}
					</g>
					{/* shaft walls and guides */}
					{[MINE.x0, MINE.x1].map((x) => (
						<g key={x}>
							<line x1={x} y1={MINE.beamY} x2={x} y2={1080} stroke={colors.line} strokeWidth={3} />
							{Array.from({length: 9}, (_, i) => (
								<line key={i} x1={x} y1={MINE.beamY + 40 + i * 90} x2={x + (x === MINE.x0 ? 14 : -14)} y2={MINE.beamY + 40 + i * 90} stroke={colors.sub} strokeWidth={2} />
							))}
						</g>
					))}
					{/* the empty car */}
					<g transform={`translate(0 ${carY15})`}>
						<rect x={MINE.x0 + 24} y={0} width={MINE.x1 - MINE.x0 - 48} height={MINE.carH} fill="#141C27" stroke={colors.line} strokeWidth={3} />
						<rect x={MINE.x0 + 60} y={30} width={MINE.x1 - MINE.x0 - 120} height={MINE.carH - 60} fill="none" stroke={colors.sub} strokeWidth={2} />
						{/* the brake that faces up: wedges at the car's top corners, narrowing downward */}
						{[MINE.x0 + 4, MINE.x1 - 4].map((x) => (
							<path key={x} d={x < 960 ? `M ${x} 20 l 30 0 l 0 90 l -30 -24 z` : `M ${x} 20 l -30 0 l 0 90 l 30 -24 z`} fill={grip > 0.5 ? 'rgba(255,159,28,0.35)' : '#2A3544'} stroke={grip > 0.5 ? colors.amber : colors.line} strokeWidth={3} opacity={on(f, b.codes + 20, 20)} style={grip > 0.5 ? {filter: `drop-shadow(0 0 8px ${colors.amber})`} : undefined} />
						))}
					</g>
					<Arrow x1={MINE.x1 + 70} y1={760} x2={MINE.x1 + 70} y2={500} color={colors.crimson} width={6} grow={rise15} />
				</Svg>
				<Label x={1120} y={200} size={120} color={colors.crimson} weight={700} opacity={sceneB * on(f, b.eighteen + 6, 8)}>
					{`${count}`}
				</Label>
				<Label x={1120} y={360} size={36} color={colors.line} opacity={sceneB * on(f, b.study, 14)}>
					US MINE ELEVATORS HIT THE TOP
				</Label>
				<Label x={1120} y={415} size={36} color={colors.sub} opacity={sceneB * on(f, b.eighteen, 14)}>
					IN JUST 5 YEARS
				</Label>
				<Label x={1120} y={100} size={36} color={colors.crimson} opacity={sceneB * on(f, b.eighteen + 6, 8)}>
					AT LEAST
				</Label>
				<Label x={1120} y={810} size={36} color={colors.emerald} weight={700} opacity={sceneB * on(f, stopped, 14)}>
					STOPPED SHORT OF THE TOP
				</Label>
				<Label x={1120} y={640} size={44} color={colors.amber} weight={700} opacity={sceneB * on(f, b.codes, 14)}>
					A BRAKE THAT FACES UP
				</Label>
				<Label x={1120} y={700} size={36} color={colors.sub} opacity={sceneB * on(f, b.canada, 14)}>
					CANADA 1990
				</Label>
				<Label x={1120} y={750} size={36} color={colors.sub} opacity={sceneB * on(f, b.europe, 14)}>
					EUROPE · EN 81-20
				</Label>
				</Drift>
				{/* both directions: the governor, a rope clamp, a two-way gear */}
				<Svg opacity={sceneC}>
					<GovernorCloseUp cx={460} cy={560} k={1.9} rot={(f - b.both) * 0.16} r={flyRadius(Math.abs(v))} locked={false} ropeTravel={(f - b.both) / 60} glowWeights={1} />
					<g opacity={on(f, b.clamp, 20)}>
						{[-0.05, 0, 0.05].map((o) => (
							<line key={o} x1={1100 + o * 400} y1={300} x2={1100 + o * 400} y2={820} stroke={colors.line} strokeWidth={4} />
						))}
						<rect x={980 + 40 * on(f, b.clamp + 40, 20)} y={500} width={70} height={140} fill="#2A3544" stroke={colors.amber} strokeWidth={4} />
						<rect x={1150 - 40 * on(f, b.clamp + 40, 20)} y={500} width={70} height={140} fill="#2A3544" stroke={colors.amber} strokeWidth={4} />
					</g>
					{/* a two-way gear: one pair of wedges in a slot narrowing upward (grips going down), a mirrored pair in a slot
					narrowing downward (grips going up); the rail is clipped so it stays clear of the label */}
					<defs>
						<clipPath id="el-twoway">
							<rect x={1300} y={200} width={560} height={665} />
						</clipPath>
					</defs>
					<g opacity={on(f, b.twoway, 20)} clipPath="url(#el-twoway)">
						<WedgeGear cx={1580} cy={500} k={1.8} housingY={0} climb={tween(f, b.twoway + 10, b.twoway + 70, 0, FULL * 0.6, ease.camera)} glowWedge={on(f, b.twoway + 40, 12)} railTicks={false} />
						<g transform="translate(0 1090) scale(1 -1)">
							<WedgeGear cx={1580} cy={500} k={1.8} housingY={0} climb={tween(f, b.twoway + 10, b.twoway + 70, 0, FULL * 0.6, ease.camera)} glowWedge={on(f, b.twoway + 40, 12)} railTicks={false} />
						</g>
					</g>
				</Svg>
				<Label x={460} y={880} size={36} color={colors.amber} align="center" opacity={sceneC}>
					GOVERNOR: BOTH WAYS
				</Label>
				<Label x={1100} y={880} size={36} color={colors.amber} align="center" opacity={on(f, b.clamp, 20)}>
					CLAMP ON THE ROPES
				</Label>
				<Label x={1580} y={920} size={36} color={colors.amber} align="center" opacity={on(f, b.twoway, 20)}>
					WEDGES BOTH WAYS
				</Label>
				<Tag x={96} y={970} opacity={off(f, b.end - 16, 14)}>
					SIMPLIFIED · NOT TO SCALE
				</Tag>
			</AbsoluteFill>
		</Stage>
	);
};
export const upBrakeCues = (): SfxCue[] => {
	const b = b15();
	return [
		{frame: b.cannot, sfx: 'flow_sweep', gainDb: -16},
		{frame: b.really + 10, sfx: 'torque_whine', gainDb: -16},
		{frame: b.eighteen, sfx: 'metal_jam_sub', gainDb: -10},
		{frame: b.eighteen + 6, sfx: 'typewriter', gainDb: -14},
		{frame: b.codes, sfx: 'relay_click', gainDb: -16},
		{frame: b.codes + 150, sfx: 'metal_jam_sub', gainDb: -12}, // the up-facing wedges grip (R0 + ACC_F in UpBrake)
		{frame: b.clamp + 40, sfx: 'metal_jam_sub', gainDb: -12},
	];
};

// ---------------- s16: landing ----------------
const b16 = () => ({
	next: at('s16', 'So the next time elevator'),
	rope: at('s16', 'A thin rope you will never'),
	wedges: at('s16', 'Wedges, waiting just clear'),
	springs: at('s16', 'And springs, set to stop'),
	safest: at('s16', 'The safest brake is not'),
	just: at('s16', 'It is the one that grabs just'),
	end: span('s16').dur,
});

export const Landing: React.FC = () => {
	const f = useCurrentFrame();
	const b = b16();
	const carY = 4.4;
	const cam: Cam = camPath(f, [
		{f: 0, cam: {cx: 0, cy: carY + 1.1, s: 330}},
		{f: b.next + 140, cam: {cx: 0, cy: carY + 1.2, s: 300}},
		{f: b.rope - 10, cam: {cx: -0.9, cy: 13.0, s: 300}},
		{f: b.wedges - 10, cam: {cx: -0.5, cy: carY + 0.3, s: 260}},
		{f: b.safest - 20, cam: {cx: 0.0, cy: carY + 1.5, s: 150}},
		{f: b.end, cam: {cx: 0.0, cy: carY + 3.0, s: 95}},
	]);
	const doors = tween(f, b.next + 20, b.next + 120, 0, 1, ease.camera);
	const [dlx, dly] = toScreen(cam, -0.5, carY + 2.05);
	const [drx, dry] = toScreen(cam, 0.5, carY + 0.05);
	const doorW = (drx - dlx) / 2;
	const inside = 1 - tween(f, b.next + 120, b.rope - 20, 0, 1, ease.camera);
	const [gx, gy] = toScreen(cam, -SH.railX, carY + SH.plank);
	return (
		<Stage dur={b.end} light={{x: 0.5, y: 0.45}}>
			<AbsoluteFill>
				<Svg>
					<Shaft cam={cam} st={{carY, cwY: 8, govRot: f / 30, ropeTravel: 0, leverDeg: 0, wedge: 0, glowGovRope: Math.min(on(f, b.rope, 16), off(f, b.safest, 30)), glowGear: on(f, b.wedges, 16), focus: on(f, b.rope - 20, 30) * 0.6}} />
					{/* the car's light, and the doors closing on it */}
					<rect x={dlx} y={dly} width={drx - dlx} height={dry - dly} fill="#F7E7C6" opacity={0.35 * inside} />
					<rect x={dlx} y={dly} width={doorW * doors} height={dry - dly} fill="#2A3544" stroke={colors.line} strokeWidth={2} opacity={inside} />
					<rect x={drx - doorW * doors} y={dly} width={doorW * doors} height={dry - dly} fill="#2A3544" stroke={colors.line} strokeWidth={2} opacity={inside} />
				</Svg>
				<Callout x={gx} y={gy} lx={gx - 220} ly={gy + 160} text="JUST CLEAR OF THE RAIL" color={colors.amber} t={Math.min(on(f, b.wedges + 10, 26), off(f, b.safest, 16))} />
				<Label x={150} y={150} size={44} color={colors.cyan} weight={700} opacity={Math.min(on(f, b.springs + 20, 14), off(f, b.safest, 16))}>
					SPRINGS, SET JUST SO
				</Label>
				<Svg opacity={on(f, b.safest - 10, 20)}>
					<rect x={0} y={790} width={1920} height={190} fill="rgba(7,10,15,0.82)" />
				</Svg>
				<Label x={960} y={820} size={48} color={colors.line} weight={600} align="center" opacity={Math.min(on(f, b.safest, 16), 1)}>
					NOT THE ONE THAT GRABS HARDEST
				</Label>
				<Label x={960} y={890} size={56} color={colors.amber} weight={700} align="center" opacity={on(f, b.just, 16)}>
					THE ONE THAT GRABS JUST HARD ENOUGH
				</Label>
			</AbsoluteFill>
		</Stage>
	);
};
export const landingCues = (): SfxCue[] => {
	const b = b16();
	return [
		{frame: b.next + 20, sfx: 'whoosh', gainDb: -18},
		{frame: b.next + 120, sfx: 'relay_click', gainDb: -14},
		{frame: b.rope, sfx: 'glass_tone', gainDb: -16, pan: -0.5},
		{frame: b.wedges, sfx: 'glass_tone', gainDb: -16, pan: -0.3},
		{frame: b.just, sfx: 'glass_tone', gainDb: -12},
	];
};

void shudder;
