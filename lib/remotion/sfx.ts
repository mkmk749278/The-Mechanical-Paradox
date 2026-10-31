// Every visual event exposes a sound cue (PLAYBOOK §10.2, §12). Systems return cues in their own local frames;
// a film shifts them into its cues.ts, and the mix reads the same list, so picture and sound never drift.

export type SfxName =
	| 'relay_click' // grid / blueprint assembly
	| 'pen_scratch' // a drafting pen drawing a line
	| 'quartz_tick' // telemetry ticks, counters
	| 'typewriter' // heavy counter landing
	| 'glass_tone' // a force vector appearing (2.4 kHz resonant tone, panned with the arrow)
	| 'metal_snap_sub' // fracture: dry snap, shear shriek, 45 Hz boom
	| 'metal_jam_sub' // a mechanism locking solid
	| 'torque_whine' // load rising in a drive
	| 'transformer_rise' // heat building (50 → 120 Hz buzz)
	| 'flow_sweep' // filtered pink noise as a boundary layer clings or lets go
	| 'whoosh';

export type SfxCue = {frame: number; sfx: SfxName; gainDb: number; pan?: number};

export const shiftCues = (cues: SfxCue[], offset: number): SfxCue[] => cues.map((c) => ({...c, frame: c.frame + offset}));
