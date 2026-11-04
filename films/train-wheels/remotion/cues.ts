import {makeCues, Timing} from '../../../lib/remotion/timing';
import recorded from '../vo/timing.json';

// The film's word clock, from the recorded VO (scripts/vo_timing.py, 2026-11-04: Eleven v4, edit breaths for pace).
// vo/timing.provisional.json (150 wpm from vo.txt) is kept only as the record of how the scenes were first cued.
export const timing = recorded as Timing;
export const cue = makeCues(timing);
