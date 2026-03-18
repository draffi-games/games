// VOID PROTOCOL — Enemy Placement, Creation & AI

import {
    T, EN_SCOUT, EN_SENTINEL, EN_HEAVY, EN_COMMANDER,
    DIFF, TILE_WALL, TILE_VOID, TILE_FLOOR,
    ROOM_START, ROOM_EXIT, ROOM_PATROL, ROOM_SERVER, ROOM_ARMORY, ROOM_STORAGE, ROOM_BOSS
} from '../core/constants.js';
import {
    player, enemies, rooms, particles, toxicPools,
    airdrops, atmParticles, collapseWalls, powerUp,
    map, mapW, mapH,
    gameTime, difficulty, level,
    shakeMag, chromatic, countdownActive, countdownTime,
    airdropTimer, collapseTimer, collapseTriggered,
    alarmActive, alarmTimer,
    flickerTimer, flickerDuration, flickering,
    set
} from '../core/state.js';
import { hashR, particlePool } from '../core/utils.js';
import { isFloorTile, isWalkable } from '../level/generator.js';
import { tileAt, enemyBlocked, unstickEnemy, lineOfSight } from '../systems/collision.js';
import { damagePlayer, killEnemy, spawnSparks, addDecal, addKillFeed } from '../systems/combat.js';
import { enemyShoot } from '../systems/weapons.js';

// Forward declaration: gameOver is imported lazily (lives in ui/game-flow or main)
let _gameOver = null;
export function _setEnemiesGameOver(fn) { _gameOver = fn; }

// ========== ROOM HELPER ==========

export function isInRoom(x, y, room) {
    return x >= room.x && x < room.x + room.w && y >= room.y && y < room.y + room.h;
}

// ========== ENEMY PLACEMENT ==========

export function placeEnemies(lvl) {
    let newEnemies = [];
    let diff = DIFF[difficulty];
    for (let room of rooms) {
        if (room.type === ROOM_START) continue;
        let count = 0;
        let types = [];
        switch (room.type) {
            case ROOM_PATROL:
                count = 2 + Math.floor(Math.random() * 3) + lvl + difficulty;
                types = [EN_SCOUT, EN_SCOUT, EN_SENTINEL];
                if (lvl >= 2) types.push(EN_HEAVY);
                if (difficulty >= 2) types.push(EN_SENTINEL);
                break;
            case ROOM_SERVER:
                count = 3 + lvl;
                types = [EN_SENTINEL, EN_SENTINEL, EN_SCOUT];
                break;
            case ROOM_ARMORY:
                count = 2 + lvl;
                types = [EN_SCOUT, EN_HEAVY];
                break;
            case ROOM_STORAGE:
                count = 1 + lvl;
                types = [EN_SCOUT, EN_SENTINEL];
                break;
            case ROOM_BOSS:
                count = 2 + lvl;
                types = [EN_SCOUT, EN_SENTINEL];
                // Commander
                newEnemies.push(createEnemy(room.cx * T + T / 2, room.cy * T + T / 2, EN_COMMANDER, diff, room));
                break;
            case ROOM_EXIT:
                count = 1;
                types = [EN_SCOUT];
                break;
        }
        for (let i = 0; i < count; i++) {
            let ex = room.x + 1 + Math.floor(Math.random() * (room.w - 2));
            let ey = room.y + 1 + Math.floor(Math.random() * (room.h - 2));
            if (isFloorTile(map[ey * mapW + ex])) {
                let type = types[Math.floor(Math.random() * types.length)];
                newEnemies.push(createEnemy(ex * T + T / 2, ey * T + T / 2, type, diff, room));
            }
        }
    }
    set('enemies', newEnemies);
}

// ========== ENEMY CREATION ==========

export function createEnemy(x, y, type, diff, room) {
    const baseStats = [
        { hp: 12, spd: 110, dmg: 8, size: 10, react: 0.8, range: 30, ranged: false, name: 'SCOUT' },
        { hp: 28, spd: 70, dmg: 12, size: 14, react: 1.2, range: 250, ranged: true, name: 'SENTINEL' },
        { hp: 70, spd: 40, dmg: 20, size: 20, react: 1.5, range: 40, ranged: false, name: 'HEAVY' },
        { hp: 400, spd: 55, dmg: 15, size: 24, react: 1.0, range: 300, ranged: true, name: 'COMMANDER' }
    ];
    let s = baseStats[type];
    let e = {
        x, y, type, room,
        hp: Math.round(s.hp * diff.hpMul),
        maxHp: Math.round(s.hp * diff.hpMul),
        spd: s.spd,
        dmg: Math.round(s.dmg * diff.dmgMul),
        size: s.size,
        react: s.react * diff.reactMul,
        range: s.range,
        ranged: s.ranged,
        name: s.name,
        alive: true,
        alert: false,
        alertTimer: 0,
        attackCD: 0,
        angle: Math.random() * Math.PI * 2,
        patrolAngle: Math.random() * Math.PI * 2,
        patrolTimer: 0,
        hitFlash: 0,
        vx: 0, vy: 0,
        walkCycle: Math.random() * Math.PI * 2
    };
    if (type === EN_HEAVY) {
        e.chargeCD = 4 + Math.random() * 2;
        e.charging = false;
        e.chargeAngle = 0;
        e.chargeTimer = 0;
        e.chargeWindup = 0;
    }
    if (type === EN_SENTINEL) {
        e.windupTimer = 0;
        e.windupTarget = null;
    }
    if (type === EN_COMMANDER) {
        e.shieldHp = 100;
        e.maxShield = 100;
        e.spawnCD = 5;
        e.maxSpawnCD = 5;
        e.spawnCount = 0;
        e.teleportCD = 8 + Math.random() * 4;
    }
    return e;
}

// ========== COUNTDOWN ENEMY SPAWNING ==========

export function spawnCountdownEnemies() {
    let diff = DIFF[difficulty];
    for (let room of rooms) {
        if (room.type === ROOM_START || room.type === ROOM_EXIT) continue;
        let count = 2 + Math.floor(Math.random() * 3) + difficulty;
        for (let i = 0; i < count; i++) {
            let ex = room.x + 1 + Math.floor(Math.random() * (room.w - 2));
            let ey = room.y + 1 + Math.floor(Math.random() * (room.h - 2));
            if (isFloorTile(map[ey * mapW + ex])) {
                let types = [EN_SCOUT, EN_SCOUT, EN_SENTINEL];
                if (level >= 2) types.push(EN_HEAVY);
                if (difficulty >= 2) types.push(EN_SENTINEL, EN_HEAVY);
                let type = types[Math.floor(Math.random() * types.length)];
                let e = createEnemy(ex * T + T / 2, ey * T + T / 2, type, diff, room);
                e.alert = true;
                e.alertTimer = 999;
                enemies.push(e);
            }
        }
    }
}

// ========== ENEMY AI (called from update loop) ==========

export function updateEnemies(dt) {
    for (let e of enemies) {
        if (!e.alive) continue;
        e.hitFlash = Math.max(0, e.hitFlash - dt);
        if (e.dodgeCD > 0) e.dodgeCD -= dt;
        e.walkCycle += dt * 6;

        let dx = player.x - e.x, dy = player.y - e.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        // Alert check
        if (!e.alert && dist < 250 && lineOfSight(e.x, e.y, player.x, player.y)) {
            e.alert = true;
            e.alertTimer = 10;
        }
        if (e.alertTimer > 0) e.alertTimer -= dt;
        if (e.alertTimer <= 0 && !countdownActive) e.alert = false;

        // Countdown makes all enemies alert
        if (countdownActive) e.alert = true;

        if (e.alert && player.alive) {
            // Move toward player
            let targetAngle = Math.atan2(dy, dx);
            e.angle = targetAngle;

            // Movement
            let moveSpd = e.spd * dt;
            let wantX = e.x + Math.cos(targetAngle) * moveSpd;
            let wantY = e.y + Math.sin(targetAngle) * moveSpd;

            // Heavy charge attack
            if (e.type === EN_HEAVY && e.charging) {
                e.chargeTimer -= dt;
                let cspd = moveSpd * 3;
                wantX = e.x + Math.cos(e.chargeAngle) * cspd;
                wantY = e.y + Math.sin(e.chargeAngle) * cspd;
                // Ground trail sparks
                if (Math.random() < 0.5) {
                    let p2 = particlePool.get();
                    p2.x = e.x + (Math.random() - 0.5) * 6; p2.y = e.y + (Math.random() - 0.5) * 6;
                    p2.vx = (Math.random() - 0.5) * 20; p2.vy = (Math.random() - 0.5) * 20;
                    p2.life = 0.2 + Math.random() * 0.2; p2.maxLife = p2.life;
                    p2.r = 255; p2.g = 136; p2.b = 0; p2.size = 1.5; p2.grav = false; p2.type = 'spark';
                }
                // Hit player during charge
                if (dist < e.size + player.size + 8) {
                    damagePlayer(Math.round(e.dmg * 1.5), e.x, e.y);
                    e.charging = false; e.chargeCD = 5 + Math.random() * 3;
                    e.attackCD = e.react * 2;
                    particles.push({ x: e.x, y: e.y, life: 0.3, maxLife: 0.3, type: 'shockwave', radius: 0, maxRadius: 60, r: 255, g: 136, b: 0 });
                    set('shakeMag', Math.max(shakeMag, 7));
                    spawnSparks(player.x, player.y, 10, '#f80');
                    addKillFeed('HEAVY CHARGE IMPACT');
                }
                // Wall crash detection: if charge movement is fully blocked, Heavy crashes
                let chargeBlockedX = tileAt(wantX, e.y) === TILE_WALL || tileAt(wantX, e.y) === TILE_VOID;
                let chargeBlockedY = tileAt(e.x, wantY) === TILE_WALL || tileAt(e.x, wantY) === TILE_VOID;
                if (chargeBlockedX && chargeBlockedY && e.chargeTimer > 0) {
                    e.charging = false; e.chargeCD = 6 + Math.random() * 3;
                    e.attackCD = e.react * 3; // stunned longer after wall crash
                    // Crash VFX
                    let crashX = e.x + Math.cos(e.chargeAngle) * (e.size + 4);
                    let crashY = e.y + Math.sin(e.chargeAngle) * (e.size + 4);
                    particles.push({ x: crashX, y: crashY, life: 0.3, maxLife: 0.3, type: 'shockwave', radius: 0, maxRadius: 50, r: 200, g: 120, b: 40 });
                    spawnSparks(crashX, crashY, 12, '#fa0');
                    spawnSparks(crashX, crashY, 6, '#dc8');
                    addDecal(crashX, crashY, 'scorch', 4 + Math.random() * 3);
                    set('shakeMag', Math.max(shakeMag, 6));
                    set('chromatic', Math.max(chromatic, 0.12));
                    addKillFeed('HEAVY WALL CRASH');
                    // Self-damage on crash (10% of max HP)
                    e.hp -= Math.round(e.maxHp * 0.1);
                    if (e.hp <= 0 && e.alive) killEnemy(e);
                }
                if (e.chargeTimer <= 0) { e.charging = false; e.chargeCD = 3 + Math.random() * 2; }
            }
            // Type-specific movement behavior
            else if (e.type === EN_SCOUT && dist < 120 && dist > 25) {
                // Scouts flank: circle strafe toward player
                let flankDir = (hashR(Math.floor(e.x), Math.floor(e.y), 0) > 0.5) ? 1 : -1;
                let flankAngle = targetAngle + Math.PI * 0.35 * flankDir;
                wantX = e.x + Math.cos(flankAngle) * moveSpd * 1.2;
                wantY = e.y + Math.sin(flankAngle) * moveSpd * 1.2;
            } else if (e.type === EN_SENTINEL && dist < 100) {
                // Sentinel retreats when player gets too close
                let retreatAngle = targetAngle + Math.PI;
                let strafeOff = Math.sin(gameTime * 3 + e.x) * 0.4;
                wantX = e.x + Math.cos(retreatAngle + strafeOff) * moveSpd * 1.3;
                wantY = e.y + Math.sin(retreatAngle + strafeOff) * moveSpd * 1.3;
            } else if (e.ranged && dist < e.range * 0.6) {
                // Ranged strafe to avoid shots
                let strafeAngle = targetAngle + Math.PI / 2 * (Math.sin(gameTime * 2 + e.x) > 0 ? 1 : -1);
                wantX = e.x + Math.cos(strafeAngle) * moveSpd * 0.5;
                wantY = e.y + Math.sin(strafeAngle) * moveSpd * 0.5;
            } else if (dist < e.range * 0.3 && !e.ranged) {
                // Melee - get close
            } else if (dist > e.range * 1.5 || !e.ranged) {
                // Chase
            } else {
                // In range, slow approach
                wantX = e.x + Math.cos(targetAngle) * moveSpd * 0.3;
                wantY = e.y + Math.sin(targetAngle) * moveSpd * 0.3;
            }

            // Enemy avoids toxic pools (steer away)
            for (let tp of toxicPools) {
                let tpDx = wantX - tp.x, tpDy = wantY - tp.y;
                let tpDist = Math.sqrt(tpDx * tpDx + tpDy * tpDy);
                if (tpDist < tp.radius * 1.5 && tpDist > 0) {
                    let push = (tp.radius * 1.5 - tpDist) / tp.radius;
                    wantX += tpDx / tpDist * moveSpd * push * 2;
                    wantY += tpDy / tpDist * moveSpd * push * 2;
                }
            }
            // Collision with walls (bounding box check to prevent large enemies clipping corners)
            if (!enemyBlocked(wantX, e.y, e.size)) e.x = wantX;
            if (!enemyBlocked(e.x, wantY, e.size)) e.y = wantY;

            // Attack
            e.attackCD = Math.max(0, e.attackCD - dt);
            // Heavy charge cooldown ticks independently
            if (e.type === EN_HEAVY && !e.charging && e.chargeCD !== undefined) e.chargeCD = Math.max(0, e.chargeCD - dt);
            // Sentinel laser windup
            if (e.type === EN_SENTINEL && e.windupTimer > 0) {
                e.windupTimer -= dt;
                e.windupTarget = { x: player.x, y: player.y };
                if (e.windupTimer <= 0) {
                    enemyShoot(e);
                    e.attackCD = e.react;
                    e.windupTarget = null;
                }
            } else if (e.attackCD <= 0) {
                if (e.type === EN_SENTINEL && dist < e.range && lineOfSight(e.x, e.y, player.x, player.y)) {
                    // Start windup instead of instant fire
                    e.windupTimer = 0.35;
                    e.windupTarget = { x: player.x, y: player.y };
                } else if (e.ranged && e.type !== EN_SENTINEL && dist < e.range && lineOfSight(e.x, e.y, player.x, player.y)) {
                    enemyShoot(e);
                    e.attackCD = e.react;
                } else if (!e.ranged && dist < e.size + player.size + 5) {
                    damagePlayer(e.dmg, e.x, e.y);
                    e.attackCD = e.react;
                    // Heavy ground-slam effect
                    if (e.type === EN_HEAVY) {
                        particles.push({ x: e.x, y: e.y, life: 0.3, maxLife: 0.3, type: 'shockwave', radius: 0, maxRadius: 50, r: 255, g: 136, b: 0 });
                        set('shakeMag', Math.max(shakeMag, 5));
                        spawnSparks(e.x, e.y, 6, '#f80');
                        addDecal(e.x, e.y, 'scorch', 4 + Math.random() * 3);
                    }
                }
                // Heavy charge initiation (dist 80-300, LOS, not already charging)
                if (e.type === EN_HEAVY && !e.charging && e.chargeCD !== undefined && !e.chargeWindup) {
                    if (e.chargeCD <= 0 && dist > 80 && dist < 300 && lineOfSight(e.x, e.y, player.x, player.y)) {
                        // Start charge windup (telegraph before charging)
                        e.chargeWindup = 0.4;
                        e.chargeAngle = targetAngle;
                        set('shakeMag', Math.max(shakeMag, 2));
                    }
                }
                // Charge windup countdown
                if (e.type === EN_HEAVY && e.chargeWindup > 0) {
                    e.chargeWindup -= dt;
                    e.chargeAngle = Math.atan2(player.y - e.y, player.x - e.x); // Track player during windup
                    if (e.chargeWindup <= 0) {
                        e.chargeWindup = 0;
                        e.charging = true;
                        e.chargeTimer = 0.8;
                        addKillFeed('HEAVY CHARGING!');
                        spawnSparks(e.x, e.y, 8, '#f80');
                        set('shakeMag', Math.max(shakeMag, 3));
                    }
                }
            }

            // Commander behavior
            if (e.type === EN_COMMANDER) {
                // Slow shield regen
                if (e.shieldHp < e.maxShield) e.shieldHp = Math.min(e.maxShield, e.shieldHp + 3 * dt);
                e.spawnCD = Math.max(0, e.spawnCD - dt);
                if (e.spawnCD <= 0 && e.spawnCount < 6) {
                    // Spawn scout
                    let sa = Math.random() * Math.PI * 2;
                    let sx = e.x + Math.cos(sa) * 40, sy = e.y + Math.sin(sa) * 40;
                    if (isWalkable(tileAt(sx, sy))) {
                        let scout = createEnemy(sx, sy, EN_SCOUT, DIFF[difficulty], e.room);
                        scout.alert = true;
                        scout.alertTimer = 10;
                        enemies.push(scout);
                        e.spawnCount++;
                        // Spawn effect
                        spawnSparks(sx, sy, 8, '#a4f');
                        addKillFeed('COMMANDER DEPLOYED SCOUT');
                    }
                    e.spawnCD = e.maxSpawnCD;
                }
                // Teleport ability (2-phase: telegraph then execute)
                e.teleportCD = Math.max(0, e.teleportCD - dt);
                if (e.teleportCD <= 0 && dist > 100 && dist < 400 && !e.tpWarning) {
                    // Phase 1: Calculate target and start warning
                    let tpDist = 80 + Math.random() * 40;
                    let tpX = player.x - Math.cos(player.angle) * tpDist;
                    let tpY = player.y - Math.sin(player.angle) * tpDist;
                    if (isWalkable(tileAt(tpX, tpY)) && tpX > T && tpX < (mapW - 1) * T && tpY > T && tpY < (mapH - 1) * T) {
                        e.tpWarning = 0.4; // 0.4s telegraph
                        e.tpTarget = { x: tpX, y: tpY };
                        // Warning VFX at destination
                        particles.push({ x: tpX, y: tpY, life: 0.4, maxLife: 0.4, type: 'shockwave', radius: 0, maxRadius: 30, r: 170, g: 68, b: 255 });
                    } else { e.teleportCD = 3; }
                }
                if (e.tpWarning > 0) {
                    e.tpWarning -= dt;
                    if (e.tpWarning <= 0 && e.tpTarget) {
                        // Phase 2: Execute teleport
                        // Departure VFX
                        particles.push({ x: e.x, y: e.y, life: 0.3, maxLife: 0.3, type: 'shockwave', radius: 0, maxRadius: 40, r: 170, g: 68, b: 255 });
                        spawnSparks(e.x, e.y, 10, '#a4f');
                        // Teleport
                        e.x = e.tpTarget.x; e.y = e.tpTarget.y;
                        // Arrival VFX
                        particles.push({ x: e.x, y: e.y, life: 0.3, maxLife: 0.3, type: 'shockwave', radius: 0, maxRadius: 60, r: 170, g: 68, b: 255 });
                        spawnSparks(e.x, e.y, 12, '#a4f');
                        set('shakeMag', Math.max(shakeMag, 4));
                        addKillFeed('COMMANDER TELEPORTED');
                        e.teleportCD = 10 + Math.random() * 5;
                        e.tpTarget = null;
                    }
                }
            }
        } else {
            // Patrol
            e.patrolTimer -= dt;
            if (e.patrolTimer <= 0) {
                e.patrolAngle = Math.random() * Math.PI * 2;
                e.patrolTimer = 2 + Math.random() * 3;
            }
            let px = e.x + Math.cos(e.patrolAngle) * e.spd * 0.3 * dt;
            let py = e.y + Math.sin(e.patrolAngle) * e.spd * 0.3 * dt;
            if (!enemyBlocked(px, py, e.size)) { e.x = px; e.y = py; }
        }

        // Enemy footstep dust (only when moving and alert)
        if (e.alert && Math.random() < (e.type === EN_HEAVY ? 0.15 : 0.05)) {
            let fd = particlePool.get();
            fd.x = e.x + (Math.random() - 0.5) * e.size; fd.y = e.y + (Math.random() - 0.5) * e.size;
            fd.vx = (Math.random() - 0.5) * 10; fd.vy = (Math.random() - 0.5) * 10;
            fd.life = 0.2 + Math.random() * 0.15; fd.maxLife = fd.life;
            fd.r = 80; fd.g = 75; fd.b = 65; fd.size = 1; fd.grav = false; fd.type = 'spark';
        }
        // Enemy-enemy collision (push apart, with wall checks)
        for (let other of enemies) {
            if (other === e || !other.alive) continue;
            let odx = other.x - e.x, ody = other.y - e.y;
            let od = Math.sqrt(odx * odx + ody * ody);
            let minD = e.size + other.size;
            if (od < minD && od > 0) {
                let push = (minD - od) * 0.5;
                let nx2 = odx / od, ny2 = ody / od;
                let newEX = e.x - nx2 * push * 0.5, newEY = e.y - ny2 * push * 0.5;
                let newOX = other.x + nx2 * push * 0.5, newOY = other.y + ny2 * push * 0.5;
                // Only push if destination is not a wall
                if (!enemyBlocked(newEX, newEY, e.size)) { e.x = newEX; e.y = newEY; }
                if (!enemyBlocked(newOX, newOY, other.size)) { other.x = newOX; other.y = newOY; }
            }
        }
        // Emergency unstick check
        unstickEnemy(e);
    }
}

// ========== WORLD SYSTEMS (non-enemy update logic) ==========

export function updateWorldSystems(dt) {
    // Countdown
    if (countdownActive) {
        set('countdownTime', countdownTime - dt);
        if (countdownTime <= 0) {
            set('countdownTime', 0);
            if (player.alive) {
                player.hp = 0;
                player.alive = false;
                if (_gameOver) _gameOver();
            }
        }
    }

    // Airdrop timer
    set('airdropTimer', airdropTimer - dt);
    if (airdropTimer <= 0) {
        set('airdropTimer', 50 + Math.random() * 40);
        // Pick a random room for the drop
        let dropRoom = rooms[Math.floor(Math.random() * rooms.length)];
        if (dropRoom.type !== ROOM_START) {
            let dx = dropRoom.cx * T + T / 2, dy = dropRoom.cy * T + T / 2;
            airdrops.push({ x: dx, y: dy, fallY: dy - 400, targetY: dy, landed: false, collected: false, fallSpd: 200, life: 45 });
            addKillFeed('SUPPLY DROP INCOMING');
        }
    }
    // Update airdrops
    for (let ad of airdrops) {
        if (!ad.landed) {
            ad.fallY += ad.fallSpd * dt;
            if (ad.fallY >= ad.targetY) {
                ad.fallY = ad.targetY; ad.landed = true;
                set('shakeMag', Math.max(shakeMag, 3));
                spawnSparks(ad.x, ad.y, 10, '#fd0');
                particles.push({ x: ad.x, y: ad.y, life: 0.15, maxLife: 0.15, type: 'flash', radius: 25, r: 255, g: 220, b: 80 });
            }
        } else {
            ad.life -= dt;
        }
    }
    // Filter expired airdrops (mutate via set since it's a reassignment)
    let filteredAirdrops = airdrops.filter(a => a.life > 0 || !a.landed);
    if (filteredAirdrops.length !== airdrops.length) set('airdrops', filteredAirdrops);

    // Power-up timer + shield regen effect
    if (powerUp.timer > 0) {
        powerUp.timer -= dt;
        if (powerUp.type === 'shield') player.armor = Math.min(player.maxArmor, player.armor + 15 * dt);
        if (powerUp.timer <= 0) {
            powerUp.type = null;
            addKillFeed('POWER-UP EXPIRED');
        }
    }

    // Toxic pool damage to enemies
    for (let e of enemies) {
        if (!e.alive) continue;
        for (let tp of toxicPools) {
            let tdx = e.x - tp.x, tdy = e.y - tp.y;
            if (Math.sqrt(tdx * tdx + tdy * tdy) < tp.radius) {
                e.hp -= 3 * dt;
                if (e.hp <= 0 && e.alive) killEnemy(e);
            }
        }
    }

    // Alarm system
    if (alarmActive) {
        set('alarmTimer', alarmTimer - dt);
        // Keep all enemies alert during alarm
        for (let ae of enemies) { if (ae.alive && !ae.alert) { ae.alert = true; ae.alertTimer = alarmTimer; } }
        if (alarmTimer <= 0) { set('alarmActive', false); addKillFeed('ALARM DEACTIVATED'); }
    }

    // Structure collapse event (3 min timer)
    if (!collapseTriggered && collapseWalls.length > 0) {
        set('collapseTimer', collapseTimer - dt);
        if (collapseTimer <= 0) {
            set('collapseTriggered', true);
            for (let cw of collapseWalls) {
                map[cw.y * mapW + cw.x] = TILE_FLOOR;
                let wx = cw.x * T + T / 2, wy = cw.y * T + T / 2;
                particles.push({ x: wx, y: wy, life: 0.5, maxLife: 0.5, type: 'shockwave', radius: 0, maxRadius: 80, r: 180, g: 140, b: 60 });
                spawnSparks(wx, wy, 15, '#a85');
                spawnSparks(wx, wy, 8, '#dc8');
                for (let i = 0; i < 3; i++) addDecal(wx + (Math.random() - 0.5) * 20, wy + (Math.random() - 0.5) * 20, 'scorch', 4 + Math.random() * 4);
                // Rubble debris particles
                for (let i = 0; i < 8; i++) {
                    let a = Math.random() * Math.PI * 2, spd = 20 + Math.random() * 50;
                    let p2 = particlePool.get();
                    p2.x = wx; p2.y = wy; p2.vx = Math.cos(a) * spd; p2.vy = Math.sin(a) * spd;
                    p2.life = 0.6 + Math.random() * 0.5; p2.maxLife = p2.life;
                    p2.r = 100; p2.g = 90; p2.b = 70; p2.size = 2 + Math.random() * 3; p2.grav = true; p2.type = 'chunk';
                }
                // Dust cloud
                for (let i = 0; i < 4; i++) {
                    let a2 = Math.random() * Math.PI * 2, spd2 = 10 + Math.random() * 25;
                    atmParticles.push({ x: wx, y: wy, vx: Math.cos(a2) * spd2, vy: Math.sin(a2) * spd2 - 5,
                        life: 1.5 + Math.random() * 1.5, maxLife: 3, size: 8 + Math.random() * 8, type: 'smoke', alpha: 0.15 });
                }
            }
            set('shakeMag', Math.max(shakeMag, 10));
            set('chromatic', 0.2);
            addKillFeed('STRUCTURE COLLAPSE - NEW PATH');
        }
    }

    // Light flicker event
    set('flickerTimer', flickerTimer - dt);
    if (flickerTimer <= 0 && !flickering) {
        set('flickering', true);
        set('flickerDuration', 1.5 + Math.random() * 1.5);
        addKillFeed('POWER FLUCTUATION');
        set('shakeMag', Math.max(shakeMag, 2));
    }
    if (flickering) {
        set('flickerDuration', flickerDuration - dt);
        if (flickerDuration <= 0) {
            set('flickering', false);
            set('flickerTimer', 30 + Math.random() * 40);
        }
    }
}
