import React from 'react';
import {colors} from '../../../lib/remotion/brand';
import {climbToContact, climbToSpring, closePerMm, WEDGE_GAP, wedgeState} from './model';

// The safety gear on one rail in section (SIMPLIFIED wedge gear, NOT TO SCALE: the 3 mm gap and the 8° taper are drawn
// true to each other but the parts are enlarged). The rail blade stays fixed (the world); the housing moves with the
// car (housingY, mm, down positive); each wedge climbs `climb` mm relative to its housing along the 8° slot, so its
// face closes on the rail (model.wedgeState) and, after contact, pushes the spring-backed jaws apart.

const RAIL_HALF = 8;
const WB = 22; // wedge width at its foot, mm
const WH = 70; // wedge height, mm
const t = closePerMm;
const SLOT_TOP = WH + 60; // the housing's top, mm above the slot foot
const STOP = WH + 50; // the stop that caps the slot: the wedge's top can never reach it
// numeric check (viewer review v1: the wedge stood proud of its housing): a fully climbed wedge stays under the stop
if (climbToContact + climbToSpring + WH >= STOP) throw new Error('wedge would hit the stop');

export const WedgeGear: React.FC<{
	cx: number;
	cy: number;
	k: number;
	housingY: number;
	climb: number;
	glowWedge?: number;
	squeeze?: number;
	springs?: number;
	railTicks?: boolean;
	slotGlow?: number;
	/** How far the rail has slid up past the gear, px (the car sliding down with the wedges biting). */
	railShift?: number;
}> = ({cx, cy, k, housingY, climb, glowWedge = 0, squeeze = 0, springs = 0, railTicks = true, slotGlow = 0, railShift = 0}) => {
	const {gap, jaw} = wedgeState(climb);
	// screen from gear-local mm (x right of the rail centre, y up from the housing's slot foot)
	const yOff = -housingY; // the housing (and slot foot) is housingY mm below the reference
	const pt = (x: number, y: number) => {
		const [a, b] = [cx + x * k, cy - (y + yOff) * k];
		return `${a.toFixed(1)},${b.toFixed(1)}`;
	};
	const wCol = glowWedge > 0.01 ? colors.amber : colors.metal;
	const side = (sd: 1 | -1) => {
		const x0 = sd * (RAIL_HALF + gap); // wedge inner face
		const yb = climb;
		const wedge = [pt(x0, yb), pt(x0, yb + WH), pt(x0 + sd * (WB - WH * t), yb + WH), pt(x0 + sd * WB, yb)].join(' ');
		// the housing's inclined face sits on the wedge's outer face; the housing has moved out by `jaw`
		const hx = (y: number) => sd * (RAIL_HALF + WEDGE_GAP + jaw + WB - y * t);
		const housing = [pt(hx(-20), -20), pt(hx(SLOT_TOP), SLOT_TOP), pt(sd * (RAIL_HALF + WEDGE_GAP + jaw + WB + 46), SLOT_TOP), pt(sd * (RAIL_HALF + WEDGE_GAP + jaw + WB + 46), -20)].join(' ');
		// the stop across the slot's top, from just clear of the rail to the housing's inclined face
		const stop = [pt(sd * (RAIL_HALF + WEDGE_GAP + 2), STOP), pt(hx(STOP), STOP), pt(hx(STOP + 8), STOP + 8), pt(sd * (RAIL_HALF + WEDGE_GAP + 2), STOP + 8)].join(' ');
		// disc springs behind the housing, compressed by `jaw`
		const sx = RAIL_HALF + WEDGE_GAP + jaw + WB + 46;
		const stack = Array.from({length: 6}, (_, i) => {
			const w = 8 - (jaw / 3) * 3.5; // each disc flattens as the stack compresses
			const x = sd * (sx + 4 + i * w);
			return <polyline key={i} points={`${pt(x, 10)} ${pt(x + sd * w * 0.5, 30)} ${pt(x, 50)}`} fill="none" stroke={springs > 0.01 ? colors.cyan : colors.sub} strokeWidth={2.5} opacity={0.4 + 0.6 * springs} />;
		});
		return (
			<g key={sd}>
				<polygon points={housing} fill="#1A2330" stroke={slotGlow > 0.01 ? colors.amber : colors.line} strokeWidth={2.5} style={slotGlow > 0.01 ? {filter: `drop-shadow(0 0 ${8 * slotGlow}px ${colors.amber})`} : undefined} />
				<polygon points={stop} fill="#3B4A5C" stroke={colors.line} strokeWidth={2} />
				{stack}
				<polygon points={wedge} fill={glowWedge > 0.01 ? 'rgba(255,159,28,0.35)' : '#2A3544'} stroke={wCol} strokeWidth={3} style={glowWedge > 0.01 ? {filter: `drop-shadow(0 0 ${10 * glowWedge}px ${colors.amber})`} : undefined} />
				{/* serrated face */}
				{Array.from({length: 9}, (_, i) => {
					const y = yb + 6 + i * 7;
					return <line key={i} x1={cx + x0 * k} y1={cy - (y + yOff) * k} x2={cx + (x0 + sd * 3) * k} y2={cy - (y + 3 + yOff) * k} stroke={wCol} strokeWidth={1.5} />;
				})}
				{/* squeeze: compression arrows into the rail */}
				{squeeze > 0.01
					? [20, 45].map((y) => {
							const [a, b] = [cx + (x0 + sd * (WB + 30)) * k, cy - (yb + y + yOff) * k];
							const [c, d] = [cx + (x0 + sd * (WB + 4)) * k, b];
							return <line key={y} x1={a} y1={b} x2={a + (c - a) * Math.min(1, squeeze)} y2={d} stroke={colors.cyan} strokeWidth={3 + 4 * squeeze} markerEnd="url(#el-arrow)" opacity={Math.min(1, squeeze * 2)} />;
						})
					: null}
			</g>
		);
	};
	return (
		<g>
			<defs>
				<marker id="el-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
					<path d="M 0 0 L 10 5 L 0 10 z" fill={colors.cyan} />
				</marker>
			</defs>
			{/* the rail blade: fixed in the world; ticks so you can see it stand still */}
			<rect x={cx - RAIL_HALF * k} y={0} width={RAIL_HALF * 2 * k} height={1080} fill="#3B4A5C" stroke={colors.line} strokeWidth={2} />
			{railTicks ? Array.from({length: 40}, (_, i) => {
				const y = (((i * 40 - railShift) % 1600) + 1600) % 1600 - 40;
				return <line key={i} x1={cx - RAIL_HALF * k} y1={y} x2={cx + RAIL_HALF * k} y2={y} stroke={colors.grid} strokeWidth={2} />;
			}) : null}
			{side(-1)}
			{side(1)}
		</g>
	);
};

