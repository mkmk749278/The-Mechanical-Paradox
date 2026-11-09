import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Blueprint, Vignette} from '../../../lib/remotion/Blueprint';
import {colors} from '../../../lib/remotion/brand';
import {fontStacks} from '../../../lib/remotion/fonts';

// Film 2's YouTube thumbnails (PLAYBOOK §13.3, step 11), authored at 1920×1080 and shot at scale 2/3 (1280×720 JPG).
// One lit subject, Cycles stills from blender/gear_still.py: the car on its rails with the safety gears biting at its
// lower corners, hot, shedding shavings (claim C22, "steel being shaved"), the rail scraped above them (car_hero); or
// the film's own gear cut open (gear_hero, gear_tight: the 8° slots, the wedges hot from the slip, the disc springs in
// cyan = compression). One disruptor: the words, at most three, on the left; nothing important in the
// bottom-right corner (the duration badge). Every variant keeps the one promise: the cable is gone, what stops the car,
// and why it must not stop you too hard.

const shadow = '0 6px 0 rgba(0,0,0,0.55), 0 0 36px rgba(0,0,0,0.85), 0 0 4px rgba(0,0,0,0.9)';

const Words: React.FC<{x: number; y: number; size: number; color: string; children: React.ReactNode}> = ({x, y, size, color, children}) => (
	<div
		style={{
			position: 'absolute',
			left: x,
			top: y,
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

type PlateId = 'car_ropes' | 'car_hero' | 'gear_hero' | 'gear_tight';
/** Plates framed centre in Blender move right so the words own the left (the car on the right third). */
const SHIFT: Partial<Record<PlateId, number>> = {car_ropes: 330};
/** …and up, so the gears and their shavings sit inside the frame, not on its bottom edge. */
const LIFT: Partial<Record<PlateId, number>> = {car_ropes: -70};

const Plate: React.FC<{id: PlateId; children?: React.ReactNode}> = ({id, children}) => (
	<AbsoluteFill>
		<Blueprint light={{x: 0.66, y: 0.45}} gridOpacity={0.5} duration={1}>
			<Img src={staticFile(`films/elevator-safety/thumbs/${id}.png`)} style={{position: 'absolute', left: SHIFT[id] ?? 0, top: LIFT[id] ?? 0, width: 1920, height: 1080}} />
		</Blueprint>
		<Vignette strength={0.45} />
		{children}
	</AbsoluteFill>
);

const Two: React.FC<{a: string; b: string; bColor: string; size?: number; id?: PlateId}> = ({a, b, bColor, size = 190, id = 'gear_hero'}) => (
	<Plate id={id}>
		<Words x={70} y={90} size={size} color={colors.ink}>
			{a}
		</Words>
		<Words x={70} y={90 + size * 0.98} size={size} color={bColor}>
			{b}
		</Words>
	</Plate>
);

/** A (main; click test v1 winner, with the panel's change: the snapped, frayed ropes above the car): BUILT TO SLIP,
 * the opening's own words (0:20). */
export const ThumbA: React.FC = () => <Two a="BUILT TO" b="SLIP" bColor={colors.amber} size={200} id="car_ropes" />;
/** B (challenger, the TV viewers' pick): CABLE GONE. THEN? on the same plate. */
export const ThumbB: React.FC = () => <Two a="CABLE GONE." b="THEN?" bColor={colors.amber} size={160} id="car_ropes" />;
/** C (challenger, the engineers' pick): the cutaway, BUILT TO SLIP. */
export const ThumbC: React.FC = () => <Two a="BUILT TO" b="SLIP" bColor={colors.amber} size={200} id="gear_tight" />;
/** Click test v1 candidates kept for the record: the car close-up (v1 A, B, D) and the cutaway STEEL SHAVED (v1 F). */
export const ThumbD: React.FC = () => <Two a="BUILT TO" b="SLIP" bColor={colors.amber} size={200} id="car_hero" />;
export const ThumbE: React.FC = () => <Two a="NOT A" b="COMPUTER" bColor={colors.amber} size={170} id="car_hero" />;
export const ThumbF: React.FC = () => <Two a="STEEL" b="SHAVED" bColor={colors.amber} size={200} id="gear_tight" />;
