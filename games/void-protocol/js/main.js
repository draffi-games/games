// VOID PROTOCOL: Ground Zero — Main Entry Point
// Wires all modules together, runs the game loop.

"use strict";

// === Core ===
import { ST_MENU, ST_PLAY, ST_PAUSE, T, ROOM_SERVER, ROOM_BOSS, ROOM_ARMORY, DIFF } from './core/constants.js';
import * as S from './core/state.js';
import { set, resetLevelState } from './core/state.js';
import './core/canvas.js'; // side-effect: sets up canvases and resize listener
import { keys, getMouseX, getMouseY, setupInput } from './core/input.js';
import { updateCamera } from './core/camera.js';
import { particlePool, projPool, hexToRgb } from './core/utils.js';

// === Audio ===
import { SFX, stepTimer, setStepTimer } from './audio/sfx.js';

// === Level ===
import { generateLevel } from './level/generator.js';
import { initTextures } from './level/textures.js';
import { registerHazardDeps, explodeBarrel } from './level/hazards.js';

// === Entities ===
import { weapons } from './entities/weapons.js';
import { initPlayer } from './entities/player.js';
import { createEnemy, updateEnemies, spawnCountdownEnemies, updateWorldSystems, _setEnemiesGameOver } from './entities/enemies.js';
import { updateProjectiles, _setProjectilesExplodeBarrel } from './entities/projectiles.js';

// === Systems ===
import { canWalk } from './systems/collision.js';
import { damagePlayer, spawnSparks, addKillFeed, addDecal, addDynamicLight, damageEnemy, _setCombatCreateEnemy, _setCombatGameOver } from './systems/combat.js';
import { playerShoot, _setWeaponsExplodeBarrel } from './systems/weapons.js';

// === Rendering ===
import { render } from './rendering/renderer.js';
import { spawnAtmospheric, updateParticles } from './rendering/particles.js';

// === UI (side-effects: registers window.setDiff, window.quitToMenu, window.showPanel) ===
import { showPanel, gameOver, winLevel, victory } from './ui/panels.js';

// ============================================================
// Wire circular dependencies (lazy injection)
// ============================================================
_setCombatCreateEnemy(createEnemy);
_setCombatGameOver(gameOver);
_setEnemiesGameOver(gameOver);
_setWeaponsExplodeBarrel(explodeBarrel);
_setProjectilesExplodeBarrel(explodeBarrel);
registerHazardDeps({ SFX, spawnSparks, addDynamicLight, addDecal, damageEnemy, damagePlayer, addKillFeed });

// ============================================================
// Expose functions to HTML onclick handlers
// ============================================================
window.startGame = startGame;
window.nextLevel = nextLevel;

// ============================================================
// Game Flow
// ============================================================
function startGame() {
    set('state', ST_PLAY);
    set('level', 1);
    set('totalKills', 0);
    set('totalTime', 0);
    showPanel('none');
    initLevel();
}

function initLevel() {
    resetLevelState();

    // Clear pools
    particlePool.clear();
    projPool.clear();

    // Generate world
    initTextures();
    generateLevel(S.level);
    initPlayer();

    // Starting ammo by level
    if (S.level >= 2) { S.player.ammo[1] = 100; S.player.ammo[2] = 12; }
    if (S.level >= 3) { S.player.ammo[3] = 30; S.player.ammo[4] = 80; }

    // Level intro cinematic
    set('introTimer', 1.5);
    set('introLevel', S.level);
    set('cinematicTimer', 0);
    set('cinematicType', '');
    set('roomFlashTimer', 0);
    set('roomFlashName', '');
    set('roomFlashImportant', false);
}

function nextLevel() {
    set('level', S.level + 1);
    if (S.level > 3) {
        victory();
        return;
    }
    showPanel('none');
    set('state', ST_PLAY);
    initLevel();
}

// ============================================================
// Player Update (movement, interaction, pickup collection)
// ============================================================
function updatePlayer(dt) {
    if (!S.player.alive) return;

    let mx = 0, my = 0;
    if (keys['KeyW'] || keys['ArrowUp']) my = -1;
    if (keys['KeyS'] || keys['ArrowDown']) my = 1;
    if (keys['KeyA'] || keys['ArrowLeft']) mx = -1;
    if (keys['KeyD'] || keys['ArrowRight']) mx = 1;

    // Normalize diagonal
    if (mx !== 0 && my !== 0) { let l = Math.sqrt(2); mx /= l; my /= l; }

    // Sprint
    let sprinting = keys['ShiftLeft'] || keys['ShiftRight'];
    let spdMul = 1;
    if (sprinting && S.player.stamina > 0 && (mx !== 0 || my !== 0)) {
        spdMul = S.player.sprintMul;
        S.player.stamina -= 30 * dt;
        if (S.player.stamina < 0) S.player.stamina = 0;
    } else {
        S.player.stamina = Math.min(S.player.maxStamina, S.player.stamina + 15 * dt);
    }

    let spd = S.player.spd * spdMul * (S.powerUp.type === 'speed' ? 1.5 : 1) * dt;
    let nx = S.player.x + mx * spd;
    let ny = S.player.y + my * spd;

    // Axis-separated collision
    if (canWalk(nx, S.player.y, 5)) S.player.x = nx;
    if (canWalk(S.player.x, ny, 5)) S.player.y = ny;

    // Footstep sounds
    if (mx !== 0 || my !== 0) {
        let st = stepTimer + dt;
        let stepInterval = sprinting ? 0.25 : 0.4;
        if (st > stepInterval) { st = 0; SFX.step(); }
        setStepTimer(st);
    }

    // Sprint dust clouds
    if (sprinting && spdMul > 1 && (mx !== 0 || my !== 0)) {
        set('sprintDustTimer', S.sprintDustTimer + dt);
        if (S.sprintDustTimer >= 0.15) {
            set('sprintDustTimer', 0);
            for (let i = 0; i < 3; i++) {
                let p = particlePool.get();
                p.x = S.player.x - mx * 8 + (Math.random() - 0.5) * 10;
                p.y = S.player.y - my * 8 + (Math.random() - 0.5) * 10;
                p.vx = -mx * 20 + (Math.random() - 0.5) * 25;
                p.vy = -my * 20 + (Math.random() - 0.5) * 25;
                p.life = 0.35 + Math.random() * 0.2; p.maxLife = p.life;
                p.r = 160; p.g = 150; p.b = 130;
                p.size = 2.5 + Math.random() * 2; p.grav = false; p.type = 'spark';
            }
        }
    } else {
        set('sprintDustTimer', 0);
    }

    // Footprint decals
    if (mx !== 0 || my !== 0) {
        set('footprintTimer', S.footprintTimer + dt);
        let fpInterval = sprinting ? 0.3 : 0.5;
        if (S.footprintTimer >= fpInterval) {
            set('footprintTimer', 0);
            let fpColor = S.toxicFootprintTimer > 0 ? 'rgba(40,180,40,0.4)' : 'rgba(15,20,25,0.35)';
            let fpLife = S.toxicFootprintTimer > 0 ? 5 : 15;
            addDecal(S.player.x + (Math.random() - 0.5) * 4, S.player.y + (Math.random() - 0.5) * 4, 'footprint', 3, fpColor, fpLife);
        }
    }

    // Sprint afterimage trail
    if (sprinting && spdMul > 1 && (mx !== 0 || my !== 0)) {
        S.playerTrail.push({ x: S.player.x, y: S.player.y, angle: S.player.angle, life: 0.12, maxLife: 0.12 });
        if (S.playerTrail.length > 3) S.playerTrail.shift();
    }
    for (let t of S.playerTrail) { t.life -= dt; }
    set('playerTrail', S.playerTrail.filter(t => t.life > 0));

    // Aim angle
    let sx = S.player.x - S.camX, sy = S.player.y - S.camY;
    S.player.angle = Math.atan2(getMouseY() - sy, getMouseX() - sx);

    // Weapon cooldown & recoil
    if (S.player.weaponCD > 0) S.player.weaponCD -= dt;
    if (S.player.recoilOffset > 0) S.player.recoilOffset = Math.max(0, S.player.recoilOffset - dt * 60);
    if (S.player.muzzleFlash > 0) S.player.muzzleFlash = Math.max(0, S.player.muzzleFlash - dt);

    // Shooting
    let w = weapons[S.player.curWeapon];
    if (S.mouseDown) {
        if (w.auto || S.player.weaponCD <= 0) {
            playerShoot();
        }
    }

    // Interact (E key)
    if (keys['KeyE']) {
        // Terminal hack
        if (!S.terminalHacked) {
            let sr = S.rooms.find(r => r.type === ROOM_SERVER);
            if (sr) {
                let dx = S.player.x - (sr.cx * T + T / 2), dy = S.player.y - (sr.cy * T + T / 2);
                if (Math.sqrt(dx * dx + dy * dy) < T * 1.5) {
                    set('hackProgress', S.hackProgress + dt);
                    if (S.hackProgress >= 3) {
                        set('terminalHacked', true);
                        set('countdownActive', true);
                        set('countdownTime', DIFF[S.difficulty].countdowns[S.level - 1] || 60);
                        set('exitOpen', true);
                        addKillFeed('TERMINAL HACKED - EVACUATE!');
                        set('cinematicTimer', 2.0);
                        set('cinematicType', 'evacuation');
                        set('shakeMag', Math.max(S.shakeMag, 6));
                        set('chromatic', Math.max(S.chromatic, 0.3));
                        spawnCountdownEnemies();
                    }
                }
            }
        }
        // Exit
        if (S.exitOpen) {
            let er = S.rooms.find(r => r.type === 1); // ROOM_EXIT
            if (er) {
                let dx = S.player.x - (er.cx * T + T / 2), dy = S.player.y - (er.cy * T + T / 2);
                if (Math.sqrt(dx * dx + dy * dy) < T * 1.5) {
                    winLevel();
                    return;
                }
            }
        }
    } else {
        if (!S.terminalHacked) set('hackProgress', Math.max(0, S.hackProgress - dt * 2));
    }

    // Pickup collection
    for (let pk of S.pickups) {
        if (pk.collected) continue;
        let dx = S.player.x - pk.x, dy = S.player.y - pk.y;
        if (Math.sqrt(dx * dx + dy * dy) < 20) {
            pk.collected = true;
            SFX.pickup();
            switch (pk.type) {
                case 'keycard':
                    S.player.keycards[pk.subtype] = true;
                    addKillFeed(pk.subtype.toUpperCase() + ' KEYCARD ACQUIRED');
                    let kcCol = pk.subtype === 'blue' ? '#44f' : pk.subtype === 'red' ? '#f44' : '#fd0';
                    spawnSparks(pk.x, pk.y, 20, kcCol);
                    S.particles.push({ x: pk.x, y: pk.y, life: 0.3, maxLife: 0.3, type: 'shockwave', radius: 0, maxRadius: 60, ...hexToRgb(kcCol) });
                    set('shakeMag', Math.max(S.shakeMag, 3));
                    set('chromatic', 0.1);
                    break;
                case 'health':
                    S.player.hp = Math.min(S.player.maxHp, S.player.hp + pk.amount);
                    S.particles.push({ x: S.player.x, y: S.player.y, life: 0.15, maxLife: 0.15, type: 'flash', radius: 20, r: 50, g: 255, b: 50 });
                    break;
                case 'armor':
                    S.player.armor = Math.min(S.player.maxArmor, S.player.armor + pk.amount);
                    S.particles.push({ x: S.player.x, y: S.player.y, life: 0.15, maxLife: 0.15, type: 'flash', radius: 20, r: 80, g: 130, b: 255 });
                    break;
                case 'ammo':
                    S.player.ammo[pk.weaponIdx] = Math.min(weapons[pk.weaponIdx].ammo, S.player.ammo[pk.weaponIdx] + pk.amount);
                    S.particles.push({ x: S.player.x, y: S.player.y, life: 0.1, maxLife: 0.1, type: 'flash', radius: 12, r: 255, g: 200, b: 50 });
                    break;
                case 'weapon':
                    S.player.ammo[pk.weaponIdx] = weapons[pk.weaponIdx].ammo;
                    S.player.curWeapon = pk.weaponIdx;
                    addKillFeed(weapons[pk.weaponIdx].name + ' ACQUIRED');
                    spawnSparks(pk.x, pk.y, 8, '#ff0');
                    S.particles.push({ x: pk.x, y: pk.y, life: 0.1, maxLife: 0.1, type: 'flash', radius: 15, r: 255, g: 255, b: 100 });
                    break;
                case 'powerup':
                    S.powerUp.type = pk.subtype;
                    S.powerUp.timer = 10;
                    let puColors = { speed: '#0ff', damage: '#f4f', shield: '#4f4' };
                    let puNames = { speed: 'SPEED BOOST', damage: 'DAMAGE BOOST', shield: 'SHIELD REGEN' };
                    addKillFeed(puNames[pk.subtype] + ' ACTIVE');
                    spawnSparks(pk.x, pk.y, 15, puColors[pk.subtype]);
                    S.particles.push({ x: pk.x, y: pk.y, life: 0.3, maxLife: 0.3, type: 'shockwave', radius: 0, maxRadius: 80, ...hexToRgb(puColors[pk.subtype]) });
                    set('shakeMag', Math.max(S.shakeMag, 4));
                    set('chromatic', 0.15);
                    break;
            }
        }
    }

    // Airdrop collection
    for (let ad of S.airdrops) {
        if (ad.collected || !ad.landed) continue;
        let dx = S.player.x - ad.x, dy = S.player.y - ad.y;
        if (Math.sqrt(dx * dx + dy * dy) < 24) {
            ad.collected = true;
            S.player.hp = Math.min(S.player.maxHp, S.player.hp + 30);
            S.player.armor = Math.min(S.player.maxArmor, S.player.armor + 20);
            let wIdx = 1 + Math.floor(Math.random() * 5);
            S.player.ammo[wIdx] = Math.min(weapons[wIdx].ammo, S.player.ammo[wIdx] + Math.floor(weapons[wIdx].ammo * 0.25));
            let puTypes = ['speed', 'damage', 'shield'];
            let puType = puTypes[Math.floor(Math.random() * 3)];
            S.pickups.push({ x: ad.x, y: ad.y, type: 'powerup', subtype: puType, collected: false });
            addKillFeed('SUPPLY CRATE OPENED');
            spawnSparks(ad.x, ad.y, 12, '#fd0');
            S.particles.push({ x: ad.x, y: ad.y, life: 0.2, maxLife: 0.2, type: 'flash', radius: 30, r: 255, g: 220, b: 80 });
            set('shakeMag', Math.max(S.shakeMag, 3));
        }
    }

    // Invulnerability
    if (S.player.invuln > 0) S.player.invuln -= dt;

    // Toxic pool damage to player
    let inToxic = false;
    for (let tp of S.toxicPools) {
        let tdx = S.player.x - tp.x, tdy = S.player.y - tp.y;
        if (Math.sqrt(tdx * tdx + tdy * tdy) < tp.radius) {
            inToxic = true;
            set('toxicDmgAccum', S.toxicDmgAccum + 5 * dt);
            if (S.toxicDmgAccum >= 1) {
                let wholeDmg = Math.floor(S.toxicDmgAccum);
                set('toxicDmgAccum', S.toxicDmgAccum - wholeDmg);
                damagePlayer(wholeDmg, tp.x, tp.y);
            }
            if (Math.random() < 0.3) {
                let p = particlePool.get();
                p.x = S.player.x + (Math.random() - 0.5) * 8;
                p.y = S.player.y + (Math.random() - 0.5) * 8;
                p.vx = (Math.random() - 0.5) * 15; p.vy = -20 - Math.random() * 20;
                p.life = 0.4 + Math.random() * 0.3; p.maxLife = p.life;
                p.r = 50; p.g = 255; p.b = 50; p.size = 1.5; p.grav = false; p.type = 'spark';
            }
        }
    }
    if (!inToxic) set('toxicDmgAccum', 0);

    // Toxic footprint timer
    if (inToxic) {
        set('toxicFootprintTimer', 5);
    } else if (S.toxicFootprintTimer > 0) {
        set('toxicFootprintTimer', Math.max(0, S.toxicFootprintTimer - dt));
    }

    // Room entry notification
    let ptx = Math.floor(S.player.x / T), pty = Math.floor(S.player.y / T);
    let curRoom = S.rooms.find(r => ptx >= r.x && ptx < r.x + r.w && pty >= r.y && pty < r.y + r.h);
    if (curRoom && curRoom !== S.lastRoom) {
        set('lastRoom', curRoom);
        let names = ['SPAWN BAY', 'EXIT TUNNEL', 'SERVER ROOM', 'ARMORY', 'STORAGE', 'BOSS CHAMBER', 'SECTOR'];
        set('roomAlert', names[curRoom.type]);
        set('roomAlertTimer', 2);
        if (curRoom.type === ROOM_BOSS || curRoom.type === ROOM_SERVER || curRoom.type === ROOM_ARMORY) {
            set('roomFlashName', names[curRoom.type]);
            set('roomFlashTimer', 1.2);
            set('roomFlashImportant', true);
        }
        if (curRoom.type === ROOM_BOSS && curRoom !== S.bossIntroRoom) {
            set('bossIntroTimer', 2.5);
            set('bossIntroRoom', curRoom);
            set('shakeMag', Math.max(S.shakeMag, 5));
            set('chromatic', Math.max(S.chromatic, 0.3));
        }
        if ((curRoom.type === ROOM_BOSS || curRoom.type === ROOM_SERVER) && !S.alarmActive) {
            set('alarmActive', true);
            set('alarmTimer', 15);
            addKillFeed('FACILITY ALARM TRIGGERED');
            set('shakeMag', Math.max(S.shakeMag, 3));
            set('chromatic', 0.1);
            for (let ae of S.enemies) { if (ae.alive) { ae.alert = true; ae.alertTimer = 15; } }
        }
    }
    if (S.roomAlertTimer > 0) set('roomAlertTimer', S.roomAlertTimer - dt);

    // Footstep dust
    if ((mx !== 0 || my !== 0) && Math.random() < (sprinting ? 0.3 : 0.1)) {
        let p = particlePool.get();
        p.x = S.player.x + (Math.random() - 0.5) * 6;
        p.y = S.player.y + (Math.random() - 0.5) * 6;
        p.vx = (Math.random() - 0.5) * 15; p.vy = (Math.random() - 0.5) * 15;
        p.life = 0.3 + Math.random() * 0.2; p.maxLife = p.life;
        p.r = 120; p.g = 115; p.b = 100;
        p.size = 1 + Math.random(); p.grav = false; p.type = 'spark';
    }

    // Explored map reveal
    let revealR = 4;
    for (let ry = pty - revealR; ry <= pty + revealR; ry++) {
        for (let rx = ptx - revealR; rx <= ptx + revealR; rx++) {
            if (rx >= 0 && rx < S.mapW && ry >= 0 && ry < S.mapH) {
                S.explored[ry * S.mapW + rx] = true;
            }
        }
    }
}

// ============================================================
// Main Update Loop
// ============================================================
function update(dt) {
    if (S.state !== ST_PLAY) return;
    set('gameTime', S.gameTime + dt);
    set('totalTime', S.totalTime + dt);

    // Cinematic timers
    if (S.introTimer > 0) set('introTimer', S.introTimer - dt);
    if (S.cinematicTimer > 0) set('cinematicTimer', S.cinematicTimer - dt);
    if (S.roomFlashTimer > 0) set('roomFlashTimer', S.roomFlashTimer - dt);
    if (S.bossIntroTimer > 0) set('bossIntroTimer', S.bossIntroTimer - dt);

    // Player
    updatePlayer(dt);

    // Enemies
    updateEnemies(dt);

    // Projectiles
    updateProjectiles(dt);

    // World systems (countdown, airdrops, powerups, alarm, collapse, flicker)
    updateWorldSystems(dt);

    // Particles
    spawnAtmospheric();
    updateParticles(dt);

    // Camera
    updateCamera(dt);
}

// ============================================================
// Game Loop
// ============================================================
let lastTime = 0;

function gameLoop(timestamp) {
    let dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    if (dt > 0.1) dt = 0.1; // cap delta

    // Hit stop: near-freeze on kill for punch feel
    if (S.hitStopTimer > 0) {
        set('hitStopTimer', S.hitStopTimer - dt);
        dt *= 0.05;
    }

    // Last-kill slow-mo
    if (S.lastKillSlowMo > 0) {
        set('lastKillSlowMo', S.lastKillSlowMo - dt);
        if (S.lastKillSlowMo <= 0) {
            set('lastKillSlowMo', 0);
            set('gameSpeed', 1);
        }
        dt *= S.gameSpeed;
    }

    if (S.state === ST_MENU) {
        set('gameTime', S.gameTime + dt);
        render();
    } else if (S.state === ST_PLAY) {
        update(dt);
        render();
    } else if (S.state === ST_PAUSE) {
        render();
    }

    requestAnimationFrame(gameLoop);
}

// ============================================================
// Bootstrap
// ============================================================
setupInput();
requestAnimationFrame(ts => {
    lastTime = ts;
    requestAnimationFrame(gameLoop);
});
