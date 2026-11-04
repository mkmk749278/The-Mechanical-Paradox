import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Atmosphere, Blueprint} from '../../../lib/remotion/Blueprint';
import {colors} from '../../../lib/remotion/brand';
import {fontStacks} from '../../../lib/remotion/fonts';
import {Hud} from '../../../lib/remotion/Hud';
import {ease, envelope, physical, tween} from '../../../lib/remotion/motion';
import {SfxCue} from '../../../lib/remotion/sfx';
import {cue} from './cues';
import {span} from './scenes';
import {deltaR, rollingRadius, WS} from './model';
import {contact, flangeGap, railOutline, wheelOutline, WHEEL_SPAN} from './profiles';

// Signature 1, the bank card (treatment; scene doc scenes/s07_bank_card.md). Two contact panels at true scale
// (3 px = 1 mm; the axle between them is broken out, as on a drawing), the wheelset shifts its full 7 mm, the two
// rolling radii are laid side by side and the view racks in until 0.70 mm fills the frame; a card slides in and is
// thicker. Every number on screen comes from model.ts and profiles.ts, driven by the same `shift` as the picture.

const PX = 3;
const RAIL_TOP = 560;
// The panels sit left of centre so the outer wheel (to 1378 px at full shift) clears the HUD column (from 1408 px).
const RIGHT_X = 1040; // outer rail (outside of the bend)
const LEFT_X = 480; // inner rail
const MID = (LEFT_X + RIGHT_X) / 2; // the broken-out axle's centreline
const HUD_W = 440;
const SCALE_X = 1440; // the scale note's left edge

/** The scene's span on the film's clock (scenes.ts tiles the VO; s07 runs from 36 frames before its first word). */
export const bankCardSpan = (): {from: number; to: number} => ({from: span('s07').from, to: span('s07').to});

const local = (f: number): number => f - bankCardSpan().from;

const T = () => ({
	draw: 0,
	guess: local(cue.at('You might guess centimeters')),
	take: local(cue.at('Take the textbook version')),
	shift: local(cue.at('If you shift it')),
	tenths: local(cue.at('seven tenths')),
	tenthsEnd: local(cue.end('seven tenths of a millimeter')),
	card: local(cue.at('bank card')),
	whole: local(cue.at('the whole steering system')),
	shape: local(cue.at('Just shape')),
	end: bankCardSpan().to - bankCardSpan().from,
});

export const bankCardCues = (): SfxCue[] => {
	const t = T();
	const o = bankCardSpan().from;
	return [
		{frame: o + t.draw, sfx: 'pen_scratch', gainDb: -14},
		{frame: o + t.shift, sfx: 'glass_tone', gainDb: -12, pan: 0.3},
		{frame: o + t.tenths - 30, sfx: 'whoosh', gainDb: -16},
		{frame: o + t.tenthsEnd, sfx: 'quartz_tick', gainDb: -10},
		{frame: o + t.card - 18, sfx: 'whoosh', gainDb: -14, pan: 0.6},
		{frame: o + t.shape, sfx: 'relay_click', gainDb: -12},
	];
};

/** The one driver: the wheelset's shift toward the outside of the bend, mm. */
const shiftAt = (f: number, fps: number): number => WS.clear * Math.min(1, physical(f, fps, T().shift + 6, {damping: 26}));

const pts = (p: [number, number][]): string => p.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ');

/** One contact panel: the rail section and the wheel above it. side +1 = outer (right), −1 = inner (left). */
const ContactPanel: React.FC<{side: 1 | -1; y: number; draw: number; glow: number}> = ({side, y, draw, glow}) => {
	const cx = side === 1 ? RIGHT_X : LEFT_X;
	const ys = side * y; // shift toward this wheel's outer side
	const c = contact(ys);
	const sx = (v: number): number => cx + side * v * PX;
	const sy = (z: number): number => RAIL_TOP - z * PX;
	const rail = railOutline().map(([v, z]) => [sx(v), sy(z)] as [number, number]);
	const outline = wheelOutline().map(([u, r]) => [sx(u + ys), sy(c.axleZ - r)] as [number, number]);
	// the wheel cut through the axle plane: rim (about 70 mm deep) and web, as on a wheel drawing
	const zr = (r: number): number => sy(c.axleZ - r);
	const RIM = WS.r0 - 70;
	const top = -40;
	const wheel: [number, number][] = [
		...outline,
		[sx(WHEEL_SPAN.outer + ys), zr(RIM + 4)],
		[sx(52 + ys), zr(RIM)],
		[sx(44 + ys), zr(RIM - 24)],
		[sx(44 + ys), top],
		[sx(10 + ys), top],
		[sx(10 + ys), zr(RIM - 24)],
		[sx(0 + ys), zr(RIM)],
		[sx(WHEEL_SPAN.back + ys), zr(RIM + 6)],
	];
	const id = side === 1 ? 'o' : 'i';
	// tread profile only (flange root to chamfer), for the amber glow at "Just shape"
	const tread = wheelOutline().filter(([u]) => u > -36 && u < 82).map(([u, r]) => [sx(u + ys), sy(c.axleZ - r)] as [number, number]);
	const contactX = sx(c.v);
	return (
		<g>
			<defs>
				<linearGradient id={`steel-${id}`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#1B2533" />
					<stop offset="0.82" stopColor="#2A3A4F" />
					<stop offset="0.97" stopColor="#56687E" />
					<stop offset="1" stopColor={colors.specular} stopOpacity={0.55} />
				</linearGradient>
				<pattern id={`hatch-${id}`} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
					<line x1="0" y1="0" x2="0" y2="14" stroke={colors.sub} strokeOpacity={0.28} strokeWidth={2} />
				</pattern>
			</defs>
			{/* rail: a section, so hatched */}
			<polygon points={pts(rail)} fill={colors.bg_lift} />
			<polygon points={pts(rail)} fill={`url(#hatch-${id})`} />
			<polyline points={pts([...rail, rail[0]])} fill="none" stroke={colors.line} strokeWidth={2.5} pathLength={1} strokeDasharray={`${draw} 1`} />
			{/* wheel */}
			<polygon points={pts(wheel)} fill={`url(#steel-${id})`} opacity={Math.min(1, draw * 1.4)} />
			<polygon points={pts(wheel)} fill={`url(#hatch-${id})`} opacity={0.6 * Math.min(1, draw * 1.4)} />
			<polyline points={pts([...wheel, wheel[0]])} fill="none" stroke={colors.line} strokeWidth={3} pathLength={1} strokeDasharray={`${draw} 1`} />
			{glow > 0 ? (
				<polyline points={pts(tread)} fill="none" stroke={colors.amber} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={`${glow} 1`} style={{filter: `drop-shadow(0 0 10px ${colors.amber})`}} />
			) : null}
			{/* rolling radius: from the axle centre (off frame, 500 mm up) down to the contact */}
			<line x1={contactX} y1={-10} x2={contactX} y2={RAIL_TOP - 14} stroke={colors.amber} strokeWidth={3} opacity={draw} />
			<polygon points={`${contactX - 9},${RAIL_TOP - 22} ${contactX + 9},${RAIL_TOP - 22} ${contactX},${RAIL_TOP - 4}`} fill={colors.amber} opacity={draw} />
			<circle cx={contactX} cy={RAIL_TOP} r={7} fill={colors.amber} style={{filter: `drop-shadow(0 0 8px ${colors.amber})`}} opacity={draw} />
		</g>
	);
};

const Label: React.FC<{x: number; y: number; size: number; color: string; align?: 'left' | 'right' | 'center'; children: React.ReactNode; opacity?: number; weight?: number}> = ({
	x,
	y,
	size,
	color,
	align = 'left',
	children,
	opacity = 1,
	weight = 500,
}) => (
	<div
		style={{
			position: 'absolute',
			left: align === 'left' ? x : undefined,
			right: align === 'right' ? 1920 - x : undefined,
			top: y,
			transform: align === 'center' ? 'translateX(-50%)' : undefined,
			...(align === 'center' ? {left: x} : {}),
			fontFamily: fontStacks.mono,
			fontSize: size,
			fontWeight: weight,
			letterSpacing: size > 30 ? 1 : 1.6,
			color,
			opacity,
			whiteSpace: 'nowrap',
			fontVariantNumeric: 'tabular-nums',
		}}
	>
		{children}
	</div>
);

/** Shot A: the two contact panels, true scale. */
const Panels: React.FC<{f: number; y: number; fps: number}> = ({f, y, fps}) => {
	const t = T();
	const draw = tween(f, t.draw, t.draw + 34, 0, 1, ease.draw);
	const glow = tween(f, t.shape - 8, t.shape + 30, 0, 1, ease.draw);
	const rO = rollingRadius(y);
	const rI = rollingRadius(-y);
	const gap = flangeGap(y);
	const guessO = envelope(f, t.guess - 6, t.shift + 10, 10, 14);
	const touch = tween(f, t.shift + 40, t.shift + 70, 0, 1);
	const pulse = gap < 0.05 ? 0.5 + 0.5 * Math.cos(((f - t.shift) / fps) * Math.PI * 2 * 0.8) : 0;
	return (
		<AbsoluteFill>
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				{/* track centre and the broken-out axle */}
				<line x1={MID} y1={244} x2={MID} y2={880} stroke={colors.muted} strokeWidth={1.5} strokeDasharray="22 10 4 10" opacity={draw} />
				<path d={`M ${MID - 30} 300 l 20 -18 l 20 36 l 20 -18`} fill="none" stroke={colors.sub} strokeWidth={2.5} opacity={draw} />
				<ContactPanel side={-1} y={y} draw={draw} glow={glow} />
				<ContactPanel side={1} y={y} draw={draw} glow={glow} />
				{/* flange touch on the outer wheel: the contact at the gauge corner, a crimson bloom, never an icon */}
				<circle cx={RIGHT_X - 33 * PX} cy={RAIL_TOP + 9} r={10 + 8 * pulse} fill={colors.crimson} opacity={0.45 * touch * (gap < 0.05 ? 1 : 0)} style={{filter: 'blur(5px)'}} />
				{/* scale bar, bottom-right: the free corner (the inner rail's web runs through the bottom-left) */}
				<line x1={SCALE_X} y1={942} x2={SCALE_X + 10 * PX} y2={942} stroke={colors.line} strokeWidth={4} opacity={draw} />
			</svg>
			<Label x={SCALE_X + 10 * PX + 16} y={922} size={26} color={colors.sub} opacity={draw}>
				10 mm · TRUE SCALE
			</Label>
			<Label x={SCALE_X} y={962} size={26} color={colors.sub} opacity={draw}>
				GENERIC PROFILES
			</Label>
			<Label x={LEFT_X - 160} y={140} size={26} color={colors.sub} align="right" opacity={draw}>
				INNER WHEEL
			</Label>
			<Label x={LEFT_X - 160} y={180} size={36} color={colors.amber} align="right" opacity={draw} weight={700}>
				r {rI.toFixed(2)} mm
			</Label>
			<Label x={RIGHT_X - 24} y={140} size={26} color={colors.sub} align="right" opacity={draw}>
				OUTER WHEEL
			</Label>
			<Label x={RIGHT_X - 24} y={180} size={36} color={colors.amber} align="right" opacity={draw} weight={700}>
				r {rO.toFixed(2)} mm
			</Label>
			<Label x={MID} y={70} size={26} color={colors.sub} align="center" opacity={draw}>
				OUTSIDE OF THE BEND →
			</Label>
			{/* the viewer's guess: a centimeter, drawn at true scale beside the outer contact */}
			<svg width={1920} height={1080} style={{position: 'absolute', opacity: guessO}}>
				<line x1={RIGHT_X + 330} y1={RAIL_TOP} x2={RIGHT_X + 330} y2={RAIL_TOP - 20 * PX} stroke={colors.crimson} strokeWidth={3} strokeDasharray="10 8" />
				<line x1={RIGHT_X + 310} y1={RAIL_TOP} x2={RIGHT_X + 350} y2={RAIL_TOP} stroke={colors.crimson} strokeWidth={3} />
				<line x1={RIGHT_X + 310} y1={RAIL_TOP - 20 * PX} x2={RIGHT_X + 350} y2={RAIL_TOP - 20 * PX} stroke={colors.crimson} strokeWidth={3} />
			</svg>
			<Label x={RIGHT_X + 362} y={RAIL_TOP - 56} size={40} color={colors.crimson} opacity={guessO} weight={700}>
				2 cm?
			</Label>
			{/* the play left before the flange meets the rail */}
			<Label x={RIGHT_X - 120} y={RAIL_TOP + 150} size={26} color={gap < 0.05 ? colors.crimson : colors.sub} align="right" opacity={draw}>
				FLANGE GAP {gap.toFixed(1)} mm
			</Label>
		</AbsoluteFill>
	);
};

/** Shot B: the two radii hung from the axle centre side by side, the view racking in to 400 px a millimeter. */
const Ruler: React.FC<{f: number; y: number; fps: number}> = ({f, y, fps}) => {
	const t = T();
	const zoomIn = tween(f, t.tenths - 34, t.tenths + 70, 0, 1, ease.camera);
	const zoomOut = tween(f, t.whole - 10, t.whole + 60, 0, 1, ease.camera);
	const hold = tween(f, t.card, t.whole, 0, 1, (x) => x);
	// K (px per mm) on a log path: a continuous rack from the whole radius to a tenth of a millimeter
	const lnK = Math.log(0.95) + (Math.log(400) - Math.log(0.95)) * zoomIn + Math.log(1.07) * hold - (Math.log(400 * 1.07) - Math.log(0.95)) * zoomOut;
	const K = Math.exp(lnK);
	const yc = 560; // screen y of r = 500 mm minus half the difference
	const rI = rollingRadius(-y);
	const rO = rollingRadius(y);
	const mid = (rI + rO) / 2;
	const sy = (r: number): number => yc + (r - mid) * K;
	const xI = 420;
	const xO = 600;
	const dimO = tween(f, t.tenthsEnd - 30, t.tenthsEnd + 4, 0, 1, ease.arrive);
	const cardIn = physical(f, fps, t.card - 26);
	const cardX = interpolate(cardIn, [0, 1], [2050, 1080]);
	const cardH = WS.card * K;
	const scaleBar = interpolate(K, [60, 140], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const d = deltaR(y);
	return (
		<AbsoluteFill>
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				{/* the axle centre datum (visible only while the view is wide) */}
				<line x1={240} y1={sy(0)} x2={800} y2={sy(0)} stroke={colors.sub} strokeWidth={2} strokeDasharray="22 10 4 10" />
				{/* the two rolling radii */}
				<line x1={xI} y1={Math.max(-20, sy(0))} x2={xI} y2={sy(rI)} stroke={colors.amber} strokeWidth={4} />
				<line x1={xO} y1={Math.max(-20, sy(0))} x2={xO} y2={sy(rO)} stroke={colors.amber} strokeWidth={4} />
				<line x1={xI - 40} y1={sy(rI)} x2={xI + 40} y2={sy(rI)} stroke={colors.amber} strokeWidth={4} />
				<line x1={xO - 40} y1={sy(rO)} x2={xO + 40} y2={sy(rO)} stroke={colors.amber} strokeWidth={4} />
				{/* extension lines across to the dimension and the card */}
				<line x1={xI + 40} y1={sy(rI)} x2={1560} y2={sy(rI)} stroke={colors.amber} strokeWidth={2} strokeDasharray="8 8" opacity={dimO} />
				<line x1={xO + 40} y1={sy(rO)} x2={1560} y2={sy(rO)} stroke={colors.amber} strokeWidth={2} strokeDasharray="8 8" opacity={dimO} />
				{/* the 0.70 mm dimension */}
				<g opacity={dimO}>
					<line x1={960} y1={sy(rI) + 18} x2={960} y2={sy(rO) - 18} stroke={colors.amber} strokeWidth={3} />
					<polygon points={`950,${sy(rI) + 20} 970,${sy(rI) + 20} 960,${sy(rI) + 2}`} fill={colors.amber} />
					<polygon points={`950,${sy(rO) - 20} 970,${sy(rO) - 20} 960,${sy(rO) - 2}`} fill={colors.amber} />
				</g>
				{/* the card, edge-on, at the same scale */}
				<g transform={`translate(${cardX} ${(sy(rI) + sy(rO)) / 2 - cardH / 2})`} opacity={cardIn > 0.001 ? 1 : 0}>
					<defs>
						<linearGradient id="card" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor={colors.specular} stopOpacity={0.5} />
							<stop offset="0.12" stopColor="#3A4A5E" />
							<stop offset="0.88" stopColor="#202C3B" />
							<stop offset="1" stopColor={colors.specular} stopOpacity={0.35} />
						</linearGradient>
					</defs>
					<rect x={0} y={0} width={1100} height={cardH} rx={Math.min(cardH / 2, 60)} fill="url(#card)" stroke={colors.line} strokeWidth={3} />
				</g>
				{/* scale bar: 1 mm */}
				<g opacity={scaleBar}>
					<line x1={140} y1={960} x2={140 + K} y2={960} stroke={colors.line} strokeWidth={4} />
					<line x1={140} y1={948} x2={140} y2={972} stroke={colors.line} strokeWidth={3} />
					<line x1={140 + K} y1={948} x2={140 + K} y2={972} stroke={colors.line} strokeWidth={3} />
				</g>
			</svg>
			<Label x={140} y={980} size={26} color={colors.sub} opacity={scaleBar}>
				1 mm
			</Label>
			<Label x={xI} y={Math.min(980, sy(rI) + 30)} size={26} color={colors.sub} align="center" opacity={1 - zoomOut}>
				INNER r
			</Label>
			<Label x={xO} y={Math.min(980, sy(rO) + 30)} size={26} color={colors.sub} align="center" opacity={1 - zoomOut}>
				OUTER r
			</Label>
			<Label x={936} y={(sy(rI) + sy(rO)) / 2 - 32} size={52} color={colors.amber} align="right" opacity={dimO} weight={700}>
				{d.toFixed(2)} mm
			</Label>
			<Label x={cardX + 40} y={(sy(rI) + sy(rO)) / 2 + cardH / 2 + 26} size={38} color={colors.ink} opacity={cardIn} weight={700}>
				BANK CARD · {WS.card.toFixed(2)} mm
			</Label>
		</AbsoluteFill>
	);
};

export const BankCard: React.FC = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = T();
	const y = shiftAt(f, fps);
	const aOut = tween(f, t.tenths - 40, t.tenths - 16, 1, 0, ease.leave);
	const aBack = tween(f, t.whole + 40, t.whole + 64, 0, 1, ease.arrive);
	const panels = Math.max(aOut, aBack);
	const ruler = Math.min(tween(f, t.tenths - 36, t.tenths - 12, 0, 1, ease.arrive), 1 - aBack);
	const hudRows = [
		{label: 'SHIFT y', unit: 'mm', at: (fr: number) => shiftAt(fr, fps), decimals: 1, tone: 'emerald' as const, source: 'C09'},
		{label: 'Δr', unit: 'mm', at: (fr: number) => deltaR(shiftAt(fr, fps)), decimals: 2, tone: 'amber' as const, source: 'C10'},
		{label: 'CARD', unit: 'mm', keys: [{frame: 0, value: WS.card}], decimals: 2, tone: 'line' as const, source: 'C11', from: t.card - 10},
	];
	return (
		<AbsoluteFill>
			<Blueprint duration={t.end} light={{x: 0.5, y: 0.5}}>
				<AbsoluteFill style={{opacity: panels}}>
					<Panels f={f} y={y} fps={fps} />
				</AbsoluteFill>
				<AbsoluteFill style={{opacity: ruler}}>
					<Ruler f={f} y={y} fps={fps} />
				</AbsoluteFill>
			</Blueprint>
			<Hud title="WHEELSET" rows={hudRows} start={t.take - 20} end={t.end} note="TEXTBOOK MODEL" width={HUD_W} />
			<Atmosphere />
		</AbsoluteFill>
	);
};
