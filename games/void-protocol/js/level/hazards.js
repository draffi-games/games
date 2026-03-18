// VOID PROTOCOL — Hazards (Barrels, Toxic Pools, Secret Rooms, Collapse Walls)

import {
  T, TILE_VOID, TILE_WALL, TILE_FLOOR4,
  ROOM_START, ROOM_EXIT, ROOM_ARMORY, ROOM_STORAGE, ROOM_BOSS
} from '../core/constants.js';
import * as S from '../core/state.js';
import { set } from '../core/state.js';
import { isFloorTile } from './generator.js';

// --- Late-bound dependencies (set via registerHazardDeps) ---
// These functions come from combat/effects modules that may not be extracted yet.
let _SFX = null;
let _spawnSparks = null;
let _addDynamicLight = null;
let _addDecal = null;
let _damageEnemy = null;
let _damagePlayer = null;
let _addKillFeed = null;

export function registerHazardDeps({ SFX, spawnSparks, addDynamicLight, addDecal, damageEnemy, damagePlayer, addKillFeed }) {
  _SFX = SFX;
  _spawnSparks = spawnSparks;
  _addDynamicLight = addDynamicLight;
  _addDecal = addDecal;
  _damageEnemy = damageEnemy;
  _damagePlayer = damagePlayer;
  _addKillFeed = addKillFeed;
}

// ========== EXPLOSIVE BARRELS ==========
export function placeBarrels(lvl) {
  set('barrels', []);
  for (let room of S.rooms) {
    if (room.type === ROOM_START || room.type === ROOM_EXIT) continue;
    let count = room.type === ROOM_ARMORY ? 2 : room.type === ROOM_STORAGE ? 3 : Math.random() < 0.5 ? 1 : 0;
    count += Math.floor(lvl * 0.5);
    for (let i = 0; i < count; i++) {
      let bx = room.x + 1 + Math.floor(Math.random() * (room.w - 2));
      let by = room.y + 1 + Math.floor(Math.random() * (room.h - 2));
      if (isFloorTile(S.map[by * S.mapW + bx])) {
        S.barrels.push({ x: bx * T + T / 2, y: by * T + T / 2, hp: 15, alive: true, chainDelay: 0 });
      }
    }
  }
}

export function explodeBarrel(b) {
  if (!b.alive) return;
  b.alive = false;
  let radius = 80, dmg = 60;
  _SFX.explode();
  // Explosion visuals
  S.particles.push({ x: b.x, y: b.y, life: 0.3, maxLife: 0.3, type: 'flash', radius: 40, r: 255, g: 180, b: 50 });
  S.particles.push({ x: b.x, y: b.y, life: 0.5, maxLife: 0.5, type: 'shockwave', radius: 0, maxRadius: radius, r: 255, g: 100, b: 0 });
  _spawnSparks(b.x, b.y, 25, '#f80');
  _spawnSparks(b.x, b.y, 15, '#ff4');
  // Explosion dynamic light - bright orange flash that fades
  _addDynamicLight(b.x, b.y, 200, 255, 160, 40, 0.4);
  set('shakeMag', Math.max(S.shakeMag, 8));
  set('chromatic', Math.max(S.chromatic, 0.2));
  _addDecal(b.x, b.y, 'scorch', 12);
  for (let i = 0; i < 3; i++) _addDecal(b.x + (Math.random() - 0.5) * 30, b.y + (Math.random() - 0.5) * 30, 'scorch', 5 + Math.random() * 4);
  // Smoke particles
  for (let i = 0; i < 8; i++) {
    let a = Math.random() * Math.PI * 2, spd = 20 + Math.random() * 40;
    S.atmParticles.push({ x: b.x, y: b.y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd - 10,
      life: 1 + Math.random(), maxLife: 2, size: 8 + Math.random() * 8, type: 'smoke', alpha: 0.2 });
  }
  // Damage enemies
  for (let e of S.enemies) {
    if (!e.alive) continue;
    let dx = e.x - b.x, dy = e.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
    if (d < radius) { _damageEnemy(e, dmg * (1 - d / radius)) }
  }
  // Damage player
  let pdx = S.player.x - b.x, pdy = S.player.y - b.y, pd = Math.sqrt(pdx * pdx + pdy * pdy);
  if (pd < radius && S.player.alive) _damagePlayer(Math.round(dmg * (1 - pd / radius) * 0.6), b.x, b.y);
  // Chain reaction
  for (let ob of S.barrels) {
    if (!ob.alive || ob === b) continue;
    let dx = ob.x - b.x, dy = ob.y - b.y;
    if (Math.sqrt(dx * dx + dy * dy) < radius * 1.2) { ob.chainDelay = 0.1 + Math.random() * 0.15; }
  }
  _addKillFeed('BARREL EXPLODED');
}

// ========== TOXIC POOLS ==========
export function placeToxicPools(lvl) {
  set('toxicPools', []);
  for (let room of S.rooms) {
    if (room.type === ROOM_START || room.type === ROOM_EXIT) continue;
    let chance = room.type === ROOM_STORAGE ? 0.7 : room.type === ROOM_BOSS ? 0.5 : 0.2;
    if (Math.random() > chance) continue;
    let count = room.type === ROOM_STORAGE ? 2 + lvl : 1 + Math.floor(lvl * 0.5);
    for (let i = 0; i < count; i++) {
      let px = room.x + 2 + Math.floor(Math.random() * (room.w - 4));
      let py = room.y + 2 + Math.floor(Math.random() * (room.h - 4));
      if (isFloorTile(S.map[py * S.mapW + px])) {
        let radius = 16 + Math.random() * 12;
        S.toxicPools.push({ x: px * T + T / 2, y: py * T + T / 2, radius, phase: Math.random() * Math.PI * 2 });
      }
    }
  }
}

// ========== SECRET ROOM ==========
export function placeSecretRoom(lvl) {
  set('secretWalls', []);
  let storage = S.rooms.find(r => r.type === ROOM_STORAGE);
  if (!storage) return;
  // Try to place a 4x4 secret chamber adjacent to storage
  let dirs = [{ dx: 0, dy: 1 }, { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: -1, dy: 0 }];
  for (let dir of dirs) {
    let wallX = dir.dx > 0 ? storage.x + storage.w : dir.dx < 0 ? storage.x - 1 : storage.x + Math.floor(storage.w / 2);
    let wallY = dir.dy > 0 ? storage.y + storage.h : dir.dy < 0 ? storage.y - 1 : storage.y + Math.floor(storage.h / 2);
    let secX = wallX + dir.dx * 2;
    let secY = wallY + dir.dy * 2;
    // Check if secret room area is all void
    let canPlace = true;
    for (let sy = secY - 1; sy <= secY + 2; sy++) {
      for (let sx = secX - 1; sx <= secX + 2; sx++) {
        if (sx < 1 || sx >= S.mapW - 1 || sy < 1 || sy >= S.mapH - 1) { canPlace = false; break }
        if (S.map[sy * S.mapW + sx] !== TILE_VOID && S.map[sy * S.mapW + sx] !== TILE_WALL) { canPlace = false; break }
      }
      if (!canPlace) break;
    }
    if (!canPlace) continue;
    // Carve the secret chamber
    for (let sy = secY - 1; sy <= secY + 2; sy++) {
      for (let sx = secX - 1; sx <= secX + 2; sx++) {
        S.map[sy * S.mapW + sx] = TILE_FLOOR4;
      }
    }
    // Build walls around it
    for (let sy = secY - 2; sy <= secY + 3; sy++) {
      for (let sx = secX - 2; sx <= secX + 3; sx++) {
        if (sx < 0 || sx >= S.mapW || sy < 0 || sy >= S.mapH) continue;
        if (S.map[sy * S.mapW + sx] === TILE_VOID) {
          let adj = false;
          for (let dy2 = -1; dy2 <= 1; dy2++) {
            for (let dx2 = -1; dx2 <= 1; dx2++) {
              let nx = sx + dx2, ny = sy + dy2;
              if (nx >= 0 && nx < S.mapW && ny >= 0 && ny < S.mapH && isFloorTile(S.map[ny * S.mapW + nx])) adj = true;
            }
          }
          if (adj) S.map[sy * S.mapW + sx] = TILE_WALL;
        }
      }
    }
    // Mark the connecting wall as destructible
    if (wallX >= 0 && wallX < S.mapW && wallY >= 0 && wallY < S.mapH) {
      S.map[wallY * S.mapW + wallX] = TILE_WALL;
      S.secretWalls.push({ x: wallX, y: wallY, hp: 30, maxHp: 30 });
    }
    // Also make neighboring wall tile destructible for wider entrance
    let nwx = wallX + (dir.dy !== 0 ? 1 : 0), nwy = wallY + (dir.dx !== 0 ? 1 : 0);
    if (nwx >= 0 && nwx < S.mapW && nwy >= 0 && nwy < S.mapH && S.map[nwy * S.mapW + nwx] === TILE_WALL) {
      S.secretWalls.push({ x: nwx, y: nwy, hp: 30, maxHp: 30 });
    }
    // Place special loot in secret room
    let cx = secX * T + T / 2, cy = secY * T + T / 2;
    S.pickups.push({ x: cx, y: cy, type: 'weapon', weaponIdx: 5, collected: false }); // Railgun
    S.pickups.push({ x: cx - T, y: cy, type: 'health', amount: 50, collected: false });
    S.pickups.push({ x: cx + T, y: cy, type: 'armor', amount: 50, collected: false });
    S.pickups.push({ x: cx, y: cy + T, type: 'powerup', subtype: 'damage', collected: false });
    break;
  }
}

// ========== COLLAPSE WALLS ==========
export function placeCollapseWalls() {
  set('collapseWalls', []);
  // Find thin wall sections (wall tile with floor on opposite sides)
  let candidates = [];
  for (let y = 2; y < S.mapH - 2; y++) {
    for (let x = 2; x < S.mapW - 2; x++) {
      if (S.map[y * S.mapW + x] !== TILE_WALL) continue;
      // Horizontal thin wall: floor above AND below
      if (isFloorTile(S.map[(y - 1) * S.mapW + x]) && isFloorTile(S.map[(y + 1) * S.mapW + x])) {
        candidates.push({ x, y, dir: 'h' });
      }
      // Vertical thin wall: floor left AND right
      if (isFloorTile(S.map[y * S.mapW + x - 1]) && isFloorTile(S.map[y * S.mapW + x + 1])) {
        candidates.push({ x, y, dir: 'v' });
      }
    }
  }
  if (candidates.length < 3) return;
  // Pick a cluster of 2-3 adjacent candidates far from player start
  let sr = S.rooms.find(r => r.type === ROOM_START) || S.rooms[0];
  candidates.sort((a, b) => {
    let da = (a.x - sr.cx) ** 2 + (a.y - sr.cy) ** 2;
    let db = (b.x - sr.cx) ** 2 + (b.y - sr.cy) ** 2;
    return db - da;
  });
  // Pick from top candidates
  let picked = candidates[Math.floor(Math.random() * Math.min(5, candidates.length))];
  S.collapseWalls.push({ x: picked.x, y: picked.y });
  // Find adjacent walls in same direction
  for (let c of candidates) {
    if (c === picked) continue;
    let dx = Math.abs(c.x - picked.x), dy = Math.abs(c.y - picked.y);
    if (dx + dy <= 1 && S.collapseWalls.length < 3) {
      S.collapseWalls.push({ x: c.x, y: c.y });
    }
  }
}
