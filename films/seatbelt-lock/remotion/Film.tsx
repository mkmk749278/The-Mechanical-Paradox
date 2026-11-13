import React from 'react';
import {AbsoluteFill, interpolate, Sequence, useCurrentFrame} from 'remotion';
import {colors} from '../../../lib/remotion/brand';
import {ease} from '../../../lib/remotion/motion';
import {SfxCue, shiftCues} from '../../../lib/remotion/sfx';
import {ChannelSting, endScreenCues, OUTRO_FRAMES, stingCues} from '../../../src/channel/ChannelSting';
import {timing} from './cues';
import {FootageLayer} from './Footage';
import {BallScene, ballCues, ColdOpen, coldOpenCues, DiscScene, discCues, LockCantTell, lockCantTellCues} from './Part1';
import {BarScene, barCues, ChildSeat, childSeatCues, ChipAfterAll, chipCues, Landing, landingCues, Price, priceCues, TooGood, tooGoodCues} from './Part2';
import {LANDING_HOLD, SceneId, span, XFADE} from './scenes';

// Film 3, the whole picture: every scene on its span from the recorded VO (scenes.ts), each dissolving in over the
// last over XFADE frames; real footage inserts over them where the narration names the real thing (Footage.tsx);
// the landing holds LANDING_HOLD frames after the last word, then the channel sting, which settles into the end-screen
// layout (channel name only in the outro, CLAUDE.md).

const SCENES: [SceneId, React.FC, () => SfxCue[]][] = [
	['s01', ColdOpen, coldOpenCues],
	['s02', LockCantTell, lockCantTellCues],
	['s03', DiscScene, discCues],
	['s04', BallScene, ballCues],
	['s05', TooGood, tooGoodCues],
	['s06', ChipAfterAll, chipCues],
	['s07', BarScene, barCues],
	['s08', Price, priceCues],
	['s09', ChildSeat, childSeatCues],
	['s10', Landing, landingCues],
];

/** Picture before the outro: the voice, then the landing's hold. */
export const VO_FRAMES = timing.durationInFrames + LANDING_HOLD;
export const FILM_FRAMES = VO_FRAMES + OUTRO_FRAMES;

const FadeIn: React.FC<{children: React.ReactNode; first: boolean}> = ({children, first}) => {
	const f = useCurrentFrame();
	const o = first ? 1 : interpolate(f, [0, XFADE], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.camera});
	return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

export const Film: React.FC = () => (
	<AbsoluteFill style={{backgroundColor: colors.bg}}>
		{SCENES.map(([id, C], i) => {
			const s = span(id);
			return (
				<Sequence key={id} from={s.from} durationInFrames={s.dur + XFADE} name={id}>
					<FadeIn first={i === 0}>
						<C />
					</FadeIn>
				</Sequence>
			);
		})}
		<FootageLayer />
		<Sequence from={VO_FRAMES} durationInFrames={OUTRO_FRAMES} name="sting">
			<FadeIn first={false}>
				<ChannelSting endScreen />
			</FadeIn>
		</Sequence>
	</AbsoluteFill>
);

/** Every scene's sound cues on the film's clock (the mix reads these; picture and sound never drift). */
export const filmCues = (): SfxCue[] => [...SCENES.flatMap(([id, , cues]) => shiftCues(cues(), span(id).from)), ...shiftCues([...stingCues, ...endScreenCues], VO_FRAMES)];
