#!/usr/bin/env python3
"""Film 3 numbers the picture and HUD derive from the sources (PLAYBOOK §9.1, MODEL rows in claims.csv).

Run: python3 films/seatbelt-lock/research/model.py   (asserts every derived number the script uses)
"""
import math

G = 9.80665

# FMVSS 209 S4.3(j)(2): lock within 25 mm at 0.7 g (vehicle-sensitive); must not lock before 51 mm at <= 0.3 g
# (webbing-sensitive); not lock at <= 15 deg tilt, lock beyond 45 deg.
LOCK_G, LOCK_MM, NOLOCK_G, NOLOCK_MM, TILT_OK, TILT_LOCK = 0.7, 25, 0.3, 51, 15, 45

# 0.7 g as a stop: from 50 km/h, how long and how far (a feel for "hard braking"; HUD MODEL)
v = 50 / 3.6
a = LOCK_G * G
t_stop = v / a
d_stop = v * v / (2 * a)
assert abs(t_stop - 2.02) < 0.01 and abs(d_stop - 14.0) < 0.1

# 25 mm against a thumb's width: an adult thumb is about 20-25 mm wide (comparison only, said as "about an inch")
assert abs(LOCK_MM / 25.4 - 0.98) < 0.01  # 25 mm is about one inch

# The load limiters: 4 kN and 6 kN as the weight of a mass on Earth
for kn, kg in ((4, 408), (6, 612)):
    assert abs(kn * 1000 / G - kg) < 1
# "about the weight of five adults" at 80 kg each: 4 kN / (80 kg g)
assert abs(4000 / (80 * G) - 5.1) < 0.05

# The tilt: 15 deg is a 27% grade; 45 deg is a 100% grade (steeper than any public road we can source: say no number)
assert abs(math.tan(math.radians(TILT_OK)) - 0.268) < 0.001
assert abs(math.tan(math.radians(TILT_LOCK)) - 1.0) < 1e-9

print(f"0.7 g from 50 km/h: {t_stop:.2f} s, {d_stop:.1f} m; 4 kN = {4000/G:.0f} kg-weight; 15 deg = {math.tan(math.radians(15))*100:.0f}% grade")
