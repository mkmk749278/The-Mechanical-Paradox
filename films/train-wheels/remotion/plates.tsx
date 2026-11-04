import React, {useMemo} from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import * as THREE from 'three';
import {PathSample} from './geometry3d';
import {PATHS, SHOTS, ShotId} from './shots3d';
import {Stage3D, Track3D, Wheelset3D} from './Wheelset3D';

// A hero shot's 3D layer: the Blender plate (Cycles, rendered on GitHub's runners by .github/workflows/blender-render.yml
// from blender/render_shot.py) when its frames are in public/films/train-wheels/plates/<shot>/, otherwise the same state
// drawn live in three.js. A plate is listed in PLATES only once every frame of it is in Drive render-media/plates/.

export const PLATES: Partial<Record<ShotId, {ext: 'webp'}>> = {};

const pad = (n: number) => String(n).padStart(5, '0');

/** A tube along the top of one rail, from `from` (m along z) forward round the bend, drawn to `draw` of its length. */
export const RailPath: React.FC<{
	path: PathSample[];
	lateral: number;
	from: number;
	draw: number;
	color: string;
}> = ({path, lateral, from, draw, color}) => {
	const geo = useMemo(() => {
		const pts = path
			.filter((s) => s.p.y >= from)
			.map((s) => {
				const n = new THREE.Vector2(s.t.y, -s.t.x);
				return new THREE.Vector3(s.p.x + n.x * lateral, 0.012, s.p.y + n.y * lateral);
			});
		return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 400, 0.022, 8, false);
	}, [path, lateral, from]);
	const count = geo.index ? geo.index.count : 0;
	geo.setDrawRange(0, Math.floor((count * draw) / 6) * 6);
	return (
		<mesh geometry={geo}>
			<meshBasicMaterial color={color} toneMapped={false} />
		</mesh>
	);
};

/** The shot's 3D layer at the scene's local frame f. */
export const Shot3DView: React.FC<{
	id: ShotId;
	f: number;
	width: number;
	height: number;
}> = ({id, f, width, height}) => {
	const shot = SHOTS[id];
	const s = shot.state(f);
	const path = useMemo(() => PATHS[s.track.path](), [s.track.path]);
	const plate = PLATES[id];
	if (plate) {
		const n = Math.max(0, Math.min(shot.to() - shot.from() - 1, Math.round(f) - shot.from()));
		// the plate (steel, rails, shadows), then the blueprint layer live over it: edge lines, sleepers and drawn paths,
		// hidden behind the same wheelset and rails drawn depth-only
		return (
			<AbsoluteFill>
				<AbsoluteFill>
					<Img src={staticFile(`films/train-wheels/plates/${id}/${pad(n)}.${plate.ext}`)} style={{width, height}} />
				</AbsoluteFill>
				{/* its own layer: in the same flex column the canvas was pushed below the frame and never created */}
				<AbsoluteFill>
					<Stage3D width={width} height={height} cam={s.cam}>
						<Track3D path={path} draw={s.track.draw} edgeOpacity={s.track.edgeOpacity} depthOnlyRails />
						{s.wheelsets.map((w, i) => (
							<Wheelset3D key={i} {...w} occluder />
						))}
						{s.railPaths.map((r, i) => (
							<RailPath key={i} path={path} lateral={r.lateral} from={r.from} draw={r.draw} color={r.color} />
						))}
					</Stage3D>
				</AbsoluteFill>
			</AbsoluteFill>
		);
	}
	return (
		<Stage3D width={width} height={height} cam={s.cam}>
			<Track3D path={path} draw={s.track.draw} edgeOpacity={s.track.edgeOpacity} />
			{s.wheelsets.map((w, i) => (
				<Wheelset3D key={i} {...w} />
			))}
			{s.railPaths.map((r, i) => (
				<RailPath key={i} path={path} lateral={r.lateral} from={r.from} draw={r.draw} color={r.color} />
			))}
		</Stage3D>
	);
};
