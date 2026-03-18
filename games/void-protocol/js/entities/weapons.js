// VOID PROTOCOL — Weapon Definitions

export const weapons = [
    { name: 'PISTOL',  dmg: 8,  rate: 0.3,  ammo: Infinity, auto: false, spread: 0.02, projSpd: 800,  projLife: 0.6,  color: '#ff0', type: 'bullet', pellets: 1, range: 500, pierce: false },
    { name: 'SMG',     dmg: 10, rate: 0.08, ammo: 250,      auto: true,  spread: 0.08, projSpd: 750,  projLife: 0.5,  color: '#ff4', type: 'bullet', pellets: 1, range: 400, pierce: false },
    { name: 'SHOTGUN', dmg: 7,  rate: 0.6,  ammo: 24,       auto: false, spread: 0.15, projSpd: 700,  projLife: 0.35, color: '#fa0', type: 'bullet', pellets: 8, range: 250, pierce: false },
    { name: 'PLASMA',  dmg: 22, rate: 0.35, ammo: 60,       auto: true,  spread: 0.03, projSpd: 500,  projLife: 0.8,  color: '#4af', type: 'plasma', pellets: 1, range: 400, pierce: false, splash: 40 },
    { name: 'FLAMER',  dmg: 5,  rate: 0.03, ammo: 200,      auto: true,  spread: 0.2,  projSpd: 350,  projLife: 0.25, color: '#f80', type: 'flame', pellets: 1, range: 150, pierce: false },
    { name: 'RAILGUN', dmg: 55, rate: 1.2,  ammo: 10,       auto: false, spread: 0,    projSpd: 9999, projLife: 0.01, color: '#fff', type: 'rail',  pellets: 1, range: 800, pierce: true }
];

// Weapon flashlight tint colors: {r,g,b} for each weapon index
export const weaponLightColors = [
    { r: 255, g: 240, b: 120 }, // PISTOL - yellow
    { r: 255, g: 230, b: 140 }, // SMG - warm yellow
    { r: 255, g: 180, b: 60 },  // SHOTGUN - orange
    { r: 80,  g: 160, b: 255 }, // PLASMA - blue
    { r: 255, g: 140, b: 30 },  // FLAMER - deep orange
    { r: 255, g: 255, b: 255 }  // RAILGUN - white
];
