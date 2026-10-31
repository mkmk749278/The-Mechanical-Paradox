import React, {useMemo} from 'react';
import {colors} from './brand';
import {gearOutline, gearWindows, meshErrorDeg, rootRadius, tipRadius, toPath, type GearSpec, type Pt} from './gears';

// The channel mark as a live mechanism (PLAYBOOK §6.2): three equal 15-tooth cycloidal gears meshed in a ring. An odd
// ring can never turn (each gear must spin against both neighbours), so torque on any gear only winds the teeth
// elastically: `windDeg` is that tiny deflection, never a real rotation. Geometry matches brand/build_logo.py.

const SQ3 = Math.sqrt(3);
const TEETH = 15;

type Props = {
	/** Pixel size of the square the mark fits in. */
	size: number;
	/** 0–1: how much of each outline is drawn (the pen). */
	draw?: number;
	/** 0–1: fill and depth fade in after the pen. */
	solid?: number;
	/** Elastic wind-up in degrees (A and B turn against each other at the jam; keep under ~1°). */
	windDeg?: number;
	/** 0–1: the amber light at the jammed mesh. */
	glow?: number;
	/** 0–1: blueprint construction lines (pitch circles, the pitch triangle). */
	construction?: number;
};

const centres = (R: number): Record<'A' | 'B' | 'C', Pt> => ({A: [-R, -R / SQ3], B: [R, -R / SQ3], C: [0, (2 * R) / SQ3]});

export const LockedTrio: React.FC<Props> = ({size, draw = 1, solid = 1, windDeg = 0, glow = 0, construction = 0}) => {
	const half = size / 2;
	const probe: GearSpec = {teeth: TEETH, pitchRadius: 1};
	const R = (half * 0.86) / (2 / SQ3 + tipRadius(probe));
	const cs = centres(R);
	const spec = (phase: number): GearSpec => ({teeth: TEETH, pitchRadius: R, phaseDeg: phase});
	// Real mesh check, once: a broken logo should fail loudly, not render quietly wrong.
	useMemo(() => {
		for (const [a, b] of [['A', 'B'], ['B', 'C'], ['C', 'A']] as const) {
			const e = meshErrorDeg(spec(0), cs[a], spec(0), cs[b]);
			if (e > 0.01) throw new Error(`LockedTrio mesh ${a}-${b} off by ${e.toFixed(3)}°`);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [R]);
	// Elastic wind-up: A turns +w, B and C turn −w (B against A); the ring cannot close, so it all springs back.
	const rotDeg = {A: windDeg, B: -windDeg, C: -windDeg * 0.35};
	const paths = useMemo(
		() =>
			(['A', 'B', 'C'] as const).map((k) => ({
				k,
				// spokes point at the centroid, as in the static logo
				d: [gearOutline(spec(0)), ...gearWindows(spec(0), 3, (k === 'C' ? -90 : 90) + 60)].map((p) => toPath(p)).join(' '),
				centre: cs[k],
			})),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[R],
	);
	const sw = Math.max(1.2, size / 330);
	const depth = 0.075 * R;
	const toolLen = 2 * Math.PI * tipRadius(spec(0)) * 1.6; // longer than any outline: dash covers it whole
	const mx = (cs.A[0] + cs.B[0]) / 2;
	const my = (cs.A[1] + cs.B[1]) / 2;
	const clipR = (tipRadius(spec(0)) - rootRadius(spec(0))) * 1.9;
	const hub = () => (
		<>
			<circle r={0.16 * R} fill="none" stroke={colors.line} strokeWidth={sw * 0.8} opacity={solid} />
			<circle r={0.055 * R} fill={colors.line} opacity={solid} />
		</>
	);
	return (
		<svg width={size} height={size} viewBox={`${-half} ${-half} ${size} ${size}`} style={{overflow: 'visible'}}>
			<defs>
				<radialGradient id="trio-glow">
					<stop offset="0" stopColor={colors.amber} stopOpacity={0.95} />
					<stop offset="0.35" stopColor={colors.amber} stopOpacity={0.35} />
					<stop offset="1" stopColor={colors.amber} stopOpacity={0} />
				</radialGradient>
				<clipPath id="trio-jam">
					<circle cx={mx} cy={-my} r={clipR} />
				</clipPath>
			</defs>
			{construction > 0 ? (
				<g opacity={construction * 0.6}>
					{paths.map(({k, centre}) => (
						<circle
							key={k}
							cx={centre[0]}
							cy={-centre[1]}
							r={R}
							fill="none"
							stroke={colors.muted}
							strokeWidth={sw * 0.4}
							strokeDasharray={`${sw * 4} ${sw * 2.5}`}
						/>
					))}
					<path
						d={`M${cs.A[0]},${-cs.A[1]} L${cs.B[0]},${-cs.B[1]} L${cs.C[0]},${-cs.C[1]} Z`}
						fill="none"
						stroke={colors.muted}
						strokeWidth={sw * 0.4}
					/>
				</g>
			) : null}
			{/* side walls: the face offset down-right */}
			{paths.map(({k, d, centre}) => (
				<g key={`side-${k}`} transform={`translate(${centre[0] + depth},${-centre[1] + depth}) rotate(${-rotDeg[k]})`} opacity={solid}>
					<path d={d} fillRule="evenodd" fill={colors.grid} stroke={colors.line} strokeOpacity={0.32} strokeWidth={sw * 0.5} strokeLinejoin="round" />
				</g>
			))}
			{paths.map(({k, d, centre}) => (
				<g key={k} transform={`translate(${centre[0]},${-centre[1]}) rotate(${-rotDeg[k]})`}>
					<path d={d} fillRule="evenodd" fill={colors.bg_lift} fillOpacity={solid} stroke="none" />
					<path
						d={d}
						fill="none"
						stroke={colors.line}
						strokeWidth={sw}
						strokeLinejoin="round"
						strokeDasharray={toolLen}
						strokeDashoffset={toolLen * (1 - draw)}
					/>
					{hub()}
				</g>
			))}
			{glow > 0 ? (
				<>
					<circle cx={mx} cy={-my} r={clipR * 1.3} fill="url(#trio-glow)" opacity={glow} style={{mixBlendMode: 'screen'}} />
					<g clipPath="url(#trio-jam)" opacity={glow}>
						<g transform={`translate(${cs.A[0]},${-cs.A[1]}) rotate(${-rotDeg.A})`}>
							<path d={paths[0].d} fill="none" stroke={colors.amber} strokeWidth={sw * 1.1} strokeLinejoin="round" />
						</g>
					</g>
				</>
			) : null}
			<path
				d={(() => {
					const r = 0.075 * R;
					return [0, 1, 2]
						.map((i) => {
							const a = ((90 + 120 * i) * Math.PI) / 180;
							return `${i ? 'L' : 'M'}${r * Math.cos(a)},${-r * Math.sin(a)}`;
						})
						.join(' ') + ' Z';
				})()}
				fill="none"
				stroke={colors.line}
				strokeWidth={sw * 0.8}
				opacity={solid}
			/>
		</svg>
	);
};
