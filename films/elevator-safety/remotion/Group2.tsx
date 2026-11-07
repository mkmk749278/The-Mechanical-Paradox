import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {colors} from '../../../lib/remotion/brand';
import {Hud} from '../../../lib/remotion/Hud';
import {Arrow, Callout, Dim, Label, lin, off, on, pen, Stage, Svg, Tag} from '../../../lib/remotion/kit';
import {ease, shudder, tween} from '../../../lib/remotion/motion';
import {SfxCue} from '../../../lib/remotion/sfx';
import {camPath} from './camera';
import {climbToContact, climbToSpring, hardStopG, LIFT, SLOT_DEG, wedgeState} from './model';
import {at, span} from './scenes';
import {Cam, Shaft, SH, toScreen} from './Shaft';
import {WedgeGear} from './Wedge';

// s07–s11: the wedge the fall feeds; the question; too hard (10 g); Otis 1854; the window and twice your weight.

// ---------------- s07: rails, wedges, the narrowing slot, the fall feeding its own brake ----------------
const b07 = () => ({
	rails: at('s07', 'Your car runs between'),
	each: at('s07', 'On each rail'),
	slot: at('s07', 'And each wedge sits'),
	watch: at('s07', 'Now watch what your fall'),
	still: at('s07', 'Your car is falling'),
	touch: at('s07', 'So the moment a wedge'),
	higher: at('s07', 'The wedge slides higher'),
	harder: at('s07', 'The higher it goes'),
	trick: at('s07', 'Can you see the trick'),
	feeding: at('s07', 'Your fall is feeding'),
	end: span('s07').dur,
});

/**
 * Housing drop (mm, with the car) and wedge climb (mm, relative to the housing) through s07. The lever lifts the wedges
 * into contact; from then on the rail holds them still, so each mm the housing drops is a mm of climb, until the
 * springs are fully loaded and the wedges ride down with the car, scraping the rail.
 */
const gear07 = (fr: number): {drop: number; climb: number} => {
	const b = b07();
	const drop = tween(fr, b.still, b.harder + 90, 0, 60, ease.camera);
	const contactF = b.touch + 60;
	if (fr < contactF) return {drop, climb: tween(fr, b.touch, contactF, 0, climbToContact, ease.camera)};
	const dropAtContact = tween(contactF, b.still, b.harder + 90, 0, 60, ease.camera);
	return {drop, climb: Math.min(climbToContact + climbToSpring, climbToContact + (drop - dropAtContact))};
};

export const WedgeScene: React.FC = () => {
	const f = useCurrentFrame();
	const b = b07();
	const {drop, climb} = gear07(f);
	const ws = wedgeState(climb);
	const macro = tween(f, b.each + 40, b.each + 110, 0, 1, ease.camera);
	const cam: Cam = camPath(f, [
		{f: 0, cam: {cx: 0.0, cy: 5.6, s: 150}},
		{f: b.each + 20, cam: {cx: -SH.railX, cy: 4.3, s: 520}},
	]);
	const k = 5.2;
	const gx = 700;
	const gy = 640;
	const [rx, ry] = toScreen(cam, -SH.railX, 6.5);
	const loopO = on(f, b.trick + 10, 20);
	const steps = ['FALL', 'FRICTION', 'CLIMB', 'SQUEEZE'];
	return (
		<Stage
			dur={b.end}
			light={{x: 0.4, y: 0.5}}
			overlay={
				<Hud
					title="THE WEDGE"
					start={b.still - 10}
					end={b.end + 20}
					width={470}
					note="MODEL · NOT TO SCALE"
					rows={[
						{label: 'CAR DROP', unit: 'mm', at: (fr) => gear07(fr).drop, decimals: 0, tone: 'line', source: 'ILLUSTRATIVE'},
						{label: 'WEDGE CLIMB', unit: 'mm', at: (fr) => gear07(fr).climb, decimals: 1, tone: 'amber', source: 'ILLUSTRATIVE'},
						{label: 'GAP', unit: 'mm', at: (fr) => wedgeState(gear07(fr).climb).gap, decimals: 2, tone: 'line', source: 'ILLUSTRATIVE'},
						{label: 'SPRINGS', unit: 'mm', at: (fr) => wedgeState(gear07(fr).climb).jaw, decimals: 2, tone: 'cyan', source: 'ILLUSTRATIVE'},
					]}
				/>
			}
		>
			<AbsoluteFill>
				<Svg opacity={1 - macro}>
					<Shaft cam={cam} st={{carY: 4.4, cwY: 8, govRot: 0, ropeTravel: 0, leverDeg: 0, wedge: 0, glowGear: on(f, b.each, 16)}} />
				</Svg>
				<Callout x={rx} y={ry} lx={rx + 280} ly={ry - 80} text="STEEL GUIDE RAILS" t={Math.min(on(f, b.rails + 20, 26), off(f, b.each + 20, 16)) * (1 - macro)} />
				<Svg opacity={macro}>
					<WedgeGear cx={gx} cy={gy} k={k} housingY={drop} climb={climb} glowWedge={on(f, b.touch, 16)} squeeze={ws.gap < 0.001 ? Math.min(1, (climb - climbToContact) / climbToSpring + 0.25) * on(f, b.harder - 10, 16) : 0} springs={on(f, b.harder, 16)} slotGlow={Math.min(on(f, b.slot, 16), off(f, b.watch, 20))} />
					{/* the rail holds the wedge back: friction arrows up on the wedge faces */}
					{ws.gap < 0.001
						? [-1, 1].map((sd) => (
								<Arrow key={sd} x1={gx + sd * 60} y1={gy + 150 + drop * k * 0} x2={gx + sd * 60} y2={gy + 20} color={colors.amber} width={5} grow={Math.min(on(f, b.touch + 60, 20), off(f, b.trick, 20))} />
							))
						: null}
				</Svg>
				<Label x={1080} y={800} size={44} color={colors.amber} weight={700} opacity={Math.min(on(f, b.slot + 20, 14), off(f, b.watch, 16)) * macro}>
					NARROWS UPWARD · {SLOT_DEG}°
				</Label>
				<Label x={1080} y={800} size={44} color={colors.line} weight={700} opacity={Math.min(on(f, b.still + 10, 14), off(f, b.touch, 16))}>
					RAIL: STANDS STILL
				</Label>
				<Label x={1080} y={860} size={36} color={colors.sub} opacity={Math.min(on(f, b.still + 30, 14), off(f, b.touch, 16))}>
					CAR: FALLING
				</Label>
				<Label x={1080} y={800} size={44} color={colors.amber} weight={700} opacity={Math.min(on(f, b.touch + 40, 14), off(f, b.trick, 16))}>
					THE RAIL HOLDS IT BACK
				</Label>
				{/* the trick: a loop that feeds itself */}
				{steps.map((s, i) => {
					const a = -Math.PI / 2 + (i * Math.PI) / 2;
					const x = 1500 + Math.cos(a) * 170;
					const y = 700 + Math.sin(a) * 170;
					return (
						<Label key={s} x={x} y={y - 22} size={36} color={i === 0 ? colors.line : colors.amber} weight={600} align="center" opacity={Math.min(loopO, on(f, b.trick + 10 + i * 14, 14))}>
							{s}
						</Label>
					);
				})}
				<Svg opacity={loopO}>
					<circle cx={1500} cy={700} r={170} fill="none" stroke={colors.amber} strokeWidth={3} strokeDasharray="0.03 0.02" pathLength={1} strokeDashoffset={-f / 240} opacity={0.8} />
				</Svg>
				<Label x={1500} y={940} size={44} color={colors.amber} weight={700} align="center" opacity={on(f, b.feeding + 4, 14)}>
					THE FALL FEEDS THE BRAKE
				</Label>
				<Tag x={96} y={970} opacity={off(f, b.end - 10, 20)}>
					SIMPLIFIED · NOT TO SCALE
				</Tag>
			</AbsoluteFill>
		</Stage>
	);
};

export const wedgeCues = (): SfxCue[] => {
	const b = b07();
	return [
		{frame: b.each, sfx: 'relay_click', gainDb: -16},
		{frame: b.slot + 20, sfx: 'pen_scratch', gainDb: -16},
		{frame: b.touch + 50, sfx: 'metal_jam_sub', gainDb: -14},
		{frame: b.higher, sfx: 'flow_sweep', gainDb: -16},
		{frame: b.harder, sfx: 'torque_whine', gainDb: -16},
		{frame: b.feeding, sfx: 'glass_tone', gainDb: -14},
	];
};

// ---------------- s08: the question ----------------
const b08 = () => ({q: at('s08', 'So why not let it grab'), safest: at('s08', 'That sounds safest'), not: at('s08', 'It is not'), end: span('s08').dur});

export const Question: React.FC = () => {
	const f = useCurrentFrame();
	const b = b08();
	const snap = tween(f, b.q + 60, b.q + 72, 0, 1, ease.arrive);
	return (
		<Stage dur={b.end} light={{x: 0.5, y: 0.5}} grid={0.4}>
			<AbsoluteFill>
				<Svg>
					{/* a ghost wedge slamming shut on the rail, again and again: the grab-hard idea */}
					<g opacity={Math.min(on(f, b.q, 20), off(f, b.not + 10, 20)) * 0.9}>
						<WedgeGear cx={960} cy={560 + shudder(f, 60, b.q + 72, 8, 12)} k={4} housingY={0} climb={snap * (climbToContact + climbToSpring)} glowWedge={snap} />
					</g>
				</Svg>
				<Label x={1640} y={520} size={60} color={colors.line} weight={700} align="center" opacity={Math.min(on(f, b.safest, 14), off(f, b.not - 4, 10))}>
					SAFEST?
				</Label>
				<Label x={1640} y={510} size={72} color={colors.crimson} weight={700} align="center" opacity={on(f, b.not, 8)}>
					IT IS NOT.
				</Label>
				<Tag x={96} y={970} opacity={off(f, b.end - 10, 20)}>
					SIMPLIFIED
				</Tag>
			</AbsoluteFill>
		</Stage>
	);
};
export const questionCues = (): SfxCue[] => {
	const b = b08();
	return [{frame: b.q + 72, sfx: 'metal_jam_sub', gainDb: -10}, {frame: b.not, sfx: 'glass_tone', gainDb: -12}];
};

// ---------------- s09: too hard: 2 m/s to rest in 2 cm ----------------
const b09 = () => ({
	office: at('s09', 'Picture an ordinary office'),
	kicks: at('s09', 'Its brake kicks in'),
	two: at('s09', 'Now stop that speed'),
	ten: at('s09', 'You would slow at about'),
	every: at('s09', 'Every person inside'),
	end: span('s09').dur,
});

/** The g-meter's needle: 0, then the hard stop's 10.2 g on "ten times", a shudder, settling at that reading. */
const gNeedle = (fr: number): number => {
	const b = b09();
	return tween(fr, b.ten - 10, b.ten + 12, 0, hardStopG, ease.arrive) + shudder(fr, 60, b.ten + 12, 0.6, 9);
};

export const TooHard: React.FC = () => {
	const f = useCurrentFrame();
	const b = b09();
	const cam: Cam = camPath(f, [
		{f: 0, cam: {cx: 0.6, cy: 5.6, s: 150}},
		{f: b.end, cam: {cx: 0.55, cy: 5.6, s: 165}},
	]);
	const jolt = shudder(f, 60, b.ten + 12, 10, 9);
	const field = Math.min(on(f, b.ten + 10, 14), 1) * (0.6 + 0.4 * Math.abs(Math.sin(f / 9)));
	const [fx, fy] = toScreen(cam, -SH.carHalf, 4.4);
	const [fx2] = toScreen(cam, SH.carHalf, 4.4);
	// the g-meter dial
	const dx = 440;
	const dy = 640;
	const R = 220;
	const ang = (g: number) => Math.PI * (0.8 + (1.4 * Math.min(g, 12)) / 12);
	const needle = ang(gNeedle(f));
	return (
		<Stage
			dur={b.end}
			light={{x: 0.4, y: 0.5}}
			overlay={
				<Hud
					title="HARD STOP"
					start={b.kicks - 10}
					end={b.end + 20}
					width={440}
					note="MODEL"
					rows={[
						{label: 'TRIP', unit: 'm/s', at: () => LIFT.vTrip, decimals: 2, tone: 'line', source: 'C14'},
						{label: 'IN', unit: 'cm', at: () => 2, decimals: 0, tone: 'crimson', source: 'C14', from: b.two},
						{label: 'SLOWING', unit: 'g', at: (fr) => Math.max(0, gNeedle(fr)), decimals: 1, tone: 'crimson', source: 'C14', from: b.ten - 10},
					]}
				/>
			}
		>
			<AbsoluteFill style={{transform: `translateY(${jolt}px)`}}>
				<Svg>
					<Shaft cam={cam} st={{carY: 4.4, cwY: 8, govRot: 0, ropeTravel: 0, leverDeg: 28, wedge: 1, glowGear: on(f, b.two, 16)}} />
					{/* every person inside takes the jolt: a stress field rising from the car floor */}
					<defs>
						<linearGradient id="el-jolt" x1="0" y1="1" x2="0" y2="0">
							<stop offset="0" stopColor={colors.crimson} stopOpacity={0.85} />
							<stop offset="0.5" stopColor="#FFE14D" stopOpacity={0.35} />
							<stop offset="1" stopColor={colors.cyan} stopOpacity={0} />
						</linearGradient>
					</defs>
					<rect x={fx} y={fy - 2.0 * cam.s} width={fx2 - fx} height={2.0 * cam.s} fill="url(#el-jolt)" opacity={field} />
					{/* the dial */}
					<g opacity={on(f, b.kicks, 20)}>
						<circle cx={dx} cy={dy} r={R} fill="rgba(7,10,15,0.85)" stroke={colors.sub} strokeWidth={2} />
						{Array.from({length: 13}, (_, i) => (
							<g key={i}>
								<line x1={dx + Math.cos(ang(i)) * (R - 26)} y1={dy + Math.sin(ang(i)) * (R - 26)} x2={dx + Math.cos(ang(i)) * R} y2={dy + Math.sin(ang(i)) * R} stroke={i >= 2 ? colors.crimson : colors.sub} strokeWidth={i % 2 ? 2 : 3} />
							</g>
						))}
						<path d={`M ${dx + Math.cos(ang(0.2)) * (R - 8)} ${dy + Math.sin(ang(0.2)) * (R - 8)} A ${R - 8} ${R - 8} 0 0 1 ${dx + Math.cos(ang(1)) * (R - 8)} ${dy + Math.sin(ang(1)) * (R - 8)}`} fill="none" stroke={colors.emerald} strokeWidth={10} />
						<line x1={dx} y1={dy} x2={dx + Math.cos(needle) * (R - 30)} y2={dy + Math.sin(needle) * (R - 30)} stroke={colors.crimson} strokeWidth={6} strokeLinecap="round" style={{filter: `drop-shadow(0 0 8px ${colors.crimson})`}} />
						<circle cx={dx} cy={dy} r={12} fill={colors.crimson} />
					</g>
				</Svg>
				<Label x={dx} y={dy + 70} size={56} color={colors.crimson} weight={700} align="center" opacity={on(f, b.ten + 10, 12)}>
					10 g
				</Label>
				<Label x={dx} y={dy + R + 24} size={36} color={colors.sub} align="center" opacity={on(f, b.kicks, 20)}>
					SLOWING, IN g
				</Label>
				<Label x={150} y={150} size={44} color={colors.line} weight={700} opacity={Math.min(on(f, b.kicks + 10, 14), off(f, b.ten, 16))}>
					2 m/s
				</Label>
				<Label x={150} y={210} size={44} color={colors.crimson} weight={700} opacity={Math.min(on(f, b.two + 10, 14), off(f, b.ten, 16))}>
					→ 0 IN 2 cm
				</Label>
				<Label x={150} y={150} size={44} color={colors.crimson} weight={700} opacity={on(f, b.every + 4, 14)}>
					EVERY PERSON INSIDE
				</Label>
				<Tag x={96} y={970}>MODEL · ILLUSTRATION</Tag>
			</AbsoluteFill>
		</Stage>
	);
};
export const tooHardCues = (): SfxCue[] => {
	const b = b09();
	return [
		{frame: b.kicks, sfx: 'quartz_tick', gainDb: -16},
		{frame: b.two, sfx: 'pen_scratch', gainDb: -16},
		{frame: b.ten + 12, sfx: 'metal_snap_sub', gainDb: -8},
	];
};

// ---------------- s10: Otis, 1854 (after US Patent 31,128) ----------------
const b10 = () => ({
	first: at('s10', 'The first famous safety'),
	otis: at('s10', 'In eighteen fifty-four'),
	cut: at('s10', 'had its rope cut'),
	springs: at('s10', 'Springs threw hooks'),
	slow: at('s10', 'On a slow machine'),
	allowed: at('s10', 'That kind of grab'),
	only: at('s10', 'But only on slow'),
	sixty: at('s10', 'Sixty-three centimeters'),
	end: span('s10').dur,
});

export const Otis: React.FC = () => {
	const f = useCurrentFrame();
	const b = b10();
	// the platform hangs on its rope; cut, it drops a little until the pawls bite the racks, then holds
	const cutF = b.cut + 20;
	const cut = f >= cutF;
	const fallT = Math.max(0, (f - cutF) / 60);
	const fall = Math.min(46, 0.5 * 9.8 * fallT * fallT * 260);
	const pawl = cut ? Math.min(1, fallT * 5) : 0;
	const px = 640;
	const py = 470 + fall + shudder(f, 60, cutF + 14, 7, 10);
	const fade = off(f, b.allowed + 10, 30) * 0.85 + 0.15;
	const dialO = on(f, b.allowed, 20);
	const dial = (v: number) => Math.PI * (0.8 + (1.4 * v) / 3);
	const drawing = pen(f, b.first, 90);
	const needle = dial(tween(f, b.only, b.sixty + 30, 0, 0.63, ease.camera));
	const W2 = 290;
	return (
		<Stage dur={b.end} light={{x: 0.35, y: 0.45}}>
			<AbsoluteFill>
				<Svg opacity={fade}>
					{/* two guide posts with racks of teeth facing in */}
					{[px - W2 - 30, px + W2 + 30].map((x, i) => (
						<g key={x}>
							<rect x={x - 20} y={80} width={40} height={900} fill="#141E2C" stroke={colors.line} strokeWidth={3} pathLength={1} strokeDasharray={`${drawing} 1`} />
							{Array.from({length: 22}, (_, j) => (
								<polygon key={j} points={`${x + (i ? -20 : 20)},${110 + j * 40} ${x + (i ? -46 : 46)},${130 + j * 40} ${x + (i ? -20 : 20)},${144 + j * 40}`} fill="#2A3544" stroke={colors.line} strokeWidth={2} opacity={drawing} />
							))}
						</g>
					))}
					{/* the rope, and its cut */}
					<line x1={px} y1={20} x2={px} y2={cut ? 150 : py - 90} stroke={cut ? colors.crimson : colors.line} strokeWidth={6} />
					{cut ? <line x1={px} y1={py - 90 - 60} x2={px} y2={py - 90} stroke={colors.crimson} strokeWidth={6} /> : null}
					{/* the wagon spring over the platform: bowed while the rope pulls, flattening when it lets go */}
					<path d={`M ${px - W2} ${py - 50} Q ${px} ${py - 50 - 80 * (1 - pawl)} ${px + W2} ${py - 50}`} fill="none" stroke={colors.cyan} strokeWidth={7} />
					<line x1={px} y1={py - 90} x2={px} y2={py - 50 - 40 * (1 - pawl)} stroke={colors.line} strokeWidth={4} />
					{/* the pawls at the spring's ends swing out into the teeth */}
					{[-1, 1].map((sd) => (
						<line key={sd} x1={px + sd * (W2 - 10)} y1={py - 50} x2={px + sd * (W2 + 8 + 36 * pawl)} y2={py - 60 + 22 * pawl} stroke={pawl > 0.5 ? colors.amber : colors.line} strokeWidth={12} strokeLinecap="round" style={pawl > 0.5 ? {filter: `drop-shadow(0 0 10px ${colors.amber})`} : undefined} />
					))}
					<rect x={px - W2} y={py - 50} width={W2 * 2} height={170} fill="#121B27" stroke={colors.line} strokeWidth={3} />
					<line x1={px - W2} y1={py + 120} x2={px + W2} y2={py + 120} stroke={colors.line} strokeWidth={8} />
				</Svg>
				<Svg opacity={dialO}>
					<circle cx={1450} cy={620} r={220} fill="rgba(7,10,15,0.85)" stroke={colors.sub} strokeWidth={2} />
					<path d={`M ${1450 + Math.cos(dial(0)) * 200} ${620 + Math.sin(dial(0)) * 200} A 200 200 0 0 1 ${1450 + Math.cos(dial(0.63)) * 200} ${620 + Math.sin(dial(0.63)) * 200}`} fill="none" stroke={colors.emerald} strokeWidth={16} />
					<path d={`M ${1450 + Math.cos(dial(0.63)) * 200} ${620 + Math.sin(dial(0.63)) * 200} A 200 200 0 0 1 ${1450 + Math.cos(dial(3)) * 200} ${620 + Math.sin(dial(3)) * 200}`} fill="none" stroke={colors.crimson} strokeWidth={6} opacity={0.7} />
					{[0, 1, 2, 3].map((v) => (
						<line key={v} x1={1450 + Math.cos(dial(v)) * 180} y1={620 + Math.sin(dial(v)) * 180} x2={1450 + Math.cos(dial(v)) * 220} y2={620 + Math.sin(dial(v)) * 220} stroke={colors.sub} strokeWidth={3} />
					))}
					<line x1={1450} y1={620} x2={1450 + Math.cos(needle) * 170} y2={620 + Math.sin(needle) * 170} stroke={colors.emerald} strokeWidth={7} strokeLinecap="round" />
					<circle cx={1450} cy={620} r={12} fill={colors.emerald} />
				</Svg>
				<Label x={1080} y={150} size={44} color={colors.line} weight={700} opacity={Math.min(on(f, b.otis, 14), off(f, b.allowed, 20))}>
					1854 · NEW YORK
				</Label>
				<Label x={1080} y={210} size={36} color={colors.sub} opacity={Math.min(on(f, b.otis + 30, 14), off(f, b.allowed, 20))}>
					ELISHA OTIS
				</Label>
				<Callout x={px + W2 + 30} y={py - 40} lx={1150} ly={py + 60} text="HOOKS INTO TEETH" color={colors.amber} t={Math.min(on(f, b.springs + 20, 26), off(f, b.allowed, 20))} sub="THROWN BY A SPRING" />
				<Label x={1450} y={330} size={36} color={colors.sub} align="center" opacity={dialO}>
					INSTANT GRAB ALLOWED
				</Label>
				<Label x={1450} y={860} size={48} color={colors.emerald} weight={700} align="center" opacity={on(f, b.sixty, 14)}>
					UP TO 0.63 m/s
				</Label>
				<Tag x={96} y={970} opacity={off(f, b.end - 10, 20)}>
					ILLUSTRATION · AFTER US PATENT 31,128 (1861)
				</Tag>
			</AbsoluteFill>
		</Stage>
	);
};
export const otisCues = (): SfxCue[] => {
	const b = b10();
	return [
		{frame: b.first, sfx: 'pen_scratch', gainDb: -14},
		{frame: b.cut + 20, sfx: 'metal_snap_sub', gainDb: -10},
		{frame: b.cut + 34, sfx: 'metal_jam_sub', gainDb: -10},
		{frame: b.allowed, sfx: 'relay_click', gainDb: -16},
	];
};

// ---------------- s11: the window, and twice your weight ----------------
const b11 = () => ({
	faster: at('s11', 'And on anything faster'),
	rules: at('s11', 'The rules ask for'),
	steady: at('s11', 'Slow down steadily'),
	gently: at('s11', 'Not too gently'),
	avg: at('s11', 'On average, somewhere'),
	feel: at('s11', 'And what does that feel'),
	twice: at('s11', 'about twice your own weight'),
	end: span('s11').dur,
});

export const Window: React.FC = () => {
	const f = useCurrentFrame();
	const b = b11();
	// a vertical g scale from 0 to 11 g, the allowed band 0.2–1 g in emerald, 10.2 g in crimson far above
	const x = 780;
	const y0 = 920;
	const y1 = 140;
	const gy = (g: number) => y0 - ((y0 - y1) * g) / 11;
	const band = on(f, b.avg, 20);
	const scale = tween(f, b.feel, b.twice + 40, 1, 2, ease.camera);
	return (
		<Stage
			dur={b.end}
			light={{x: 0.45, y: 0.5}}
			overlay={
				<Hud
					title="THE RULE"
					start={b.avg - 10}
					end={b.end + 20}
					width={460}
					note="EN 81-20 · 5.6.2.1.3"
					rows={[
						{label: 'AVG SLOWING', unit: 'g', at: () => 0.2, decimals: 1, tone: 'emerald', source: 'C18'},
						{label: 'TO', unit: 'g', at: () => 1.0, decimals: 1, tone: 'emerald', source: 'C18'},
						{label: 'YOU FEEL', unit: '× weight', at: () => scale, decimals: 1, tone: 'amber', source: 'C18', from: b.feel},
					]}
				/>
			}
		>
			<AbsoluteFill>
				<Svg>
					<line x1={x} y1={y0} x2={x} y2={y1} stroke={colors.sub} strokeWidth={3} />
					{Array.from({length: 12}, (_, g) => (
						<line key={g} x1={x - 16} y1={gy(g)} x2={x + 16} y2={gy(g)} stroke={colors.sub} strokeWidth={2} />
					))}
					<rect x={x - 40} y={gy(1)} width={80} height={gy(0.2) - gy(1)} fill={colors.emerald} opacity={0.75 * band} style={{filter: `drop-shadow(0 0 10px ${colors.emerald})`}} />
					<line x1={x - 50} y1={gy(10.2)} x2={x + 50} y2={gy(10.2)} stroke={colors.crimson} strokeWidth={6} opacity={on(f, b.faster, 20)} />
					<Dim x1={x + 90} y1={gy(0)} x2={x + 90} y2={gy(0.2)} color={colors.sub} draw={on(f, b.gently, 20)} tick={8} />
					{/* twice your weight: a scale under a standing figure (outline only) */}
					<g opacity={on(f, b.feel, 20)} transform="translate(0 50)">
						<rect x={1460} y={820} width={260} height={40} rx={8} fill="#141E2C" stroke={colors.line} strokeWidth={2.5} />
						<circle cx={1590} cy={470} r={34} fill="none" stroke={colors.line} strokeWidth={3} />
						<path d={`M 1590 504 L 1590 680 M 1590 540 L 1530 620 M 1590 540 L 1650 620 M 1590 680 L 1550 815 M 1590 680 L 1630 815`} fill="none" stroke={colors.line} strokeWidth={4} strokeLinecap="round" />
						{[0, 1, 2].map((i) => (
							<Arrow key={i} x1={1500 + i * 90} y1={700} x2={1500 + i * 90} y2={700 + 60 * (scale - 1) + 40} color={colors.amber} width={5} grow={on(f, b.twice - 10, 20)} />
						))}
					</g>
				</Svg>
				<Label x={x + 70} y={gy(1) - 22} size={36} color={colors.emerald} weight={600} opacity={band}>
					1 g · NOT TOO HARD
				</Label>
				<Label x={x + 120} y={gy(0.2) - 6} size={36} color={colors.emerald} weight={600} opacity={on(f, b.gently, 16)}>
					0.2 g · NOT TOO GENTLY
				</Label>
				<Label x={x + 70} y={gy(10.2) - 22} size={36} color={colors.crimson} weight={600} opacity={on(f, b.faster, 20)}>
					10 g · THE GRAB
				</Label>
				<Label x={150} y={150} size={44} color={colors.line} weight={700} opacity={Math.min(on(f, b.steady, 14), off(f, b.feel, 20))}>
					SLOW DOWN STEADILY
				</Label>
				<Label x={1590} y={930} size={48} color={colors.amber} weight={700} align="center" opacity={on(f, b.twice, 14)}>
					≈ 2 × YOUR WEIGHT
				</Label>
				<Label x={1590} y={990} size={26} color={colors.sub} align="center" opacity={on(f, b.twice + 20, 14)}>
					AT 1 g: GRAVITY + BRAKING · FOR A MOMENT
				</Label>
				<Tag x={96} y={970} opacity={off(f, b.end - 10, 20)}>
					AVERAGE OVER THE STOP
				</Tag>
			</AbsoluteFill>
		</Stage>
	);
};
export const windowCues = (): SfxCue[] => {
	const b = b11();
	return [
		{frame: b.rules, sfx: 'relay_click', gainDb: -16},
		{frame: b.avg, sfx: 'glass_tone', gainDb: -14},
		{frame: b.twice, sfx: 'torque_whine', gainDb: -18},
	];
};

// keep lin imported for future kinematics in this file
void lin;
