import {makeCues, Timing} from '../../../lib/remotion/timing';
import provisional from '../vo/timing.provisional.json';

// The film's word clock. Until the VO is recorded, scenes run on the provisional timing (150 wpm from vo.txt);
// after recording, scripts/vo_timing.py writes vo/timing.json and this import switches to it. Nothing else changes.
export const timing = provisional as Timing;
export const cue = makeCues(timing);
