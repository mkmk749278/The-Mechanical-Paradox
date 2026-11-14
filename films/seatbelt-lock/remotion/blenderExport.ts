import {FPS} from './model';
import {PLATE_FPS, plateFrames, SHOTS} from './edit';

// Film 3's plates for blender-render.yml (scripts/export_blender_shot.mjs → films/seatbelt-lock/blender/render.py):
// one shot of the edit (edit.ts) as per-frame camera and mechanism state at 30 fps, from the same functions the
// callouts and the HUD read.
export const exportShot = (id: string) => {
	const s = SHOTS.find((x) => x.id === id);
	if (!s || s.kind !== 'plate') throw new Error(`no plate shot "${id}"`);
	const step = FPS / PLATE_FPS;
	const frames = Array.from({length: plateFrames(s)}, (_, k) => {
		const g = s.from + k * step;
		const t = (k * step) / FPS;
		return {cam: s.cam(t), state: s.state(t, g)};
	});
	return {set: s.set, fps: PLATE_FPS, frames};
};

/** Every plate shot id, in edit order (the workflow's `shots` input). */
export const plateIds = (): string[] => SHOTS.filter((x) => x.kind === 'plate').map((x) => x.id);
