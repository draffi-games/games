// VOID PROTOCOL — Main Render Orchestrator
// Delegates to sub-renderers in correct draw order.

import { T, ST_MENU, ST_PLAY, ST_PAUSE } from '../core/constants.js';
import { state, camX, camY, shakeX, shakeY, mapW, mapH } from '../core/state.js';
import { ctx, W, H } from '../core/canvas.js';
import { renderFloorTiles, renderWallTiles, renderWallDepth } from './tiles.js';
import { renderCorpses, renderDecals, renderPickups, renderBarrels, renderAirdrops,
         renderToxicPools, renderEnemies, renderPlayerTrail, renderPlayer } from './entity-renderer.js';
import { renderProjectiles, renderSpecialParticles, renderPoolParticles, renderAtmParticles } from './particles.js';
// particles.js also exports: spawnAtmospheric(), updateParticles(dt) — used by game loop
import { renderLighting } from './lighting.js';
import { renderScreenEffects } from './effects.js';
import { renderHUD } from './hud.js';
import { renderMenuBg, renderCinematics } from './cinematics.js';

// ===== Main render entry point =====
export function render() {
  ctx.fillStyle = '#050608';
  ctx.fillRect(0, 0, W, H);

  if (state === ST_MENU) {
    renderMenuBg(ctx);
    return;
  }
  if (state !== ST_PLAY && state !== ST_PAUSE) return;

  ctx.save();
  ctx.translate(-camX + shakeX, -camY + shakeY);

  // Viewport bounds (tile coordinates)
  let vx1 = Math.floor(camX / T) - 1;
  let vy1 = Math.floor(camY / T) - 1;
  let vx2 = Math.ceil((camX + W) / T) + 1;
  let vy2 = Math.ceil((camY + H) / T) + 1;
  vx1 = Math.max(0, vx1); vy1 = Math.max(0, vy1);
  vx2 = Math.min(mapW - 1, vx2); vy2 = Math.min(mapH - 1, vy2);
  let vp = { vx1, vy1, vx2, vy2 };

  // --- World-space rendering (translated by camera) ---

  // Layer 1: Floor tiles, doors, terminal, exit portal
  renderFloorTiles(ctx, vp);

  // Layer 2: Wall tiles + destructible wall overlays
  renderWallTiles(ctx, vp);

  // Layer 3: 2.5D wall depth faces
  renderWallDepth(ctx, vp);

  // Layer 4: Ground-level entities (under enemies/player)
  renderCorpses(ctx);
  renderDecals(ctx);
  renderPickups(ctx);
  renderBarrels(ctx);
  renderAirdrops(ctx);
  renderToxicPools(ctx);

  // Layer 5: Enemies
  renderEnemies(ctx);

  // Layer 6: Player trail + player
  renderPlayerTrail(ctx);
  renderPlayer(ctx);

  // Layer 7: Projectiles
  renderProjectiles(ctx);

  // Layer 8: Special particles (rail beams, flashes, shockwaves)
  renderSpecialParticles(ctx);

  // Layer 9: Pool particles (sparks, chunks)
  renderPoolParticles(ctx);

  // Layer 10: Atmospheric particles (dust, sparks, smoke, arcs, drips, steam, rain)
  renderAtmParticles(ctx);

  ctx.restore();

  // --- Screen-space rendering (no camera transform) ---

  // Fog of war / lighting composite
  renderLighting(ctx);

  // Post-processing effects (scanlines, vignette, damage flash, chromatic aberration)
  renderScreenEffects(ctx);

  // HUD elements (health, armor, weapons, minimap, kill feed, etc.)
  renderHUD(ctx);

  // Cinematic overlays (drawn last, on top of everything)
  renderCinematics(ctx);
}
