// VOID PROTOCOL — HUD Rendering (health, armor, weapons, minimap, etc.)

import { T, ST_PLAY, TILE_WALL, TILE_TERMINAL, TILE_EXIT, TILE_DOOR_B, TILE_DOOR_R,
         ROOM_EXIT, ROOM_SERVER, ROOM_BOSS, EN_COMMANDER } from '../core/constants.js';
import { state, player, enemies, rooms, map, mapW, mapH, explored, pickups, barrels,
         toxicPools, airdrops, gameTime, camX, camY, shakeX, shakeY,
         level, countdownActive, countdownTime, terminalHacked, exitOpen,
         hackProgress, powerUp, totalKills, killStreak, killStreakTimer,
         hudSegFlicker, hudArmorShimmer, hudKillStreakLabel, hudKillStreakLabelTimer,
         streakAnnounceTimer, streakAnnounceText, streakAnnounceColor,
         alarmActive, alarmTimer, collapseTriggered, collapseWalls, collapseTimer,
         flickering, roomAlertTimer, roomAlert, roomFlashTimer, roomFlashImportant,
         roomFlashName, lockedDoorMsg, lockedDoorTimer, bossInView, bossTarget,
         killFeed, damageNums, showMap } from '../core/state.js';
import { W, H } from '../core/canvas.js';
import { getMouseX, getMouseY } from '../core/input.js';
import { weapons } from '../entities/weapons.js';
import { isFloorTile, isDoor } from '../level/generator.js';

export function renderHUD(ctx) {
  ctx.save();

  // === CORNER BRACKETS (bottom-left HUD frame) ===
  let frameL = 10, frameB = H - 8, frameW = 218, frameH = 128;
  ctx.strokeStyle = 'rgba(0,221,255,0.3)';
  ctx.lineWidth = 1.5;
  let brkLen = 14;
  ctx.beginPath(); ctx.moveTo(frameL, frameB - brkLen); ctx.lineTo(frameL, frameB); ctx.lineTo(frameL + brkLen, frameB); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(frameL, frameB - frameH + brkLen); ctx.lineTo(frameL, frameB - frameH); ctx.lineTo(frameL + brkLen, frameB - frameH); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(frameL + frameW - brkLen, frameB); ctx.lineTo(frameL + frameW, frameB); ctx.lineTo(frameL + frameW, frameB - brkLen); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(frameL + frameW - brkLen, frameB - frameH); ctx.lineTo(frameL + frameW, frameB - frameH); ctx.lineTo(frameL + frameW, frameB - frameH + brkLen); ctx.stroke();
  ctx.fillStyle = 'rgba(0,221,255,0.012)';
  for (let sl = 0; sl < frameH; sl += 3) { ctx.fillRect(frameL + 1, frameB - frameH + sl, frameW - 2, 1); }

  // === SEGMENTED HEALTH BAR ===
  let barX = 20, barY = H - 50, barW = 195, barH = 16;
  let hpPct = player.hp / player.maxHp;
  let numSegs = 10;
  let segGap = 2;
  let segW = (barW - segGap * (numSegs - 1)) / numSegs;
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(barX - 3, barY - 3, barW + 6, barH + 6);
  for (let i = 0; i < numSegs; i++) {
    let sx = barX + i * (segW + segGap);
    let segStart = i / numSegs;
    ctx.fillStyle = 'rgba(60,15,15,0.8)';
    ctx.fillRect(sx, barY, segW, barH);
    if (hpPct > segStart) {
      let fillFrac = Math.min(1, (hpPct - segStart) * numSegs);
      let r, g, b;
      if (hpPct > 0.6) { r = Math.round(40 + 180 * (1 - hpPct)); g = 230; b = 30; }
      else if (hpPct > 0.3) { r = 255; g = Math.round(230 * (hpPct - 0.3) / 0.3); b = 20; }
      else { r = 255; g = Math.round(50 * hpPct / 0.3); b = 20; }
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(sx, barY, segW * fillFrac, barH);
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(sx, barY, segW * fillFrac, barH / 3);
    }
    if (hudSegFlicker[i] && hudSegFlicker[i] > 0) {
      let fI = hudSegFlicker[i] * 2;
      ctx.fillStyle = `rgba(255,80,40,${fI * 0.7 * (0.5 + Math.random() * 0.5)})`;
      ctx.fillRect(sx, barY, segW, barH);
    }
    ctx.strokeStyle = 'rgba(255,80,60,0.25)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(sx, barY, segW, barH);
  }
  ctx.strokeStyle = hpPct > 0.3 ? '#f55' : '#f00';
  ctx.lineWidth = 1;
  ctx.strokeRect(barX - 1, barY - 1, barW + 2, barH + 2);
  if (hpPct <= 0.25) {
    ctx.strokeStyle = `rgba(255,0,0,${0.3 + Math.sin(gameTime * 8) * 0.2})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(barX - 2, barY - 2, barW + 4, barH + 4);
  }
  ctx.fillStyle = hpPct > 0.5 ? '#cfc' : hpPct > 0.25 ? '#ffa' : '#faa';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('HP', barX, barY - 5);
  ctx.textAlign = 'right';
  ctx.fillText(Math.ceil(player.hp) + '/' + player.maxHp, barX + barW, barY - 5);
  ctx.textAlign = 'left';

  // === ARMOR BAR WITH HEX PATTERN + SHIMMER ===
  let arBarY = barY - 26;
  let arBarH = 12;
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(barX - 3, arBarY - 3, barW + 6, arBarH + 6);
  let arPct = player.armor / player.maxArmor;
  let arGrad = ctx.createLinearGradient(barX, arBarY, barX + barW * arPct, arBarY);
  arGrad.addColorStop(0, '#1a4a8a');
  arGrad.addColorStop(0.5, '#2a6adf');
  arGrad.addColorStop(1, '#48aaff');
  ctx.fillStyle = arGrad;
  ctx.fillRect(barX, arBarY, barW * arPct, arBarH);
  if (arPct > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(barX, arBarY, barW * arPct, arBarH);
    ctx.clip();
    ctx.strokeStyle = 'rgba(100,180,255,0.2)';
    ctx.lineWidth = 0.5;
    let hexSize = 6;
    for (let hy = arBarY - hexSize; hy < arBarY + arBarH + hexSize; hy += hexSize * 1.5) {
      for (let hx = barX; hx < barX + barW; hx += hexSize * 1.8) {
        let ox = (Math.floor((hy - arBarY) / hexSize) % 2) * hexSize * 0.9;
        ctx.beginPath();
        for (let a = 0; a < 6; a++) {
          let ang = Math.PI / 3 * a - Math.PI / 6;
          let px = hx + ox + Math.cos(ang) * hexSize * 0.5;
          let py = hy + Math.sin(ang) * hexSize * 0.5;
          a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath(); ctx.stroke();
      }
    }
    let shimmerX = barX + hudArmorShimmer * barW * 1.4 - barW * 0.2;
    let shimGrad = ctx.createLinearGradient(shimmerX - 20, 0, shimmerX + 20, 0);
    shimGrad.addColorStop(0, 'rgba(150,200,255,0)');
    shimGrad.addColorStop(0.5, 'rgba(150,200,255,0.15)');
    shimGrad.addColorStop(1, 'rgba(150,200,255,0)');
    ctx.fillStyle = shimGrad;
    ctx.fillRect(barX, arBarY, barW * arPct, arBarH);
    ctx.restore();
  }
  if (arPct >= 1) {
    ctx.fillStyle = `rgba(100,180,255,${0.08 + Math.sin(gameTime * 3) * 0.04})`;
    ctx.fillRect(barX, arBarY, barW, arBarH);
  }
  ctx.strokeStyle = '#48f';
  ctx.lineWidth = 1;
  ctx.strokeRect(barX - 1, arBarY - 1, barW + 2, arBarH + 2);
  ctx.fillStyle = '#8af';
  ctx.font = 'bold 9px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('ARMOR', barX, arBarY - 4);
  ctx.textAlign = 'right';
  ctx.fillText(Math.ceil(player.armor).toString(), barX + barW, arBarY - 4);
  ctx.textAlign = 'left';

  // === STAMINA BAR ===
  let stBarY = arBarY - 22;
  let stW = 140, stBarH = 8;
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(barX - 2, stBarY - 2, stW + 4, stBarH + 4);
  let stPct = player.stamina / player.maxStamina;
  let stGrad = ctx.createLinearGradient(barX, stBarY, barX + stW * stPct, stBarY);
  stGrad.addColorStop(0, '#a80');
  stGrad.addColorStop(1, '#fc4');
  ctx.fillStyle = stGrad;
  ctx.fillRect(barX, stBarY, stW * stPct, stBarH);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(barX, stBarY, stW * stPct, stBarH / 3);
  ctx.strokeStyle = '#fa0';
  ctx.lineWidth = 1;
  ctx.strokeRect(barX, stBarY, stW, stBarH);
  ctx.fillStyle = '#fc8';
  ctx.font = 'bold 8px monospace';
  ctx.fillText('SPRINT', barX + 1, stBarY - 3);

  // === WEAPON DISPLAY WITH ICON + AMMO GLOW ===
  let wi = weapons[player.curWeapon];
  let wX = 20, wY = H - 100;
  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.fillRect(wX - 2, wY - 2, 205, 24);
  ctx.strokeStyle = 'rgba(0,221,255,0.2)';
  ctx.lineWidth = 1;
  ctx.strokeRect(wX - 2, wY - 2, 205, 24);
  // Weapon silhouette icon
  ctx.save();
  ctx.fillStyle = '#0df';
  ctx.globalAlpha = 0.5;
  let iconX = wX + 4, iconY = wY + 3;
  if (player.curWeapon === 0) { ctx.fillRect(iconX, iconY + 4, 10, 4); ctx.fillRect(iconX + 6, iconY + 2, 3, 10); ctx.fillRect(iconX + 1, iconY + 8, 4, 5); }
  else if (player.curWeapon === 1) { ctx.fillRect(iconX, iconY + 4, 14, 4); ctx.fillRect(iconX + 8, iconY + 2, 3, 10); ctx.fillRect(iconX + 2, iconY + 8, 4, 5); ctx.fillRect(iconX - 2, iconY + 5, 4, 2); }
  else if (player.curWeapon === 2) { ctx.fillRect(iconX, iconY + 5, 16, 3); ctx.fillRect(iconX, iconY + 4, 16, 1); ctx.fillRect(iconX + 10, iconY + 3, 3, 8); }
  else if (player.curWeapon === 3) { ctx.fillRect(iconX, iconY + 4, 13, 5); ctx.fillRect(iconX + 9, iconY + 2, 4, 9); ctx.beginPath(); ctx.arc(iconX + 3, iconY + 6, 3, 0, Math.PI * 2); ctx.fill(); }
  else if (player.curWeapon === 4) { ctx.fillRect(iconX, iconY + 4, 14, 4); ctx.fillRect(iconX + 10, iconY + 2, 3, 9); ctx.fillRect(iconX - 2, iconY + 3, 5, 6); }
  else { ctx.fillRect(iconX, iconY + 5, 18, 3); ctx.fillRect(iconX + 12, iconY + 2, 3, 10); ctx.fillRect(iconX - 1, iconY + 4, 3, 5); ctx.fillRect(iconX + 4, iconY + 3, 2, 7); }
  ctx.globalAlpha = 1;
  ctx.restore();
  // Weapon name
  ctx.fillStyle = '#0df';
  ctx.font = 'bold 13px monospace';
  ctx.fillText(wi.name, wX + 24, wY + 15);
  // Ammo counter with glow
  let ammoStr = player.curWeapon === 0 ? 'INF' : player.ammo[player.curWeapon].toString();
  let ammoMax = wi.ammo === Infinity ? 999 : wi.ammo;
  let ammoPct = player.curWeapon === 0 ? 1 : player.ammo[player.curWeapon] / ammoMax;
  let ammoColor = ammoPct > 0.5 ? '#4f4' : ammoPct > 0.2 ? '#ff0' : '#f44';
  ctx.fillStyle = ammoColor;
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(ammoStr, wX + 200, wY + 16);
  if (ammoPct <= 0.2 && ammoPct > 0) {
    ctx.save();
    ctx.globalAlpha = 0.25 + Math.sin(gameTime * 6) * 0.15;
    ctx.shadowColor = '#f44';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#f44';
    ctx.fillText(ammoStr, wX + 200, wY + 16);
    ctx.restore();
  }
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(0,221,255,0.4)';
  ctx.font = '7px monospace';
  ctx.textAlign = 'right';
  ctx.fillText('AMMO', wX + 200, wY + 3);
  ctx.textAlign = 'left';

  // === WEAPON SLOTS ===
  for (let i = 0; i < 6; i++) {
    let sx = wX + i * 33, sy = wY - 20;
    let isActive = i === player.curWeapon;
    let hasAmmo = (i === 0 || player.ammo[i] > 0);
    ctx.fillStyle = isActive ? 'rgba(0,221,255,0.25)' : 'rgba(0,0,0,0.45)';
    ctx.fillRect(sx, sy, 29, 15);
    if (isActive) {
      ctx.strokeStyle = '#0df'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(sx + 12, sy + 17); ctx.lineTo(sx + 14.5, sy + 15); ctx.lineTo(sx + 17, sy + 17); ctx.closePath();
      ctx.fillStyle = '#0df'; ctx.fill();
    } else {
      ctx.strokeStyle = hasAmmo ? '#334' : '#222'; ctx.lineWidth = 1;
    }
    ctx.strokeRect(sx, sy, 29, 15);
    ctx.fillStyle = hasAmmo ? (isActive ? '#fff' : '#899') : '#334';
    ctx.font = isActive ? 'bold 9px monospace' : '9px monospace';
    ctx.fillText((i + 1) + ':' + weapons[i].name.slice(0, 3), sx + 2, sy + 11);
  }

  // === CORNER BRACKETS (bottom-right HUD frame) ===
  let frR_L = W - 145, frR_B = H - 8, frR_W = 138, frR_H = 90;
  ctx.strokeStyle = 'rgba(0,221,255,0.25)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(frR_L, frR_B - brkLen); ctx.lineTo(frR_L, frR_B); ctx.lineTo(frR_L + brkLen, frR_B); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(frR_L, frR_B - frR_H + brkLen); ctx.lineTo(frR_L, frR_B - frR_H); ctx.lineTo(frR_L + brkLen, frR_B - frR_H); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(frR_L + frR_W - brkLen, frR_B); ctx.lineTo(frR_L + frR_W, frR_B); ctx.lineTo(frR_L + frR_W, frR_B - brkLen); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(frR_L + frR_W - brkLen, frR_B - frR_H); ctx.lineTo(frR_L + frR_W, frR_B - frR_H); ctx.lineTo(frR_L + frR_W, frR_B - frR_H + brkLen); ctx.stroke();

  // Keycard indicators
  let kcX = W - 120, kcY = H - 50;
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(kcX - 4, kcY - 4, 108, 28);
  let kcColors = [{ key: 'blue', c: '#44f' }, { key: 'red', c: '#f44' }, { key: 'gold', c: '#fd0' }];
  for (let i = 0; i < 3; i++) {
    let kx = kcX + i * 34;
    let has = player.keycards[kcColors[i].key];
    ctx.fillStyle = has ? kcColors[i].c : '#222';
    ctx.fillRect(kx, kcY, 28, 18);
    if (has) {
      ctx.globalAlpha = 0.3 + Math.sin(gameTime * 3 + i) * 0.1;
      ctx.fillStyle = kcColors[i].c;
      ctx.fillRect(kx - 2, kcY - 2, 32, 22);
      ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = has ? kcColors[i].c : '#444';
    ctx.lineWidth = 1;
    ctx.strokeRect(kx, kcY, 28, 18);
    ctx.fillStyle = has ? '#fff' : '#555';
    ctx.font = 'bold 8px monospace';
    ctx.fillText(kcColors[i].key[0].toUpperCase(), kx + 10, kcY + 12);
  }

  // === Level + objective with tech frame ===
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(W / 2 - 135, 4, 270, 28);
  ctx.strokeStyle = 'rgba(0,221,255,0.35)';
  ctx.lineWidth = 1;
  let tbL = W / 2 - 135, tbR = W / 2 + 135, tbT = 4, tbB = 32;
  ctx.beginPath(); ctx.moveTo(tbL, tbT + 8); ctx.lineTo(tbL, tbT); ctx.lineTo(tbL + 10, tbT); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(tbR - 10, tbT); ctx.lineTo(tbR, tbT); ctx.lineTo(tbR, tbT + 8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(tbL, tbB - 8); ctx.lineTo(tbL, tbB); ctx.lineTo(tbL + 10, tbB); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(tbR - 10, tbB); ctx.lineTo(tbR, tbB); ctx.lineTo(tbR, tbB - 8); ctx.stroke();
  ctx.strokeStyle = 'rgba(0,221,255,0.15)';
  ctx.beginPath(); ctx.moveTo(tbL + 12, tbT + 14); ctx.lineTo(tbL + 25, tbT + 14); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(tbR - 25, tbT + 14); ctx.lineTo(tbR - 12, tbT + 14); ctx.stroke();
  ctx.fillStyle = '#0df';
  ctx.font = 'bold 12px monospace';
  ctx.textAlign = 'center';
  let objective = 'FIND BLUE KEYCARD';
  if (player.keycards.blue && !player.keycards.red && level >= 2) objective = 'FIND RED KEYCARD';
  else if (player.keycards.blue && !player.keycards.gold && level >= 3) objective = 'FIND GOLD KEYCARD';
  else if (player.keycards.blue && !terminalHacked) objective = 'HACK TERMINAL [E]';
  if (terminalHacked) objective = 'EVACUATE NOW!';
  if (countdownActive && countdownTime < 15) objective = 'RUN!!';
  ctx.fillText('LVL ' + level + ' - ' + objective, W / 2, 22);
  ctx.textAlign = 'left';

  // Countdown
  if (countdownActive) {
    let pulse = countdownTime < 10 ? Math.sin(gameTime * 8) * 0.3 + 0.7 : 1;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(W / 2 - 60, 34, 120, 30);
    ctx.fillStyle = countdownTime < 10 ? `rgba(255,50,50,${pulse})` : '#f44';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(Math.ceil(countdownTime).toString().padStart(2, '0'), W / 2, 58);
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#f88';
    ctx.fillText('COUNTDOWN', W / 2, 44);
    ctx.textAlign = 'left';

    // Exit direction arrow
    let er = rooms.find(r => r.type === ROOM_EXIT);
    if (er) {
      let edx = er.cx * T + T / 2 - player.x, edy = er.cy * T + T / 2 - player.y;
      let eDist = Math.sqrt(edx * edx + edy * edy);
      let eAngle = Math.atan2(edy, edx);
      let arrowDist = Math.min(80, eDist * 0.3);
      let ax = W / 2 + Math.cos(eAngle) * arrowDist;
      let ay = H / 2 + Math.sin(eAngle) * arrowDist;
      let aPulse = 0.5 + Math.sin(gameTime * 8) * 0.4;
      ctx.save();
      ctx.translate(ax, ay);
      ctx.rotate(eAngle);
      ctx.globalAlpha = aPulse;
      ctx.fillStyle = '#0df';
      ctx.beginPath();
      ctx.moveTo(14, 0); ctx.lineTo(-6, -8); ctx.lineTo(-2, 0); ctx.lineTo(-6, 8);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = '#0df';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(Math.round(eDist / T) + 'm', W / 2, 72);
      ctx.textAlign = 'left';
      ctx.globalAlpha = 1;
    }
  }

  // Interaction prompts
  if (player.alive && !terminalHacked) {
    let sr = rooms.find(r => r.type === ROOM_SERVER);
    if (sr) {
      let dx = player.x - (sr.cx * T + T / 2), dy = player.y - (sr.cy * T + T / 2);
      if (Math.sqrt(dx * dx + dy * dy) < T * 2 && hackProgress <= 0) {
        ctx.globalAlpha = 0.6 + Math.sin(gameTime * 4) * 0.2;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(W / 2 - 70, H / 2 + 30, 140, 22);
        ctx.fillStyle = '#0f0';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('HOLD [E] TO HACK', W / 2, H / 2 + 45);
        ctx.textAlign = 'left';
        ctx.globalAlpha = 1;
      }
    }
  }
  if (exitOpen && player.alive) {
    let er = rooms.find(r => r.type === ROOM_EXIT);
    if (er) {
      let dx = player.x - (er.cx * T + T / 2), dy = player.y - (er.cy * T + T / 2);
      if (Math.sqrt(dx * dx + dy * dy) < T * 2) {
        ctx.globalAlpha = 0.6 + Math.sin(gameTime * 5) * 0.3;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(W / 2 - 80, H / 2 + 30, 160, 22);
        ctx.fillStyle = '#0df';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PRESS [E] TO EVACUATE', W / 2, H / 2 + 45);
        ctx.textAlign = 'left';
        ctx.globalAlpha = 1;
      }
    }
  }

  // Room entry notification
  if (roomAlertTimer > 0) {
    if (roomFlashTimer > 0 && roomFlashImportant) {
      let flashProg = 1 - roomFlashTimer / 1.2;
      let fadeAlpha = flashProg < 0.15 ? flashProg / 0.15 : flashProg > 0.7 ? (1 - flashProg) / 0.3 : 1;
      fadeAlpha = Math.max(0, Math.min(1, fadeAlpha));
      ctx.globalAlpha = fadeAlpha * 0.9;
      let sweepX = flashProg * W * 1.4 - W * 0.2;
      let sweepW = 120;
      let sweepColor = roomFlashName === 'BOSS CHAMBER' ? '#f44' : roomFlashName === 'SERVER ROOM' ? '#0f0' : '#fd0';
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(W / 2 - 140, H * 0.28 - 5, 280, 36);
      ctx.fillStyle = sweepColor;
      ctx.globalAlpha = fadeAlpha * 0.5;
      let clampL = Math.max(W / 2 - 140, sweepX);
      let clampR = Math.min(W / 2 + 140, sweepX + sweepW);
      if (clampR > clampL) ctx.fillRect(clampL, H * 0.28 - 5, clampR - clampL, 36);
      ctx.globalAlpha = fadeAlpha * 0.9;
      ctx.fillStyle = sweepColor;
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'center';
      let glitchOff = flashProg < 0.3 ? (Math.random() - 0.5) * 4 : 0;
      ctx.fillText(roomFlashName, W / 2 + glitchOff, H * 0.28 + 23);
      ctx.fillStyle = sweepColor;
      ctx.globalAlpha = fadeAlpha * 0.4;
      ctx.fillRect(W / 2 - 140, H * 0.28 - 5, 280, 1);
      ctx.fillRect(W / 2 - 140, H * 0.28 + 31, 280, 1);
      ctx.textAlign = 'left';
      ctx.globalAlpha = 1;
    } else {
      let rAlpha = roomAlertTimer > 1.5 ? Math.min(1, (2 - roomAlertTimer) * 4) : roomAlertTimer / 1.5;
      ctx.globalAlpha = rAlpha * 0.8;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(W / 2 - 80, H * 0.3 - 8, 160, 22);
      ctx.fillStyle = '#0df';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(roomAlert, W / 2, H * 0.3 + 8);
      ctx.textAlign = 'left';
      ctx.globalAlpha = 1;
    }
  }

  // Locked door warning
  if (lockedDoorTimer > 0) {
    let ldAlpha = Math.min(1, lockedDoorTimer) * 0.9;
    ctx.globalAlpha = ldAlpha;
    let ldColor = lockedDoorMsg.includes('BLUE') ? '#44f' : lockedDoorMsg.includes('RED') ? '#f44' : '#fd0';
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.font = 'bold 12px monospace';
    let tw = ctx.measureText(lockedDoorMsg).width;
    ctx.fillRect(W / 2 - tw / 2 - 8, H * 0.55 - 8, tw + 16, 24);
    ctx.strokeStyle = ldColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(W / 2 - tw / 2 - 8, H * 0.55 - 8, tw + 16, 24);
    ctx.fillStyle = ldColor;
    ctx.textAlign = 'center';
    ctx.fillText(lockedDoorMsg, W / 2, H * 0.55 + 8);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }

  // Power-up active indicator
  if (powerUp.timer > 0) {
    let puColors = { speed: '#0ff', damage: '#f4f', shield: '#4f4' };
    let puNames = { speed: 'SPEED', damage: 'DAMAGE x2', shield: 'SHIELD REGEN' };
    let puC = puColors[powerUp.type] || '#fff';
    let puN = puNames[powerUp.type] || '';
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(W / 2 - 55, H - 30, 110, 22);
    ctx.fillStyle = puC;
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(puN + ' ' + Math.ceil(powerUp.timer) + 's', W / 2, H - 14);
    ctx.strokeStyle = puC;
    ctx.globalAlpha = 0.4 + Math.sin(gameTime * 6) * 0.3;
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, W - 4, H - 4);
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }

  // === KILL COUNTER + STREAK ===
  renderKillDisplay(ctx);

  // Alarm warning HUD
  if (alarmActive) {
    let alPulse = 0.5 + Math.sin(gameTime * 8) * 0.4;
    ctx.globalAlpha = alPulse;
    ctx.fillStyle = 'rgba(200,0,0,0.15)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#f00';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ALARM ACTIVE', W / 2, H * 0.15);
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = '#f88';
    ctx.fillText(Math.ceil(alarmTimer) + 's', W / 2, H * 0.15 + 16);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
    ctx.strokeStyle = `rgba(255,0,0,${alPulse * 0.6})`;
    ctx.lineWidth = 3;
    ctx.strokeRect(1, 1, W - 2, H - 2);
  }

  // Structure collapse warning
  if (!collapseTriggered && collapseWalls.length > 0 && collapseTimer <= 10) {
    let wPulse = 0.5 + Math.sin(gameTime * 6) * 0.4;
    ctx.globalAlpha = wPulse * 0.8;
    ctx.fillStyle = '#fa0';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('STRUCTURAL INTEGRITY FAILING', W / 2, H * 0.42);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }

  // Flicker warning
  if (flickering) {
    ctx.globalAlpha = 0.4 + Math.random() * 0.3;
    ctx.fillStyle = '#f00';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('POWER FAILURE', W / 2, H * 0.38);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }

  // Hack progress
  if (!terminalHacked && hackProgress > 0) {
    let hx = W / 2 - 60, hy = H / 2 + 40;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(hx - 2, hy - 2, 124, 18);
    ctx.fillStyle = '#0f0';
    ctx.fillRect(hx, hy, 120 * (hackProgress / 3), 14);
    ctx.strokeStyle = '#0f0';
    ctx.strokeRect(hx, hy, 120, 14);
    ctx.fillStyle = '#0f0';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('HACKING...', W / 2, hy + 11);
    ctx.textAlign = 'left';
  }

  // Boss health bar
  renderBossBar(ctx);

  // Kill feed (top right)
  for (let i = 0; i < killFeed.length; i++) {
    let kf = killFeed[i];
    let alpha = Math.min(1, kf.life / 2);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    let kfY = 60 + i * 20;
    let tw = ctx.measureText(kf.msg).width;
    ctx.fillRect(W - tw - 20, kfY - 2, tw + 16, 18);
    ctx.fillStyle = '#0df';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(kf.msg, W - 12, kfY + 11);
    ctx.textAlign = 'left';
  }
  ctx.globalAlpha = 1;

  // Damage numbers
  for (let d of damageNums) {
    let sx = d.x - camX + shakeX, sy = d.y - camY + shakeY;
    let alpha = d.life / d.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = d.color;
    let displayText = d.text || d.dmg.toString();
    let fontSize = d.text ? 'bold 18px monospace' : 'bold 14px monospace';
    ctx.font = fontSize;
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.lineWidth = 3;
    ctx.strokeText(displayText, sx, sy);
    ctx.fillText(displayText, sx, sy);
    ctx.textAlign = 'left';
  }
  ctx.globalAlpha = 1;

  // Proximity danger indicators
  renderProximityIndicators(ctx);

  // Minimap
  renderMinimap(ctx);

  // Full map overlay
  if (showMap) renderFullMap(ctx);

  // Crosshair
  if (state === ST_PLAY) {
    let cx = getMouseX(), cy = getMouseY();
    ctx.strokeStyle = countdownActive ? '#f44' : '#0df';
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.8;
    let crSize = 8;
    ctx.beginPath(); ctx.moveTo(cx - crSize, cy); ctx.lineTo(cx - 3, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 3, cy); ctx.lineTo(cx + crSize, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy - crSize); ctx.lineTo(cx, cy - 3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy + 3); ctx.lineTo(cx, cy + crSize); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 2, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

// --- Kill counter + streak display ---
function renderKillDisplay(ctx) {
  let kcountX = W - 130, kcountY = H - 80;
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(kcountX - 4, kcountY - 2, 120, 24);
  ctx.strokeStyle = 'rgba(0,221,255,0.2)';
  ctx.lineWidth = 1;
  ctx.strokeRect(kcountX - 4, kcountY - 2, 120, 24);
  ctx.strokeStyle = 'rgba(0,221,255,0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(kcountX - 4, kcountY + 4); ctx.lineTo(kcountX - 4, kcountY - 2); ctx.lineTo(kcountX + 2, kcountY - 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(kcountX + 110, kcountY - 2); ctx.lineTo(kcountX + 116, kcountY - 2); ctx.lineTo(kcountX + 116, kcountY + 4); ctx.stroke();
  ctx.fillStyle = '#0df';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('KILLS', kcountX, kcountY + 9);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(totalKills.toString(), kcountX + 112, kcountY + 17);
  ctx.textAlign = 'left';

  // Active kill streak display
  if (killStreak >= 2 && killStreakTimer > 0) {
    let streakAlpha = Math.min(1, killStreakTimer);
    ctx.globalAlpha = streakAlpha * 0.9;
    let streakText = killStreak + 'x STREAK';
    ctx.font = 'bold 16px monospace';
    let stw = ctx.measureText(streakText).width;
    let streakBoxW = stw + 30;
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(W / 2 - streakBoxW / 2, H * 0.20 - 12, streakBoxW, 28);
    let streakColor = killStreak >= 8 ? '#f22' : killStreak >= 5 ? '#f44' : killStreak >= 3 ? '#fa0' : '#ff0';
    ctx.strokeStyle = streakColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(W / 2 - streakBoxW / 2, H * 0.20 - 12, streakBoxW, 28);
    if (killStreak >= 5) {
      ctx.save();
      ctx.shadowColor = streakColor;
      ctx.shadowBlur = 15;
      ctx.strokeRect(W / 2 - streakBoxW / 2, H * 0.20 - 12, streakBoxW, 28);
      ctx.restore();
    }
    ctx.fillStyle = streakColor;
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(streakText, W / 2, H * 0.20 + 7);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }

  // Kill streak label popup
  if (hudKillStreakLabelTimer > 0) {
    let lAlpha = Math.min(1, hudKillStreakLabelTimer) * 0.95;
    ctx.globalAlpha = lAlpha;
    ctx.font = 'bold 20px monospace';
    let lblW = ctx.measureText(hudKillStreakLabel).width;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(W / 2 - lblW / 2 - 12, H * 0.27 - 14, lblW + 24, 32);
    let lblColor = hudKillStreakLabel.includes('GODLIKE') ? '#f0f' : hudKillStreakLabel.includes('UNSTOPPABLE') ? '#f22' : hudKillStreakLabel.includes('RAMPAGE') ? '#f44' : hudKillStreakLabel.includes('ULTRA') ? '#f44' : hudKillStreakLabel.includes('SPREE') ? '#fa0' : hudKillStreakLabel.includes('MEGA') ? '#fa0' : hudKillStreakLabel.includes('TRIPLE') ? '#ff0' : hudKillStreakLabel.includes('MULTI') ? '#ff0' : hudKillStreakLabel.includes('DOUBLE') ? '#0df' : '#0df';
    ctx.strokeStyle = lblColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(W / 2 - lblW / 2 - 12, H * 0.27 - 14, lblW + 24, 32);
    ctx.fillStyle = lblColor;
    ctx.textAlign = 'center';
    ctx.save();
    ctx.shadowColor = lblColor;
    ctx.shadowBlur = 20;
    ctx.fillText(hudKillStreakLabel, W / 2, H * 0.27 + 10);
    ctx.restore();
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }

  // Streak announcement
  if (streakAnnounceTimer > 0) {
    let t = streakAnnounceTimer;
    let maxT = 2.5;
    let progress = 1 - t / maxT;
    let scale = progress < 0.15 ? 1 + 2 * (1 - progress / 0.15) : 1;
    let alpha = t < 0.5 ? t / 0.5 : 1;
    let fontSize = Math.floor(36 * scale);
    ctx.save();
    ctx.globalAlpha = alpha * 0.95;
    ctx.font = 'bold ' + fontSize + 'px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = streakAnnounceColor;
    ctx.shadowBlur = 20 + 10 * Math.sin(gameTime * 10);
    let tw = ctx.measureText(streakAnnounceText).width;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(W / 2 - tw / 2 - 20, H * 0.35 - fontSize / 2 - 10, tw + 40, fontSize + 20);
    ctx.strokeStyle = 'rgba(0,0,0,0.9)';
    ctx.lineWidth = 4;
    ctx.strokeText(streakAnnounceText, W / 2, H * 0.35);
    ctx.fillStyle = streakAnnounceColor;
    ctx.fillText(streakAnnounceText, W / 2, H * 0.35);
    ctx.shadowBlur = 0;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    ctx.restore();
  }
}

// --- Boss health bar ---
function renderBossBar(ctx) {
  if (!bossInView) return;
  let isCmd = bossInView.type === EN_COMMANDER;
  let bossLabel = isCmd ? 'COMMANDER' : bossInView.rogue ? 'ROGUE HEAVY' : 'MINI-BOSS';
  let bossColor = isCmd ? '#a4f' : '#ff2200';
  let barW = isCmd ? 400 : 300;
  let bx = W / 2 - barW / 2, by = 50;
  let totalH = isCmd ? 56 : 44;
  ctx.fillStyle = 'rgba(0,0,0,0.8)';
  ctx.fillRect(bx - 6, by - 22, barW + 12, totalH + 8);
  let glowA = 0.3 + Math.sin(gameTime * 3) * 0.15;
  ctx.strokeStyle = isCmd ? `rgba(170,68,255,${glowA})` : `rgba(255,34,0,${glowA})`;
  ctx.lineWidth = 2;
  ctx.strokeRect(bx - 6, by - 22, barW + 12, totalH + 8);
  let cL = 8;
  ctx.strokeStyle = bossColor;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(bx - 6, by - 22 + cL); ctx.lineTo(bx - 6, by - 22); ctx.lineTo(bx - 6 + cL, by - 22); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx + barW + 6 - cL, by - 22); ctx.lineTo(bx + barW + 6, by - 22); ctx.lineTo(bx + barW + 6, by - 22 + cL); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx - 6, by - 22 + totalH + 8 - cL); ctx.lineTo(bx - 6, by - 22 + totalH + 8); ctx.lineTo(bx - 6 + cL, by - 22 + totalH + 8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx + barW + 6 - cL, by - 22 + totalH + 8); ctx.lineTo(bx + barW + 6, by - 22 + totalH + 8); ctx.lineTo(bx + barW + 6, by - 22 + totalH + 8 - cL); ctx.stroke();
  ctx.fillStyle = bossColor;
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'center';
  ctx.shadowColor = bossColor;
  ctx.shadowBlur = isCmd ? 12 : 6;
  ctx.fillText(bossLabel, W / 2, by - 6);
  ctx.shadowBlur = 0;
  let lblW = ctx.measureText(bossLabel).width;
  ctx.strokeStyle = bossColor;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5;
  ctx.beginPath(); ctx.moveTo(bx, by - 10); ctx.lineTo(W / 2 - lblW / 2 - 10, by - 10); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W / 2 + lblW / 2 + 10, by - 10); ctx.lineTo(bx + barW, by - 10); ctx.stroke();
  ctx.globalAlpha = 1;
  // Shield bar
  if (bossInView.maxShield > 0) {
    let sPct = bossInView.shieldHp / bossInView.maxShield;
    ctx.fillStyle = 'rgba(30,15,50,0.8)';
    ctx.fillRect(bx, by, barW, 8);
    if (sPct > 0) {
      let sGrad = ctx.createLinearGradient(bx, by, bx + barW * sPct, by);
      sGrad.addColorStop(0, '#82f');
      sGrad.addColorStop(1, '#c6f');
      ctx.fillStyle = sGrad;
      ctx.fillRect(bx, by, barW * sPct, 8);
      let shimX = bx + ((gameTime * 80) % (barW + 40)) - 20;
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(Math.max(bx, shimX), by, Math.min(20, barW * sPct - (shimX - bx)), 8);
    }
    ctx.strokeStyle = '#a4f';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, barW, 8);
    ctx.fillStyle = '#c8f';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('SHIELD', bx + barW, by - 2);
    ctx.textAlign = 'center';
  }
  // Health bar
  let hpY = bossInView.maxShield > 0 ? by + 12 : by;
  let hpH = isCmd ? 18 : 14;
  let hpPct2 = bossInView.hp / bossInView.maxHp;
  ctx.fillStyle = 'rgba(40,10,10,0.8)';
  ctx.fillRect(bx, hpY, barW, hpH);
  if (hpPct2 > 0) {
    let hGrad = ctx.createLinearGradient(bx, hpY, bx + barW * hpPct2, hpY);
    if (hpPct2 > 0.5) { hGrad.addColorStop(0, '#c22'); hGrad.addColorStop(1, '#f44'); }
    else if (hpPct2 > 0.25) { hGrad.addColorStop(0, '#d40'); hGrad.addColorStop(1, '#f80'); }
    else { hGrad.addColorStop(0, '#f00'); hGrad.addColorStop(1, '#f44'); }
    ctx.fillStyle = hGrad;
    ctx.fillRect(bx, hpY, barW * hpPct2, hpH);
  }
  let segs = isCmd ? 20 : 10;
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  for (let i = 1; i < segs; i++) { ctx.fillRect(bx + barW * (i / segs) - 0.5, hpY, 1, hpH); }
  if (hpPct2 < 0.3) {
    let pulse = 0.5 + Math.sin(gameTime * 8) * 0.4;
    ctx.strokeStyle = `rgba(255,50,50,${pulse})`;
    ctx.lineWidth = 2;
    ctx.fillStyle = `rgba(255,0,0,${pulse * 0.05})`;
    ctx.fillRect(0, 0, W, H);
  } else {
    ctx.strokeStyle = isCmd ? '#a4f' : '#f44';
    ctx.lineWidth = 1;
  }
  ctx.strokeRect(bx, hpY, barW, hpH);
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(Math.ceil(hpPct2 * 100) + '%', W / 2, hpY + hpH - 4);
  ctx.textAlign = 'left';
}

// --- Proximity danger indicators ---
function renderProximityIndicators(ctx) {
  for (let e of enemies) {
    if (!e.alive) continue;
    let dx = e.x - player.x, dy = e.y - player.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 200 || dist < 10) continue;
    let sx = e.x - camX + shakeX, sy = e.y - camY + shakeY;
    if (sx > 30 && sx < W - 30 && sy > 30 && sy < H - 30) continue;
    let angle = Math.atan2(dy, dx);
    let indicX = W / 2 + Math.cos(angle) * Math.min(W / 2 - 20, dist * 0.8);
    let indicY = H / 2 + Math.sin(angle) * Math.min(H / 2 - 20, dist * 0.8);
    indicX = Math.max(15, Math.min(W - 15, indicX));
    indicY = Math.max(15, Math.min(H - 15, indicY));
    let alpha = 1 - dist / 200;
    ctx.save();
    ctx.translate(indicX, indicY);
    ctx.rotate(angle);
    ctx.globalAlpha = alpha * (0.5 + Math.sin(gameTime * 6) * 0.3);
    ctx.fillStyle = '#f00';
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.lineTo(-4, -5);
    ctx.lineTo(-4, 5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;

  // Commander off-screen warning indicator
  if (bossTarget && bossTarget.alive && !bossInView) {
    let dx = bossTarget.x - player.x, dy = bossTarget.y - player.y;
    let angle = Math.atan2(dy, dx);
    let edgeMargin = 30;
    let indicX = W / 2 + Math.cos(angle) * (W / 2 - edgeMargin);
    let indicY = H / 2 + Math.sin(angle) * (H / 2 - edgeMargin);
    indicX = Math.max(edgeMargin, Math.min(W - edgeMargin, indicX));
    indicY = Math.max(edgeMargin, Math.min(H - edgeMargin, indicY));
    let pulse = 0.5 + Math.sin(gameTime * 4) * 0.5;
    ctx.save();
    ctx.translate(indicX, indicY);
    ctx.rotate(angle);
    ctx.globalAlpha = pulse * 0.3;
    ctx.fillStyle = '#a4f';
    ctx.beginPath();
    ctx.moveTo(16, 0); ctx.lineTo(-8, -10); ctx.lineTo(-4, 0); ctx.lineTo(-8, 10);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = pulse * 0.8;
    ctx.fillStyle = '#a4f';
    ctx.shadowColor = '#a4f';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(12, 0); ctx.lineTo(-4, -6); ctx.lineTo(-2, 0); ctx.lineTo(-4, 6);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
    ctx.globalAlpha = pulse * 0.6;
    ctx.fillStyle = '#a4f';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    let lblX = indicX - Math.cos(angle) * 18;
    let lblY = indicY - Math.sin(angle) * 18;
    ctx.fillText('CMDR', lblX, lblY + 3);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }
}

// --- Minimap ---
function renderMinimap(ctx) {
  let mmSize = 120;
  let mmX = W - mmSize - 15, mmY = 15;
  let scale = mmSize / Math.max(mapW, mapH);

  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(mmX - 2, mmY - 2, mmSize + 4, mmSize + 4);
  ctx.strokeStyle = '#0df';
  ctx.lineWidth = 1;
  ctx.strokeRect(mmX - 2, mmY - 2, mmSize + 4, mmSize + 4);

  // Tiles
  for (let y = 0; y < mapH; y++) {
    for (let x = 0; x < mapW; x++) {
      if (!explored[y * mapW + x]) continue;
      let tile = map[y * mapW + x];
      let px = mmX + x * scale, py = mmY + y * scale;
      if (isFloorTile(tile)) {
        ctx.fillStyle = '#1a2a2a';
        ctx.fillRect(px, py, Math.max(1, scale), Math.max(1, scale));
      } else if (tile === TILE_WALL) {
        ctx.fillStyle = '#3a4a4a';
        ctx.fillRect(px, py, Math.max(1, scale), Math.max(1, scale));
      } else if (isDoor(tile)) {
        ctx.fillStyle = tile === TILE_DOOR_B ? '#44f' : tile === TILE_DOOR_R ? '#f44' : '#fd0';
        ctx.fillRect(px, py, Math.max(1, scale), Math.max(1, scale));
      } else if (tile === TILE_TERMINAL) {
        ctx.fillStyle = terminalHacked ? '#f00' : '#0f0';
        ctx.fillRect(px, py, Math.max(2, scale * 2), Math.max(2, scale * 2));
      } else if (tile === TILE_EXIT) {
        ctx.fillStyle = '#0df';
        ctx.fillRect(px, py, Math.max(2, scale * 2), Math.max(2, scale * 2));
      }
    }
  }

  // Toxic pools on minimap
  ctx.fillStyle = 'rgba(50,255,50,0.4)';
  for (let tp of toxicPools) {
    let tpx = mmX + (tp.x / T) * scale, tpy = mmY + (tp.y / T) * scale;
    ctx.beginPath(); ctx.arc(tpx, tpy, tp.radius / T * scale + 0.5, 0, Math.PI * 2); ctx.fill();
  }
  // Airdrops on minimap
  for (let ad of airdrops) {
    if (ad.collected) continue;
    let ax = mmX + (ad.x / T) * scale, ay = mmY + (ad.y / T) * scale;
    ctx.fillStyle = ad.landed ? '#fd0' : 'rgba(255,220,0,0.5)';
    ctx.beginPath(); ctx.arc(ax, ay, ad.landed ? 2 : 1.5, 0, Math.PI * 2); ctx.fill();
  }
  // Barrels on minimap
  ctx.fillStyle = '#f80';
  for (let b of barrels) {
    if (!b.alive) continue;
    let bx = mmX + (b.x / T) * scale, by = mmY + (b.y / T) * scale;
    ctx.fillRect(bx - 0.5, by - 0.5, 1.5, 1.5);
  }

  // Pickups on minimap
  for (let pk of pickups) {
    if (pk.collected) continue;
    let ptx = Math.floor(pk.x / T), pty = Math.floor(pk.y / T);
    if (ptx < 0 || ptx >= mapW || pty < 0 || pty >= mapH || !explored[pty * mapW + ptx]) continue;
    let px = mmX + (pk.x / T) * scale, py = mmY + (pk.y / T) * scale;
    if (pk.type === 'keycard') {
      let kc = pk.subtype === 'blue' ? '#44f' : pk.subtype === 'red' ? '#f44' : '#fd0';
      ctx.fillStyle = kc;
      ctx.globalAlpha = 0.7 + Math.sin(gameTime * 4) * 0.3;
      ctx.beginPath(); ctx.arc(px, py - 1, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(px - 0.5, py, 1, 3);
      ctx.fillRect(px - 0.5, py + 2, 2, 0.5);
      ctx.globalAlpha = 1;
    } else if (pk.type === 'weapon') {
      ctx.fillStyle = '#ff0';
      ctx.globalAlpha = 0.8;
      ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    } else if (pk.type === 'health') {
      ctx.fillStyle = '#4f4';
      ctx.fillRect(px - 0.5, py - 1.5, 1, 3);
      ctx.fillRect(px - 1.5, py - 0.5, 3, 1);
    } else if (pk.type === 'ammo') {
      ctx.fillStyle = '#fa0';
      ctx.fillRect(px - 0.5, py - 0.5, 1.5, 1.5);
    } else if (pk.type === 'powerup') {
      let puC = pk.subtype === 'speed' ? '#0ff' : pk.subtype === 'damage' ? '#f4f' : '#4f4';
      ctx.fillStyle = puC;
      ctx.globalAlpha = 0.6 + Math.sin(gameTime * 5) * 0.3;
      ctx.beginPath(); ctx.moveTo(px, py - 2); ctx.lineTo(px + 1.5, py); ctx.lineTo(px, py + 2); ctx.lineTo(px - 1.5, py); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // Objectives on minimap
  for (let r of rooms) {
    let rx = mmX + r.cx * scale, ry = mmY + r.cy * scale;
    if (!explored[r.cy * mapW + r.cx]) continue;
    if (r.type === ROOM_SERVER && !terminalHacked) {
      ctx.strokeStyle = '#f00';
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.7 + Math.sin(gameTime * 3) * 0.3;
      ctx.beginPath(); ctx.moveTo(rx - 3, ry - 3); ctx.lineTo(rx + 3, ry + 3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(rx + 3, ry - 3); ctx.lineTo(rx - 3, ry + 3); ctx.stroke();
      ctx.globalAlpha = 1;
    } else if (r.type === ROOM_EXIT) {
      ctx.strokeStyle = exitOpen ? '#0df' : '#556';
      ctx.lineWidth = 1;
      ctx.globalAlpha = exitOpen ? (0.5 + Math.sin(gameTime * 4) * 0.4) : 0.4;
      let eSize = 2 + Math.sin(gameTime * 3) * 0.5;
      ctx.beginPath(); ctx.arc(rx, ry, eSize, 0, Math.PI * 2); ctx.stroke();
      if (exitOpen) {
        ctx.fillStyle = '#0df';
        ctx.beginPath(); ctx.moveTo(rx, ry - 3.5); ctx.lineTo(rx + 2, ry - 1.5); ctx.lineTo(rx - 2, ry - 1.5); ctx.closePath(); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }

  // Enemies on minimap (if alert)
  for (let e of enemies) {
    if (!e.alive || !e.alert) continue;
    let ex = mmX + (e.x / T) * scale, ey = mmY + (e.y / T) * scale;
    ctx.fillStyle = e.type === EN_COMMANDER ? '#a4f' : '#f44';
    ctx.fillRect(ex - 1, ey - 1, 2, 2);
  }

  // Player
  let ppx = mmX + (player.x / T) * scale, ppy = mmY + (player.y / T) * scale;
  ctx.fillStyle = '#0df';
  ctx.beginPath(); ctx.arc(ppx, ppy, 2.5, 0, Math.PI * 2); ctx.fill();
  let pdx = Math.cos(player.angle) * 5, pdy = Math.sin(player.angle) * 5;
  ctx.strokeStyle = '#0df';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(ppx, ppy); ctx.lineTo(ppx + pdx, ppy + pdy); ctx.stroke();
}

// --- Full Map (Tab overlay) ---
function renderFullMap(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  ctx.fillRect(0, 0, W, H);

  let scale = Math.min((W - 40) / mapW, (H - 80) / mapH);
  let offX = (W - mapW * scale) / 2;
  let offY = (H - mapH * scale) / 2 + 20;

  for (let y = 0; y < mapH; y++) {
    for (let x = 0; x < mapW; x++) {
      if (!explored[y * mapW + x]) continue;
      let tile = map[y * mapW + x];
      let px = offX + x * scale, py = offY + y * scale;
      let s = Math.max(1, scale);
      if (isFloorTile(tile)) {
        ctx.fillStyle = '#1a2a2a';
        ctx.fillRect(px, py, s, s);
      } else if (tile === TILE_WALL) {
        ctx.fillStyle = '#3a4a4a';
        ctx.fillRect(px, py, s, s);
      } else if (isDoor(tile)) {
        ctx.fillStyle = tile === TILE_DOOR_B ? '#44f' : tile === TILE_DOOR_R ? '#f44' : '#fd0';
        ctx.fillRect(px, py, s, s);
      } else if (tile === TILE_TERMINAL) {
        ctx.fillStyle = terminalHacked ? '#f00' : '#0f0';
        ctx.fillRect(px, py, s * 2, s * 2);
      } else if (tile === TILE_EXIT) {
        ctx.fillStyle = '#0df';
        ctx.fillRect(px, py, s * 2, s * 2);
      }
    }
  }

  // Room labels
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'center';
  for (let r of rooms) {
    let rx = offX + r.cx * scale, ry = offY + r.cy * scale;
    let names = ['START', 'EXIT', 'SERVER', 'ARMORY', 'STORAGE', 'BOSS', 'PATROL'];
    ctx.fillStyle = r.type === ROOM_BOSS ? '#a4f' : r.type === ROOM_SERVER ? '#0f0' : r.type === ROOM_EXIT ? '#0df' : '#556';
    if (explored[r.cy * mapW + r.cx]) ctx.fillText(names[r.type], rx, ry - 5);
  }
  ctx.textAlign = 'left';

  // Player on full map
  let ppx = offX + (player.x / T) * scale, ppy = offY + (player.y / T) * scale;
  ctx.fillStyle = '#0df';
  ctx.beginPath(); ctx.arc(ppx, ppy, 4, 0, Math.PI * 2); ctx.fill();

  // Pickups on full map
  for (let pk of pickups) {
    if (pk.collected) continue;
    let ptx = Math.floor(pk.x / T), pty = Math.floor(pk.y / T);
    if (ptx < 0 || ptx >= mapW || pty < 0 || pty >= mapH || !explored[pty * mapW + ptx]) continue;
    let px = offX + (pk.x / T) * scale, py = offY + (pk.y / T) * scale;
    if (pk.type === 'keycard') {
      let kc = pk.subtype === 'blue' ? '#44f' : pk.subtype === 'red' ? '#f44' : '#fd0';
      ctx.fillStyle = kc;
      ctx.globalAlpha = 0.8 + Math.sin(gameTime * 4) * 0.2;
      ctx.beginPath(); ctx.arc(px, py - 2, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(px - 1, py + 1, 2, 5);
      ctx.fillRect(px, py + 4, 3, 1);
      ctx.fillRect(px, py + 3, 2, 1);
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(pk.subtype.toUpperCase(), px, py + 14);
      ctx.textAlign = 'left';
      ctx.globalAlpha = 1;
    } else if (pk.type === 'weapon') {
      ctx.fillStyle = '#ff0';
      ctx.globalAlpha = 0.8;
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('W', px, py + 3);
      ctx.textAlign = 'left';
      ctx.globalAlpha = 1;
    } else if (pk.type === 'health') {
      ctx.fillStyle = '#4f4';
      ctx.fillRect(px - 1, py - 3, 2, 6);
      ctx.fillRect(px - 3, py - 1, 6, 2);
    } else if (pk.type === 'ammo') {
      ctx.fillStyle = '#fa0';
      ctx.globalAlpha = 0.8;
      ctx.fillRect(px - 1, py - 2, 2, 4);
      ctx.fillStyle = '#fc0';
      ctx.fillRect(px - 1, py - 2, 2, 1.5);
      ctx.globalAlpha = 1;
    } else if (pk.type === 'powerup') {
      let puC = pk.subtype === 'speed' ? '#0ff' : pk.subtype === 'damage' ? '#f4f' : '#4f4';
      ctx.fillStyle = puC;
      ctx.globalAlpha = 0.6 + Math.sin(gameTime * 5) * 0.3;
      ctx.beginPath();
      ctx.save(); ctx.translate(px, py); ctx.rotate(gameTime * 2);
      for (let i = 0; i < 5; i++) { let a = (i / 5) * Math.PI * 2 - Math.PI / 2; ctx.lineTo(Math.cos(a) * 4, Math.sin(a) * 4); let a2 = a + Math.PI / 5; ctx.lineTo(Math.cos(a2) * 2, Math.sin(a2) * 2); }
      ctx.closePath(); ctx.fill(); ctx.restore();
      ctx.globalAlpha = 1;
    }
  }

  // Objective markers on full map
  for (let r of rooms) {
    let rx = offX + r.cx * scale, ry = offY + r.cy * scale;
    if (!explored[r.cy * mapW + r.cx]) continue;
    if (r.type === ROOM_SERVER && !terminalHacked) {
      ctx.strokeStyle = '#f00';
      ctx.lineWidth = 2.5;
      ctx.globalAlpha = 0.7 + Math.sin(gameTime * 3) * 0.3;
      ctx.beginPath(); ctx.moveTo(rx - 6, ry - 6); ctx.lineTo(rx + 6, ry + 6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(rx + 6, ry - 6); ctx.lineTo(rx - 6, ry + 6); ctx.stroke();
      ctx.strokeStyle = '#f44';
      ctx.lineWidth = 1;
      let oRad = 8 + Math.sin(gameTime * 4) * 2;
      ctx.beginPath(); ctx.arc(rx, ry, oRad, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#f44';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('HACK', rx, ry + 16);
      ctx.textAlign = 'left';
      ctx.globalAlpha = 1;
    } else if (r.type === ROOM_EXIT) {
      ctx.strokeStyle = exitOpen ? '#0df' : '#556';
      ctx.lineWidth = exitOpen ? 2 : 1;
      ctx.globalAlpha = exitOpen ? (0.6 + Math.sin(gameTime * 4) * 0.4) : 0.3;
      let eRad = 6 + Math.sin(gameTime * 3);
      ctx.beginPath(); ctx.arc(rx, ry, eRad, 0, Math.PI * 2); ctx.stroke();
      if (exitOpen) {
        ctx.fillStyle = '#0df';
        ctx.beginPath(); ctx.moveTo(rx, ry - 8); ctx.lineTo(rx + 4, ry - 3); ctx.lineTo(rx - 4, ry - 3); ctx.closePath(); ctx.fill();
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('EXIT', rx, ry + 14);
        ctx.textAlign = 'left';
      }
      ctx.globalAlpha = 1;
    }
  }

  // Enemies (only in explored areas)
  for (let e of enemies) {
    if (!e.alive) continue;
    let etx = Math.floor(e.x / T), ety = Math.floor(e.y / T);
    if (etx < 0 || etx >= mapW || ety < 0 || ety >= mapH || !explored[ety * mapW + etx]) continue;
    let ex = offX + (e.x / T) * scale, ey = offY + (e.y / T) * scale;
    ctx.fillStyle = e.type === EN_COMMANDER ? '#a4f' : '#f44';
    ctx.fillRect(ex - 1.5, ey - 1.5, 3, 3);
  }

  // Legend
  ctx.globalAlpha = 0.7;
  ctx.font = '10px monospace';
  let legY = H - 80;
  let legX = 20;
  ctx.fillStyle = '#0df'; ctx.beginPath(); ctx.arc(legX + 4, legY, 3, 0, Math.PI * 2); ctx.fill();
  ctx.fillText('YOU', legX + 12, legY + 3);
  ctx.fillStyle = '#f44'; ctx.fillRect(legX + 2, legY + 12, 4, 4);
  ctx.fillText('ENEMY', legX + 12, legY + 18);
  ctx.strokeStyle = '#f00'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(legX, legY + 26); ctx.lineTo(legX + 8, legY + 34); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(legX + 8, legY + 26); ctx.lineTo(legX, legY + 34); ctx.stroke();
  ctx.fillStyle = '#f44'; ctx.fillText('OBJECTIVE', legX + 12, legY + 33);
  ctx.fillStyle = '#fd0'; ctx.beginPath(); ctx.arc(legX + 4, legY + 42, 2, 0, Math.PI * 2); ctx.fill();
  ctx.fillText('KEYCARD', legX + 12, legY + 45);
  ctx.globalAlpha = 1;

  // Title
  ctx.fillStyle = '#0df';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('FACILITY MAP - TAB TO CLOSE', W / 2, 20);
  ctx.textAlign = 'left';
}
