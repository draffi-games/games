// VOID PROTOCOL — Weapon Systems (Shooting, Projectile Creation)

import {
    T, TILE_WALL, TILE_VOID, EN_COMMANDER
} from '../core/constants.js';
import {
    player, enemies, particles, barrels,
    stats, shakeMag, powerUp,
    set
} from '../core/state.js';
import { particlePool, projPool } from '../core/utils.js';
import { SFX } from '../audio/sfx.js';
import { tileAt } from './collision.js';
import { weapons, weaponLightColors } from '../entities/weapons.js';
import { damageEnemy, spawnSparks, addDecal, addDynamicLight, addKillFeed } from './combat.js';

// Forward declaration: explodeBarrel imported lazily to break circular dep
let _explodeBarrel = null;
export function _setWeaponsExplodeBarrel(fn) { _explodeBarrel = fn; }

export function playerShoot() {
    let w = weapons[player.curWeapon];
    if (player.weaponCD > 0) return;
    if (w.ammo !== Infinity && player.ammo[player.curWeapon] <= 0) {
        // Auto-switch to pistol when trying to fire empty weapon
        if (player.curWeapon !== 0) { player.curWeapon = 0; addKillFeed('NO AMMO - PISTOL'); }
        return;
    }

    player.weaponCD = w.rate;
    stats.shotsFired += w.pellets;
    if (w.ammo !== Infinity) {
        player.ammo[player.curWeapon]--;
    }

    let angle = player.angle;

    if (w.type === 'rail') {
        fireRail(player.x, player.y, angle, w);
        set('shakeMag', Math.max(shakeMag, 4));
        player.recoilOffset = 8; // heavy railgun recoil
        player.muzzleFlash = 0.07; // longer flash for railgun
        // Railgun is very loud - alert enemies in huge radius
        for (let e of enemies) {
            if (!e.alive || e.alert) continue;
            let ndx = e.x - player.x, ndy = e.y - player.y;
            if (Math.sqrt(ndx * ndx + ndy * ndy) < 500) { e.alert = true; e.alertTimer = 8 + Math.random() * 3; }
        }
        // Railgun muzzle light - bright white flash
        let rmfx = player.x + Math.cos(angle) * (player.size + 8);
        let rmfy = player.y + Math.sin(angle) * (player.size + 8);
        addDynamicLight(rmfx, rmfy, 180, 255, 255, 255, 0.15);
        return;
    }

    for (let p = 0; p < w.pellets; p++) {
        let a = angle + (Math.random() - 0.5) * w.spread * 2;
        let proj = projPool.get();
        proj.x = player.x + Math.cos(a) * 15;
        proj.y = player.y + Math.sin(a) * 15;
        proj.vx = Math.cos(a) * w.projSpd;
        proj.vy = Math.sin(a) * w.projSpd;
        proj.life = w.projLife;
        proj.maxLife = w.projLife;
        proj.dmg = w.dmg * (powerUp.type === 'damage' ? 2 : 1);
        proj.friendly = true;
        proj.type = w.type;
        proj.color = powerUp.type === 'damage' ? '#f4f' : w.color;
        proj.trail = [];
        proj.pierce = w.pierce;
        proj.splashR = w.splash || 0;
    }

    // Muzzle flash
    let mfx = player.x + Math.cos(player.angle) * (player.size + 8);
    let mfy = player.y + Math.sin(player.angle) * (player.size + 8);
    particles.push({ x: mfx, y: mfy, life: 0.06, maxLife: 0.06, type: 'flash', radius: w.pellets > 1 ? 20 : 12, r: 255, g: 240, b: 180 });
    spawnSparks(mfx, mfy, w.pellets > 1 ? 4 : 2, w.color);
    // Muzzle dynamic light (weapon-colored)
    let mlc = weaponLightColors[player.curWeapon] || weaponLightColors[0];
    let muzzleRad = w.pellets > 1 ? 120 : w.type === 'flame' ? 80 : w.type === 'plasma' ? 100 : 90;
    let muzzleLife = w.type === 'flame' ? 0.06 : w.pellets > 1 ? 0.12 : 0.08;
    addDynamicLight(mfx, mfy, muzzleRad, mlc.r, mlc.g, mlc.b, muzzleLife);
    player.muzzleFlash = 0.05; // starburst timer for player render

    // Weapon recoil bob
    player.recoilOffset = w.pellets > 1 ? 6 : w.type === 'plasma' ? 4 : 3;

    // Shell casings for bullet-type weapons
    if (w.type === 'bullet') {
        let casingCount = w.pellets > 1 ? 2 : 1;
        let perpAngle = player.angle + Math.PI / 2;
        for (let i = 0; i < casingCount; i++) {
            let sc = particlePool.get();
            sc.x = player.x + Math.cos(player.angle) * (player.size + 2);
            sc.y = player.y + Math.sin(player.angle) * (player.size + 2);
            let ejectSpd = 40 + Math.random() * 60;
            sc.vx = Math.cos(perpAngle) * ejectSpd + (Math.random() - 0.5) * 20;
            sc.vy = Math.sin(perpAngle) * ejectSpd + (Math.random() - 0.5) * 20;
            sc.life = 0.5 + Math.random() * 0.3; sc.maxLife = sc.life;
            sc.r = 200; sc.g = 170; sc.b = 60; // brass color
            sc.size = 1.5; sc.grav = true; sc.type = 'chunk';
        }
    }

    // Weapon sound synthesis
    if (w.pellets > 1) SFX.shotgun();
    else if (w.type === 'plasma') SFX.plasma();
    else if (w.type === 'rail') SFX.rail();
    else if (w.type === 'flame') SFX.flame();
    else if (w.type === 'rocket') SFX.rocket();
    else SFX.pistol();

    // Gunshot noise alerts nearby enemies (weapon-specific radius)
    let noiseR = w.type === 'flame' ? 80 : w.pellets > 1 ? 350 : w.type === 'rail' ? 500 : w.type === 'plasma' ? 250 : 200;
    for (let e of enemies) {
        if (!e.alive || e.alert) continue;
        let ndx = e.x - player.x, ndy = e.y - player.y;
        if (Math.sqrt(ndx * ndx + ndy * ndy) < noiseR) {
            e.alert = true;
            e.alertTimer = 6 + Math.random() * 3;
        }
    }

    // Recoil shake
    set('shakeMag', Math.max(shakeMag, w.pellets > 1 ? 3 : 1.5));
}

export function fireRail(ox, oy, angle, w) {
    let dx = Math.cos(angle), dy = Math.sin(angle);
    let hitEnts = [];
    for (let d = 0; d < w.range; d += 4) {
        let x = ox + dx * d, y = oy + dy * d;
        let tile = tileAt(x, y);
        if (tile === TILE_WALL || tile === TILE_VOID) {
            addDecal(x, y, 'scorch', 4, 'rgba(200,200,255,0.5)');
            spawnSparks(x, y, 5, '#fff');
            break;
        }
        for (let e of enemies) {
            if (!e.alive) continue;
            let ex = e.x - x, ey = e.y - y;
            if (Math.sqrt(ex * ex + ey * ey) < e.size && !hitEnts.includes(e)) {
                hitEnts.push(e);
                damageEnemy(e, w.dmg * (powerUp.type === 'damage' ? 2 : 1));
            }
        }
        for (let b of barrels) {
            if (!b.alive) continue;
            let bx = b.x - x, by = b.y - y;
            if (Math.sqrt(bx * bx + by * by) < 14) {
                b.hp -= w.dmg * (powerUp.type === 'damage' ? 2 : 1);
                if (b.hp <= 0 && _explodeBarrel) _explodeBarrel(b);
            }
        }
    }
    // Visual rail trail
    particles.push({ x: ox, y: oy, vx: dx, vy: dy, life: 0.2, maxLife: 0.2, type: 'rail', range: w.range, color: '#fff' });
}

export function enemyShoot(e) {
    let angle = Math.atan2(player.y - e.y, player.x - e.x);
    let proj = projPool.get();
    let spread = (Math.random() - 0.5) * 0.1;
    let muzzleX = e.x + Math.cos(angle) * e.size;
    let muzzleY = e.y + Math.sin(angle) * e.size;
    proj.x = muzzleX;
    proj.y = muzzleY;
    let spd = e.type === EN_COMMANDER ? 350 : 300;
    proj.vx = Math.cos(angle + spread) * spd;
    proj.vy = Math.sin(angle + spread) * spd;
    proj.life = 0.8;
    proj.maxLife = 0.8;
    proj.dmg = e.dmg;
    proj.friendly = false;
    proj.type = 'enemy';
    proj.color = e.type === EN_COMMANDER ? '#a4f' : '#f44';
    proj.trail = [];
    proj.pierce = false;
    proj.splashR = 0;
    // Enemy muzzle flash
    particles.push({ x: muzzleX, y: muzzleY, life: 0.05, maxLife: 0.05, type: 'flash', radius: 8, r: 255, g: 100, b: 80 });
}
