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

type PlateId = 'car_ropes' | 'car_hero' | 'gear_hero' | 'gear_tight' | 'car_fall';
/** Plates framed centre in Blender move right so the words own the left (the car on the right third). */
const SHIFT: Partial<Record<PlateId, number>> = {car_ropes: 330, car_fall: 300};
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

// ---- Re-package (2026-11-13, PLAYBOOK §16, §13.3): BUILT TO SLIP earned 0.6% CTR (film 1's NO DIFFERENTIAL?: 5.2%).
// The new plate (blender/fall_shot.py) shows the moment the viewer is asking about and hides the answer: the car in
// its shaft, the door seam lit, the ropes snapped above it, the floors dropping away below, the safety gears dark.
// The words ask; they never answer. One promise: the cable snaps, what happens to you.

/** The fall the viewer fears, as a dimension line: from the car's floor down the shaft into the dark, open-ended.
 * Crimson = danger (brand). Plate coordinates of car_fall after its 300 px shift (the car floor at about y 640). */
const Drop: React.FC = () => {
	const x = 905;
	const y0 = 655;
	const y1 = 1000;
	const w = 10;
	return (
		<svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
			<g stroke={colors.crimson} strokeWidth={w} strokeLinecap="round" fill="none" style={{filter: 'drop-shadow(0 0 14px rgba(255,59,48,0.65))'}}>
				<line x1={x - 50} y1={y0} x2={x + 150} y2={y0} />
				<line x1={x} y1={y0} x2={x} y2={y1 - 30} strokeDasharray="0" />
				<polyline points={`${x - 34},${y1 - 62} ${x},${y1 - 14} ${x + 34},${y1 - 62}`} strokeLinejoin="round" />
			</g>
		</svg>
	);
};

/** G (main): HOW FAR? The question every viewer of "what happens if an elevator cable snaps" holds; the film answers
 * it (about a meter, claim-backed) and then why not less. */
export const ThumbG: React.FC = () => (
	<Plate id="car_fall">
		<Drop />
		<Words x={70} y={110} size={230} color={colors.ink}>
			HOW
		</Words>
		<Words x={70} y={110 + 230 * 0.98} size={230} color={colors.amber}>
			FAR?
		</Words>
	</Plate>
);
/** H (challenger): CABLE SNAPS. THEN? The search phrase's own words, as the moment. */
export const ThumbH: React.FC = () => <Two a="CABLE SNAPS." b="THEN?" bColor={colors.amber} size={150} id="car_fall" />;
/** I (challenger): DO YOU FALL? The fear, said plainly (the film: a split-second drop, then a stop within about a
 * meter, so the honest answer is "a little"). */
export const ThumbI: React.FC = () => (
	<Plate id="car_fall">
		<Drop />
		<Words x={70} y={110} size={200} color={colors.ink}>
			DO YOU
		</Words>
		<Words x={70} y={110 + 200 * 0.98} size={200} color={colors.crimson}>
			FALL?
		</Words>
	</Plate>
);

// ---- The photo-real plate (owner's direction, 2026-11-13: "with Canva we got a more realistic way"). Generated in the
// owner's Canva account with no text (design DAHaxmJQoaw): the car seen from below as it comes down the shaft,
// sparks at its lower corners where the safety gears meet the rails. An illustration, not a photograph (the video's
// altered-content disclosure covers it); media_manifest.csv. The words stay ours: they ask, they never answer.

/** The photo, pushed right and enlarged so the car sits right of centre and the words own a darkened left. */
const Photo: React.FC<{children?: React.ReactNode}> = ({children}) => (
	<AbsoluteFill style={{backgroundColor: colors.bg, overflow: 'hidden'}}>
		<Img
			src={staticFile('films/elevator-safety/thumbs/canva_fall.png')}
			style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: 'translateX(230px) translateY(40px) scale(1.22)', transformOrigin: '50% 50%'}}
		/>
		<AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(5,7,10,0.92) 0%, rgba(5,7,10,0.78) 30%, rgba(5,7,10,0.25) 52%, rgba(5,7,10,0) 66%)'}} />
		<Vignette strength={0.35} />
		{children}
	</AbsoluteFill>
);

const PhotoTwo: React.FC<{a: string; b: string; bColor: string; size: number}> = ({a, b, bColor, size}) => (
	<Photo>
		<Words x={70} y={120} size={size} color={colors.ink}>
			{a}
		</Words>
		<Words x={70} y={120 + size * 0.98} size={size} color={bColor}>
			{b}
		</Words>
	</Photo>
);

/** J (main): HOW FAR? on the photo. */
export const ThumbJ: React.FC = () => <PhotoTwo a="HOW" b="FAR?" bColor={colors.amber} size={250} />;
/** K: CABLE SNAPS. THEN? on the photo. */
export const ThumbK: React.FC = () => <PhotoTwo a="CABLE SNAPS." b="THEN?" bColor={colors.amber} size={128} />;
/** L: DO YOU FALL? on the photo. */
export const ThumbL: React.FC = () => <PhotoTwo a="DO YOU" b="FALL?" bColor={colors.crimson} size={210} />;
