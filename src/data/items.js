// Default work items. m: [material, quantity per unit]; l: [trade, hours per unit, crew]; e: [equipment, hours per unit, rate per hour].
export const DEFAULT_ITEMS = [
 {
  "id": 0,
  "ph": "Design and planning",
  "n": "Design, drawings, approvals",
  "u": "m²",
  "q": 1,
  "plan": 0,
  "dig": 0,
  "drv": "",
  "m": [],
  "l": [
   [
    "design",
    0.12
   ],
   [
    "plan",
    0.07
   ],
   [
    "env",
    0.03
   ]
  ],
  "e": []
 },
 {
  "id": 1,
  "ph": "Site preparation",
  "n": "Excavation",
  "u": "m³",
  "q": 0.3,
  "plan": 1,
  "dig": 1,
  "drv": "",
  "m": [],
  "l": [
   [
    "dig",
    0.9
   ]
  ],
  "e": [
   [
    "Excavator",
    0.12,
    1800
   ]
  ]
 },
 {
  "id": 2,
  "ph": "Foundation",
  "n": "PCC bed",
  "u": "m³",
  "q": 0.05,
  "plan": 1,
  "dig": 0,
  "drv": "",
  "m": [
   [
    "cem",
    7
   ],
   [
    "sand",
    0.45
   ],
   [
    "agg",
    0.9
   ]
  ],
  "l": [
   [
    "civil",
    6
   ]
  ],
  "e": [
   [
    "Mixer",
    0.6,
    250
   ]
  ]
 },
 {
  "id": 3,
  "ph": "Foundation",
  "n": "RCC footings and plinth",
  "u": "m³",
  "q": 0.12,
  "plan": 1,
  "dig": 0,
  "drv": "",
  "m": [
   [
    "cem",
    8
   ],
   [
    "sand",
    0.42
   ],
   [
    "agg",
    0.84
   ],
   [
    "steel",
    90
   ],
   [
    "fply",
    8.6
   ],
   [
    "wood",
    0.15
   ]
  ],
  "l": [
   [
    "civil",
    11
   ]
  ],
  "e": [
   [
    "Mixer",
    0.8,
    250
   ]
  ]
 },
 {
  "id": 4,
  "ph": "Structure",
  "n": "Steel frame (columns, beams, trusses)",
  "u": "kg",
  "q": 34,
  "plan": 0,
  "dig": 0,
  "drv": "",
  "m": [
   [
    "str",
    1
   ]
  ],
  "l": [
   [
    "mech",
    0.05
   ],
   [
    "civil",
    0.02
   ]
  ],
  "e": [
   [
    "Crane",
    0.003,
    2500
   ]
  ]
 },
 {
  "id": 5,
  "ph": "Structure",
  "n": "RCC slab and beams",
  "u": "m³",
  "q": 0.14,
  "plan": 0,
  "dig": 0,
  "drv": "",
  "m": [
   [
    "cem",
    8
   ],
   [
    "sand",
    0.42
   ],
   [
    "agg",
    0.84
   ],
   [
    "steel",
    100
   ],
   [
    "fply",
    19
   ],
   [
    "wood",
    0.4
   ]
  ],
  "l": [
   [
    "civil",
    12
   ]
  ],
  "e": [
   [
    "Mixer",
    0.8,
    250
   ]
  ]
 },
 {
  "id": 6,
  "ph": "Civil",
  "n": "Brick masonry walls",
  "u": "m²",
  "q": 0.9,
  "plan": 0,
  "dig": 0,
  "drv": "wall",
  "m": [
   [
    "brk",
    55
   ],
   [
    "cem",
    0.45
   ],
   [
    "sand",
    0.03
   ]
  ],
  "l": [
   [
    "civil",
    2.4
   ]
  ],
  "e": []
 },
 {
  "id": 7,
  "ph": "Roof",
  "n": "Roof sheeting and fixing",
  "u": "m²",
  "q": 1,
  "plan": 1,
  "dig": 0,
  "drv": "",
  "m": [
   [
    "sheet",
    1.1
   ]
  ],
  "l": [
   [
    "mech",
    0.2
   ],
   [
    "civil",
    0.15
   ]
  ],
  "e": [
   [
    "Crane",
    0.01,
    2500
   ]
  ]
 },
 {
  "id": 8,
  "ph": "Civil",
  "n": "Flooring (screed and tiles)",
  "u": "m²",
  "q": 1,
  "plan": 0,
  "dig": 0,
  "drv": "",
  "m": [
   [
    "cem",
    0.3
   ],
   [
    "sand",
    0.04
   ],
   [
    "tile",
    1
   ]
  ],
  "l": [
   [
    "civil",
    0.7
   ],
   [
    "fin",
    0.2
   ]
  ],
  "e": []
 },
 {
  "id": 9,
  "ph": "Electrical",
  "n": "Wiring, switches, boards, points",
  "u": "nos",
  "q": 0.15,
  "plan": 0,
  "dig": 0,
  "drv": "",
  "m": [
   [
    "wire",
    25
   ],
   [
    "sw",
    1.5
   ],
   [
    "pnl",
    0.05
   ]
  ],
  "l": [
   [
    "elec",
    3
   ]
  ],
  "e": []
 },
 {
  "id": 10,
  "ph": "Plumbing",
  "n": "Pipes and fixtures",
  "u": "nos",
  "q": 0.02,
  "plan": 0,
  "dig": 0,
  "drv": "",
  "m": [
   [
    "pipe",
    35
   ],
   [
    "fix",
    1
   ]
  ],
  "l": [
   [
    "plumb",
    6
   ]
  ],
  "e": []
 },
 {
  "id": 11,
  "ph": "Mechanical",
  "n": "HVAC and ventilation",
  "u": "kg",
  "q": 2.5,
  "plan": 0,
  "dig": 0,
  "drv": "",
  "m": [
   [
    "duct",
    1
   ]
  ],
  "l": [
   [
    "mech",
    0.18
   ],
   [
    "elec",
    0.04
   ]
  ],
  "e": []
 },
 {
  "id": 12,
  "ph": "Finishing",
  "n": "Plaster and painting",
  "u": "m²",
  "q": 2.2,
  "plan": 0,
  "dig": 0,
  "drv": "",
  "m": [
   [
    "paint",
    0.25
   ],
   [
    "cem",
    0.12
   ],
   [
    "sand",
    0.02
   ]
  ],
  "l": [
   [
    "fin",
    0.35
   ],
   [
    "civil",
    0.2
   ]
  ],
  "e": []
 },
 {
  "id": 13,
  "ph": "Site preparation",
  "n": "Backfilling and levelling",
  "u": "m³",
  "q": 0.2,
  "plan": 1,
  "dig": 1,
  "drv": "",
  "m": [],
  "l": [
   [
    "dig",
    0.6
   ]
  ],
  "e": [
   [
    "Compactor",
    0.08,
    600
   ]
  ]
 },
 {
  "id": 14,
  "ph": "Finishing",
  "n": "Interior woodwork (wardrobes, kitchen, panelling)",
  "u": "m²",
  "q": 0.3,
  "plan": 0,
  "dig": 0,
  "drv": "",
  "m": [
   [
    "ply",
    10.76
   ],
   [
    "wood",
    0.5
   ]
  ],
  "l": [
   [
    "carp",
    2
   ]
  ],
  "e": []
 }
];
