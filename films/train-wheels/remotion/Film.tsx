import React from 'react';
import {AbsoluteFill, interpolate, Sequence, useCurrentFrame} from 'remotion';
import {colors} from '../../../lib/remotion/brand';
import {ease} from '../../../lib/remotion/motion';
import {SfxCue, shiftCues} from '../../../lib/remotion/sfx';
import {ChannelSting, STING_FRAMES, stingCues} from '../../../src/channel/ChannelSting';
import {BankCard, bankCardCues} from './BankCard';
import {timing} from './cues';
import {Drift, driftCues, SelfCentre, selfCentreCues} from './Drift';
import {Cone, coneCues, FlangeMyth, flangeMythCues} from './FlangeCone';
import {criticalCues, CriticalSpeed, Hunting, huntingCues} from './Hunting';
import {Landing, landingCues} from './Landing';
import {CurveLimit, curveLimitCues, Nadal, nadalCues, Screech, screechCues} from './Limits';
import {ColdOpen, coldOpenCues, Promise as PromiseScene, promiseCues} from './Opening';
import {RailRace, railRaceCues} from './RailRace';
import {SceneId, span, XFADE} from './scenes';
import {TradeOff, tradeOffCues} from './TradeOff';

// Film 1, the whole picture: every scene on its span from the recorded VO (scenes.ts), each dissolving in over the
// last over XFADE frames; the channel sting after the last word (channel name only in the outro, CLAUDE.md).

const SCENES: [SceneId, React.FC][] = [
	['s01', ColdOpen],
	['s02', RailRace],
	['s03', PromiseScene],
	['s04', FlangeMyth],
	['s05', Cone],
	['s06', Drift],
	['s07', BankCard],
	['s08', SelfCentre],
	['s09', CurveLimit],
	['s10', Screech],
	['s11', Nadal],
	['s12', Hunting],
	['s13', CriticalSpeed],
	['s14', TradeOff],
	['s15', Landing],
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
		<Sequence from={VO_FRAMES} durationInFrames={STING_FRAMES} name="sting">
			<FadeIn first={false}>
				<ChannelSting />
			</FadeIn>
		</Sequence>
	</AbsoluteFill>
);

/** Every scene's sound cues on the film's clock (the mix reads these; picture and sound never drift). */
export const filmCues = (): SfxCue[] => [
	...shiftCues(coldOpenCues(), span('s01').from),
	...shiftCues(railRaceCues(), span('s02').from),
	...shiftCues(promiseCues(), span('s03').from),
	...shiftCues(flangeMythCues(), span('s04').from),
	...shiftCues(coneCues(), span('s05').from),
	...shiftCues(driftCues(), span('s06').from),
	...shiftCues(bankCardCues(), 0),
	...shiftCues(selfCentreCues(), span('s08').from),
	...shiftCues(curveLimitCues(), span('s09').from),
	...shiftCues(screechCues(), span('s10').from),
	...shiftCues(nadalCues(), span('s11').from),
	...shiftCues(huntingCues(), span('s12').from),
	...shiftCues(criticalCues(), span('s12').from),
	...shiftCues(tradeOffCues(), span('s14').from),
	...shiftCues(landingCues(), span('s15').from),
	...shiftCues(stingCues, VO_FRAMES),
];
