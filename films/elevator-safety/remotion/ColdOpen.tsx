import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {colors} from '../../../lib/remotion/brand';
import {Hud} from '../../../lib/remotion/Hud';
import {Callout, Dim, Label, off, on, Stage, Svg, Tag} from '../../../lib/remotion/kit';
import {ease, shudder, tween} from '../../../lib/remotion/motion';
import {SfxCue} from '../../../lib/remotion/sfx';
import {camPath} from './camera';
import {fall, FALL_END, freeFall, govRpm, leverDeg, LEVER} from './model';
import {at, span} from './scenes';
import {Cam, Shaft, SH, toScreen} from './Shaft';

// s01 cold open, one continuous camera: the ropes snap (frayed ends whip); the wrong model as a ghost falling all the
// way down the building strip on the left; the real fall in slow motion, followed by the camera (rail clips stream
// past), the governor locks, the lever swings, the wedges brake; a crane up the shaft to the machine ("not a motor,
// not a computer"); down the amber governor rope to the lever ("your own fall pulled the brake"); into the gear on the
// rail and the marks it cut ("built to slip"). One driver, fall(), moves the car, lever, wedges, marks and HUD.

const CAR0 = 5;
const SLOW = 8;

const beats = () => ({
	snap: at('s01', 'ropes snap'),
	expect: at('s01', 'You might expect'),
	instead: at('s01', 'Instead'),
	stop: at('s01', 'and then you stop'),
	what: at('s01', 'What stopped you'),
	motor: at('s01', 'Not a motor'),
	computer: at('s01', 'Not a computer'),
	own: at('s01', 'Your own fall'),
	strange: at('s01', 'And here is the strange'),
	slip: at('s01', 'built to slip'),
	end: span('s01').dur,
});

/** Real seconds since the ropes part (slow motion ×8 from just before "Instead"). */
const realT = (f: number, b: ReturnType<typeof beats>) => Math.max(0, (f - b.instead + 6) / 60 / SLOW);

/** The building strip: the whole shaft at a glance, so a fall of 0.54 m reads against "all the way down". */
const Strip: React.FC<{carY: number; ghostY: number; ghostO: number; o: number}> = ({carY, ghostY, ghostO, o}) => {
	if (o <= 0.01) return null;
	const x = 110;
	const top = 170;
	const bot = 920;
	const y = (m: number) => bot - ((bot - top) * m) / SH.top;
	return (
		<>
			<Svg opacity={o}>
				<rect x={x - 26} y={top} width={52} height={bot - top} fill="rgba(7,10,15,0.75)" stroke={colors.sub} strokeWidth={2} />
				{Array.from({length: 4}, (_, i) => (
					<line key={i} x1={x - 26} y1={y(0.5 + i * 3.5)} x2={x + 26} y2={y(0.5 + i * 3.5)} stroke={colors.grid} strokeWidth={2} />
				))}
				<rect x={x - 18} y={y(carY + SH.carH)} width={36} height={y(0) - y(SH.carH)} fill="none" stroke={colors.line} strokeWidth={3} />
				{ghostO > 0.01 ? <rect x={x - 18} y={y(ghostY + SH.carH)} width={36} height={y(0) - y(SH.carH)} fill="rgba(255,59,48,0.25)" stroke={colors.crimson} strokeWidth={3} strokeDasharray="7 5" opacity={ghostO} /> : null}
			</Svg>
			<Label x={x} y={bot + 14} size={26} color={colors.sub} align="center" opacity={o}>
				PIT
			</Label>
		</>
	);
};

export const ColdOpen: React.FC = () => {
	const f = useCurrentFrame();
	const b = beats();
	const t = realT(f, b);
	const st = fall(t);
	const tripped = t >= freeFall.t;
	const lever = leverDeg(tripped ? (st.drop - freeFall.d) * 1000 : 0);
	const carY = CAR0 - st.drop;
	const ropeTravel = tripped ? freeFall.d + Math.max(0, st.drop - freeFall.d - ((LEVER.maxDeg * Math.PI) / 180) * (LEVER.arm / 1000)) : st.drop;
	const snap = tween(f, b.snap, b.snap + 30, 0, 1, ease.arrive);
	const brakeTop = CAR0 - freeFall.d + SH.plank;

	const follow = (fr: number) => ({cx: 0.15, cy: CAR0 - fall(realT(fr, b)).drop + 1.15, s: 235});
	const cam: Cam = camPath(f, [
		{f: 0, cam: {cx: 0.15, cy: CAR0 + 1.3, s: 220}},
		{f: b.snap + 30, cam: {cx: 0.15, cy: CAR0 + 1.6, s: 205}},
		{f: b.instead - 10, cam: follow},
		{f: b.stop + 60, cam: follow},
		{f: b.what + 10, cam: {cx: 0.1, cy: CAR0 + 0.7, s: 255}},
		{f: b.motor - 10, cam: {cx: -0.3, cy: 12.6, s: 170}},
		{f: b.own - 20, cam: {cx: -0.35, cy: 12.5, s: 182}},
		{f: b.own + 70, cam: {cx: -0.98, cy: carY + SH.cross + 0.05, s: 760}},
		{f: b.strange + 10, cam: {cx: -0.96, cy: carY + SH.cross + 0.02, s: 820}},
		{f: b.slip - 10, cam: {cx: -0.75, cy: carY + SH.plank + 0.05, s: 640}},
		{f: b.end, cam: {cx: -0.74, cy: carY + SH.plank + 0.1, s: 690}},
	]);
	cam.cy += shudder(f, 60, b.snap, 0.02, 9) + (tripped && t < freeFall.t + 0.05 ? 0 : 0);

	const ghostT = tween(f, b.expect + 6, b.instead - 20, 0, 1, ease.leave);
	const ghostO = Math.min(on(f, b.expect + 2, 10), off(f, b.instead - 10, 14));
	const stripO = Math.min(on(f, b.expect - 10, 16), off(f, b.what + 20, 20));
	const glowRope = Math.min(on(f, b.own, 16), off(f, b.slip, 20));
	const glowGear = on(f, b.slip - 10, 16);
	const [dx, dy0] = toScreen(cam, 1.15, CAR0 + SH.plank);
	const [, dy1] = toScreen(cam, 1.15, CAR0 + SH.plank - fall(FALL_END + 1).drop);
	const [mx, my] = toScreen(cam, SH.sheave.x, SH.sheave.y);
	const [kx, ky] = toScreen(cam, 0.97, 13.65);
	const [gvx, gvy] = toScreen(cam, SH.gov.x, SH.gov.y);
	const [gx, gy] = toScreen(cam, -SH.railX, carY + SH.plank);

	return (
		<Stage
			dur={b.end}
			light={{x: 0.5, y: 0.45}}
			overlay={
				<Hud
					title="THE FALL"
					start={b.instead - 10}
					end={b.what + 30}
					width={470}
					note="MODEL · ×8 SLOW"
					rows={[
						{label: 'TIME', unit: 'ms', at: (fr) => Math.min(FALL_END, realT(fr, b)) * 1000, decimals: 0, tone: 'line', source: 'C03'},
						{label: 'SPEED', unit: 'm/s', at: (fr) => fall(realT(fr, b)).v, decimals: 2, tone: 'crimson', source: 'C03'},
						{label: 'DROP', unit: 'm', at: (fr) => fall(realT(fr, b)).drop, decimals: 2, tone: 'amber', source: 'C03'},
						{label: 'GOVERNOR', unit: 'rpm', at: (fr) => (realT(fr, b) < freeFall.t ? govRpm(fall(realT(fr, b)).v) : 0), decimals: 0, tone: 'line', source: 'C09'},
					]}
				/>
			}
		>
			<AbsoluteFill>
				<Svg>
					<Shaft
						cam={cam}
						st={{
							carY,
							cwY: 7.4 + st.drop,
							govRot: -ropeTravel / 0.15,
							ropeTravel,
							leverDeg: lever,
							wedge: Math.min(1, lever / LEVER.maxDeg),
							snap,
							glowGovRope: glowRope,
							glowLever: Math.max(glowRope, glowGear * 0.5),
							glowGear,
							rub: st.braking ? 1 : 0,
							scrapeFrom: st.drop > freeFall.d ? brakeTop + 0.05 : undefined,
							scrapeTo: st.drop > freeFall.d ? carY + SH.plank : undefined,
							scrapeGlow: st.braking ? 1 : tween(f, b.slip, b.slip + 30, 0, 0.8, ease.arrive),
							focus: Math.max(glowRope, glowGear) * 0.7,
						}}
					/>
					<Dim x1={dx} y1={dy0} x2={dx} y2={dy1} color={colors.amber} draw={tween(f, b.stop, b.stop + 30, 0, 1, ease.draw) * off(f, b.what + 20, 16)} />
				</Svg>
				<Label x={dx + 26} y={(dy0 + dy1) / 2 - 22} size={36} color={colors.amber} weight={600} opacity={Math.min(on(f, b.stop + 20, 16), off(f, b.what + 20, 16))}>
					0.54 m
				</Label>
				<Strip carY={carY} ghostY={CAR0 - CAR0 * ghostT * ghostT} ghostO={ghostO} o={stripO} />
				<Label x={170} y={500} size={40} color={colors.crimson} weight={700} opacity={Math.min(on(f, b.expect + 10, 14), off(f, b.instead - 10, 12))}>
					ALL THE WAY DOWN?
				</Label>
				<Label x={170} y={500} size={40} color={colors.amber} weight={700} opacity={Math.min(on(f, b.stop + 10, 14), off(f, b.what + 20, 16))}>
					WITHIN A METER
				</Label>
				{/* not a motor, not a computer: callouts on the machine and the controller, struck on their words */}
				<Callout x={mx} y={my} lx={mx + 260} ly={my - 120} text="MOTOR" color={colors.sub} t={Math.min(on(f, b.motor - 6, 24), off(f, b.own, 16))} />
				<Callout x={kx} y={ky} lx={kx + 200} ly={ky + 150} text="COMPUTER" color={colors.sub} t={Math.min(on(f, b.computer - 6, 24), off(f, b.own, 16))} />
				<Svg opacity={off(f, b.own, 16)}>
					<line x1={mx + 266} y1={my - 120} x2={mx + 266 + 140 * on(f, b.motor + 16, 10)} y2={my - 120} stroke={colors.crimson} strokeWidth={5} />
					<line x1={kx + 206} y1={ky + 150} x2={kx + 206 + 210 * on(f, b.computer + 16, 10)} y2={ky + 150} stroke={colors.crimson} strokeWidth={5} />
				</Svg>
				<Callout x={gvx} y={gvy} lx={gvx - 200} ly={gvy + 170} text="LOCKED" color={colors.amber} t={Math.min(on(f, b.own - 30, 24), off(f, b.own + 50, 16))} />
				<Label x={150} y={150} size={52} color={colors.amber} weight={700} opacity={Math.min(on(f, b.own + 50, 14), off(f, b.strange, 16))}>
					YOUR FALL PULLED THE BRAKE
				</Label>
				<Callout x={gx} y={gy} lx={gx + 300} ly={gy - 160} text="BUILT TO SLIP" size={48} color={colors.amber} t={on(f, b.slip, 26)} sub="WEDGES SLIDE ON THE RAIL" />
				<Tag x={96} y={970} opacity={Math.min(on(f, b.snap, 14), off(f, b.end - 16, 14))}>
					ILLUSTRATION · SIMPLIFIED
				</Tag>
			</AbsoluteFill>
		</Stage>
	);
};

export const coldOpenCues = (): SfxCue[] => {
	const b = beats();
	const trip = b.instead - 6 + Math.round(freeFall.t * SLOW * 60);
	return [
		{frame: b.snap, sfx: 'metal_snap_sub', gainDb: -8},
		{frame: b.expect + 6, sfx: 'whoosh', gainDb: -14, pan: -0.6},
		{frame: trip, sfx: 'metal_jam_sub', gainDb: -10, pan: -0.4},
		{frame: trip + 10, sfx: 'flow_sweep', gainDb: -14},
		{frame: b.motor + 16, sfx: 'pen_scratch', gainDb: -16},
		{frame: b.computer + 16, sfx: 'pen_scratch', gainDb: -16},
		{frame: b.own, sfx: 'glass_tone', gainDb: -14, pan: -0.4},
		{frame: b.slip, sfx: 'torque_whine', gainDb: -16},
	];
};
