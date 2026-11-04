import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {colors} from '../../../lib/remotion/brand';
import {Hud} from '../../../lib/remotion/Hud';
import {ease, tween} from '../../../lib/remotion/motion';
import {SfxCue} from '../../../lib/remotion/sfx';
import {curvePath, straightPath} from './geometry3d';
import {Callout, Dim, H, Label, off, on, pen, Stage, Svg, Tag, W} from './kit';
import {shiftNeeded, WS} from './model';
import {contact, flangeGap, FLANGE_ROOT, railOutline, wheelOutline, wheelR} from './profiles';
import {at, span} from './scenes';
import {camAt, project, Stage3D, Track3D, Wheelset3D} from './Wheelset3D';

// s04 the flange myth and s05 the cone revealed (scenes/s04_flange_cone.md).

const R_EX = 1500; // m, a gentle curve
const Y_EX = shiftNeeded(R_EX); // 5.0 mm drift (C13)
const GAP = flangeGap(Y_EX); // ≈ 2 mm left of the ±7 mm play (C09)


/**
 * The flange gap measured on the outlines at one height (8 mm below the crown), for the outer (right) wheel shifted
 * y mm toward it: the flank's x and the rail's gauge face x, in world metres.
 */
const gapAt = (y: number): {xw: number; xr: number; z: number} => {
	const zc = -8;
	const c = contact(y);
	let vr = Infinity;
	for (const [v, z] of railOutline()) if (Math.abs(z - zc) < 2.5 && v < vr && v < 0) vr = v;
	let uw = -Infinity;
	for (const [u, r] of wheelOutline(0.1)) if (u < -30 && Math.abs(c.axleZ - r - zc) < 1 && u > uw) uw = u;
	return {xw: (WS.b0 + uw + y) / 1000, xr: (WS.b0 + vr) / 1000, z: zc / 1000};
};

// ---- s04 ----
const GX = (() => {
	const g = gapAt(Y_EX);
	return (g.xw + g.xr) / 2;
})();
const S4 = () => span('s04');
const T4 = () => ({
	what: at('s04', 'So what steers it'),
	lips: at('s04', 'The steel lips'),
	flanges: at('s04', 'the flanges', 'The steel lips'),
	guess: at('s04', 'That is what you would probably guess'),
	surprise: at('s04', 'But here is the surprise'),
	gentle: at('s04', 'On a gentle curve'),
	touch: at('s04', 'do not need to touch the rail at all'),
	end: S4().dur,
});

export const FlangeMyth: React.FC = () => {
	const f = useCurrentFrame();
	const t = T4();
	const cam = camAt(
		f,
		[
			{f: 0, cam: {position: [0.05, 0.3, 1.6], target: [0.66, 0.05, 0.05], fov: 30}},
			{f: t.guess, cam: {position: [0.3, 0.09, 1.0], target: [0.7, 0.0, 0.05], fov: 26}},
			{f: t.surprise + 10, cam: {position: [GX, 0.06, 1.7], target: [GX, -0.004, 0], fov: 22}},
			{f: t.gentle + 30, cam: {position: [GX, -0.006, 1.6], target: [GX, -0.008, 0], fov: 4.2}},
			{f: t.end, cam: {position: [GX, -0.006, 1.5], target: [GX, -0.008, 0], fov: 3.8}},
		],
		ease.camera,
	);
	const path = useMemo(() => curvePath(R_EX, 2, 12, -12, 120), []);
	const glow = Math.min(on(f, t.flanges, 20), off(f, t.surprise + 30, 30));
	// the drift of a gentle curve builds as the camera dips (the true 5 mm, C13)
	const shift = tween(f, t.surprise, t.gentle + 30, 0, Y_EX, ease.camera);
	const g = gapAt(Y_EX);
	const gw = project(cam, [g.xw, g.z, 0], W, H);
	const gr = project(cam, [g.xr, g.z, 0], W, H);
	const gapPt = {x: (gw.x + gr.x) / 2, y: gw.y};
	// the gap is open from the rail's top down to the flange's tip (28 mm below the tread)
	const yTop = project(cam, [GX, 0, 0], W, H).y;
	const yBot = project(cam, [GX, -0.026, 0], W, H).y;
	const near = tween(f, t.gentle + 10, t.gentle + 40, 0, 1, ease.arrive);
	return (
		<Stage
			dur={S4().dur}
			light={{x: 0.55, y: 0.6}}
			overlay={
				<Hud
					title="OUTER WHEEL"
					start={t.lips}
					end={t.end + 20}
					width={480}
					note="TEXTBOOK MODEL"
					rows={[
						{label: 'PLAY', unit: '± mm', keys: [{frame: 0, value: WS.clear}], decimals: 0, tone: 'line', source: 'C09'},
						{label: 'CURVE R', unit: 'm', keys: [{frame: 0, value: R_EX}], decimals: 0, tone: 'line', source: 'C13', from: t.gentle},
						{label: 'SHIFT y', unit: 'mm', at: (fr: number) => tween(fr, t.surprise, t.gentle + 30, 0, Y_EX, ease.camera), decimals: 1, tone: 'emerald', source: 'C13', from: t.gentle},
						{label: 'FLANGE GAP', unit: 'mm', at: (fr: number) => flangeGap(tween(fr, t.surprise, t.gentle + 30, 0, Y_EX, ease.camera)), decimals: 1, tone: 'amber', source: 'C08', from: t.gentle + 20},
					]}
				/>
			}
		>
			<AbsoluteFill>
				<Stage3D width={W} height={H} cam={cam}>
					<Track3D path={path} />
					<Wheelset3D rolled={(f * 0.25) / 60} shift={shift} flangeGlow={glow} />
				</Stage3D>
				<Callout x={project(cam, [0.705, -0.014, 0.12], W, H).x} y={project(cam, [0.705, -0.014, 0.12], W, H).y} lx={520} ly={280} text="FLANGE" color={colors.amber} t={Math.min(tween(f, t.flanges + 10, t.flanges + 50, 0, 1), off(f, t.surprise, 20))} />
				{near > 0.01 ? (
					<>
						<Svg opacity={near}>
							{/* daylight through the gap, drawn exactly between the flank and the gauge face */}
							<rect x={Math.min(gw.x, gr.x)} y={yTop} width={Math.abs(gr.x - gw.x)} height={Math.max(0, yBot - yTop)} fill="#FFF1DC" opacity={0.8} style={{filter: 'blur(2px)', mixBlendMode: 'screen'}} />
							<line x1={gw.x} y1={gw.y + 20} x2={gw.x} y2={gw.y + 150} stroke={colors.amber} strokeWidth={2} strokeDasharray="5 5" />
							<line x1={gr.x} y1={gr.y + 20} x2={gr.x} y2={gr.y + 150} stroke={colors.amber} strokeWidth={2} strokeDasharray="5 5" />
							<Dim x1={gw.x} y1={gapPt.y + 160} x2={gr.x} y2={gapPt.y + 160} color={colors.amber} tick={10} />
						</Svg>
						<Label x={gapPt.x} y={gapPt.y + 186} size={40} color={colors.amber} weight={700} align="center" opacity={near}>
							GAP {GAP.toFixed(1)} mm
						</Label>
						<Label x={gapPt.x - 420} y={gapPt.y - 340} size={26} color={colors.sub} align="center" opacity={near}>
							FLANGE
						</Label>
						<Label x={gapPt.x + 420} y={gapPt.y + 300} size={26} color={colors.sub} align="center" opacity={near}>
							RAIL
						</Label>
					</>
				) : null}
				<Label x={130} y={150} size={44} color={colors.emerald} weight={700} opacity={on(f, t.touch, 20)}>
					NO CONTACT
				</Label>
			</AbsoluteFill>
		</Stage>
	);
};

export const flangeMythCues = (): SfxCue[] => {
	const t = T4();
	return [
		{frame: t.flanges, sfx: 'glass_tone', gainDb: -14, pan: 0.3},
		{frame: t.surprise, sfx: 'whoosh', gainDb: -16},
		{frame: t.gentle + 40, sfx: 'quartz_tick', gainDb: -10},
	];
};

// ---- s05 ----
const S5 = () => span('s05');
const T5 = () => ({
	look: at('s05', 'Look closely at the tread'),
	rolls: at('s05', 'the part of the wheel that rolls on the rail'),
	see: at('s05', 'Do you see it'),
	flat: at('s05', 'It is not flat'),
	tapered: at('s05', 'It is tapered'),
	bigger: at('s05', 'slightly bigger toward the flange'),
	slope: at('s05', 'The slope is about one in twenty'),
	move: at('s05', 'If you move twenty millimeters across'),
	grows: at('s05', 'its radius grows by one millimeter'),
	end: S5().dur,
});

// the section: u across the wheel (mm), screen x = SX + u·K; radius r → screen y = SY + (r − r0)·K
const K = 8;
const SX = 1060;
const SY = 600;
const sx = (u: number) => SX + u * K;
const sy = (r: number) => SY + (r - WS.r0) * K;

/** The contact's position across the tread (mm): 0, then 20 mm toward the flange on "If you move…". */
const contactU = (f: number): number => -20 * tween(f, T5().move + 20, T5().grows + 30, 0, 1, ease.camera);

const Section: React.FC<{f: number; o: number}> = ({f, o}) => {
	const t = T5();
	if (o <= 0.01) return null;
	const pts = wheelOutline().filter(([u]) => u > -70 && u < 100);
	const line = pts.map(([u, r]) => `${sx(u).toFixed(1)},${sy(r).toFixed(1)}`).join(' ');
	const steel = `${line} ${sx(pts[pts.length - 1][0])},420 ${sx(pts[0][0])},420`;
	const draw = pen(f, t.flat - 60, 50);
	const flatO = on(f, t.flat, 16);
	const wedge = on(f, t.flat + 30, 24);
	const u0 = contactU(f);
	const cxp = sx(u0);
	const cyp = sy(wheelR(u0));
	// the flat reference: a straightedge parallel to the axle through the starting contact
	const wedgePts = `${sx(0)},${sy(WS.r0)} ${sx(FLANGE_ROOT)},${sy(WS.r0)} ${sx(FLANGE_ROOT)},${sy(wheelR(FLANGE_ROOT))}`;
	const wedge2 = `${sx(0)},${sy(WS.r0)} ${sx(82)},${sy(WS.r0)} ${sx(82)},${sy(wheelR(82))}`;
	return (
		<Svg opacity={o}>
			<defs>
				<pattern id="cone-hatch" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
					<line x1="0" y1="0" x2="0" y2="16" stroke={colors.sub} strokeOpacity={0.25} strokeWidth={2} />
				</pattern>
				<linearGradient id="cone-steel" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#1B2533" />
					<stop offset="0.9" stopColor="#2E3F55" />
					<stop offset="1" stopColor="#5B6E85" />
				</linearGradient>
			</defs>
			<polygon points={steel} fill="url(#cone-steel)" opacity={draw} />
			<polygon points={steel} fill="url(#cone-hatch)" opacity={draw * 0.7} />
			<polyline points={line} fill="none" stroke={colors.line} strokeWidth={3.5} pathLength={1} strokeDasharray={`${draw} 1`} />
			{/* the axle's direction, for reference */}
			<line x1={160} y1={390} x2={1300} y2={390} stroke={colors.sub} strokeWidth={2} strokeDasharray="26 10 4 10" opacity={draw} />
			{/* the straightedge, parallel to the axle */}
			<line x1={sx(-60)} y1={sy(WS.r0)} x2={sx(98)} y2={sy(WS.r0)} stroke={colors.line} strokeWidth={3} strokeDasharray="14 10" opacity={flatO} />
			<polygon points={wedgePts} fill={colors.amber} opacity={0.35 * wedge} />
			<polygon points={wedge2} fill={colors.amber} opacity={0.35 * wedge} />
			{/* the tread glows where it rolls */}
			<polyline points={pts.filter(([u]) => u >= -30 && u <= 82).map(([u, r]) => `${sx(u).toFixed(1)},${sy(r).toFixed(1)}`).join(' ')} fill="none" stroke={colors.amber} strokeWidth={7} opacity={on(f, t.tapered, 24)} style={{filter: `drop-shadow(0 0 10px ${colors.amber})`}} />
			{/* the contact point, and the 20 mm it moves */}
			<circle cx={cxp} cy={cyp} r={11} fill={colors.amber} opacity={on(f, t.slope - 30, 20)} style={{filter: `drop-shadow(0 0 10px ${colors.amber})`}} />
			<Dim x1={sx(0)} y1={sy(WS.r0) + 120} x2={sx(u0)} y2={sy(WS.r0) + 120} color={colors.emerald} draw={u0 < -1 ? 1 : 0} />
		</Svg>
	);
};

/** The ×3 detail of the slope: run 20 mm, rise 1 mm, drawn true shape at 24 px/mm. */
const Detail: React.FC<{f: number; o: number}> = ({f, o}) => {
	const t = T5();
	if (o <= 0.01) return null;
	const x0 = 1100;
	const y0 = 900;
	const k = 24;
	const run = tween(f, t.move + 20, t.grows + 30, 0, 1, ease.camera);
	const rise = run;
	return (
		<>
			<Svg opacity={o}>
				<rect x={x0 - 40} y={y0 - 160} width={20 * k + 300} height={230} fill="rgba(7,10,15,0.8)" stroke={colors.sub} strokeWidth={1.5} />
				{/* the tread over those 20 mm: rising 1 mm toward the flange (to the left) */}
				<line x1={x0 + 20 * k} y1={y0} x2={x0} y2={y0 + k} stroke={colors.amber} strokeWidth={5} style={{filter: `drop-shadow(0 0 8px ${colors.amber})`}} />
				<line x1={x0 - 20} y1={y0} x2={x0 + 20 * k + 20} y2={y0} stroke={colors.line} strokeWidth={2} strokeDasharray="12 8" />
				<Dim x1={x0 + 20 * k} y1={y0 - 70} x2={x0 + 20 * k - 20 * k * run} y2={y0 - 70} color={colors.emerald} draw={run > 0.01 ? 1 : 0} />
				{rise > 0.98 ? <line x1={x0 - 18} y1={y0} x2={x0 - 18} y2={y0 + k} stroke={colors.amber} strokeWidth={4} /> : null}
			</Svg>
			<Label x={x0 - 20} y={y0 - 142} size={26} color={colors.sub} opacity={o}>
				DETAIL ×3 · TRUE SHAPE
			</Label>
			<Label x={x0 + 10 * k} y={y0 - 116} size={36} color={colors.emerald} weight={700} align="center" opacity={on(f, t.move + 30, 20)}>
				20 mm
			</Label>
			<Label x={x0 + 20 * k + 40} y={y0 - 4} size={36} color={colors.amber} weight={700} opacity={on(f, t.grows + 20, 20)}>
				r + 1 mm
			</Label>
			<Label x={x0 + 20 * k + 40} y={y0 - 70} size={44} color={colors.line} weight={700} opacity={on(f, t.slope, 20)}>
				1 : 20
			</Label>
		</>
	);
};

export const Cone: React.FC = () => {
	const f = useCurrentFrame();
	const t = T5();
	const toSection = tween(f, t.see + 40, t.flat - 10, 0, 1, ease.camera);
	const cam = camAt(
		f,
		[
			{f: 0, cam: {position: [1.0, 0.16, 2.9], target: [0.76, 0.12, 0], fov: 10}},
			{f: t.see + 60, cam: {position: [0.95, 0.06, 1.5], target: [0.77, 0.02, 0], fov: 9}},
		],
		ease.camera,
	);
	const path = useMemo(() => straightPath(-14, 14, 2), []);
	return (
		<Stage
			dur={S5().dur}
			light={{x: 0.55, y: 0.5}}
			overlay={
				<Hud
					title="THE TREAD"
					start={t.flat}
					end={t.end + 20}
					width={480}
					note="TEXTBOOK MODEL"
					rows={[
						{label: 'SLOPE', unit: '(1/20)', keys: [{frame: 0, value: WS.cone}], decimals: 2, tone: 'amber', source: 'C06', from: t.slope},
						{label: 'MOVED', unit: 'mm', at: (fr: number) => -contactU(fr), decimals: 1, tone: 'emerald', source: 'C06', from: t.move},
						{label: 'RADIUS r', unit: 'mm', at: (fr: number) => wheelR(contactU(fr)), decimals: 2, tone: 'amber', source: 'C06', from: t.move},
					]}
				/>
			}
		>
			<AbsoluteFill style={{opacity: 1 - toSection}}>
				<Stage3D width={W} height={H} cam={cam}>
					<Track3D path={path} />
					<Wheelset3D rolled={(f * 0.3) / 60} glow={on(f, t.rolls, 30)} />
				</Stage3D>
				<Label x={130} y={150} size={44} color={colors.amber} weight={700} opacity={on(f, t.rolls + 20, 20)}>
					THE TREAD
				</Label>
			</AbsoluteFill>
			<AbsoluteFill style={{opacity: toSection}}>
				<Section f={f} o={toSection} />
				<Label x={sx(-60)} y={sy(WS.r0) - 54} size={36} color={colors.line} weight={600} opacity={Math.min(on(f, t.flat, 16), off(f, t.tapered, 20))}>
					FLAT?
				</Label>
				<Label x={sx(-30)} y={sy(WS.r0) - 110} size={36} color={colors.amber} weight={600} opacity={on(f, t.bigger, 20)}>
					← BIGGER TOWARD THE FLANGE
				</Label>
				<Label x={170} y={346} size={26} color={colors.sub} opacity={toSection}>
					AXLE DIRECTION
				</Label>
				<Detail f={f} o={on(f, t.slope - 10, 24)} />
				<Tag x={96} y={150} opacity={toSection}>
					SECTION · TRUE SCALE · GENERIC PROFILE
				</Tag>
			</AbsoluteFill>
		</Stage>
	);
};

export const coneCues = (): SfxCue[] => {
	const t = T5();
	return [
		{frame: t.rolls, sfx: 'glass_tone', gainDb: -16},
		{frame: t.flat, sfx: 'pen_scratch', gainDb: -14},
		{frame: t.slope, sfx: 'quartz_tick', gainDb: -10},
		{frame: t.grows + 20, sfx: 'quartz_tick', gainDb: -10},
	];
};

// checks: the gentle curve leaves about 2 mm of play; 20 mm across a 1:20 tread is 1 mm of radius
if (Math.abs(GAP - 2.04) > 0.15) throw new Error(`flange gap on the example curve: ${GAP}`);
if (Math.abs(wheelR(-20) - wheelR(0) - 1) > 1e-9) throw new Error('cone: 20 mm across ≠ 1 mm of radius');
