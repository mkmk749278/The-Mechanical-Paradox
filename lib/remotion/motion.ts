import {Easing, interpolate, spring} from 'remotion';
import {physicalSpring} from './brand';

// Shared motion vocabulary (PLAYBOOK §6.4; owner's blueprint §2.3 rules 1–2). Physical bodies never move linearly:
// they ride a spring with real mass, damping and stiffness. Camera and type use eased curves.

export const ease = {
	/** Slow, cinematic in-out: camera pushes, pans. */
	camera: Easing.bezier(0.45, 0, 0.2, 1),
	/** Fast start, long settle: things arriving. */
	arrive: Easing.bezier(0.16, 1, 0.3, 1),
	/** Gentle out: things leaving. */
	leave: Easing.bezier(0.7, 0, 0.84, 0),
	/** A pen drawing a line. */
	draw: Easing.bezier(0.65, 0, 0.35, 1),
} as const;

/** Clamped, eased interpolation from frame a to b. */
export const tween = (
	frame: number,
	a: number,
	b: number,
	from: number,
	to: number,
	easing: (t: number) => number = ease.camera,
): number => interpolate(frame, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

/** 0 → 1 → 0: fade in over `fadeIn` frames from `start`, out over `fadeOut` frames before `end`. */
export const envelope = (frame: number, start: number, end: number, fadeIn = 12, fadeOut = 12): number =>
	Math.min(tween(frame, start, start + fadeIn, 0, 1, ease.arrive), tween(frame, end - fadeOut, end, 1, 0, ease.leave));

/** The channel's physical spring (mass 1.2, damping 24, stiffness 180), starting at `start`. */
export const physical = (frame: number, fps: number, start: number, config: Partial<typeof physicalSpring> = {}): number =>
	spring({frame: frame - start, fps, config: {...physicalSpring, ...config}});

/** The mathematical Ken Burns (blueprint §2.3 rule 1): a slow 1.02 → 1.05 push across a shot. Never static. */
export const microPush = (frame: number, duration: number, from = 1.02, to = 1.05): number =>
	tween(frame, 0, duration, from, to, ease.camera);

/** Damped oscillation after an impulse at `start`: the elastic shudder of a jammed or struck part. */
export const shudder = (frame: number, fps: number, start: number, amplitude: number, hz = 7, decay = 5.5): number => {
	const t = (frame - start) / fps;
	if (t < 0) return 0;
	return amplitude * Math.exp(-decay * t) * Math.sin(2 * Math.PI * hz * t);
};
