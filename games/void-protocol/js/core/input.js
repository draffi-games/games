// VOID PROTOCOL — Input Handling

import { state, player, showMap, set } from './state.js';
import { ST_PLAY, ST_PAUSE } from './constants.js';
import { W, H } from './canvas.js';
import { weapons } from '../entities/weapons.js';

export const keys = {};
export let mouseX = 0;
export let mouseY = 0;

// Accessors for modules that need fresh values (since let exports are live bindings
// only within this module — re-exported primitives won't track updates).
export function getMouseX() { return mouseX; }
export function getMouseY() { return mouseY; }

function cycleWeapon(dir) {
    let c = player.curWeapon;
    for (let i = 0; i < 6; i++) {
        c = (c + dir + 6) % 6;
        if (c === 0 || player.ammo[c] > 0) { player.curWeapon = c; break; }
    }
}

// Declared here so panels.js can import them for onclick handlers
export function pauseGame() {
    if (state !== ST_PLAY) return;
    set('state', ST_PAUSE);
    // showPanel imported lazily to avoid circular dep — called via global bridge
    window._showPanel('pausePanel');
}

export function resumeGame() {
    set('state', ST_PLAY);
    window._showPanel('none');
}

export function setupInput() {
    // Initialize mouse position to screen center
    mouseX = W / 2;
    mouseY = H / 2;

    window.addEventListener('keydown', e => {
        keys[e.code] = true;
        if (e.code === 'Tab' || e.code === 'Escape') e.preventDefault();
        if (state === ST_PLAY && e.code === 'Escape') pauseGame();
        if (state === ST_PAUSE && e.code === 'Escape') resumeGame();
        if (e.code === 'Tab' && state === ST_PLAY) set('showMap', true);
        // weapon select 1-6
        if (state === ST_PLAY && e.code >= 'Digit1' && e.code <= 'Digit6') {
            let idx = parseInt(e.code[5]) - 1;
            if (idx < weapons.length && (idx === 0 || player.ammo[idx] > 0)) player.curWeapon = idx;
        }
        if (state === ST_PLAY && e.code === 'KeyQ') {
            cycleWeapon(1);
        }
    });

    window.addEventListener('keyup', e => {
        keys[e.code] = false;
        if (e.code === 'Tab') set('showMap', false);
    });

    window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
    window.addEventListener('mousedown', e => { if (e.button === 0) set('mouseDown', true); });
    window.addEventListener('mouseup', e => { if (e.button === 0) set('mouseDown', false); });
    window.addEventListener('wheel', e => {
        if (state === ST_PLAY) cycleWeapon(e.deltaY > 0 ? 1 : -1);
    });
    window.addEventListener('contextmenu', e => e.preventDefault());

    // Expose to global scope for HTML onclick handlers
    window.pauseGame = pauseGame;
    window.resumeGame = resumeGame;
}
