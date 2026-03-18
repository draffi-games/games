// VOID PROTOCOL — Particle Systems (atmospheric + combat particles)

import { T, MAX_ATM_PARTICLES, ROOM_START, ROOM_BOSS, ROOM_SERVER, ROOM_STORAGE, ROOM_PATROL,
         ROOM_ARMORY } from '../core/constants.js';
import { atmParticles, particles, rooms, map, mapW, mapH, gameTime,
         camX, camY, shakeX, shakeY, countdownActive } from '../core/state.js';
import { W, H } from '../core/canvas.js';
import { particlePool, projPool } from '../core/utils.js';
import { isFloorTile } from '../level/generator.js';

// ===== Atmospheric particle spawner (called each frame during play) =====
export function spawnAtmospheric() {
  // Enhanced dust motes with golden tint in lit areas + swirling motion
  if (Math.random() < 0.15) {
    let dx = camX + Math.random() * W, dy = camY + Math.random() * H;
    let tx = Math.floor(dx / T), ty = Math.floor(dy / T);
    let inLit = tx >= 0 && tx < mapW && ty >= 0 && ty < mapH && isFloorTile(map[ty * mapW + tx]);
    atmParticles.push({
      x: dx, y: dy,
      vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6 + 3,
      life: 4 + Math.random() * 4, maxLife: 8, size: 1 + Math.random() * 1.5,
      type: 'dust', alpha: 0.2 + Math.random() * 0.18,
      golden: inLit, swirlPhase: Math.random() * Math.PI * 2, swirlSpeed: 0.8 + Math.random() * 1.2, swirlRadius: 3 + Math.random() * 5
    });
  }
  // Sparks from lights
  if (Math.random() < 0.02) {
    let rx = rooms[Math.floor(Math.random() * rooms.length)];
    atmParticles.push({
      x: rx.cx * T + Math.random() * rx.w * T, y: rx.y * T,
      vx: (Math.random() - 0.5) * 20, vy: 20 + Math.random() * 40,
      life: 0.5 + Math.random() * 0.5, maxLife: 1, size: 1.5,
      type: 'atm_spark', alpha: 0.8
    });
  }
  // Smoke wisps
  if (Math.random() < 0.03) {
    atmParticles.push({
      x: camX + Math.random() * W, y: camY + Math.random() * H,
      vx: (Math.random() - 0.5) * 5, vy: -3 - Math.random() * 5,
      life: 2 + Math.random() * 2, maxLife: 4, size: 6 + Math.random() * 6,
      type: 'smoke', alpha: 0.06
    });
  }
  // Sparking wires from ceiling (random rooms)
  if (Math.random() < 0.04) {
    let r = rooms[Math.floor(Math.random() * rooms.length)];
    if (r.type !== ROOM_START) {
      let wx = r.x * T + Math.random() * r.w * T;
      let wy = r.y * T + 2;
      for (let i = 0; i < 3; i++) {
        let p3 = particlePool.get();
        p3.x = wx + (Math.random() - 0.5) * 4; p3.y = wy;
        p3.vx = (Math.random() - 0.5) * 30; p3.vy = 15 + Math.random() * 40;
        p3.life = 0.15 + Math.random() * 0.2; p3.maxLife = p3.life;
        p3.r = 200 + Math.random() * 55; p3.g = 200 + Math.random() * 55; p3.b = 100;
        p3.size = 1; p3.grav = true; p3.type = 'spark';
      }
    }
  }

  // === ELECTRICAL ARCS on walls ===
  if (Math.random() < 0.025) {
    let r = rooms[Math.floor(Math.random() * rooms.length)];
    if (r.type !== ROOM_START) {
      let arcChance = r.type === ROOM_BOSS ? 0.7 : r.type === ROOM_SERVER ? 0.4 : 0.2;
      if (Math.random() < arcChance) {
        let edge = Math.floor(Math.random() * 4);
        let ax, ay;
        if (edge === 0) { ax = r.x + 1 + Math.floor(Math.random() * Math.max(1, r.w - 2)); ay = r.y; }
        else if (edge === 1) { ax = r.x + 1 + Math.floor(Math.random() * Math.max(1, r.w - 2)); ay = r.y + r.h - 1; }
        else if (edge === 2) { ax = r.x; ay = r.y + 1 + Math.floor(Math.random() * Math.max(1, r.h - 2)); }
        else { ax = r.x + r.w - 1; ay = r.y + 1 + Math.floor(Math.random() * Math.max(1, r.h - 2)); }
        let arcLen = 3 + Math.floor(Math.random() * 4);
        let segs = [];
        let asx = ax * T + T / 2, asy = ay * T + T / 2;
        for (let i = 0; i < arcLen; i++) {
          let nx = asx + (Math.random() - 0.5) * 18;
          let ny = asy + (Math.random() - 0.5) * 18;
          segs.push({ x: nx, y: ny });
          asx = nx; asy = ny;
        }
        atmParticles.push({
          x: ax * T + T / 2, y: ay * T + T / 2, vx: 0, vy: 0,
          life: 0.06 + Math.random() * 0.08, maxLife: 0.14, size: 1,
          type: 'arc', alpha: 0.85 + Math.random() * 0.15, segs: segs
        });
      }
    }
  }

  // === DRIPPING WATER from ceilings ===
  if (Math.random() < 0.03) {
    let r = rooms[Math.floor(Math.random() * rooms.length)];
    let dripChance = r.type === ROOM_STORAGE ? 0.6 : r.type === ROOM_PATROL ? 0.3 : r.type === ROOM_SERVER ? 0.15 : 0.08;
    if (r.type !== ROOM_START && Math.random() < dripChance) {
      let dtx = r.x + 1 + Math.floor(Math.random() * Math.max(1, r.w - 2));
      let floorY = (r.y + r.h - 1) * T;
      atmParticles.push({
        x: dtx * T + T / 2 + (Math.random() - 0.5) * 8, y: r.y * T + T - 2,
        vx: (Math.random() - 0.5) * 2, vy: 18 + Math.random() * 12,
        life: 2 + Math.random() * 1.5, maxLife: 3.5, size: 1.2 + Math.random() * 0.6,
        type: 'drip', alpha: 0.35 + Math.random() * 0.15, floorY: floorY, splashed: false
      });
    }
  }

  // === STEAM VENTS near walls ===
  if (Math.random() < 0.04) {
    let r = rooms[Math.floor(Math.random() * rooms.length)];
    let steamChance = r.type === ROOM_SERVER ? 0.7 : r.type === ROOM_BOSS ? 0.35 : r.type === ROOM_ARMORY ? 0.2 : 0.05;
    if (r.type !== ROOM_START && Math.random() < steamChance) {
      let vtx = r.x + 1 + Math.floor(Math.random() * Math.max(1, r.w - 2));
      let vty = r.y + r.h - 1;
      for (let si = 0; si < 2; si++) {
        atmParticles.push({
          x: vtx * T + T / 2 + (Math.random() - 0.5) * 6, y: vty * T,
          vx: (Math.random() - 0.5) * 8, vy: -12 - Math.random() * 18,
          life: 1.2 + Math.random() * 1.5, maxLife: 2.7, size: 4 + Math.random() * 5,
          type: 'steam', alpha: 0.08 + Math.random() * 0.06, growRate: 1.5 + Math.random()
        });
      }
    }
  }

  // Countdown emergency effects + rain
  if (countdownActive) {
    if (Math.random() < 0.3) {
      atmParticles.push({
        x: camX + Math.random() * W, y: camY + Math.random() * H,
        vx: (Math.random() - 0.5) * 40, vy: 30 + Math.random() * 60,
        life: 0.3 + Math.random() * 0.3, maxLife: 0.6, size: 1.5,
        type: 'atm_spark', alpha: 0.9
      });
    }
    // Screen-space rain during countdown
    for (let i = 0; i < 3; i++) {
      atmParticles.push({
        x: camX + Math.random() * W + 100, y: camY - 10,
        vx: -40 - Math.random() * 30, vy: 300 + Math.random() * 200,
        life: 0.4 + Math.random() * 0.3, maxLife: 0.7, size: 1,
        type: 'rain', alpha: 0.25 + Math.random() * 0.15
      });
    }
  }
  // Cap atmospheric particles
  if (atmParticles.length > MAX_ATM_PARTICLES) atmParticles.splice(0, atmParticles.length - MAX_ATM_PARTICLES);
}

// ===== Render projectiles (from projPool) =====
export function renderProjectiles(ctx) {
  projPool.active.forEach(p => {
    let sx = p.x - camX + shakeX, sy_check = p.y - camY + shakeY;
    if (sx < -20 || sx > W + 20 || sy_check < -20 || sy_check > H + 20) return;

    ctx.save();
    if (p.type === 'bullet') {
      // Tracer
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      let len = 10;
      let angle = Math.atan2(p.vy, p.vx);
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - Math.cos(angle) * len, p.y - Math.sin(angle) * len);
      ctx.stroke();
      // Glow
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 5;
      ctx.stroke();
      // Tip spark
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = 0.9;
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2); ctx.fill();
    } else if (p.type === 'plasma') {
      // Trail
      ctx.globalAlpha = 0.15;
      for (let i = 0; i < p.trail.length; i++) {
        let t = p.trail[i];
        let a = i / p.trail.length;
        ctx.fillStyle = '#4af';
        ctx.beginPath(); ctx.arc(t.x, t.y, 3 * a, 0, Math.PI * 2); ctx.fill();
      }
      // Core
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#8cf';
      ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2); ctx.fill();
      // Glow
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = '#4af';
      ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI * 2); ctx.fill();
      // Orbiting particles
      let oa = gameTime * 10;
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#4af';
      ctx.beginPath(); ctx.arc(p.x + Math.cos(oa) * 5, p.y + Math.sin(oa) * 5, 1, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(p.x + Math.cos(oa + Math.PI) * 5, p.y + Math.sin(oa + Math.PI) * 5, 1, 0, Math.PI * 2); ctx.fill();
    } else if (p.type === 'flame') {
      // Animated fire shape
      let age = 1 - p.life / p.maxLife;
      let size = 4 + age * 6;
      ctx.globalAlpha = 0.7 * (p.life / p.maxLife);
      // Outer red
      ctx.fillStyle = '#d40';
      ctx.beginPath(); ctx.arc(p.x, p.y, size, 0, Math.PI * 2); ctx.fill();
      // Middle orange
      ctx.fillStyle = '#f80';
      ctx.beginPath(); ctx.arc(p.x, p.y, size * 0.7, 0, Math.PI * 2); ctx.fill();
      // Core yellow
      ctx.fillStyle = '#ff4';
      ctx.beginPath(); ctx.arc(p.x, p.y, size * 0.3, 0, Math.PI * 2); ctx.fill();
      // Smoke trail
      ctx.fillStyle = 'rgba(60,40,20,0.15)';
      for (let t of p.trail) {
        ctx.beginPath(); ctx.arc(t.x, t.y, 2 + age * 3, 0, Math.PI * 2); ctx.fill();
      }
    } else if (p.type === 'enemy') {
      // Glow ball (colored per enemy type)
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = 0.6;
      ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill();
      // Glow halo
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI * 2); ctx.fill();
      // Trail
      ctx.globalAlpha = 0.2;
      for (let i = 0; i < p.trail.length; i++) {
        let t = p.trail[i];
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.1 * (i / p.trail.length);
        ctx.beginPath(); ctx.arc(t.x, t.y, 2, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();
  });
}

// ===== Special particles (rail, flash, shockwave) =====
export function renderSpecialParticles(ctx) {
  for (let p of particles) {
    if (p.type === 'rail') {
      ctx.save();
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.vx * p.range, p.y + p.vy * p.range);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(200,200,255,0.5)';
      ctx.lineWidth = 8;
      ctx.stroke();
      ctx.restore();
    } else if (p.type === 'flash') {
      ctx.save();
      ctx.globalAlpha = (p.life / p.maxLife) * 0.8;
      ctx.fillStyle = `rgb(${p.r},${p.g},${p.b})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.radius * (1 - p.life / p.maxLife + 0.5), 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    } else if (p.type === 'shockwave') {
      ctx.save();
      ctx.globalAlpha = (p.life / p.maxLife) * 0.5;
      ctx.strokeStyle = `rgb(${p.r},${p.g},${p.b})`;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  }
}

// ===== Pool particles (sparks, chunks) =====
export function renderPoolParticles(ctx) {
  particlePool.active.forEach(p => {
    let sx = p.x - camX + shakeX, sy_check = p.y - camY + shakeY;
    if (sx < -20 || sx > W + 20 || sy_check < -20 || sy_check > H + 20) return;
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = `rgb(${p.r},${p.g},${p.b})`;
    if (p.type === 'chunk') {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(gameTime * 5 + p.vx);
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    } else {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    }
  });
  ctx.globalAlpha = 1;
}

// ===== Atmospheric particles =====
export function renderAtmParticles(ctx) {
  for (let p of atmParticles) {
    let sx = p.x - camX + shakeX, sy_check = p.y - camY + shakeY;
    if (sx < -20 || sx > W + 20 || sy_check < -20 || sy_check > H + 20) continue;
    ctx.globalAlpha = p.alpha * (p.life / p.maxLife);
    if (p.type === 'dust') {
      ctx.fillStyle = p.golden ? 'rgba(220,200,120,0.6)' : 'rgba(200,200,180,0.5)';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      if (p.golden) {
        ctx.globalAlpha = p.alpha * (p.life / p.maxLife) * 0.3;
        ctx.fillStyle = 'rgba(255,230,140,0.4)';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2); ctx.fill();
      }
    } else if (p.type === 'atm_spark') {
      ctx.fillStyle = '#fa0';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    } else if (p.type === 'smoke') {
      ctx.fillStyle = 'rgba(100,100,100,0.3)';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    } else if (p.type === 'rain') {
      ctx.strokeStyle = 'rgba(150,180,220,0.4)';
      ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.vx * 0.02, p.y + p.vy * 0.02); ctx.stroke();
    } else if (p.type === 'arc') {
      // Electrical arc - bright cyan/white zigzag
      let fade = p.life / p.maxLife;
      ctx.save();
      ctx.globalAlpha = p.alpha * fade;
      ctx.strokeStyle = 'rgba(120,220,255,0.9)';
      ctx.lineWidth = 1.5; ctx.shadowColor = '#0ff'; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.moveTo(p.x, p.y);
      for (let s of p.segs) ctx.lineTo(s.x, s.y);
      ctx.stroke();
      // Bright white core
      ctx.strokeStyle = 'rgba(220,240,255,0.7)';
      ctx.lineWidth = 0.6; ctx.shadowBlur = 4;
      ctx.beginPath(); ctx.moveTo(p.x, p.y);
      for (let s of p.segs) ctx.lineTo(s.x, s.y);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();
    } else if (p.type === 'drip') {
      // Water droplet - blue teardrop
      ctx.fillStyle = 'rgba(100,160,220,0.6)';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      // Tiny highlight
      ctx.globalAlpha = p.alpha * (p.life / p.maxLife) * 0.5;
      ctx.fillStyle = 'rgba(180,210,255,0.8)';
      ctx.beginPath(); ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.4, 0, Math.PI * 2); ctx.fill();
    } else if (p.type === 'splash') {
      ctx.fillStyle = 'rgba(120,180,240,0.5)';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    } else if (p.type === 'steam') {
      // Semi-transparent white cloud
      let fade = p.life / p.maxLife;
      ctx.fillStyle = `rgba(180,200,210,${0.12 * fade})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(200,220,230,${0.06 * fade})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 1.4, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

// ===== Update all particles (called from update loop) =====
export function updateParticles(dt) {
  // Pool particles (sparks, chunks)
  for (let i = particlePool.active.length - 1; i >= 0; i--) {
    let p = particlePool.active[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.grav) p.vy += 200 * dt;
    p.life -= dt;
    if (p.life <= 0) {
      particlePool.ret(p);
    }
  }

  // Special particles (rail, flash, shockwave)
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.life -= dt;
    if (p.type === 'shockwave') {
      p.radius += p.speed * dt;
    }
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }

  // Atmospheric particles
  for (let i = atmParticles.length - 1; i >= 0; i--) {
    let p = atmParticles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    // Dust swirl motion
    if (p.type === 'dust' && p.swirlRadius) {
      p.swirlPhase += p.swirlSpeed * dt;
      p.x += Math.cos(p.swirlPhase) * p.swirlRadius * dt;
      p.y += Math.sin(p.swirlPhase) * p.swirlRadius * dt * 0.5;
    }
    // Steam grows
    if (p.type === 'steam' && p.growRate) {
      p.size += p.growRate * dt;
    }
    // Drip splashes when hitting floor
    if (p.type === 'drip' && !p.splashed && p.floorY && p.y >= p.floorY) {
      p.splashed = true;
      p.vy = 0; p.vx = 0;
      p.life = Math.min(p.life, 0.3);
      // Spawn splash particles
      for (let s = 0; s < 3; s++) {
        atmParticles.push({
          x: p.x + (Math.random() - 0.5) * 4, y: p.y,
          vx: (Math.random() - 0.5) * 15, vy: -5 - Math.random() * 10,
          life: 0.2 + Math.random() * 0.15, maxLife: 0.35, size: 0.8 + Math.random() * 0.4,
          type: 'splash', alpha: 0.3
        });
      }
    }
    if (p.life <= 0) {
      atmParticles.splice(i, 1);
    }
  }
}
