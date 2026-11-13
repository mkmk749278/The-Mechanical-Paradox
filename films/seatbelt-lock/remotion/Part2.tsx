import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {colors, feaRamp} from '../../../lib/remotion/brand';
import {Hud} from '../../../lib/remotion/Hud';
import {Arrow, Callout, Label, off, on, pen, Stage, Svg, Tag} from '../../../lib/remotion/kit';
import {ease, shudder, tween} from '../../../lib/remotion/motion';
import {SfxCue} from '../../../lib/remotion/sfx';
import {Cabin, PILLAR, shoulder} from './Cabin';
import {FPS, LIMIT_KN} from './model';
import {Reel, ReelState} from './Reel';
import {at, span} from './scenes';

// s05–s10: a lock that is too good (the catch, as an event: the chest field); two fixes (the chip after all: the
// pretensioner; the bar built to twist: signature 3, the load limiter; Renault's four kilonewtons and the airbag);
// the price (travel, the balance, three moves); one last mystery (the child-seat mode); the landing.

const feaAt = (t: number): string => {
	const x = Math.max(0, Math.min(0.999, t)) * (feaRamp.length - 2);
	return feaRamp[Math.floor(x) + 1];
};

const Axes: React.FC<{x: number; y: number; w: number; h: number; t: number}> = ({x, y, w, h, t}) => (
	<g opacity={t} stroke={colors.line} strokeWidth={2.5} fill="none">
		<line x1={x} y1={y} x2={x} y2={y + h} />
		<line x1={x} y1={y + h} x2={x + w} y2={y + h} />
	</g>
);

// ======================= s05: a lock that is too good =======================
const b05 = () => ({
	works: at('s05', 'So the lock works'),
	problem: at('s05', 'And that is the new problem'),
	once: at('s05', 'Once the belt locks'),
	lands: at('s05', 'all of that lands'),
	crumples: at('s05', 'The front of the car crumples'),
	barely: at('s05', 'The belt barely gives'),
	hold: at('s05', "It's built to hold"),
	chests: at('s05', 'And chests can break'),
	older: at('s05', 'In bad crashes'),
	saved: at('s05', 'The belt that saved them'),
	end: span('s05').dur,
});

export const TooGood: React.FC = () => {
	const f = useCurrentFrame();
	const b = b05();
	const crash = tween(f, b.once, b.lands + 40, 0, 1, ease.camera);
	const crumple = tween(f, b.crumples, b.crumples + 60, 0, 1, ease.arrive);
	const chest = tween(f, b.lands, b.barely + 30, 0, 1, ease.camera);
	const surge = 22 * crash + shudder(f, FPS, b.once + 20, 5, 4, 4);
	return (
		<Stage
			dur={b.end}
			light={{x: 0.5, y: 0.45}}
			overlay={
				<Hud
					labelSize={30}
					title="SHOULDER BELT"
					corner="bottom-right"
					start={b.once - 10}
					end={b.end}
					width={460}
					rows={[{label: 'FORCE', unit: 'kN', at: () => 9 * chest, decimals: 1, source: 'ILLUSTRATIVE', tone: 'crimson'}]}
					note="NO LIMITER"
				/>
			}
		>
			<AbsoluteFill>
				<Svg>
					<Cabin st={{pitch: 6 + 10 * crash, surge, locked: 1, crumple, chest, barrier: on(f, b.once, 10), stopAt: b.once}} />
				</Svg>
				<Label x={960} y={56} size={48} color={colors.crimson} weight={700} align="center" opacity={Math.min(on(f, b.problem, 14), off(f, b.once, 14))}>
					THE NEW PROBLEM
				</Label>
				<Callout x={1530} y={620} lx={1560} ly={950} text="CRUMPLES" sub="THE CAR GIVES" color={colors.emerald} t={Math.min(on(f, b.crumples + 10, 20), off(f, b.chests, 14))} subSize={30} />
				<Callout x={shoulder(16)[0] + 60} y={shoulder(16)[1] + 110} lx={420} ly={240} text="BARELY GIVES" sub="THE BELT HOLDS" color={colors.crimson} t={Math.min(on(f, b.barely, 20), off(f, b.chests, 14))} subSize={30} />
				<Label x={960} y={56} size={56} color={colors.crimson} weight={800} align="center" opacity={Math.min(on(f, b.chests, 10), off(f, b.end - 10, 14))}>
					{f < b.saved ? 'CHESTS CAN BREAK' : 'IT SAVES YOU. IT HURTS YOU.'}
				</Label>
				<Label x={96} y={900} size={30} color={colors.sub} opacity={Math.min(on(f, b.older, 16), off(f, b.end - 10, 14))}>
					REAL CRASHES · STAPP CAR CRASH J. 2001
				</Label>
				<Tag x={96} y={970}>
					ILLUSTRATION
				</Tag>
			</AbsoluteFill>
		</Stage>
	);
};

export const tooGoodCues = (): SfxCue[] => {
	const b = b05();
	return [
		{frame: b.once, sfx: 'metal_snap_sub', gainDb: -6},
		{frame: b.lands, sfx: 'torque_whine', gainDb: -14},
		{frame: b.crumples, sfx: 'metal_jam_sub', gainDb: -12},
		{frame: b.chests, sfx: 'transformer_rise', gainDb: -14},
	];
};

// ======================= s06: the chip after all (the pretensioner) =======================
const b06 = () => ({
	two: at('s06', 'Engineers did two things'),
	first: at('s06', 'And the first'),
	remember: at('s06', 'Remember the chip'),
	real: at('s06', "It's real"),
	job: at('s06', 'different job'),
	start: at('s06', 'At the very start'),
	charge: at('s06', 'fire a charge'),
	snaps: at('s06', 'It snaps the belt tight'),
	now: at('s06', 'Now your body starts'),
	late: at('s06', 'caught late and hard'),
	end: span('s06').dur,
});

export const ChipAfterAll: React.FC = () => {
	const f = useCurrentFrame();
	const b = b06();
	const wire = pen(f, b.start, 40);
	const flash = Math.max(0, 1 - Math.abs(f - b.charge - 14) / 10);
	const pull = tween(f, b.charge + 10, b.charge + 34, 0, 1, ease.arrive);
	const cabinA = off(f, b.now - 6, 20);
	const graphA = on(f, b.now, 20);
	return (
		<Stage
			dur={b.end}
			light={{x: 0.5, y: 0.45}}
			overlay={
				<Hud
					labelSize={30}
					title="PRETENSIONER"
					start={b.start}
					end={b.now}
					width={460}
					rows={[{label: 'SLACK', unit: 'mm', at: (fr) => 40 * (1 - tween(fr, b.charge + 10, b.charge + 34, 0, 1)), source: 'ILLUSTRATIVE', tone: 'cyan'}]}
				/>
			}
		>
			<AbsoluteFill style={{opacity: cabinA}}>
				<Svg>
					<Cabin st={{pitch: 12 - 10 * pull, reelGlow: on(f, b.start, 16) + flash}} />
					<g opacity={on(f, b.remember, 14)}>
						<rect x={1250} y={640} width={150} height={70} rx={6} fill="rgba(255,159,28,0.14)" stroke={colors.amber} strokeWidth={3} />
						<path d={`M1250 690 C 1000 900, 760 900, ${PILLAR.x + 26} ${PILLAR.reelY}`} fill="none" stroke={colors.amber} strokeWidth={5} pathLength={1} strokeDasharray={`${wire} 1`} />
					</g>
					{flash > 0.01 ? <circle cx={PILLAR.x} cy={PILLAR.reelY} r={40 + 80 * flash} fill={`rgba(255,225,77,${0.5 * flash})`} /> : null}
					<Arrow x1={shoulder(10)[0] + 60} y1={shoulder(10)[1] + 40} x2={shoulder(10)[0] - 60} y2={shoulder(10)[1] + 10} color={colors.cyan} width={7} grow={Math.min(pull, off(f, b.now, 10))} />
				</Svg>
				<Label x={1270} y={598} size={36} color={colors.amber} weight={700} opacity={on(f, b.remember, 14)}>
					CRASH SENSORS
				</Label>
				<Label x={960} y={56} size={48} color={colors.amber} weight={700} align="center" opacity={Math.min(on(f, b.real, 10), off(f, b.start, 14))}>
					{f < b.job ? 'IT’S REAL' : 'A DIFFERENT JOB'}
				</Label>
				<Callout x={PILLAR.x} y={PILLAR.reelY} lx={900} ly={960} text="SMALL CHARGE" sub="USUALLY EXPLOSIVE" color={colors.amber} t={Math.min(on(f, b.charge, 16), off(f, b.now, 12))} subSize={30} />
				<Label x={960} y={56} size={48} color={colors.cyan} weight={700} align="center" opacity={Math.min(on(f, b.snaps, 10), off(f, b.now, 14))}>
					SLACK OUT
				</Label>
				<Tag x={1824} y={970} align="right">
					ILLUSTRATION
				</Tag>
			</AbsoluteFill>
			<AbsoluteFill style={{opacity: graphA}}>
				<Svg>
					<Axes x={360} y={260} w={1200} h={520} t={1} />
					{/* caught late and hard: slack, then a spike */}
					<polyline
						points={Array.from({length: 61}, (_, i) => {
							const t = i / 60;
							const v = t < 0.35 ? 0 : Math.sin(Math.PI * Math.min(1, (t - 0.35) / 0.5)) ** 2 * 9;
							return `${360 + t * 1200},${780 - (v / 10) * 520}`;
						})
							.slice(0, Math.max(2, Math.round(61 * pen(f, b.late - 60, 50))))
							.join(' ')}
						fill="none"
						stroke={colors.crimson}
						strokeWidth={6}
						opacity={0.9}
					/>
					{/* slack out first: early and gentler */}
					<polyline
						points={Array.from({length: 61}, (_, i) => {
							const t = i / 60;
							const v = t < 0.08 ? 0 : Math.sin(Math.PI * Math.min(1, (t - 0.08) / 0.8)) ** 1.4 * 6;
							return `${360 + t * 1200},${780 - (v / 10) * 520}`;
						})
							.slice(0, Math.max(2, Math.round(61 * pen(f, b.now + 10, 70))))
							.join(' ')}
						fill="none"
						stroke={colors.emerald}
						strokeWidth={6}
					/>
				</Svg>
				<Label x={360} y={200} size={30} color={colors.sub}>
					FORCE ON YOU
				</Label>
				<Label x={1560} y={800} size={30} color={colors.sub} align="right">
					TIME IN THE CRASH
				</Label>
				<Label x={720} y={330} size={36} color={colors.emerald} weight={700} opacity={on(f, b.now + 60, 16)}>
					SOONER, GENTLER
				</Label>
				<Label x={1120} y={290} size={36} color={colors.crimson} weight={700} opacity={on(f, b.late - 10, 16)}>
					LATE AND HARD
				</Label>
				<Tag x={1824} y={970} align="right">
					ILLUSTRATIVE VALUES
				</Tag>
			</AbsoluteFill>
		</Stage>
	);
};

export const chipCues = (): SfxCue[] => {
	const b = b06();
	return [
		{frame: b.remember, sfx: 'glass_tone', gainDb: -14},
		{frame: b.charge + 14, sfx: 'metal_snap_sub', gainDb: -8},
		{frame: b.snaps, sfx: 'whoosh', gainDb: -12},
		{frame: b.now + 10, sfx: 'pen_scratch', gainDb: -16},
	];
};

// ======================= s07: the bar built to twist (signature 3) =======================
const b07 = () => ({
	second: at('s07', 'And the second fix'),
	wrong: at('s07', 'It sounds wrong'),
	inside: at('s07', 'Inside the reel sits a steel bar'),
	small: at('s07', 'In a small crash'),
	limit: at('s07', 'reaches a set limit'),
	turn: at('s07', 'Now the reel can turn'),
	letsOut: at('s07', 'The belt lets out'),
	climbing: at('s07', 'stops climbing'),
	called: at('s07', "It's called a load limiter"),
	renault: at('s07', 'One carmaker, Renault'),
	four: at('s07', 'four kilo-newtons'),
	adults: at('s07', 'five adults'),
	airbag: at('s07', 'And it added an airbag'),
	together: at('s07', 'With the two together'),
	quarters: at('s07', 'three quarters fewer'),
	end: span('s07').dur,
});

/** The reel in side section: the spool on a torsion bar, locked at one end; the bar twisting is the give. */
const SideReel: React.FC<{x: number; y: number; twist: number; locked: boolean; turn: number}> = ({x, y, twist, locked, turn}) => {
	const L = 760;
	const R = 150;
	const marks = 9;
	return (
		<g>
			{/* the locking end, fixed to the frame's teeth */}
			<rect x={x - 40} y={y - R - 30} width={40} height={2 * R + 60} fill="rgba(106,123,140,0.35)" stroke={locked ? colors.crimson : colors.line} strokeWidth={4} />
			{/* the torsion bar running through the spool, its FEA field */}
			<defs>
				<linearGradient id="barFea" x1="0" x2="1" y1="0" y2="0">
					<stop offset="0%" stopColor={twist > 0.05 ? feaAt(twist) : feaRamp[0]} />
					<stop offset="100%" stopColor={twist > 0.05 ? feaAt(twist * 0.7) : feaRamp[0]} />
				</linearGradient>
			</defs>
			<rect x={x} y={y - 26} width={L} height={52} rx={10} fill="url(#barFea)" stroke={colors.line} strokeWidth={3} />
			{/* twist lines along the bar: straight when unloaded, a helix when twisting */}
			{Array.from({length: marks}).map((_, i) => {
				const u = i / (marks - 1);
				const off = twist * 40 * u;
				return <line key={i} x1={x + u * L} y1={y - 26 + off * 0.3} x2={x + u * L + off} y2={y + 26} stroke={colors.bg} strokeWidth={4} opacity={0.6} />;
			})}
			{/* the spool, translucent, with the webbing wound on it */}
			<rect x={x + 120} y={y - R} width={L - 160} height={2 * R} rx={22} fill="rgba(0,229,255,0.10)" stroke={colors.cyan} strokeWidth={4} />
			{Array.from({length: 10}).map((_, i) => (
				<line key={i} x1={x + 140 + ((i * 60 + turn * 300) % (L - 200))} y1={y - R + 8} x2={x + 140 + ((i * 60 + turn * 300) % (L - 200))} y2={y + R - 8} stroke={colors.cyan} strokeWidth={2} opacity={0.4} />
			))}
		</g>
	);
};

export const BarScene: React.FC = () => {
	const f = useCurrentFrame();
	const b = b07();
	const twist = f < b.limit ? 0 : tween(f, b.limit, b.climbing + 30, 0, 1, ease.camera);
	const turn = twist * 1.2;
	const forceKn = (fr: number): number => {
		if (fr < b.small) return 0;
		const t = tween(fr, b.small, b.climbing, 0, 1, ease.camera);
		return Math.min(LIMIT_KN, 9 * t);
	};
	const reelA = off(f, b.four - 6, 20);
	const fiveA = Math.min(on(f, b.adults, 16), off(f, b.airbag, 16));
	const cabinA = Math.min(on(f, b.airbag, 16), off(f, b.together, 16));
	const barsA = on(f, b.together, 20);
	const bar = (x: number, h: number, color: string, label: string, t: number) => (
		<g opacity={t}>
			<rect x={x} y={820 - h} width={260} height={h} fill={color} opacity={0.85} />
			<text x={x + 130} y={880} fill={colors.line} fontSize={30} textAnchor="middle" fontFamily="JetBrains Mono, monospace">
				{label}
			</text>
		</g>
	);
	return (
		<Stage
			dur={b.end}
			light={{x: 0.5, y: 0.45}}
			overlay={
				<Hud
					labelSize={30}
					title="LOAD LIMITER"
					corner="bottom-right"
					start={b.small - 10}
					end={b.renault}
					width={460}
					rows={[
						{label: 'BELT FORCE', unit: 'kN', at: forceKn, decimals: 1, source: 'C13', tone: 'crimson'},
						{label: 'LIMIT', unit: 'kN', keys: [{frame: 0, value: LIMIT_KN}], decimals: 1, source: 'C13', tone: 'emerald', from: b.limit},
					]}
					note="RENAULT'S LOWER LIMIT · RAMP ILLUSTRATIVE"
				/>
			}
		>
			<AbsoluteFill style={{opacity: reelA}}>
				<Svg>
					<g transform={`translate(${shudder(f, FPS, b.limit, 4, 6, 4)} 0)`}>
						<SideReel x={560} y={480} twist={twist} locked={f > b.small} turn={turn} />
					</g>
					{/* the belt leaving the spool, paying out once the bar twists */}
					<rect x={1100} y={480 - 150 - 300 + 300 * 0} width={60} height={160 + 120 * twist} fill={colors.cyan} opacity={0.0} />
					<Arrow x1={1180} y1={330} x2={1180} y2={330 - 160 * twist - 20} color={colors.cyan} width={7} grow={on(f, b.letsOut, 14)} />
					{/* force trace */}
					<g opacity={on(f, b.small, 16)}>
						<Axes x={560} y={720} w={760} h={220} t={1} />
						<line x1={560} y1={940 - (LIMIT_KN / 10) * 220} x2={1320} y2={940 - (LIMIT_KN / 10) * 220} stroke={colors.emerald} strokeWidth={3} strokeDasharray="12 8" opacity={on(f, b.limit, 14)} />
						<polyline
							points={Array.from({length: 61}, (_, i) => `${560 + (i / 60) * 760},${940 - (Math.min(LIMIT_KN, 9 * (i / 60)) / 10) * 220}`)
								.slice(0, Math.max(2, Math.round(61 * tween(f, b.small, b.climbing, 0, 1))))
								.join(' ')}
							fill="none"
							stroke={colors.crimson}
							strokeWidth={6}
						/>
					</g>
				</Svg>
				<Callout x={940} y={480} lx={760} ly={230} text="STEEL BAR" sub="BUILT TO TWIST" color={colors.amber} t={Math.min(on(f, b.inside, 20), off(f, b.limit, 14))} subSize={30} />
				<Label x={500} y={310} size={30} color={colors.crimson} align="right" opacity={on(f, b.small, 16)}>
					LOCKED END
				</Label>
				<Label x={960} y={56} size={52} color={colors.emerald} weight={800} align="center" opacity={Math.min(on(f, b.called, 10), off(f, b.renault, 14))}>
					LOAD LIMITER
				</Label>
				<Label x={1330} y={940 - (LIMIT_KN / 10) * 220 - 50} size={30} color={colors.emerald} opacity={on(f, b.limit, 14)}>
					SET LIMIT
				</Label>
				<Tag x={96} y={970}>
					ILLUSTRATION · NOT TO SCALE
				</Tag>
			</AbsoluteFill>
			<AbsoluteFill style={{opacity: fiveA + on(f, b.four, 16) * off(f, b.adults, 16)}}>
				<Svg>
					{/* four kilonewtons: five adults standing on a platform that one strap holds up (outlines, no faces) */}
					<rect x={920} y={150} width={80} height={320} fill={colors.cyan} opacity={0.85} />
					<line x1={960} y1={470} x2={500} y2={760} stroke={colors.cyan} strokeWidth={8} opacity={0.6} />
					<line x1={960} y1={470} x2={1420} y2={760} stroke={colors.cyan} strokeWidth={8} opacity={0.6} />
					<rect x={480} y={760} width={960} height={28} rx={6} fill="rgba(106,123,140,0.5)" stroke={colors.line} strokeWidth={3} />
					{Array.from({length: 5}).map((_, i) => {
						const x = 580 + i * 190;
						const t = on(f, b.adults + i * 8, 14);
						return (
							<g key={i} opacity={t}>
								<circle cx={x} cy={560} r={34} fill="rgba(139,158,181,0.25)" stroke={colors.sub} strokeWidth={5} />
								<line x1={x} y1={598} x2={x} y2={680} stroke={colors.sub} strokeWidth={30} strokeLinecap="round" />
								<polyline points={`${x - 30},${760} ${x},${680} ${x + 30},${760}`} fill="none" stroke={colors.sub} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
								<polyline points={`${x - 46},${670} ${x},${612} ${x + 46},${670}`} fill="none" stroke={colors.sub} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" />
							</g>
						);
					})}
					<Arrow x1={960} y1={820} x2={960} y2={960} color={colors.crimson} width={8} grow={on(f, b.adults + 40, 16)} />
				</Svg>
				<Label x={960} y={56} size={56} color={colors.emerald} weight={800} align="center">
					4 kN
				</Label>
				<Label x={960} y={140} size={36} color={colors.sub} align="center" opacity={on(f, b.adults, 14)}>
					≈ FIVE ADULTS’ WEIGHT · ABOUT 400 kg · MODEL
				</Label>
			</AbsoluteFill>
			<AbsoluteFill style={{opacity: cabinA}}>
				<Svg>
					<Cabin st={{stopAt: 0, pitch: 22, surge: 30, locked: 1, airbag: tween(f, b.airbag, b.airbag + 20, 0, 1, ease.arrive), chest: 0.45, barrier: 1}} />
				</Svg>
				<Label x={960} y={56} size={48} color={colors.ink} weight={700} align="center">
					+ AN AIRBAG TO CATCH YOU
				</Label>
				<Tag x={96} y={970}>
					ILLUSTRATION
				</Tag>
			</AbsoluteFill>
			<AbsoluteFill style={{opacity: barsA}}>
				<Svg>
					<line x1={480} y1={820} x2={1440} y2={820} stroke={colors.line} strokeWidth={3} />
					{bar(560, 520, colors.crimson, 'STIFFER OR NONE', 1)}
					{bar(1100, 520 * 0.2 * tween(f, b.together + 20, b.together + 60, 0, 1, ease.arrive), colors.emerald, '4 kN + AIRBAG', on(f, b.together + 20, 16))}
				</Svg>
				<Label x={960} y={56} size={44} color={colors.ink} weight={700} align="center">
					SERIOUS CHEST INJURIES (AIS 3+)
				</Label>
				<Label x={1230} y={540} size={64} color={colors.emerald} weight={800} align="center" opacity={on(f, b.quarters, 14)}>
					−75 TO 85%
				</Label>
				<Label x={960} y={930} size={30} color={colors.sub} align="center" opacity={on(f, b.together, 14)}>
					347 REAL CRASHES · STAPP CAR CRASH J. 2001 · BARS NOT TO SCALE
				</Label>
			</AbsoluteFill>
		</Stage>
	);
};

export const barCues = (): SfxCue[] => {
	const b = b07();
	return [
		{frame: b.inside, sfx: 'glass_tone', gainDb: -14},
		{frame: b.small, sfx: 'metal_jam_sub', gainDb: -10},
		{frame: b.limit, sfx: 'torque_whine', gainDb: -10},
		{frame: b.letsOut, sfx: 'flow_sweep', gainDb: -14},
		{frame: b.four, sfx: 'typewriter', gainDb: -12},
		{frame: b.airbag, sfx: 'whoosh', gainDb: -10},
		{frame: b.quarters, sfx: 'quartz_tick', gainDb: -12},
	];
};

// ======================= s08: the price =======================
const b08 = () => ({
	cost: at('s08', 'But what does letting go cost'),
	every: at('s08', 'Every bit of belt'),
	why: at('s08', "That's why the softer limit"),
	worry: at('s08', 'And engineers worry'),
	where: at('s08', 'Where do you set the limit'),
	high: at('s08', 'Too high'),
	low: at('s08', 'Too low'),
	choice: at('s08', 'Every limit is a choice'),
	three: at('s08', 'So in a hard crash'),
	pull: at('s08', 'Pull tight'),
	lock: at('s08', 'Lock', 'Pull tight'),
	letgo: at('s08', 'Then let go, just enough'),
	end: span('s08').dur,
});

export const Price: React.FC = () => {
	const f = useCurrentFrame();
	const b = b08();
	const travel = tween(f, b.every, b.every + 70, 0, 110, ease.camera);
	const tallA = on(f, b.worry, 16);
	const cabinA = off(f, b.where, 16);
	const beamA = Math.min(on(f, b.where, 16), off(f, b.three, 16));
	const tiltDeg = f < b.high ? 0 : f < b.low ? tween(f, b.high, b.high + 30, 0, -14, ease.arrive) : f < b.choice ? tween(f, b.low, b.low + 30, -14, 14, ease.arrive) : tween(f, b.choice, b.choice + 40, 14, 0, ease.camera);
	const replayA = on(f, b.three, 16);
	const step = f < b.pull ? 0 : f < b.lock ? 1 : f < b.letgo ? 2 : 3;
	return (
		<Stage dur={b.end} light={{x: 0.5, y: 0.45}}>
			<AbsoluteFill style={{opacity: cabinA}}>
				<Svg>
					<Cabin st={{stopAt: 0, pitch: 10 + travel * 0.12, surge: travel, locked: 1, airbag: on(f, b.why, 20), big: 1 + 0.12 * tallA, barrier: 1}} />
					<line x1={1290} y1={420} x2={1290} y2={660} stroke={colors.amber} strokeWidth={4} strokeDasharray="12 8" opacity={tallA} />
				</Svg>
				<Label x={960} y={56} size={48} color={colors.amber} weight={700} align="center" opacity={Math.min(on(f, b.every, 14), off(f, b.where, 14))}>
					{f < b.worry ? 'MORE GIVE, MORE TRAVEL' : 'TALL OR HEAVY: TOO FAR?'}
				</Label>
				<Tag x={96} y={970}>
					ILLUSTRATION
				</Tag>
			</AbsoluteFill>
			<AbsoluteFill style={{opacity: beamA}}>
				<Svg>
					<polygon points="960,700 920,780 1000,780" fill={colors.metal} />
					<g transform={`rotate(${tiltDeg} 960 700)`}>
						<line x1={520} y1={700} x2={1400} y2={700} stroke={colors.emerald} strokeWidth={10} strokeLinecap="round" />
						<rect x={480} y={600} width={160} height={100} fill="rgba(255,59,48,0.2)" stroke={colors.crimson} strokeWidth={4} />
						<rect x={1280} y={600} width={160} height={100} fill="rgba(255,159,28,0.2)" stroke={colors.amber} strokeWidth={4} />
					</g>
				</Svg>
				<Label x={560} y={520} size={36} color={colors.crimson} weight={700} align="center">
					CHEST FORCE
				</Label>
				<Label x={1360} y={520} size={36} color={colors.amber} weight={700} align="center">
					TRAVEL
				</Label>
				<Label x={960} y={56} size={48} color={colors.emerald} weight={700} align="center" opacity={on(f, b.choice, 14)}>
					A CHOICE BETWEEN THE TWO
				</Label>
			</AbsoluteFill>
			<AbsoluteFill style={{opacity: replayA}}>
				<Svg>
					<Cabin st={{stopAt: b.pull, pitch: step >= 3 ? 18 : step >= 1 ? 4 : 10, surge: step >= 3 ? 40 : 0, locked: step >= 2 ? 1 : 0, barrier: 1}} />
				</Svg>
				{(['PULL TIGHT', 'LOCK', 'LET GO, JUST ENOUGH'] as const).map((t, i) => (
					<Label key={t} x={400 + i * 560} y={56} size={44} color={[colors.cyan, colors.crimson, colors.emerald][i]} weight={800} align="center" opacity={step > i ? 1 : 0.18}>
						{t}
					</Label>
				))}
				<Tag x={96} y={970}>
					ILLUSTRATION
				</Tag>
			</AbsoluteFill>
		</Stage>
	);
};

export const priceCues = (): SfxCue[] => {
	const b = b08();
	return [
		{frame: b.every, sfx: 'whoosh', gainDb: -14},
		{frame: b.high, sfx: 'relay_click', gainDb: -14},
		{frame: b.low, sfx: 'relay_click', gainDb: -14},
		{frame: b.pull, sfx: 'metal_snap_sub', gainDb: -10},
		{frame: b.lock, sfx: 'metal_jam_sub', gainDb: -8},
		{frame: b.letgo, sfx: 'torque_whine', gainDb: -12},
	];
};

// ======================= s09: one last mystery (the child-seat mode) =======================
const b09 = () => ({
	ever: at('s09', 'Ever pulled your belt'),
	broken: at('s09', "It's not broken"),
	mode: at('s09', 'child-seat mode'),
	every: at('s09', 'Pull out every bit'),
	wind: at('s09', 'let it wind back'),
	only: at('s09', 'it can only wind in'),
	normal: at('s09', "it's normal again"),
	end: span('s09').dur,
});

export const ChildSeat: React.FC = () => {
	const f = useCurrentFrame();
	const b = b09();
	// the webbing on the spool: nearly all out, then winding back in steps (clicks)
	const out = tween(f, b.every, b.wind, 0, 1, ease.camera);
	const back = f < b.wind ? 0 : Math.floor(tween(f, b.wind, b.normal + 40, 0, 7, (t) => t)) / 7;
	const alr = f >= b.wind && f < b.normal + 30;
	const reel = 3 * out - 3 * back;
	const st: ReelState = {reel, disc: reel, arm: 0, show: {teeth: 1, spool: 1, hook: alr ? 1 : on(f, b.mode, 16) * 0}, hook: alr ? (Math.floor((f - b.wind) / 18) % 2 === 0 ? 1 : 0.6) : 0, tail: 380};
	return (
		<Stage dur={b.end} light={{x: 0.5, y: 0.45}}>
			<AbsoluteFill>
				<Svg>
					<Reel cx={960} cy={600} s={7.6} st={st} />
				</Svg>
				<Label x={960} y={56} size={48} color={colors.amber} weight={700} align="center" opacity={Math.min(on(f, b.broken, 14), off(f, b.end - 10, 14))}>
					{f < b.mode ? 'NOT BROKEN' : f < b.normal ? 'CHILD-SEAT MODE: ONLY WINDS IN' : 'ALL THE WAY IN: NORMAL AGAIN'}
				</Label>
				<Callout x={960 - 330} y={600 - 250} lx={1340} ly={250} text="SECOND PAWL" sub="DROPS AT EVERY STOP" color={colors.amber} t={Math.min(on(f, b.only, 16), off(f, b.normal, 14))} subSize={30} />
				<Tag x={96} y={970}>
					ILLUSTRATION
				</Tag>
			</AbsoluteFill>
		</Stage>
	);
};

export const childSeatCues = (): SfxCue[] => {
	const b = b09();
	return [
		{frame: b.ever, sfx: 'whoosh', gainDb: -16},
		{frame: b.wind, sfx: 'relay_click', gainDb: -10},
		{frame: b.wind + 18, sfx: 'relay_click', gainDb: -12},
		{frame: b.wind + 36, sfx: 'relay_click', gainDb: -12},
		{frame: b.normal, sfx: 'glass_tone', gainDb: -16},
	];
};

// ======================= s10: the landing =======================
const b10 = () => ({
	want: at('s10', 'Want to feel it yourself'),
	slowly: at('s10', 'pull it slowly'),
	sharp: at('s10', 'one sharp tug'),
	disc: at('s10', 'A disc that got left behind'),
	bar: at('s10', 'a steel bar waits'),
	hold: at('s10', 'to hold you'),
	next: at('s10', 'Next: the plane wing'),
	end: span('s10').dur,
});

export const Landing: React.FC = () => {
	const f = useCurrentFrame();
	const b = b10();
	const glowDisc = on(f, b.disc, 20);
	// the sharp tug, drawn: the reel jumps and locks on "stop"
	const tug = f < b.sharp ? 0 : tween(f, b.sharp, b.sharp + 30, 0, 0.25, ease.arrive);
	const tugLocked = f >= b.sharp + 30;
	const glowBar = on(f, b.bar, 20);
	const pushK = tween(f, b.disc, b.end, 1, 1.12, ease.camera);
	return (
		<Stage dur={b.end} light={{x: 0.5, y: 0.45}}>
			<AbsoluteFill style={{opacity: on(f, b.sharp - 10, 16)}}>
				<Svg>
					<g transform={`translate(${960 + shudder(f, FPS, b.sharp + 30, 6, 8, 6)} 560) scale(${pushK}) translate(-960 -560)`}>
						<Reel cx={960} cy={560} s={8} st={{reel: tug, disc: tug * 0.7, arm: tugLocked ? 1 : 0, glow: glowDisc, twist: 0.4 * glowBar, show: {teeth: 1, spool: 1, disc: glowDisc, arm: Math.max(glowDisc, tugLocked ? 1 : 0), bar: glowBar}, tail: 400}} />
					</g>
				</Svg>
				<Label x={960} y={980} size={40} color={colors.sub} align="center" opacity={on(f, b.next, 16)}>
					NEXT: THE PLANE WING THAT IS BUILT TO BEND
				</Label>
				<Tag x={96} y={970} opacity={off(f, b.next, 14)}>
					ILLUSTRATION
				</Tag>
			</AbsoluteFill>
		</Stage>
	);
};

export const landingCues = (): SfxCue[] => {
	const b = b10();
	return [
		{frame: b.sharp + 30, sfx: 'metal_jam_sub', gainDb: -8},
		{frame: b.disc, sfx: 'glass_tone', gainDb: -14},
		{frame: b.bar, sfx: 'torque_whine', gainDb: -20},
		{frame: b.next, sfx: 'whoosh', gainDb: -18},
	];
};
