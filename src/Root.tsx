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
import {ThumbA as ElThumbA, ThumbB as ElThumbB, ThumbC as ElThumbC, ThumbD as ElThumbD, ThumbE as ElThumbE, ThumbF as ElThumbF, ThumbG as ElThumbG, ThumbH as ElThumbH, ThumbI as ElThumbI, ThumbJ as ElThumbJ, ThumbK as ElThumbK, ThumbL as ElThumbL} from '../films/elevator-safety/remotion/Thumbs';
import {Film as ElFilm, FILM_FRAMES as EL_FILM_FRAMES} from '../films/elevator-safety/remotion/Film';
import {Counterweight as ElCounterweight, Landing as ElLanding, Rail as ElRail, Spring as ElSpring, UpBrake as ElUpBrake} from '../films/elevator-safety/remotion/Group3';
import {Otis as ElOtis, Question as ElQuestion, TooHard as ElTooHard, WedgeScene as ElWedge, Window as ElWindow} from '../films/elevator-safety/remotion/Group2';
import {Flyweights as ElFlyweights, GovernorIntro as ElGovernor, PullsLever as ElPullsLever, PureMechanics as ElPure, Ropes as ElRopes} from '../films/elevator-safety/remotion/Group1';
import {BallScene as SbBall, ColdOpen as SbColdOpen, DiscScene as SbDisc, LockCantTell as SbLock} from '../films/seatbelt-lock/remotion/Part1';
import {span as sbSpan} from '../films/seatbelt-lock/remotion/scenes';
import {BarScene as SbBar, ChildSeat as SbChild, ChipAfterAll as SbChip, Landing as SbLanding, Price as SbPrice, TooGood as SbTooGood} from '../films/seatbelt-lock/remotion/Part2';
import {Film as SbFilm, FILM_FRAMES as SB_FILM_FRAMES} from '../films/seatbelt-lock/remotion/Film';

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
			<Composition id="EL-Thumb-A" component={ElThumbA} durationInFrames={1} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="EL-Thumb-B" component={ElThumbB} durationInFrames={1} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="EL-Thumb-C" component={ElThumbC} durationInFrames={1} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="EL-Thumb-D" component={ElThumbD} durationInFrames={1} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="EL-Thumb-E" component={ElThumbE} durationInFrames={1} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="EL-Thumb-F" component={ElThumbF} durationInFrames={1} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="EL-Thumb-G" component={ElThumbG} durationInFrames={1} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="EL-Thumb-H" component={ElThumbH} durationInFrames={1} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="EL-Thumb-I" component={ElThumbI} durationInFrames={1} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="EL-Thumb-J" component={ElThumbJ} durationInFrames={1} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="EL-Thumb-K" component={ElThumbK} durationInFrames={1} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="EL-Thumb-L" component={ElThumbL} durationInFrames={1} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="EL-Film" component={ElFilm} durationInFrames={EL_FILM_FRAMES} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="EL-S01-ColdOpen" component={ElColdOpen} durationInFrames={elSpan('s01').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="EL-S02-Ropes" component={ElRopes} durationInFrames={elSpan('s02').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="EL-S03-Governor" component={ElGovernor} durationInFrames={elSpan('s03').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="EL-S04-Flyweights" component={ElFlyweights} durationInFrames={elSpan('s04').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="EL-S05-Lever" component={ElPullsLever} durationInFrames={elSpan('s05').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="EL-S06-Pure" component={ElPure} durationInFrames={elSpan('s06').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="EL-S07-Wedge" component={ElWedge} durationInFrames={elSpan('s07').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="EL-S08-Question" component={ElQuestion} durationInFrames={elSpan('s08').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="EL-S09-TooHard" component={ElTooHard} durationInFrames={elSpan('s09').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="EL-S10-Otis" component={ElOtis} durationInFrames={elSpan('s10').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="EL-S11-Window" component={ElWindow} durationInFrames={elSpan('s11').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="EL-S12-Spring" component={ElSpring} durationInFrames={elSpan('s12').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="EL-S13-Rail" component={ElRail} durationInFrames={elSpan('s13').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="EL-S14-Counterweight" component={ElCounterweight} durationInFrames={elSpan('s14').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="EL-S15-UpBrake" component={ElUpBrake} durationInFrames={elSpan('s15').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="EL-S16-Landing" component={ElLanding} durationInFrames={elSpan('s16').dur} fps={video.fps} width={video.width} height={video.height} />
		</Folder>
		<Folder name="SeatbeltLock">
			<Composition id="SB-S01-ColdOpen" component={SbColdOpen} durationInFrames={sbSpan('s01').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="SB-S02-Lock" component={SbLock} durationInFrames={sbSpan('s02').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="SB-S03-Disc" component={SbDisc} durationInFrames={sbSpan('s03').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="SB-S04-Ball" component={SbBall} durationInFrames={sbSpan('s04').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="SB-Film" component={SbFilm} durationInFrames={SB_FILM_FRAMES} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="SB-S05-TooGood" component={SbTooGood} durationInFrames={sbSpan('s05').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="SB-S06-Chip" component={SbChip} durationInFrames={sbSpan('s06').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="SB-S07-Bar" component={SbBar} durationInFrames={sbSpan('s07').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="SB-S08-Price" component={SbPrice} durationInFrames={sbSpan('s08').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="SB-S09-Child" component={SbChild} durationInFrames={sbSpan('s09').dur} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="SB-S10-Landing" component={SbLanding} durationInFrames={sbSpan('s10').dur} fps={video.fps} width={video.width} height={video.height} />
		</Folder>
		<Folder name="Dev">
			<Composition id="TW-Look3D" component={Look3D} durationInFrames={600} fps={video.fps} width={video.width} height={video.height} />
			<Composition id="EngineCheck" component={EngineCheck} durationInFrames={360} fps={video.fps} width={video.width} height={video.height} />
		</Folder>
	</>
);
