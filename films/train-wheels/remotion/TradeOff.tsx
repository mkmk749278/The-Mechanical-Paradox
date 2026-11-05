import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {colors} from '../../../lib/remotion/brand';
import {Hud} from '../../../lib/remotion/Hud';
import {ease, tween} from '../../../lib/remotion/motion';
import {SfxCue} from '../../../lib/remotion/sfx';
import {H, Label, off, on, pen, Stage, Svg, Tag, TopWheelset, W} from './kit';
import {tightestCurve, WS} from './model';
import {at, span} from './scenes';

// s14 the fix and the trade-off (scenes/s14_tradeoff.md). Flatter cones raise the critical speed (C23); Japan's
// bullet trains used 1:40 (C24); stiff axle guidance resists hunting (C25) but works against steering in curves (C30);
// so: steep cone or loose axle for tight curves (C14), flat cone or stiff axle for speed (C23): no design is best at
// both (C26).

const S = () => span('s14');
const T = () => ({
	fix: at('s14', 'Fast trains have a fix'),
	flatter: at('s14', 'They use flatter cones'),
	japan: at('s14', "Japan's bullet trains"),
	forty: at('s14', 'one in forty'),
	half: at('s14', 'half as steep'),
	stiff: at('s14', 'holding each axle stiffly in its frame'),
	straight: at('s14', 'keeps it pointing straight'),
	harder: at('s14', 'makes it harder to turn into a curve'),
	see: at('s14', 'See the trade-off'),
	steep: at('s14', 'A steeper cone, or a looser axle'),
	tight: at('s14', 'takes tight curves better'),
	flat: at('s14', 'A flatter cone, or a stiffer axle'),
	calm: at('s14', 'stays calm at speed'),
	both: at('s14', 'No single design is best at both'),
	end: S().dur,
});

// ---- phase A: the two treads, slopes drawn ×10 ----
const Profiles: React.FC<{f: number; o: number}> = ({f, o}) => {
	const t = T();
	if (o <= 0.01) return null;
	const x0 = 160;
	const x1 = 1000;
	const y0 = 840;
	const ex = 10; // slope exaggeration
	const line = (cone: number) => `${x0},${y0} ${x1},${y0 - (x1 - x0) * cone * ex}`;
	const d20 = pen(f, t.fix + 10, 60); // the 1:20 line starts on "Fast trains have a fix": no empty frame under it (v3)
	const d40 = pen(f, t.flatter + 20, 40);
	const tri = on(f, t.half, 20);
	return (
		<>
			<Svg opacity={o}>
				<line x1={x0 - 40} y1={y0} x2={x1 + 40} y2={y0} stroke={colors.sub} strokeWidth={2} strokeDasharray="14 10" />
				<polyline points={line(1 / 20)} fill="none" stroke={colors.amber} strokeWidth={6} pathLength={1} strokeDasharray={`${d20} 1`} style={{filter: `drop-shadow(0 0 8px ${colors.amber})`}} />
				<polyline points={line(1 / 40)} fill="none" stroke={colors.emerald} strokeWidth={6} pathLength={1} strokeDasharray={`${d40} 1`} style={{filter: `drop-shadow(0 0 8px ${colors.emerald})`}} />
				{/* half as steep: the two rises over the same run */}
				{/* the rises at the end of the same run, side by side under the line ends (viewer review v3: bars drawn out at
				    x1 + 330 cut through the bullet-train caption) */}
				<g opacity={tri}>
					<line x1={x1 - 8} y1={y0} x2={x1 - 8} y2={y0 - (x1 - x0) * (1 / 20) * ex * tri} stroke={colors.amber} strokeWidth={8} />
					<line x1={x1 + 8} y1={y0} x2={x1 + 8} y2={y0 - (x1 - x0) * (1 / 40) * ex * tri} stroke={colors.emerald} strokeWidth={8} />
				</g>
			</Svg>
			<Label x={x1 + 30} y={y0 - (x1 - x0) * (1 / 20) * ex - 30} size={44} color={colors.amber} weight={700} opacity={o * d20}>
				1 : 20
			</Label>
			<Label x={x1 + 30} y={y0 - (x1 - x0) * (1 / 40) * ex - 30} size={44} color={colors.emerald} weight={700} opacity={o * on(f, t.forty, 20)}>
				1 : 40
			</Label>
			<Label x={x1 + 30} y={y0 - (x1 - x0) * (1 / 40) * ex + 26} size={36} color={colors.sub} opacity={o * on(f, t.japan, 20)}>
				JAPAN'S BULLET TRAINS USED IT
			</Label>
			<Label x={x1 + 40} y={y0 - 70} size={36} color={colors.line} weight={600} opacity={o * tri}>
				HALF AS STEEP
			</Label>
			<Label x={x0 - 40} y={y0 + 30} size={26} color={colors.sub} opacity={o}>
				AXLE DIRECTION
			</Label>
			{/* bottom right: the footage credit owns the bottom left while the bullet-train insert plays (viewer review v3) */}
			<Tag x={W - 96} y={H - 110} opacity={o} align="right">
				NOT TO SCALE · SLOPES ×10
			</Tag>
		</>
	);
};

// ---- phase B: a bogie from above: the frame, two wheelsets, the axle-box springs ----
const Spring: React.FC<{x: number; y: number; len: number; stiff: number}> = ({x, y, len, stiff}) => {
	const coils = 7 + Math.round(5 * stiff);
	const pts: string[] = [];
	for (let i = 0; i <= coils * 2; i++) pts.push(`${(x + (len * i) / (coils * 2)).toFixed(1)},${(y + (i % 2 === 0 ? -10 : 10) * (i === 0 || i === coils * 2 ? 0 : 1)).toFixed(1)}`);
	return <polyline points={pts.join(' ')} fill="none" stroke={stiff > 0.3 ? colors.emerald : colors.sub} strokeWidth={3 + 2 * stiff} style={stiff > 0.3 ? {filter: `drop-shadow(0 0 6px ${colors.emerald})`} : undefined} />;
};

const Bogie: React.FC<{f: number; o: number}> = ({f, o}) => {
	const t = T();
	if (o <= 0.01) return null;
	const stiff = on(f, t.stiff + 30, 40);
	const curve = tween(f, t.harder - 30, t.harder + 40, 0, 1, ease.camera);
	// on a curve the stiff bogie keeps both axles parallel to its frame: neither points at the centre
	const k = 0.16; // px per mm
	const cx = 760;
	const cy = 560;
	const yaw = (-14 * Math.PI) / 180 * curve; // the frame follows the curve's chord
	const wb = 2500; // mm wheelbase
	const axles = [-wb / 2, wb / 2];
	// the curve the bogie stands on (drawn tight), fades in
	const R = 2600; // px
	const O = {x: cx - R, y: cy};
	const arc = (r: number) => {
		const out: string[] = [];
		for (let a = -24; a <= 24; a += 0.5) out.push(`${(O.x + r * Math.cos((a * Math.PI) / 180)).toFixed(1)},${(O.y + r * Math.sin((a * Math.PI) / 180)).toFixed(1)}`);
		return out.join(' ');
	};
	const lead = curve > 0.5;
	return (
		<>
			<Svg opacity={o}>
				{/* track: straight, then a curve */}
				<g opacity={1 - curve}>
					<line x1={cx - 750 * k} y1={80} x2={cx - 750 * k} y2={H - 80} stroke={colors.line} strokeWidth={3} />
					<line x1={cx + 750 * k} y1={80} x2={cx + 750 * k} y2={H - 80} stroke={colors.line} strokeWidth={3} />
				</g>
				<g opacity={curve}>
					<polyline points={arc(R - 750 * k)} fill="none" stroke={colors.line} strokeWidth={3} />
					<polyline points={arc(R + 750 * k)} fill="none" stroke={colors.line} strokeWidth={3} />
				</g>
				<g transform={`translate(${cx} ${cy}) rotate(${(yaw * 180) / Math.PI})`}>
					{/* the frame: two side frames and the transoms */}
					{[-1, 1].map((s) => (
						<rect key={s} x={s * 1050 * k - 60 * k} y={-1700 * k} width={120 * k} height={3400 * k} rx={8} fill="rgba(13,20,32,0.9)" stroke={colors.line} strokeWidth={2.5} />
					))}
					<rect x={-1050 * k} y={-300 * k} width={2100 * k} height={160 * k} fill="none" stroke={colors.line} strokeWidth={2} />
					<rect x={-1050 * k} y={140 * k} width={2100 * k} height={160 * k} fill="none" stroke={colors.line} strokeWidth={2} />
					{axles.map((ay) => (
						<g key={ay}>
							<TopWheelset pose={{x: 0, y: ay * k, heading: 0, k}} heatR={lead && ay < 0 ? curve : 0} />
							{/* the axle boxes, held fore and aft by springs to the frame */}
							{[-1, 1].map((s) => (
								<g key={s}>
									<rect x={s * 1050 * k - 50 * k} y={ay * k - 90 * k} width={100 * k} height={180 * k} fill={colors.bg_lift} stroke={colors.line} strokeWidth={2} />
									<Spring x={s * 1050 * k - 140 * k} y={ay * k - 150 * k} len={280 * k} stiff={stiff} />
								</g>
							))}
						</g>
					))}
				</g>
				{/* the leading flange on the outer rail: the curve forces it, the frame holds the axle */}
				{lead ? <circle cx={cx + 900 * k * Math.cos(yaw) + (wb / 2) * k * Math.sin(yaw)} cy={cy - (wb / 2) * k * Math.cos(yaw) + 900 * k * Math.sin(yaw)} r={16} fill={colors.crimson} opacity={curve} style={{filter: `drop-shadow(0 0 12px ${colors.crimson})`}} /> : null}
			</Svg>
			<Label x={1060} y={360} size={36} color={colors.emerald} weight={700} opacity={o * stiff * (1 - curve)}>
				STIFF: KEEPS IT STRAIGHT
			</Label>
			<Label x={1060} y={410} size={26} color={colors.sub} opacity={o * on(f, t.stiff, 20)}>
				A BOGIE FROM ABOVE · AXLE-BOX SPRINGS
			</Label>
			<Label x={1060} y={360} size={36} color={colors.crimson} weight={700} opacity={o * curve}>
				STIFF: FIGHTS THE CURVE
			</Label>
			<Tag x={96} y={H - 110} opacity={o}>
				SCHEMATIC · NOT TO SCALE
			</Tag>
		</>
	);
};

// ---- phase C: the trade-off, four panels ----
const Panel: React.FC<{x: number; y: number; w: number; h: number; kind: 'curve' | 'speed'; good: boolean; lit: number; f: number; label: string}> = ({x, y, w, h, kind, good, lit, f, label}) => {
	const col = good ? colors.emerald : colors.crimson;
	const inner: React.ReactNode[] = [];
	if (kind === 'curve') {
		const R = 520;
		const O = {x: x + w / 2 - R, y: y + h / 2 + 40};
		const arc = (r: number) => {
			const out: string[] = [];
			for (let a = -20; a <= 20; a += 1) out.push(`${(O.x + r * Math.cos((a * Math.PI) / 180)).toFixed(1)},${(O.y + r * Math.sin((a * Math.PI) / 180)).toFixed(1)}`);
			return out.join(' ');
		};
		// sleepers running under the wheelset: the track passes, so the panel moves while it holds (viewer review v3)
		const run = (f / 60) * 3.2; // degrees of arc a second (ILLUSTRATIVE)
		for (let i = -6; i <= 6; i++) {
			const a = i * 3.4 - (run % 3.4); // ties move toward −angle (up the panel), the direction of travel
			const ar = (a * Math.PI) / 180;
			inner.push(<line key={`s${i}`} x1={O.x + (R - 82) * Math.cos(ar)} y1={O.y + (R - 82) * Math.sin(ar)} x2={O.x + (R + 82) * Math.cos(ar)} y2={O.y + (R + 82) * Math.sin(ar)} stroke={colors.sub} strokeWidth={5} opacity={0.45} />);
		}
		inner.push(<polyline key="a" points={arc(R - 60)} fill="none" stroke={colors.line} strokeWidth={3} />);
		inner.push(<polyline key="b" points={arc(R + 60)} fill="none" stroke={colors.line} strokeWidth={3} />);
		inner.push(
			<g key="w">
				<TopWheelset pose={{x: x + w / 2, y: y + h / 2 + 40, heading: good ? 0 : (-7 * Math.PI) / 180, k: 0.075}} glow={good ? lit : 0} heatR={good ? 0 : lit} />
			</g>,
		);
		if (!good) inner.push(<circle key="c" cx={x + w / 2 + 62} cy={y + h / 2 + 20} r={12} fill={colors.crimson} opacity={lit} />);
	} else {
		const pts: string[] = [];
		for (let i = 0; i <= 200; i++) {
			const u = i / 200;
			const amp = good ? 14 * Math.exp(-2.2 * u) : 6 * Math.exp(2.4 * u);
			pts.push(`${(x + 30 + u * (w - 60)).toFixed(1)},${(y + h / 2 + 40 - amp * Math.sin(u * 2 * Math.PI * 4 + f / 20)).toFixed(1)}`);
		}
		inner.push(<line key="z" x1={x + 30} y1={y + h / 2 + 40} x2={x + w - 30} y2={y + h / 2 + 40} stroke={colors.sub} strokeWidth={1.5} strokeDasharray="16 8" />);
		inner.push(<polyline key="t" points={pts.join(' ')} fill="none" stroke={col} strokeWidth={4} opacity={0.4 + 0.6 * lit} />);
	}
	return (
		<>
			<Svg>
				<defs>
					<clipPath id={`pc-${x}-${y}`}>
						<rect x={x} y={y} width={w} height={h} />
					</clipPath>
				</defs>
				<rect x={x} y={y} width={w} height={h} fill="rgba(7,10,15,0.55)" stroke={lit > 0.3 ? col : colors.sub} strokeWidth={lit > 0.3 ? 3 : 1.5} />
				<g clipPath={`url(#pc-${x}-${y})`}>{inner}</g>
				<g opacity={lit} stroke={col} strokeWidth={6} strokeLinecap="round" fill="none" style={{filter: `drop-shadow(0 0 8px ${col})`}}>
					{good ? <polyline points={`${x + w - 64},${y + 30} ${x + w - 50},${y + 46} ${x + w - 24},${y + 16}`} /> : <path d={`M ${x + w - 60} ${y + 16} L ${x + w - 28} ${y + 48} M ${x + w - 28} ${y + 16} L ${x + w - 60} ${y + 48}`} />}
				</g>
			</Svg>
			<Label x={x + 18} y={y + 12} size={26} color={colors.sub}>
				{label}
			</Label>
		</>
	);
};

const Matrix: React.FC<{f: number; o: number}> = ({f, o}) => {
	const t = T();
	if (o <= 0.01) return null;
	const lTop = on(f, t.tight - 10, 20);
	const rBot = on(f, t.calm - 10, 20);
	const crossed = on(f, t.both, 20);
	const pw = 570;
	const ph = 290;
	const xs = [110, 730];
	const ys = [300, 640];
	return (
		<AbsoluteFill style={{opacity: o, transform: `scale(${1 + 0.05 * tween(f, t.see, t.end, 0, 1, ease.camera)})`, transformOrigin: '660px 620px'}}>
			<Label x={xs[0]} y={200} size={36} color={colors.amber} weight={700} opacity={on(f, t.steep - 10, 20)}>
				STEEP CONE · LOOSE AXLE
			</Label>
			<Label x={xs[1]} y={200} size={36} color={colors.emerald} weight={700} opacity={on(f, t.flat - 10, 20)}>
				FLAT CONE · STIFF AXLE
			</Label>
			<Panel x={xs[0]} y={ys[0]} w={pw} h={ph} kind="curve" good lit={lTop} f={f} label="TIGHT CURVE" />
			<Panel x={xs[0]} y={ys[1]} w={pw} h={ph} kind="speed" good={false} lit={crossed} f={f} label="HIGH SPEED" />
			<Panel x={xs[1]} y={ys[0]} w={pw} h={ph} kind="curve" good={false} lit={crossed} f={f} label="TIGHT CURVE" />
			<Panel x={xs[1]} y={ys[1]} w={pw} h={ph} kind="speed" good lit={rBot} f={f} label="HIGH SPEED" />
			<Tag x={96} y={H - 110}>
				SCHEMATIC
			</Tag>
		</AbsoluteFill>
	);
};

export const TradeOff: React.FC = () => {
	const f = useCurrentFrame();
	const t = T();
	const aO = Math.min(on(f, t.fix - 10, 20), off(f, t.stiff - 30, 30));
	const bO = Math.min(on(f, t.stiff - 30, 30), off(f, t.see - 20, 30));
	const cO = on(f, t.see - 20, 30);
	return (
		<Stage
			dur={S().dur}
			light={{x: 0.45, y: 0.5}}
			overlay={
				<Hud
					title="THE FIX"
					start={t.flatter - 20}
					end={t.end + 20}
					width={500}
					note="TEXTBOOK MODEL"
					rows={[
						{label: 'CONE', unit: '', keys: [{frame: 0, value: WS.cone}], decimals: 3, tone: 'amber', source: 'C06'},
						{label: 'FLATTER', unit: '', keys: [{frame: 0, value: WS.coneShinkansen}], decimals: 3, tone: 'emerald', source: 'C24', from: t.forty},
						{label: 'TIGHTEST 1:20', unit: 'm', keys: [{frame: 0, value: tightestCurve()}], decimals: 0, tone: 'amber', source: 'C14', from: t.steep},
						{label: 'TIGHTEST 1:40', unit: 'm', keys: [{frame: 0, value: tightestCurve(WS.coneShinkansen)}], decimals: 0, tone: 'emerald', source: 'C14', from: t.flat},
					]}
				/>
			}
		>
			<AbsoluteFill>
				<Profiles f={f} o={aO} />
				<Bogie f={f} o={bO} />
				<Matrix f={f} o={cO} />
				<Label x={130} y={130} size={44} color={colors.line} weight={700} opacity={Math.min(on(f, t.fix, 20), off(f, t.flatter + 40, 20))}>
					THE FIX
				</Label>
			</AbsoluteFill>
		</Stage>
	);
};

export const tradeOffCues = (): SfxCue[] => {
	const t = T();
	return [
		{frame: t.fix + 10, sfx: 'pen_scratch', gainDb: -14},
		{frame: t.forty, sfx: 'quartz_tick', gainDb: -12},
		{frame: t.stiff + 30, sfx: 'relay_click', gainDb: -12},
		{frame: t.harder, sfx: 'metal_jam_sub', gainDb: -16},
		{frame: t.tight - 10, sfx: 'glass_tone', gainDb: -14, pan: -0.4},
		{frame: t.calm - 10, sfx: 'glass_tone', gainDb: -14, pan: 0.4},
		{frame: t.both, sfx: 'relay_click', gainDb: -10},
	];
};

if (Math.abs(tightestCurve(WS.coneShinkansen) - 2142.86) > 0.01) throw new Error('trade-off: 1:40 limit');
