import {cue, timing} from './cues';
import {CUP_BETA, FPS, jerkPull, LOCK_LAG, simulatePull, slowPull, spoolRadius} from './model';

// Film 3, cut v3 (owner's review of cut v2, 2026-11-13: "low level visuals, not at all near to reality … use ultra
// realistic animation for the science, otherwise mostly real clips"; PLAYBOOK §16). The edit decision list: every shot
// on the recorded VO's clock, either a real clip (NHTSA crash films, Pixabay driving footage; people appear only in
// real clips) or a photoreal Blender plate (blender/render.py: the 'cabin' set for the belt at the pillar, the
// 'retractor' set for the mechanism), whose camera and mechanism state are functions of time here: the plate, the
// callouts and the HUD share one driver (PLAYBOOK §10.6). Pure TypeScript: blenderExport.ts bundles this for Blender.

export const PLATE_FPS = 30;
/** A cut lands this many frames before the word that motivates it. */
const PRE = 6;
/** Extra plate frames rendered after a shot's end (dissolves, nudges). */
export const PLATE_HANDLE = 24;

export type Vec3 = [number, number, number];
export type Cam = {pos: Vec3; target: Vec3; lens: number; fstop?: number; focus?: number};
export type RetractorState = {
	reel?: number;
	disc?: number;
	arm?: number;
	ball?: number;
	tilt?: number;
	twist?: number;
	spool?: number;
	fire?: number;
	cut?: boolean;
	glow?: number;
	payout?: number;
	show?: {disc?: number; sensor?: number; arm?: number; bar?: number};
};
export type CabinState = {payout?: number; tremor?: number; drive?: number; shake?: number; roll?: number; phone?: number; sun?: number};
export type PlateSet = 'retractor' | 'cabin';

/** What a viewer reads over a shot (Remotion draws these; plates carry no text). */
export type Overlay = {
	/** honesty label, bottom left */
	label?: string;
	/** callouts: a name on a 3D point of the set (metres, the set's own frame), from a phrase to the shot's end */
	callouts?: {text: string; p: Vec3; at?: string; color?: 'amber' | 'cyan' | 'crimson' | 'emerald' | 'line'}[];
	/** HUD rows: value(t) with its source (claims id) or ILLUSTRATIVE */
	hud?: {k: string; v: (t: number) => string; source: string}[];
	/** a big statement card element (never a text card on its own: over a moving plate or clip) */
	big?: {text: string; at: string; color?: 'amber' | 'cyan' | 'crimson' | 'emerald'};
	/** a fixed arrow showing which way is down (the tilt shot) */
	gravity?: boolean;
};

export type Shot = {
	id: string;
	/** global start frame (60 fps) */
	from: number;
	to: number;
	overlay?: Overlay;
	sfx?: {at: number; sfx: string; gainDb: number}[];
} & (
	| {kind: 'clip'; file: string; in: number; rate?: number; credit: string}
	| {kind: 'plate'; set: PlateSet; cam: (t: number) => Cam; state: (t: number, g: number) => RetractorState | CabinState}
);

// ---------------- the clock ----------------
const at = (phrase: string, after?: string): number => cue.at(phrase, after);
const sec = (frames: number): number => frames / FPS;
const lerp = (a: number, b: number, x: number): number => a + (b - a) * Math.max(0, Math.min(1, x));
const smooth = (x: number): number => {
	const c = Math.max(0, Math.min(1, x));
	return c * c * (3 - 2 * c);
};
const lerp3 = (a: Vec3, b: Vec3, x: number): Vec3 => [lerp(a[0], b[0], x), lerp(a[1], b[1], x), lerp(a[2], b[2], x)];
/** Seconds from a shot's start to a phrase. */
const rel = (from: number, phrase: string, after?: string): number => sec(at(phrase, after) - from);

// ---------------- the model, sampled ----------------
const R_MM = spoolRadius();
const SLOW = simulatePull(6 * FPS, slowPull);
const JERK = simulatePull(2 * FPS, jerkPull);
const STEADY = simulatePull(6 * FPS, (t) => 400 * Math.min(1, t / 1.5));
/** The simulation at time t (s), interpolated between its 60 fps samples (slow motion stays smooth). */
const sample = (arr: number[], tSec: number): number => {
	const x = Math.max(0, Math.min(arr.length - 1, tSec * FPS));
	const i = Math.floor(x);
	const j = Math.min(arr.length - 1, i + 1);
	return arr[i] + (arr[j] - arr[i]) * (x - i);
};
/** The jerk, run slowed by `slow` (the picture says SLOW MOTION). Before the locking frame: the simulation; across it
 * the lag rises to exactly LOCK_LAG (the threshold is crossed inside that frame); after it the reel is held by the arm
 * and the disc by the arm's cam, so nothing moves back. */
const jerkAt = (tSec: number, slow = 1): {payout: number; reel: number; disc: number; arm: number; locked: boolean} => {
	const ts = Math.max(0, tSec / slow);
	const lf = JERK.lockFrame;
	const t0 = lf / FPS;
	if (ts <= t0) {
		const reel = sample(JERK.reel, ts);
		const disc = sample(JERK.disc, ts);
		return {payout: sample(JERK.payout, ts), reel, disc, arm: Math.min(1, (reel - disc) / LOCK_LAG), locked: false};
	}
	const x = Math.min(1, (ts - t0) * FPS);
	const r0 = JERK.reel[lf];
	const lag0 = r0 - JERK.disc[lf];
	const r1 = r0 + (JERK.reel[lf] - JERK.reel[Math.max(0, lf - 1)]) * 0.5;
	const reel = r0 + (r1 - r0) * x;
	const lag = lag0 + (LOCK_LAG - lag0) * x;
	return {payout: reel * R_MM, reel, disc: reel - lag, arm: lag / LOCK_LAG, locked: x >= 1};
};
export const JERK_LOCK_S = (JERK.lockFrame + 1) / FPS;
const reelOf = (payoutMm: number): number => payoutMm / R_MM;

// ---------------- cameras ----------------
// retractor (metres; the reel's axis along +y, the face plane x–z; see blender/retractor.py)
const RET = {
	hero: {pos: [0.17, -0.22, 0.12] as Vec3, target: [0.004, 0.022, -0.004] as Vec3, lens: 50, fstop: 11},
	front: {pos: [0.0, -0.24, 0.01] as Vec3, target: [0.0, 0.0, -0.008] as Vec3, lens: 60, fstop: 11},
	disc: {pos: [0.035, -0.15, 0.03] as Vec3, target: [0.0, -0.004, 0.0] as Vec3, lens: 70, fstop: 11},
	cup: {pos: [0.05, -0.12, -0.02] as Vec3, target: [0.006, -0.004, -0.038] as Vec3, lens: 80, fstop: 9},
	side: {pos: [0.21, -0.06, -0.1] as Vec3, target: [0.0, 0.027, -0.005] as Vec3, lens: 50, fstop: 11},
	pre: {pos: [0.12, -0.25, 0.0] as Vec3, target: [-0.005, 0.02, -0.04] as Vec3, lens: 50, fstop: 11},
};
// cabin: the D-ring close-up and a wider view of the pillar from the passenger side
const CAB = {
	dring: {pos: [0.05, -0.08, 0.62] as Vec3, target: [-0.3, 0.33, 0.6] as Vec3, lens: 40, fstop: 2.8},
	low: {pos: [0.04, -0.06, 0.52] as Vec3, target: [-0.3, 0.34, 0.64] as Vec3, lens: 40, fstop: 2.8},
	macro: {pos: [-0.12, 0.12, 0.6] as Vec3, target: [-0.3, 0.35, 0.65] as Vec3, lens: 70, fstop: 2.2},
};
type CamPreset = {pos: Vec3; target: Vec3; lens: number; fstop: number};
/** A slow move between two framings (camera ease), so no plate is ever static. */
const move = (a: CamPreset, b: Partial<CamPreset>, dur: number) => (t: number): Cam => {
	const x = smooth(t / Math.max(0.1, dur));
	return {pos: lerp3(a.pos, b.pos ?? a.pos, x), target: lerp3(a.target, b.target ?? a.target, x), lens: lerp(a.lens, b.lens ?? a.lens, x), fstop: a.fstop};
};
const push = (a: CamPreset, k = 0.12, dur = 6) => move(a, {pos: lerp3(a.pos, a.target, k)}, dur);
const orbit = (a: CamPreset, deg: number, dur: number) => (t: number): Cam => {
	const x = smooth(t / dur) * (deg * Math.PI) / 180;
	const [px, py, pz] = a.pos;
	const [tx, ty] = a.target;
	const dx = px - tx;
	const dy = py - ty;
	return {pos: [tx + dx * Math.cos(x) - dy * Math.sin(x), ty + dx * Math.sin(x) + dy * Math.cos(x), pz], target: a.target, lens: a.lens, fstop: a.fstop};
};

// ---------------- the shots ----------------
type DistOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
type Def = DistOmit<Shot, 'from' | 'to'> & {start: number};
const PX = (id: string): string => `blackmarketmusic / Pixabay (${id})`;
const NH = 'Crash test film: NHTSA';

const defs = (): Def[] => {
	const d: Def[] = [];
	const clip = (id: string, start: number, file: string, inS: number, credit: string, overlay?: Overlay, sfx?: Def['sfx']): void => {
		d.push({id, start, kind: 'clip', file, in: inS, credit, overlay, sfx});
	};
	const plate = (id: string, start: number, set: PlateSet, cam: (t: number) => Cam, state: (t: number, g: number) => RetractorState | CabinState, overlay?: Overlay, sfx?: Def['sfx']): void => {
		d.push({id, start, kind: 'plate', set, cam, state, overlay: {label: set === 'retractor' ? 'ILLUSTRATION · NOT TO SCALE' : 'ILLUSTRATION', ...overlay}, sfx});
	};
	const s = (phrase: string, after?: string): number => at(phrase, after) - PRE;

	// ---- s01: the paradox (the first ten seconds are real footage)
	clip('open_reach', 0, 'px133694', 0.4, PX('133694'));
	clip('open_crash', s('and you crashing'), 'nh_impact', 2.55, NH, undefined, [{at: s('and you crashing') + 30, sfx: 'metal_jam_sub', gainDb: -6}]);
	plate('chip_q', s('So where is the chip'), 'cabin', push(CAB.dring, 0.15, 4), (t) => ({payout: 0, drive: t * 14}), {
		callouts: [{text: 'A CHIP?', p: [-0.3, 0.33, 0.66], color: 'amber', at: 'chip'}],
	});
	clip('airbag_guess', s('You would probably guess'), 'nh_onboard', 2.0, NH);
	clip('no_chip', s('But the lock inside a seatbelt'), 'px133698', 1.0, PX('133698'));
	{
		const st = s('Pull the belt slowly', 'But the lock inside');
		plate('slow_pull', st, 'cabin', push(CAB.dring, 0.08, 3), (t) => ({payout: sample(SLOW.payout, Math.max(0, t - 0.2)), drive: t * 14}), {
			hud: [{k: 'BELT OUT', v: (t) => `${Math.round(sample(SLOW.payout, Math.max(0, t - 0.2)))} mm`, source: 'ILLUSTRATIVE'}],
		});
	}
	{
		const st = s('Jerk it');
		plate('jerk', st, 'cabin', push(CAB.macro, 0.06, 3), (t) => {
			const j = jerkAt(Math.max(0, t - 0.25));
			const tl = t - 0.25 - JERK_LOCK_S;
			return {payout: 40 + j.payout, tremor: tl > 0 ? 0.004 * Math.exp(-tl * 6) * Math.sin(tl * 2 * Math.PI * 9) : 0, drive: t * 14};
		}, {big: {text: 'LOCKED', at: 'stops dead', color: 'crimson'}}, [{at: st + 15 + Math.round(JERK_LOCK_S * FPS), sfx: 'metal_jam_sub', gainDb: -8}]);
	}
	clip('right_every', s('And it has to be right every time'), 'px133708', 1.0, PX('133708'));
	{
		const st = s('Lock on every tug');
		// three small tugs, each caught at once: you would fight your belt all day
		plate('every_tug', st, 'cabin', move(CAB.low, {pos: [0.05, -0.08, 0.53]}, 4), (t) => {
			const k = Math.floor(t / 1.1);
			const ph = t - k * 1.1;
			return {payout: Math.min(3, k) * 6 + (ph < 0.12 ? ph * 50 : 6), tremor: ph > 0.12 && ph < 0.5 ? 0.003 * Math.sin(ph * 60) * Math.exp(-ph * 8) : 0, drive: t * 14};
		}, undefined, [0, 1, 2].map((k) => ({at: st + Math.round((0.12 + 1.1 * k) * FPS), sfx: 'metal_jam_sub', gainDb: -14})));
	}
	clip('too_late', s('Lock a moment too late'), 'nh_overall', 1.4, NH, {label: 'SLOW MOTION'});
	{
		const st = s('So how does a seatbelt know');
		plate('how_know', st, 'retractor', move({...RET.hero, pos: [0.3, -0.38, 0.2]}, {pos: RET.hero.pos}, 8), (t) => ({reel: reelOf(t * 30), disc: reelOf(t * 30), payout: t * 30}));
	}
	{
		const st = s('And in a really hard crash');
		const tLock = rel(st, 'it makes a second decision');
		const tLet = rel(st, 'it starts to let you go');
		plate('second_decision', st, 'retractor', orbit(RET.hero, -16, 12), (t) => {
			const lock = t > tLock;
			const lag = lock ? LOCK_LAG : smooth((t - tLock + 0.4) / 0.4) * LOCK_LAG;
			const let_ = smooth((t - tLet) / 3);
			return {reel: 0.4, disc: 0.4 - lag, arm: lock ? 1 : lag / LOCK_LAG, spool: 0.35 * let_, twist: 0.0, glow: lock ? 0.5 : 0, payout: 0.35 * let_ * R_MM};
		}, {callouts: [{text: 'LETTING GO', p: [0.026, 0.02, 0.0], color: 'emerald', at: 'On purpose'}]}, [{at: at('it makes a second decision'), sfx: 'metal_jam_sub', gainDb: -10}, {at: at('it starts to let you go'), sfx: 'torque_whine', gainDb: -14}]);
	}

	// ---- s02: the obvious fix, failing
	{
		const st = s('Imagine the simplest lock');
		const tDrop = rel(st, 'drops into them');
		plate('simplest', st, 'retractor', move(RET.front, {pos: [0.05, -0.2, 0.03]}, 30), (t) => {
			const turning = t < tDrop + 0.3;
			const rr = turning ? reelOf(t * 25) : reelOf((tDrop + 0.3) * 25);
			return {reel: rr, disc: rr, arm: smooth((t - tDrop) / 0.3), show: {disc: 0, sensor: 0}};
		}, {callouts: [{text: 'RING OF TEETH', p: [-0.03, -0.002, 0.03], color: 'line', at: 'A ring of teeth'}, {text: 'HOOK', p: [-0.016, -0.002, 0.025], color: 'amber', at: 'a hook'}]}, [{at: at('drops into them') + 18, sfx: 'metal_jam_sub', gainDb: -8}]);
	}
	{
		const st = s('Lean over to the glovebox');
		plate('glovebox', st, 'cabin', push(CAB.low, 0.1, 4), (t) => ({payout: Math.min(25, t * 25), tremor: t > 1 ? 0.003 * Math.sin(t * 50) * Math.exp(-(t - 1) * 6) : 0, drive: t * 14}), {big: {text: 'LOCKED', at: 'it holds you like a crash', color: 'crimson'}}, [{at: st + FPS, sfx: 'metal_jam_sub', gainDb: -10}]);
	}
	plate('clues', s("The hook can't be the clever part"), 'retractor', orbit(RET.hero, 14, 12), (t) => ({reel: 0.4 + reelOf(t * 4), disc: 0.4 + reelOf(t * 4)}), {
		big: undefined,
		callouts: [
			{text: 'HOW SUDDENLY THE BELT IS PULLED', p: [0.026, 0.02, 0.06], color: 'cyan', at: 'How suddenly the belt is pulled'},
			{text: 'HOW HARD THE CAR IS STOPPING', p: [0.008, -0.005, -0.045], color: 'amber', at: 'And how hard the car is stopping'},
		],
	});

	// ---- s03: the disc
	{
		const st = s('Start with the belt');
		plate('disc_intro', st, 'retractor', push(RET.disc, 0.08, 10), (t) => {
			const tl = rel(st, 'It turns with it, loosely');
			const r = t > tl ? reelOf((t - tl) * 20) : 0;
			return {reel: r, disc: r, glow: smooth((t - rel(st, 'sits a heavy disc')) / 0.5) * 0.6};
		}, {callouts: [{text: 'HEAVY DISC', p: [0.022, -0.006, 0.0], color: 'amber', at: 'sits a heavy disc'}, {text: 'REEL', p: [0.0, -0.008, 0.0], color: 'line', at: "It isn't fixed to the reel"}]});
	}
	{
		const st = s('Pull the belt slowly, and the reel turns slowly');
		plate('disc_slow', st, 'retractor', push(RET.front, 0.08, 6), (t) => {
			const p = sample(SLOW.payout, t);
			return {reel: reelOf(p), disc: reelOf(p) - (sample(SLOW.reel, t) - sample(SLOW.disc, t)), payout: p};
		}, {hud: [{k: 'DISC LAG', v: (t) => `${Math.max(0, (sample(SLOW.reel, t) - sample(SLOW.disc, t)) * 180 / Math.PI).toFixed(1)}°`, source: 'ILLUSTRATIVE'}]});
	}
	{
		// the jerk at real speed first (it is over in a fifth of a second), then a slowed replay on the disc and the arm,
		// timed so the arm catches on "The arm catches the teeth" (the picture says SLOW MOTION)
		const st = s('But jerk the belt');
		plate('jerk_real', st, 'retractor', orbit(RET.front, 8, 6), (t) => {
			const j = jerkAt(Math.max(0, t - 0.9));
			return {reel: j.reel, disc: j.disc, arm: j.arm, glow: j.locked ? 0.7 : 0.2, payout: j.payout};
		}, undefined, [{at: st + Math.round((0.9 + JERK_LOCK_S) * FPS), sfx: 'metal_jam_sub', gainDb: -12}]);
		const r0 = at('And the disc', 'But jerk the belt') - PRE;
		const tCatch = sec(at('The arm catches the teeth') - r0);
		const slow = tCatch / JERK_LOCK_S;
		const replay = (g: number): ReturnType<typeof jerkAt> => jerkAt(sec(g - r0), slow);
		const hud = (from: number) => [{k: 'DISC LAG', v: (t: number) => {
			const j = replay(from + t * FPS);
			return `${Math.max(0, (j.reel - j.disc) * 180 / Math.PI).toFixed(1)}°`;
		}, source: 'ILLUSTRATIVE'}];
		plate('jerk_disc', r0, 'retractor', orbit(RET.disc, 14, 10), (t, g) => {
			const j = replay(g);
			return {reel: j.reel, disc: j.disc, arm: j.arm, glow: 0.6, payout: j.payout};
		}, {label: 'ILLUSTRATION · SLOW MOTION · NOT TO SCALE', hud: hud(r0)});
		const r1 = at('That tiny lag is the whole trick') - PRE;
		const ARMCAM = {pos: [-0.045, -0.11, 0.07] as Vec3, target: [-0.016, -0.002, 0.027] as Vec3, lens: 85, fstop: 9};
		plate('jerk_arm', r1, 'retractor', move(ARMCAM, {pos: [-0.035, -0.1, 0.06]}, 12), (t, g) => {
			const j = replay(g);
			return {reel: j.reel, disc: j.disc, arm: j.arm, glow: j.arm > 0.98 ? 1 : 0.7, payout: j.payout};
		}, {
			label: 'ILLUSTRATION · SLOW MOTION · NOT TO SCALE',
			hud: hud(r1),
			big: {text: 'LOCKED', at: 'Clack', color: 'crimson'},
			callouts: [{text: 'ARM', p: [-0.02, -0.002, 0.03], color: 'amber', at: 'pushes a small arm outward'}, {text: 'TEETH', p: [-0.03, 0.0, 0.026], color: 'line', at: 'The arm catches the teeth'}],
		}, [{at: at('The arm catches the teeth') + 6, sfx: 'metal_jam_sub', gainDb: -4}]);
	}
	plate('not_speed', s('Does it lock when the reel spins too fast'), 'retractor', orbit(RET.front, 10, 8), (t) => {
		const p = sample(STEADY.payout, t * 0.9);
		return {reel: reelOf(p), disc: reelOf(p) - (sample(STEADY.reel, t * 0.9) - sample(STEADY.disc, t * 0.9)), payout: p};
	}, {big: {text: 'HOW SUDDENLY, NOT HOW FAST', at: 'It cares how suddenly', color: 'amber'}});
	plate('left_behind', s("The belt doesn't measure your speed"), 'retractor', push(RET.disc, 0.12, 6), (t) => ({reel: 0.9 + reelOf(t * 6), disc: 0.9 - LOCK_LAG * 0.6 + reelOf(t * 6), glow: 0.6}));

	// ---- s04: the crash, and the ball
	plate('real_crash', s('But now imagine a real crash'), 'cabin', move(CAB.dring, {pos: [0.07, -0.1, 0.6]}, 8), (t) => ({payout: 0, drive: t * 14, shake: 0.0006 * Math.sin(t * 23)}));
	clip('hits', s('The car hits something'), 'nh_impact', 2.6, NH, undefined, [{at: at('The car hits something') + 24, sfx: 'metal_jam_sub', gainDb: -6}]);
	plate('reel_still', s('In that first instant'), 'retractor', push(RET.front, 0.12, 7), () => ({reel: 0.2, disc: 0.2}), {hud: [{k: 'REEL', v: () => '0°', source: 'ILLUSTRATIVE'}]});
	{
		const st = s('So what locks it');
		const tBrake = rel(st, 'When the car brakes hard');
		const tLever = rel(st, 'lifts a small lever into the teeth');
		const tLock = rel(st, 'The belt is locked almost');
		const lockState = (t: number) => {
			const climb = smooth((t - tBrake - 0.8) / (tLever - tBrake + 0.6));
			const turn = smooth((t - tLock + 0.6) / 0.6) * LOCK_LAG;
			return {reel: 0.2 + turn, disc: 0.2, arm: turn / LOCK_LAG, ball: climb, glow: climb * 0.7};
		};
		const CUPCAM = {pos: [0.035, -0.085, -0.03] as Vec3, target: [0.008, -0.005, -0.043] as Vec3, lens: 110, fstop: 8};
		plate('ball', st, 'retractor', move(CUPCAM, {pos: [0.045, -0.09, -0.02]}, sec(at('It keeps going') - st) + 2), (t) => lockState(t), {
			label: 'ILLUSTRATION · NOT TO SCALE',
			callouts: [{text: 'STEEL BALL', p: [0.008, -0.005, -0.044], color: 'amber', at: 'sits a steel ball'}, {text: 'CONE-SHAPED CUP', p: [0.0, -0.005, -0.05], color: 'line', at: 'shaped like a cone'}],
			hud: [{k: 'CAR DECEL', v: (t) => (t > tBrake ? '> 0.7 g' : '0 g'), source: 'C06'}],
		});
		const s2 = at('It keeps going') - PRE;
		plate('ball_lock', s2, 'retractor', move({...RET.front, pos: [0.03, -0.2, -0.02], target: [0.0, 0.0, -0.025]}, {pos: [0.0, -0.17, -0.01]}, 12), (t) => lockState(t + sec(s2 - st)), {
			label: 'ILLUSTRATION · NOT TO SCALE',
			callouts: [{text: 'LEVER', p: [0.0, -0.004, -0.036], color: 'amber', at: 'lifts a small lever'}, {text: 'DISC HELD', p: [-0.02, -0.004, -0.025], color: 'cyan', at: 'The belt is locked almost'}],
			hud: [{k: 'CAR DECEL', v: () => '> 0.7 g', source: 'C06'}],
		}, [{at: at('lifts a small lever into the teeth') + 30, sfx: 'quartz_tick', gainDb: -10}, {at: at('The belt is locked almost'), sfx: 'metal_jam_sub', gainDb: -6}]);
	}
	plate('inch', s("And it's fast"), 'cabin', move(CAB.macro, {pos: [-0.09, 0.08, 0.62]}, 9), (t) => ({payout: Math.min(20, Math.max(0, t - 1.5) * 60), drive: 0}), {
		big: {text: 'LESS THAN 1 INCH (25 mm)', at: 'less than an inch', color: 'cyan'},
		hud: [{k: 'FMVSS 209', v: () => '0.7 g · 25 mm', source: 'C06'}],
	});
	{
		const st = s('And if the car tips past');
		const tGrav = rel(st, 'Gravity rolls the ball');
		plate('tilt', st, 'retractor', push(RET.front, 0.05, 10), (t) => {
			const tilt = t < tGrav ? lerp(0, (50 * Math.PI) / 180, smooth(t / (tGrav - 0.3))) : lerp((50 * Math.PI) / 180, (150 * Math.PI) / 180, smooth((t - tGrav) / 4));
			const climb = smooth((tilt - CUP_BETA) / ((12 * Math.PI) / 180));
			const lockT = climb >= 1 ? LOCK_LAG : 0;
			return {tilt, ball: climb, reel: 0.2 + lockT, disc: 0.2, arm: climb >= 1 ? 1 : 0, glow: climb * 0.6};
		}, {label: 'ILLUSTRATION · NOT TO SCALE', gravity: true, hud: [{k: 'TILT', v: (t) => `${Math.round(t < tGrav ? 50 * smooth(t / (tGrav - 0.3)) : 50 + 100 * smooth((t - tGrav) / 4))}°`, source: 'C08'}], big: {text: '45°', at: 'forty-five degrees', color: 'amber'}});
	}

	// ---- s05: the catch (real crash films)
	clip('lock_works', s('So the lock works'), 'nh_realtime', 2.6, NH);
	clip('one_strap', s('Once the belt locks'), 'nh_sled_side', 1.4, NH, {label: 'SLOW MOTION'});
	clip('crumple', s('The front of the car crumples'), 'nh_overall', 3.0, NH, {label: 'SLOW MOTION'});
	clip('barely_gives', s('The belt barely gives'), 'nh_driver', 3.0, NH, {label: 'SLOW MOTION'});
	clip('chests', s('And chests can break'), 'nh_sled_side', 2.6, NH, {label: 'SLOW MOTION'});
	clip('older', s('In bad crashes, older people'), 'nh_sled_side', 4.0, NH, {label: 'SLOW MOTION'});

	// ---- s06: the pretensioner
	plate('two_things', s('Engineers did two things'), 'retractor', orbit(RET.hero, -10, 8), (t) => ({reel: 0.3 + reelOf(t * 3), disc: 0.3 + reelOf(t * 3)}));
	clip('chip_real', s('Remember the chip you guessed'), 'nh_onboard', 2.4, NH, {label: 'SLOW MOTION'});
	{
		const st = s('At the very start of a crash');
		const tFire = rel(st, 'fire a charge in the belt');
		plate('pretension', st, 'retractor', push(RET.pre, 0.1, 8), (t) => {
			const f = t > tFire ? Math.exp(-(t - tFire) * 3) : 0;
			const back = smooth((t - tFire) / 0.25);
			return {reel: 0.5 - back * 2.4, disc: 0.5 - back * 2.4, fire: f, payout: -back * 60};
		}, {callouts: [{text: 'PRETENSIONER', p: [-0.022, 0.0, -0.08], color: 'crimson', at: 'fire a charge in the belt'}]}, [{at: at('fire a charge in the belt') + 8, sfx: 'metal_snap_sub', gainDb: -8}]);
	}
	plate('snap', s('It snaps the belt tight'), 'cabin', push(CAB.low, 0.1, 3), (t) => ({payout: 40 - 60 * smooth(t / 0.18), tremor: t > 0.18 ? 0.004 * Math.sin(t * 60) * Math.exp(-(t - 0.18) * 5) : 0}), {big: {text: 'SLACK: GONE', at: 'pulls out the slack', color: 'cyan'}}, [{at: at('It snaps the belt tight') + 6, sfx: 'whoosh', gainDb: -8}]);
	clip('slows_sooner', s('Now your body starts slowing down'), 'nh_onboard', 1.0, NH, {label: 'SLOW MOTION'});

	// ---- s07: the torsion bar
	{
		const st = s('And the second fix');
		const tHolds = rel(st, 'In a small crash, the bar holds');
		const tLimit = rel(st, 'the bar starts to twist');
		plate('bar', st, 'retractor', move(RET.side, {pos: [0.18, -0.03, -0.085], lens: 58}, 30), (t) => {
			const load = t < tLimit ? smooth((t - tHolds) / 2) * 0.55 : 0.55 + 0.45 * smooth((t - tLimit) / 0.8);
			const twist = smooth((t - tLimit) / 6) * 1.6;
			return {cut: true, reel: 0.3, disc: 0.3 - LOCK_LAG, arm: 1, twist: load, spool: twist, payout: twist * R_MM};
		}, {
			callouts: [{text: 'TORSION BAR', p: [0.0, 0.03, 0.0], color: 'amber', at: 'a steel bar that is built to twist'}],
			hud: [{k: 'BELT FORCE', v: (t) => `${(t < tLimit ? 4 * smooth((t - tHolds) / 2) * 0.9 : 4).toFixed(1)} kN`, source: 'ILLUSTRATIVE'}],
		}, [{at: at('the bar starts to twist'), sfx: 'torque_whine', gainDb: -10}]);
	}
	plate('renault', s('One carmaker, Renault'), 'retractor', move(RET.side, {pos: [0.24, -0.08, -0.12]}, 10), (t) => ({cut: true, reel: 0.3, disc: 0.3 - LOCK_LAG, arm: 1, twist: 1, spool: 0.7 + t * 0.02}), {
		big: {text: '4 kN ≈ 5 ADULTS ON ONE STRAP', at: "That's about the weight of five adults", color: 'emerald'},
		hud: [{k: 'LIMIT', v: () => '4 kN', source: 'C13'}],
	});
	clip('airbag_catch', s('And it added an airbag'), 'nh_sled_side', 2.2, NH, {label: 'SLOW MOTION'});
	plate('three_quarters', s('With the two together'), 'retractor', orbit({...RET.hero, fstop: 2.2}, 8, 10), (t) => ({reel: 0.3 + reelOf(t * 2), disc: 0.3 + reelOf(t * 2)}), {
		label: 'STAPP CAR CRASH J. 2001 · 347 CRASHES',
		big: {text: 'SERIOUS CHEST INJURIES: ABOUT 3/4 FEWER', at: 'about three quarters fewer', color: 'emerald'},
	});

	// ---- s08: the cost
	clip('cost', s('But what does letting go cost you'), 'nh_sled_side', 3.2, NH, {label: 'SLOW MOTION'});
	clip('softer', s("That's why the softer limit"), 'nh_onboard', 3.6, NH, {label: 'SLOW MOTION'});
	clip('tall', s('And engineers worry about tall'), 'nh_driver', 5.0, NH, {label: 'SLOW MOTION'});
	{
		const st = s('Where do you set the limit');
		plate('limit_choice', st, 'retractor', orbit(RET.side, 14, 13), (t) => ({cut: true, reel: 0.3, disc: 0.3 - LOCK_LAG, arm: 1, twist: 0.5 + 0.5 * Math.sin(t * 1.6) * Math.exp(-t * 0.25), spool: 0.4 + 0.15 * Math.sin(t * 1.6) * Math.exp(-t * 0.25)}), {
			callouts: [
				{text: 'TOO HIGH: THE CHEST', p: [0.0, 0.0, 0.03], color: 'crimson', at: 'Too high'},
				{text: 'TOO LOW: TOO FAR', p: [0.0, 0.05, -0.02], color: 'amber', at: 'Too low'},
			],
		});
	}
	{
		const st = s('So in a hard crash, your belt makes three moves');
		const t1 = rel(st, 'Pull tight');
		const t2 = rel(st, 'Lock', 'Pull tight');
		const t3 = rel(st, 'Then let go, just enough');
		plate('three_moves', st, 'retractor', orbit(RET.hero, 10, 10), (t) => {
			const back = smooth((t - t1) / 0.2) * 2.0;
			const lock = t > t2 ? 1 : 0;
			const go = smooth((t - t3) / 1.4) * 0.4;
			return {reel: 0.5 - back + lock * LOCK_LAG, disc: 0.5 - back, arm: lock, fire: t > t1 ? Math.exp(-(t - t1) * 3) : 0, spool: go, glow: lock * 0.6};
		}, {
			callouts: [
				{text: 'PULL TIGHT', p: [-0.022, 0.0, -0.08], color: 'cyan', at: 'Pull tight'},
				{text: 'LOCK', p: [-0.012, -0.002, 0.03], color: 'crimson', at: 'Lock', },
				{text: 'LET GO', p: [0.026, 0.02, 0.0], color: 'emerald', at: 'Then let go, just enough'},
			],
		}, [{at: at('Pull tight'), sfx: 'metal_snap_sub', gainDb: -10}, {at: at('Lock', 'Pull tight'), sfx: 'metal_jam_sub', gainDb: -6}, {at: at('Then let go, just enough'), sfx: 'torque_whine', gainDb: -12}]);
	}

	// ---- s09: the child-seat mode
	{
		const st = s('Ever pulled your belt all the way out');
		const tIn = rel(st, "It's not broken");
		const tBack = rel(st, 'Let it wind all the way back');
		plate('all_out', st, 'cabin', move(CAB.dring, {pos: [0.08, -0.11, 0.6]}, 20), (t) => {
			const out = Math.min(700, Math.max(0, t) * 400);
			// winding in, one click at a time (it can only go in)
			const steps = t > tIn ? Math.floor((t - tIn) / 0.9) * 40 + 40 * smooth(((t - tIn) % 0.9) / 0.15) : 0;
			const back = t > tBack ? smooth((t - tBack) / 2.5) : 0;
			return {payout: lerp(Math.max(0, out - Math.min(steps, 360)), 0, back), drive: 0};
		}, {big: {text: 'CHILD-SEAT MODE', at: 'Many belts have a child-seat mode', color: 'cyan'}});
	}

	// ---- s10: the landing
	plate('feel', s('Want to feel it yourself'), 'cabin', move(CAB.low, {pos: [0.05, -0.08, 0.54]}, 3), (t) => ({payout: 0, drive: t * 14}));
	plate('feel_slow', s('Next time you put your belt on'), 'cabin', push(CAB.dring, 0.1, 5), (t) => ({payout: sample(SLOW.payout, t), drive: t * 14}));
	{
		const st = s('Then give it one sharp tug');
		plate('feel_tug', st, 'cabin', push(CAB.dring, 0.06, 4), (t) => {
			const j = jerkAt(Math.max(0, t - 0.7));
			const tl = t - 0.7 - JERK_LOCK_S;
			return {payout: 60 + j.payout, tremor: tl > 0 ? 0.004 * Math.exp(-tl * 6) * Math.sin(tl * 2 * Math.PI * 9) : 0, drive: t * 14};
		}, undefined, [{at: st + Math.round((0.7 + JERK_LOCK_S) * FPS), sfx: 'metal_jam_sub', gainDb: -8}]);
	}
	plate('disc_decides', s('A disc that got left behind'), 'retractor', orbit(RET.disc, -12, 6), (t) => ({reel: 1.2 + LOCK_LAG, disc: 1.2, arm: 1, glow: 0.8 - 0.1 * t}));
	plate('bar_waits', s('And behind it, a steel bar waits'), 'retractor', move(RET.side, {pos: [0.42, -0.3, -0.05], lens: 40}, 14), (t) => ({cut: true, reel: 0.3, disc: 0.3, twist: 0.25 + 0.05 * Math.sin(t)}));
	return d;
};

/** The whole edit: each shot runs to the next one's start; the last to the landing's end. */
export const EDIT = (end: number): Shot[] => {
	const d = defs();
	for (let i = 1; i < d.length; i++) {
		if (d[i].start <= d[i - 1].start) throw new Error(`edit: shot ${d[i].id} starts before ${d[i - 1].id}`);
	}
	return d.map((x, i) => ({...x, from: x.start, to: i + 1 < d.length ? d[i + 1].start : end}) as unknown as Shot);
};

/** The landing holds this long after the last word (as before). */
export const LANDING_HOLD = 120;
export const EDIT_END = timing.durationInFrames + LANDING_HOLD;
export const SHOTS: Shot[] = EDIT(EDIT_END);
export const plateShots = (): Extract<Shot, {kind: 'plate'}>[] => SHOTS.filter((s): s is Extract<Shot, {kind: 'plate'}> => s.kind === 'plate');
/** Plate frames for a shot (30 fps, plus a handle). */
export const plateFrames = (s: Shot): number => Math.ceil((s.to - s.from) / (FPS / PLATE_FPS)) + PLATE_HANDLE / 2;
