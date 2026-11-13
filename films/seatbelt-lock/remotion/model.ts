// Film 3's mechanism, as numbers the picture and the HUD share (PLAYBOOK §8.4, §10.2: every drawn mechanism gets a
// numeric check). Two inertia sensors from the patents (claims C03, C04, C21) and the US standard's thresholds
// (C06–C08). Sizes are an illustration of one design, not a maker's drawing: the picture says ILLUSTRATION.

export const FPS = 60;
const G = 9.80665;

// ---------------- the reel (front section, millimetres) ----------------
export const REEL = {
	core: 16, // spool core radius
	webT: 1.1, // webbing thickness
	wound: 9, // turns left on the spool in the drawings
	ring: 41, // the frame's ring of teeth: base radius (the teeth point inward, tips at ring − toothH)
	teeth: 18,
	toothH: 4.2,
	disc: 33, // the heavy inertia disc's radius
	armPivot: 24, // the sensor arm's pivot radius, on the reel
	armLen: 15,
} as const;

/** Radius the webbing leaves the spool at (mm): the core plus the wound layers. */
export const spoolRadius = (turns = REEL.wound): number => REEL.core + turns * REEL.webT;

// ---------------- the belt sensor: a heavy disc coupled loosely to the reel ----------------
// The disc follows the reel through a light spring (patent US 4,485,986: the inertia member lags behind "owing to the
// difference in mass"). Modelled as a spring–damper: ωn = 2π·8 Hz, ζ = 0.6. Its lag behind the reel is about α/ωn²
// for a steady angular acceleration α: it answers how suddenly, not how fast (C21).
const WN = 2 * Math.PI * 8;
const ZETA = 0.6;
/** The lag (rad) at which the arm reaches the teeth and the reel locks. */
export const LOCK_LAG = (8 * Math.PI) / 180;

export type PullSim = {
	/** belt paid out, mm, per frame */
	payout: number[];
	/** reel angle, rad */
	reel: number[];
	/** disc angle, rad */
	disc: number[];
	/** frame the arm caught the teeth, or -1 */
	lockFrame: number;
};

/**
 * Integrate a pull: `speed(t)` is the belt speed in mm/s the hand asks for at time t (s). Once the arm catches, the reel
 * stops dead (the belt locks).
 */
export const simulatePull = (frames: number, speed: (t: number) => number, fps = FPS): PullSim => {
	const r = spoolRadius();
	const sub = 20;
	const dt = 1 / fps / sub;
	let p = 0;
	let th = 0;
	let om = 0;
	let ph = 0;
	let phd = 0;
	let lockFrame = -1;
	const out: PullSim = {payout: [], reel: [], disc: [], lockFrame: -1};
	for (let f = 0; f < frames; f++) {
		out.payout.push(p);
		out.reel.push(th);
		out.disc.push(ph);
		for (let k = 0; k < sub; k++) {
			const t = (f * sub + k) * dt;
			const v = lockFrame >= 0 ? 0 : speed(t);
			const omNew = v / r;
			om = omNew;
			th += om * dt;
			p += v * dt;
			// disc: phdd = wn²(θ − φ) + 2ζwn(ω − φ')
			const phdd = WN * WN * (th - ph) + 2 * ZETA * WN * (om - phd);
			phd += phdd * dt;
			ph += phd * dt;
			if (lockFrame < 0 && th - ph > LOCK_LAG) lockFrame = f;
		}
	}
	out.lockFrame = lockFrame;
	return out;
};

/** A slow lean: the belt eases out to 60 mm/s over a second (a reach for the glovebox). */
export const slowPull = (t: number): number => 60 * Math.min(1, t / 1.0) * (t < 2.4 ? 1 : Math.max(0, 1 - (t - 2.4) / 0.6));
/** A jerk: the belt asked to go to 1.5 m/s within 50 ms. */
export const jerkPull = (t: number): number => 1500 * Math.min(1, t / 0.05);

// ---------------- the car sensor: a steel ball in a cone-shaped cup ----------------
// The ball climbs the cup's wall when the car's deceleration a exceeds g·tan β (β: the wall's angle from horizontal).
// β is our model's choice, set inside the US standard's window (C06, C08): it must not roll at a 15° tilt, it must
// roll before 0.7 g and before 45°.
export const CUP_BETA = (19 * Math.PI) / 180;
export const ballThresholdG = Math.tan(CUP_BETA);

// ---------------- the load limiter: a torsion bar ----------------
/** Renault's lower limit (C13): 4 kN at the shoulder belt. */
export const LIMIT_KN = 4;
/** Belt force (kN) for a crash pulse ramp: rises, then holds flat at the limit while the bar twists (ILLUSTRATIVE ramp). */
export const beltForce = (t01: number, limit = LIMIT_KN, peakNoLimit = 9): number => {
	const raw = peakNoLimit * Math.sin(Math.min(1, t01) * Math.PI * 0.5) ** 1.4;
	return Math.min(raw, limit);
};

// ---------------- checks (run at import: a wrong model fails the render) ----------------
const check = (ok: boolean, msg: string): void => {
	if (!ok) throw new Error(`seatbelt model: ${msg}`);
};
{
	const slow = simulatePull(4 * FPS, slowPull);
	check(slow.lockFrame < 0, 'a slow lean must never lock');
	const jerk = simulatePull(2 * FPS, jerkPull);
	check(jerk.lockFrame >= 0 && jerk.lockFrame < 12, `a jerk must lock within 0.2 s (got frame ${jerk.lockFrame})`);
	// steady fast spin, no acceleration: no lag (it cares how suddenly, not how fast)
	const steady = simulatePull(3 * FPS, (t) => (t < 0 ? 0 : 400 * Math.min(1, t / 1.5)));
	check(steady.lockFrame < 0, 'a fast but gradual pull must not lock');
	// the cup sits inside the standard's window
	check(Math.tan((15 * Math.PI) / 180) < ballThresholdG, 'the ball must stay put at a 15° tilt');
	check(ballThresholdG < 0.7, 'the ball must roll before 0.7 g');
	check(CUP_BETA < (45 * Math.PI) / 180, 'the ball must roll before 45°');
	// the arm reaches the teeth: pivot radius + arm length ≥ the teeth's tip radius
	check(REEL.armPivot + REEL.armLen >= REEL.ring - REEL.toothH, 'the swung-out arm must reach past the teeth tips');
	check(REEL.disc < REEL.ring - REEL.toothH, 'the disc must clear the teeth');
	check(spoolRadius() + 2 < REEL.disc, 'the webbing must fit inside the disc');
	check(Math.abs(LIMIT_KN * 1000 / G / 80 - 5.1) < 0.05, 'four kilonewtons is about five 80 kg adults (C20)');
}
