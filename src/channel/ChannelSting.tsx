import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Atmosphere, Blueprint} from '../../lib/remotion/Blueprint';
import {channel, colors} from '../../lib/remotion/brand';
import {fontStacks} from '../../lib/remotion/fonts';
import {LockedTrio} from '../../lib/remotion/LockedTrio';
import {ease, envelope, physical, shudder, tween} from '../../lib/remotion/motion';
import type {SfxCue} from '../../lib/remotion/sfx';

// The channel sting (PLAYBOOK §5.4: the channel name and mark appear only in the outro). The mark is drawn by a pen,
// takes solid form, then torque goes in and the ring jams: an odd ring of gears cannot turn. The only motion is the
// teeth winding elastically and springing back, with amber light at the jammed mesh. Then the name.

export const STING_FRAMES = 330;

const T = {pen: 8, solid: 62, torque: 104, jam: 122, title: 150, tagline: 178} as const;

export const stingCues: SfxCue[] = [
	{frame: T.pen, sfx: 'pen_scratch', gainDb: -16},
	{frame: T.solid, sfx: 'relay_click', gainDb: -14},
	{frame: T.torque, sfx: 'torque_whine', gainDb: -14},
	{frame: T.jam, sfx: 'metal_jam_sub', gainDb: -7},
	{frame: T.title, sfx: 'quartz_tick', gainDb: -12},
];

export const ChannelSting: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const draw = tween(frame, T.pen, T.pen + 70, 0, 1, ease.draw);
	const solid = tween(frame, T.solid, T.solid + 34, 0, 1, ease.arrive);
	const construction = Math.min(tween(frame, 0, 30, 0, 1), tween(frame, T.jam, T.jam + 50, 1, 0.25));
	// Torque winds the teeth (a physical spring toward 0.9°); at the jam the ring refuses and shudders back.
	const wind = physical(frame, fps, T.torque) * 0.9 * tween(frame, T.jam, T.jam + 26, 1, 0, ease.arrive);
	const windDeg = wind + shudder(frame, fps, T.jam, 0.55, 9, 6);
	const glow = Math.max(0, tween(frame, T.jam - 4, T.jam + 2, 0, 1, ease.arrive) - tween(frame, T.jam + 2, T.jam + 70, 0, 0.4));
	const shake = shudder(frame, fps, T.jam, 3.2, 11, 9); // the whole frame takes the hit, in pixels
	const titleIn = physical(frame, fps, T.title);
	const tagIn = envelope(frame, T.tagline, durationInFrames + 30, 20, 1);
	const fadeOut = tween(frame, durationInFrames - 18, durationInFrames, 1, 0, ease.leave);
	return (
		<AbsoluteFill style={{backgroundColor: colors.bg}}>
			<AbsoluteFill style={{opacity: Math.min(tween(frame, 0, 18, 0, 1), fadeOut)}}>
				<Blueprint light={{x: 0.5, y: 0.38}} gridOpacity={0.8}>
					<AbsoluteFill style={{transform: `translate(${shake}px, ${shake * 0.4}px)`}}>
						<div style={{position: 'absolute', left: 960 - 310, top: 70, width: 620, height: 620}}>
							<LockedTrio size={620} draw={draw} solid={solid} windDeg={windDeg} glow={glow} construction={construction} />
						</div>
					</AbsoluteFill>
					<div
						style={{
							position: 'absolute',
							top: 706,
							width: '100%',
							textAlign: 'center',
							fontFamily: fontStacks.display,
							fontWeight: 900,
							fontStretch: '112%',
							fontSize: 92,
							letterSpacing: -0.5,
							color: colors.ink,
							opacity: titleIn,
							transform: `translateY(${(1 - titleIn) * 40}px)`,
						}}
					>
						{channel.name.toUpperCase()}
					</div>
					<div
						style={{
							position: 'absolute',
							top: 826,
							width: '100%',
							textAlign: 'center',
							fontFamily: fontStacks.text,
							fontSize: 34,
							color: colors.sub,
							opacity: tagIn,
							transform: `translateY(${(1 - tagIn) * 14}px)`,
						}}
					>
						The engineering that shouldn&rsquo;t work.{' '}
						<span style={{color: colors.line}}>The invisible physics that makes it.</span>
					</div>
					<div
						style={{
							position: 'absolute',
							top: 896,
							width: '100%',
							textAlign: 'center',
							fontFamily: fontStacks.mono,
							fontSize: 20,
							letterSpacing: 3,
							color: colors.muted,
							opacity: tagIn * 0.9,
						}}
					>
						<span style={{color: colors.amber}}>//</span> THREE GEARS IN A RING CANNOT TURN &nbsp;·&nbsp; ω = 0.000 rad/s
					</div>
				</Blueprint>
				<Atmosphere />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
