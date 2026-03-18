// VOID PROTOCOL — Room Population (Pickups & Enemies)

import {
  T, DIFF,
  ROOM_START, ROOM_EXIT, ROOM_SERVER, ROOM_ARMORY, ROOM_STORAGE, ROOM_BOSS, ROOM_PATROL,
  EN_SCOUT, EN_SENTINEL, EN_HEAVY, EN_COMMANDER
} from '../core/constants.js';
import * as S from '../core/state.js';
import { set } from '../core/state.js';
import { isFloorTile } from './generator.js';

// Weapon definitions (needed for ammo pickup amounts)
// TODO: Import from weapons module once extracted
const weapons = [
  { name: 'PISTOL', dmg: 8, rate: 0.3, ammo: Infinity, auto: false, spread: 0.02, projSpd: 800, projLife: 0.6, color: '#ff0', type: 'bullet', pellets: 1, range: 500, pierce: false },
  { name: 'SMG', dmg: 10, rate: 0.08, ammo: 250, auto: true, spread: 0.08, projSpd: 750, projLife: 0.5, color: '#ff4', type: 'bullet', pellets: 1, range: 400, pierce: false },
  { name: 'SHOTGUN', dmg: 7, rate: 0.6, ammo: 24, auto: false, spread: 0.15, projSpd: 700, projLife: 0.35, color: '#fa0', type: 'bullet', pellets: 8, range: 250, pierce: false },
  { name: 'PLASMA', dmg: 22, rate: 0.35, ammo: 60, auto: true, spread: 0.03, projSpd: 500, projLife: 0.8, color: '#4af', type: 'plasma', pellets: 1, range: 400, pierce: false, splash: 40 },
  { name: 'FLAMER', dmg: 5, rate: 0.03, ammo: 200, auto: true, spread: 0.2, projSpd: 350, projLife: 0.25, color: '#f80', type: 'flame', pellets: 1, range: 150, pierce: false },
  { name: 'RAILGUN', dmg: 55, rate: 1.2, ammo: 10, auto: false, spread: 0, projSpd: 9999, projLife: 0.01, color: '#fff', type: 'rail', pellets: 1, range: 800, pierce: true }
];

export function isInRoom(x, y, room) {
  return x >= room.x && x < room.x + room.w && y >= room.y && y < room.y + room.h;
}

export function placePickups(lvl) {
  set('pickups', []);
  // Keycards
  let sr = S.rooms.find(r => r.type === ROOM_SERVER);
  let armory = S.rooms.find(r => r.type === ROOM_ARMORY);
  let storage = S.rooms.find(r => r.type === ROOM_STORAGE);
  let patrolRooms = S.rooms.filter(r => r.type === ROOM_PATROL);

  // Blue keycard in a patrol room or storage
  let bkRoom = patrolRooms.length > 0 ? patrolRooms[0] : (storage || S.rooms[Math.min(2, S.rooms.length - 1)]);
  S.pickups.push({ x: bkRoom.cx * T + T / 2, y: bkRoom.cy * T + T / 2, type: 'keycard', subtype: 'blue', collected: false });

  // Red keycard if lvl>=2
  if (lvl >= 2) {
    let rkRoom = patrolRooms.length > 1 ? patrolRooms[1] : (armory || bkRoom);
    S.pickups.push({ x: rkRoom.cx * T + T / 2, y: (rkRoom.cy + 1) * T + T / 2, type: 'keycard', subtype: 'red', collected: false });
  }
  // Gold keycard if lvl>=3
  if (lvl >= 3) {
    let gkRoom = patrolRooms.length > 2 ? patrolRooms[2] : (storage || bkRoom);
    S.pickups.push({ x: (gkRoom.cx + 1) * T + T / 2, y: gkRoom.cy * T + T / 2, type: 'keycard', subtype: 'gold', collected: false });
  }

  // Health + armor + ammo in armory
  if (armory) {
    S.pickups.push({ x: (armory.cx - 1) * T + T / 2, y: armory.cy * T + T / 2, type: 'health', amount: 40, collected: false });
    S.pickups.push({ x: (armory.cx + 1) * T + T / 2, y: armory.cy * T + T / 2, type: 'armor', amount: 30, collected: false });
    S.pickups.push({ x: armory.cx * T + T / 2, y: (armory.cy + 1) * T + T / 2, type: 'ammo', weaponIdx: 2, amount: 12, collected: false });
    S.pickups.push({ x: armory.cx * T + T / 2, y: (armory.cy - 1) * T + T / 2, type: 'ammo', weaponIdx: 3, amount: 20, collected: false });
  }

  // Scatter pickups in patrol rooms (FIXED: weaponIdx 1-5, not 0)
  for (let pr of patrolRooms) {
    if (Math.random() < 0.6) {
      S.pickups.push({ x: (pr.cx + 1) * T + T / 2, y: (pr.cy + 1) * T + T / 2, type: 'health', amount: 20, collected: false });
    }
    if (Math.random() < 0.4) {
      let wIdx = 1 + Math.floor(Math.random() * 5);
      S.pickups.push({ x: (pr.cx - 1) * T + T / 2, y: (pr.cy - 1) * T + T / 2, type: 'ammo', weaponIdx: wIdx, amount: Math.floor(weapons[wIdx].ammo * 0.15), collected: false });
    }
  }

  // Weapon pickups
  if (storage) {
    S.pickups.push({ x: storage.cx * T + T / 2, y: storage.cy * T + T / 2, type: 'weapon', weaponIdx: 1 + Math.floor(Math.random() * 3), collected: false });
  }
  if (patrolRooms.length > 2) {
    let wr = patrolRooms[patrolRooms.length - 1];
    S.pickups.push({ x: wr.cx * T + T / 2, y: wr.cy * T + T / 2, type: 'weapon', weaponIdx: 3 + Math.floor(Math.random() * 3), collected: false });
  }
}

export function placeEnemies(lvl) {
  set('enemies', []);
  let diff = DIFF[S.difficulty];
  for (let room of S.rooms) {
    if (room.type === ROOM_START) continue;
    let count = 0;
    let types = [];
    switch (room.type) {
      case ROOM_PATROL:
        count = 2 + Math.floor(Math.random() * 3) + lvl + S.difficulty;
        types = [EN_SCOUT, EN_SCOUT, EN_SENTINEL];
        if (lvl >= 2) types.push(EN_HEAVY);
        if (S.difficulty >= 2) types.push(EN_SENTINEL);
        break;
      case ROOM_SERVER:
        count = 3 + lvl;
        types = [EN_SENTINEL, EN_SENTINEL, EN_SCOUT];
        break;
      case ROOM_ARMORY:
        count = 2 + lvl;
        types = [EN_SCOUT, EN_HEAVY];
        break;
      case ROOM_STORAGE:
        count = 1 + lvl;
        types = [EN_SCOUT, EN_SENTINEL];
        break;
      case ROOM_BOSS:
        count = 2 + lvl;
        types = [EN_SCOUT, EN_SENTINEL];
        // Commander
        S.enemies.push(createEnemy(room.cx * T + T / 2, room.cy * T + T / 2, EN_COMMANDER, diff, room));
        break;
      case ROOM_EXIT:
        count = 1;
        types = [EN_SCOUT];
        break;
    }
    for (let i = 0; i < count; i++) {
      let ex = room.x + 1 + Math.floor(Math.random() * (room.w - 2));
      let ey = room.y + 1 + Math.floor(Math.random() * (room.h - 2));
      if (isFloorTile(S.map[ey * S.mapW + ex])) {
        let type = types[Math.floor(Math.random() * types.length)];
        S.enemies.push(createEnemy(ex * T + T / 2, ey * T + T / 2, type, diff, room));
      }
    }
  }
}

export function createEnemy(x, y, type, diff, room) {
  const stats = [
    { hp: 12, spd: 110, dmg: 8, size: 10, react: 0.8, range: 30, ranged: false, name: 'SCOUT' },
    { hp: 28, spd: 70, dmg: 12, size: 14, react: 1.2, range: 250, ranged: true, name: 'SENTINEL' },
    { hp: 70, spd: 40, dmg: 20, size: 20, react: 1.5, range: 40, ranged: false, name: 'HEAVY' },
    { hp: 400, spd: 55, dmg: 15, size: 24, react: 1.0, range: 300, ranged: true, name: 'COMMANDER' }
  ];
  let s = stats[type];
  let e = {
    x, y, type, room,
    hp: Math.round(s.hp * diff.hpMul),
    maxHp: Math.round(s.hp * diff.hpMul),
    spd: s.spd,
    dmg: Math.round(s.dmg * diff.dmgMul),
    size: s.size,
    react: s.react * diff.reactMul,
    range: s.range,
    ranged: s.ranged,
    name: s.name,
    alive: true,
    alert: false,
    alertTimer: 0,
    attackCD: 0,
    angle: Math.random() * Math.PI * 2,
    patrolAngle: Math.random() * Math.PI * 2,
    patrolTimer: 0,
    hitFlash: 0,
    vx: 0, vy: 0,
    walkCycle: Math.random() * Math.PI * 2
  };
  if (type === EN_HEAVY) {
    e.chargeCD = 4 + Math.random() * 2;
    e.charging = false;
    e.chargeAngle = 0;
    e.chargeTimer = 0;
    e.chargeWindup = 0;
  }
  if (type === EN_SENTINEL) {
    e.windupTimer = 0;
    e.windupTarget = null;
  }
  if (type === EN_COMMANDER) {
    e.shieldHp = 100;
    e.maxShield = 100;
    e.spawnCD = 5;
    e.maxSpawnCD = 5;
    e.spawnCount = 0;
    e.teleportCD = 8 + Math.random() * 4;
  }
  return e;
}
