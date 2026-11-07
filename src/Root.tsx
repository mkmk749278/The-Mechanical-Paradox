import React from 'react';
import {Composition, Folder} from 'remotion';
import {video} from '../lib/remotion/brand';
import {loadBrandFonts} from '../lib/remotion/fonts';
import {ChannelSting, STING_FRAMES} from './channel/ChannelSting';
import {EngineCheck} from './dev/EngineCheck';
import {BankCard, bankCardSpan} from '../films/train-wheels/remotion/BankCard';
import {Look3D} from '../films/train-wheels/remotion/dev/Look3D';
import {CriticalSpeed, Hunting} from '../films/train-wheels/remotion/Hunting';
import {Drift, SelfCentre} from '../films/train-wheels/remotion/Drift';
import {RailRace} from '../films/train-wheels/remotion/RailRace';
import {ColdOpen, Promise as PromiseScene} from '../films/train-wheels/remotion/Opening';
import {Cone, FlangeMyth} from '../films/train-wheels/remotion/FlangeCone';
import {CurveLimit, Nadal, Screech} from '../films/train-wheels/remotion/Limits';
import {TradeOff} from '../films/train-wheels/remotion/TradeOff';
import {Landing} from '../films/train-wheels/remotion/Landing';
import {Film, FILM_FRAMES} from '../films/train-wheels/remotion/Film';
import {span} from '../films/train-wheels/remotion/scenes';
import {ThumbA, ThumbB, ThumbC} from '../films/train-wheels/remotion/Thumbs';
import {ColdOpen as ElColdOpen} from '../films/elevator-safety/remotion/ColdOpen';
import {span as elSpan} from '../films/elevator-safety/remotion/scenes';
import {Flyweights as ElFlyweights, GovernorIntro as ElGovernor, PullsLever as ElPullsLever, PureMechanics as ElPure, Ropes as ElRopes} from '../films/elevator-safety/remotion/Group1';

loadBrandFonts();

// Every film registers its compositions here, inside its own <Folder> (PLAYBOOK §10.1).
export const Root: React.FC = () => (
	<>
		<Folder name="Channel">
			<Composition id="ChannelSting" component={ChannelSting} durationInFrames={STING_FRAMES} fps={video.fps} width={video.width} height={video.height} />
		</Folder>
		<Folder name="TrainWheels">
			<Composition id="TW-Film" component={Film} durationInFrames={FILM_FRAMES} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="TW-S01-ColdOpen" component={ColdOpen} durationInFrames={span('s01').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="TW-S03-Promise" component={PromiseScene} durationInFrames={span('s03').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="TW-S04-Flange" component={FlangeMyth} durationInFrames={span('s04').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="TW-S05-Cone" component={Cone} durationInFrames={span('s05').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="TW-S02-RailRace" component={RailRace} durationInFrames={span('s02').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="TW-S06-Drift" component={Drift} durationInFrames={span('s06').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="TW-S08-SelfCentre" component={SelfCentre} durationInFrames={span('s08').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="TW-S09-Limit" component={CurveLimit} durationInFrames={span('s09').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="TW-S10-Screech" component={Screech} durationInFrames={span('s10').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="TW-S11-Nadal" component={Nadal} durationInFrames={span('s11').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="TW-S12-Hunting" component={Hunting} durationInFrames={span('s12').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="TW-S13-Critical" component={CriticalSpeed} durationInFrames={span('s13').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="TW-S14-TradeOff" component={TradeOff} durationInFrames={span('s14').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="TW-S15-Landing" component={Landing} durationInFrames={span('s15').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="TW-Thumb-A" component={ThumbA} durationInFrames={1} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="TW-Thumb-B" component={ThumbB} durationInFrames={1} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="TW-Thumb-C" component={ThumbC} durationInFrames={1} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="TW-BankCard" component={BankCard} durationInFrames={bankCardSpan().to - bankCardSpan().from} fps={video.fps} width={video.width} height={video.height} />
		</Folder>
		<Folder name="ElevatorSafety">
			<Composition id="EL-S01-ColdOpen" component={ElColdOpen} durationInFrames={elSpan('s01').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="EL-S02-Ropes" component={ElRopes} durationInFrames={elSpan('s02').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="EL-S03-Governor" component={ElGovernor} durationInFrames={elSpan('s03').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="EL-S04-Flyweights" component={ElFlyweights} durationInFrames={elSpan('s04').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="EL-S05-Lever" component={ElPullsLever} durationInFrames={elSpan('s05').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="EL-S06-Pure" component={ElPure} durationInFrames={elSpan('s06').dur} fps={video.fps} width={video.width} height={video.height} />
		</Folder>
		<Folder name="Dev">
			<Composition id="TW-Look3D" component={Look3D} durationInFrames={600} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="EngineCheck" component={EngineCheck} durationInFrames={360} fps={video.fps} width={video.width} height={video.height} />
		</Folder>
	</>
);
