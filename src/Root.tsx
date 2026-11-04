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
import {span} from '../films/train-wheels/remotion/scenes';

loadBrandFonts();

// Every film registers its compositions here, inside its own <Folder> (PLAYBOOK §10.1).
export const Root: React.FC = () => (
	<>
		<Folder name="Channel">
			<Composition id="ChannelSting" component={ChannelSting} durationInFrames={STING_FRAMES} fps={video.fps} width={video.width} height={video.height} />
		</Folder>
		<Folder name="TrainWheels">
			<Composition id="TW-S01-ColdOpen" component={ColdOpen} durationInFrames={span('s01').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="TW-S03-Promise" component={PromiseScene} durationInFrames={span('s03').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="TW-S04-Flange" component={FlangeMyth} durationInFrames={span('s04').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="TW-S05-Cone" component={Cone} durationInFrames={span('s05').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="TW-S02-RailRace" component={RailRace} durationInFrames={span('s02').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="TW-S06-Drift" component={Drift} durationInFrames={span('s06').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="TW-S08-SelfCentre" component={SelfCentre} durationInFrames={span('s08').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="TW-S12-Hunting" component={Hunting} durationInFrames={span('s12').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="TW-S13-Critical" component={CriticalSpeed} durationInFrames={span('s13').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="TW-BankCard" component={BankCard} durationInFrames={bankCardSpan().to - bankCardSpan().from} fps={video.fps} width={video.width} height={video.height} />
		</Folder>
		<Folder name="Dev">
			<Composition id="TW-Look3D" component={Look3D} durationInFrames={600} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="EngineCheck" component={EngineCheck} durationInFrames={360} fps={video.fps} width={video.width} height={video.height} />
		</Folder>
	</>
);
