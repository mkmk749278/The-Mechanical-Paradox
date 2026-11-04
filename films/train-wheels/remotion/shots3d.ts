import {colors} from '../../../lib/remotion/brand';
import {ease, tween} from '../../../lib/remotion/motion';
import {curvePath, PathSample, straightPath} from './geometry3d';
import {off, on, pen} from './kit';
import {WS} from './model';
import {at, span} from './scenes';
import {camAt, CameraSpec, CamKey, WheelsetPose} from './Wheelset3D';

// The 3D state of each Blender hero shot as a pure function of the scene's local frame: camera, wheelset poses,
// track and drawn paths. The Remotion scene draws from it (three.js, or the Blender plate when it is ready) and
// scripts/export_blender_shot.mjs hands the same numbers to Blender, so the plate, the HUD and every 2D callout share
// one driver (CLAUDE.md: HUD values and the picture share one driver).

export type RailPathSpec = {lateral: number; from: number; draw: number; color: string};
export type Shot3D = {
	cam: CameraSpec;
	track: {path: string; draw: number; edgeOpacity: number};
	wheelsets: WheelsetPose[];
	railPaths: RailPathSpec[];
};

/** Track paths by name: the exporter builds the same rails from them. */
export const PATHS: Record<string, () => PathSample[]> = {
	bend24: () => curvePath(24, 90, 14, -8, 360),
	hero: () => straightPath(-16, 16, 2),
	straight14: () => straightPath(-14, 14, 2),
};

// ---- s01 the cold open ----
export const V1 = 0.68; // m/s: a slow roll, so the eye can follow the wheels (ILLUSTRATIVE)
export const T1 = () => ({
	locked: at('s01', 'locked to one solid steel axle'),
	together: at('s01', 'both wheels always turn together'),
	bend: at('s01', 'But on a bend'),
	farther: at('s01', 'has farther to go'),
	skid: at('s01', "So why doesn't one of them skid"),
	end: span('s01').dur,
});

const KEYS1 = (): CamKey[] => {
	const t = T1();
	return [
		{f: 0, cam: {position: [2.25, 0.6, 2.5], target: [0, 0.42, 0], fov: 30}},
		{f: t.bend - 40, cam: {position: [2.7, 0.95, 1.0], target: [0, 0.4, 0.2], fov: 30}},
		{f: t.farther + 60, cam: {position: [1.8, 6.5, -5.5], target: [-1.5, 0, 5], fov: 46}},
		{f: t.skid + 10, cam: {position: [1.6, 6.2, -5.0], target: [-1.5, 0, 5], fov: 46}},
		{f: t.end, cam: {position: [1.75, 0.4, 1.05], target: [0.76, 0.06, 0], fov: 28}},
	];
};

export const coldOpen3D = (f: number): Shot3D => {
	const t = T1();
	const zw = -2 + (V1 * f) / 60;
	const rel = camAt(f, KEYS1(), ease.camera);
	const paths = pen(f, t.farther - 10, 90);
	return {
		cam: {position: [rel.position[0], rel.position[1], rel.position[2] + zw], target: [rel.target[0], rel.target[1], rel.target[2] + zw], fov: rel.fov},
		track: {path: 'bend24', draw: Math.max(0.35, pen(f, t.bend, 70)), edgeOpacity: 0.85},
		wheelsets: [{rolled: zw + 2, at: [0, zw], glow: 0}],
		railPaths:
			paths > 0
				? [
						{lateral: -WS.b0 / 1000, from: zw, draw: paths, color: colors.amber},
						{lateral: WS.b0 / 1000, from: zw, draw: paths, color: colors.crimson},
					]
				: [],
	};
};

// ---- s03 the promise: the tread, close, as it lights amber on "the shape of the wheel" ----
export const T3 = () => ({
	shape: at('s03', 'the shape of the wheel'),
	noticed: at('s03', "you've probably never noticed it"),
	screech: at('s03', 'explains the screech'),
	sway: at('s03', 'why fast trains sway'),
	end: span('s03').dur,
});

export const promise3D = (f: number): Shot3D => {
	const t = T3();
	return {
		cam: camAt(
			f,
			[
				{f: 0, cam: {position: [0.86, 0.1, 3.2], target: [0.76, 0.12, 0], fov: 11}},
				{f: t.end, cam: {position: [1.05, 0.16, 2.9], target: [0.76, 0.12, 0], fov: 10}},
			],
			ease.camera,
		),
		track: {path: 'straight14', draw: 1, edgeOpacity: 0.85},
		wheelsets: [{rolled: (0.35 * f) / 60, glow: tween(f, t.shape, t.shape + 40, 0, 1, ease.draw)}],
		railPaths: [],
	};
};

// ---- s15 the landing: the hero wheelset (the night bend before it stays a line drawing) ----
export const T15 = () => ({
	next: at('s15', 'So the next time you hear'),
	means: at('s15', 'you will know what it means'),
	runOut: at('s15', 'The cone has run out'),
	sliding: at('s15', 'sliding sideways'),
	axle: at('s15', 'One solid axle'),
	locked: at('s15', 'Two wheels locked together'),
	slope: at('s15', 'And a gentle slope on every wheel'),
	gentle: at('s15', 'On gentle curves'),
	end: span('s15').dur,
});

export const landingHero3D = (f: number): Shot3D => {
	const t = T15();
	const cam = camAt(
		f,
		[
			{f: t.axle - 40, cam: {position: [2.6, 0.7, 2.9], target: [0, 0.62, 0], fov: 30}},
			{f: t.slope, cam: {position: [3.1, 0.85, 2.2], target: [0, 0.6, 0], fov: 30}},
			{f: t.gentle + 60, cam: {position: [3.4, 1.4, 3.4], target: [0, 0.35, 0], fov: 32}},
			{f: t.end, cam: {position: [4.2, 1.8, 4.4], target: [0, 0.32, 0], fov: 32}},
		],
		ease.camera,
	);
	return {
		cam,
		track: {path: 'hero', draw: 1, edgeOpacity: 0.5},
		wheelsets: [
			{
				rolled: (0.45 * f) / 60,
				axleGlow: Math.min(on(f, t.axle, 20), off(f, t.slope, 40)) * 0.9,
				glow: tween(f, t.slope + 10, t.slope + 60, 0, 1, ease.draw),
			},
		],
		railPaths: [],
	};
};

/** The Blender shots: which scene, which of its local frames, and the state function. */
export const SHOTS = {
	s01: {scene: 's01' as const, from: () => 0, to: () => span('s01').dur + 18, state: coldOpen3D},
	s03: {scene: 's03' as const, from: () => 0, to: () => span('s03').dur + 18, state: promise3D},
	s15hero: {scene: 's15' as const, from: () => T15().axle - 40, to: () => span('s15').dur, state: landingHero3D},
};
export type ShotId = keyof typeof SHOTS;
