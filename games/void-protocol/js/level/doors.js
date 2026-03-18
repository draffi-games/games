// VOID PROTOCOL — Door Placement

import * as S from '../core/state.js';
import { isFloorTile } from './generator.js';
import { isInRoom } from './rooms.js';

export function placeDoor(room, doorType) {
  if (!room) return;
  // Find corridor entry to room
  let edges = [];
  for (let y = room.y; y < room.y + room.h; y++) {
    for (let x = room.x; x < room.x + room.w; x++) {
      // Check if this is a room edge tile adjacent to corridor
      if (x === room.x || x === room.x + room.w - 1 || y === room.y || y === room.y + room.h - 1) {
        for (let d of [{ dx: -1, dy: 0 }, { dx: 1, dy: 0 }, { dx: 0, dy: -1 }, { dx: 0, dy: 1 }]) {
          let nx = x + d.dx, ny = y + d.dy;
          if (nx >= 0 && nx < S.mapW && ny >= 0 && ny < S.mapH) {
            if (isFloorTile(S.map[ny * S.mapW + nx]) && !isInRoom(nx, ny, room)) {
              edges.push({ x, y });
            }
          }
        }
      }
    }
  }
  if (edges.length > 0) {
    let e = edges[Math.floor(Math.random() * edges.length)];
    S.map[e.y * S.mapW + e.x] = doorType;
  }
}
