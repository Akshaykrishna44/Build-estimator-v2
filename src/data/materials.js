// Materials, grade options and prices. Options named "TN PWD SOR" or "CPWD" are government basic rates (ex-GST);
// all other prices are indicative placeholders. An option may carry a quantity "factor" or a roof "bundle".
export const MATERIALS = [
 {
  "key": "cem",
  "name": "Cement",
  "unit": "bag",
  "waste": 0.05
 },
 {
  "key": "sand",
  "name": "Sand",
  "unit": "m³",
  "waste": 0.08
 },
 {
  "key": "agg",
  "name": "Aggregate (gravel)",
  "unit": "m³",
  "waste": 0.05
 },
 {
  "key": "steel",
  "name": "Reinforcement steel (TMT)",
  "unit": "kg",
  "waste": 0.04
 },
 {
  "key": "str",
  "name": "Structural steel",
  "unit": "kg",
  "waste": 0.03
 },
 {
  "key": "brk",
  "name": "Bricks and blocks",
  "unit": "nos",
  "waste": 0.05
 },
 {
  "key": "sheet",
  "name": "Roof type and sheeting",
  "unit": "m²",
  "waste": 0.05
 },
 {
  "key": "tile",
  "name": "Flooring",
  "unit": "m²",
  "waste": 0.07
 },
 {
  "key": "wire",
  "name": "Electrical wire",
  "unit": "m",
  "waste": 0.05
 },
 {
  "key": "sw",
  "name": "Switches and sockets",
  "unit": "nos",
  "waste": 0.02
 },
 {
  "key": "pnl",
  "name": "Distribution boards",
  "unit": "nos",
  "waste": 0.02
 },
 {
  "key": "pipe",
  "name": "Pipe",
  "unit": "m",
  "waste": 0.05
 },
 {
  "key": "fix",
  "name": "Plumbing fixture sets",
  "unit": "nos",
  "waste": 0.02
 },
 {
  "key": "duct",
  "name": "HVAC ducting",
  "unit": "kg",
  "waste": 0.03
 },
 {
  "key": "paint",
  "name": "Paint",
  "unit": "L",
  "waste": 0.05
 },
 {
  "key": "wood",
  "name": "Timber / wood",
  "unit": "cft",
  "waste": 0.08
 },
 {
  "key": "fply",
  "name": "Formwork plywood (shuttering)",
  "unit": "sq ft",
  "waste": 0.1
 },
 {
  "key": "ply",
  "name": "Plywood and boards (interior)",
  "unit": "sq ft",
  "waste": 0.1
 }
];
export const DEFAULT_GRADE = {
 "cem": 2,
 "steel": 2,
 "sand": 1,
 "brk": 1,
 "sheet": 1,
 "tile": 1,
 "wire": 1,
 "sw": 1,
 "pnl": 1,
 "fix": 1,
 "paint": 1,
 "wood": 3,
 "fply": 0,
 "ply": 1
};
export const CATEGORY = {
 "cem": "Structure and civil",
 "sand": "Structure and civil",
 "agg": "Structure and civil",
 "steel": "Structure and civil",
 "str": "Structure and civil",
 "brk": "Masonry",
 "sheet": "Roof",
 "tile": "Finishing",
 "paint": "Finishing",
 "wire": "Electrical",
 "sw": "Electrical",
 "pnl": "Electrical",
 "pipe": "Plumbing",
 "fix": "Plumbing",
 "duct": "Mechanical and HVAC",
 "wood": "Wood and timber",
 "fply": "Wood and timber",
 "ply": "Wood and timber"
};
export const CATALOG = {
 "cem": [
  {
   "name": "OPC 43",
   "spec": "Plaster, masonry, general (IS 269)",
   "rate": 395
  },
  {
   "name": "OPC 53",
   "spec": "High-strength RCC, precast",
   "rate": 420
  },
  {
   "name": "PPC",
   "spec": "Durable general RCC, most common (IS 1489)",
   "rate": 375
  },
  {
   "name": "PSC",
   "spec": "Marine and mass concrete (IS 455)",
   "rate": 370
  },
  {
   "name": "Sulphate-resistant",
   "spec": "Saline soil, foundations (IS 12330)",
   "rate": 450
  },
  {
   "name": "TN PWD SOR cement",
   "spec": "TN PWD SOR 2025-26 Vol I: ₹5,602.50 per MT, basic, ex-GST",
   "rate": 280.13
  },
  {
   "name": "CPWD OPC-43 cement",
   "spec": "CPWD DAR 2023 item 0367: ₹5,156 per tonne (Delhi, 01.04.2023, ex-GST)",
   "rate": 257.8
  }
 ],
 "sand": [
  {
   "name": "River sand",
   "spec": "Best workability, supply restricted",
   "rate": 2200
  },
  {
   "name": "M-sand",
   "spec": "Manufactured, consistent grading",
   "rate": 1500
  },
  {
   "name": "Plastering sand",
   "spec": "Fine, for plaster and finishing",
   "rate": 1700
  },
  {
   "name": "Pit sand",
   "spec": "Low cost, non-structural use",
   "rate": 1300
  },
  {
   "name": "TN PWD SOR M-sand",
   "spec": "TN PWD SOR 2025-26 Vol I, basic, ex-GST",
   "rate": 1578.8
  },
  {
   "name": "TN PWD SOR plastering sand",
   "spec": "TN PWD SOR 2025-26 Vol I, basic, ex-GST",
   "rate": 1584.7
  },
  {
   "name": "CPWD coarse sand (zone III)",
   "spec": "CPWD DAR 2023 item 0982 (Delhi, 01.04.2023, ex-GST)",
   "rate": 1450
  },
  {
   "name": "CPWD fine sand (zone IV)",
   "spec": "CPWD DAR 2023 item 0983 (Delhi, 01.04.2023, ex-GST)",
   "rate": 980
  }
 ],
 "agg": [
  {
   "name": "20 mm crushed stone",
   "spec": "Standard RCC",
   "rate": 1500
  },
  {
   "name": "40 mm crushed stone",
   "spec": "Mass concrete, footings",
   "rate": 1400
  },
  {
   "name": "10 mm chips",
   "spec": "Slabs, thin sections",
   "rate": 1700
  },
  {
   "name": "Recycled aggregate",
   "spec": "Non-structural, low cost",
   "rate": 1000
  },
  {
   "name": "TN PWD SOR 20 mm jelly",
   "spec": "TN PWD SOR 2025-26 Vol I, hard broken granite, ex-GST",
   "rate": 1897.4
  },
  {
   "name": "TN PWD SOR 40 mm jelly",
   "spec": "TN PWD SOR 2025-26 Vol I, hard broken granite, ex-GST",
   "rate": 1362.9
  },
  {
   "name": "TN PWD SOR 10 mm jelly",
   "spec": "TN PWD SOR 2025-26 Vol I, hard broken granite, ex-GST",
   "rate": 1294.4
  },
  {
   "name": "CPWD stone aggregate 20 mm",
   "spec": "CPWD DAR 2023 item 0295 (Delhi, 01.04.2023, ex-GST)",
   "rate": 1425
  },
  {
   "name": "CPWD stone aggregate 40 mm",
   "spec": "CPWD DAR 2023 item 0293 (Delhi, 01.04.2023, ex-GST)",
   "rate": 1400
  },
  {
   "name": "CPWD stone aggregate 10 mm",
   "spec": "CPWD DAR 2023 item 0297 (Delhi, 01.04.2023, ex-GST)",
   "rate": 1400
  }
 ],
 "steel": [
  {
   "name": "Fe 415",
   "spec": "Light structures (IS 1786)",
   "rate": 62
  },
  {
   "name": "Fe 500",
   "spec": "Standard RCC bars",
   "rate": 66
  },
  {
   "name": "Fe 500D",
   "spec": "Ductile, seismic zones",
   "rate": 68
  },
  {
   "name": "Fe 550D",
   "spec": "High strength, fewer bars",
   "rate": 71
  },
  {
   "name": "CRS Fe 500D",
   "spec": "Corrosion resistant, coastal",
   "rate": 75
  },
  {
   "name": "TN PWD SOR steel",
   "spec": "TN PWD SOR 2025-26 Vol I: ₹55,665 per MT, basic, ex-GST",
   "rate": 55.67
  },
  {
   "name": "CPWD TMT Fe-500D",
   "spec": "CPWD DAR 2023 item 1005: ₹5,550 per quintal (Delhi, 01.04.2023, ex-GST)",
   "rate": 55.5
  }
 ],
 "str": [
  {
   "name": "MS E250",
   "spec": "Angles, channels, plates (IS 2062)",
   "rate": 68
  },
  {
   "name": "MS E350",
   "spec": "Heavy frames and trusses",
   "rate": 76
  },
  {
   "name": "PEB sections",
   "spec": "Pre-engineered building steel",
   "rate": 92
  },
  {
   "name": "Galvanised steel",
   "spec": "Hot-dip coated, corrosive sites",
   "rate": 105
  },
  {
   "name": "TN PWD SOR MS sections",
   "spec": "TN PWD SOR 2025-26 Vol I: MS angles and plates, basic, ex-GST",
   "rate": 53
  },
  {
   "name": "CPWD structural steel sections",
   "spec": "CPWD DAR 2023 item 1007: ₹5,965 per quintal (Delhi, 01.04.2023, ex-GST)",
   "rate": 59.65
  }
 ],
 "brk": [
  {
   "name": "Red clay brick",
   "spec": "230 x 110 x 75 mm",
   "rate": 9
  },
  {
   "name": "Fly ash brick",
   "spec": "Lighter, uniform, eco-friendly",
   "rate": 7
  },
  {
   "name": "AAC block",
   "spec": "600 x 200 x 200 mm, insulating",
   "rate": 60,
   "factor": 0.12
  },
  {
   "name": "Hollow concrete block",
   "spec": "400 x 200 x 200 mm",
   "rate": 42,
   "factor": 0.15
  },
  {
   "name": "TN PWD SOR fly ash brick",
   "spec": "TN PWD SOR 2025-26 Vol I: 230 x 110 x 75 mm, ₹6,795 per 1000, ex-GST",
   "rate": 6.8
  },
  {
   "name": "TN PWD SOR chamber burnt brick",
   "spec": "TN PWD SOR 2025-26 Vol I: 9 x 4.5 x 3 inch, ex-GST",
   "rate": 7.89
  },
  {
   "name": "CPWD fly ash bricks (FPS, class 7.5)",
   "spec": "CPWD DAR 2023 item 7008: ₹4,770 per 1000 (Delhi, 01.04.2023, ex-GST)",
   "rate": 4.77
  },
  {
   "name": "CPWD burnt clay modular bricks (class 12.5)",
   "spec": "CPWD DAR 2023 item 1986: ₹5,450 per 1000 (Delhi, 01.04.2023, ex-GST)",
   "rate": 5.45
  }
 ],
 "sheet": [
  {
   "name": "GI corrugated",
   "spec": "Basic roofing, 0.5 mm",
   "rate": 520
  },
  {
   "name": "Colour-coated profile",
   "spec": "Industrial, 0.5 mm",
   "rate": 620
  },
  {
   "name": "PUF insulated panel",
   "spec": "Cold rooms, thermal",
   "rate": 1400
  },
  {
   "name": "Polycarbonate",
   "spec": "Skylights, translucent",
   "rate": 900
  },
  {
   "name": "Truss with Galvalume sheet",
   "spec": "Industrial roof: 0.5 mm Galvalume (AZ150) sheet on purlins and bracing. Truss steel is in the Steel frame item",
   "rate": 560,
   "factor": 1,
   "bundle": {
    "m": [
     [
      "str",
      7
     ]
    ],
    "l": [
     [
      "mech",
      0.3
     ]
    ]
   }
  },
  {
   "name": "RCC concrete roof (150 mm slab)",
   "spec": "Cast-in-place roof slab, no sheeting. Concrete, steel and formwork are listed separately",
   "rate": 0,
   "factor": 0,
   "bundle": {
    "rep": 1,
    "m": [
     [
      "cem",
      1.2
     ],
     [
      "sand",
      0.063
     ],
     [
      "agg",
      0.126
     ],
     [
      "steel",
      15
     ],
     [
      "fply",
      2.15
     ],
     [
      "wood",
      0.06
     ]
    ],
    "l": [
     [
      "civil",
      1.8
     ]
    ]
   }
  },
  {
   "name": "Truss with colour-coated sheet",
   "spec": "Industrial roof: 0.5 mm colour-coated sheet on purlins and bracing",
   "rate": 620,
   "factor": 1,
   "bundle": {
    "m": [
     [
      "str",
      7
     ]
    ],
    "l": [
     [
      "mech",
      0.3
     ]
    ]
   }
  },
  {
   "name": "Truss with PUF insulated panel",
   "spec": "Insulated roof panels on purlins, for cold storage and clean rooms",
   "rate": 1400,
   "factor": 1,
   "bundle": {
    "m": [
     [
      "str",
      7
     ]
    ],
    "l": [
     [
      "mech",
      0.3
     ]
    ]
   }
  },
  {
   "name": "Truss with fibre cement sheet",
   "spec": "Asbestos-free fibre cement sheet on purlins, low cost",
   "rate": 420,
   "factor": 1,
   "bundle": {
    "m": [
     [
      "str",
      7
     ]
    ],
    "l": [
     [
      "mech",
      0.3
     ]
    ]
   }
  },
  {
   "name": "CPWD fibre cement corrugated sheet 6 mm",
   "spec": "CPWD DAR 2023 item 0223: ₹245 per m² (Delhi, 01.04.2023, ex-GST)",
   "rate": 245
  }
 ],
 "tile": [
  {
   "name": "Ceramic tile",
   "spec": "Walls and light floors",
   "rate": 380
  },
  {
   "name": "Vitrified tile",
   "spec": "Standard floors",
   "rate": 520
  },
  {
   "name": "Granite",
   "spec": "Premium floors",
   "rate": 1100
  },
  {
   "name": "Kota stone",
   "spec": "Industrial, durable",
   "rate": 450
  },
  {
   "name": "CPWD vitrified tile 60 x 60",
   "spec": "CPWD DAR 2023 item 2752: double charge, ₹476 per m² (Delhi, 01.04.2023, ex-GST)",
   "rate": 476
  },
  {
   "name": "CPWD Kota stone 20-25 mm",
   "spec": "CPWD DAR 2023 item 1168: ₹320 per m² (Delhi, 01.04.2023, ex-GST)",
   "rate": 320
  },
  {
   "name": "CPWD flamed granite 18 mm",
   "spec": "CPWD DAR 2023 item 1239: ₹1,200 per m² (Delhi, 01.04.2023, ex-GST)",
   "rate": 1200
  }
 ],
 "wire": [
  {
   "name": "1.5 mm² FRLS copper",
   "spec": "Lighting points",
   "rate": 26
  },
  {
   "name": "2.5 mm² FRLS copper",
   "spec": "Sockets and power points",
   "rate": 42
  },
  {
   "name": "4 mm² FRLS copper",
   "spec": "AC and heavy points",
   "rate": 64
  },
  {
   "name": "6 mm² FRLS copper",
   "spec": "Geysers and sub-mains",
   "rate": 96
  }
 ],
 "sw": [
  {
   "name": "Basic modular",
   "spec": "6 A switch, plastic plate",
   "rate": 90
  },
  {
   "name": "Standard modular",
   "spec": "Branded, 10 to 16 A",
   "rate": 150
  },
  {
   "name": "Premium modular",
   "spec": "Glass or metal plate",
   "rate": 320
  },
  {
   "name": "Industrial IP65",
   "spec": "Weatherproof, 16 to 32 A",
   "rate": 750
  }
 ],
 "pnl": [
  {
   "name": "6-way DB",
   "spec": "Single-phase, with MCBs",
   "rate": 3500
  },
  {
   "name": "12-way TPN DB",
   "spec": "Three-phase, with MCBs",
   "rate": 8500
  },
  {
   "name": "MCCB panel",
   "spec": "Sub-main, 63 to 250 A",
   "rate": 22000
  }
 ],
 "pipe": [
  {
   "name": "UPVC pipe",
   "spec": "Cold water, 25 mm",
   "rate": 150
  },
  {
   "name": "CPVC pipe",
   "spec": "Hot and cold water, 25 mm",
   "rate": 260
  },
  {
   "name": "PPR pipe",
   "spec": "Hot and cold, fused joints",
   "rate": 210
  },
  {
   "name": "GI pipe",
   "spec": "Fire fighting, heavy duty",
   "rate": 420
  },
  {
   "name": "HDPE pipe",
   "spec": "Underground, flexible",
   "rate": 120
  },
  {
   "name": "SWR drainage pipe",
   "spec": "110 mm soil and waste",
   "rate": 280
  },
  {
   "name": "CPWD GI pipe 25 mm",
   "spec": "CPWD DAR 2023 item 1547: ₹197 per metre (Delhi, 01.04.2023, ex-GST)",
   "rate": 197
  },
  {
   "name": "CPWD GI pipe 20 mm",
   "spec": "CPWD DAR 2023 item 1546: ₹139 per metre (Delhi, 01.04.2023, ex-GST)",
   "rate": 139
  }
 ],
 "fix": [
  {
   "name": "Basic set",
   "spec": "Washbasin, WC, taps",
   "rate": 2800
  },
  {
   "name": "Standard set",
   "spec": "Branded ceramic fittings",
   "rate": 5500
  },
  {
   "name": "Premium set",
   "spec": "Wall-hung, sensor taps",
   "rate": 11000
  }
 ],
 "duct": [
  {
   "name": "GI sheet duct",
   "spec": "Standard, fabricated",
   "rate": 320
  },
  {
   "name": "Aluminium duct",
   "spec": "Light, corrosion free",
   "rate": 480
  },
  {
   "name": "Pre-insulated PIR duct",
   "spec": "Thermal, low leakage",
   "rate": 650
  }
 ],
 "paint": [
  {
   "name": "Distemper",
   "spec": "Low-cost interiors",
   "rate": 120
  },
  {
   "name": "Acrylic emulsion",
   "spec": "Standard interior and exterior",
   "rate": 280
  },
  {
   "name": "Premium emulsion",
   "spec": "Washable, durable",
   "rate": 420
  },
  {
   "name": "Epoxy",
   "spec": "Industrial floors and walls",
   "rate": 520
  },
  {
   "name": "CPWD acrylic emulsion",
   "spec": "CPWD DAR 2023 item 0803: ₹105 per litre (Delhi, 01.04.2023, ex-GST)",
   "rate": 105
  },
  {
   "name": "CPWD premium acrylic emulsion",
   "spec": "CPWD DAR 2023 item 0804: ₹210 per litre (Delhi, 01.04.2023, ex-GST)",
   "rate": 210
  },
  {
   "name": "CPWD exterior acrylic paint",
   "spec": "CPWD DAR 2023 item 0836: ₹300 per litre (Delhi, 01.04.2023, ex-GST)",
   "rate": 300
  },
  {
   "name": "CPWD synthetic enamel paint",
   "spec": "CPWD DAR 2023 item 0834: ₹178 per litre (Delhi, 01.04.2023, ex-GST)",
   "rate": 178
  }
 ],
 "wood": [
  {
   "name": "Teak (Indian plantation)",
   "spec": "Premium frames and joinery, termite resistant",
   "rate": 6000
  },
  {
   "name": "Teak (imported)",
   "spec": "Frames and joinery, uniform grain",
   "rate": 4000
  },
  {
   "name": "Sal wood",
   "spec": "Heavy frames, beams, door frames",
   "rate": 3200
  },
  {
   "name": "Country hardwood (neem, mango, vengai)",
   "spec": "General frames, props, shuttering battens",
   "rate": 1900
  },
  {
   "name": "Rubber wood (treated)",
   "spec": "Furniture, panelling, light frames",
   "rate": 1200
  },
  {
   "name": "Pine / softwood",
   "spec": "Formwork battens, light framing",
   "rate": 1000
  },
  {
   "name": "CPWD first class teak (scantling)",
   "spec": "CPWD DAR 2023 item 1187: ₹880 per 10 cudm (Delhi, 01.04.2023, ex-GST)",
   "rate": 2492
  },
  {
   "name": "CPWD sal wood (scantling)",
   "spec": "CPWD DAR 2023 item 1199: ₹600 per 10 cudm (Delhi, 01.04.2023, ex-GST)",
   "rate": 1699
  },
  {
   "name": "CPWD hollock wood (scantling)",
   "spec": "CPWD DAR 2023 item 2466: ₹366 per 10 cudm (Delhi, 01.04.2023, ex-GST)",
   "rate": 1036
  },
  {
   "name": "CPWD kail wood 2nd class (scantling)",
   "spec": "CPWD DAR 2023 item 1197: ₹260 per 10 cudm (Delhi, 01.04.2023, ex-GST)",
   "rate": 736
  }
 ],
 "fply": [
  {
   "name": "Film-faced shuttering ply 12 mm",
   "spec": "Reusable formwork, smooth finish",
   "rate": 70
  },
  {
   "name": "Film-faced shuttering ply 18 mm",
   "spec": "Heavy-duty formwork, more reuses",
   "rate": 95
  },
  {
   "name": "Commercial plywood 12 mm (MR)",
   "spec": "Low-cost formwork, fewer reuses",
   "rate": 60
  },
  {
   "name": "CPWD commercial ply 12 mm",
   "spec": "CPWD DAR 2023 item 2413: ₹527 per m² (Delhi, 01.04.2023, ex-GST)",
   "rate": 49
  }
 ],
 "ply": [
  {
   "name": "Commercial plywood 19 mm (MR)",
   "spec": "Interior, dry areas",
   "rate": 85
  },
  {
   "name": "BWR plywood 19 mm",
   "spec": "Kitchens and damp areas",
   "rate": 115
  },
  {
   "name": "BWP / marine plywood 19 mm",
   "spec": "Wet areas and exterior",
   "rate": 150
  },
  {
   "name": "Block board 19 mm",
   "spec": "Doors, tables, shelves",
   "rate": 80
  },
  {
   "name": "MDF 18 mm",
   "spec": "Painted panels, interior",
   "rate": 70
  },
  {
   "name": "HDHMR board 18 mm",
   "spec": "Moisture-resistant interior",
   "rate": 110
  },
  {
   "name": "Particle board 18 mm",
   "spec": "Low-cost dry interior",
   "rate": 55
  },
  {
   "name": "CPWD commercial ply 12 mm",
   "spec": "CPWD DAR 2023 item 2413: ₹527 per m² (Delhi, 01.04.2023, ex-GST)",
   "rate": 49
  },
  {
   "name": "CPWD block board 18 mm",
   "spec": "CPWD DAR 2023 item 2414: ₹792 per m² (Delhi, 01.04.2023, ex-GST)",
   "rate": 73.6
  },
  {
   "name": "CPWD BWP marine ply 19 mm (laminated)",
   "spec": "CPWD DAR 2023 item 2498: ₹1,492 per m² (Delhi, 01.04.2023, ex-GST)",
   "rate": 138.6
  },
  {
   "name": "CPWD MDF 18 mm (laminated)",
   "spec": "CPWD DAR 2023 item 2485: ₹621 per m² (Delhi, 01.04.2023, ex-GST)",
   "rate": 57.7
  },
  {
   "name": "CPWD particle board 18 mm",
   "spec": "CPWD DAR 2023 item 7055: ₹469 per m² (Delhi, 01.04.2023, ex-GST)",
   "rate": 43.6
  }
 ]
};
