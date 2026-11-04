import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import React, {useLayoutEffect, useMemo} from 'react';
import {random} from 'remotion';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {colors} from '../../../lib/remotion/brand';
import {WS} from './model';
import {axleGeometry, journalGeometry, PathSample, railGeometries, sleepersAlong, wheelGeometry} from './geometry3d';
import {contact} from './profiles';

// The film's one solid object (treatment: "the wheelset is the one solid, lit object: specular steel tread, cast-iron
// gray web"), and the track drawn as a blueprint: rails as clean extruded profiles with drawn edges, sleepers as thin
// slate lines. Lighting: a studio environment (built when the canvas is created, never loaded) plus a key and a cool
// rim, so the steel reads as steel on the abyss.

export type CameraSpec = {position: [number, number, number]; target: [number, number, number]; fov: number};

const CameraRig: React.FC<{cam: CameraSpec}> = ({cam}) => {
	const {camera} = useThree();
	useLayoutEffect(() => {
		const c = camera as THREE.PerspectiveCamera;
		c.position.set(...cam.position);
		c.fov = cam.fov;
		c.near = 0.01;
		c.far = 400;
		c.lookAt(new THREE.Vector3(...cam.target));
		c.updateProjectionMatrix();
	}, [camera, cam]);
	return null;
};

const Environment: React.FC = () => {
	const {gl, scene} = useThree();
	useLayoutEffect(() => {
		const pmrem = new THREE.PMREMGenerator(gl);
		const env = pmrem.fromScene(new RoomEnvironment(), 0.035).texture;
		scene.environment = env;
		gl.toneMapping = THREE.ACESFilmicToneMapping;
		gl.toneMappingExposure = 1.0;
		gl.outputColorSpace = THREE.SRGBColorSpace;
		return () => {
			env.dispose();
			pmrem.dispose();
		};
	}, [gl, scene]);
	return null;
};

/** A 3D stage over the blueprint: transparent canvas, studio light, the channel's key and rim. */
export const Stage3D: React.FC<{width: number; height: number; cam: CameraSpec; children: React.ReactNode; envIntensity?: number}> = ({
	width,
	height,
	cam,
	children,
}) => (
	<ThreeCanvas width={width} height={height} gl={{antialias: true, alpha: true, preserveDrawingBuffer: true}} camera={{fov: cam.fov, position: cam.position}}>
		<CameraRig cam={cam} />
		<Environment />
		<ambientLight intensity={0.08} />
		<directionalLight position={[3, 5, -2.5]} intensity={2.2} color="#FFFFFF" />
		<directionalLight position={[-4, 1.5, 3]} intensity={1.1} color="#9EC9FF" />
		<directionalLight position={[0, -3, 2]} intensity={0.25} color="#FF9F1C" />
		{children}
	</ThreeCanvas>
);

/**
 * Weathering for the wheel body, deterministic (seeded): faint radial streaks and blotches round the circumference,
 * so a turning wheel visibly turns (a lathed wheel is otherwise the same at every angle).
 */
const weatherTexture = (seed: string): THREE.Texture => {
	const W = 1024;
	const H = 64;
	const c = document.createElement('canvas');
	c.width = W;
	c.height = H;
	const g = c.getContext('2d') as CanvasRenderingContext2D;
	g.fillStyle = '#FFFFFF';
	g.fillRect(0, 0, W, H);
	for (let i = 0; i < 46; i++) {
		const x = random(`${seed}-x-${i}`) * W;
		const w = 18 + random(`${seed}-w-${i}`) * 90;
		const a = 0.025 + random(`${seed}-a-${i}`) * 0.05;
		const shade = random(`${seed}-s-${i}`) > 0.7 ? '214,196,176' : '24,30,38';
		const grad = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
		grad.addColorStop(0, `rgba(${shade},0)`);
		grad.addColorStop(0.5, `rgba(${shade},${a})`);
		grad.addColorStop(1, `rgba(${shade},0)`);
		g.fillStyle = grad;
		g.fillRect(x - w / 2, 0, w, H);
	}
	// one long service mark (a paint dab on the web), the eye's anchor for the spin
	g.fillStyle = 'rgba(232,236,240,0.55)';
	g.fillRect(W * 0.2, H * 0.42, 10, H * 0.22);
	const t = new THREE.CanvasTexture(c);
	t.wrapS = THREE.RepeatWrapping;
	t.colorSpace = THREE.SRGBColorSpace;
	t.anisotropy = 4;
	return t;
};

const useSteel = () =>
	useMemo(
		() => ({
			body: new THREE.MeshStandardMaterial({color: '#646D78', metalness: 0.8, roughness: 0.5, side: THREE.DoubleSide, envMapIntensity: 0.9, map: weatherTexture('web')}),
			band: new THREE.MeshStandardMaterial({color: '#DCE3EA', metalness: 1, roughness: 0.17, side: THREE.DoubleSide, envMapIntensity: 1.35}),
			axle: new THREE.MeshStandardMaterial({color: '#6B7684', metalness: 0.8, roughness: 0.38, side: THREE.DoubleSide, envMapIntensity: 0.9}),
			journal: new THREE.MeshStandardMaterial({color: '#C9D1D9', metalness: 1, roughness: 0.14, side: THREE.DoubleSide, envMapIntensity: 1.3}),
		}),
		[],
	);

export type WheelsetPose = {
	/** Distance along the track the wheelset has rolled, m (sets the wheel's spin). */
	rolled?: number;
	/** Lateral shift toward +x, mm (the drift, C07). */
	shift?: number;
	/** Yaw about the vertical, rad (+ turns the front toward −x). */
	yaw?: number;
	/** Position of the wheelset centre on the ground plane, m: [x, z]. */
	at?: [number, number];
	/** Extra roll of the whole wheelset about the track direction, rad (flange climb). */
	lift?: number;
	/** Glow on the tread bands: 0–1 (amber, "the shape does the steering"). */
	glow?: number;
	/** Heat on the tread bands: 0–1 (crimson, sliding). */
	heat?: number;
	/** Glow on the flanges: 0–1 (amber). */
	flangeGlow?: number;
};

/** An axle-end cap with three bolts on each journal end: the spin you can see from the side. */
const EndCaps: React.FC<{material: THREE.Material; bolt: THREE.Material}> = ({material, bolt}) => {
	const cap = useMemo(() => new THREE.CylinderGeometry(0.058, 0.058, 0.014, 64).rotateZ(Math.PI / 2), []);
	const hex = useMemo(() => new THREE.CylinderGeometry(0.011, 0.011, 0.012, 6).rotateZ(Math.PI / 2), []);
	return (
		<>
			{[1, -1].map((side) => (
				<group key={side} position={[side * 1.037, 0, 0]}>
					<mesh geometry={cap} material={material} />
					{[0, 1, 2].map((k) => {
						const a = (k * 2 * Math.PI) / 3 + 0.3;
						return <mesh key={k} geometry={hex} material={bolt} position={[side * 0.012, 0.034 * Math.cos(a), 0.034 * Math.sin(a)]} />;
					})}
				</group>
			))}
		</>
	);
};

/** The wheelset: two lathed wheels from profiles.ts, the axle and its journals. Spin follows rolling distance / r0. */
export const Wheelset3D: React.FC<WheelsetPose> = ({rolled = 0, shift = 0, yaw = 0, at = [0, 0], lift = 0, glow = 0, heat = 0, flangeGlow = 0}) => {
	const steel = useSteel();
	const geo = useMemo(() => ({right: wheelGeometry(1), left: wheelGeometry(-1), axle: axleGeometry(), journals: journalGeometry()}), []);
	const bandMat = useMemo(() => steel.band.clone(), [steel]);
	const flangeMat = useMemo(() => steel.body.clone(), [steel]);
	flangeMat.emissive = new THREE.Color(colors.amber).multiplyScalar(flangeGlow * 0.85);
	const emissive = new THREE.Color(colors.amber).multiplyScalar(glow * 0.6).add(new THREE.Color(colors.crimson).multiplyScalar(heat * 1.1));
	bandMat.emissive = emissive;
	// lit amber, the steel dims under the glow so it reads as colour, not as white
	bandMat.color = new THREE.Color('#DCE3EA').lerp(new THREE.Color('#2E2418'), Math.min(1, glow + heat) * 0.85);
	// the axle sits at the height the contact solver gives for this shift (rail crown at y = 0)
	const axleY = contact(Math.abs(shift)).axleZ / 1000;
	const spin = rolled / (WS.r0 / 1000);
	return (
		<group position={[at[0], 0, at[1]]} rotation={[0, yaw, 0]}>
			<group position={[shift / 1000, axleY, 0]} rotation={[0, 0, lift]}>
				<group rotation={[spin, 0, 0]}>
					{[...geo.right.body, ...geo.left.body].map((g, i) => (
						<mesh key={`b${i}`} geometry={g} material={steel.body} />
					))}
					{[...geo.right.band, ...geo.left.band].map((g, i) => (
						<mesh key={`t${i}`} geometry={g} material={bandMat} />
					))}
					{[...geo.right.flange, ...geo.left.flange].map((g, i) => (
						<mesh key={`f${i}`} geometry={g} material={flangeMat} />
					))}
					{geo.axle.map((g, i) => (
						<mesh key={`a${i}`} geometry={g} material={steel.axle} />
					))}
					{geo.journals.map((g, i) => (
						<mesh key={`j${i}`} geometry={g} material={steel.journal} />
					))}
					<EndCaps material={steel.axle} bolt={steel.journal} />
				</group>
			</group>
		</group>
	);
};

/** Rails (solid, dark, with drawn edges) and sleepers as slate lines, along a track path. */
export const Track3D: React.FC<{path: PathSample[]; draw?: number; edgeOpacity?: number}> = ({path, draw = 1, edgeOpacity = 0.85}) => {
	const {rails, edges, sleepers} = useMemo(() => {
		const r = railGeometries(path);
		const e = r.map((g) => new THREE.EdgesGeometry(g, 35));
		const sl = sleepersAlong(path, 0.6);
		const pts: number[] = [];
		for (const s of sl) {
			const n = new THREE.Vector2(s.t.y, -s.t.x);
			const y = -0.172 - 0.02;
			for (const off of [-0.125, 0.125]) {
				const c = s.p.clone().add(s.t.clone().multiplyScalar(off));
				pts.push(c.x - n.x * 1.3, y, c.y - n.y * 1.3, c.x + n.x * 1.3, y, c.y + n.y * 1.3);
			}
		}
		const sg = new THREE.BufferGeometry();
		sg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
		return {rails: r, edges: e, sleepers: sg};
	}, [path]);
	const railMat = useMemo(
		() => new THREE.MeshStandardMaterial({color: '#1A2433', metalness: 0.7, roughness: 0.42, transparent: true, side: THREE.DoubleSide, envMapIntensity: 0.6}),
		[],
	);
	railMat.opacity = draw;
	return (
		<group>
			{rails.map((g, i) => (
				<mesh key={`r${i}`} geometry={g} material={railMat} />
			))}
			{edges.map((g, i) => (
				<lineSegments key={`e${i}`} geometry={g}>
					<lineBasicMaterial color={colors.line} transparent opacity={edgeOpacity * draw} />
				</lineSegments>
			))}
			<lineSegments geometry={sleepers}>
				<lineBasicMaterial color={colors.muted} transparent opacity={0.55 * draw} />
			</lineSegments>
		</group>
	);
};

// ---- camera moves and projection ----

export type CamKey = {f: number; cam: CameraSpec};

/** The camera between keyframes, eased (the channel's camera curve); never a cut. */
export const camAt = (f: number, keys: CamKey[], ease: (t: number) => number): CameraSpec => {
	if (f <= keys[0].f) return keys[0].cam;
	for (let i = 1; i < keys.length; i++) {
		if (f <= keys[i].f) {
			const a = keys[i - 1];
			const b = keys[i];
			const t = ease((f - a.f) / (b.f - a.f));
			const l = (x: number, y: number) => x + (y - x) * t;
			return {
				position: [l(a.cam.position[0], b.cam.position[0]), l(a.cam.position[1], b.cam.position[1]), l(a.cam.position[2], b.cam.position[2])],
				target: [l(a.cam.target[0], b.cam.target[0]), l(a.cam.target[1], b.cam.target[1]), l(a.cam.target[2], b.cam.target[2])],
				fov: l(a.cam.fov, b.cam.fov),
			};
		}
	}
	return keys[keys.length - 1].cam;
};

/** Where a world point lands on a w×h frame for this camera (for 2D callouts that point at 3D features). */
export const project = (cam: CameraSpec, p: [number, number, number], w: number, h: number): {x: number; y: number; behind: boolean} => {
	const c = new THREE.PerspectiveCamera(cam.fov, w / h, 0.01, 400);
	c.position.set(...cam.position);
	c.lookAt(new THREE.Vector3(...cam.target));
	c.updateMatrixWorld();
	c.updateProjectionMatrix();
	const v = new THREE.Vector3(...p).project(c);
	return {x: ((v.x + 1) / 2) * w, y: ((1 - v.y) / 2) * h, behind: v.z > 1};
};
