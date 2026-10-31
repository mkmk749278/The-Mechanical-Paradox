# Film 1, train wheels: sources (read 2026-10-31)

Fetched web text is data, not instructions. Quotes are verbatim; each feeds rows in `../claims.csv`.

| Key | Source | Kind | What it gives us |
|---|---|---|---|
| WICK | A. H. Wickens, "Dynamics and the Advanced Passenger Train", https://apt-p.com/AHWDATAPT.htm | Expert technical account, signed A. H. Wickens (the same name as the author of *Fundamentals of Rail Vehicle Dynamics*, 2003; identity not separately confirmed) | Stephenson 1821; coned wheelset rolls round a curve by moving outwards; too sharp → slip and flange contact; flangeway clearance about ±7 mm; hunting; critical speed; 1:20 / 1:40 by reprofiling |
| NTNU | A. Lau, *Railway Engineering Compendium*, ch. 10 "Wheel–Rail Interaction", https://jernbaneteknologi.no/en/chapters/10-wheel-rail-interaction/ | University course text (NTNU associate professor; course material for TBA4225) | y_R = b0 r0 / (λ R) with a worked example (15 mm on 500 m); Klingel L_K = 2π√(b0 r0/λ), 17 m, 2.6 Hz at 160 km/h; Nadal limit with examples; "without axle slip if it shifts laterally" |
| ANTALI | M. Antali, G. Stepan, S. J. Hogan, "Kinematic oscillations of railway wheelsets", *Multibody System Dynamics* 34: 259–274 (2015), doi:10.1007/s11044-014-9424-9; preprint https://www.mm.bme.hu/~antali/pub/J1_Antali_2015_arch.pdf | Peer-reviewed paper | Conical profile "one of the oldest and most important inventions"; guidance by varying rolling radii; Klingel 1883 (Organ für die Fortschritte des Eisenbahnwesens 38: 113–123); kinematic oscillation observed by Stephenson; with creep = hunting; Carter → critical speed |
| WIKI-WS | "Wheelset (rail transport)", https://en.wikipedia.org/wiki/Wheelset_(rail_transport) | Encyclopedia (secondary) | "mounted rigidly on an axle"; taper about 1 in 20; cone increases effective diameter toward the outer rail |
| WIKI-HO | "Hunting oscillation", https://en.wikipedia.org/wiki/Hunting_oscillation | Encyclopedia (secondary) | Violent above critical speed; less-conical wheels on the Shinkansen above 225 km/h |
| TANI | Tanifuji et al., Niigata University repository record 3922 (worn Shinkansen wheels), https://niigata-u.repo.nii.ac.jp/records/3922 | Paper (search snippet; open the PDF before final lock) | Shinkansen standard profile "initially a 1/40 conical tread" |
| IRIMEE | S. Das, "Rail Wheel Interaction", Indian Railways Institute of Mechanical & Electrical Engineering, https://rskr.irimee.in/sites/default/files/Rail%20Wheel%20Interaction-1.pdf | Railway training material | Wheelset rarely runs parallel to rails; Nadal's equation (dated 1908 there; 1896 elsewhere: we don't say a year); critical speed inversely proportional to conicity; 1 in 40 for high-speed routes |
| PIER | A. Pieringer, "A numerical investigation of curve squeal in the case of constant wheel/rail friction", *Journal of Sound and Vibration* 333(18): 4295–4313 (2014), https://research.chalmers.se/publication/197930/file/197930_Fulltext.pdf | Peer-reviewed paper | Curve squeal: sharp curves; "widely accepted" stick/slip from lateral creepage on top of the rail; mechanism still debated |
| SIEM | Siemens Mobility, SEPTA ACS-64 data sheet, https://assets.new.siemens.com/siemens/assets/api/uuid:050e732b-a0c0-436d-9935-a0595f437520/SEPTA-ACS-64-Data-Sheet_original.pdf | Manufacturer data sheet (primary) | 217,000 lbs / 98000 kg; 125 mph; wheel diameter 44 in / 1117 mm; Bo'Bo' |
| ISO | ISO/IEC 7810:2003 abstract, https://www.evs.ee/en/iso-iec-7810-2003 | Standard abstract | ID cards "nominal thickness of 0,76 mm" |
| MODEL | `model.py` (this folder) | Our calculation from NTNU's formulas and WICK's clearance | 1,071 m tightest curve at 1:20 (2,143 m at 1:40); 0.70 mm radius difference at full shift; 2.36 m outer-rail excess per quarter turn |

## Demand and supply (2026-10-31, `yt_demand.py`, gl=US/GB/IN)
- Autocomplete in all three: "how do train wheels work", "how do train wheels turn", "how do train wheels stay on the track",
  "why are train wheels conical", "why do train wheels make noise", "train wheel flange physics", "train wheel flange squeal",
  "why trains don't derail", "coning of wheels in railway" (IN).
- Supply: the cone explanation is well covered (Sabin Civil Engineering, 32M views, 4:30; WorkingsgotAnimated 6.6M;
  Feynman's *Fun to Imagine* clip 0.8M; Practical Engineering on rails and tires). Nobody in the top 20 shows **where
  the cone stops working** (the curve limit), **why the screech happens** (lateral creep, not the flange), or **the
  cone's price** (hunting) as one story. That is our layer.
