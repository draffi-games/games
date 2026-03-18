// VOID PROTOCOL — Entity Rendering (enemies, player, pickups, barrels, etc.)

import { T, EN_SCOUT, EN_SENTINEL, EN_HEAVY, EN_COMMANDER } from '../core/constants.js';
import { enemies, player, pickups, barrels, airdrops, toxicPools, corpses, decals,
         playerTrail, gameTime, camX, camY, shakeX, shakeY, powerUp } from '../core/state.js';
import { W, H } from '../core/canvas.js';
import { keys } from '../core/input.js';
import { weapons } from '../entities/weapons.js';

// ===== Corpse debris =====
export function renderCorpses(ctx) {
  for (let c of corpses) {
    let sx = c.x - camX + shakeX, sy = c.y - camY + shakeY;
    if (sx < -30 || sx > W + 30 || sy < -30 || sy > H + 30) continue;
    let alpha = Math.min(1, c.life / 3) * 0.5;
    ctx.globalAlpha = alpha;
    // Scattered metal chunks
    ctx.fillStyle = c.tint;
    for (let ch of c.chunks) {
      ctx.save();
      ctx.translate(c.x + ch.ox, c.y + ch.oy);
      ctx.rotate(ch.a);
      ctx.fillRect(-ch.w / 2, -ch.h / 2, ch.w, ch.h);
      ctx.restore();
    }
    // Central wreck mark
    ctx.fillStyle = 'rgba(20,25,30,0.4)';
    ctx.beginPath(); ctx.ellipse(c.x, c.y, c.size * 0.8, c.size * 0.6, c.angle, 0, Math.PI * 2); ctx.fill();
    // Oil stain
    ctx.fillStyle = 'rgba(15,40,50,0.3)';
    ctx.beginPath(); ctx.ellipse(c.x + 2, c.y + 3, c.size * 0.6, c.size * 0.4, c.angle + 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
}

// ===== Floor decals =====
export function renderDecals(ctx) {
  for (let d of decals) {
    let sx = d.x - camX + shakeX, sy_check = d.y - camY + shakeY;
    if (sx < -20 || sx > W + 20 || sy_check < -20 || sy_check > H + 20) continue;
    ctx.globalAlpha = d.alpha;
    if (d.type === 'oil') {
      ctx.fillStyle = 'rgba(20,50,60,0.5)';
      ctx.beginPath();
      ctx.ellipse(d.x, d.y, d.size * 1.5, d.size, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (d.type === 'scorch') {
      ctx.fillStyle = 'rgba(30,20,10,0.5)';
      ctx.beginPath(); ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2); ctx.fill();
    } else if (d.type === 'bullet_hole') {
      ctx.fillStyle = 'rgba(10,10,10,0.6)';
      ctx.beginPath(); ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2); ctx.fill();
    } else if (d.type === 'plasma_burn') {
      ctx.fillStyle = 'rgba(20,30,60,0.5)';
      ctx.beginPath(); ctx.arc(d.x, d.y, d.size + 1, 0, Math.PI * 2); ctx.fill();
    } else if (d.type === 'footprint') {
      ctx.fillStyle = d.color;
      // Left boot
      ctx.beginPath(); ctx.ellipse(d.x - 2, d.y, d.size * 0.4, d.size * 0.7, 0, 0, Math.PI * 2); ctx.fill();
      // Right boot
      ctx.beginPath(); ctx.ellipse(d.x + 2, d.y, d.size * 0.4, d.size * 0.7, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}

// ===== Pickups with bob animation =====
export function renderPickups(ctx) {
  for (let pk of pickups) {
    if (pk.collected) continue;
    let sx = pk.x - camX + shakeX, sy_check = pk.y - camY + shakeY;
    if (sx < -20 || sx > W + 20 || sy_check < -20 || sy_check > H + 20) continue;
    let bob = Math.sin(gameTime * 3 + pk.x) * 3;
    let py = pk.y + bob;
    ctx.save();
    switch (pk.type) {
      case 'keycard':
        let kc = pk.subtype === 'blue' ? '#44f' : pk.subtype === 'red' ? '#f44' : '#fd0';
        ctx.fillStyle = kc;
        ctx.globalAlpha = 0.8;
        ctx.fillRect(pk.x - 6, py - 4, 12, 8);
        ctx.strokeStyle = kc;
        ctx.lineWidth = 1;
        ctx.strokeRect(pk.x - 7, py - 5, 14, 10);
        // Glow
        ctx.globalAlpha = 0.15 + Math.sin(gameTime * 4) * 0.05;
        ctx.beginPath(); ctx.arc(pk.x, py, 12, 0, Math.PI * 2); ctx.fillStyle = kc; ctx.fill();
        break;
      case 'health':
        ctx.fillStyle = '#4f4';
        ctx.fillRect(pk.x - 2, py - 5, 4, 10);
        ctx.fillRect(pk.x - 5, py - 2, 10, 4);
        break;
      case 'armor':
        ctx.fillStyle = '#48f';
        ctx.beginPath();
        ctx.moveTo(pk.x, py - 6); ctx.lineTo(pk.x + 6, py - 2); ctx.lineTo(pk.x + 4, py + 5);
        ctx.lineTo(pk.x, py + 7); ctx.lineTo(pk.x - 4, py + 5); ctx.lineTo(pk.x - 6, py - 2); ctx.closePath();
        ctx.fill();
        break;
      case 'ammo':
        ctx.fillStyle = '#fa0';
        ctx.fillRect(pk.x - 3, py - 5, 6, 10);
        ctx.fillStyle = '#fc0';
        ctx.fillRect(pk.x - 2, py - 4, 4, 3);
        break;
      case 'weapon':
        ctx.fillStyle = '#ff0';
        ctx.fillRect(pk.x - 8, py - 2, 16, 4);
        ctx.fillRect(pk.x + 4, py - 4, 3, 3);
        ctx.globalAlpha = 0.2;
        ctx.beginPath(); ctx.arc(pk.x, py, 10, 0, Math.PI * 2); ctx.fillStyle = '#ff0'; ctx.fill();
        break;
      case 'powerup':
        let puC = pk.subtype === 'speed' ? '#0ff' : pk.subtype === 'damage' ? '#f4f' : '#4f4';
        // Rotating star
        ctx.save();
        ctx.translate(pk.x, py);
        ctx.rotate(gameTime * 3);
        ctx.fillStyle = puC;
        for (let i = 0; i < 5; i++) {
          let a = (i / 5) * Math.PI * 2 - Math.PI / 2;
          let x2 = Math.cos(a) * 7, y2 = Math.sin(a) * 7;
          if (i === 0) ctx.beginPath();
          i === 0 ? ctx.moveTo(x2, y2) : ctx.lineTo(x2, y2);
          let a2 = a + Math.PI / 5;
          ctx.lineTo(Math.cos(a2) * 3, Math.sin(a2) * 3);
        }
        ctx.closePath(); ctx.fill();
        ctx.restore();
        // Glow pulse
        ctx.globalAlpha = 0.2 + Math.sin(gameTime * 5) * 0.1;
        ctx.fillStyle = puC;
        ctx.beginPath(); ctx.arc(pk.x, py, 14, 0, Math.PI * 2); ctx.fill();
        // Label
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = puC;
        ctx.font = 'bold 7px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(pk.subtype === 'speed' ? 'SPD' : pk.subtype === 'damage' ? 'DMG' : 'SHD', pk.x, py + 16);
        ctx.textAlign = 'left';
        break;
    }
    ctx.restore();
  }
}

// ===== Explosive barrels =====
export function renderBarrels(ctx) {
  for (let b of barrels) {
    if (!b.alive) continue;
    let sx = b.x - camX + shakeX, sy = b.y - camY + shakeY;
    if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) continue;
    // Barrel body
    ctx.fillStyle = '#553320';
    ctx.beginPath(); ctx.ellipse(b.x, b.y, 8, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#885530';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(b.x, b.y, 8, 10, 0, 0, Math.PI * 2); ctx.stroke();
    // Metal bands
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(b.x - 8, b.y - 3); ctx.lineTo(b.x + 8, b.y - 3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(b.x - 8, b.y + 3); ctx.lineTo(b.x + 8, b.y + 3); ctx.stroke();
    // Hazard symbol
    ctx.fillStyle = '#f80';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('!', b.x, b.y + 3);
    ctx.textAlign = 'left';
    // Damage glow when low HP
    if (b.hp < 10) {
      ctx.globalAlpha = 0.2 + Math.sin(gameTime * 10) * 0.15;
      ctx.fillStyle = '#f40';
      ctx.beginPath(); ctx.arc(b.x, b.y, 14, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
}

// ===== Airdrops =====
export function renderAirdrops(ctx) {
  for (let ad of airdrops) {
    if (ad.collected) continue;
    let sx = ad.x - camX + shakeX;
    let drawY = ad.landed ? ad.y : ad.fallY;
    let sy = drawY - camY + shakeY;
    if (sx < -30 || sx > W + 30 || sy < -30 || sy > H + 30) continue;
    // Drop shadow when falling
    if (!ad.landed) {
      let shadowAlpha = Math.max(0.05, 1 - (ad.targetY - ad.fallY) / 400 * 0.8);
      ctx.fillStyle = `rgba(0,0,0,${shadowAlpha * 0.3})`;
      ctx.beginPath(); ctx.ellipse(ad.x, ad.targetY, 10 * shadowAlpha, 4 * shadowAlpha, 0, 0, Math.PI * 2); ctx.fill();
    }
    // Crate body
    ctx.fillStyle = ad.landed ? '#7a6520' : '#9a8530';
    ctx.fillRect(ad.x - 10, drawY - 10, 20, 20);
    ctx.strokeStyle = '#fd0';
    ctx.lineWidth = 1;
    ctx.strokeRect(ad.x - 10, drawY - 10, 20, 20);
    // Cross lines
    ctx.strokeStyle = '#b89020';
    ctx.beginPath(); ctx.moveTo(ad.x - 10, drawY - 10); ctx.lineTo(ad.x + 10, drawY + 10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ad.x + 10, drawY - 10); ctx.lineTo(ad.x - 10, drawY + 10); ctx.stroke();
    // Star symbol
    ctx.fillStyle = '#fd0';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('*', ad.x, drawY + 4);
    ctx.textAlign = 'left';
    // Pulsing glow when landed
    if (ad.landed) {
      ctx.globalAlpha = 0.15 + Math.sin(gameTime * 4) * 0.1;
      ctx.fillStyle = '#fd0';
      ctx.beginPath(); ctx.arc(ad.x, ad.y, 18, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }
    // Parachute when falling
    if (!ad.landed) {
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(ad.x - 10, drawY - 10); ctx.lineTo(ad.x - 15, drawY - 35); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ad.x + 10, drawY - 10); ctx.lineTo(ad.x + 15, drawY - 35); ctx.stroke();
      ctx.fillStyle = 'rgba(255,220,80,0.2)';
      ctx.beginPath(); ctx.arc(ad.x, drawY - 35, 16, Math.PI, Math.PI * 2); ctx.fill();
    }
  }
}

// ===== Toxic pools =====
export function renderToxicPools(ctx) {
  for (let tp of toxicPools) {
    let sx = tp.x - camX + shakeX, sy = tp.y - camY + shakeY;
    if (sx < -40 || sx > W + 40 || sy < -40 || sy > H + 40) continue;
    // Pool base
    ctx.globalAlpha = 0.25 + Math.sin(gameTime * 2 + tp.phase) * 0.05;
    let tpGrad = ctx.createRadialGradient(tp.x, tp.y, 0, tp.x, tp.y, tp.radius);
    tpGrad.addColorStop(0, 'rgba(30,200,30,0.4)');
    tpGrad.addColorStop(0.7, 'rgba(20,150,20,0.2)');
    tpGrad.addColorStop(1, 'rgba(10,80,10,0)');
    ctx.fillStyle = tpGrad;
    ctx.beginPath(); ctx.arc(tp.x, tp.y, tp.radius, 0, Math.PI * 2); ctx.fill();
    // Bubbles
    ctx.fillStyle = 'rgba(100,255,100,0.3)';
    let bx = tp.x + Math.sin(gameTime * 3 + tp.phase) * tp.radius * 0.4;
    let by = tp.y + Math.cos(gameTime * 2.5 + tp.phase) * tp.radius * 0.3;
    ctx.beginPath(); ctx.arc(bx, by, 2 + Math.sin(gameTime * 5 + tp.phase), 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
}

// ===== Enemies =====
export function renderEnemies(ctx) {
  for (let e of enemies) {
    if (!e.alive) continue;
    let sx = e.x - camX + shakeX, sy_check = e.y - camY + shakeY;
    if (sx < -50 || sx > W + 50 || sy_check < -50 || sy_check > H + 50) continue;

    ctx.save();
    ctx.translate(e.x, e.y);

    // Hit flash
    if (e.hitFlash > 0) {
      ctx.globalAlpha = 0.5 + e.hitFlash * 5;
    }

    let walkOff = Math.sin(e.walkCycle) * 2;

    switch (e.type) {
      case EN_SCOUT:
        renderScout(ctx, e);
        break;
      case EN_SENTINEL:
        renderSentinel(ctx, e);
        break;
      case EN_HEAVY:
        renderHeavy(ctx, e, walkOff);
        break;
      case EN_COMMANDER:
        renderCommander(ctx, e);
        break;
    }

    // Enemy health bar (only show when damaged)
    if (e.hp < e.maxHp) {
      let barW = e.size * 2;
      let barH = 3;
      let barY = -e.size - 8;
      let hpRatio = e.hp / e.maxHp;
      // Background
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(-barW / 2 - 1, barY - 1, barW + 2, barH + 2);
      // Health
      let hpColor = hpRatio > 0.5 ? '#0f0' : hpRatio > 0.25 ? '#fa0' : '#f00';
      ctx.fillStyle = hpColor;
      ctx.fillRect(-barW / 2, barY, barW * hpRatio, barH);
      // Shield bar for commander
      if (e.type === EN_COMMANDER && e.maxShield) {
        let shieldRatio = e.shieldHp / e.maxShield;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(-barW / 2 - 1, barY - 6, barW + 2, barH + 2);
        ctx.fillStyle = '#a4f';
        ctx.fillRect(-barW / 2, barY - 5, barW * shieldRatio, barH);
      }
    }

    // Sentinel laser sight (windup telegraph)
    if (e.type === EN_SENTINEL && e.windupTimer > 0 && e.windupTarget) {
      let lAngle = Math.atan2(e.windupTarget.y - e.y, e.windupTarget.x - e.x);
      let lLen = Math.sqrt((e.windupTarget.x - e.x) ** 2 + (e.windupTarget.y - e.y) ** 2);
      ctx.save();
      ctx.rotate(lAngle);
      ctx.globalAlpha = 0.3 + e.windupTimer * 0.5;
      ctx.strokeStyle = '#f22';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(e.size + 2, 0); ctx.lineTo(lLen, 0); ctx.stroke();
      ctx.setLineDash([]);
      // Laser dot at target
      ctx.fillStyle = '#f44';
      ctx.beginPath(); ctx.arc(lLen, 0, 2 + Math.sin(gameTime * 20) * 1, 0, Math.PI * 2); ctx.fill();
      // Pulsing glow at target
      ctx.globalAlpha = 0.15 + e.windupTimer * 0.2;
      ctx.beginPath(); ctx.arc(lLen, 0, 6, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    // Heavy charge telegraph (glowing eyes when about to charge)
    if (e.type === EN_HEAVY && e.chargeCD !== undefined && e.chargeCD < 1 && !e.charging) {
      let cGlow = 0.5 + Math.sin(gameTime * 12) * 0.4;
      ctx.fillStyle = `rgba(255,100,0,${cGlow})`;
      ctx.beginPath(); ctx.arc(-4, -e.size * 0.2, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(4, -e.size * 0.2, 3, 0, Math.PI * 2); ctx.fill();
    }
    // Alert indicator (! when first spotting player)
    if (e.alert && e.alertTimer > 8.5) {
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#f00';
      ctx.globalAlpha = Math.min(1, (e.alertTimer - 8.5) * 4);
      ctx.fillText('!', 0, -e.size - 14);
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }
}

// --- Scout (spider bot) ---
function renderScout(ctx, e) {
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath(); ctx.ellipse(0, e.size * 0.6, e.size * 0.6, e.size * 0.2, 0, 0, Math.PI * 2); ctx.fill();
  // Spider legs (4 pairs, animated)
  ctx.strokeStyle = '#5a6a7a';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  for (let leg = 0; leg < 4; leg++) {
    let side = leg < 2 ? -1 : 1;
    let idx = leg % 2;
    let legPhase = gameTime * 12 + leg * Math.PI / 2;
    let anim = e.alert ? Math.sin(legPhase) * 2.5 : 0;
    let baseY = -e.size * 0.3 + idx * e.size * 0.5;
    let kneeX = side * (e.size * 0.6 + 1);
    let kneeY = baseY - 1 + anim * 0.3;
    let footX = side * (e.size + 3 + Math.abs(anim) * 0.5);
    let footY = baseY + e.size * 0.3 + anim;
    ctx.beginPath(); ctx.moveTo(side * e.size * 0.3, baseY); ctx.lineTo(kneeX, kneeY); ctx.lineTo(footX, footY); ctx.stroke();
    // Joint dots
    ctx.fillStyle = '#6a7a8a';
    ctx.beginPath(); ctx.arc(kneeX, kneeY, 1, 0, Math.PI * 2); ctx.fill();
  }
  ctx.lineCap = 'butt';
  // Body - sleek angular chassis
  ctx.fillStyle = e.hitFlash > 0 ? '#fff' : '#4a5a6a';
  ctx.beginPath();
  ctx.moveTo(0, -e.size * 1.1);
  ctx.lineTo(-e.size * 0.5, -e.size * 0.2);
  ctx.lineTo(-e.size * 0.6, e.size * 0.3);
  ctx.lineTo(0, e.size * 0.5);
  ctx.lineTo(e.size * 0.6, e.size * 0.3);
  ctx.lineTo(e.size * 0.5, -e.size * 0.2);
  ctx.closePath();
  ctx.fill();
  // Armor panel lines
  ctx.strokeStyle = 'rgba(68,136,255,0.3)';
  ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(-e.size * 0.3, -e.size * 0.6); ctx.lineTo(-e.size * 0.4, e.size * 0.1); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(e.size * 0.3, -e.size * 0.6); ctx.lineTo(e.size * 0.4, e.size * 0.1); ctx.stroke();
  // Outline
  ctx.strokeStyle = e.alert ? '#6a9aff' : '#4488ff';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, -e.size * 1.1); ctx.lineTo(-e.size * 0.5, -e.size * 0.2); ctx.lineTo(-e.size * 0.6, e.size * 0.3);
  ctx.lineTo(0, e.size * 0.5); ctx.lineTo(e.size * 0.6, e.size * 0.3); ctx.lineTo(e.size * 0.5, -e.size * 0.2); ctx.closePath(); ctx.stroke();
  // Central reactor core
  let coreGlow = e.alert ? 0.6 + Math.sin(gameTime * 6) * 0.3 : 0.3 + Math.sin(gameTime * 3) * 0.1;
  ctx.fillStyle = e.alert ? `rgba(255,80,80,${coreGlow})` : `rgba(68,136,255,${coreGlow})`;
  ctx.beginPath(); ctx.arc(0, -e.size * 0.2, 3, 0, Math.PI * 2); ctx.fill();
  // Core highlight
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath(); ctx.arc(-0.5, -e.size * 0.25, 1, 0, Math.PI * 2); ctx.fill();
  // Sensor eyes (3 small)
  let eyeCol = e.alert ? '#ff4444' : '#4488ff';
  ctx.fillStyle = eyeCol;
  ctx.beginPath(); ctx.arc(-3, -e.size * 0.6, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -e.size * 0.75, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(3, -e.size * 0.6, 1.5, 0, Math.PI * 2); ctx.fill();
  // Eye glow
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = eyeCol;
  ctx.beginPath(); ctx.arc(0, -e.size * 0.7, 5, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
  // Antenna with signal pulse
  ctx.strokeStyle = '#889';
  ctx.lineWidth = 0.7;
  ctx.beginPath(); ctx.moveTo(0, -e.size * 1.1); ctx.lineTo(2, -e.size * 1.1 - 6); ctx.stroke();
  ctx.fillStyle = e.alert ? '#ff4' : '#4af';
  ctx.globalAlpha = 0.5 + Math.sin(gameTime * 10) * 0.5;
  ctx.beginPath(); ctx.arc(2, -e.size * 1.1 - 6, 1.5, 0, Math.PI * 2); ctx.fill();
  // Signal rings when alert
  if (e.alert && e.alertTimer > 8) {
    ctx.strokeStyle = 'rgba(255,100,100,0.15)';
    ctx.lineWidth = 0.5;
    let sigR = 3 + ((gameTime * 8) % 8);
    ctx.beginPath(); ctx.arc(2, -e.size * 1.1 - 6, sigR, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

// --- Sentinel (tripod turret) ---
function renderSentinel(ctx, e) {
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath(); ctx.ellipse(0, e.size * 0.7, e.size * 0.5, e.size * 0.2, 0, 0, Math.PI * 2); ctx.fill();
  // Tripod legs
  ctx.strokeStyle = '#5a4444';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  for (let tl = 0; tl < 3; tl++) {
    let tAngle = tl * Math.PI * 2 / 3 - Math.PI / 2;
    let footX = Math.cos(tAngle) * e.size * 0.9;
    let footY = Math.sin(tAngle) * e.size * 0.9 + e.size * 0.3;
    ctx.beginPath(); ctx.moveTo(Math.cos(tAngle) * e.size * 0.3, Math.sin(tAngle) * e.size * 0.3); ctx.lineTo(footX, footY); ctx.stroke();
    ctx.fillStyle = '#6a4a4a';
    ctx.beginPath(); ctx.arc(footX, footY, 1.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.lineCap = 'butt';
  // Body - octagonal hull
  ctx.fillStyle = e.hitFlash > 0 ? '#fff' : '#503838';
  ctx.beginPath();
  let sz = e.size;
  ctx.moveTo(-sz * 0.2, -sz * 0.7); ctx.lineTo(sz * 0.2, -sz * 0.7);
  ctx.lineTo(sz * 0.55, -sz * 0.4); ctx.lineTo(sz * 0.55, sz * 0.4);
  ctx.lineTo(sz * 0.2, sz * 0.6); ctx.lineTo(-sz * 0.2, sz * 0.6);
  ctx.lineTo(-sz * 0.55, sz * 0.4); ctx.lineTo(-sz * 0.55, -sz * 0.4);
  ctx.closePath(); ctx.fill();
  // Hull detail lines
  ctx.strokeStyle = '#ff3344';
  ctx.lineWidth = 1;
  ctx.stroke();
  // Inner armor plating
  ctx.fillStyle = 'rgba(120,50,50,0.3)';
  ctx.fillRect(-sz * 0.4, -sz * 0.55, sz * 0.8, 3);
  ctx.fillRect(-sz * 0.4, sz * 0.4, sz * 0.8, 3);
  // Side armor rails
  ctx.fillStyle = '#604848';
  ctx.fillRect(-sz * 0.6, -sz * 0.35, 4, sz * 0.7);
  ctx.fillRect(sz * 0.6 - 4, -sz * 0.35, 4, sz * 0.7);
  // Scanning visor (horizontal slit with moving eye)
  let visorX = -sz * 0.35 + Math.abs(Math.sin(gameTime * 2.5)) * sz * 0.5;
  ctx.fillStyle = 'rgba(255,50,70,0.6)';
  ctx.fillRect(-sz * 0.35, -sz * 0.15, sz * 0.7, 3);
  // Scanning eye
  ctx.fillStyle = '#ff6677';
  ctx.shadowColor = '#ff3344'; ctx.shadowBlur = 6;
  ctx.fillRect(visorX, -sz * 0.2, 5, 5);
  ctx.shadowBlur = 0;
  // Eye glow trail
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = '#ff3344';
  ctx.fillRect(-sz * 0.35, -sz * 0.2, visorX + sz * 0.35, 5);
  ctx.globalAlpha = 1;
  // Rotating turret gun (aims at player)
  ctx.save();
  ctx.rotate(Math.atan2(player.y - e.y, player.x - e.x));
  // Gun barrel
  ctx.fillStyle = '#6a5555';
  ctx.fillRect(sz * 0.2, -3, sz * 0.8, 6);
  // Barrel detail
  ctx.fillStyle = '#554444';
  ctx.fillRect(sz * 0.2, -3.5, 4, 7);
  // Muzzle
  ctx.fillStyle = '#443333';
  ctx.fillRect(sz * 0.9, -4, 4, 8);
  // Heat glow at muzzle
  if (e.attackCD < e.react * 0.3) {
    ctx.fillStyle = `rgba(255,50,70,${0.3 + Math.sin(gameTime * 15) * 0.2})`;
    ctx.beginPath(); ctx.arc(sz + 2, 0, 4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  // Warning lights (side LEDs)
  let ledPulse = e.alert ? 0.6 + Math.sin(gameTime * 8) * 0.4 : 0.2;
  ctx.fillStyle = `rgba(255,50,70,${ledPulse})`;
  ctx.beginPath(); ctx.arc(-sz * 0.45, sz * 0.25, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(sz * 0.45, sz * 0.25, 1.5, 0, Math.PI * 2); ctx.fill();
  // Laser sight during windup
  if (e.windupTimer > 0 && e.windupTarget) {
    let ldx = e.windupTarget.x - e.x, ldy = e.windupTarget.y - e.y;
    let lPulse = 0.3 + Math.sin(gameTime * 20) * 0.15;
    ctx.save();
    ctx.globalAlpha = lPulse * (e.windupTimer / 0.35);
    ctx.strokeStyle = '#f33';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(ldx, ldy); ctx.stroke();
    ctx.setLineDash([]);
    // Target reticle
    ctx.strokeStyle = '#f44';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(ldx, ldy, 6 + Math.sin(gameTime * 12) * 2, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ldx - 4, ldy); ctx.lineTo(ldx + 4, ldy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ldx, ldy - 4); ctx.lineTo(ldx, ldy + 4); ctx.stroke();
    ctx.restore();
  }
}

// --- Heavy (tank) ---
function renderHeavy(ctx, e, walkOff) {
  let hs = e.size;
  // Charge motion blur
  if (e.charging) {
    ctx.save(); ctx.rotate(e.chargeAngle);
    for (let sl = 0; sl < 5; sl++) {
      let slOff = -hs - 5 - sl * 8;
      let slY = (Math.random() - 0.5) * hs * 0.8;
      ctx.strokeStyle = `rgba(255,136,0,${0.35 - sl * 0.06})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(slOff, slY); ctx.lineTo(slOff - 8 - Math.random() * 10, slY); ctx.stroke();
    }
    // Ground cracks during charge
    ctx.fillStyle = 'rgba(255,100,0,0.15)';
    for (let gc = 0; gc < 3; gc++) {
      ctx.beginPath(); ctx.arc(-hs - gc * 12 + (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 6, 3 + Math.random() * 3, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
  // Ground shadow / stomp impact
  ctx.fillStyle = e.rogue ? 'rgba(200,30,0,0.2)' : 'rgba(80,60,20,0.2)';
  ctx.beginPath(); ctx.ellipse(0, hs * 0.5, hs * 0.8, hs * 0.3, 0, 0, Math.PI * 2); ctx.fill();
  if (Math.abs(walkOff) > 1.5) {
    ctx.fillStyle = e.rogue ? 'rgba(200,30,0,0.2)' : 'rgba(80,60,20,0.2)';
    ctx.beginPath(); ctx.arc(0, hs * 0.5 + 2, 8, 0, Math.PI * 2); ctx.fill();
  }
  // Rogue aura
  if (e.rogue) {
    let rogueGlow = 0.15 + Math.sin(gameTime * 3) * 0.08;
    ctx.fillStyle = `rgba(255,40,0,${rogueGlow})`;
    ctx.beginPath(); ctx.arc(0, 0, hs + 12, 0, Math.PI * 2); ctx.fill();
    // Fire ring
    ctx.strokeStyle = `rgba(255,60,0,${rogueGlow * 0.5})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, hs + 8, gameTime * 2, gameTime * 2 + Math.PI); ctx.stroke();
  }
  // Treads/tracks (left and right)
  let wo = walkOff * 0.3;
  ctx.fillStyle = e.rogue ? '#4a1500' : '#3a3020';
  ctx.fillRect(-hs * 0.65 + wo, -hs * 0.5, 5, hs);
  ctx.fillRect(hs * 0.65 - 5 + wo, -hs * 0.5, 5, hs);
  // Track detail (animated tread marks)
  ctx.strokeStyle = e.rogue ? '#6a2500' : '#5a4a30';
  ctx.lineWidth = 1;
  for (let t = 0; t < 5; t++) {
    let ty = -hs * 0.45 + t * hs * 0.22 + ((gameTime * 40) % (hs * 0.22));
    ctx.beginPath(); ctx.moveTo(-hs * 0.65 + wo, ty); ctx.lineTo(-hs * 0.6 + wo, ty); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hs * 0.6 + wo, ty); ctx.lineTo(hs * 0.65 + wo, ty); ctx.stroke();
  }
  // Main hull
  ctx.fillStyle = e.hitFlash > 0 ? '#fff' : e.rogue ? '#5a1800' : '#4a3820';
  ctx.beginPath();
  ctx.moveTo(-hs * 0.45 + wo, -hs * 0.55); ctx.lineTo(hs * 0.45 + wo, -hs * 0.55);
  ctx.lineTo(hs * 0.5 + wo, -hs * 0.35); ctx.lineTo(hs * 0.5 + wo, hs * 0.45);
  ctx.lineTo(-hs * 0.5 + wo, hs * 0.45); ctx.lineTo(-hs * 0.5 + wo, -hs * 0.35); ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = e.rogue ? '#ff2200' : '#ff8800';
  ctx.lineWidth = e.rogue ? 2 : 1.5;
  ctx.stroke();
  // Turret dome (upper section)
  ctx.fillStyle = e.rogue ? '#6a2000' : '#554430';
  ctx.beginPath();
  ctx.moveTo(-hs * 0.3 + wo, -hs * 0.55); ctx.lineTo(hs * 0.3 + wo, -hs * 0.55);
  ctx.lineTo(hs * 0.25 + wo, -hs * 0.75); ctx.lineTo(-hs * 0.25 + wo, -hs * 0.75); ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = e.rogue ? 'rgba(255,80,0,0.4)' : 'rgba(255,160,0,0.3)';
  ctx.lineWidth = 0.5; ctx.stroke();
  // Armor bolt rivets
  ctx.fillStyle = e.rogue ? '#882200' : '#776640';
  let rivetPos = [[-hs * 0.35, -hs * 0.4], [hs * 0.35, -hs * 0.4], [-hs * 0.35, hs * 0.3], [hs * 0.35, hs * 0.3]];
  for (let rv of rivetPos) { ctx.beginPath(); ctx.arc(rv[0] + wo, rv[1], 1.5, 0, Math.PI * 2); ctx.fill(); }
  // Heat vents (animated glow)
  let ventGlow = 0.5 + Math.sin(gameTime * 5) * 0.3;
  ctx.fillStyle = e.rogue ? `rgba(255,50,0,${ventGlow})` : `rgba(255,136,0,${ventGlow})`;
  // Left vent
  ctx.fillRect(-hs * 0.35 + wo, -hs * 0.4, 3, hs * 0.7);
  // Right vent
  ctx.fillRect(hs * 0.35 - 3 + wo, -hs * 0.4, 3, hs * 0.7);
  // Exhaust pipes (top)
  ctx.fillStyle = e.rogue ? '#551500' : '#443020';
  ctx.fillRect(-hs * 0.15 + wo, -hs * 0.7, 4, 8);
  ctx.fillRect(hs * 0.15 - 4 + wo, -hs * 0.7, 4, 8);
  // Exhaust smoke when moving
  if (e.alert) {
    ctx.fillStyle = e.rogue ? 'rgba(200,30,0,0.2)' : 'rgba(100,80,60,0.15)';
    ctx.beginPath(); ctx.arc(-hs * 0.13 + wo, -hs * 0.75 - Math.random() * 6, 2 + Math.random() * 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(hs * 0.13 + wo, -hs * 0.75 - Math.random() * 6, 2 + Math.random() * 2, 0, Math.PI * 2); ctx.fill();
  }
  // Front visor / sensor
  ctx.fillStyle = e.rogue ? '#ff3300' : '#ffaa00';
  ctx.globalAlpha = 0.7 + Math.sin(gameTime * 4) * 0.2;
  ctx.fillRect(-hs * 0.2 + wo, hs * 0.3, hs * 0.4, 3);
  ctx.globalAlpha = 1;
  // Charge windup telegraph
  if (e.chargeWindup > 0) {
    let windPulse = 0.5 + Math.sin(gameTime * 18) * 0.25;
    ctx.fillStyle = `rgba(255,136,0,${windPulse})`;
    ctx.beginPath(); ctx.arc(0, 0, hs + 8 + Math.sin(gameTime * 14) * 3, 0, Math.PI * 2); ctx.fill();
    // Ground cracks radiate outward
    ctx.strokeStyle = `rgba(255,100,0,${windPulse * 0.6})`;
    ctx.lineWidth = 1.5;
    for (let cr = 0; cr < 6; cr++) {
      let ca = cr * Math.PI / 3 + gameTime * 2;
      ctx.beginPath(); ctx.moveTo(Math.cos(ca) * hs * 0.5, Math.sin(ca) * hs * 0.5);
      ctx.lineTo(Math.cos(ca) * (hs + 12), Math.sin(ca) * (hs + 12)); ctx.stroke();
    }
    // Direction arrow
    ctx.save(); ctx.rotate(e.chargeAngle);
    ctx.strokeStyle = `rgba(255,80,0,${windPulse})`;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(hs, 0); ctx.lineTo(hs + 45, 0); ctx.stroke();
    ctx.setLineDash([]);
    // Arrow head
    ctx.fillStyle = `rgba(255,100,0,${windPulse})`;
    ctx.beginPath(); ctx.moveTo(hs + 45, 0); ctx.lineTo(hs + 38, -5); ctx.lineTo(hs + 38, 5); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  // Rogue label with glitch effect
  if (e.rogue) {
    ctx.fillStyle = '#ff2200';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.globalAlpha = 0.8 + Math.sin(gameTime * 6) * 0.2;
    let glitchX = Math.random() > 0.9 ? (Math.random() - 0.5) * 3 : 0;
    ctx.fillText('ROGUE', glitchX, hs + 14);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }
}

// --- Commander (floating diamond boss) ---
function renderCommander(ctx, e) {
  let cs = e.size;
  // Hovering shadow (ellipse below)
  let hoverOff = Math.sin(gameTime * 2) * 3;
  ctx.fillStyle = 'rgba(80,20,140,0.15)';
  ctx.beginPath(); ctx.ellipse(0, cs + 5, cs * 0.7, cs * 0.2, 0, 0, Math.PI * 2); ctx.fill();
  // Ground rune circle (rotating arcane pattern)
  ctx.save(); ctx.rotate(gameTime * 0.5);
  ctx.strokeStyle = `rgba(170,68,255,${0.08 + Math.sin(gameTime * 2) * 0.04})`;
  ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.arc(0, 0, cs + 12, 0, Math.PI * 2); ctx.stroke();
  // Rune tick marks
  for (let rm = 0; rm < 12; rm++) {
    let ra = rm * Math.PI / 6;
    ctx.beginPath(); ctx.moveTo(Math.cos(ra) * (cs + 10), Math.sin(ra) * (cs + 10));
    ctx.lineTo(Math.cos(ra) * (cs + 14), Math.sin(ra) * (cs + 14)); ctx.stroke();
  }
  ctx.restore();
  // Energy orbs orbiting
  for (let orb = 0; orb < 4; orb++) {
    let orbAngle = gameTime * 1.5 + orb * Math.PI / 2;
    let orbR = cs + 6;
    let ox = Math.cos(orbAngle) * orbR, oy = Math.sin(orbAngle) * orbR + hoverOff;
    ctx.fillStyle = `rgba(200,120,255,${0.4 + Math.sin(gameTime * 4 + orb) * 0.2})`;
    ctx.beginPath(); ctx.arc(ox, oy, 2.5, 0, Math.PI * 2); ctx.fill();
    // Orb trail
    ctx.globalAlpha = 0.1;
    ctx.beginPath(); ctx.arc(ox - Math.cos(orbAngle) * 3, oy - Math.sin(orbAngle) * 3, 2, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
  // Shield (hexagonal segments)
  if (e.shieldHp > 0) {
    let shAlpha = 0.2 + Math.sin(gameTime * 4) * 0.1;
    ctx.strokeStyle = `rgba(170,68,255,${shAlpha + 0.1})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let sh = 0; sh < 6; sh++) {
      let sha = sh * Math.PI / 3 + gameTime * 0.3;
      let sx2 = Math.cos(sha) * (cs + 5), sy2 = Math.sin(sha) * (cs + 5) + hoverOff;
      sh === 0 ? ctx.moveTo(sx2, sy2) : ctx.lineTo(sx2, sy2);
    }
    ctx.closePath(); ctx.stroke();
    // Shield shimmer arcs
    ctx.strokeStyle = `rgba(220,180,255,${0.12 + Math.sin(gameTime * 6) * 0.08})`;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(0, hoverOff, cs + 7, gameTime * 2, gameTime * 2 + Math.PI * 0.8); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, hoverOff, cs + 7, gameTime * 2 + Math.PI, gameTime * 2 + Math.PI * 1.6); ctx.stroke();
  }
  // Body - floating diamond with inner structure
  ctx.save(); ctx.translate(0, hoverOff);
  ctx.fillStyle = e.hitFlash > 0 ? '#fff' : '#2a1840';
  ctx.beginPath();
  ctx.moveTo(0, -cs); ctx.lineTo(cs * 0.8, -cs * 0.15); ctx.lineTo(cs, 0); ctx.lineTo(cs * 0.8, cs * 0.15);
  ctx.lineTo(0, cs); ctx.lineTo(-cs * 0.8, cs * 0.15); ctx.lineTo(-cs, 0); ctx.lineTo(-cs * 0.8, -cs * 0.15);
  ctx.closePath(); ctx.fill();
  // Inner diamond (layered depth)
  ctx.fillStyle = '#3a2060';
  ctx.beginPath();
  ctx.moveTo(0, -cs * 0.65); ctx.lineTo(cs * 0.65, 0); ctx.lineTo(0, cs * 0.65); ctx.lineTo(-cs * 0.65, 0); ctx.closePath(); ctx.fill();
  // Outer glow lines
  ctx.strokeStyle = '#aa44ff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -cs); ctx.lineTo(cs * 0.8, -cs * 0.15); ctx.lineTo(cs, 0); ctx.lineTo(cs * 0.8, cs * 0.15);
  ctx.lineTo(0, cs); ctx.lineTo(-cs * 0.8, cs * 0.15); ctx.lineTo(-cs, 0); ctx.lineTo(-cs * 0.8, -cs * 0.15); ctx.closePath(); ctx.stroke();
  // Pulsing inner core
  let coreP = 0.3 + Math.sin(gameTime * 3) * 0.1;
  let cmdGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, cs * 0.4);
  cmdGrad.addColorStop(0, `rgba(255,100,255,${coreP})`);
  cmdGrad.addColorStop(1, 'rgba(170,68,255,0)');
  ctx.fillStyle = cmdGrad;
  ctx.beginPath(); ctx.arc(0, 0, cs * 0.4, 0, Math.PI * 2); ctx.fill();
  // Multiple eyes (5 in a V-pattern)
  let eyePositions = [[-6, -cs * 0.35], [-3, -cs * 0.45], [0, -cs * 0.5], [3, -cs * 0.45], [6, -cs * 0.35]];
  for (let ep of eyePositions) {
    ctx.fillStyle = '#ff44ff';
    ctx.beginPath(); ctx.arc(ep[0], ep[1], 2, 0, Math.PI * 2); ctx.fill();
    // Eye inner
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(ep[0] - 0.3, ep[1] - 0.3, 0.8, 0, Math.PI * 2); ctx.fill();
  }
  // Gaze direction (all eyes look at player when alert)
  if (e.alert) {
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = '#f4f';
    let gAngle = Math.atan2(player.y - e.y, player.x - e.x) - e.angle;
    ctx.beginPath(); ctx.arc(Math.cos(gAngle) * 8, -cs * 0.42 + Math.sin(gAngle) * 3, 4, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.restore(); // end hover translate
  // Energy tendrils to nearby scouts (animated lightning)
  for (let other of enemies) {
    if (!other.alive || other.type !== EN_SCOUT) continue;
    let dx = other.x - e.x, dy = other.y - e.y;
    let td = Math.sqrt(dx * dx + dy * dy);
    if (td < 150) {
      ctx.strokeStyle = `rgba(170,68,255,${0.15 + Math.sin(gameTime * 5) * 0.08})`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, hoverOff);
      // Lightning segments
      let segs = 4;
      for (let s = 1; s <= segs; s++) {
        let t2 = s / segs;
        let lx = dx * t2 + (s < segs ? (Math.random() - 0.5) * 12 : 0);
        let ly = dy * t2 + (s < segs ? (Math.random() - 0.5) * 12 : 0);
        ctx.lineTo(lx, ly);
      }
      ctx.stroke();
      // Energy pulse along tendril
      let pulseT = (gameTime * 3 + other.x * 0.01) % 1;
      ctx.fillStyle = 'rgba(200,150,255,0.4)';
      ctx.beginPath(); ctx.arc(dx * pulseT, dy * pulseT + hoverOff, 2, 0, Math.PI * 2); ctx.fill();
    }
  }
  // Teleport destination telegraph
  if (e.tpWarning > 0 && e.tpTarget) {
    ctx.save();
    let tdx = e.tpTarget.x - e.x, tdy = e.tpTarget.y - e.y;
    let tpPulse = 0.3 + Math.sin(gameTime * 16) * 0.15;
    ctx.globalAlpha = tpPulse * (e.tpWarning / 0.4);
    // Portal ring
    ctx.strokeStyle = '#a4f';
    ctx.lineWidth = 2;
    let tpR = 12 + Math.sin(gameTime * 12) * 4;
    ctx.beginPath(); ctx.arc(tdx, tdy, tpR, 0, Math.PI * 2); ctx.stroke();
    // Inner spiral
    ctx.strokeStyle = 'rgba(200,120,255,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let sp = 0; sp < 20; sp++) {
      let sa = sp * 0.5 + gameTime * 8;
      let sr = tpR * (1 - sp / 20);
      let spx = tdx + Math.cos(sa) * sr, spy = tdy + Math.sin(sa) * sr;
      sp === 0 ? ctx.moveTo(spx, spy) : ctx.lineTo(spx, spy);
    }
    ctx.stroke();
    ctx.fillStyle = 'rgba(170,68,255,0.15)';
    ctx.beginPath(); ctx.arc(tdx, tdy, tpR, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

// ===== Sprint afterimage trail =====
export function renderPlayerTrail(ctx) {
  for (let t of playerTrail) {
    let ta = Math.max(0, t.life / t.maxLife) * 0.3;
    ctx.save();
    ctx.globalAlpha = ta;
    ctx.translate(t.x, t.y);
    ctx.rotate(t.angle);
    ctx.fillStyle = '#0ae';
    ctx.beginPath(); ctx.arc(0, 0, player.size, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

// ===== Player =====
export function renderPlayer(ctx) {
  if (!player.alive) return;
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.rotate(player.angle);
  let ps = player.size;

  // Shield energy ring (subtle rotating)
  ctx.globalAlpha = 0.08 + Math.sin(gameTime * 2) * 0.03;
  ctx.strokeStyle = '#0df';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(0, 0, ps + 4, gameTime * 1.5, gameTime * 1.5 + Math.PI * 1.2); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, ps + 4, gameTime * 1.5 + Math.PI, gameTime * 1.5 + Math.PI + Math.PI * 0.6); ctx.stroke();
  ctx.globalAlpha = 1;

  // Shadow/ground contact
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath(); ctx.ellipse(0, ps * 0.3, ps * 0.9, ps * 0.3, 0, 0, Math.PI * 2); ctx.fill();

  // Legs (animated walk)
  let legAnim = Math.sin(gameTime * 12) * ((keys['KeyW'] || keys['KeyA'] || keys['KeyS'] || keys['KeyD']) ? 2 : 0);
  ctx.strokeStyle = '#3a5a6a';
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(-3, ps * 0.2); ctx.lineTo(-5 + legAnim, ps + 1); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(3, ps * 0.2); ctx.lineTo(5 - legAnim, ps + 1); ctx.stroke();
  // Boot tips
  ctx.fillStyle = '#2a4a5a';
  ctx.fillRect(-7 + legAnim, ps, 4, 2);
  ctx.fillRect(3 - legAnim, ps, 4, 2);

  // Body armor - outer shell
  ctx.fillStyle = '#0c3848';
  ctx.beginPath(); ctx.arc(0, 0, ps, 0, Math.PI * 2); ctx.fill();

  // Armor plate segments (4 quadrants)
  ctx.strokeStyle = 'rgba(0,180,220,0.15)';
  ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(0, -ps); ctx.lineTo(0, ps); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-ps, 0); ctx.lineTo(ps, 0); ctx.stroke();

  // Outer armor ring
  ctx.strokeStyle = '#0ae';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, 0, ps, 0, Math.PI * 2); ctx.stroke();

  // Inner armor core
  let coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, ps * 0.65);
  coreGrad.addColorStop(0, '#0a4a5a');
  coreGrad.addColorStop(1, '#062830');
  ctx.fillStyle = coreGrad;
  ctx.beginPath(); ctx.arc(0, 0, ps * 0.65, 0, Math.PI * 2); ctx.fill();

  // Chest plate detail
  ctx.fillStyle = '#0d5868';
  ctx.beginPath();
  ctx.moveTo(-ps * 0.3, -ps * 0.4); ctx.lineTo(ps * 0.3, -ps * 0.4);
  ctx.lineTo(ps * 0.25, ps * 0.2); ctx.lineTo(-ps * 0.25, ps * 0.2);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,200,240,0.2)';
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Shoulder pads
  ctx.fillStyle = '#0b4858';
  ctx.beginPath(); ctx.ellipse(-ps * 0.7, -ps * 0.1, ps * 0.35, ps * 0.2, 0.3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(ps * 0.7, -ps * 0.1, ps * 0.35, ps * 0.2, -0.3, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(0,200,255,0.15)';
  ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.ellipse(-ps * 0.7, -ps * 0.1, ps * 0.35, ps * 0.2, 0.3, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(ps * 0.7, -ps * 0.1, ps * 0.35, ps * 0.2, -0.3, 0, Math.PI * 2); ctx.stroke();

  // Weapon arm (tactical rail) - with recoil bob
  let rcOff = player.recoilOffset || 0;
  ctx.save();
  ctx.translate(-rcOff, 0); // recoil pushes weapon backward
  ctx.fillStyle = '#556';
  ctx.fillRect(ps * 0.2, -2.5, ps + 8, 5);
  // Rail grooves
  ctx.strokeStyle = '#445';
  ctx.lineWidth = 0.5;
  for (let g = 0; g < 4; g++) {
    let gx = ps * 0.4 + g * 4;
    ctx.beginPath(); ctx.moveTo(gx, -2); ctx.lineTo(gx, 2); ctx.stroke();
  }
  // Muzzle brake
  let w = weapons[player.curWeapon];
  ctx.fillStyle = '#444';
  ctx.fillRect(ps + 7, -3.5, 3, 7);
  ctx.fillStyle = '#333';
  ctx.fillRect(ps + 9, -2.5, 2, 5);
  // Muzzle glow
  ctx.fillStyle = w.color;
  ctx.globalAlpha = 0.5 + Math.sin(gameTime * 10) * 0.3;
  ctx.beginPath(); ctx.arc(ps + 11, 0, 3, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  // Muzzle flash starburst (bright directional flash when shooting)
  if (player.muzzleFlash > 0) {
    let mfAlpha = player.muzzleFlash / 0.05; // 1.0 at start, fades to 0
    let muzzleTip = ps + 12;
    let flashSize = w.pellets > 1 ? 18 : 12;
    // Hot white core
    ctx.globalAlpha = mfAlpha * 0.9;
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(muzzleTip, 0, flashSize * 0.3, 0, Math.PI * 2); ctx.fill();
    // Starburst spikes
    ctx.globalAlpha = mfAlpha * 0.7;
    ctx.strokeStyle = 'rgba(255,240,180,0.9)';
    ctx.lineWidth = 2;
    let spikeCount = w.pellets > 1 ? 8 : 5;
    for (let s = 0; s < spikeCount; s++) {
      let sa = (s / spikeCount) * Math.PI * 2 + gameTime * 20;
      let sLen = flashSize * (0.6 + Math.random() * 0.4);
      ctx.beginPath();
      ctx.moveTo(muzzleTip, 0);
      ctx.lineTo(muzzleTip + Math.cos(sa) * sLen, Math.sin(sa) * sLen);
      ctx.stroke();
    }
    // Warm glow halo
    ctx.globalAlpha = mfAlpha * 0.4;
    let mfGrad = ctx.createRadialGradient(muzzleTip, 0, 0, muzzleTip, 0, flashSize);
    mfGrad.addColorStop(0, 'rgba(255,240,180,0.6)');
    mfGrad.addColorStop(0.5, 'rgba(255,180,80,0.3)');
    mfGrad.addColorStop(1, 'rgba(255,100,20,0)');
    ctx.fillStyle = mfGrad;
    ctx.beginPath(); ctx.arc(muzzleTip, 0, flashSize, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.restore(); // end recoil translate

  // Flashlight cone
  ctx.fillStyle = 'rgba(255,255,220,0.15)';
  ctx.beginPath();
  ctx.moveTo(ps * 0.5, -ps * 0.5);
  ctx.lineTo(ps + 25, -12);
  ctx.lineTo(ps + 25, 12);
  ctx.lineTo(ps * 0.5, ps * 0.5);
  ctx.closePath();
  ctx.fill();

  // Helmet visor (animated scan)
  let visorGlow = 0.7 + Math.sin(gameTime * 4) * 0.15;
  let visorGrad = ctx.createLinearGradient(-4, 0, 6, 0);
  visorGrad.addColorStop(0, 'rgba(0,180,220,0.3)');
  visorGrad.addColorStop(0.5, `rgba(0,220,255,${visorGlow})`);
  visorGrad.addColorStop(1, 'rgba(0,180,220,0.3)');
  ctx.fillStyle = visorGrad;
  ctx.beginPath();
  ctx.ellipse(ps * 0.25, 0, ps * 0.22, ps * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  // Visor highlight
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath(); ctx.ellipse(ps * 0.28, -ps * 0.1, ps * 0.08, ps * 0.12, 0.2, 0, Math.PI * 2); ctx.fill();
  // Visor scan line
  let scanY = Math.sin(gameTime * 6) * ps * 0.25;
  ctx.strokeStyle = 'rgba(0,255,255,0.3)';
  ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(ps * 0.05, scanY); ctx.lineTo(ps * 0.45, scanY); ctx.stroke();

  // Backpack/jetpack detail
  ctx.fillStyle = '#0a3040';
  ctx.fillRect(-ps * 0.3, -ps * 0.6, ps * 0.25, ps * 0.5);
  ctx.strokeStyle = 'rgba(0,200,255,0.1)';
  ctx.lineWidth = 0.5;
  ctx.strokeRect(-ps * 0.3, -ps * 0.6, ps * 0.25, ps * 0.5);
  // Status LED on backpack
  let ledCol = player.hp > player.maxHp * 0.5 ? '#0f0' : player.hp > player.maxHp * 0.25 ? '#fa0' : '#f00';
  ctx.fillStyle = ledCol;
  ctx.globalAlpha = 0.6 + Math.sin(gameTime * 8) * 0.3;
  ctx.beginPath(); ctx.arc(-ps * 0.18, -ps * 0.5, 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  // Power-up aura
  if (powerUp.type) {
    let puC = powerUp.type === 'speed' ? [0, 255, 255] : powerUp.type === 'damage' ? [255, 68, 255] : [68, 255, 68];
    ctx.globalAlpha = 0.12 + Math.sin(gameTime * 6) * 0.06;
    ctx.strokeStyle = `rgb(${puC[0]},${puC[1]},${puC[2]})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, ps + 6, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  ctx.restore();

  // Invulnerability flash (shield bubble effect)
  if (player.invuln > 0) {
    let invAlpha = Math.sin(gameTime * 25) * 0.2 + 0.15;
    ctx.globalAlpha = invAlpha;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(player.x, player.y, player.size + 4, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(200,240,255,0.08)';
    ctx.beginPath(); ctx.arc(player.x, player.y, player.size + 3, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
}
