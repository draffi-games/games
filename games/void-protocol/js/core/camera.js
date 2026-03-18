// VOID PROTOCOL — Camera System

import { player, camX, camY, shakeMag, shakeX, shakeY, mapW, mapH, set } from './state.js';
import { T } from './constants.js';
import { W, H } from './canvas.js';

// Update camera position: follow player, apply screen shake decay
export function updateCamera(dt) {
    // Shake decay
    let sm = shakeMag * Math.max(0, 1 - dt * 8);
    if (sm < 0.1) sm = 0;
    set('shakeMag', sm);

    // Camera follows player (centered)
    set('camX', player.x - W / 2);
    set('camY', player.y - H / 2);

    // Apply shake offset
    if (sm > 0) {
        set('shakeX', (Math.random() - 0.5) * sm * 2);
        set('shakeY', (Math.random() - 0.5) * sm * 2);
    } else {
        set('shakeX', 0);
        set('shakeY', 0);
    }
}

// Get visible tile bounds (with 1-tile margin)
export function getViewport() {
    let vx1 = Math.floor(camX / T) - 1;
    let vy1 = Math.floor(camY / T) - 1;
    let vx2 = Math.ceil((camX + W) / T) + 1;
    let vy2 = Math.ceil((camY + H) / T) + 1;
    vx1 = Math.max(0, vx1);
    vy1 = Math.max(0, vy1);
    vx2 = Math.min(mapW - 1, vx2);
    vy2 = Math.min(mapH - 1, vy2);
    return { vx1, vy1, vx2, vy2 };
}
