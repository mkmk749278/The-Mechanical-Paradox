// Film 1's mechanism, from the same sourced formulas as research/model.py (PLAYBOOK §8.3). Every number a scene draws
// or a HUD row shows comes from here. The checks at the bottom run when the bundle loads: a wrong formula stops the
// render instead of reaching the screen.

/** The NTNU compendium's worked-example wheelset (claims C10, C13, C14, C21) and Wickens's ±7 mm play (C09). */
export const WS = {
	r0: 500, // rolling radius, mm
	b0: 750, // half the distance between the contact points, mm
	cone: 1 / 20, // tread conicity λ (C05)
	coneShinkansen: 1 / 40, // C24
	clear: 7, // flangeway clearance, mm (C09)
	card: 0.76, // ISO/IEC 7810 ID-1 card, mm (C11)
} as const;

/** Rolling radius of one wheel when the wheelset sits y mm toward that wheel's side (λ y; linear cone). */
export const rollingRadius = (y: number, cone: number = WS.cone): number => WS.r0 + cone * y;

/** Radius difference between the two wheels at shift y: 2 λ y (C10). */
export const deltaR = (y: number, cone: number = WS.cone): number => 2 * cone * y;

/** Shift needed to roll round a curve of radius R (m) with no slip: y = b0 r0 / (λ R) (C13). In mm. */
export const shiftNeeded = (Rm: number, cone: number = WS.cone): number => (WS.b0 * WS.r0) / (cone * Rm * 1000);

/** The tightest curve the cone can take before the flange meets the rail: R = b0 r0 / (λ y_max) (C14). In m. */
export const tightestCurve = (cone: number = WS.cone): number => (WS.b0 * WS.r0) / (cone * WS.clear) / 1000;

/** Klingel's wavelength L = 2π √(b0 r0 / λ) (C20, C21). In m. */
export const klingelWavelength = (cone: number = WS.cone): number => (2 * Math.PI * Math.sqrt((WS.b0 * WS.r0) / cone)) / 1000;

/** Outer minus inner path over a turn of `deg` degrees, any radius: 2 b0 θ (C04). In mm. */
export const pathDifference = (deg: number): number => 2 * WS.b0 * ((deg * Math.PI) / 180);

/** Sway frequency at a speed in km/h: v / L. */
export const swayHz = (kmh: number, cone: number = WS.cone): number => kmh / 3.6 / klingelWavelength(cone);

/** Distance from the axle centre to the apex of the cone the two rolling circles form: b0 (r_o + r_i) / (r_o - r_i). It equals the curve radius R exactly when y is the needed shift (C27, apex at the curve centre). In m. */
export const apexDistance = (y: number, cone: number = WS.cone): number => (WS.b0 * (rollingRadius(y, cone) + rollingRadius(-y, cone))) / deltaR(y, cone) / 1000;

// ---- numeric checks (the film's numbers; research/model.py prints the same) ----
const near = (name: string, got: number, want: number, tol: number): void => {
	if (Math.abs(got - want) > tol) throw new Error(`train-wheels model check ${name}: ${got} ≠ ${want} ± ${tol}`);
};
near('Δr at full play (0.70 mm)', deltaR(WS.clear), 0.7, 1e-9);
near('shift on a 500 m curve (15 mm)', shiftNeeded(500), 15, 1e-9);
near('tightest curve 1:20 (1,071 m)', tightestCurve(), 1071.43, 0.01);
near('tightest curve 1:40 (2,143 m)', tightestCurve(WS.coneShinkansen), 2142.86, 0.01);
near('Klingel 1:20 (17.2 m)', klingelWavelength(), 17.21, 0.01);
near('sway at 160 km/h (2.58 Hz)', swayHz(160), 2.58, 0.01);
near('quarter-turn path difference (2,356 mm)', pathDifference(90), 2356.19, 0.01);
// the rolling circles' cone has its apex on the curve's centre exactly when the shift is the needed one
near('apex at R for y_needed(1,500 m)', apexDistance(shiftNeeded(1500)), 1500, 1e-6);
// the card is thicker than the full-play radius difference (the signature shot depends on it)
if (!(WS.card > deltaR(WS.clear))) throw new Error('bank card must be thicker than Δr at full play');
