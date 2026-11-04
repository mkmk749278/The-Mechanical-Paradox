import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Atmosphere, Blueprint} from '../../../../lib/remotion/Blueprint';
import {straightPath} from '../geometry3d';
import {Stage3D, Track3D, Wheelset3D} from '../Wheelset3D';

// Internal look test (never shown): the wheelset on straight track under the channel's light.
export const Look3D: React.FC = () => {
	const f = useCurrentFrame();
	const {width, height} = useVideoConfig();
	const a = 0.5 + f * 0.004;
	const path = straightPath(-12, 12, 2);
	return (
		<AbsoluteFill>
			<Blueprint>
				<Stage3D width={width} height={height} cam={{position: [2.6 * Math.sin(a), 0.9, 2.6 * Math.cos(a)], target: [0, 0.35, 0], fov: 32}}>
					<Track3D path={path} />
					<Wheelset3D rolled={f * 0.02} />
				</Stage3D>
			</Blueprint>
			<Atmosphere />
		</AbsoluteFill>
	);
};
