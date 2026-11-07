import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {colors} from '../../../lib/remotion/brand';
import {Hud} from '../../../lib/remotion/Hud';
import {Arrow, Callout, Label, lin, off, on, pen, Stage, Svg, Tag} from '../../../lib/remotion/kit';
import {ease, shudder, tween} from '../../../lib/remotion/motion';
import {SfxCue} from '../../../lib/remotion/sfx';
import {camPath} from './camera';
import {GovernorCloseUp} from './Governor';
import {flyRadius, FLY, GOV_R, govRpm, LEVER, leverDeg, LIFT} from './model';
import {at, span} from './scenes';
import {Cam, Shaft, SH, ShaftState, toScreen} from './Shaft';

// s02–s06: the teaser and the ropes; the governor and its rope loop; the flyweights catching; the falling car pulling
// its own brake lever; pure mechanics. Every speed is integrated frame by frame, so the sheave's turn, the rope marks,
// the car and the HUD share one clock.

/** ∫ v df over frames [0, f) for a speed profile v(frame) in m/s at 60 fps: metres travelled. */
const travel = (f: number, v: (fr: number) => number): number => {
	let d = 0;
	for (let i = 0; i < f; i++) d += v(i) / 60;
	return d;
};

const rest = (o: Partial<ShaftState> = {}): ShaftState => ({carY: 4.4, cwY: 8.0, govRot: 0, ropeTravel: 0, leverDeg: 0, wedge: 0, ...o});

// ---------------- s02: one danger; several ropes; the rare day ----------------
const b02 = () => ({
	danger: at('s02', 'And there is one danger'),
	later: at('s02', 'We will get to it'),
	rare: at('s02', 'Snaps are rare'),
	several: at('s02', 'Your car hangs on several'),
	day: at('s02', 'This brake is for the rare'),
	end: span('s02').dur,
});

export const Ropes: React.FC = () => {
	const f = useCurrentFrame();
	const b = b02();
	const cam: Cam = camPath(f, [
		{f: 0, cam: {cx: 0.6, cy: 6.4, s: 150}},
		{f: b.rare, cam: {cx: 0.6, cy: 6.9, s: 140}},
		{f: b.several + 20, cam: {cx: 0.55, cy: 10.6, s: 150}},
		{f: b.day, cam: {cx: 0.4, cy: 11.4, s: 160}},
		{f: b.day + 70, cam: {cx: -0.7, cy: 4.4, s: 380}},
		{f: b.end, cam: {cx: -0.75, cy: 4.35, s: 420}},
	]);
	const [ax, ay] = toScreen(cam, 0, 4.4 + SH.cross + 0.4);
	const [rx, ry] = toScreen(cam, 0.05, 9.6);
	const [gx, gy] = toScreen(cam, -SH.railX, 4.4 + SH.plank);
	const up = Math.min(on(f, b.danger + 10, 20), off(f, b.rare, 20));
	return (
		<Stage dur={b.end} light={{x: 0.5, y: 0.4}}>
			<AbsoluteFill>
				<Svg>
					<Shaft cam={cam} st={rest({glowGear: on(f, b.day + 50, 20), focus: on(f, b.day + 50, 20) * 0.6})} />
					{/* the danger it cannot stop: an arrow pointing the wrong way, dashed, a question for later */}
					<g opacity={up}>
						<Arrow x1={ax} y1={ay} x2={ax} y2={ay - 220 * tween(f, b.danger + 10, b.danger + 60, 0, 1, ease.arrive)} color={colors.amber} width={7} dashed />
					</g>
				</Svg>
				<Label x={ax + 50} y={ay - 210} size={44} color={colors.amber} weight={700} opacity={up}>
					ONE DANGER IT CAN'T STOP
				</Label>
				<Label x={ax + 50} y={ay - 150} size={36} color={colors.sub} opacity={Math.min(on(f, b.later, 14), off(f, b.rare, 20))}>
					LATER
				</Label>
				<Callout x={rx} y={ry} lx={rx + 260} ly={ry - 60} text="SEVERAL ROPES" sub="US CODES: AT LEAST 3" t={Math.min(on(f, b.several, 26), off(f, b.day + 40, 16))} />
				<Callout x={gx} y={gy} lx={gx + 320} ly={gy - 120} text="FOR THE RARE DAY" color={colors.amber} t={on(f, b.day + 60, 26)} />
				<Tag x={96} y={970} opacity={off(f, b.end - 16, 14)}>
					SIMPLIFIED
				</Tag>
			</AbsoluteFill>
		</Stage>
	);
};

export const ropesCues = (): SfxCue[] => {
	const b = b02();
	return [
		{frame: b.danger + 10, sfx: 'whoosh', gainDb: -16, pan: 0.2},
		{frame: b.several, sfx: 'pen_scratch', gainDb: -16},
		{frame: b.day + 50, sfx: 'glass_tone', gainDb: -16, pan: -0.4},
	];
};

// ---------------- s03: the wheel that lifts nothing; the rope loop; faster car, faster wheel ----------------
const b03 = () => ({
	top: at('s03', 'At the top of the shaft'),
	what: at('s03', 'So what is it for'),
	gov: at('s03', 'Engineers call it the governor'),
	loop: at('s03', 'A thin loop of rope'),
	hooked: at('s03', 'That rope is hooked'),
	wherever: at('s03', 'So wherever your car goes'),
	faster: at('s03', 'A faster car means'),
	end: span('s03').dur,
});

const v03 = (fr: number): number => {
	const b = b03();
	if (fr < b.wherever) return 0;
	if (fr < b.faster) return lin(fr, b.wherever, b.wherever + 60, 0, 1.0);
	return lin(fr, b.faster, b.faster + 50, 1.0, LIFT.vRated);
};

export const GovernorIntro: React.FC = () => {
	const f = useCurrentFrame();
	const b = b03();
	const d = travel(f, v03);
	const carY = 2.0 + d;
	const cam: Cam = camPath(f, [
		{f: 0, cam: {cx: -1.0, cy: 13.3, s: 520}},
		{f: b.gov + 30, cam: {cx: -1.1, cy: 13.25, s: 560}},
		{f: b.loop + 30, cam: {cx: 0.1, cy: 7.0, s: 74}},
		{f: b.hooked + 10, cam: {cx: 0.1, cy: 7.0, s: 74}},
		{f: b.hooked + 60, cam: {cx: -0.85, cy: carY + SH.cross, s: 360}},
		{f: b.wherever + 20, cam: (fr) => ({cx: -0.3, cy: 2.0 + travel(fr, v03) + 1.6, s: 150})},
		{f: b.end, cam: (fr) => ({cx: -0.3, cy: 2.0 + travel(fr, v03) + 1.2, s: 140})},
	]);
	// the loop pen-drawn in amber over the whole shaft: governor → pit pulley → back up to the hitch
	const loopT = pen(f, b.loop + 10, 150);
	const P = (X: number, Y: number) => toScreen(cam, X, Y);
	const loopPts = [P(SH.gov.x - GOV_R, SH.gov.y), P(SH.gov.x - GOV_R, SH.tension.y), P(SH.gov.x + GOV_R, SH.tension.y), P(SH.gov.x + GOV_R, carY + SH.cross)]
		.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
		.join(' ');
	const [gvx, gvy] = P(SH.gov.x, SH.gov.y);
	const [hx, hy] = P(SH.pivotX - LEVER.arm / 1000, carY + SH.cross);
	const glowRope = Math.min(on(f, b.loop, 20), off(f, b.wherever + 60, 30));
	return (
		<Stage
			dur={b.end}
			light={{x: 0.5, y: 0.5}}
			overlay={
				<Hud
					title="GOVERNOR"
					start={b.wherever - 20}
					end={b.end + 20}
					width={470}
					note="MODEL"
					rows={[
						{label: 'CAR', unit: 'm/s', at: (fr) => v03(fr), decimals: 2, tone: 'line', source: 'C09'},
						{label: 'WHEEL', unit: 'rpm', at: (fr) => govRpm(v03(fr)), decimals: 0, tone: 'amber', source: 'C06'},
					]}
				/>
			}
		>
			<AbsoluteFill>
				<Svg>
					<Shaft cam={cam} st={rest({carY, cwY: 8.0 - d, govRot: -d / GOV_R, ropeTravel: d, glowGovRope: glowRope, glowLever: Math.min(on(f, b.hooked, 16), off(f, b.wherever + 40, 20)), focus: glowRope * 0.5})} />
					<polyline points={loopPts} fill="none" stroke={colors.amber} strokeWidth={5} pathLength={1} strokeDasharray={`${loopT} 1`} opacity={off(f, b.hooked + 40, 20)} style={{filter: `drop-shadow(0 0 10px ${colors.amber})`}} />
				</Svg>
				<Callout x={gvx} y={gvy} lx={gvx + 300} ly={gvy + 300} text="LIFTS NOTHING" t={Math.min(on(f, b.top + 40, 26), off(f, b.gov, 12))} />
				<Callout x={gvx} y={gvy} lx={gvx + 300} ly={gvy + 300} text="THE GOVERNOR" color={colors.amber} size={48} t={Math.min(on(f, b.gov + 4, 26), off(f, b.loop + 20, 16))} />
				<Callout x={hx} y={hy} lx={hx - 220} ly={hy - 120} text="HOOKED TO A LEVER" color={colors.amber} t={Math.min(on(f, b.hooked + 50, 26), off(f, b.wherever + 30, 16))} />
				<Label x={150} y={150} size={44} color={colors.amber} weight={700} opacity={on(f, b.faster + 10, 16)}>
					FASTER CAR, FASTER WHEEL
				</Label>
				<Tag x={96} y={970} opacity={off(f, b.end - 16, 14)}>
					SIMPLIFIED · NOT TO SCALE
				</Tag>
			</AbsoluteFill>
		</Stage>
	);
};

export const governorIntroCues = (): SfxCue[] => {
	const b = b03();
	return [
		{frame: b.gov, sfx: 'glass_tone', gainDb: -14, pan: -0.5},
		{frame: b.loop + 10, sfx: 'pen_scratch', gainDb: -14},
		{frame: b.hooked + 50, sfx: 'relay_click', gainDb: -16},
		{frame: b.faster, sfx: 'torque_whine', gainDb: -18},
	];
};

// ---------------- s04: weights, springs, the catch; any overspeed ----------------
const b04 = () => ({
	classic: at('s04', 'In a classic governor'),
	spin: at('s04', 'Spin it faster'),
	set: at('s04', 'At a set speed'),
	catch: at('s04', 'far enough to catch'),
	stops: at('s04', 'Its rope stops'),
	care: at('s04', 'It does not care why'),
	snapped: at('s04', 'Snapped rope or anything'),
	end: span('s04').dur,
});

/** Car speed through s04: cruising, faster on "spin it faster", the 115 % mark on "set speed", the trip on "catch". */
const v04 = (fr: number): number => {
	const b = b04();
	if (fr < b.spin) return LIFT.vRated;
	if (fr < b.set) return lin(fr, b.spin, b.set, LIFT.vRated, 1.15 * LIFT.vRated);
	return lin(fr, b.set + 30, b.catch, 1.15 * LIFT.vRated, LIFT.vTrip);
};
const lockFrame = () => b04().catch;

export const Flyweights: React.FC = () => {
	const f = useCurrentFrame();
	const b = b04();
	const lockF = lockFrame();
	const locked = f >= lockF;
	const dRope = travel(Math.min(f, lockF), v04);
	const rot = -dRope / GOV_R + (locked ? shudder(f, 60, lockF, 0.05, 11) : 0);
	const v = v04(Math.min(f, lockF));
	const r = flyRadius(v);
	const k = 2.6;
	const cx = 950;
	const cy = 600 + shudder(f, 60, lockF, 6, 11);
	return (
		<Stage
			dur={b.end}
			light={{x: 0.4, y: 0.5}}
			overlay={
				<Hud
					title="GOVERNOR"
					start={20}
					end={b.end + 20}
					width={480}
					note="MODEL · SIMPLIFIED"
					rows={[
						{label: 'CAR', unit: 'm/s', at: (fr) => v04(fr), decimals: 2, tone: 'line', source: 'C09'},
						{label: 'OF NORMAL', unit: '%', at: (fr) => (v04(fr) / LIFT.vRated) * 100, decimals: 0, tone: 'amber', source: 'C09'},
						{label: 'WEIGHTS', unit: 'mm', at: (fr) => flyRadius(v04(Math.min(fr, lockFrame()))), decimals: 1, tone: 'amber', source: 'ILLUSTRATIVE'},
						{label: 'ROPE', unit: 'm/s', at: (fr) => (fr >= lockFrame() ? 0 : v04(fr)), decimals: 2, tone: 'crimson', source: 'C10', from: b.catch - 20},
					]}
				/>
			}
		>
			<AbsoluteFill>
				<Svg>
					<GovernorCloseUp cx={cx} cy={cy} k={k} rot={rot} r={r} locked={locked} ropeTravel={dRope} glowWeights={Math.max(on(f, b.spin, 16) * off(f, b.care, 20), locked ? 1 : 0)} glowRope={on(f, b.stops - 6, 12)} />
					{/* the latch radius, dashed: where the weights catch */}
					<circle cx={cx} cy={cy} r={(FLY.rLatch + 18) * k} fill="none" stroke={colors.crimson} strokeWidth={2} strokeDasharray="10 8" opacity={Math.min(on(f, b.set, 20), off(f, b.care, 20))} />
				</Svg>
				<Callout x={cx - 30 * k} y={cy - 30 * k} lx={600} ly={150} text="SPRINGS HOLD THEM IN" color={colors.cyan} t={Math.min(on(f, b.classic + 60, 26), off(f, b.set, 16))} />
				<Callout x={cx - (FLY.rLatch + 18) * k * 0.7} y={cy + (FLY.rLatch + 18) * k * 0.7} lx={560} ly={820} text="CATCH · ≥ 115 %" color={colors.crimson} t={Math.min(on(f, b.set + 40, 26), off(f, b.care, 16))} sub="OF NORMAL SPEED" />
				<Label x={150} y={480} size={56} color={colors.amber} weight={700} opacity={Math.min(on(f, b.catch + 6, 10), off(f, b.care - 10, 16))}>
					LOCKED
				</Label>
				<Label x={150} y={480} size={44} color={colors.amber} weight={700} opacity={on(f, b.snapped + 20, 16)}>
					ANY OVERSPEED
				</Label>
				<Label x={150} y={540} size={36} color={colors.sub} opacity={on(f, b.snapped + 40, 16)}>
					SNAPPED ROPE OR NOT
				</Label>
				<Tag x={96} y={970} opacity={off(f, b.end - 16, 14)}>
					SIMPLIFIED · NOT TO SCALE
				</Tag>
			</AbsoluteFill>
		</Stage>
	);
};

export const flyweightsCues = (): SfxCue[] => {
	const b = b04();
	return [
		{frame: b.spin, sfx: 'torque_whine', gainDb: -16},
		{frame: b.set + 40, sfx: 'pen_scratch', gainDb: -16},
		{frame: b.catch, sfx: 'metal_jam_sub', gainDb: -8},
		{frame: b.stops, sfx: 'quartz_tick', gainDb: -16},
	];
};

// ---------------- s05: the falling car pulls its own brake lever ----------------
const b05 = () => ({
	not: at('s05', 'But your car does not stop'),
	past: at('s05', 'It keeps falling'),
	still: at('s05', 'And that lever is still'),
	pulls: at('s05', 'The falling car pulls'),
	end: span('s05').dur,
});

/** Car travel past the stopped rope, mm: it falls through the lever's whole swing during "It keeps falling…". */
const travel05 = (fr: number): number => {
	const b = b05();
	const full = ((LEVER.maxDeg * Math.PI) / 180) * LEVER.arm;
	return tween(fr, b.past, b.pulls + 30, 0, full, ease.camera);
};

export const PullsLever: React.FC = () => {
	const f = useCurrentFrame();
	const b = b05();
	const dmm = travel05(f);
	const lever = leverDeg(dmm);
	const carY = 6.0 - dmm / 1000;
	const cam: Cam = camPath(f, [
		{f: 0, cam: {cx: -0.9, cy: 6.0 + SH.cross + 0.05, s: 900}},
		{f: b.end, cam: {cx: -0.92, cy: 6.0 + SH.cross + 0.0, s: 980}},
	]);
	const [px, py] = toScreen(cam, SH.pivotX, carY + SH.cross);
	return (
		<Stage
			dur={b.end}
			light={{x: 0.45, y: 0.45}}
			overlay={
				<Hud
					title="THE LEVER"
					start={20}
					end={b.end + 20}
					width={470}
					note="MODEL · NOT TO SCALE"
					rows={[
						{label: 'ROPE', unit: 'm/s', at: () => 0, decimals: 2, tone: 'crimson', source: 'C10'},
						{label: 'CAR PAST ROPE', unit: 'mm', at: (fr) => travel05(fr), decimals: 0, tone: 'line', source: 'ILLUSTRATIVE'},
						{label: 'LEVER', unit: '°', at: (fr) => leverDeg(travel05(fr)), decimals: 1, tone: 'amber', source: 'ILLUSTRATIVE'},
					]}
				/>
			}
		>
			<AbsoluteFill>
				<Svg>
					<Shaft cam={cam} st={rest({carY, ropeTravel: 0, leverDeg: lever, wedge: lever / LEVER.maxDeg, glowGovRope: 1, glowLever: on(f, b.still, 16), focus: 0.3})} />
					<Arrow x1={px + 300} y1={py - 200} x2={px + 300} y2={py - 40} color={colors.line} width={6} grow={Math.min(on(f, b.past, 20), off(f, b.pulls, 20))} />
				</Svg>
				<Label x={px + 300} y={py - 160} size={36} color={colors.line} align="right" opacity={Math.min(on(f, b.past + 10, 16), off(f, b.pulls, 20))}>
					CAR KEEPS FALLING
				</Label>
				<Label x={px - 600} y={py - 330} size={36} color={colors.amber} opacity={Math.min(on(f, b.not, 16), off(f, b.pulls, 20))}>
					ROPE: STOPPED
				</Label>
				<Label x={150} y={150} size={52} color={colors.amber} weight={700} opacity={on(f, b.pulls + 6, 14)}>
					THE CAR PULLS ITS OWN BRAKE LEVER
				</Label>
				<Tag x={96} y={970} opacity={off(f, b.end - 16, 14)}>
					SIMPLIFIED · NOT TO SCALE
				</Tag>
			</AbsoluteFill>
		</Stage>
	);
};

export const pullsLeverCues = (): SfxCue[] => {
	const b = b05();
	return [
		{frame: b.past, sfx: 'flow_sweep', gainDb: -16},
		{frame: b.pulls, sfx: 'relay_click', gainDb: -12, pan: -0.3},
	];
};

// ---------------- s06: a switch first; pure mechanics; the standard ----------------
const b06 = () => ({
	sw: at('s06', 'Many governors also flip'),
	pure: at('s06', 'But the brake itself'),
	std: at('s06', 'The European standard'),
	electric: at('s06', 'nothing electric'),
	fluid: at('s06', 'no fluid'),
	air: at('s06', 'air pressure'),
	end: span('s06').dur,
});

export const PureMechanics: React.FC = () => {
	const f = useCurrentFrame();
	const b = b06();
	// a replay of the trip, slower: the switch flips at 95 % of the trip speed, the weights catch at 100 %
	const v = lin(f, 20, b.sw + 110, LIFT.vRated, LIFT.vTrip);
	const swOn = v >= 0.95 * LIFT.vTrip ? 1 : 0;
	const locked = v >= LIFT.vTrip;
	const rot = -travel(Math.min(f, b.sw + 110), (fr) => lin(fr, 20, b.sw + 110, LIFT.vRated, LIFT.vTrip)) / GOV_R;
	const items = [
		{t: b.electric, text: 'ELECTRIC'},
		{t: b.fluid, text: 'FLUID PRESSURE'},
		{t: b.air, text: 'AIR PRESSURE'},
	];
	return (
		<Stage dur={b.end} light={{x: 0.35, y: 0.5}}>
			<AbsoluteFill>
				<Svg>
					<GovernorCloseUp cx={560} cy={540} k={2.3} rot={rot} r={flyRadius(v)} locked={locked} ropeTravel={0} showSwitch switchOn={swOn} glowWeights={on(f, b.pure, 16)} />
				</Svg>
				<Callout x={560 + 150 * 2.3} y={540 - 150 * 2.3} lx={980} ly={190} text="SWITCH: CUTS THE MOTOR" color={swOn ? colors.crimson : colors.sub} t={Math.min(on(f, b.sw + 20, 26), off(f, b.std, 16))} />
				<Callout x={560 + 40 * 2.3} y={540 + 60 * 2.3} lx={980} ly={820} text="BRAKE: PURE MECHANICS" color={colors.amber} t={Math.min(on(f, b.pure + 10, 26), off(f, b.std + 20, 16))} />
				<Label x={1060} y={300} size={36} color={colors.sub} opacity={on(f, b.std, 16)}>
					EN 81-20 · 5.6.2.1.6.4
				</Label>
				<Label x={1060} y={350} size={36} color={colors.line} opacity={on(f, b.std + 20, 16)}>
					MAY NOT SET OFF THE BRAKE:
				</Label>
				{items.map((it, i) => (
					<React.Fragment key={it.text}>
						<Label x={1060} y={430 + i * 80} size={48} color={colors.sub} weight={600} opacity={on(f, it.t - 6, 12)}>
							{it.text}
						</Label>
						<Svg opacity={on(f, it.t + 12, 8)}>
							<line x1={1050} y1={430 + i * 80 + 30} x2={1050 + (it.text.length * 29 + 20) * on(f, it.t + 12, 10)} y2={430 + i * 80 + 30} stroke={colors.crimson} strokeWidth={5} />
						</Svg>
					</React.Fragment>
				))}
				<Tag x={96} y={970} opacity={off(f, b.end - 16, 14)}>
					SIMPLIFIED
				</Tag>
			</AbsoluteFill>
		</Stage>
	);
};

export const pureMechanicsCues = (): SfxCue[] => {
	const b = b06();
	return [
		{frame: b.sw + 100, sfx: 'relay_click', gainDb: -12, pan: -0.3},
		{frame: b.sw + 110, sfx: 'metal_jam_sub', gainDb: -12},
		{frame: b.electric + 12, sfx: 'pen_scratch', gainDb: -16},
		{frame: b.fluid + 12, sfx: 'pen_scratch', gainDb: -16},
		{frame: b.air + 12, sfx: 'pen_scratch', gainDb: -16},
	];
};
