import React from 'react';
import {Composition, Folder} from 'remotion';
import {video} from '../lib/remotion/brand';
import {loadBrandFonts} from '../lib/remotion/fonts';
import {ChannelSting, STING_FRAMES} from './channel/ChannelSting';
import {EngineCheck} from './dev/EngineCheck';

loadBrandFonts();

// Every film registers its compositions here, inside its own <Folder> (PLAYBOOK §10.1).
export const Root: React.FC = () => (
	<>
		<Folder name="Channel">
			<Composition id="ChannelSting" component={ChannelSting} durationInFrames={STING_FRAMES} fps={video.fps} width={video.width} height={video.height} />
		</Folder>
		<Folder name="Dev">
			<Composition id="EngineCheck" component={EngineCheck} durationInFrames={360} fps={video.fps} width={video.width} height={video.height} />
		</Folder>
	</>
);
