// VOID PROTOCOL — Collision System

import { T, TILE_VOID, TILE_WALL, TILE_FLOOR, TILE_DOOR_B, TILE_DOOR_R, TILE_DOOR_G } from '../core/constants.js';
import { map, mapW, mapH, player, lockedDoorTimer, shakeMag, set } from '../core/state.js';
import { isWalkable, isDoor } from '../level/generator.js';
import { SFX } from '../audio/sfx.js';
import { spawnSparks, addKillFeed } from './combat.js';

export function tileAt(px, py) {
    let tx = Math.floor(px / T), ty = Math.floor(py / T);
    if (tx < 0 || tx >= mapW || ty < 0 || ty >= mapH) return TILE_VOID;
    return map[ty * mapW + tx];
}

export function canWalk(px, py, size) {
    let r = size || 5;
    let corners = [
        { x: px - r, y: py - r }, { x: px + r, y: py - r },
        { x: px - r, y: py + r }, { x: px + r, y: py + r }
    ];
    for (let c of corners) {
        let t = tileAt(c.x, c.y);
        if (!isWalkable(t) && !isDoor(t)) return false;
        if (isDoor(t)) {
            // check if player has keycard
            if (t === TILE_DOOR_B && !player.keycards.blue) { if (lockedDoorTimer <= 0) { set('lockedDoorMsg', 'REQUIRES BLUE KEYCARD'); set('lockedDoorTimer', 1.5); } return false; }
            if (t === TILE_DOOR_R && !player.keycards.red) { if (lockedDoorTimer <= 0) { set('lockedDoorMsg', 'REQUIRES RED KEYCARD'); set('lockedDoorTimer', 1.5); } return false; }
            if (t === TILE_DOOR_G && !player.keycards.gold) { if (lockedDoorTimer <= 0) { set('lockedDoorMsg', 'REQUIRES GOLD KEYCARD'); set('lockedDoorTimer', 1.5); } return false; }
            // open door
            let tx = Math.floor(c.x / T), ty = Math.floor(c.y / T);
            let doorColor = t === TILE_DOOR_B ? '#44f' : t === TILE_DOOR_R ? '#f44' : '#fd0';
            let doorName = t === TILE_DOOR_B ? 'BLUE' : t === TILE_DOOR_R ? 'RED' : 'GOLD';
            map[ty * mapW + tx] = TILE_FLOOR;
            spawnSparks(tx * T + T / 2, ty * T + T / 2, 12, doorColor);
            addKillFeed(doorName + ' DOOR UNLOCKED');
            SFX.door();
            set('shakeMag', Math.max(shakeMag, 2));
        }
    }
    return true;
}

export function enemyBlocked(x, y, sz) {
    let r = sz * 0.6;
    let cs = [{ x: x - r, y: y - r }, { x: x + r, y: y - r }, { x: x - r, y: y + r }, { x: x + r, y: y + r }, { x: x, y: y - r }, { x: x, y: y + r }, { x: x - r, y: y }, { x: x + r, y: y }];
    for (let c of cs) { let t = tileAt(c.x, c.y); if (t === TILE_WALL || t === TILE_VOID || isDoor(t)) return true; }
    return false;
}

// Push enemy out of wall if stuck (wall separation)
export function unstickEnemy(e) {
    if (!enemyBlocked(e.x, e.y, e.size)) return;
    // Try 8 directions, find nearest walkable position
    let bestDist = Infinity, bestX = e.x, bestY = e.y;
    for (let a = 0; a < 8; a++) {
        let angle = a * Math.PI / 4;
        for (let d = 1; d <= 4; d++) {
            let tx = e.x + Math.cos(angle) * d * 4;
            let ty = e.y + Math.sin(angle) * d * 4;
            if (!enemyBlocked(tx, ty, e.size)) {
                if (d < bestDist) { bestDist = d; bestX = tx; bestY = ty; }
                break;
            }
        }
    }
    e.x = bestX; e.y = bestY;
}

export function lineOfSight(x1, y1, x2, y2) {
    let dx = x2 - x1, dy = y2 - y1;
    let dist = Math.sqrt(dx * dx + dy * dy);
    let steps = Math.ceil(dist / 8);
    for (let i = 0; i <= steps; i++) {
        let t = i / steps;
        let x = x1 + dx * t, y = y1 + dy * t;
        let tile = tileAt(x, y);
        if (tile === TILE_WALL || tile === TILE_VOID) return false;
        if (isDoor(tile)) return false;
    }
    return true;
}
