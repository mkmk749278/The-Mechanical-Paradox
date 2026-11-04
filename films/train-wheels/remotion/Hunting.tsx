import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {colors, feaRamp} from '../../../lib/remotion/brand';
import {Hud} from '../../../lib/remotion/Hud';
import {ease, physical, tween} from '../../../lib/remotion/motion';
import {SfxCue} from '../../../lib/remotion/sfx';
import {Arrow, Callout, Dim, H, Label, lin, off, on, pen, Stage, Svg, Tag, TopWheelset, W} from './kit';
import {klingelWavelength, swayHz, WS} from './model';
import {contact, railOutline, wheelOutline} from './profiles';
import {at, endOf, span} from './scenes';

// s12 hunting (signature 3) and s13 critical speed: one continuous run of one wheelset (scenes/s12_hunting.md).
// Kinematics: Klingel's wave, y(s) = A(s) cos(2π (s − s0) / L), L = 2π √(b0 r0 / λ) = 17.2 m (C20, C21). The yaw is
// the slope, ψ = dy/ds: displaced toward a wheel, that wheel rolls bigger, the axle turns back (C12, C18).
// Honesty: the true sway is millimeters on a 17 m wave. Close up, the rails are true and only the yaw is
// exaggerated (the wheels stay on the rails); from above, the drawing becomes a plot with the sideways motion
// exaggerated and the rails replaced by the centreline and the ±7 mm flange limits (C09). Both are tagged.

const L = klingelWavelength(); // m
const A0 = 3; // mm, the nudge (ILLUSTRATIVE: never shown as a number)
const LIMIT = WS.clear; // mm, flange meets rail (C09)

// ---- one clock for both scenes: g = frames since s12 began ----
const S12 = () => span('s12');
const S13 = () => span('s13');
const g13 = (f: number): number => f + S13().from - S12().from;

const T = () => ({
	twist: at('s12', 'And here is the twist'),
	sway: endOf('s12', 'also makes it sway'),
	push: at('s12', 'If you push the axle'),
	steers: at('s12', 'the cone steers it back'),
	middle: at('s12', 'stop in the middle'),
	no: at('s12', 'No', 'stop in the middle'),
	overshoots: at('s12', 'It overshoots'),
	above: at('s12', 'If you watched from above'),
	wave: at('s12', 'smooth wave'),
	hunting: at('s12', 'call it hunting'),
	stephenson: at('s12', 'George Stephenson'),
	klingel: at('s12', 'an engineer called Klingel'),
	howLong: at('s12', 'how long each wave is'),
	textbook: at('s12', 'For the textbook wheelset you just saw'),
	seventeen: at('s12', 'about seventeen meters'),
	fast: at('s12', 'At a hundred and sixty'),
	sways: at('s12', 'two and a half sways every second'),
	end12: S12().dur,
	// s13, on the same clock
	why: g13(at('s13', "So why isn't your train")),
	below: g13(at('s13', 'below a certain speed')),
	critical: g13(at('s13', 'called the critical speed')),
	dies: g13(at('s13', 'it dies away')),
	aboveIt: g13(at('s13', 'Above it')),
	bigger: g13(at('s13', 'each sway is bigger than the last')),
	hammer: g13(at('s13', 'the flanges hammer the rails')),
	end13: g13(S13().dur),
});

/** Speed along the track, m/s, at clock frame g. Every change rides an eased ramp (never a jump). */
const speedAt = (g: number): number => {
	const t = T();
	let v = 0.9;
	v += tween(g, t.above, t.above + 200, 0, 2.1, ease.camera); // to 3 m/s as the camera rises
	v += tween(g, t.fast, t.fast + 150, 0, 160 / 3.6 - 3, ease.camera); // 160 km/h (C21)
	v += tween(g, t.below - 40, t.below + 80, 0, 120 / 3.6 - 160 / 3.6, ease.camera); // below critical (ILLUSTRATIVE)
	v += tween(g, t.aboveIt - 30, t.aboveIt + 110, 0, 220 / 3.6 - 120 / 3.6, ease.camera); // above (ILLUSTRATIVE)
	return v;
};

// distance travelled, by frame: a table built once (pure: the same every render)
let table: number[] | null = null;
const sTable = (): number[] => {
	if (table) return table;
	const n = T().end13 + 2;
	const out = new Array<number>(n);
	let s = 0;
	for (let g = 0; g < n; g++) {
		out[g] = s;
		s += speedAt(g) / 60;
	}
	table = out;
	return out;
};
const sAt = (g: number): number => {
	const tb = sTable();
	const i = Math.max(0, Math.min(tb.length - 2, Math.floor(g)));
	return tb[i] + (tb[i + 1] - tb[i]) * (g - i);
};
/** The clock frame at which the wheelset was at distance s (inverse of sAt). */
const gAtS = (s: number): number => {
	const tb = sTable();
	let lo = 0;
	let hi = tb.length - 1;
	if (s <= tb[0]) return 0;
	while (hi - lo > 1) {
		const m = (lo + hi) >> 1;
		if (tb[m] <= s) lo = m;
		else hi = m;
	}
	return lo + (s - tb[lo]) / Math.max(1e-9, tb[hi] - tb[lo]);
};

const FPS = 60;
/** The wave's amplitude (mm) when the wheelset was at clock frame g: the nudge, then damped, then growing. */
const ampAt = (g: number): number => {
	const t = T();
	const push = Math.min(1, physical(g, FPS, t.push + 8, {damping: 26}));
	let a = A0 * push;
	// below the critical speed: each sway smaller than the last (over distance, not time)
	if (g > t.below) a *= Math.exp(-(sAt(g) - sAt(t.below)) / 90);
	// above it: each sway bigger, until the flanges stop it
	if (g > t.aboveIt) {
		const base = A0 * Math.exp(-(sAt(t.aboveIt) - sAt(t.below)) / 90);
		a = base * Math.exp((sAt(g) - sAt(t.aboveIt)) / 70);
	}
	return Math.min(a, 11);
};

/** Phase origin: the wave starts at the push with the axle at its widest. */
const s0 = (): number => sAt(T().push + 50);

/** Lateral position (mm) of the axle centre at distance s; flange contact caps it at ±7 mm (a hard stop). */
const yAtS = (s: number): number => {
	if (s < s0()) return A0 * Math.min(1, physical(gAtS(s), FPS, T().push + 8, {damping: 26}));
	return stop(ampAt(gAtS(s)) * Math.cos((2 * Math.PI * (s - s0())) / L));
};

/** The flange as a hard stop: linear well inside ±7 mm, flat at the limit (a smooth minimum, p = 6). */
const stop = (raw: number): number => raw / Math.pow(1 + Math.pow(Math.abs(raw) / LIMIT, 6), 1 / 6);

/** Strikes: crests of |y| that reach the flange, as clock frames. */
const strikes = (): number[] => {
	const out: number[] = [];
	const t = T();
	for (let n = 1; n < 400; n++) {
		const s = s0() + (n * L) / 2;
		const g = gAtS(s);
		if (g > t.end13) break;
		if (g > t.aboveIt && stop(ampAt(g)) > LIMIT * 0.97) out.push(g);
	}
	return out;
};

// ---- the camera: close and true, then up and over into the plot ----
type Cam = {pxPerM: number; latPxPerMm: number; yawK: number; xw: number; plot: number};
const camAt = (g: number): Cam => {
	const t = T();
	const p = tween(g, t.above, t.above + 230, 0, 1, ease.camera);
	const lerpLog = (a: number, b: number) => Math.exp(Math.log(a) + (Math.log(b) - Math.log(a)) * p);
	const pxPerM = lerpLog(300, 85);
	const latPxPerMm = lerpLog(pxPerM / 1000, 32);
	return {pxPerM, latPxPerMm, yawK: Math.max(95 * (1 - p) + 376 * p, (latPxPerMm * 1000) / pxPerM), xw: 900 + 700 * p, plot: p};
};

const CY = 700; // the track centreline on screen

// ---- drawing ----

const Formula: React.FC<{g: number}> = ({g}) => {
	const t = T();
	const fade = Math.min(1, off(g, t.fast + 120, 40) + (g < t.fast ? 1 : 0));
	const a1 = on(g, t.klingel + 10);
	const a2 = on(g, t.howLong);
	const a3 = on(g, t.howLong + 40);
	const b = on(g, t.textbook + 20);
	const c = on(g, t.seventeen);
	if (a1 <= 0) return null;
	const x = 96;
	const y = 150;
	const f = 'JetBrains Mono, monospace';
	return (
		<g opacity={fade}>
			<text x={x} y={y - 64} fontFamily={f} fontSize={26} letterSpacing={2} fill={colors.sub} opacity={a1}>
				KLINGEL · 1883
			</text>
			<text x={x} y={y} fontFamily={f} fontSize={50} fontWeight={700} fill={colors.line}>
				<tspan opacity={a1}>L = </tspan>
				<tspan opacity={a2}>2π</tspan>
			</text>
			{/* the radical, drawn (a pen stroke), over b0 r0 / λ */}
			<g opacity={a2}>
				<polyline points={`${x + 222},${y - 18} ${x + 236},${y - 24} ${x + 254},${y + 10} ${x + 276},${y - 46} ${x + 276 + 330 * a3},${y - 46}`} fill="none" stroke={colors.line} strokeWidth={3.5} strokeLinejoin="round" />
			</g>
			<text x={x + 292} y={y} fontFamily={f} fontSize={50} fontWeight={700} fill={colors.line} opacity={a3}>
				b<tspan fontSize={30} dy={10}>0</tspan>
				<tspan dy={-10}> r</tspan>
				<tspan fontSize={30} dy={10}>0</tspan>
				<tspan dy={-10}> / </tspan>
				<tspan fill={colors.amber}>λ</tspan>
			</text>
			<text x={x} y={y + 70} fontFamily={f} fontSize={36} fill={colors.sub} opacity={b}>
				b0 0.75 m · r0 0.50 m · λ 1/20
			</text>
			<text x={x} y={y + 130} fontFamily={f} fontSize={50} fontWeight={700} fill={colors.emerald} opacity={c} style={{filter: `drop-shadow(0 0 10px ${colors.emerald})`}}>
				L = {L.toFixed(1)} m
			</text>
		</g>
	);
};

/**
 * The strike in section (s13 inset): the outer wheel against the rail at full play, from the same outlines and contact
 * solver as every other section; the stress field is iso-bands in the FEA ramp, clipped inside the steel of each part,
 * concentrated where the flange flank meets the rail's gauge corner (a stress field, never an icon; ILLUSTRATION).
 */
const StrikeInset: React.FC<{hit: number; show: number}> = ({hit, show}) => {
	if (show <= 0.001) return null;
	const ox = 740;
	const oy = 64;
	const bw = 460;
	const bh = 300;
	const k = 3.6; // px per mm
	const c = contact(LIMIT);
	// place the contact region in the box: wheel frame (u, z) → screen
	const cx = ox + 270;
	const cy = oy + 150;
	const sx = (v: number) => cx + v * k;
	const sy = (z: number) => cy - z * k;
	const rail = railOutline().map(([v, z]) => [sx(v), sy(z)] as [number, number]);
	const outline = wheelOutline().map(([u, r]) => [sx(u + LIMIT), sy(c.axleZ - r)] as [number, number]);
	const rimZ = c.axleZ - (WS.r0 - 70);
	const wheel: [number, number][] = [...outline, [outline[outline.length - 1][0], sy(rimZ)], [outline[0][0], sy(rimZ)]];
	// the flange contact: the closest pair of points between the two outlines, on the flange side
	let best = {d: Infinity, x: 0, y: 0};
	for (const [wx, wy] of outline) {
		if (wx > sx(-20 + LIMIT)) continue;
		for (const [rx, ry] of rail) {
			const d = Math.hypot(wx - rx, wy - ry);
			if (d < best.d) best = {d, x: (wx + rx) / 2, y: (wy + ry) / 2};
		}
	}
	const pts = (p: [number, number][]) => p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
	const level = 0.18 + 0.82 * hit; // the field's strength follows the strike
	const bands = [1, 0.8, 0.62, 0.46, 0.32, 0.2];
	const field = (scale: number) =>
		bands.map((b, i) => {
			const s = b * level;
			const col = s > 0.75 ? feaRamp[4] : s > 0.55 ? feaRamp[3] : s > 0.38 ? feaRamp[2] : s > 0.2 ? feaRamp[1] : feaRamp[0];
			const r = (8 + 82 * (1 - b)) * scale * (0.65 + 0.5 * level);
			return <ellipse key={i} cx={best.x} cy={best.y} rx={r * 1.6} ry={r} transform={`rotate(-70 ${best.x} ${best.y})`} fill={col} stroke="rgba(7,10,15,0.45)" strokeWidth={1.2} />;
		}).reverse();
	return (
		<g opacity={show}>
			<defs>
				<clipPath id="strike-box">
					<rect x={ox} y={oy} width={bw} height={bh} />
				</clipPath>
				<clipPath id="strike-wheel">
					<polygon points={pts(wheel)} />
				</clipPath>
				<clipPath id="strike-rail">
					<polygon points={pts(rail)} />
				</clipPath>
				<pattern id="strike-hatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
					<line x1="0" y1="0" x2="0" y2="12" stroke={colors.sub} strokeOpacity={0.25} strokeWidth={2} />
				</pattern>
			</defs>
			<rect x={ox} y={oy} width={bw} height={bh} fill="rgba(7,10,15,0.9)" stroke={hit > 0.05 ? colors.crimson : colors.sub} strokeWidth={hit > 0.05 ? 3 : 1.5} strokeOpacity={hit > 0.05 ? 0.4 + 0.6 * hit : 1} />
			<g clipPath="url(#strike-box)">
				<polygon points={pts(rail)} fill={feaRamp[0]} />
				<g clipPath="url(#strike-rail)">{field(0.75)}</g>
				<polygon points={pts(rail)} fill="url(#strike-hatch)" stroke={colors.line} strokeWidth={2.5} />
				<polygon points={pts(wheel)} fill={feaRamp[0]} />
				<g clipPath="url(#strike-wheel)">{field(1)}</g>
				<polygon points={pts(wheel)} fill="url(#strike-hatch)" stroke={colors.line} strokeWidth={2.5} />
			</g>
			<text x={ox} y={oy + bh + 36} fontFamily="JetBrains Mono, monospace" fontSize={26} letterSpacing={1.6} fill={colors.sub}>
				FLANGE STRIKE · ILLUSTRATION
			</text>
		</g>
	);
};

const Run: React.FC<{g: number}> = ({g}) => {
	const t = T();
	const cam = camAt(g);
	const sw = sAt(g);
	const yw = yAtS(sw);
	const dyds = (yAtS(sw + 0.05) - yAtS(sw - 0.05)) / 0.1; // mm per m
	const yaw = Math.atan(cam.yawK * (dyds / 1000));
	const X = (s: number) => cam.xw + (s - sw) * cam.pxPerM;
	const Y = (ymm: number) => CY - ymm * cam.latPxPerMm;
	const k = cam.pxPerM / 1000;
	const rails = 1 - cam.plot;
	// sleepers every 0.6 m, faded as the camera rises and as speed smears them
	const sleepers: number[] = [];
	if (rails > 0.02) {
		const first = Math.ceil((sw - cam.xw / cam.pxPerM) / 0.6);
		const last = Math.floor((sw + (W - cam.xw) / cam.pxPerM) / 0.6);
		for (let i = first; i <= last; i++) sleepers.push(i * 0.6);
	}
	// the trace: the axle centre's path, a long exposure that fades with age
	const trace: string[] = [];
	const back = (cam.xw + 40) / cam.pxPerM;
	const step = Math.max(0.05, back / 420);
	for (let s = Math.max(0, sw - back); s <= sw; s += step) trace.push(`${X(s).toFixed(1)},${Y(yAtS(s)).toFixed(1)}`);
	trace.push(`${X(sw).toFixed(1)},${Y(yw).toFixed(1)}`);
	const traceOn = cam.plot;
	// strikes and their flashes
	const hits = strikes();
	let flash = 0;
	let flashSide = 1;
	let flashS = sw;
	for (const h of hits) {
		if (g >= h) {
			const e = Math.exp(-(g - h) / 9);
			if (e > flash) {
				flash = e;
				flashS = sAt(h);
				flashSide = Math.sign(yAtS(flashS)) || 1;
			}
		}
	}
	// growth of each wheel's rolling radius drawn on the band glow: the wheel on the shifted side runs bigger
	const glowL = Math.max(0, Math.min(1, yw / A0)) * on(g, t.steers - 20, 30) * (1 - cam.plot);
	const glowR = Math.max(0, Math.min(1, -yw / A0)) * on(g, t.steers - 20, 30) * (1 - cam.plot);
	const pushArrow = Math.min(on(g, t.push - 6, 14), off(g, t.push + 40, 18));
	const limits = cam.plot;
	// the 17.2 m dimension: one whole wave, between two points at the same phase behind the axle
	const dimOn = Math.min(pen(g, t.seventeen - 10, 36), off(g, t.fast + 60, 30));
	const sb = sw - 0.8;
	const sa = sb - L;
	const dimY = CY + 160;
	return (
		<>
			<Svg>
				{/* rails (true scale) */}
				<g opacity={rails}>
					{sleepers.map((s) => (
						<line key={s} x1={X(s)} y1={CY - 1300 * k} x2={X(s)} y2={CY + 1300 * k} stroke={colors.muted} strokeWidth={Math.max(1.5, 250 * k)} opacity={0.16 * Math.max(0, 1 - speedAt(g) / 12)} />
					))}
					{[-1, 1].map((side) => (
						<g key={side}>
							<rect x={-10} y={CY + side * 750 * k - 32 * k} width={W + 20} height={64 * k} fill={colors.bg_lift} stroke={colors.line} strokeWidth={2} />
							<line x1={-10} y1={CY + side * 750 * k} x2={W + 10} y2={CY + side * 750 * k} stroke={colors.sub} strokeWidth={1} opacity={0.5} />
						</g>
					))}
				</g>
				{/* the plot: centreline and the flange limits */}
				<g opacity={limits}>
					<line x1={0} y1={CY} x2={W} y2={CY} stroke={colors.sub} strokeWidth={1.5} strokeDasharray="26 10 4 10" />
					{[-1, 1].map((side) => (
						<line key={side} x1={0} y1={Y(side * LIMIT)} x2={side > 0 ? 1330 : W} y2={Y(side * LIMIT)} stroke={colors.amber} strokeWidth={2.5} strokeDasharray="16 12" opacity={0.85} />
					))}
				</g>
				{/* the trace */}
				<polyline points={trace.join(' ')} fill="none" stroke={colors.emerald} strokeWidth={4} opacity={traceOn} style={{filter: `drop-shadow(0 0 8px ${colors.emerald})`}} />
				{/* the nudge, where it sits on the record */}
				{cam.plot > 0.05 && X(sAt(T().push + 20)) > 40 ? (
					<g opacity={cam.plot * off(g, T().hunting, 30)}>
						<Arrow x1={X(sAt(T().push + 20))} y1={CY + 120} x2={X(sAt(T().push + 20))} y2={CY + 30} color={colors.emerald} width={4} />
						<text x={X(sAt(T().push + 20))} y={CY + 160} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={30} fill={colors.emerald}>
							PUSH
						</text>
					</g>
				) : null}
				{/* one wave, dimensioned */}
				{dimOn > 0 ? (
					<g>
						<line x1={X(sa)} y1={Y(yAtS(sa)) + 14} x2={X(sa)} y2={dimY + 16} stroke={colors.emerald} strokeWidth={2} opacity={dimOn} strokeDasharray="6 6" />
						<line x1={X(sb)} y1={Y(yAtS(sb)) + 14} x2={X(sb)} y2={dimY + 16} stroke={colors.emerald} strokeWidth={2} opacity={dimOn} strokeDasharray="6 6" />
						<rect x={(X(sa) + X(sb)) / 2 - 190} y={dimY - 26} width={380} height={52} fill={colors.bg} opacity={dimOn} />
						<text x={(X(sa) + X(sb)) / 2} y={dimY + 14} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={40} fontWeight={700} fill={colors.emerald} opacity={tween(g, t.seventeen + 20, t.seventeen + 40, 0, 1) * dimOn}>
							ONE WAVE · {L.toFixed(1)} m
						</text>
						<Dim x1={X(sa)} y1={dimY} x2={X(sb)} y2={dimY} color={colors.emerald} draw={dimOn} />
					</g>
				) : null}
				{/* flange strikes: a crimson flash where the wheel meets the limit */}
				{flash > 0.01 ? (
					<circle cx={X(flashS)} cy={Y(flashSide * LIMIT)} r={24 + 50 * (1 - flash)} fill={colors.crimson} opacity={0.75 * flash} style={{filter: `blur(6px)`}} />
				) : null}
				{/* the push */}
				{pushArrow > 0 ? <Arrow x1={cam.xw + 40} y1={CY + 560 * k} x2={cam.xw + 40} y2={CY + 470 * k - 70} color={colors.emerald} width={7} grow={pushArrow} /> : null}
				<TopWheelset pose={{x: cam.xw, y: Y(yw), heading: Math.PI / 2 - yaw, k}} glow={0} />
				{/* the cone at work: the band of the bigger wheel glows */}
				<g transform={`translate(${cam.xw} ${Y(yw)}) rotate(${((Math.PI / 2 - yaw) * 180) / Math.PI})`}>
					{[-1, 1].map((side) => {
						const gl = side < 0 ? glowL : glowR;
						return gl > 0.01 ? <rect key={side} x={side * 770 * k - 64 * k} y={-490 * k} width={128 * k} height={980 * k} rx={4} fill={colors.amber} opacity={0.45 * gl} style={{filter: `drop-shadow(0 0 12px ${colors.amber})`}} /> : null;
					})}
				</g>
				{/* the axle centre, the point that draws the wave */}
				<circle cx={cam.xw} cy={Y(yw)} r={8} fill={colors.emerald} style={{filter: `drop-shadow(0 0 8px ${colors.emerald})`}} />
			</Svg>
		</>
	);
};

/** The lateral gauge in the close view: the true millimetres, with the ±7 mm flange limits (C09). */
const Gauge: React.FC<{g: number}> = ({g}) => {
	const t = T();
	const cam = camAt(g);
	const o = Math.min(on(g, t.push - 30, 24), 1 - cam.plot * 1.4);
	if (o <= 0.01) return null;
	const yw = yAtS(sAt(g));
	const x = 1500;
	const k = 22; // px per mm
	return (
		<>
			<Svg opacity={o}>
				<line x1={x} y1={CY - 8 * k} x2={x} y2={CY + 8 * k} stroke={colors.sub} strokeWidth={2} />
				{Array.from({length: 15}, (_, i) => i - 7).map((m) => (
					<line key={m} x1={x - (m % 7 === 0 ? 22 : 10)} y1={CY - m * k} x2={x} y2={CY - m * k} stroke={m % 7 === 0 && m !== 0 ? colors.amber : colors.sub} strokeWidth={m % 7 === 0 ? 3 : 1.5} />
				))}
				<polygon points={`${x + 4},${CY - yw * k} ${x + 30},${CY - yw * k - 13} ${x + 30},${CY - yw * k + 13}`} fill={colors.emerald} style={{filter: `drop-shadow(0 0 6px ${colors.emerald})`}} />
			</Svg>
			<Label x={x + 44} y={CY - 7 * k - 18} size={26} color={colors.amber} opacity={o}>
				+7 mm FLANGE
			</Label>
			<Label x={x + 44} y={CY + 7 * k - 18} size={26} color={colors.amber} opacity={o}>
				−7 mm FLANGE
			</Label>
			<Label x={x + 44} y={CY - 18} size={26} color={colors.sub} opacity={o}>
				CENTRE
			</Label>
		</>
	);
};

const hudRows12 = () => {
	const t = T();
	return [
		{label: 'r0', unit: 'mm', keys: [{frame: 0, value: WS.r0}], decimals: 0, tone: 'line' as const, source: 'C10'},
		{label: 'b0', unit: 'mm', keys: [{frame: 0, value: WS.b0}], decimals: 0, tone: 'line' as const, source: 'C04'},
		{label: 'WAVE L', unit: 'm', keys: [{frame: 0, value: L}], decimals: 1, tone: 'emerald' as const, source: 'C21', from: t.seventeen},
		{label: 'SPEED', unit: 'km/h', at: (f: number) => speedAt(f) * 3.6, decimals: 0, tone: 'line' as const, source: 'C21', from: t.fast},
		{label: 'SWAY f', unit: 'Hz', at: (f: number) => speedAt(f) / L, decimals: 2, tone: 'amber' as const, source: 'C21', from: t.sways - 30},
	];
};

export const Hunting: React.FC = () => {
	const g = useCurrentFrame();
	const t = T();
	const cam = camAt(g);
	const sw = sAt(g);
	const sc = sw - 0.62 * L;
	const hx = cam.xw + (sc - sw) * cam.pxPerM;
	const hy = CY - yAtS(sc) * cam.latPxPerMm;
	return (
		<Stage
			dur={S12().dur}
			light={{x: 0.55, y: 0.6}}
			overlay={<Hud title="WHEELSET" rows={hudRows12()} start={10} end={t.end12 + 30} note="TEXTBOOK MODEL" width={480} />}
		>
			<AbsoluteFill>
				<Run g={g} />
				<Gauge g={g} />
				<Svg>
					<Formula g={g} />
				</Svg>
				<Callout x={hx} y={hy} lx={hx + 180} ly={CY + 220} text="HUNTING" color={colors.emerald} t={Math.min(lin(g, t.hunting, t.hunting + 40, 0, 1), 1 - lin(g, t.stephenson + 60, t.stephenson + 90, 0, 1))} size={44} />
				<Label x={96} y={H - 156} size={26} color={colors.sub} opacity={Math.min(on(g, t.stephenson + 20), off(g, t.fast, 30))}>
					GEORGE STEPHENSON · BY 1821
				</Label>
				<Tag x={96} y={H - 110} opacity={Math.min(on(g, t.steers - 10, 20), 1 - cam.plot)}>
					YAW EXAGGERATED
				</Tag>
				<Tag x={96} y={H - 110} opacity={cam.plot * on(g, t.above + 100, 30)}>
					NOT TO SCALE · SIDEWAYS MOTION EXAGGERATED
				</Tag>
				<Label x={W - 96} y={CY + LIMIT * cam.latPxPerMm + 14} size={26} color={colors.amber} align="right" opacity={cam.plot * on(g, t.above + 140, 30)}>
					±7 mm · FLANGE MEETS RAIL
				</Label>
			</AbsoluteFill>
		</Stage>
	);
};

// ---- s13: critical speed ----

export const CriticalSpeed: React.FC = () => {
	const f = useCurrentFrame();
	const g = g13(f);
	const t = T();
	const cam = camAt(g);
	const hits = strikes();
	let hit = 0;
	for (const h of hits) if (g >= h) hit = Math.max(hit, Math.exp(-(g - h) / 10));
	const critical = 180; // km/h, ILLUSTRATIVE
	const belowO = Math.min(on(f, at('s13', 'below a certain speed')), off(f, at('s13', 'Above it') - 10));
	const aboveO = on(f, at('s13', 'Above it'));
	return (
		<Stage
			dur={S13().dur}
			light={{x: 0.55, y: 0.6}}
			overlay={
				<Hud
					title="HUNTING"
					start={-30}
					end={S13().dur + 30}
					width={560}
					corner="top-left"
					rows={[
						{label: 'SPEED', unit: 'km/h', at: (fr: number) => speedAt(g13(fr)) * 3.6, decimals: 0, tone: 'line', source: 'ILLUSTRATIVE'},
						{label: 'CRITICAL', unit: 'km/h', keys: [{frame: 0, value: critical}], decimals: 0, tone: 'amber', source: 'ILLUSTRATIVE', from: at('s13', 'called the critical speed')},
						{label: 'SWAY', unit: 'mm', at: (fr: number) => stop(ampAt(g13(fr))), decimals: 1, tone: 'emerald', source: 'ILLUSTRATIVE', from: at('s13', 'below a certain speed')},
					]}
				/>
			}
		>
			<AbsoluteFill>
				<Run g={g} />
				<Svg>
					<StrikeInset hit={hit} show={on(g, t.hammer - 70, 24)} />
				</Svg>
				<Tag x={96} y={H - 110} opacity={1}>
					NOT TO SCALE · SIDEWAYS MOTION EXAGGERATED
				</Tag>
				<Label x={W - 96} y={CY + LIMIT * cam.latPxPerMm + 14} size={26} color={colors.amber} align="right">
					±7 mm · FLANGE MEETS RAIL
				</Label>
				<Label x={W - 96} y={110} size={40} color={colors.emerald} weight={700} opacity={belowO} align="right">
					BELOW CRITICAL · DIES AWAY
				</Label>
				<Label x={W - 96} y={110} size={40} color={colors.crimson} weight={700} opacity={aboveO} align="right">
					ABOVE CRITICAL · GROWS
				</Label>
			</AbsoluteFill>
		</Stage>
	);
};

// ---- sound ----
export const huntingCues = (): SfxCue[] => {
	const t = T();
	return [
		{frame: t.push, sfx: 'glass_tone', gainDb: -12, pan: 0.2},
		{frame: t.above, sfx: 'whoosh', gainDb: -16},
		{frame: t.klingel + 10, sfx: 'pen_scratch', gainDb: -14},
		{frame: t.seventeen, sfx: 'quartz_tick', gainDb: -10},
		{frame: t.fast, sfx: 'flow_sweep', gainDb: -14},
	];
};
/** s13's cues on the s12 clock (Film shifts by s12's start). */
export const criticalCues = (): SfxCue[] => strikes().map((g) => ({frame: Math.round(g), sfx: 'metal_snap_sub' as const, gainDb: -9, pan: Math.sign(yAtS(sAt(g))) * 0.4}));

// numeric checks: the wave on screen is Klingel's (17.2 m), the sway at 160 km/h is C21's 2.58 Hz
if (Math.abs(L - 17.21) > 0.01) throw new Error(`hunting: wavelength ${L}`);
if (Math.abs(swayHz(160) - 2.58) > 0.01) throw new Error('hunting: 2.58 Hz');
