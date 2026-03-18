// VOID PROTOCOL — UI Panels (Game Flow)

import {
    state, level, difficulty, totalKills, totalTime, levelKills,
    countdownActive, countdownTime, explored, player, stats,
    set
} from '../core/state.js';
import { DIFF, ST_MENU, ST_DEAD, ST_WIN, ST_VICTORY } from '../core/constants.js';

// --- DOM Panel Management ---

export function showPanel(id) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('show'));
    let el = document.getElementById(id);
    if (el) el.classList.add('show');
    let ov = document.getElementById('overlay');
    ov.classList.toggle('active', id !== null && id !== 'none');
}

// Register on window so input.js (and onclick handlers) can reach it without circular imports
window._showPanel = showPanel;

export function setDiff(d) {
    set('difficulty', d);
    document.querySelectorAll('.diff-row .btn').forEach((b, i) => {
        b.classList.toggle('sel', i === d);
    });
}

// --- Game Over ---

export function gameOver() {
    set('state', ST_DEAD);
    let ds = document.getElementById('deathStats');
    let mins = Math.floor(totalTime / 60);
    let secs = Math.floor(totalTime % 60);
    let deathCause = countdownActive && countdownTime <= 0 ? 'Time expired' : 'Destroyed by androids';
    let accuracy = stats.shotsFired > 0 ? Math.round(stats.shotsHit / stats.shotsFired * 100) : 0;
    ds.innerHTML = `<p class="stat-line" style="color:#f44">${deathCause}</p>
    <p class="stat-line">Kills: <span>${totalKills}</span></p>
    <p class="stat-line">Sector: <span>${level}/3</span></p>
    <p class="stat-line">Time survived: <span>${mins}:${secs.toString().padStart(2, '0')}</span></p>
    <p class="stat-line">Accuracy: <span>${accuracy}%</span> | Best Streak: <span>${stats.bestStreak}</span></p>
    <p class="stat-line">Damage Dealt: <span>${Math.round(stats.dmgDealt)}</span> | Taken: <span>${Math.round(stats.dmgTaken)}</span></p>
    <p class="stat-line">Difficulty: <span>${DIFF[difficulty].name}</span></p>`;
    showPanel('deathPanel');
}

// --- Win Level ---

export function winLevel() {
    set('state', ST_WIN);
    let ws = document.getElementById('winStats');
    let exploredPct = Math.round(explored.filter(Boolean).length / explored.length * 100);
    let hpPct = Math.round(player.hp / player.maxHp * 100);
    ws.innerHTML = `<p class="stat-line">Kills this level: <span>${levelKills}</span></p>
    <p class="stat-line">Total kills: <span>${totalKills}</span></p>
    <p class="stat-line">HP remaining: <span style="color:${hpPct > 50 ? '#0f0' : hpPct > 25 ? '#fa0' : '#f00'}">${hpPct}%</span></p>
    <p class="stat-line">Explored: <span>${exploredPct}%</span></p>
    <p class="stat-line">Difficulty: <span>${DIFF[difficulty].name}</span></p>`;
    document.getElementById('winMsg').textContent = level >= 3 ? 'All sectors cleared!' : 'Proceeding to next sector...';
    showPanel('winPanel');
}

// --- Victory (all 3 levels complete) ---

export function victory() {
    set('state', ST_VICTORY);
    let vs = document.getElementById('victoryStats');
    let mins = Math.floor(totalTime / 60);
    let secs = Math.floor(totalTime % 60);
    let rating = totalKills > 40 ? 'S' : totalKills > 30 ? 'A' : totalKills > 20 ? 'B' : totalKills > 10 ? 'C' : 'D';
    if (totalTime < 180 && totalKills > 20) rating = 'S+';
    let vAccuracy = stats.shotsFired > 0 ? Math.round(stats.shotsHit / stats.shotsFired * 100) : 0;
    vs.innerHTML = `<p class="stat-line">Total kills: <span>${totalKills}</span></p>
    <p class="stat-line">Total time: <span>${mins}:${secs.toString().padStart(2, '0')}</span></p>
    <p class="stat-line">Accuracy: <span>${vAccuracy}%</span> | Best Streak: <span>${stats.bestStreak}</span></p>
    <p class="stat-line">Damage Dealt: <span>${Math.round(stats.dmgDealt)}</span> | Taken: <span>${Math.round(stats.dmgTaken)}</span></p>
    <p class="stat-line">Difficulty: <span>${DIFF[difficulty].name}</span></p>
    <p class="stat-line" style="font-size:24px;margin-top:10px">Rating: <span style="color:#fd0;font-size:28px">${rating}</span></p>`;
    showPanel('victoryPanel');
}

// --- Quit to Menu ---

export function quitToMenu() {
    set('state', ST_MENU);
    showPanel('menuPanel');
}

// --- Expose to global scope for HTML onclick handlers ---
window.setDiff = setDiff;
window.quitToMenu = quitToMenu;
window.showPanel = showPanel;
