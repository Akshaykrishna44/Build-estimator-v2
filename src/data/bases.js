// Rate bases. Basic rates exclude GST. TN = Tamil Nadu PWD Schedule of Rates 2025-26 (effective 22.07.2025).
// CPWD = Delhi Analysis of Rates 2023 basic rates (01.04.2023) raised by the CPWD cost index of the chosen station.
export const DEFAULT_EQUIPMENT = {
 "Excavator": 1800,
 "Mixer": 250,
 "Crane": 2500,
 "Compactor": 600
};
export const BASES = {
 "tn": {
  "label": "Tamil Nadu PWD SOR 2025-26",
  "gst": 18,
  "mats": {
   "cem": "TN PWD SOR cement",
   "sand": "TN PWD SOR M-sand",
   "agg": "TN PWD SOR 20 mm jelly",
   "steel": "TN PWD SOR steel",
   "str": "TN PWD SOR MS sections",
   "brk": "TN PWD SOR fly ash brick"
  },
  "wages": {
   "design": 179,
   "plan": 161,
   "env": 179,
   "civil": 121,
   "dig": 96,
   "carp": 147,
   "mech": 130,
   "elec": 121,
   "plumb": 127,
   "fin": 117
  },
  "eq": {
   "Excavator": 1800,
   "Mixer": 250,
   "Crane": 2500,
   "Compactor": 600
  }
 },
 "cpwd": {
  "label": "CPWD DAR/DSR 2023 with cost index",
  "gst": 18,
  "mats": {
   "cem": "CPWD OPC-43 cement",
   "sand": "CPWD coarse sand (zone III)",
   "agg": "CPWD stone aggregate 20 mm",
   "steel": "CPWD TMT Fe-500D",
   "str": "CPWD structural steel sections",
   "brk": "CPWD fly ash bricks (FPS, class 7.5)",
   "wood": "CPWD sal wood (scantling)",
   "fply": "CPWD commercial ply 12 mm",
   "ply": "CPWD block board 18 mm",
   "tile": "CPWD vitrified tile 60 x 60",
   "paint": "CPWD acrylic emulsion",
   "pipe": "CPWD GI pipe 25 mm"
  },
  "wages": {
   "design": 179,
   "plan": 161,
   "env": 179,
   "civil": 100,
   "dig": 92,
   "carp": 107,
   "mech": 112,
   "elec": 122,
   "plumb": 112,
   "fin": 102
  },
  "eq": {
   "Excavator": 900,
   "Mixer": 112.5,
   "Crane": 981,
   "Compactor": 350
  }
 },
 "mkt": {
  "label": "Market (indicative)",
  "gst": 0,
  "mats": {},
  "wages": {
   "design": 900,
   "plan": 800,
   "env": 700,
   "civil": 350,
   "dig": 250,
   "carp": 320,
   "mech": 450,
   "elec": 450,
   "plumb": 400,
   "fin": 380
  },
  "eq": {
   "Excavator": 1800,
   "Mixer": 250,
   "Crane": 2500,
   "Compactor": 600
  }
 }
};
export const STATIONS = [
 {
  "name": "Chennai",
  "index": 115,
  "date": "01.10.2025"
 },
 {
  "name": "Trichy",
  "index": 115,
  "date": "01.10.2025"
 },
 {
  "name": "Puducherry",
  "index": 115,
  "date": "01.10.2025"
 },
 {
  "name": "Thanjavur and Nagapattinam",
  "index": 112,
  "date": "01.10.2025"
 },
 {
  "name": "Karaikudi",
  "index": 110,
  "date": "01.10.2025"
 },
 {
  "name": "Mayiladuthurai",
  "index": 110,
  "date": "01.10.2025"
 },
 {
  "name": "Cuddalore, Villupuram and Tiruvannamalai",
  "index": 107,
  "date": "01.10.2025"
 },
 {
  "name": "Madurai",
  "index": 125,
  "date": "01.04.2025"
 },
 {
  "name": "Coimbatore",
  "index": 122,
  "date": "01.04.2025"
 },
 {
  "name": "Dindigul",
  "index": 122,
  "date": "01.04.2025"
 },
 {
  "name": "Sivagangai",
  "index": 121,
  "date": "01.04.2025"
 },
 {
  "name": "Salem",
  "index": 120,
  "date": "01.04.2025"
 },
 {
  "name": "Erode",
  "index": 120,
  "date": "01.04.2025"
 },
 {
  "name": "Tirupur",
  "index": 120,
  "date": "01.04.2025"
 },
 {
  "name": "Avinashi",
  "index": 120,
  "date": "01.04.2025"
 },
 {
  "name": "Tirunelveli",
  "index": 117,
  "date": "01.04.2025"
 },
 {
  "name": "Tuticorin",
  "index": 117,
  "date": "01.04.2025"
 },
 {
  "name": "Nagercoil",
  "index": 117,
  "date": "01.04.2025"
 },
 {
  "name": "Hosur",
  "index": 116,
  "date": "01.04.2025"
 },
 {
  "name": "Dharmapuri",
  "index": 116,
  "date": "01.04.2025"
 },
 {
  "name": "Pollachi",
  "index": 114,
  "date": "01.04.2025"
 },
 {
  "name": "Udumalpet",
  "index": 114,
  "date": "01.04.2025"
 },
 {
  "name": "Rameswaram",
  "index": 126,
  "date": "01.04.2025"
 },
 {
  "name": "Ramnad / Mandapam",
  "index": 126,
  "date": "01.04.2025"
 },
 {
  "name": "Yelagiri",
  "index": 125,
  "date": "01.04.2025"
 },
 {
  "name": "Yercaud",
  "index": 125,
  "date": "01.04.2025"
 },
 {
  "name": "Kodaikanal",
  "index": 132,
  "date": "01.04.2025"
 },
 {
  "name": "Ooty",
  "index": 136,
  "date": "01.04.2025"
 }
];
