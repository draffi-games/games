// VOID PROTOCOL — Tile Rendering (floors, walls, doors, exit portal)

import { T, TILE_WALL, TILE_FLOOR2, TILE_FLOOR3, TILE_FLOOR4, TILE_TERMINAL, TILE_EXIT,
         TILE_DOOR_B, TILE_DOOR_R, ROOM_EXIT } from '../core/constants.js';
import { map, mapW, mapH, rooms, floorDetail, gameTime, player, exitOpen,
         terminalHacked, secretWalls, camX, camY, shakeX, shakeY } from '../core/state.js';
import { W, H } from '../core/canvas.js';
import { hashR } from '../core/utils.js';
import { isFloorTile, isWalkable, isDoor } from '../level/generator.js';
import { floorTexes, wallTexes, doorTexes, terminalTex, exitTex } from '../level/textures.js';

// ===== Floor tiles with detail overlays =====
export function renderFloorTiles(ctx, vp) {
  for (let ty = vp.vy1; ty <= vp.vy2; ty++) {
    for (let tx = vp.vx1; tx <= vp.vx2; tx++) {
      let tile = map[ty * mapW + tx];
      let sx = tx * T, sy = ty * T;
      if (isFloorTile(tile)) {
        let variant = 0;
        if (tile === TILE_FLOOR2) variant = 1;
        else if (tile === TILE_FLOOR3) variant = 2;
        else if (tile === TILE_FLOOR4) variant = 3;
        ctx.drawImage(floorTexes[variant], sx, sy);
        // Floor details
        let fd = floorDetail[ty * mapW + tx];
        if (fd) {
          ctx.globalAlpha = 0.5;
          if (fd === 'crack') {
            ctx.strokeStyle = 'rgba(0,0,0,0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(sx + hashR(tx, ty, 0) * 8, sy + hashR(tx, ty, 1) * T);
            ctx.lineTo(sx + T / 2 + hashR(tx, ty, 2) * 8, sy + T / 2);
            ctx.lineTo(sx + T - hashR(tx, ty, 3) * 8, sy + hashR(tx, ty, 4) * T);
            ctx.stroke();
          } else if (fd === 'cable') {
            ctx.strokeStyle = 'rgba(0,80,80,0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(sx, sy + T / 2); ctx.lineTo(sx + T, sy + T / 2);
            ctx.stroke();
          } else if (fd === 'drain') {
            ctx.fillStyle = 'rgba(0,0,0,0.25)';
            ctx.beginPath(); ctx.arc(sx + T / 2, sy + T / 2, 5, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(sx + T / 2 - 3, sy + T / 2 - 3); ctx.lineTo(sx + T / 2 + 3, sy + T / 2 + 3); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(sx + T / 2 + 3, sy + T / 2 - 3); ctx.lineTo(sx + T / 2 - 3, sy + T / 2 + 3); ctx.stroke();
          }
          ctx.globalAlpha = 1;
        }
      } else if (tile === TILE_TERMINAL) {
        ctx.drawImage(floorTexes[2], sx, sy);
        ctx.drawImage(terminalTex, sx, sy);
        // Terminal glow
        if (!terminalHacked) {
          ctx.fillStyle = `rgba(0,255,0,${0.05 + Math.sin(gameTime * 3) * 0.03})`;
          ctx.fillRect(sx, sy, T, T);
        } else {
          ctx.fillStyle = 'rgba(255,0,0,0.05)';
          ctx.fillRect(sx, sy, T, T);
        }
      } else if (tile === TILE_EXIT) {
        ctx.drawImage(floorTexes[0], sx, sy);
        ctx.drawImage(exitTex, sx, sy);
        if (exitOpen) {
          // Animated portal effect
          let portalCenter = { x: sx + T / 2, y: sy + T / 2 };
          // Outer energy ring
          ctx.strokeStyle = `rgba(0,221,255,${0.2 + Math.sin(gameTime * 3) * 0.1})`;
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(portalCenter.x, portalCenter.y, T * 0.45, gameTime * 2, gameTime * 2 + Math.PI * 1.5); ctx.stroke();
          ctx.beginPath(); ctx.arc(portalCenter.x, portalCenter.y, T * 0.45, gameTime * 2 + Math.PI, gameTime * 2 + Math.PI + Math.PI * 0.8); ctx.stroke();
          // Inner spiral glow
          let portalGrad = ctx.createRadialGradient(portalCenter.x, portalCenter.y, 0, portalCenter.x, portalCenter.y, T * 0.4);
          portalGrad.addColorStop(0, `rgba(0,255,255,${0.12 + Math.sin(gameTime * 5) * 0.05})`);
          portalGrad.addColorStop(0.5, `rgba(0,200,255,${0.06 + Math.sin(gameTime * 4) * 0.03})`);
          portalGrad.addColorStop(1, 'rgba(0,180,220,0)');
          ctx.fillStyle = portalGrad;
          ctx.beginPath(); ctx.arc(portalCenter.x, portalCenter.y, T * 0.4, 0, Math.PI * 2); ctx.fill();
          // Particle sparkles around portal
          for (let sp = 0; sp < 4; sp++) {
            let spa = gameTime * 3 + sp * Math.PI / 2;
            let spr = T * 0.3 + Math.sin(gameTime * 5 + sp) * T * 0.1;
            let spx = portalCenter.x + Math.cos(spa) * spr;
            let spy = portalCenter.y + Math.sin(spa) * spr;
            ctx.fillStyle = `rgba(150,255,255,${0.4 + Math.sin(gameTime * 8 + sp) * 0.3})`;
            ctx.beginPath(); ctx.arc(spx, spy, 1 + Math.sin(gameTime * 6 + sp) * 0.5, 0, Math.PI * 2); ctx.fill();
          }
          // Pulsing corner brackets
          let bracketAlpha = 0.3 + Math.sin(gameTime * 4) * 0.15;
          ctx.strokeStyle = `rgba(0,255,255,${bracketAlpha})`;
          ctx.lineWidth = 1.5;
          let bb = 5;
          ctx.beginPath(); ctx.moveTo(sx + 2, sy + bb); ctx.lineTo(sx + 2, sy + 2); ctx.lineTo(sx + bb, sy + 2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(sx + T - bb, sy + 2); ctx.lineTo(sx + T - 2, sy + 2); ctx.lineTo(sx + T - 2, sy + bb); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(sx + 2, sy + T - bb); ctx.lineTo(sx + 2, sy + T - 2); ctx.lineTo(sx + bb, sy + T - 2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(sx + T - 2, sy + T - bb); ctx.lineTo(sx + T - 2, sy + T - 2); ctx.lineTo(sx + T - bb, sy + T - 2); ctx.stroke();
        } else {
          // Inactive exit: dim static overlay
          ctx.fillStyle = 'rgba(0,100,130,0.03)';
          ctx.fillRect(sx, sy, T, T);
        }
      } else if (isDoor(tile)) {
        ctx.drawImage(floorTexes[0], sx, sy);
        if (tile === TILE_DOOR_B) ctx.drawImage(doorTexes.b, sx, sy);
        else if (tile === TILE_DOOR_R) ctx.drawImage(doorTexes.r, sx, sy);
        else ctx.drawImage(doorTexes.g, sx, sy);
      }
    }
  }

  // Exit room floor overlay (directional markings, hazard stripes)
  let exitRoom = rooms.find(r => r.type === ROOM_EXIT);
  if (exitRoom) {
    let erx1 = exitRoom.x, ery1 = exitRoom.y, erx2 = exitRoom.x + exitRoom.w, ery2 = exitRoom.y + exitRoom.h;
    // Only render if in viewport
    if (erx2 * T > camX - T && erx1 * T < camX + W + T && ery2 * T > camY - T && ery1 * T < camY + H + T) {
      // Hazard stripes along exit room edges
      for (let ey = ery1; ey < ery2; ey++) {
        for (let ex = erx1; ex < erx2; ex++) {
          let t = map[ey * mapW + ex];
          if (!isFloorTile(t) && t !== TILE_EXIT) continue;
          let sx = ex * T, sy = ey * T;
          // Edge tiles: hazard stripe
          if (ex === erx1 || ex === erx2 - 1 || ey === ery1 || ey === ery2 - 1) {
            ctx.globalAlpha = 0.06;
            ctx.fillStyle = '#0df';
            // Diagonal stripes
            ctx.save(); ctx.beginPath(); ctx.rect(sx, sy, T, T); ctx.clip();
            for (let stripe = -T; stripe < T * 2; stripe += 8) {
              ctx.fillRect(sx + stripe, sy, 3, T);
            }
            ctx.restore();
            ctx.globalAlpha = 1;
          }
          // Floor arrow decals pointing to exit tile
          if (t !== TILE_EXIT && (ex === exitRoom.cx || ey === exitRoom.cy)) {
            let dx = exitRoom.cx - ex, dy = exitRoom.cy - ey;
            if (Math.abs(dx) + Math.abs(dy) > 0 && Math.abs(dx) + Math.abs(dy) < exitRoom.w) {
              let arrowAngle = Math.atan2(dy, dx);
              ctx.save();
              ctx.translate(sx + T / 2, sy + T / 2);
              ctx.rotate(arrowAngle);
              // Chevron arrow
              let aPulse = exitOpen ? (0.08 + Math.sin(gameTime * 4 + ex * 0.5) * 0.04) : 0.03;
              ctx.fillStyle = `rgba(0,221,255,${aPulse})`;
              ctx.beginPath();
              ctx.moveTo(-T * 0.3, 0); ctx.lineTo(0, -T * 0.25); ctx.lineTo(T * 0.3, 0);
              ctx.lineTo(0, T * 0.25); ctx.closePath();
              ctx.fill();
              ctx.restore();
            }
          }
        }
      }
    }
  }
}

// ===== Wall tiles =====
export function renderWallTiles(ctx, vp) {
  for (let ty = vp.vy1; ty <= vp.vy2; ty++) {
    for (let tx = vp.vx1; tx <= vp.vx2; tx++) {
      let tile = map[ty * mapW + tx];
      if (tile === TILE_WALL) {
        let sx = tx * T, sy = ty * T;
        let variant = ((tx * 7 + ty * 13) % 3);
        ctx.drawImage(wallTexes[variant], sx, sy);
      }
    }
  }

  // Destructible wall overlays (cracked appearance)
  for (let sw of secretWalls) {
    if (sw.hp <= 0) continue;
    let sx = sw.x * T, sy = sw.y * T;
    let screenX = sx - camX + shakeX, screenY = sy - camY + shakeY;
    if (screenX < -T || screenX > W + T || screenY < -T || screenY > H + T) continue;
    // Damage cracks
    let dmgPct = 1 - sw.hp / sw.maxHp;
    ctx.globalAlpha = 0.5 + dmgPct * 0.4;
    ctx.strokeStyle = '#a85';
    ctx.lineWidth = 1 + dmgPct;
    // Draw cracks proportional to damage
    let numCracks = 1 + Math.floor(dmgPct * 4);
    for (let i = 0; i < numCracks; i++) {
      let cx1 = sx + hashR(sw.x, sw.y, i * 2) * T;
      let cy1 = sy + hashR(sw.x, sw.y, i * 2 + 1) * T;
      let cx2 = sx + hashR(sw.x, sw.y, i * 2 + 10) * T;
      let cy2 = sy + hashR(sw.x, sw.y, i * 2 + 11) * T;
      ctx.beginPath(); ctx.moveTo(cx1, cy1); ctx.lineTo(cx2, cy2); ctx.stroke();
    }
    // Pulsing glow hint when close to player
    let pdx = player.x - (sx + T / 2), pdy = player.y - (sy + T / 2);
    if (Math.sqrt(pdx * pdx + pdy * pdy) < T * 4) {
      ctx.globalAlpha = 0.08 + Math.sin(gameTime * 3) * 0.04;
      ctx.fillStyle = '#fa0';
      ctx.fillRect(sx, sy, T, T);
    }
    ctx.globalAlpha = 1;
  }
}

// ===== 2.5D wall depth effect =====
export function renderWallDepth(ctx, vp) {
  for (let ty = vp.vy1; ty <= vp.vy2; ty++) {
    for (let tx = vp.vx1; tx <= vp.vx2; tx++) {
      let tile = map[ty * mapW + tx];
      if (tile !== TILE_WALL) continue;
      let sx = tx * T, sy = ty * T;
      // Face below
      if (ty + 1 < mapH && isWalkable(map[(ty + 1) * mapW + tx])) {
        let grad = ctx.createLinearGradient(sx, sy + T, sx, sy + T + 10);
        grad.addColorStop(0, 'rgba(15,17,22,0.9)');
        grad.addColorStop(1, 'rgba(5,5,8,0.95)');
        ctx.fillStyle = grad;
        ctx.fillRect(sx, sy + T, T, 10);
      }
      // Face right
      if (tx + 1 < mapW && isWalkable(map[ty * mapW + tx + 1])) {
        let grad = ctx.createLinearGradient(sx + T, sy, sx + T + 6, sy);
        grad.addColorStop(0, 'rgba(12,14,18,0.85)');
        grad.addColorStop(1, 'rgba(5,5,8,0.9)');
        ctx.fillStyle = grad;
        ctx.fillRect(sx + T, sy, 6, T);
      }
      // Face left
      if (tx - 1 >= 0 && isWalkable(map[ty * mapW + tx - 1])) {
        let grad = ctx.createLinearGradient(sx, sy, sx - 6, sy);
        grad.addColorStop(0, 'rgba(12,14,18,0.85)');
        grad.addColorStop(1, 'rgba(5,5,8,0.9)');
        ctx.fillStyle = grad;
        ctx.fillRect(sx - 6, sy, 6, T);
      }
    }
  }
}
