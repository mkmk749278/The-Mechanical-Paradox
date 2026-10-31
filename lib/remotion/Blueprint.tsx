import React from 'react';
import {AbsoluteFill, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors} from './brand';
import {microPush} from './motion';

// The canvas every frame stands on (PLAYBOOK §6.1): abyss, a slow-breathing light, and the blueprint grid. The grid
// is never static: it rides the mathematical Ken Burns and drifts a few pixels (owner's blueprint §2.3 rule 1).

type BlueprintProps = {
	/** Grid cell in px at 1920×1080 (blueprint: 30 px for scenes, 40 for the banner). */
	cell?: number;
	/** 0–1: how strong the grid reads. Keep it under the subject. */
	gridOpacity?: number;
	/** Where the light pools, in 0–1 of the frame. */
	light?: {x: number; y: number};
	/** Length of the shot in frames, for the push. */
	duration?: number;
	/** Major line every n cells. */
	major?: number;
	children?: React.ReactNode;
};

export const Blueprint: React.FC<BlueprintProps> = ({
	cell = 30,
	gridOpacity = 0.9,
	light = {x: 0.5, y: 0.45},
	duration,
	major = 5,
	children,
}) => {
	const frame = useCurrentFrame();
	const {durationInFrames, width, height} = useVideoConfig();
	const d = duration ?? durationInFrames;
	const scale = microPush(frame, d);
	const driftX = (frame / d) * cell * 0.6;
	const driftY = (frame / d) * cell * 0.25;
	const lineMinor = `${colors.grid}`;
	const lineMajor = `${colors.grid}`;
	return (
		<AbsoluteFill style={{backgroundColor: colors.bg, overflow: 'hidden'}}>
			<AbsoluteFill
				style={{
					background: `radial-gradient(ellipse ${width * 0.75}px ${height * 0.7}px at ${light.x * 100}% ${light.y * 100}%, ${colors.bg_lift} 0%, ${colors.bg} 72%)`,
				}}
			/>
			<AbsoluteFill style={{transform: `scale(${scale}) translate(${-driftX}px, ${-driftY}px)`, opacity: gridOpacity}}>
				<div
					style={{
						position: 'absolute',
						left: -cell * major,
						top: -cell * major,
						width: width + 2 * cell * major,
						height: height + 2 * cell * major,
						backgroundImage: [
							`linear-gradient(${lineMajor} 2px, transparent 2px)`,
							`linear-gradient(90deg, ${lineMajor} 2px, transparent 2px)`,
							`linear-gradient(${lineMinor} 1px, transparent 1px)`,
							`linear-gradient(90deg, ${lineMinor} 1px, transparent 1px)`,
						].join(','),
						backgroundSize: `${cell * major}px ${cell * major}px, ${cell * major}px ${cell * major}px, ${cell}px ${cell}px, ${cell}px ${cell}px`,
						opacity: 0.85,
					}}
				/>
			</AbsoluteFill>
			<AbsoluteFill style={{transform: `scale(${scale})`}}>{children}</AbsoluteFill>
		</AbsoluteFill>
	);
};

/** Film grain from a seeded SVG turbulence that changes every 2 frames (30 Hz grain at 60 fps reads as film). */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.07}) => {
	const frame = useCurrentFrame();
	const seed = Math.floor(random(`grain-${Math.floor(frame / 2)}`) * 1000);
	return (
		<AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'overlay', opacity}}>
			<svg width="100%" height="100%">
				<filter id={`g${seed}`}>
					<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} stitchTiles="stitch" />
					<feColorMatrix type="saturate" values="0" />
				</filter>
				<rect width="100%" height="100%" filter={`url(#g${seed})`} />
			</svg>
		</AbsoluteFill>
	);
};

export const Vignette: React.FC<{strength?: number}> = ({strength = 0.55}) => (
	<AbsoluteFill
		style={{
			pointerEvents: 'none',
			background: `radial-gradient(ellipse 75% 70% at 50% 50%, transparent 55%, rgba(0,0,0,${strength}) 100%)`,
		}}
	/>
);

/** The standard atmosphere stack over a scene. */
export const Atmosphere: React.FC<{grain?: number; vignette?: number}> = ({grain = 0.07, vignette = 0.55}) => (
	<>
		<Vignette strength={vignette} />
		<Grain opacity={grain} />
	</>
);
