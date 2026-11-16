// Work-item multipliers per project type, keyed by work-item id (a missing id means 1).
export const TYPE_MULT = {
 "shed": {
  "4": 1,
  "5": 0,
  "6": 0.4,
  "8": 1,
  "9": 0.6,
  "10": 0.3,
  "11": 0.05,
  "12": 0.5,
  "14": 0
 },
 "factory": {
  "4": 0.7,
  "5": 0.5,
  "6": 0.6,
  "9": 1.2,
  "10": 0.6,
  "11": 0.4,
  "12": 0.8,
  "14": 0.05
 },
 "home": {
  "4": 0,
  "5": 1,
  "6": 1.2,
  "7": 0.2,
  "8": 0.2,
  "9": 1.5,
  "10": 2,
  "11": 0.15,
  "12": 1.5,
  "14": 1
 },
 "manuf": {
  "3": 1.3,
  "4": 0.9,
  "5": 0.3,
  "6": 0.5,
  "9": 1.5,
  "10": 0.5,
  "11": 0.3,
  "12": 0.6,
  "14": 0
 },
 "heavy": {
  "1": 1.3,
  "2": 1.5,
  "3": 2,
  "4": 1.3,
  "5": 0.5,
  "6": 0.3,
  "9": 2.5,
  "10": 0.6,
  "11": 0.4,
  "12": 0.4,
  "13": 1.2,
  "14": 0
 },
 "food": {
  "4": 0.8,
  "5": 0.4,
  "6": 0.7,
  "7": 1.2,
  "8": 1.5,
  "9": 1.5,
  "10": 1.2,
  "11": 2.5,
  "12": 1.2,
  "14": 0.05
 },
 "textile": {
  "4": 0.8,
  "5": 0.2,
  "6": 0.5,
  "9": 1.3,
  "10": 0.8,
  "11": 1,
  "12": 0.8,
  "14": 0
 },
 "pharma": {
  "4": 0.5,
  "5": 0.8,
  "6": 1,
  "8": 1.8,
  "9": 2,
  "10": 1.5,
  "11": 4,
  "12": 1.5,
  "14": 0.1
 },
 "chem": {
  "3": 1.8,
  "4": 1,
  "5": 0.6,
  "6": 0.4,
  "9": 2,
  "10": 1.8,
  "11": 0.8,
  "12": 0.7,
  "14": 0
 },
 "semi": {
  "1": 1.3,
  "3": 1.6,
  "4": 0.6,
  "5": 1,
  "6": 0.8,
  "8": 2,
  "9": 3.5,
  "10": 2,
  "11": 5,
  "12": 1.5,
  "13": 1.2,
  "14": 0
 },
 "ev": {
  "3": 1.3,
  "4": 1,
  "5": 0.4,
  "6": 0.5,
  "8": 1.4,
  "9": 2.5,
  "10": 0.8,
  "11": 2.5,
  "12": 0.7,
  "14": 0
 },
 "dc": {
  "3": 1.3,
  "4": 0.4,
  "5": 0.9,
  "6": 0.7,
  "8": 1.2,
  "9": 4,
  "10": 0.4,
  "11": 4,
  "12": 0.8,
  "14": 0
 },
 "pwr": {
  "3": 1.4,
  "4": 0.2,
  "5": 0.8,
  "6": 0.6,
  "9": 4,
  "10": 0.2,
  "11": 0.5,
  "12": 0.5,
  "14": 0
 },
 "wh": {
  "4": 1,
  "5": 0,
  "6": 0.2,
  "9": 0.5,
  "10": 0.2,
  "11": 0.05,
  "12": 0.3,
  "14": 0
 },
 "cold": {
  "4": 0.8,
  "5": 0.3,
  "6": 0.5,
  "7": 1.3,
  "8": 1.5,
  "9": 1.5,
  "10": 0.5,
  "11": 3,
  "12": 0.6,
  "14": 0
 },
 "office": {
  "4": 0.1,
  "5": 1,
  "6": 1,
  "8": 1.2,
  "9": 1.5,
  "10": 1.5,
  "11": 1.2,
  "12": 1.5,
  "14": 1
 },
 "gcc": {
  "1": 1.3,
  "3": 1.2,
  "4": 0.1,
  "5": 1.1,
  "6": 0.8,
  "8": 1.4,
  "9": 2,
  "10": 1.6,
  "11": 1.8,
  "12": 1.8,
  "13": 1.2,
  "14": 1.2
 },
 "mall": {
  "1": 1.2,
  "3": 1.2,
  "4": 0.3,
  "5": 1,
  "6": 0.7,
  "8": 1.6,
  "9": 2,
  "10": 1.3,
  "11": 2.2,
  "12": 1.4,
  "13": 1.1,
  "14": 0.5
 },
 "hotel": {
  "4": 0,
  "5": 1,
  "6": 1.1,
  "8": 1.5,
  "9": 2,
  "10": 3,
  "11": 2,
  "12": 2,
  "14": 1.6
 },
 "villa": {
  "4": 0,
  "5": 1,
  "6": 1.3,
  "7": 0.3,
  "9": 1.4,
  "10": 2,
  "11": 0.2,
  "12": 1.8,
  "14": 1.4
 },
 "apt": {
  "1": 1.3,
  "3": 1.5,
  "4": 0,
  "5": 1.2,
  "6": 1,
  "7": 0.2,
  "9": 1.5,
  "10": 2.5,
  "11": 0.1,
  "12": 1.4,
  "13": 1.2,
  "14": 1.2
 },
 "afford": {
  "4": 0,
  "5": 0.9,
  "6": 1,
  "7": 0.2,
  "9": 1,
  "10": 1.5,
  "11": 0,
  "12": 0.8,
  "14": 0.6
 },
 "hostel": {
  "4": 0,
  "5": 1,
  "6": 1,
  "7": 0.2,
  "9": 1.2,
  "10": 2.5,
  "11": 0.1,
  "12": 1,
  "14": 0.8
 },
 "hospital": {
  "4": 0,
  "5": 1,
  "6": 1.2,
  "8": 1.5,
  "9": 2,
  "10": 3,
  "11": 2.5,
  "12": 1.5,
  "14": 0.8
 },
 "school": {
  "4": 0,
  "5": 1,
  "6": 1,
  "7": 0.2,
  "9": 1.2,
  "10": 1.2,
  "11": 0.1,
  "12": 1.2,
  "14": 0.6
 },
 "civic": {
  "4": 0,
  "5": 0.8,
  "6": 1.3,
  "7": 0.3,
  "9": 1,
  "10": 0.8,
  "11": 0.2,
  "12": 1.3,
  "14": 0.4
 },
 "carpark": {
  "1": 1.2,
  "3": 1.3,
  "4": 0,
  "5": 1.4,
  "6": 0.1,
  "9": 0.5,
  "10": 0.1,
  "11": 0.1,
  "12": 0.3,
  "14": 0
 },
 "transit": {
  "1": 1.3,
  "3": 1.3,
  "4": 1,
  "5": 1,
  "6": 0.5,
  "8": 1.8,
  "9": 2.5,
  "10": 1.5,
  "11": 2,
  "12": 1.5,
  "13": 1.2,
  "14": 0
 },
 "custom": {
  "14": 1
 }
};
export const TYPE_GROUPS = [
 {
  "label": "Industrial and manufacturing",
  "options": [
   [
    "shed",
    "Industrial shed"
   ],
   [
    "manuf",
    "Manufacturing plant (engineering, assembly)"
   ],
   [
    "heavy",
    "Heavy industry (steel, foundry, cement)"
   ],
   [
    "food",
    "Food processing unit"
   ],
   [
    "textile",
    "Textile and garment unit"
   ],
   [
    "pharma",
    "Pharma and clean-room facility"
   ],
   [
    "chem",
    "Chemical and process plant"
   ],
   [
    "factory",
    "Multi-storey factory"
   ]
  ]
 },
 {
  "label": "Technology and energy",
  "options": [
   [
    "semi",
    "Semiconductor and electronics fab"
   ],
   [
    "ev",
    "EV and battery manufacturing plant"
   ],
   [
    "dc",
    "Data centre"
   ],
   [
    "pwr",
    "Energy storage and substation building"
   ]
  ]
 },
 {
  "label": "Warehousing and cold chain",
  "options": [
   [
    "wh",
    "Warehouse and logistics park"
   ],
   [
    "cold",
    "Cold storage and cold chain facility"
   ]
  ]
 },
 {
  "label": "Commercial and hospitality",
  "options": [
   [
    "office",
    "Commercial or office building"
   ],
   [
    "gcc",
    "IT park or GCC office (Grade A)"
   ],
   [
    "mall",
    "Retail mall or shopping complex"
   ],
   [
    "hotel",
    "Hotel or resort"
   ]
  ]
 },
 {
  "label": "Residential",
  "options": [
   [
    "home",
    "Residential building"
   ],
   [
    "villa",
    "Individual house or villa"
   ],
   [
    "apt",
    "Apartment block or high-rise"
   ],
   [
    "afford",
    "Affordable housing"
   ],
   [
    "hostel",
    "Hostel or student housing"
   ]
  ]
 },
 {
  "label": "Institutional and public",
  "options": [
   [
    "hospital",
    "Hospital"
   ],
   [
    "school",
    "School or college"
   ],
   [
    "civic",
    "Public building, community hall or temple"
   ]
  ]
 },
 {
  "label": "Transport and parking",
  "options": [
   [
    "carpark",
    "Multi-level car park"
   ],
   [
    "transit",
    "Transit station or terminal"
   ]
  ]
 },
 {
  "label": "Other",
  "options": [
   [
    "custom",
    "Custom (all work items at full quantity; edit them below)"
   ]
  ]
 }
];
