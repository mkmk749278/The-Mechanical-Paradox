"""The numbers film 1 derives from sourced formulas (claims D01-D05). Run: python3 model.py

Inputs are the NTNU compendium's worked-example wheelset (r0 = 0.5 m, b0 = 0.75 m, cone 1:20; claims S07, S08) and
Wickens's flangeway clearance of about ±7 mm (claim S05). Every output is a model value: shown on screen as MODEL.
"""
import math

r0, b0, clear = 0.5, 0.75, 0.007          # rolling radius m, half the contact-point distance m, flangeway clearance m


def shift_needed(R, cone):                # radial steering: y_R = b0 r0 / (lambda R)
    return b0 * r0 / (cone * R)


def tightest_pure_rolling_curve(cone):    # the curve radius at which y_R reaches the clearance
    return b0 * r0 / (cone * clear)


def klingel_wavelength(cone):             # L_K = 2 pi sqrt(b0 r0 / lambda)
    return 2 * math.pi * math.sqrt(b0 * r0 / cone)


def length_difference(turn_deg):          # outer minus inner contact path over a turn: 2 b0 * angle, any radius
    return 2 * b0 * math.radians(turn_deg)


for name, cone in (("1:20", 1 / 20), ("1:40", 1 / 40)):
    print(f"cone {name}: shift on a 500 m curve {1000 * shift_needed(500, cone):.1f} mm; "
          f"tightest curve with no flange contact {tightest_pure_rolling_curve(cone):.0f} m; "
          f"Klingel wavelength {klingel_wavelength(cone):.1f} m; "
          f"sway at 160 km/h {160 / 3.6 / klingel_wavelength(cone):.2f} Hz")
print(f"outer rail longer than inner over a quarter turn (any radius, standard gauge): {1000 * length_difference(90):.0f} mm")
print(f"rolling radius difference at full ±7 mm shift, 1:20: {2 * (1/20) * clear * 1000:.2f} mm")
