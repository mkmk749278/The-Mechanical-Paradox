import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {colors} from '../../../lib/remotion/brand';
import {Hud} from '../../../lib/remotion/Hud';
import {ease, tween} from '../../../lib/remotion/motion';
import {SfxCue} from '../../../lib/remotion/sfx';
import {PathSample} from './geometry3d';
import {H, Label, off, on, Stage, Svg, Tag, W} from './kit';
import {WS} from './model';
import {at, span} from './scenes';
import {Shot3DView} from './plates';
import {CameraSpec, Stage3D, Track3D, Wheelset3D} from './Wheelset3D';

// s15 the landing (scenes/s15_landing.md): a coach on a tight bend at night, its treads sliding (crimson); then the one
// wheelset, its axle, its two wheels, and the gentle slope as the last amber line.

const S = () => span('s15');
const T = () => ({
	next: at('s15', 'So the next time you hear that screech'),
	means: at('s15', 'you will know what it means'),
	runOut: at('s15', 'The cone has run out'),
	sliding: at('s15', 'sliding sideways'),
	axle: at('s15', 'One solid axle'),
	locked: at('s15', 'Two wheels locked together'),
	slope: at('s15', 'And a gentle slope on every wheel'),
	gentle: at('s15', 'On gentle curves'),
	last: at('s15', 'That is how a train steers'),
	end: S().dur,
});

// the bend: a straight lead, then a tight left-hand curve (radius 60 m: tight enough for the flange)
const RB = 60;
const LEAD = 10;
const P = (s: number): {x: number; z: number; yaw: number} => {
	if (s < LEAD) return {x: 0, z: s, yaw: 0};
	const th = (s - LEAD) / RB;
	return {x: -RB + RB * Math.cos(th), z: LEAD + RB * Math.sin(th), yaw: -th};
};
const bendPath = (): PathSample[] => {
	const out: PathSample[] = [];
	for (let s = -20; s <= LEAD + RB * 2.2; s += 0.5) {
		const p = P(s);
		out.push({p: new THREE.Vector2(p.x, p.z), t: new THREE.Vector2(Math.sin(p.yaw), Math.cos(p.yaw))});
	}
	return out;
};

/** A coach body in line art (edges only): body, window band, roof line, two bogie frames. */
const Coach: React.FC<{sc: number}> = ({sc}) => {
	const body = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(2.8, 2.9, 20, 1, 1, 1)), []);
	const band = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(2.82, 0.9, 17.5)), []);
	const frame = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(2.3, 0.35, 3.3)), []);
	const bogies = [sc - 7, sc + 7].map(P);
	const mid = {x: (bogies[0].x + bogies[1].x) / 2, z: (bogies[0].z + bogies[1].z) / 2};
	const chordYaw = Math.atan2(bogies[1].x - bogies[0].x, bogies[1].z - bogies[0].z);
	return (
		<group>
			<group position={[mid.x, 0, mid.z]} rotation={[0, chordYaw, 0]}>
				<lineSegments geometry={body} position={[0, 1.15 + 1.45, 0]}>
					<lineBasicMaterial color={colors.line} transparent opacity={0.85} />
				</lineSegments>
				<lineSegments geometry={band} position={[0, 2.95, 0]}>
					<lineBasicMaterial color={colors.sub} transparent opacity={0.7} />
				</lineSegments>
			</group>
			{bogies.map((b, i) => (
				<group key={i} position={[b.x, 0.85, b.z]} rotation={[0, b.yaw, 0]}>
					<lineSegments geometry={frame}>
						<lineBasicMaterial color={colors.sub} transparent opacity={0.9} />
					</lineSegments>
				</group>
			))}
		</group>
	);
};

export const Landing: React.FC = () => {
	const f = useCurrentFrame();
	const t = T();
	const toHero = tween(f, t.axle - 40, t.axle - 4, 0, 1, ease.camera);
	// night bend: the coach rolls round at 2 m/s (ILLUSTRATIVE), its bogies stiff, the leading axles at an angle
	const sc = 26 + (2 * f) / 60;
	const path = useMemo(bendPath, []);
	const bogies = [sc - 7, sc + 7].map(P);
	// each bogie holds its axles parallel to its frame: on the bend they are not radial (the angle of attack)
	const wheelsets = bogies.flatMap((b) => [-1.25, 1.25].map((d) => ({x: b.x + Math.sin(b.yaw) * d, z: b.z + Math.cos(b.yaw) * d, yaw: b.yaw})));
	const lookAt = P(sc + 7);
	// outside the bend, ahead of the leading bogie, low: the wheels come toward us
	const fw = {x: Math.sin(lookAt.yaw), z: Math.cos(lookAt.yaw)};
	const nr = {x: fw.z, z: -fw.x};
	const camNight: CameraSpec = {
		position: [lookAt.x + nr.x * 5.5 + fw.x * 7, 0.8, lookAt.z + nr.z * 5.5 + fw.z * 7],
		target: [lookAt.x - fw.x * 1.5, 0.6, lookAt.z - fw.z * 1.5],
		fov: 38,
	};
	const heat = on(f, t.runOut, 30);
	// the screech, complete now (the trace s03 cut short)
	const ringPts: string[] = [];
	const drawn = tween(f, t.next + 20, t.means + 40, 0, 1, ease.draw);
	for (let i = 0; i <= 400 * drawn; i++) {
		const u = i / 400;
		const v = Math.sin(u * 2 * Math.PI * 34) * (0.25 + 0.75 * Math.min(1, u * 3)) * 0.9;
		ringPts.push(`${(130 + u * 560).toFixed(1)},${(905 - v * 55).toFixed(1)}`);
	}
	return (
		<Stage
			dur={S().dur}
			light={{x: 0.5, y: 0.6}}
			overlay={
				<Hud
					title="TIGHT CURVE"
					start={t.runOut - 10}
					end={t.axle - 20}
					width={440}
					note="FLANGE CONTACT"
					rows={[{label: 'PLAY LEFT', unit: 'mm', keys: [{frame: 0, value: 0}], decimals: 0, tone: 'crimson', source: 'C15'}]}
				/>
			}
		>
			{/* each 3D canvas is mounted only while it can be seen: both mounted on every frame made this the farm's slowest
			    shard by far (3 h+ at 720p, 2026-11-04) */}
			{toHero < 1 && (
			<AbsoluteFill style={{opacity: 1 - toHero}}>
				<Stage3D width={W} height={H} cam={camNight}>
					<Track3D path={path} edgeOpacity={0.6} />
					<Coach sc={sc} />
					{wheelsets.map((w, i) => (
						<Wheelset3D key={i} at={[w.x, w.z]} yaw={w.yaw} rolled={sc} shift={WS.clear} heat={heat} />
					))}
				</Stage3D>
				<Svg opacity={on(f, t.next, 20)}>
					<rect x={110} y={828} width={600} height={150} fill="rgba(7,10,15,0.85)" stroke={colors.sub} strokeWidth={1.5} />
					<line x1={130} y1={905} x2={690} y2={905} stroke={colors.grid} strokeWidth={2} />
					<polyline points={ringPts.join(' ')} fill="none" stroke={colors.crimson} strokeWidth={3} style={{filter: `drop-shadow(0 0 6px ${colors.crimson})`}} />
				</Svg>
				<Label x={130} y={836} size={26} color={colors.sub} opacity={on(f, t.next, 20)}>
					THE SCREECH
				</Label>
				<Label x={130} y={150} size={44} color={colors.crimson} weight={700} opacity={on(f, t.runOut, 20)}>
					THE CONE HAS RUN OUT
				</Label>
				<Label x={130} y={210} size={36} color={colors.line} weight={600} opacity={on(f, t.sliding, 20)}>
					THE TREADS SLIDE SIDEWAYS
				</Label>
				<Tag x={96} y={H - 110} opacity={on(f, 0, 20) * (1 - on(f, t.next, 20))}>
					LINE DRAWING · NIGHT
				</Tag>
			</AbsoluteFill>
			)}
			{toHero > 0 && (
			<AbsoluteFill style={{opacity: toHero}}>
				<Shot3DView id="s15hero" f={f} width={W} height={H} />
				<Label x={W / 2} y={140} size={44} color={colors.line} weight={700} align="center" opacity={Math.min(on(f, t.axle, 16), off(f, t.locked - 10, 16))}>
					ONE SOLID AXLE
				</Label>
				<Label x={W / 2} y={140} size={44} color={colors.line} weight={700} align="center" opacity={Math.min(on(f, t.locked, 16), off(f, t.slope - 10, 16))}>
					TWO WHEELS, LOCKED TOGETHER
				</Label>
				<Label x={W / 2} y={140} size={44} color={colors.amber} weight={700} align="center" opacity={Math.min(on(f, t.slope + 10, 16), off(f, t.gentle + 40, 24))}>
					A GENTLE SLOPE · 1 : 20
				</Label>
			</AbsoluteFill>
			)}
		</Stage>
	);
};

export const landingCues = (): SfxCue[] => {
	const t = T();
	return [
		{frame: t.next + 20, sfx: 'flow_sweep', gainDb: -14},
		{frame: t.runOut, sfx: 'metal_jam_sub', gainDb: -16},
		{frame: t.axle, sfx: 'relay_click', gainDb: -12},
		{frame: t.locked, sfx: 'relay_click', gainDb: -12},
		{frame: t.slope + 10, sfx: 'glass_tone', gainDb: -10},
	];
};
