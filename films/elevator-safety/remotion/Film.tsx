import React from 'react';
import {AbsoluteFill, interpolate, Sequence, useCurrentFrame} from 'remotion';
import {colors} from '../../../lib/remotion/brand';
import {ease} from '../../../lib/remotion/motion';
import {SfxCue, shiftCues} from '../../../lib/remotion/sfx';
import {ChannelSting, STING_FRAMES, stingCues} from '../../../src/channel/ChannelSting';
import {ColdOpen, coldOpenCues} from './ColdOpen';
import {timing} from './cues';
import {Flyweights, flyweightsCues, GovernorIntro, governorIntroCues, PullsLever, pullsLeverCues, PureMechanics, pureMechanicsCues, Ropes, ropesCues} from './Group1';
import {Otis, otisCues, Question, questionCues, TooHard, tooHardCues, WedgeScene, wedgeCues, Window, windowCues} from './Group2';
import {FootageLayer} from './Footage';
import {Counterweight, counterweightCues, Landing, landingCues, Rail, railCues, Spring, springCues, UpBrake, upBrakeCues} from './Group3';
import {SceneId, span, XFADE} from './scenes';

// Film 2, the whole picture: every scene on its span from the recorded VO (scenes.ts), each dissolving in over the
// last over XFADE frames; real footage inserts over them where the narration names the real thing (Footage.tsx);
// the channel sting after the last word (channel name only in the outro, CLAUDE.md).

const SCENES: [SceneId, React.FC, () => SfxCue[]][] = [
	['s01', ColdOpen, coldOpenCues],
	['s02', Ropes, ropesCues],
	['s03', GovernorIntro, governorIntroCues],
	['s04', Flyweights, flyweightsCues],
	['s05', PullsLever, pullsLeverCues],
	['s06', PureMechanics, pureMechanicsCues],
	['s07', WedgeScene, wedgeCues],
	['s08', Question, questionCues],
	['s09', TooHard, tooHardCues],
	['s10', Otis, otisCues],
	['s11', Window, windowCues],
	['s12', Spring, springCues],
	['s13', Rail, railCues],
	['s14', Counterweight, counterweightCues],
	['s15', UpBrake, upBrakeCues],
	['s16', Landing, landingCues],
];

export const VO_FRAMES = timing.durationInFrames;
export const FILM_FRAMES = VO_FRAMES + STING_FRAMES;

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
		<Sequence from={VO_FRAMES} durationInFrames={STING_FRAMES} name="sting">
			<FadeIn first={false}>
				<ChannelSting />
			</FadeIn>
		</Sequence>
	</AbsoluteFill>
);

/** Every scene's sound cues on the film's clock (the mix reads these; picture and sound never drift). */
export const filmCues = (): SfxCue[] => [...SCENES.flatMap(([id, , cues]) => shiftCues(cues(), span(id).from)), ...shiftCues(stingCues, VO_FRAMES)];
