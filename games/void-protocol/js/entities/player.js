// VOID PROTOCOL — Player Initialization

import { T, ROOM_START } from '../core/constants.js';
import { rooms, set } from '../core/state.js';

export function initPlayer() {
    let sr = rooms.find(r => r.type === ROOM_START) || rooms[0];
    set('player', {
        x: sr.cx * T + T / 2,
        y: sr.cy * T + T / 2,
        angle: 0,
        hp: 100, maxHp: 100,
        armor: 0, maxArmor: 100,
        stamina: 100, maxStamina: 100,
        spd: 150,
        sprintMul: 1.8,
        curWeapon: 0,
        ammo: [Infinity, 0, 0, 0, 0, 0],
        weaponCD: 0,
        keycards: { blue: false, red: false, gold: false },
        size: 12,
        alive: true,
        invuln: 1.5, // brief spawn invulnerability
        recoilOffset: 0, // weapon recoil bob (kicks back on shoot, decays)
        muzzleFlash: 0 // bright starburst timer at muzzle
    });
}
