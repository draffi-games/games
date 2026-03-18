// VOID PROTOCOL — Pickup Placement

import { T, ROOM_SERVER, ROOM_ARMORY, ROOM_STORAGE, ROOM_PATROL } from '../core/constants.js';
import { rooms, set } from '../core/state.js';
import { weapons } from './weapons.js';

export function placePickups(lvl) {
    let newPickups = [];

    // Keycards
    let sr = rooms.find(r => r.type === ROOM_SERVER);
    let armory = rooms.find(r => r.type === ROOM_ARMORY);
    let storage = rooms.find(r => r.type === ROOM_STORAGE);
    let patrolRooms = rooms.filter(r => r.type === ROOM_PATROL);

    // Blue keycard in a patrol room or storage
    let bkRoom = patrolRooms.length > 0 ? patrolRooms[0] : (storage || rooms[Math.min(2, rooms.length - 1)]);
    newPickups.push({ x: bkRoom.cx * T + T / 2, y: bkRoom.cy * T + T / 2, type: 'keycard', subtype: 'blue', collected: false });

    // Red keycard if lvl>=2
    if (lvl >= 2) {
        let rkRoom = patrolRooms.length > 1 ? patrolRooms[1] : (armory || bkRoom);
        newPickups.push({ x: rkRoom.cx * T + T / 2, y: (rkRoom.cy + 1) * T + T / 2, type: 'keycard', subtype: 'red', collected: false });
    }
    // Gold keycard if lvl>=3
    if (lvl >= 3) {
        let gkRoom = patrolRooms.length > 2 ? patrolRooms[2] : (storage || bkRoom);
        newPickups.push({ x: (gkRoom.cx + 1) * T + T / 2, y: gkRoom.cy * T + T / 2, type: 'keycard', subtype: 'gold', collected: false });
    }

    // Health + armor + ammo in armory
    if (armory) {
        newPickups.push({ x: (armory.cx - 1) * T + T / 2, y: armory.cy * T + T / 2, type: 'health', amount: 40, collected: false });
        newPickups.push({ x: (armory.cx + 1) * T + T / 2, y: armory.cy * T + T / 2, type: 'armor', amount: 30, collected: false });
        newPickups.push({ x: armory.cx * T + T / 2, y: (armory.cy + 1) * T + T / 2, type: 'ammo', weaponIdx: 2, amount: 12, collected: false });
        newPickups.push({ x: armory.cx * T + T / 2, y: (armory.cy - 1) * T + T / 2, type: 'ammo', weaponIdx: 3, amount: 20, collected: false });
    }

    // Scatter pickups in patrol rooms (FIXED: weaponIdx 1-5, not 0)
    for (let pr of patrolRooms) {
        if (Math.random() < 0.6) {
            newPickups.push({ x: (pr.cx + 1) * T + T / 2, y: (pr.cy + 1) * T + T / 2, type: 'health', amount: 20, collected: false });
        }
        if (Math.random() < 0.4) {
            let wIdx = 1 + Math.floor(Math.random() * 5);
            newPickups.push({ x: (pr.cx - 1) * T + T / 2, y: (pr.cy - 1) * T + T / 2, type: 'ammo', weaponIdx: wIdx, amount: Math.floor(weapons[wIdx].ammo * 0.15), collected: false });
        }
    }

    // Weapon pickups
    if (storage) {
        newPickups.push({ x: storage.cx * T + T / 2, y: storage.cy * T + T / 2, type: 'weapon', weaponIdx: 1 + Math.floor(Math.random() * 3), collected: false });
    }
    if (patrolRooms.length > 2) {
        let wr = patrolRooms[patrolRooms.length - 1];
        newPickups.push({ x: wr.cx * T + T / 2, y: wr.cy * T + T / 2, type: 'weapon', weaponIdx: 3 + Math.floor(Math.random() * 3), collected: false });
    }

    set('pickups', newPickups);
}
