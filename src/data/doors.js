export const DOOR_TYPES = {
 "hw": {
  "name": "Hardwood (country wood)",
  "spec": "Solid hardwood frame and shutter",
  "rate": 1300,
  "cft": 0.09
 },
 "teak": {
  "name": "Teak wood",
  "spec": "Teak frame and shutter",
  "rate": 2200,
  "cft": 0.09
 },
 "flush": {
  "name": "Flush door (plywood, laminate)",
  "spec": "Flush shutter on hardwood frame",
  "rate": 400,
  "cft": 0.05
 },
 "upvc": {
  "name": "UPVC",
  "spec": "UPVC profile with glass, weather sealed",
  "rate": 650
 },
 "alu": {
  "name": "Aluminium",
  "spec": "Aluminium section, sliding or casement",
  "rate": 720
 },
 "steel": {
  "name": "Steel (MS)",
  "spec": "Mild steel frame and shutter",
  "rate": 520
 },
 "frp": {
  "name": "FRP / composite",
  "spec": "Fibre-reinforced plastic, moisture proof",
  "rate": 450
 },
 "glass": {
  "name": "Toughened glass",
  "spec": "Toughened glass door with fittings",
  "rate": 1100
 },
 "roller": {
  "name": "Roller shutter (MS)",
  "spec": "Rolling steel shutter with guides",
  "rate": 380
 }
};
export const DEFAULT_DOORS = [
 {
  "id": 1,
  "name": "Main entrance doors",
  "type": "hw",
  "n": 2,
  "w": 4,
  "h": 7,
  "rate": 0
 },
 {
  "id": 2,
  "name": "Internal doors",
  "type": "flush",
  "n": 10,
  "w": 3,
  "h": 7,
  "rate": 0
 },
 {
  "id": 3,
  "name": "Windows",
  "type": "upvc",
  "n": 20,
  "w": 4,
  "h": 4,
  "rate": 0
 },
 {
  "id": 4,
  "name": "Ventilators",
  "type": "alu",
  "n": 10,
  "w": 2,
  "h": 2,
  "rate": 0
 },
 {
  "id": 5,
  "name": "Roller shutters",
  "type": "roller",
  "n": 2,
  "w": 12,
  "h": 14,
  "rate": 0
 }
];
