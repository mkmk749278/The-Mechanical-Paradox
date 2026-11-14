import {FPS} from './model';
import {PLATE_FPS, plateFrames, SHOTS} from './edit';

/** How much the disc's lag behind the reel is enlarged in the plates. */
export const LAG_SHOW = 3;

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
		const st = s.state(t, g) as {reel?: number; disc?: number};
		// the disc's lag is drawn ×LAG_SHOW (8° does not read on a phone; viewer panel v2): the picture says NOT TO SCALE,
		// the HUD keeps the true value, and the arm's swing still follows the true lag
		if (s.set === 'retractor' && st.reel !== undefined && st.disc !== undefined) st.disc = st.reel - (st.reel - st.disc) * LAG_SHOW;
		return {cam: s.cam(t), state: st};
	});
	return {set: s.set, fps: PLATE_FPS, frames};
};

/** Every plate shot id, in edit order (the workflow's `shots` input). */
export const plateIds = (): string[] => SHOTS.filter((x) => x.kind === 'plate').map((x) => x.id);
