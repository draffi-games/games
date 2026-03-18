// VOID PROTOCOL — Lighting System (fog of war, flashlight, dynamic lights)

import { T, EN_COMMANDER } from '../core/constants.js';
import { player, enemies, rooms, pickups, barrels, secretWalls, airdrops, toxicPools,
         dynamicLights, camX, camY, shakeX, shakeY, gameTime,
         flickering, countdownActive } from '../core/state.js';
import { gc, lc, lctx, W, H } from '../core/canvas.js';
import { weaponLightColors } from '../entities/weapons.js';

export function renderLighting(mainCtx) {
  lctx.clearRect(0, 0, W, H);

  // Dark overlay (flicker makes it much darker)
  let darkAlpha = flickering ? 0.95 + Math.random() * 0.02 : 0.88;
  lctx.fillStyle = `rgba(5,5,10,${darkAlpha})`;
  lctx.fillRect(0, 0, W, H);

  // Cut out flashlight and ambient with destination-out
  lctx.globalCompositeOperation = 'destination-out';

  if (player.alive) {
    let px = player.x - camX + shakeX;
    let py = player.y - camY + shakeY;
    let angle = player.angle;
    let flicker = 0.95 + Math.random() * 0.1;
    let flashRange = 340 * flicker;
    let flashRange2 = 230 * flicker;

    // Main flashlight cone (narrow, bright) - tinted by current weapon
    let coneAngle = Math.PI / 6; // +/-30 deg
    lctx.save();
    lctx.translate(px, py);
    lctx.rotate(angle);

    let wlc = weaponLightColors[player.curWeapon] || weaponLightColors[0];
    let grad = lctx.createRadialGradient(0, 0, 10, 0, 0, flashRange);
    if (countdownActive) {
      grad.addColorStop(0, `rgba(255,200,180,${0.95 * flicker})`);
      grad.addColorStop(0.5, `rgba(255,150,120,${0.5 * flicker})`);
    } else {
      grad.addColorStop(0, `rgba(${wlc.r},${wlc.g},${wlc.b},${0.95 * flicker})`);
      grad.addColorStop(0.5, `rgba(${wlc.r},${Math.round(wlc.g * 0.9)},${Math.round(wlc.b * 0.85)},${0.5 * flicker})`);
    }
    grad.addColorStop(1, `rgba(${wlc.r},${wlc.g},${Math.round(wlc.b * 0.8)},0)`);
    lctx.fillStyle = grad;
    lctx.beginPath();
    lctx.moveTo(0, 0);
    lctx.arc(0, 0, flashRange, -coneAngle, coneAngle);
    lctx.closePath();
    lctx.fill();

    // Secondary wider cone (softer ambient awareness)
    let grad2 = lctx.createRadialGradient(0, 0, 5, 0, 0, flashRange2);
    grad2.addColorStop(0, 'rgba(255,255,240,0.4)');
    grad2.addColorStop(0.6, 'rgba(255,255,220,0.15)');
    grad2.addColorStop(1, 'rgba(255,255,200,0)');
    lctx.fillStyle = grad2;
    lctx.beginPath();
    lctx.moveTo(0, 0);
    lctx.arc(0, 0, flashRange2, -Math.PI / 3.6, Math.PI / 3.6);
    lctx.closePath();
    lctx.fill();

    lctx.restore();

    // Player ambient light (increased radius)
    let ambGrad = lctx.createRadialGradient(px, py, 8, px, py, 110);
    ambGrad.addColorStop(0, 'rgba(255,255,240,0.6)');
    ambGrad.addColorStop(0.5, 'rgba(255,255,230,0.25)');
    ambGrad.addColorStop(1, 'rgba(255,255,200,0)');
    lctx.fillStyle = ambGrad;
    lctx.beginPath(); lctx.arc(px, py, 110, 0, Math.PI * 2); lctx.fill();
  }

  // Room lights
  for (let room of rooms) {
    let rcx = room.cx * T + T / 2 - camX + shakeX;
    let rcy = room.cy * T + T / 2 - camY + shakeY;
    let rr = Math.max(room.w, room.h) * T * 0.5;
    if (rcx < -rr || rcx > W + rr || rcy < -rr || rcy > H + rr) continue;

    let intensity = flickering ? 0.04 : countdownActive ? 0.2 : 0.16;
    let ambRoom = lctx.createRadialGradient(rcx, rcy, 5, rcx, rcy, rr);
    ambRoom.addColorStop(0, `rgba(255,255,240,${intensity})`);
    ambRoom.addColorStop(0.6, `rgba(255,255,230,${intensity * 0.4})`);
    ambRoom.addColorStop(1, 'rgba(255,255,200,0)');
    lctx.fillStyle = ambRoom;
    lctx.beginPath(); lctx.arc(rcx, rcy, rr, 0, Math.PI * 2); lctx.fill();
  }

  // Pickup glow lights
  for (let pk of pickups) {
    if (pk.collected) continue;
    let px = pk.x - camX + shakeX, py = pk.y - camY + shakeY;
    if (px < -30 || px > W + 30 || py < -30 || py > H + 30) continue;
    let intensity = pk.type === 'keycard' ? 0.35 : pk.type === 'powerup' ? 0.2 : 0.12;
    let radius = pk.type === 'keycard' ? 30 : pk.type === 'powerup' ? 20 : 15;
    let pglow = lctx.createRadialGradient(px, py, 2, px, py, radius);
    pglow.addColorStop(0, `rgba(255,255,240,${intensity})`);
    pglow.addColorStop(1, 'rgba(255,255,200,0)');
    lctx.fillStyle = pglow;
    lctx.beginPath(); lctx.arc(px, py, radius, 0, Math.PI * 2); lctx.fill();
  }

  // Barrel glow (subtle warning)
  for (let b of barrels) {
    if (!b.alive) continue;
    let bx = b.x - camX + shakeX, by = b.y - camY + shakeY;
    if (bx < -30 || bx > W + 30 || by < -30 || by > H + 30) continue;
    let bGlow = lctx.createRadialGradient(bx, by, 2, bx, by, 15);
    let bInt = b.hp < 10 ? 0.15 : 0.06;
    bGlow.addColorStop(0, `rgba(255,200,100,${bInt})`);
    bGlow.addColorStop(1, 'rgba(255,150,50,0)');
    lctx.fillStyle = bGlow;
    lctx.beginPath(); lctx.arc(bx, by, 15, 0, Math.PI * 2); lctx.fill();
  }

  // Secret wall glow
  for (let sw of secretWalls) {
    if (sw.hp <= 0) continue;
    let swx = sw.x * T + T / 2 - camX + shakeX, swy = sw.y * T + T / 2 - camY + shakeY;
    if (swx < -30 || swx > W + 30 || swy < -30 || swy > H + 30) continue;
    let swGlow = lctx.createRadialGradient(swx, swy, 2, swx, swy, 18);
    swGlow.addColorStop(0, 'rgba(255,180,50,0.1)');
    swGlow.addColorStop(1, 'rgba(255,150,30,0)');
    lctx.fillStyle = swGlow;
    lctx.beginPath(); lctx.arc(swx, swy, 18, 0, Math.PI * 2); lctx.fill();
  }

  // Airdrop glow (bright beacon for supply drops)
  for (let ad of airdrops) {
    if (ad.collected || !ad.landed) continue;
    let ax = ad.x - camX + shakeX, ay = ad.y - camY + shakeY;
    if (ax < -30 || ax > W + 30 || ay < -30 || ay > H + 30) continue;
    let adGlow = lctx.createRadialGradient(ax, ay, 3, ax, ay, 30);
    adGlow.addColorStop(0, 'rgba(255,220,80,0.25)');
    adGlow.addColorStop(1, 'rgba(255,200,50,0)');
    lctx.fillStyle = adGlow;
    lctx.beginPath(); lctx.arc(ax, ay, 30, 0, Math.PI * 2); lctx.fill();
  }

  // Toxic pool glow
  for (let tp of toxicPools) {
    let tpx = tp.x - camX + shakeX, tpy = tp.y - camY + shakeY;
    if (tpx < -40 || tpx > W + 40 || tpy < -40 || tpy > H + 40) continue;
    let tpGlow = lctx.createRadialGradient(tpx, tpy, 2, tpx, tpy, tp.radius * 0.7);
    tpGlow.addColorStop(0, 'rgba(50,255,50,0.12)');
    tpGlow.addColorStop(1, 'rgba(50,200,50,0)');
    lctx.fillStyle = tpGlow;
    lctx.beginPath(); lctx.arc(tpx, tpy, tp.radius * 0.7, 0, Math.PI * 2); lctx.fill();
  }

  // Enemy alert lights (enhanced glow)
  for (let e of enemies) {
    if (!e.alive || !e.alert) continue;
    let ex = e.x - camX + shakeX, ey = e.y - camY + shakeY;
    if (ex < -60 || ex > W + 60 || ey < -60 || ey > H + 60) continue;
    // Outer subtle floor illumination
    let eglowOuter = lctx.createRadialGradient(ex, ey, 4, ex, ey, 50);
    let col = e.type === EN_COMMANDER ? 'rgba(170,68,255,' : 'rgba(255,50,50,';
    eglowOuter.addColorStop(0, col + '0.15)');
    eglowOuter.addColorStop(0.5, col + '0.06)');
    eglowOuter.addColorStop(1, col + '0)');
    lctx.fillStyle = eglowOuter;
    lctx.beginPath(); lctx.arc(ex, ey, 50, 0, Math.PI * 2); lctx.fill();
    // Inner bright core
    let eglowInner = lctx.createRadialGradient(ex, ey, 2, ex, ey, 20);
    eglowInner.addColorStop(0, col + '0.3)');
    eglowInner.addColorStop(1, col + '0)');
    lctx.fillStyle = eglowInner;
    lctx.beginPath(); lctx.arc(ex, ey, 20, 0, Math.PI * 2); lctx.fill();
  }

  // Dynamic lights (muzzle flash, explosions) - fog cutout
  for (let dl of dynamicLights) {
    let dlx = dl.x - camX + shakeX, dly = dl.y - camY + shakeY;
    if (dlx < -dl.radius || dlx > W + dl.radius || dly < -dl.radius || dly > H + dl.radius) continue;
    let t = dl.life / dl.maxLife;
    let alpha = t * 0.7;
    let r = dl.radius * Math.min(1, t * 2 + 0.5);
    let dlGrad = lctx.createRadialGradient(dlx, dly, 2, dlx, dly, r);
    dlGrad.addColorStop(0, `rgba(${dl.r},${dl.g},${dl.b},${alpha})`);
    dlGrad.addColorStop(0.4, `rgba(${dl.r},${dl.g},${dl.b},${alpha * 0.5})`);
    dlGrad.addColorStop(1, `rgba(${dl.r},${dl.g},${dl.b},0)`);
    lctx.fillStyle = dlGrad;
    lctx.beginPath(); lctx.arc(dlx, dly, r, 0, Math.PI * 2); lctx.fill();
  }

  lctx.globalCompositeOperation = 'source-over';

  // Draw fog onto main canvas
  mainCtx.drawImage(lc, 0, 0);

  // Colored room lighting (additive blend)
  mainCtx.save();
  mainCtx.globalCompositeOperation = 'lighter';
  for (let room of rooms) {
    let rcx = room.cx * T + T / 2 - camX + shakeX;
    let rcy = room.cy * T + T / 2 - camY + shakeY;
    let rr = Math.max(room.w, room.h) * T * 0.5;
    if (rcx < -rr || rcx > W + rr || rcy < -rr || rcy > H + rr) continue;

    let color = room.lightColor;
    if (countdownActive) color = 'rgba(180,30,20,0.06)';

    let roomGrad = mainCtx.createRadialGradient(rcx, rcy, 5, rcx, rcy, rr * 0.8);
    roomGrad.addColorStop(0, color);
    roomGrad.addColorStop(1, 'rgba(0,0,0,0)');
    mainCtx.fillStyle = roomGrad;
    mainCtx.beginPath(); mainCtx.arc(rcx, rcy, rr * 0.8, 0, Math.PI * 2); mainCtx.fill();
  }
  // Toxic pool colored glow (additive green)
  for (let tp of toxicPools) {
    let tpx = tp.x - camX + shakeX, tpy = tp.y - camY + shakeY;
    if (tpx < -40 || tpx > W + 40 || tpy < -40 || tpy > H + 40) continue;
    let tpGrad = mainCtx.createRadialGradient(tpx, tpy, 2, tpx, tpy, tp.radius * 0.5);
    tpGrad.addColorStop(0, 'rgba(30,180,30,0.04)');
    tpGrad.addColorStop(1, 'rgba(0,0,0,0)');
    mainCtx.fillStyle = tpGrad;
    mainCtx.beginPath(); mainCtx.arc(tpx, tpy, tp.radius * 0.5, 0, Math.PI * 2); mainCtx.fill();
  }
  // Colored keycard glow (additive)
  for (let pk of pickups) {
    if (pk.collected || pk.type !== 'keycard') continue;
    let px = pk.x - camX + shakeX, py = pk.y - camY + shakeY;
    if (px < -30 || px > W + 30 || py < -30 || py > H + 30) continue;
    let kcColor = pk.subtype === 'blue' ? 'rgba(50,50,255,0.04)' : pk.subtype === 'red' ? 'rgba(255,50,50,0.04)' : 'rgba(255,220,0,0.04)';
    let kcGrad = mainCtx.createRadialGradient(px, py, 3, px, py, 30);
    kcGrad.addColorStop(0, kcColor);
    kcGrad.addColorStop(1, 'rgba(0,0,0,0)');
    mainCtx.fillStyle = kcGrad;
    mainCtx.beginPath(); mainCtx.arc(px, py, 30, 0, Math.PI * 2); mainCtx.fill();
  }
  // Dynamic lights colored glow (additive)
  for (let dl of dynamicLights) {
    let dlx = dl.x - camX + shakeX, dly = dl.y - camY + shakeY;
    if (dlx < -dl.radius || dlx > W + dl.radius || dly < -dl.radius || dly > H + dl.radius) continue;
    let t = dl.life / dl.maxLife;
    let alpha = t * 0.08;
    let r = dl.radius * Math.min(1, t * 2 + 0.5) * 0.8;
    let dlColorGrad = mainCtx.createRadialGradient(dlx, dly, 2, dlx, dly, r);
    dlColorGrad.addColorStop(0, `rgba(${dl.r},${dl.g},${dl.b},${alpha})`);
    dlColorGrad.addColorStop(1, 'rgba(0,0,0,0)');
    mainCtx.fillStyle = dlColorGrad;
    mainCtx.beginPath(); mainCtx.arc(dlx, dly, r, 0, Math.PI * 2); mainCtx.fill();
  }
  // Enemy alert colored glow (additive red/purple on floor)
  for (let e of enemies) {
    if (!e.alive || !e.alert) continue;
    let ex = e.x - camX + shakeX, ey = e.y - camY + shakeY;
    if (ex < -60 || ex > W + 60 || ey < -60 || ey > H + 60) continue;
    let isCmd = e.type === EN_COMMANDER;
    let eColorGrad = mainCtx.createRadialGradient(ex, ey, 3, ex, ey, 40);
    eColorGrad.addColorStop(0, isCmd ? 'rgba(120,40,200,0.04)' : 'rgba(200,30,20,0.04)');
    eColorGrad.addColorStop(1, 'rgba(0,0,0,0)');
    mainCtx.fillStyle = eColorGrad;
    mainCtx.beginPath(); mainCtx.arc(ex, ey, 40, 0, Math.PI * 2); mainCtx.fill();
  }
  mainCtx.restore();
}
