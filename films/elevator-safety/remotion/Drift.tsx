import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ease, tween} from '../../../lib/remotion/motion';

// A slow camera push over a held stretch (viewer review v1, 2026-11-07: holds of 4–12 s where nothing visibly moved).
// It wraps a scene's drawing and labels, never its honesty tag or HUD (those stay put on the frame). The push is the
// camera's ease, a pure function of the frame; `s` is the scale reached, (ox, oy) the point it pushes toward, (dx, dy)
// a pan in px.
export const Drift: React.FC<{
	f: number;
	from: number;
	to: number;
	ox: number;
	oy: number;
	s?: number;
	dx?: number;
	dy?: number;
	/** optional: the frame the push starts easing back out (over 40 frames), so it never carries into the next move */
	release?: number;
	children: React.ReactNode;
}> = ({f, from, to, ox, oy, s = 1.1, dx = 0, dy = 0, release, children}) => {
	const p = tween(f, from, to, 0, 1, ease.camera) * (release === undefined ? 1 : tween(f, release, release + 40, 1, 0, ease.camera));
	return (
		<AbsoluteFill style={{transformOrigin: `${ox}px ${oy}px`, transform: `translate(${dx * p}px, ${dy * p}px) scale(${1 + (s - 1) * p})`}}>
			{children}
		</AbsoluteFill>
	);
};
