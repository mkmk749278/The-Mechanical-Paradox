#!/usr/bin/env python3
"""Film 2 physics model: every MODEL number on screen comes from here (PLAYBOOK §9.1, claims C2x).

An example traction elevator, rated 1.6 m/s (a common mid-rise speed; the film calls it "a typical office elevator").
Sourced inputs: EN 81-20:2020 5.6.2.2.1.1 (trip window), 5.6.2.2.1.2 (250 mm), 5.6.2.1.3 (0.2-1 gn);
MSHA/Barkand (counterweight = car + about 45 % of rated load). Everything else is derived and labelled MODEL.
Run: python3 films/elevator-safety/research/model.py   (asserts the numbers the script uses)
"""
from math import sqrt

G = 9.80665                      # standard gravity, m/s^2 (gn)
V_RATED = 1.6                    # m/s, example lift (MODEL choice)

trip_min = 1.15 * V_RATED                        # 5.6.2.2.1.1 a): at least 115 % of rated speed
trip_max = 1.25 * V_RATED + 0.25 / V_RATED       # 5.6.2.2.1.1 a) 4): progressive gear, rated speed > 1 m/s
V_TRIP = 2.0                                     # inside the window: "about two meters a second"
assert trip_min <= V_TRIP < trip_max, (trip_min, trip_max)

# Free fall from rest (ropes part with the car standing) to the trip speed
t_ff = V_TRIP / G
d_ff = V_TRIP ** 2 / (2 * G)
# worst case: the governor may let its rope run up to 250 mm between tripping points (5.6.2.2.1.2)
v_late = sqrt(V_TRIP ** 2 + 2 * G * 0.25)

def brake(v, a_g):
    """distance (m) and time (s) to stop from v at an average net retardation a_g * gn"""
    a = a_g * G
    return v * v / (2 * a), v / a

d_02, _ = brake(V_TRIP, 0.2)          # softest the code allows
d_10, _ = brake(V_TRIP, 1.0)          # hardest average the code allows
d_06, t_06 = brake(V_TRIP, 0.6)       # a middle setting, for the picture

# The "grab as hard as you can" stop: 2 m/s to zero in 2 cm
a_hard_g = V_TRIP ** 2 / (2 * 0.02) / G

# Felt load while braking a falling car: gravity plus the retardation
felt_max = 1 + 1.0

# Total travel from the moment the ropes part to standstill (from rest; 0.6 gn), typical and late-trip worst case
total_typ = d_ff + d_06
total_late = d_ff + 0.25 + brake(v_late, 0.6)[0]

# Counterweight: car + about 45 % of rated load (Barkand, MSHA); example car 1,000 kg, rated load 1,000 kg
CAR, LOAD = 1000.0, 1000.0
cw = CAR + 0.45 * LOAD
imbalance_empty = cw - CAR

if __name__ == "__main__":
    print(f"trip window {trip_min:.2f}-{trip_max:.2f} m/s; example trip {V_TRIP} m/s")
    print(f"free fall to trip: {t_ff:.3f} s, {d_ff:.3f} m; late trip reaches {v_late:.2f} m/s")
    print(f"braking from {V_TRIP} m/s: 0.2 g {d_02:.2f} m · 0.6 g {d_06:.2f} m in {t_06:.2f} s · 1 g {d_10:.2f} m")
    print(f"2 cm stop: {a_hard_g:.1f} g; felt at 1 g average: {felt_max:.0f} g")
    print(f"total travel: typical {total_typ:.2f} m, late-trip worst {total_late:.2f} m")
    print(f"counterweight {cw:.0f} kg vs empty car {CAR:.0f} kg: {imbalance_empty:.0f} kg heavier")
    # numbers the script states
    assert abs(t_ff - 0.2) < 0.01                       # "a fraction of a second" (about 0.2 s)
    assert 0.19 < d_10 < 0.21 and 0.99 < d_02 < 1.03    # "between twenty centimeters and a meter"
    assert 9.5 < a_hard_g < 10.5                        # "about ten times the pull of gravity"
    assert 0.5 < total_typ < 0.6 and total_late < 1.3   # "within about a meter" (0.5-1.2 m)
    assert imbalance_empty > 0                          # the empty car is the lighter side
    print("model checks pass")
