// VOID PROTOCOL — Projectile Update System

import { T, TILE_WALL, TILE_VOID, TILE_FLOOR } from '../core/constants.js';
import {
    player, enemies, particles, barrels, secretWalls, atmParticles,
    map, mapW, shakeMag, chromatic,
    set
} from '../core/state.js';
import { hexToRgb, projPool } from '../core/utils.js';
import { tileAt } from '../systems/collision.js';
import { damageEnemy, damagePlayer, spawnSparks, addDmgNum, addDecal, addDynamicLight, addKillFeed } from '../systems/combat.js';

// Forward declaration: explodeBarrel imported lazily to break circular dep
let _explodeBarrel = null;
export function _setProjectilesExplodeBarrel(fn) { _explodeBarrel = fn; }

export function updateProjectiles(dt) {
    let toRemove = [];
    projPool.active.forEach(p => {
        p.life -= dt;
        if (p.life <= 0) { toRemove.push(p); return; }

        // Trail
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 8) p.trail.shift();

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // Wall collision
        let tile = tileAt(p.x, p.y);
        if (tile === TILE_WALL || tile === TILE_VOID) {
            // Check if hitting a destructible (secret) wall
            if (tile === TILE_WALL && p.friendly) {
                let wtx = Math.floor(p.x / T), wty = Math.floor(p.y / T);
                for (let sw of secretWalls) {
                    if (sw.x === wtx && sw.y === wty && sw.hp > 0) {
                        sw.hp -= p.dmg;
                        spawnSparks(p.x, p.y, 5, '#fa0');
                        addDmgNum(p.x, p.y - 10, Math.round(p.dmg), false);
                        if (sw.hp <= 0) {
                            // Wall destroyed! Reveal secret room
                            map[wty * mapW + wtx] = TILE_FLOOR;
                            particles.push({
                                x: wtx * T + T / 2, y: wty * T + T / 2,
                                life: 0.4, maxLife: 0.4, type: 'shockwave', radius: 0, maxRadius: 60, r: 255, g: 200, b: 50
                            });
                            spawnSparks(wtx * T + T / 2, wty * T + T / 2, 20, '#fa0');
                            spawnSparks(wtx * T + T / 2, wty * T + T / 2, 10, '#ff4');
                            for (let i = 0; i < 5; i++) addDecal(wtx * T + T / 2 + (Math.random() - 0.5) * 20, wty * T + T / 2 + (Math.random() - 0.5) * 20, 'scorch', 3 + Math.random() * 4);
                            set('shakeMag', Math.max(shakeMag, 6));
                            set('chromatic', 0.15);
                            addKillFeed('SECRET PASSAGE OPENED');
                            // Smoke debris
                            for (let i = 0; i < 6; i++) {
                                let a = Math.random() * Math.PI * 2, spd = 15 + Math.random() * 30;
                                atmParticles.push({
                                    x: wtx * T + T / 2, y: wty * T + T / 2, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd - 8,
                                    life: 1 + Math.random() * 1.5, maxLife: 2.5, size: 6 + Math.random() * 6, type: 'smoke', alpha: 0.15
                                });
                            }
                        }
                        break;
                    }
                }
            }
            let decalType = p.type === 'plasma' ? 'plasma_burn' : p.type === 'flame' ? 'scorch' : 'bullet_hole';
            let decalSize = p.type === 'flame' ? 3 + Math.random() * 3 : 2;
            addDecal(p.x, p.y, decalType, decalSize, null);
            spawnSparks(p.x, p.y, p.type === 'flame' ? 5 : 3, p.color);
            toRemove.push(p);
            return;
        }

        // Barrel collision
        for (let b of barrels) {
            if (!b.alive) continue;
            let bdx = b.x - p.x, bdy = b.y - p.y;
            if (Math.sqrt(bdx * bdx + bdy * bdy) < 14) {
                b.hp -= p.dmg;
                spawnSparks(p.x, p.y, 3, '#f80');
                if (b.hp <= 0 && _explodeBarrel) _explodeBarrel(b);
                if (!p.pierce) { toRemove.push(p); return; }
            }
        }

        // Entity collision
        if (p.friendly) {
            for (let e of enemies) {
                if (!e.alive) continue;
                let edx = e.x - p.x, edy = e.y - p.y;
                if (Math.sqrt(edx * edx + edy * edy) < e.size + 3) {
                    // Splash damage
                    if (p.splashR > 0) {
                        for (let e2 of enemies) {
                            if (!e2.alive) continue;
                            let sd = Math.sqrt((e2.x - p.x) ** 2 + (e2.y - p.y) ** 2);
                            if (sd < p.splashR) {
                                damageEnemy(e2, p.dmg * (1 - sd / p.splashR));
                            }
                        }
                        spawnSparks(p.x, p.y, 8, p.color);
                        // Splash dynamic light
                        let sc = hexToRgb(p.color);
                        addDynamicLight(p.x, p.y, p.splashR * 2.5, sc.r, sc.g, sc.b, 0.2);
                    } else {
                        damageEnemy(e, p.dmg);
                    }
                    if (!p.pierce) { toRemove.push(p); return; }
                }
            }
        } else {
            // Enemy projectile -> player
            let pdx = player.x - p.x, pdy = player.y - p.y;
            if (Math.sqrt(pdx * pdx + pdy * pdy) < player.size) {
                damagePlayer(p.dmg, p.x, p.y);
                toRemove.push(p);
                return;
            }
        }
    });
    for (let p of toRemove) projPool.ret(p);
}
