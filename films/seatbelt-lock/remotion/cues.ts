import {makeCues, Timing} from '../../../lib/remotion/timing';
import recorded from '../vo/timing.json';

// Film 3's word clock, from the recorded VO (scripts/vo_timing.py, 2026-11-13: eleven_v4, edit breaths, 159 wpm).
export const timing = recorded as unknown as Timing;
export const cue = makeCues(timing);
