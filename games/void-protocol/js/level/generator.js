// VOID PROTOCOL — Level Generation (BSP + MST corridors)

import {
  TILE_VOID, TILE_WALL, TILE_FLOOR, TILE_FLOOR2, TILE_FLOOR3, TILE_FLOOR4,
  TILE_DOOR_B, TILE_DOOR_R, TILE_DOOR_G, TILE_TERMINAL, TILE_EXIT,
  ROOM_START, ROOM_EXIT, ROOM_SERVER, ROOM_ARMORY, ROOM_STORAGE, ROOM_BOSS, ROOM_PATROL
} from '../core/constants.js';
import * as S from '../core/state.js';
import { set } from '../core/state.js';
import { placeDoor } from './doors.js';
import { placePickups, placeEnemies } from './rooms.js';
import { placeBarrels, placeToxicPools, placeSecretRoom, placeCollapseWalls } from './hazards.js';

// --- Tile classification helpers (used everywhere) ---
export function isFloorTile(t) { return t === TILE_FLOOR || t === TILE_FLOOR2 || t === TILE_FLOOR3 || t === TILE_FLOOR4 || t === TILE_TERMINAL || t === TILE_EXIT }
export function isWalkable(t) { return isFloorTile(t) }
export function isDoor(t) { return t === TILE_DOOR_B || t === TILE_DOOR_R || t === TILE_DOOR_G }

export function generateLevel(lvl) {
  const mW = 64 + lvl * 8;
  const mH = 64 + lvl * 8;
  set('mapW', mW);
  set('mapH', mH);
  set('map', new Array(mW * mH).fill(TILE_VOID));
  set('explored', new Array(mW * mH).fill(false));
  set('floorDetail', new Array(mW * mH).fill(null));
  set('rooms', []);
  set('decals', []);

  // After set(), S.map / S.rooms / S.floorDetail are live bindings to the new arrays

  // BSP
  let leaves = [];
  function splitBSP(x, y, w, h, depth) {
    if (depth <= 0 || w < 12 || h < 12 || (w < 16 && h < 16)) {
      leaves.push({ x, y, w, h });
      return;
    }
    let horiz = Math.random() > 0.5;
    if (w > h * 1.3) horiz = false;
    if (h > w * 1.3) horiz = true;
    if (horiz) {
      let split = y + 5 + Math.floor(Math.random() * (h - 10));
      splitBSP(x, y, w, split - y, depth - 1);
      splitBSP(x, split, w, h - (split - y), depth - 1);
    } else {
      let split = x + 5 + Math.floor(Math.random() * (w - 10));
      splitBSP(x, y, split - x, h, depth - 1);
      splitBSP(split, y, w - (split - x), h, depth - 1);
    }
  }

  let depth = lvl >= 3 ? 5 : 4;
  splitBSP(2, 2, mW - 4, mH - 4, depth);

  // Create rooms from leaves
  for (let leaf of leaves) {
    let rw = 5 + Math.floor(Math.random() * (leaf.w - 6));
    let rh = 5 + Math.floor(Math.random() * (leaf.h - 6));
    if (rw > leaf.w - 2) rw = leaf.w - 2;
    if (rh > leaf.h - 2) rh = leaf.h - 2;
    let rx = leaf.x + 1 + Math.floor(Math.random() * (leaf.w - rw - 1));
    let ry = leaf.y + 1 + Math.floor(Math.random() * (leaf.h - rh - 1));
    S.rooms.push({ x: rx, y: ry, w: rw, h: rh, cx: rx + Math.floor(rw / 2), cy: ry + Math.floor(rh / 2), type: ROOM_PATROL, connected: false, lightColor: null, enemies: [] });
  }

  // Assign room types
  S.rooms[0].type = ROOM_START;
  // find farthest room from start for exit
  let maxDist = 0, exitIdx = 1;
  for (let i = 1; i < S.rooms.length; i++) {
    let dx = S.rooms[i].cx - S.rooms[0].cx, dy = S.rooms[i].cy - S.rooms[0].cy;
    let d = dx * dx + dy * dy;
    if (d > maxDist) { maxDist = d; exitIdx = i; }
  }
  S.rooms[exitIdx].type = ROOM_EXIT;

  // Server room - medium distance
  let dists = S.rooms.map((r, i) => {
    let dx = r.cx - S.rooms[0].cx, dy = r.cy - S.rooms[0].cy;
    return { i, d: Math.sqrt(dx * dx + dy * dy) };
  }).sort((a, b) => a.d - b.d);
  let serverIdx = dists[Math.floor(dists.length * 0.5)].i;
  if (serverIdx === exitIdx) serverIdx = dists[Math.floor(dists.length * 0.4)].i;
  S.rooms[serverIdx].type = ROOM_SERVER;

  // Boss room on lvl 2+
  if (lvl >= 2) {
    let bossIdx = dists[Math.floor(dists.length * 0.7)].i;
    if (bossIdx === exitIdx || bossIdx === serverIdx) bossIdx = dists[Math.floor(dists.length * 0.6)].i;
    if (bossIdx !== 0 && bossIdx !== exitIdx && bossIdx !== serverIdx) S.rooms[bossIdx].type = ROOM_BOSS;
  }

  // Armory + storage
  let unassigned = S.rooms.filter((r, i) => r.type === ROOM_PATROL && i !== 0);
  if (unassigned.length > 0) { unassigned[0].type = ROOM_ARMORY }
  if (unassigned.length > 1) { unassigned[1].type = ROOM_STORAGE }

  // Room light colors
  for (let r of S.rooms) {
    switch (r.type) {
      case ROOM_SERVER: r.lightColor = 'rgba(0,200,100,0.12)'; break;
      case ROOM_ARMORY: r.lightColor = 'rgba(220,170,60,0.12)'; break;
      case ROOM_BOSS: r.lightColor = 'rgba(140,50,200,0.10)'; break;
      case ROOM_EXIT: r.lightColor = 'rgba(0,220,255,0.11)'; break;
      case ROOM_START: r.lightColor = 'rgba(100,200,255,0.08)'; break;
      default: r.lightColor = 'rgba(80,130,200,0.06)';
    }
  }

  // Carve rooms
  for (let r of S.rooms) {
    for (let yy = r.y; yy < r.y + r.h; yy++) {
      for (let xx = r.x; xx < r.x + r.w; xx++) {
        if (xx > 0 && xx < mW - 1 && yy > 0 && yy < mH - 1) {
          let variant = 0;
          if (r.type === ROOM_SERVER) variant = 2;
          else if (r.type === ROOM_ARMORY) variant = 1;
          else if (r.type === ROOM_BOSS) variant = 3;
          else variant = Math.random() > 0.7 ? Math.floor(Math.random() * 4) : 0;
          S.map[yy * mW + xx] = [TILE_FLOOR, TILE_FLOOR2, TILE_FLOOR3, TILE_FLOOR4][variant];
        }
      }
    }
  }

  // MST connect rooms
  let connected = new Set([0]);
  let edgeList = [];
  for (let i = 0; i < S.rooms.length; i++) {
    for (let j = i + 1; j < S.rooms.length; j++) {
      let dx = S.rooms[i].cx - S.rooms[j].cx, dy = S.rooms[i].cy - S.rooms[j].cy;
      edgeList.push({ i, j, d: Math.sqrt(dx * dx + dy * dy) });
    }
  }
  edgeList.sort((a, b) => a.d - b.d);

  function carveCorridor(r1, r2) {
    let x1 = r1.cx, y1 = r1.cy, x2 = r2.cx, y2 = r2.cy;
    let cx = x1, cy = y1;
    // L-shaped corridor, 3 tiles wide
    while (cx !== x2) {
      for (let w = -1; w <= 1; w++) {
        let yy = cy + w;
        if (cx >= 1 && cx < mW - 1 && yy >= 1 && yy < mH - 1) {
          if (S.map[yy * mW + cx] === TILE_VOID) S.map[yy * mW + cx] = TILE_FLOOR;
        }
      }
      cx += cx < x2 ? 1 : -1;
    }
    while (cy !== y2) {
      for (let w = -1; w <= 1; w++) {
        let xx = cx + w;
        if (xx >= 1 && xx < mW - 1 && cy >= 1 && cy < mH - 1) {
          if (S.map[cy * mW + xx] === TILE_VOID) S.map[cy * mW + xx] = TILE_FLOOR;
        }
      }
      cy += cy < y2 ? 1 : -1;
    }
  }

  // Prim's MST
  while (connected.size < S.rooms.length) {
    let best = null;
    for (let e of edgeList) {
      let ci = connected.has(e.i), cj = connected.has(e.j);
      if (ci !== cj) { best = e; break; }
    }
    if (!best) break;
    connected.add(best.i);
    connected.add(best.j);
    carveCorridor(S.rooms[best.i], S.rooms[best.j]);
    S.rooms[best.i].connected = true;
    S.rooms[best.j].connected = true;
  }

  // Extra loops
  let extras = 2 + Math.floor(Math.random() * 2);
  for (let e = 0; e < extras && edgeList.length > 0; e++) {
    let idx = Math.floor(Math.random() * Math.min(edgeList.length, S.rooms.length));
    let edge = edgeList[idx];
    carveCorridor(S.rooms[edge.i], S.rooms[edge.j]);
  }

  // Build walls around floors
  for (let y = 0; y < mH; y++) {
    for (let x = 0; x < mW; x++) {
      if (isFloorTile(S.map[y * mW + x])) continue;
      let adj = false;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          let nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < mW && ny >= 0 && ny < mH && isFloorTile(S.map[ny * mW + nx])) adj = true;
        }
      }
      if (adj) S.map[y * mW + x] = TILE_WALL;
    }
  }

  // Place terminal in server room
  let sr = S.rooms.find(r => r.type === ROOM_SERVER);
  if (sr) S.map[sr.cy * mW + sr.cx] = TILE_TERMINAL;

  // Place exit
  let er = S.rooms.find(r => r.type === ROOM_EXIT);
  if (er) S.map[er.cy * mW + er.cx] = TILE_EXIT;

  // Place doors
  // Blue door near server room entrance
  placeDoor(sr, TILE_DOOR_B);
  // Red door near boss on lvl2+
  if (lvl >= 2) {
    let br = S.rooms.find(r => r.type === ROOM_BOSS);
    if (br) placeDoor(br, TILE_DOOR_R);
  }
  // Gold door near exit on lvl3
  if (lvl >= 3) placeDoor(er, TILE_DOOR_G);

  // Floor details
  for (let y = 0; y < mH; y++) {
    for (let x = 0; x < mW; x++) {
      if (isFloorTile(S.map[y * mW + x]) && Math.random() < 0.08) {
        let r = Math.random();
        if (r < 0.4) S.floorDetail[y * mW + x] = 'crack';
        else if (r < 0.7) S.floorDetail[y * mW + x] = 'cable';
        else S.floorDetail[y * mW + x] = 'drain';
      }
    }
  }

  // Place pickups
  placePickups(lvl);

  // Place enemies
  placeEnemies(lvl);

  // Place explosive barrels
  placeBarrels(lvl);

  // Place toxic pools
  placeToxicPools(lvl);

  // Secret room behind destructible wall in storage
  placeSecretRoom(lvl);

  // Structure collapse walls (thin wall sections that break after 3 min)
  placeCollapseWalls();
}
