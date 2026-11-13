import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {colors} from '../../../lib/remotion/brand';
import {Hud} from '../../../lib/remotion/Hud';
import {Arrow, Callout, Label, lin, off, on, pen, Stage, Svg, Tag} from '../../../lib/remotion/kit';
import {ease, shudder, tween} from '../../../lib/remotion/motion';
import {SfxCue} from '../../../lib/remotion/sfx';
import {Cabin, PILLAR, shoulder} from './Cabin';
import {ballThresholdG, FPS, jerkPull, LOCK_LAG, simulatePull, slowPull, spoolRadius} from './model';
import {armGeom, ballPos, Reel, ReelState} from './Reel';
import {at, endOf, span} from './scenes';

// s01–s04: the cold open (phone vs crash; the chip nobody needs; the stakes; the dive into the reel), the lock that
// can't tell, the disc that falls behind (signature 1), the ball that keeps going (signature 2) and the rules.

const RX = 960;
const RY = 580;
const RS = 8.2; // px per mm for the big reel

const reelBase = (o: Partial<ReelState> = {}): ReelState => ({reel: 0, disc: 0, arm: 0, show: {teeth: 1, spool: 1}, tail: 420, ...o});

/** Zoom the whole cabin toward a point: a camera push in SVG space. */
const Zoom: React.FC<{k: number; x: number; y: number; children: React.ReactNode}> = ({k, x, y, children}) => (
	<g transform={`translate(${x} ${y}) scale(${k}) translate(${-x} ${-y})`}>{children}</g>
);

// ======================= s01: cold open =======================
const b01 = () => ({
	phone: at('s01', 'reaching for your phone'),
	crash: at('s01', 'crashing'),
	chip: at('s01', 'So where is the chip'),
	guess: at('s01', 'You would probably guess'),
	need: at('s01', "doesn't need one"),
	slowly: at('s01', 'Pull the belt slowly'),
	jerk: at('s01', 'Jerk it'),
	right: at('s01', 'And it has to be right'),
	tug: at('s01', 'Lock on every tug'),
	late: at('s01', 'Lock a moment too late'),
	how: at('s01', 'So how does a seatbelt know'),
	power: at('s01', 'with no power at all'),
	answer: at('s01', 'The answer is hidden'),
	hard: at('s01', 'And in a really hard crash'),
	letgo: at('s01', 'it starts to let you go'),
	purpose: at('s01', 'On purpose'),
	end: span('s01').dur,
});

export const ColdOpen: React.FC = () => {
	const f = useCurrentFrame();
	const b = b01();
	// phone reach: a slow lean from frame 0 (motion from frame 0); the crash snaps the car to a stop
	const lean = tween(f, 0, b.crash - 6, 4, 26, ease.camera);
	const crashT = f - b.crash;
	const surge = crashT >= 0 && f < b.chip + 40 ? 26 * Math.min(1, crashT / 8) + shudder(f, FPS, b.crash, 6, 5, 6) : 0;
	const lockedA = crashT >= 0 && f < b.guess ? 1 : 0;
	// stakes: lock on every tug (left), lock too late (right)
	const tugA = Math.min(on(f, b.tug, 14), off(f, b.late, 12));
	const lateA = Math.min(on(f, b.late, 14), off(f, b.how, 16));
	const lateSurge = tween(f, b.late + 30, b.late + 70, 0, 150, ease.arrive);
	// the dive into the reel
	const dive = tween(f, b.how, b.answer + 10, 1, 3.2, ease.camera);
	const cabinA = off(f, b.answer + 4, 22);
	const reelA = on(f, b.answer + 10, 22);
	// the second decision: the locked reel creeps back out
	const creep = f > b.letgo ? tween(f, b.letgo, b.purpose + 40, 0, 0.5, ease.camera) : 0;
	const reelLocked = f > b.hard + 30;
	const mainCabin = f < b.tug || f >= b.how;
	const pitchMain = f < b.crash ? lean : f < b.chip + 40 ? 26 + (surge / 26) * 8 : tween(f, b.chip + 40, b.chip + 90, 34, 6, ease.camera);
	const wire = pen(f, b.guess + 10, 50);
	const wireOff = off(f, b.slowly - 20, 16);
	const strike = pen(f, b.need, 14);
	return (
		<Stage
			dur={b.end}
			light={{x: 0.45, y: 0.5}}
			overlay={
				<Hud
					labelSize={30}
					title="BELT"
					start={b.slowly - 10}
					end={b.right}
					width={440}
					rows={[
						{label: 'PULL', unit: '', at: (fr) => (fr < b.jerk ? 1 : 2), source: 'ILLUSTRATIVE', tone: 'cyan'},
						{label: 'LOCKED', unit: '', at: (fr) => (fr < b.jerk + 12 ? 0 : 1), source: 'ILLUSTRATIVE', tone: 'crimson'},
					]}
					note="1 = SLOW · 2 = SHARP · 0/1 = NO/YES"
				/>
			}
		>
			<AbsoluteFill style={{opacity: cabinA}}>
				<Svg>
					{mainCabin ? (
						<Zoom k={dive} x={PILLAR.x} y={PILLAR.reelY}>
							<Cabin st={{pitch: pitchMain, surge, locked: lockedA, barrier: f >= b.crash - 4 && f < b.chip + 60 ? 1 : 0, reelGlow: on(f, b.how, 20), chest: lockedA * off(f, b.crash + 8, 20)}} />
						</Zoom>
					) : null}
					{/* the wrong model: a wire from a crash sensor to the reel */}
					<g opacity={Math.min(on(f, b.guess, 12), wireOff)}>
						<rect x={1250} y={640} width={150} height={70} rx={6} fill="rgba(255,159,28,0.12)" stroke={colors.amber} strokeWidth={3} />
						<path d={`M1250 690 C 1000 900, 760 900, ${PILLAR.x + 26} ${PILLAR.reelY}`} fill="none" stroke={colors.amber} strokeWidth={5} strokeDasharray="16 10" pathLength={1} style={{strokeDashoffset: 0}} opacity={wire} />
						<line x1={900} y1={780} x2={1060} y2={880} stroke={colors.crimson} strokeWidth={9} strokeLinecap="round" opacity={strike} />
						<line x1={1060} y1={780} x2={900} y2={880} stroke={colors.crimson} strokeWidth={9} strokeLinecap="round" opacity={strike} />
					</g>
					{/* the stakes, two small cabins */}
					{!mainCabin ? (
						<>
							<g opacity={tugA} transform="translate(-120 230) scale(0.62)">
								<Cabin st={{pitch: 4 + 22 * tween(f, b.tug + 10, b.tug + 50, 0, 1, ease.camera), locked: f > b.tug + 40 ? 1 : 0}} />
							</g>
							<g opacity={lateA} transform="translate(800 250) scale(0.56)">
								<Cabin st={{pitch: 6 + 30 * (lateSurge / 150), surge: lateSurge, barrier: 1}} />
							</g>
						</>
					) : null}
				</Svg>
				<Label x={1270} y={598} size={36} color={colors.amber} weight={700} opacity={Math.min(on(f, b.guess + 10, 14), wireOff)}>
					CRASH SENSOR?
				</Label>
				<Callout x={PILLAR.x} y={PILLAR.reelY - 60} lx={PILLAR.x + 260} ly={380} text="CHIP?" color={colors.amber} t={Math.min(on(f, b.chip, 20), off(f, b.guess, 14))} />
				<Label x={560} y={200} size={44} color={colors.crimson} weight={700} align="center" opacity={tugA * on(f, b.tug + 44, 12)}>
					LOCKS ON EVERY LEAN
				</Label>
				<Label x={1380} y={200} size={44} color={colors.crimson} weight={700} opacity={lateA * on(f, b.late + 60, 12)} align="center">
					JUST A STRAP
				</Label>
				<Label x={960} y={56} size={48} color={colors.ink} weight={700} align="center" opacity={Math.min(on(f, b.power, 14), off(f, b.answer, 12))}>
					NO POWER AT ALL
				</Label>
				<Tag x={96} y={970} opacity={off(f, b.answer, 14)}>
					ILLUSTRATION
				</Tag>
			</AbsoluteFill>
			<AbsoluteFill style={{opacity: reelA}}>
				<Svg>
					<Reel cx={RX} cy={RY} s={RS} st={reelBase({reel: reelLocked ? 0.8 + creep : tween(f, b.answer, b.hard + 30, 0, 0.8, ease.camera), arm: reelLocked ? 1 : 0, show: {teeth: 1, spool: 1, arm: 1, disc: 0}})} />
				</Svg>
				<Label x={960} y={960} size={44} color={colors.amber} weight={700} align="center" opacity={on(f, b.letgo + 20, 16)}>
					LOCKED… AND LETTING GO?
				</Label>
				<Tag x={96} y={970} opacity={reelA}>
					ILLUSTRATION
				</Tag>
			</AbsoluteFill>
		</Stage>
	);
};

export const coldOpenCues = (): SfxCue[] => {
	const b = b01();
	return [
		{frame: b.crash, sfx: 'metal_jam_sub', gainDb: -8},
		{frame: b.chip, sfx: 'glass_tone', gainDb: -16},
		{frame: b.need, sfx: 'relay_click', gainDb: -12},
		{frame: b.tug + 40, sfx: 'metal_jam_sub', gainDb: -16, pan: -0.5},
		{frame: b.late + 30, sfx: 'whoosh', gainDb: -12, pan: 0.5},
		{frame: b.how, sfx: 'whoosh', gainDb: -14},
		{frame: b.hard + 30, sfx: 'metal_jam_sub', gainDb: -12},
		{frame: b.letgo, sfx: 'torque_whine', gainDb: -18},
	];
};

// ======================= s02: the lock that can't tell =======================
const b02 = () => ({
	imagine: at('s02', 'Imagine the simplest lock'),
	ring: at('s02', 'A ring of teeth'),
	hook: at('s02', 'a hook that drops'),
	every: at('s02', 'That stops the belt every time'),
	problem: at('s02', "And that's the problem"),
	lean: at('s02', 'Lean over to the glovebox'),
	clever: at('s02', "The hook can't be the clever part"),
	decides: at('s02', 'What decides when to drop it'),
	clues: at('s02', 'It has only two clues'),
	sudden: at('s02', 'How suddenly the belt is pulled'),
	hard: at('s02', 'And how hard the car is stopping'),
	end: span('s02').dur,
});

export const LockCantTell: React.FC = () => {
	const f = useCurrentFrame();
	const b = b02();
	const teeth = pen(f, b.ring, 40);
	const drop1 = tween(f, b.hook + 10, b.hook + 26, 0, 1, ease.arrive);
	// every pull: the reel turns, the hook drops, it stops dead (twice: the stop, and the lean)
	const turn1 = f < b.every ? 0 : tween(f, b.every, b.every + 30, 0, 0.35, ease.camera);
	const turn2 = f < b.lean ? 0 : tween(f, b.lean, b.lean + 50, 0, 0.12, ease.camera);
	const reel = turn1 + turn2;
	const hookT = f < b.every ? drop1 * 0 : f < b.every + 20 ? 0 : 1;
	const hookFinal = f < b.lean ? hookT : f < b.lean + 30 ? 0 : 1;
	const fade = off(f, b.clues + 10, 20);
	const dials = on(f, b.clues + 20, 20);
	const dial = (cx: number, label: React.ReactNode, a: number, tone: string, t: number) => (
		<g opacity={t}>
			<circle cx={cx} cy={520} r={170} fill="rgba(13,20,32,0.8)" stroke={tone} strokeWidth={4} />
			<path d={`M${cx - 120} ${600} A 150 150 0 1 1 ${cx + 120} ${600}`} fill="none" stroke={colors.metal} strokeWidth={6} />
			<line x1={cx} y1={560} x2={cx + 130 * Math.cos(-Math.PI * 0.85 + a * Math.PI * 0.7)} y2={560 + 130 * Math.sin(-Math.PI * 0.85 + a * Math.PI * 0.7)} stroke={tone} strokeWidth={8} strokeLinecap="round" />
			{label}
		</g>
	);
	return (
		<Stage dur={b.end} light={{x: 0.5, y: 0.45}}>
			<AbsoluteFill style={{opacity: fade}}>
				<Svg>
					<g transform={`translate(${shudder(f, FPS, b.every + 20, 6)} 0)`}>
						<Reel cx={RX} cy={RY + 30} s={RS} st={reelBase({reel: reel * 6, show: {teeth, spool: 1, hook: on(f, b.hook, 16)}, hook: hookFinal || (f > b.hook && f < b.every ? drop1 : 0), tail: 380})} />
					</g>
				</Svg>
				<Callout x={RX - 420} y={RY - 180} lx={RX - 620} ly={RY - 330} text="HOOK" color={colors.amber} t={Math.min(on(f, b.hook, 20), off(f, b.clever, 14))} />
				<Callout x={RX + 330} y={RY + 230} lx={RX + 560} ly={RY + 380} text="RING OF TEETH" t={Math.min(on(f, b.ring + 20, 20), off(f, b.every, 14))} />
				<Label x={960} y={56} size={48} color={colors.crimson} weight={700} align="center" opacity={Math.min(on(f, b.every + 24, 14), off(f, b.clever, 14))}>
					{f < b.lean ? 'STOPS EVERY PULL' : 'EVEN A LEAN'}
				</Label>
				<Label x={960} y={56} size={56} color={colors.amber} weight={700} align="center" opacity={Math.min(on(f, b.decides, 14), off(f, b.clues + 10, 14))}>
					WHAT DECIDES?
				</Label>
				<Tag x={96} y={970}>
					ILLUSTRATION
				</Tag>
			</AbsoluteFill>
			<AbsoluteFill style={{opacity: dials}}>
				<Svg>
					{dial(560, null, tween(f, b.sudden, b.sudden + 40, 0, 0.85, ease.arrive), colors.amber, on(f, b.sudden - 10, 16))}
					{dial(1360, null, tween(f, b.hard, b.hard + 40, 0, 0.7, ease.arrive), colors.cyan, on(f, b.hard - 10, 16))}
				</Svg>
				<Label x={560} y={740} size={40} color={colors.amber} weight={700} align="center" opacity={on(f, b.sudden, 16)}>
					HOW SUDDENLY
				</Label>
				<Label x={560} y={792} size={32} color={colors.sub} align="center" opacity={on(f, b.sudden, 16)}>
					THE BELT IS PULLED
				</Label>
				<Label x={1360} y={740} size={40} color={colors.cyan} weight={700} align="center" opacity={on(f, b.hard, 16)}>
					HOW HARD
				</Label>
				<Label x={1360} y={792} size={32} color={colors.sub} align="center" opacity={on(f, b.hard, 16)}>
					THE CAR IS STOPPING
				</Label>
				<Label x={960} y={56} size={48} color={colors.ink} weight={700} align="center" opacity={on(f, b.clues, 14)}>
					TWO CLUES
				</Label>
			</AbsoluteFill>
		</Stage>
	);
};

export const lockCantTellCues = (): SfxCue[] => {
	const b = b02();
	return [
		{frame: b.ring, sfx: 'pen_scratch', gainDb: -16},
		{frame: b.every + 20, sfx: 'metal_jam_sub', gainDb: -10},
		{frame: b.lean + 30, sfx: 'metal_jam_sub', gainDb: -12},
		{frame: b.sudden, sfx: 'quartz_tick', gainDb: -14, pan: -0.4},
		{frame: b.hard, sfx: 'quartz_tick', gainDb: -14, pan: 0.4},
	];
};

// ======================= s03: the disc that falls behind (signature 1) =======================
const b03 = () => ({
	start: at('s03', 'Start with the belt'),
	disc: at('s03', 'Next to the reel sits a heavy disc'),
	fixed: at('s03', "It isn't fixed"),
	loose: at('s03', 'It turns with it, loosely'),
	slow: at('s03', 'Pull the belt slowly'),
	nothing: at('s03', 'Nothing happens'),
	jerk: at('s03', 'But jerk the belt'),
	andDisc: at('s03', 'And the disc'),
	behind: at('s03', 'it falls behind'),
	lag: at('s03', 'That tiny lag'),
	gap: at('s03', 'that gap pushes'),
	catches: at('s03', 'The arm catches the teeth'),
	clack: at('s03', 'Clack'),
	stops: at('s03', 'The reel stops'),
	fast: at('s03', 'Does it lock when the reel spins too fast'),
	no: at('s03', 'No', 'spins too fast'),
	suddenly: at('s03', 'It cares how suddenly'),
	measure: at('s03', "The belt doesn't measure"),
	left: at('s03', 'getting left behind'),
	end: span('s03').dur,
});

const SLOW_SIM = simulatePull(1200, slowPull);
// the jerk, simulated at 6,000 steps a second so its 20 ms can be slowed to the words
const JERK_FPS = 6000;
const JERK_SIM = simulatePull(600, jerkPull, JERK_FPS);
const JERK_LOCK = Math.max(1, JERK_SIM.lockFrame);

export const DiscScene: React.FC = () => {
	const f = useCurrentFrame();
	const b = b03();
	let reel = 0;
	let disc = 0;
	let arm = 0;
	let mode: 'idle' | 'slow' | 'jerk' | 'fast' = 'idle';
	const wobble = f > b.fixed && f < b.slow ? 0.05 * Math.sin((f - b.fixed) / 9) : 0;
	if (f >= b.slow && f < b.jerk) {
		mode = 'slow';
		const i = Math.min(SLOW_SIM.reel.length - 1, f - b.slow);
		reel = SLOW_SIM.reel[i];
		disc = SLOW_SIM.disc[i];
	} else if (f >= b.jerk && f < b.fast) {
		mode = 'jerk';
		// slow motion: the 20 ms jerk stretched from "But jerk the belt" to "Clack"
		const p = tween(f, b.jerk, b.clack, 0, 1, (t) => t * t * (3 - 2 * t));
		const i = Math.min(JERK_SIM.reel.length - 1, Math.round(p * JERK_LOCK));
		reel = JERK_SIM.reel[i];
		disc = JERK_SIM.disc[i];
		arm = Math.min(1, (reel - disc) / LOCK_LAG);
		if (f >= b.clack) arm = 1;
	} else if (f >= b.fast) {
		mode = 'fast';
		// a steady fast spin: no acceleration, no lag (C21)
		const w = tween(f, b.fast, b.fast + 90, 0, 0.32, ease.camera);
		let a = 0;
		for (let k = b.fast; k < f; k++) a += tween(k, b.fast, b.fast + 90, 0, 0.32, ease.camera);
		reel = a + 0 * w;
		disc = reel;
	}
	const lagDeg = ((reel - disc) * 180) / Math.PI;
	const slowMo = mode === 'jerk' && f < b.clack + 20;
	const shake = shudder(f, FPS, b.clack, 8, 9, 6);
	const discShow = on(f, b.disc, 20);
	const g = Math.min(on(f, b.andDisc, 14), off(f, b.fast, 20));
	const GAIN = 4;
	const am = armGeom(RX, RY, RS, reel, arm);
	// the lag arc between the reel's mark and the disc's mark
	const r0 = 300;
	const a1 = reel - (reel - disc) * GAIN - Math.PI / 2;
	const a2 = reel - Math.PI / 2;
	const arc = `M${RX + r0 * Math.cos(a1)} ${RY + r0 * Math.sin(a1)} A ${r0} ${r0} 0 0 1 ${RX + r0 * Math.cos(a2)} ${RY + r0 * Math.sin(a2)}`;
	return (
		<Stage
			dur={b.end}
			light={{x: 0.5, y: 0.45}}
			overlay={
				<Hud
					labelSize={30}
					title="REEL SENSOR"
					start={b.slow - 20}
					end={b.end}
					width={480}
					rows={[
						{label: 'BELT SPEED', unit: 'mm/s', at: (fr) => (fr < b.jerk ? Math.min(60, Math.max(0, (fr - b.slow) * 1)) : fr < b.clack ? 1500 * Math.min(1, tween(fr, b.jerk, b.clack, 0, 1) * 3) : fr < b.fast ? 0 : tween(fr, b.fast, b.fast + 90, 0, 400)), source: 'ILLUSTRATIVE', tone: 'cyan'},
						{label: 'DISC LAG', unit: '°', at: () => Math.max(0, lagDeg), decimals: 1, source: 'ILLUSTRATIVE', tone: 'amber'},
						{label: 'LOCKS AT', unit: '°', keys: [{frame: 0, value: 8}], source: 'ILLUSTRATIVE', tone: 'crimson'},
					]}
					note="MODEL"
				/>
			}
		>
			<AbsoluteFill>
				<Svg>
					<g transform={`translate(${shake} 0)`}>
						<Reel cx={RX} cy={RY} s={RS} st={reelBase({reel: reel + wobble, disc: disc - wobble, arm, lagGain: GAIN, show: {teeth: 1, spool: 1, disc: discShow, arm: Math.min(on(f, b.gap - 30, 20), off(f, b.fast, 16))}, glow: g})} />
						{mode === 'jerk' && lagDeg > 0.3 ? <path d={arc} fill="none" stroke={colors.amber} strokeWidth={10} strokeLinecap="round" style={{filter: `drop-shadow(0 0 10px ${colors.amber})`}} /> : null}
					</g>
				</Svg>
				<Callout x={RX - 230} y={RY - 160} lx={RX - 520} ly={RY - 330} text="HEAVY DISC" sub="RIDES LOOSELY ON THE REEL" color={colors.amber} t={Math.min(on(f, b.disc + 10, 20), off(f, b.slow, 14))} subSize={30} />
				<Callout x={am.tx} y={am.ty} lx={RX - 560} ly={RY - 120} text="ARM" color={colors.amber} t={Math.min(on(f, b.gap, 20), off(f, b.fast, 14))} />
				<Label x={960} y={56} size={48} color={colors.cyan} weight={700} align="center" opacity={Math.min(on(f, b.slow + 30, 14), off(f, b.jerk, 12))}>
					SLOW PULL: THEY TURN TOGETHER
				</Label>
				<Label x={960} y={56} size={48} color={colors.amber} weight={700} align="center" opacity={Math.min(on(f, b.behind, 14), off(f, b.catches, 12))}>
					THE DISC FALLS BEHIND
				</Label>
				<Label x={960} y={56} size={56} color={colors.crimson} weight={800} align="center" opacity={Math.min(on(f, b.clack, 6), off(f, b.fast, 14))}>
					LOCKED
				</Label>
				<Label x={960} y={56} size={48} color={colors.ink} weight={700} align="center" opacity={Math.min(on(f, b.no, 10), off(f, b.end - 20, 14))}>
					{f < b.suddenly ? 'FAST BUT STEADY: NO LAG' : 'NOT HOW FAST. HOW SUDDENLY.'}
				</Label>
				<Tag x={96} y={970}>
					{slowMo ? 'SLOW MOTION · LAG ×4 · NOT TO SCALE' : 'ILLUSTRATION'}
				</Tag>
			</AbsoluteFill>
		</Stage>
	);
};

export const discCues = (): SfxCue[] => {
	const b = b03();
	return [
		{frame: b.disc, sfx: 'glass_tone', gainDb: -16},
		{frame: b.slow, sfx: 'flow_sweep', gainDb: -20},
		{frame: b.jerk, sfx: 'whoosh', gainDb: -12},
		{frame: b.behind, sfx: 'torque_whine', gainDb: -16},
		{frame: b.clack, sfx: 'metal_jam_sub', gainDb: -4},
		{frame: b.fast, sfx: 'flow_sweep', gainDb: -16},
		{frame: b.suddenly, sfx: 'glass_tone', gainDb: -14},
	];
};

// ======================= s04: the ball that keeps going (signature 2) =======================
const b04 = () => ({
	crash: at('s04', 'But now imagine a real crash'),
	still: at('s04', 'You are sitting still'),
	hits: at('s04', 'The car hits something'),
	first: at('s04', 'In that first instant'),
	reel0: at('s04', "The reel hasn't moved"),
	what: at('s04', 'So what locks it'),
	below: at('s04', 'Below the reel'),
	brakes: at('s04', 'When the car brakes hard'),
	doesnt: at('s04', "The ball doesn't"),
	keeps: at('s04', 'It keeps going'),
	lever: at('s04', 'lifts a small lever'),
	soon: at('s04', 'The belt is locked almost'),
	fast: at('s04', "And it's fast"),
	inch: at('s04', 'less than an inch'),
	tips: at('s04', 'And if the car tips past'),
	gravity: at('s04', 'Gravity rolls the ball'),
	upside: at('s04', 'even upside down'),
	end: span('s04').dur,
});

export const BallScene: React.FC = () => {
	const f = useCurrentFrame();
	const b = b04();
	const cabinA = Math.min(1, off(f, b.below - 10, 20)) * on(f, 0, 1);
	const hit = f >= b.hits;
	const frozen = hit && f < b.below;
	const reelA = Math.min(on(f, b.below, 20), off(f, b.upside - 10, 20));
	const climb = f < b.doesnt ? 0 : tween(f, b.doesnt + 6, b.lever + 30, 0, 1, ease.camera);
	const locked = climb > 0.98;
	// tilt: 15° (stays), then past 45° (rolls)
	const tiltDeg = f < b.tips ? 0 : f < b.gravity ? tween(f, b.tips, b.tips + 60, 0, 15, ease.camera) : tween(f, b.gravity - 10, b.gravity + 40, 15, 50, ease.camera);
	const tiltClimb = f < b.tips ? climb : tiltDeg > 19 ? tween(f, b.gravity + 10, b.gravity + 40, 0, 1, ease.arrive) : 0;
	const climbNow = f < b.tips ? climb : tiltClimb;
	const payout = f < b.brakes ? 0 : Math.min(11, (f - b.brakes) * 0.35);
	const roll = tween(f, b.upside - 20, b.upside + 50, 0, 180, ease.camera);
	const [bx, by] = ballPos(RX, RY - 200, RS * 0.82, climbNow);
	return (
		<Stage
			dur={b.end}
			light={{x: 0.5, y: 0.45}}
			overlay={
				<Hud
					labelSize={30}
					title="CAR SENSOR"
					start={b.brakes - 20}
					end={b.upside}
					width={520}
					rows={[
						{label: 'CAR SLOWING', unit: 'g', at: (fr) => (fr < b.brakes ? 0 : tween(fr, b.brakes, b.lever + 30, 0, 0.7)), decimals: 2, source: 'ILLUSTRATIVE', tone: 'crimson'},
						{label: 'BALL ROLLS AT', unit: 'g', keys: [{frame: 0, value: ballThresholdG}], decimals: 2, source: 'ILLUSTRATIVE', tone: 'amber'},
						{label: 'BELT OUT', unit: 'mm', at: () => payout, decimals: 0, source: 'ILLUSTRATIVE', tone: 'cyan', from: b.fast - 30},
						{label: 'RULE: LOCK BEFORE', unit: 'mm', keys: [{frame: 0, value: 25}], source: 'C06', from: b.inch},
						{label: 'TILT', unit: '°', at: () => tiltDeg, source: 'C08', from: b.tips},
					]}
					note="MODEL · US RULE FMVSS 209"
				/>
			}
		>
			<AbsoluteFill style={{opacity: cabinA}}>
				<Svg>
					<Cabin st={{pitch: frozen ? 7 : 6, barrier: hit ? 1 : 0, reelGlow: on(f, b.reel0, 16)}} />
				</Svg>
				<Label x={960} y={56} size={48} color={colors.ink} weight={700} align="center" opacity={Math.min(on(f, b.first, 14), off(f, b.below, 14))}>
					{f < b.reel0 ? 'NOBODY JERKED THE BELT' : f < b.what ? 'THE REEL HASN’T MOVED' : ''}
				</Label>
				<Label x={960} y={130} size={64} color={colors.amber} weight={800} align="center" opacity={Math.min(on(f, b.what, 10), off(f, b.below, 12))}>
					SO WHAT LOCKS IT?
				</Label>
				<Tag x={96} y={970}>
					{frozen ? 'FROZEN · ILLUSTRATION' : 'ILLUSTRATION'}
				</Tag>
			</AbsoluteFill>
			<AbsoluteFill style={{opacity: reelA}}>
				<Svg>
					<Reel cx={RX} cy={RY - 200} s={RS * 0.82} st={reelBase({reel: locked ? 0.05 : 0, arm: 0, ball: climbNow, tilt: (tiltDeg * Math.PI) / 180, show: {teeth: 1, spool: 1, cup: on(f, b.below, 20)}, glow: on(f, b.doesnt, 14), tail: 360})} />
					{f >= b.brakes && f < b.keeps ? <Arrow x1={RX + 520} y1={RY + 330} x2={RX + 300} y2={RY + 330} color={colors.crimson} width={7} grow={on(f, b.brakes, 20)} /> : null}
				</Svg>
				<Callout x={bx} y={by} lx={bx + 360} ly={by + 40} text="STEEL BALL" sub="IN A CONE-SHAPED CUP" color={colors.amber} t={Math.min(on(f, b.below + 30, 20), off(f, b.brakes, 14))} subSize={30} />
				<Label x={RX + 410} y={RY + 360} size={36} color={colors.crimson} weight={700} align="center" opacity={Math.min(on(f, b.brakes, 14), off(f, b.keeps, 14))}>
					CAR STOPS
				</Label>
				<Label x={960} y={56} size={56} color={colors.amber} weight={800} align="center" opacity={Math.min(on(f, b.doesnt, 8), off(f, b.soon, 14))}>
					THE BALL DOESN’T
				</Label>
				<Label x={960} y={56} size={48} color={colors.ink} weight={700} align="center" opacity={Math.min(on(f, b.inch, 14), off(f, b.tips, 14))}>
					LESS THAN AN INCH OF BELT
				</Label>
				<Label x={960} y={56} size={48} color={tiltDeg > 19 ? colors.crimson : colors.emerald} weight={700} align="center" opacity={Math.min(on(f, b.tips + 30, 14), off(f, b.upside - 10, 14))}>
					{tiltDeg > 19 ? 'PAST 45°: MUST LOCK' : '15°: MUST NOT LOCK'}
				</Label>
				<Tag x={96} y={970}>
					ILLUSTRATION · NOT TO SCALE
				</Tag>
			</AbsoluteFill>
			<AbsoluteFill style={{opacity: on(f, b.upside - 10, 20)}}>
				<Svg>
					<Cabin st={{pitch: 4, locked: 1, roll}} />
				</Svg>
				<Tag x={96} y={970}>
					ILLUSTRATION
				</Tag>
			</AbsoluteFill>
		</Stage>
	);
};

export const ballCues = (): SfxCue[] => {
	const b = b04();
	return [
		{frame: b.hits, sfx: 'metal_snap_sub', gainDb: -8},
		{frame: b.below, sfx: 'whoosh', gainDb: -16},
		{frame: b.doesnt, sfx: 'flow_sweep', gainDb: -14},
		{frame: b.lever + 30, sfx: 'metal_jam_sub', gainDb: -6},
		{frame: b.inch, sfx: 'quartz_tick', gainDb: -14},
		{frame: b.gravity + 30, sfx: 'metal_jam_sub', gainDb: -10},
		{frame: b.upside, sfx: 'whoosh', gainDb: -12},
	];
};

export {endOf, lin, shoulder, spoolRadius};
