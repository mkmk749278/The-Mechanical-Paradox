// Film 2's physics model: the same example lift as research/model.py (claims C03, C14, C18, C21, C24), plus the
// drawing models every mechanism on screen runs on. Each one is checked here at import time, like a gear mesh
// (PLAYBOOK §8.3): a mechanism drawn from an equation must hold numerically, or the bundle fails.

export const G = 9.80665;

// ---- the example lift (research/model.py) ----
export const LIFT = {
	/** rated speed, m/s */
	vRated: 1.6,
	/** governor trip speed, m/s, inside the EN 81-20 window */
	vTrip: 2.0,
	/** car and rated load, kg (counterweight = car + 45 % of load: C24) */
	car: 1000,
	load: 1000,
} as const;

export const tripMin = 1.15 * LIFT.vRated;
export const tripMax = 1.25 * LIFT.vRated + 0.25 / LIFT.vRated;
export const counterweight = LIFT.car + 0.45 * LIFT.load;

/** Free fall from rest: time and distance to reach the trip speed. */
export const freeFall = {t: LIFT.vTrip / G, d: (LIFT.vTrip * LIFT.vTrip) / (2 * G)};
/** Stop from the trip speed at an average net retardation of a·g: distance (m) and time (s). */
export const stop = (aG: number): {d: number; t: number} => ({d: (LIFT.vTrip * LIFT.vTrip) / (2 * aG * G), t: LIFT.vTrip / (aG * G)});
/** The grab-hard stop: 2 m/s to rest in 2 cm, in g. */
export const hardStopG = (LIFT.vTrip * LIFT.vTrip) / (2 * 0.02) / G;

// ---- the governor (a classic flyweight governor; SIMPLIFIED drawing model) ----
/** Sheave pitch radius, m: 300 mm diameter (EN 81-20 asks ≥ 30 × rope diameter; an 8 mm rope needs ≥ 240 mm). */
export const GOV_R = 0.15;
/** Sheave speed for a car speed v (m/s): rpm. */
export const govRpm = (v: number): number => (v / GOV_R / (2 * Math.PI)) * 60;
/**
 * Flyweight radius (mm from the axle) against car speed: a mass on a spring, m·ω²·r = k·(r − r0), so
 * r = r0 / (1 − (m/k)·ω²). r0 (rest) 40 mm; m/k chosen so the weights reach the latch radius exactly at the trip
 * speed. Past the latch the pawl holds them (clamped).
 */
export const FLY = {r0: 40, rLatch: 62} as const;
const omega = (v: number) => v / GOV_R;
const mOverK = (1 - FLY.r0 / FLY.rLatch) / (omega(LIFT.vTrip) * omega(LIFT.vTrip));
export const flyRadius = (v: number): number => Math.min(FLY.rLatch, FLY.r0 / (1 - mOverK * omega(Math.abs(v)) * omega(Math.abs(v))));

// ---- the rope, the lever and the wedge (SIMPLIFIED, drawn NOT TO SCALE where marked) ----
/** Lever arm from pivot to the governor-rope hitch, mm, and its travel until the wedges touch, degrees. */
export const LEVER = {arm: 180, maxDeg: 28} as const;
/** Lever angle (deg) for the car's travel (mm) past the stopped governor rope: arc = travel, until the wedges stop it. */
export const leverDeg = (travelMm: number): number => Math.min(LEVER.maxDeg, ((Math.max(0, travelMm) / LEVER.arm) * 180) / Math.PI);
/** The wedge slot's taper, degrees (Otis US 10,407,278: self-locking angle 5°–11°). */
export const SLOT_DEG = 8;
/** Clamp gap closed per mm of wedge climb (both faces of one wedge: tan of the taper). */
export const closePerMm = Math.tan((SLOT_DEG * Math.PI) / 180);
/** The wedge climbs until the jaws have opened by the springs' design travel, mm of jaw opening. */
export const SPRING_TRAVEL = 3;
/** Wedge climb (mm) needed to load the springs fully once the wedge touches the rail. */
export const climbToSpring = SPRING_TRAVEL / closePerMm;

// ---- checks (fail the bundle, never the picture) ----
const check = (ok: boolean, what: string): void => {
	if (!ok) throw new Error(`film 2 model check failed: ${what}`);
};
check(tripMin <= LIFT.vTrip && LIFT.vTrip < tripMax, 'trip speed inside the EN 81-20 window');
check(Math.abs(freeFall.t - 0.204) < 0.002 && Math.abs(freeFall.d - 0.204) < 0.002, 'free fall to trip ≈ 0.2 s, 0.2 m');
check(Math.abs(stop(1).d - 0.204) < 0.002 && Math.abs(stop(0.2).d - 1.02) < 0.01, 'stops 0.20–1.02 m (C21)');
check(hardStopG > 10 && hardStopG < 10.5, '2 cm stop ≈ 10.2 g (C14)');
check(counterweight - LIFT.car > 0, 'empty car lighter than the counterweight (C25)');
check(Math.abs(flyRadius(LIFT.vTrip) - FLY.rLatch) < 0.05, 'flyweights reach the latch exactly at the trip speed');
check(flyRadius(LIFT.vRated) < FLY.rLatch - 5, 'at rated speed the flyweights stay clear of the latch');
check(flyRadius(0) === FLY.r0, 'flyweights rest at r0');
check(Math.abs(govRpm(LIFT.vTrip) - 127.3) < 0.5, 'governor sheave 127 rpm at the trip speed');
check(Math.abs(leverDeg(((LEVER.maxDeg * Math.PI) / 180) * LEVER.arm) - LEVER.maxDeg) < 1e-9, 'lever angle follows the car travel');
check(SLOT_DEG >= 5 && SLOT_DEG <= 11, 'slot taper inside the self-locking range');
check(climbToSpring > 20 && climbToSpring < 22, 'wedge climbs ≈ 21 mm to load the springs');

// ---- the cold open's fall, on one clock (real seconds since the ropes part) ----
/** Average net retardation the picture uses while the wedges brake (a mid setting inside 0.2–1 g). */
export const A_BRAKE = 0.6;
/** Car state t seconds after the ropes part (from rest): drop (m, positive down), speed (m/s), braking flag. */
export const fall = (t: number): {drop: number; v: number; braking: boolean; done: boolean} => {
	if (t <= 0) return {drop: 0, v: 0, braking: false, done: false};
	const tT = freeFall.t;
	if (t <= tT) return {drop: 0.5 * G * t * t, v: G * t, braking: false, done: false};
	const a = A_BRAKE * G;
	const tb = Math.min(t - tT, LIFT.vTrip / a);
	return {drop: freeFall.d + LIFT.vTrip * tb - 0.5 * a * tb * tb, v: LIFT.vTrip - a * tb, braking: tb < LIFT.vTrip / a, done: tb >= LIFT.vTrip / a};
};
export const FALL_END = freeFall.t + LIFT.vTrip / (A_BRAKE * G);
check(Math.abs(fall(FALL_END + 1).drop - (freeFall.d + stop(A_BRAKE).d)) < 1e-6, 'the fall ends where model.py says (0.54 m)');
check(Math.abs(fall(freeFall.t).v - LIFT.vTrip) < 1e-9, 'the governor trips at 2.0 m/s');
