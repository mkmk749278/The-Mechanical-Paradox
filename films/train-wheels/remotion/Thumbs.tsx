import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Blueprint, Vignette} from '../../../lib/remotion/Blueprint';
import {colors} from '../../../lib/remotion/brand';
import {fontStacks} from '../../../lib/remotion/fonts';
import {H, Svg, W} from './kit';
import {WS} from './model';
import {contact} from './profiles';
import {Shot3DView} from './plates';
import {ShotId, thumbB3D} from './shots3d';
import {project} from './Wheelset3D';

// The three YouTube thumbnails (PLAYBOOK §13.3), authored at 1920×1080 and shot at scale 2/3 (1280×720 JPG):
// one lit subject (the film's own wheelset, a Blender still from shots3d.ts) and one disruptor (the words, or the amber
// marks), at most three words, nothing important bottom-right (the duration badge).

const shadow = '0 6px 0 rgba(0,0,0,0.55), 0 0 36px rgba(0,0,0,0.85), 0 0 4px rgba(0,0,0,0.9)';

const Words: React.FC<{x: number; y: number; size: number; color: string; children: React.ReactNode; align?: 'left' | 'center'}> = ({
	x,
	y,
	size,
	color,
	children,
	align = 'left',
}) => (
	<div
		style={{
			position: 'absolute',
			left: x,
			top: y,
			transform: align === 'center' ? 'translateX(-50%)' : undefined,
			fontFamily: fontStacks.display,
			fontWeight: 800,
			fontSize: size,
			lineHeight: 0.92,
			letterSpacing: -2,
			color,
			textShadow: shadow,
			whiteSpace: 'nowrap',
		}}
	>
		{children}
	</div>
);

const Plate: React.FC<{id: ShotId; light: {x: number; y: number}; children?: React.ReactNode}> = ({id, light, children}) => (
	<AbsoluteFill>
		<Blueprint light={light} gridOpacity={0.55} duration={1}>
			<Shot3DView id={id} f={0} width={W} height={H} />
		</Blueprint>
		<Vignette strength={0.5} />
		{children}
	</AbsoluteFill>
);

/** A (main): NO STEERING over the hero wheelset, its treads lit amber. */
export const ThumbA: React.FC = () => (
	<Plate id="thumbA" light={{x: 0.62, y: 0.5}}>
		<Words x={70} y={70} size={196} color={colors.ink}>
			NO
		</Words>
		<Words x={70} y={250} size={196} color={colors.amber}>
			STEERING
		</Words>
	</Plate>
);

/** B: 0.7 mm, head-on at the flange limit; an amber pointer at the outer wheel's contact. */
export const ThumbB: React.FC = () => {
	const s = thumbB3D(0);
	const c = contact(WS.clear);
	const z = (side: 1 | -1) => (side * WS.b0 + WS.clear) / 1000;
	const pts = ([1] as const).map((side) => project(s.cam, [z(side), c.axleZ / 1000 - c.r / 1000, 0], W, H));
	return (
		<Plate id="thumbB" light={{x: 0.5, y: 0.62}}>
			<Svg>
				{/* one pointer, at the outer (bigger) wheel's contact: the 0.7 mm is a radius difference, so no line spans the track */}
				<circle cx={pts[0].x} cy={pts[0].y} r={30} fill="none" stroke={colors.amber} strokeWidth={7} />
				<polyline points={`${pts[0].x + 30},${pts[0].y - 8} ${pts[0].x + 150},${pts[0].y - 60} ${pts[0].x + 150},320`} fill="none" stroke={colors.amber} strokeWidth={7} strokeLinejoin="round" />
			</Svg>
			<Words x={W / 2} y={70} size={250} color={colors.amber} align="center">
				0.7 mm
			</Words>
		</Plate>
	);
};

/** C: THE REAL SCREECH, the wheelset hot against the outer rail of a tight bend. */
export const ThumbC: React.FC = () => (
	<Plate id="thumbC" light={{x: 0.55, y: 0.6}}>
		<Words x={70} y={60} size={150} color={colors.ink}>
			THE REAL
		</Words>
		<Words x={70} y={200} size={190} color={colors.crimson}>
			SCREECH
		</Words>
	</Plate>
);
