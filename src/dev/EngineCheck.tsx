import {ThreeCanvas} from '@remotion/three';
import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {Atmosphere, Blueprint} from '../../lib/remotion/Blueprint';
import {Hud} from '../../lib/remotion/Hud';
import {tween} from '../../lib/remotion/motion';
import {ensureStressAttribute, makeFeaMaterial} from '../../lib/remotion/three/fea';

// Internal check of the engine (never shown to the owner): WebGL under software GL, the FEA shader, the HUD, the
// blueprint and the atmosphere stack in one frame. The bar is a plain plate with a circular hole under tension; the
// two hotspots sit at the hole's edges, square to the load, where a hole concentrates stress. Values ILLUSTRATIVE.

const Plate: React.FC<{load: number; turn: number}> = ({load, turn}) => {
	const {geometry, material} = useMemo(() => {
		const shape = new THREE.Shape();
		shape.moveTo(-3, -1);
		shape.lineTo(3, -1);
		shape.lineTo(3, 1);
		shape.lineTo(-3, 1);
		shape.lineTo(-3, -1);
		const hole = new THREE.Path();
		hole.absarc(0, 0, 0.45, 0, Math.PI * 2, true);
		shape.holes.push(hole);
		const g = new THREE.ExtrudeGeometry(shape, {depth: 0.3, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, curveSegments: 96});
		g.translate(0, 0, -0.15);
		ensureStressAttribute(g);
		const m = makeFeaMaterial(
			[
				{position: new THREE.Vector3(0, 0.45, 0), peak: 1, radius: 0.32},
				{position: new THREE.Vector3(0, -0.45, 0), peak: 1, radius: 0.32},
			],
			0.3,
			12,
		);
		return {geometry: g, material: m};
	}, []);
	material.uniforms.uLoad.value = load;
	return <mesh geometry={geometry} material={material} rotation={[-0.5 + turn * 0.2, turn, 0]} />;
};

export const EngineCheck: React.FC = () => {
	const frame = useCurrentFrame();
	const {width, height, durationInFrames} = useVideoConfig();
	const load = tween(frame, 30, 240, 0.15, 1);
	return (
		<AbsoluteFill>
			<Blueprint duration={durationInFrames}>
				<ThreeCanvas width={width} height={height} camera={{position: [0, 0, 7.5], fov: 40}}>
					<Plate load={load} turn={tween(frame, 0, durationInFrames, -0.35, 0.35)} />
				</ThreeCanvas>
			</Blueprint>
			<Hud
				title="TENSION TEST"
				start={10}
				end={durationInFrames}
				rows={[
					{label: 'LOAD', unit: 'kN', keys: [{frame: 30, value: 4}, {frame: 240, value: 40}], decimals: 1, tone: 'cyan', source: 'ILLUSTRATIVE'},
					{label: 'σ PEAK', unit: 'MPa', keys: [{frame: 30, value: 36}, {frame: 240, value: 362}], tone: 'crimson', source: 'ILLUSTRATIVE'},
					{label: 'Kt', unit: '', keys: [{frame: 0, value: 3}], decimals: 2, tone: 'amber', source: 'ILLUSTRATIVE'},
				]}
			/>
			<Atmosphere />
		</AbsoluteFill>
	);
};
