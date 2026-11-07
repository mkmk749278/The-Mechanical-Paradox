import {interpolate} from 'remotion';
import {ease} from '../../../lib/remotion/motion';
import {Cam} from './Shaft';

// One continuous camera (PLAYBOOK §8.1): keyframes in frames, eased between, never cut. A key may follow a moving
// subject: give it a function of the frame.
export type CamKey = {f: number; cam: Cam | ((f: number) => Cam)};

export const camPath = (f: number, keys: CamKey[]): Cam => {
	const get = (k: CamKey): Cam => (typeof k.cam === 'function' ? k.cam(f) : k.cam);
	if (f <= keys[0].f) return get(keys[0]);
	for (let i = 0; i < keys.length - 1; i++) {
		const a = keys[i];
		const b = keys[i + 1];
		if (f <= b.f) {
			const u = interpolate(f, [a.f, b.f], [0, 1], {easing: ease.camera, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
			const A = get(a);
			const B = get(b);
			// scale eases in log space so a push feels even
			return {cx: A.cx + (B.cx - A.cx) * u, cy: A.cy + (B.cy - A.cy) * u, s: Math.exp(Math.log(A.s) + (Math.log(B.s) - Math.log(A.s)) * u)};
		}
	}
	return get(keys[keys.length - 1]);
};
