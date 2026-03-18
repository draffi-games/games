// VOID PROTOCOL — Combat System (Damage, Kill Mechanics, Visual Effects)

import {
    T, EN_SCOUT, EN_SENTINEL, EN_HEAVY, EN_COMMANDER,
    DIFF, ROOM_START, ROOM_EXIT, MAX_DECALS
} from '../core/constants.js';
import {
    player, enemies, rooms, pickups, particles, damageNums, killFeed,
    corpses, decals, dynamicLights, barrels,
    stats, totalKills, levelKills, killStreak, killStreakTimer,
    shakeMag, chromatic, killFlash, hitStopTimer, lastKillSlowMo, gameSpeed,
    difficulty, level, miniBossThreshold,
    lastHitAngle, lastHitTimer, dmgFlash,
    streakAnnounceText, streakAnnounceColor, streakAnnounceTimer,
    hudKillStreakLabel, hudKillStreakLabelTimer,
    set
} from '../core/state.js';
import { hexToRgb, particlePool } from '../core/utils.js';
import { SFX } from '../audio/sfx.js';
import { tileAt } from './collision.js';
import { isWalkable } from '../level/generator.js';
import { weapons } from '../entities/weapons.js';

// Forward declaration: createEnemy is imported lazily to break circular dep
let _createEnemy = null;
export function _setCombatCreateEnemy(fn) { _createEnemy = fn; }

// Forward declaration: gameOver is imported lazily (lives in ui/game-flow or main)
let _gameOver = null;
export function _setCombatGameOver(fn) { _gameOver = fn; }

// ========== VISUAL HELPERS ==========

export function spawnSparks(x, y, count, color) {
    for (let i = 0; i < count; i++) {
        let a = Math.random() * Math.PI * 2;
        let spd = 40 + Math.random() * 100;
        let p = particlePool.get();
        p.x = x; p.y = y;
        p.vx = Math.cos(a) * spd; p.vy = Math.sin(a) * spd;
        p.life = 0.2 + Math.random() * 0.3; p.maxLife = p.life;
        let c = hexToRgb(color || '#ff0');
        p.r = c.r; p.g = c.g; p.b = c.b;
        p.size = 1 + Math.random() * 2; p.grav = false; p.type = 'spark';
    }
}

export function addDmgNum(x, y, dmg, crit) {
    damageNums.push({
        x: x + (Math.random() - 0.5) * 10, y, dmg: Math.round(dmg), life: 0.8, maxLife: 0.8,
        vy: -60 - Math.random() * 20, vx: (Math.random() - 0.5) * 30,
        color: crit ? '#f44' : dmg > 20 ? '#ff0' : '#fff'
    });
}

export function addKillFeed(msg) {
    killFeed.push({ msg, life: 5, maxLife: 5 });
    if (killFeed.length > 5) killFeed.shift();
}

export function addDecal(x, y, type, size, color, life) {
    if (decals.length >= MAX_DECALS) decals.shift();
    decals.push({ x, y, type, size, color: color || 'rgba(20,40,50,0.4)', alpha: 0.6, life: life || 0, maxLife: life || 0 });
}

export function addDynamicLight(x, y, radius, r, g, b, life) {
    if (dynamicLights.length >= 10) {
        let minIdx = 0, minLife = dynamicLights[0].life;
        for (let i = 1; i < dynamicLights.length; i++) {
            if (dynamicLights[i].life < minLife) { minLife = dynamicLights[i].life; minIdx = i; }
        }
        dynamicLights.splice(minIdx, 1);
    }
    dynamicLights.push({ x, y, radius, r, g, b, life, maxLife: life });
}

// ========== DAMAGE ENEMY ==========

export function damageEnemy(e, dmg) {
    if (!e.alive) return;
    let actualDmg = dmg;
    if (e.type === EN_COMMANDER && e.shieldHp > 0) {
        let shieldDmg = Math.min(e.shieldHp, dmg);
        e.shieldHp -= shieldDmg;
        actualDmg = dmg - shieldDmg;
        if (shieldDmg > 0) spawnSparks(e.x, e.y, 3, '#a4f');
    }
    let hpBefore = e.hp;
    e.hp -= actualDmg;
    e.hitFlash = 0.1;
    SFX.enemyHit();
    stats.shotsHit++;
    stats.dmgDealt += actualDmg;
    e.alert = true;
    e.alertTimer = 10;
    addDmgNum(e.x, e.y - e.size, actualDmg, actualDmg > 20);
    // Scout dodge on hit (with cooldown to prevent glitchy rapid dodges)
    if (e.type === EN_SCOUT && e.alive && Math.random() < 0.5 && (!e.dodgeCD || e.dodgeCD <= 0)) {
        let dodgeAngle = Math.atan2(player.y - e.y, player.x - e.x) + Math.PI / 2 * (Math.random() > 0.5 ? 1 : -1);
        let nx = e.x + Math.cos(dodgeAngle) * 20, ny = e.y + Math.sin(dodgeAngle) * 20;
        if (isWalkable(tileAt(nx, ny))) { e.x = nx; e.y = ny; e.dodgeCD = 0.3; }
    }

    // Alert nearby
    for (let other of enemies) {
        if (other === e || !other.alive) continue;
        let dx = other.x - e.x, dy = other.y - e.y;
        if (Math.sqrt(dx * dx + dy * dy) < 200) { other.alert = true; other.alertTimer = 8; }
    }

    if (e.hp <= 0) killEnemy(e, actualDmg, hpBefore);
}

// ========== KILL ENEMY ==========

export function killEnemy(e, lastHitDmg, hpBeforeHit) {
    e.alive = false;
    SFX.explode();
    set('levelKills', levelKills + 1);
    set('totalKills', totalKills + 1);

    // --- Hit stop freeze frame: bigger enemies = longer freeze ---
    let isBig = e.type === EN_HEAVY || e.type === EN_COMMANDER;
    set('hitStopTimer', isBig ? 0.07 : 0.04);

    // --- Screen flash on kill: white flash, stronger for big enemies ---
    set('killFlash', isBig ? 0.35 : 0.15);

    // Create corpse debris at death position
    let corpseTint = e.type === EN_SCOUT ? '#556677' : e.type === EN_SENTINEL ? '#443333' : e.type === EN_HEAVY ? '#443320' : '#332244';
    corpses.push({
        x: e.x, y: e.y, type: e.type, size: e.size, angle: Math.random() * Math.PI * 2,
        life: 15, maxLife: 15, tint: corpseTint, chunks: []
    });
    let c = corpses[corpses.length - 1];
    for (let i = 0; i < 3 + e.size / 5; i++) {
        c.chunks.push({
            ox: (Math.random() - 0.5) * e.size * 1.2, oy: (Math.random() - 0.5) * e.size * 1.2,
            w: 2 + Math.random() * 4, h: 2 + Math.random() * 3, a: Math.random() * Math.PI * 2
        });
    }
    if (corpses.length > 30) corpses.shift();

    // Kill streak (3s window)
    if (killStreakTimer > 0) set('killStreak', killStreak + 1);
    else set('killStreak', 1);
    set('killStreakTimer', 3);
    stats.bestStreak = Math.max(stats.bestStreak, killStreak);

    // Streak announcements - large centered text
    if (killStreak >= 10) {
        addKillFeed('GODLIKE x' + killStreak); set('chromatic', 0.5); set('shakeMag', Math.max(shakeMag, 12));
        set('streakAnnounceText', 'GODLIKE'); set('streakAnnounceColor', '#a4f'); set('streakAnnounceTimer', 2.5);
        set('hudKillStreakLabel', 'GODLIKE x' + killStreak); set('hudKillStreakLabelTimer', 3.5);
        set('killFlash', 0.5); // screen pulse for GODLIKE
    } else if (killStreak >= 8) {
        addKillFeed('ULTRA KILL'); set('chromatic', 0.35); set('shakeMag', Math.max(shakeMag, 10));
        set('streakAnnounceText', 'ULTRA KILL'); set('streakAnnounceColor', '#f44'); set('streakAnnounceTimer', 2);
        set('hudKillStreakLabel', 'ULTRA KILL'); set('hudKillStreakLabelTimer', 3);
    } else if (killStreak >= 5) {
        addKillFeed('MEGA KILL'); set('chromatic', 0.25); set('shakeMag', Math.max(shakeMag, 8));
        set('streakAnnounceText', 'MEGA KILL'); set('streakAnnounceColor', '#fa0'); set('streakAnnounceTimer', 1.8);
        set('hudKillStreakLabel', 'MEGA KILL'); set('hudKillStreakLabelTimer', 3);
    } else if (killStreak >= 3) {
        addKillFeed('MULTI KILL'); set('chromatic', 0.15); set('shakeMag', Math.max(shakeMag, 5));
        set('streakAnnounceText', 'MULTI KILL'); set('streakAnnounceColor', '#ff0'); set('streakAnnounceTimer', 1.5);
        set('hudKillStreakLabel', 'MULTI KILL'); set('hudKillStreakLabelTimer', 2.5);
    } else if (killStreak === 2) {
        addKillFeed('DOUBLE KILL'); set('hudKillStreakLabel', 'DOUBLE KILL'); set('hudKillStreakLabelTimer', 2);
    } else {
        addKillFeed(e.name + ' DESTROYED');
    }

    // --- Overkill Bonus: hit did more than 2x the remaining HP ---
    if (lastHitDmg !== undefined && hpBeforeHit !== undefined && hpBeforeHit > 0 && lastHitDmg > hpBeforeHit * 2) {
        damageNums.push({
            x: e.x, y: e.y - e.size - 15, dmg: 0, life: 1.2, maxLife: 1.2,
            vy: -40, vx: 0, color: '#f80', text: 'OVERKILL'
        });
        for (let i = 0; i < 20; i++) {
            let a = Math.random() * Math.PI * 2;
            let spd = 80 + Math.random() * 250;
            let p = particlePool.get();
            p.x = e.x; p.y = e.y;
            p.vx = Math.cos(a) * spd; p.vy = Math.sin(a) * spd;
            p.life = 0.4 + Math.random() * 0.6; p.maxLife = p.life;
            p.r = 255; p.g = 100 + Math.floor(Math.random() * 100); p.b = 0;
            p.size = 2 + Math.random() * 4; p.grav = true; p.type = 'spark';
        }
        set('shakeMag', Math.max(shakeMag, 8));
        set('chromatic', Math.max(chromatic, 0.2));
    }

    // --- Headshot Zone: 20% chance for CRITICAL on killing blow ---
    if (Math.random() < 0.2) {
        damageNums.push({
            x: e.x, y: e.y - e.size - 30, dmg: 0, life: 1.2, maxLife: 1.2,
            vy: -50, vx: (Math.random() - 0.5) * 20, color: '#fd0', text: 'CRITICAL'
        });
        for (let i = 0; i < 15; i++) {
            let a = Math.random() * Math.PI * 2;
            let spd = 60 + Math.random() * 180;
            let p = particlePool.get();
            p.x = e.x; p.y = e.y;
            p.vx = Math.cos(a) * spd; p.vy = Math.sin(a) * spd;
            p.life = 0.3 + Math.random() * 0.5; p.maxLife = p.life;
            p.r = 255; p.g = 215; p.b = 0;
            p.size = 1.5 + Math.random() * 3; p.grav = false; p.type = 'spark';
        }
        set('hitStopTimer', Math.max(hitStopTimer, 0.08));
    }

    // --- Enhanced death particles per enemy type ---
    let sparkColors, chunkColors;
    if (e.type === EN_SCOUT) {
        sparkColors = [[100, 200, 255], [150, 220, 255], [200, 255, 255]];
        chunkColors = [[70, 90, 110], [50, 70, 90]];
    } else if (e.type === EN_SENTINEL) {
        sparkColors = [[255, 100, 60], [255, 180, 50], [255, 80, 30]];
        chunkColors = [[100, 50, 40], [80, 40, 30]];
    } else if (e.type === EN_HEAVY) {
        sparkColors = [[255, 200, 50], [255, 150, 0], [255, 255, 120]];
        chunkColors = [[100, 85, 40], [80, 70, 30]];
    } else {
        sparkColors = [[200, 120, 255], [170, 80, 255], [255, 180, 255]];
        chunkColors = [[80, 50, 100], [60, 30, 80]];
    }

    // Death explosion sparks (more, type-colored)
    let sparkCount = e.type === EN_COMMANDER ? 100 : 40 + e.size;
    for (let i = 0; i < sparkCount; i++) {
        let a = Math.random() * Math.PI * 2;
        let spd = 60 + Math.random() * 250;
        let p = particlePool.get();
        p.x = e.x; p.y = e.y;
        p.vx = Math.cos(a) * spd; p.vy = Math.sin(a) * spd;
        p.life = 0.3 + Math.random() * 0.6; p.maxLife = p.life;
        let sc = sparkColors[Math.floor(Math.random() * sparkColors.length)];
        p.r = sc[0]; p.g = sc[1]; p.b = sc[2];
        p.size = 1 + Math.random() * 3; p.grav = true; p.type = 'spark';
    }

    // Tumbling metal chunks (type-tinted, spread from center)
    let chunkCount = e.type === EN_COMMANDER ? 25 : 12 + Math.floor(e.size / 3);
    for (let i = 0; i < chunkCount; i++) {
        let a = Math.random() * Math.PI * 2;
        let spd = 40 + Math.random() * 150;
        let p = particlePool.get();
        p.x = e.x + (Math.random() - 0.5) * e.size * 0.5;
        p.y = e.y + (Math.random() - 0.5) * e.size * 0.5;
        p.vx = Math.cos(a) * spd; p.vy = Math.sin(a) * spd;
        p.life = 0.6 + Math.random() * 0.6; p.maxLife = p.life;
        let cc = chunkColors[Math.floor(Math.random() * chunkColors.length)];
        p.r = cc[0]; p.g = cc[1]; p.b = cc[2];
        p.size = 2 + Math.random() * 4; p.grav = true; p.type = 'chunk';
    }

    // Bright bouncing sparks (small white-hot dots that linger)
    let bounceCount = isBig ? 12 : 6;
    for (let i = 0; i < bounceCount; i++) {
        let a = Math.random() * Math.PI * 2;
        let spd = 80 + Math.random() * 180;
        let p = particlePool.get();
        p.x = e.x; p.y = e.y;
        p.vx = Math.cos(a) * spd; p.vy = Math.sin(a) * spd;
        p.life = 0.8 + Math.random() * 0.5; p.maxLife = p.life;
        p.r = 255; p.g = 255; p.b = 220;
        p.size = 0.8 + Math.random() * 1.2; p.grav = true; p.type = 'spark';
    }

    // Bright initial flash (larger for bigger enemies)
    let flashRadius = isBig ? e.size * 5 : e.size * 3;
    particles.push({ x: e.x, y: e.y, life: 0.18, maxLife: 0.18, type: 'flash', radius: flashRadius, r: 255, g: 240, b: 200 });
    // Secondary colored flash per type
    let fc = sparkColors[0];
    particles.push({ x: e.x, y: e.y, life: 0.12, maxLife: 0.12, type: 'flash', radius: flashRadius * 0.6, r: fc[0], g: fc[1], b: fc[2] });

    // Decals
    for (let i = 0; i < 3 + Math.floor(Math.random() * 3); i++) {
        addDecal(e.x + (Math.random() - 0.5) * 20, e.y + (Math.random() - 0.5) * 20,
            Math.random() > 0.5 ? 'oil' : 'scorch', 3 + Math.random() * 5);
    }

    // Screen shake (boosted)
    set('shakeMag', Math.max(shakeMag, e.type === EN_COMMANDER ? 15 : e.size * 0.6));
    set('chromatic', Math.max(chromatic, isBig ? 0.2 : 0.1));

    // --- Last Kill Slow-Mo: brief slowdown when last enemy in room dies ---
    let aliveCount = 0;
    for (let other of enemies) { if (other.alive && other !== e) aliveCount++; }
    if (aliveCount === 0 && totalKills > 1) {
        set('lastKillSlowMo', 0.3);
        set('gameSpeed', 0.3);
        set('shakeMag', Math.max(shakeMag, 6));
        set('chromatic', Math.max(chromatic, 0.15));
    }

    // Enemy loot drops (30% chance)
    if (Math.random() < 0.3) {
        let lootType = e.type === EN_HEAVY ? 'health' : e.type === EN_SENTINEL ? 'ammo' : Math.random() < 0.5 ? 'health' : 'ammo';
        if (lootType === 'health') {
            pickups.push({
                x: e.x + (Math.random() - 0.5) * 10, y: e.y + (Math.random() - 0.5) * 10,
                type: 'health', amount: e.type === EN_HEAVY ? 25 : 10, collected: false
            });
        } else {
            let wIdx = 1 + Math.floor(Math.random() * 5);
            pickups.push({
                x: e.x + (Math.random() - 0.5) * 10, y: e.y + (Math.random() - 0.5) * 10,
                type: 'ammo', weaponIdx: wIdx, amount: Math.floor(weapons[wIdx].ammo * 0.08), collected: false
            });
        }
    }
    // Commander always drops big loot
    if (e.type === EN_COMMANDER) {
        pickups.push({ x: e.x - 15, y: e.y, type: 'health', amount: 50, collected: false });
        pickups.push({ x: e.x + 15, y: e.y, type: 'armor', amount: 40, collected: false });
        let wIdx = 3 + Math.floor(Math.random() * 3);
        pickups.push({ x: e.x, y: e.y + 15, type: 'weapon', weaponIdx: wIdx, collected: false });
    }

    // Mini-boss spawn every 15 kills
    if (totalKills >= miniBossThreshold) {
        set('miniBossThreshold', miniBossThreshold + 15);
        // Spawn a Rogue Heavy near a random room (not start)
        let spawnRooms = rooms.filter(r => r.type !== ROOM_START && r.type !== ROOM_EXIT);
        if (spawnRooms.length > 0 && _createEnemy) {
            let sr = spawnRooms[Math.floor(Math.random() * spawnRooms.length)];
            let rh = _createEnemy(sr.cx * T + T / 2, sr.cy * T + T / 2, EN_HEAVY, DIFF[difficulty], sr);
            rh.hp = Math.round(rh.maxHp * 2.5); rh.maxHp = rh.hp;
            rh.dmg = Math.round(rh.dmg * 1.5);
            rh.size = Math.round(rh.size * 1.3);
            rh.name = 'ROGUE HEAVY';
            rh.rogue = true;
            rh.alert = true; rh.alertTimer = 30;
            enemies.push(rh);
            addKillFeed('WARNING: ROGUE HEAVY DEPLOYED');
            particles.push({
                x: sr.cx * T + T / 2, y: sr.cy * T + T / 2,
                life: 0.4, maxLife: 0.4, type: 'shockwave', radius: 0, maxRadius: 100, r: 255, g: 136, b: 0
            });
        }
    }

    // Commander death: shockwave + stun scouts
    if (e.type === EN_COMMANDER) {
        particles.push({ x: e.x, y: e.y, life: 0.5, maxLife: 0.5, type: 'shockwave', radius: 0, maxRadius: 200, r: 170, g: 68, b: 255 });
        for (let other of enemies) {
            if (!other.alive || other === e) continue;
            let dx = other.x - e.x, dy = other.y - e.y;
            if (Math.sqrt(dx * dx + dy * dy) < 200) { other.alertTimer = -2; }
        }
    }
}

// ========== DAMAGE PLAYER ==========

export function damagePlayer(dmg, srcX, srcY) {
    if (player.invuln > 0 || !player.alive) return;
    let actual = dmg;
    if (player.armor > 0) {
        let absorbed = Math.min(player.armor, dmg * 0.6);
        player.armor -= absorbed;
        actual = dmg - absorbed;
    }
    player.hp -= actual;
    stats.dmgTaken += actual;
    SFX.hit();
    set('dmgFlash', 0.3);
    set('chromatic', 0.15);
    set('shakeMag', Math.max(shakeMag, 3));
    player.invuln = 0.1;
    // Damage direction indicator
    if (srcX !== undefined && srcY !== undefined) {
        set('lastHitAngle', Math.atan2(srcY - player.y, srcX - player.x));
        set('lastHitTimer', 0.8);
    } else { set('lastHitTimer', 0.5); }
    if (player.hp <= 0) {
        player.hp = 0;
        player.alive = false;
        if (_gameOver) _gameOver();
    }
}
