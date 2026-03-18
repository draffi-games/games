// VOID PROTOCOL — Shared Game State
// All mutable state lives here. Modules import and mutate this directly.

import { ST_MENU } from './constants.js';

// --- Core State ---
export let state = ST_MENU;
export let gameTime = 0;
export let level = 1;
export let difficulty = 0;
export let showMap = false;

// --- Camera ---
export let camX = 0, camY = 0;
export let shakeX = 0, shakeY = 0, shakeMag = 0;

// --- Screen Effects ---
export let dmgFlash = 0;
export let killFlash = 0;
export let hitStopTimer = 0;
export let chromatic = 0;
export let gameSpeed = 1;
export let lastKillSlowMo = 0;

// --- Stats ---
export let totalKills = 0, totalTime = 0, levelKills = 0;
export let stats = { shotsFired: 0, shotsHit: 0, dmgDealt: 0, dmgTaken: 0, bestStreak: 0 };

// --- Map ---
export let mapW = 0, mapH = 0;
export let map = [];
export let rooms = [];
export let explored = [];
export let floorDetail = [];

// --- Entity Collections ---
export let decals = [];
export let particles = [];
export let projectiles = [];
export let enemies = [];
export let pickups = [];
export let damageNums = [];
export let killFeed = [];
export let atmParticles = [];
export let barrels = [];
export let toxicPools = [];
export let airdrops = [];
export let secretWalls = [];
export let collapseWalls = [];
export let corpses = [];
export let dynamicLights = [];

// --- Player ---
export let player = {};

// --- Timers & Flags ---
export let flickerTimer = 0, flickerDuration = 0, flickering = false;
export let lastRoom = null, roomAlert = '', roomAlertTimer = 0;
export let airdropTimer = 0;
export let powerUp = { type: null, timer: 0 };
export let collapseTimer = 180;
export let collapseTriggered = false;
export let alarmActive = false, alarmTimer = 0;
export let miniBossThreshold = 15;
export let lastHitAngle = 0, lastHitTimer = 0;
export let toxicDmgAccum = 0;
export let playerTrail = [];
export let toxicFootprintTimer = 0;
export let sprintDustTimer = 0;
export let footprintTimer = 0;
export let lockedDoorMsg = '', lockedDoorTimer = 0;
export let countdownActive = false;
export let countdownTime = 0;
export let terminalHacked = false;
export let hackProgress = 0;
export let exitOpen = false;
export let bossInView = null;
export let bossTarget = null;
export let bossIntroTimer = 0;
export let bossIntroRoom = null;
export let killStreak = 0, killStreakTimer = 0;
export let streakAnnounce = '', streakAnnounceTimer = 0, streakAnnounceText = '', streakAnnounceColor = '#ff0';

// --- HUD State ---
export let hudSegFlicker = [];
export let hudPrevHp = 100;
export let hudArmorShimmer = 0;
export let hudKillStreakLabel = '';
export let hudKillStreakLabelTimer = 0;

// --- Cinematic State ---
export let introTimer = 0, introLevel = 1;
export let cinematicTimer = 0, cinematicType = '';
export let roomFlashTimer = 0, roomFlashName = '', roomFlashImportant = false;

// --- Input (shared) ---
export let mouseDown = false;

// ============================================================
// State setter — since ES modules export live bindings but
// you can't reassign an imported let from outside the module,
// we provide a single setter function for primitive values.
// Usage: set('state', ST_PLAY)
// ============================================================
const stateRef = {
    get state() { return state; },
    get gameTime() { return gameTime; },
    get level() { return level; },
    get difficulty() { return difficulty; },
    get showMap() { return showMap; },
    get camX() { return camX; },
    get camY() { return camY; },
    get shakeX() { return shakeX; },
    get shakeY() { return shakeY; },
    get shakeMag() { return shakeMag; },
    get dmgFlash() { return dmgFlash; },
    get killFlash() { return killFlash; },
    get hitStopTimer() { return hitStopTimer; },
    get chromatic() { return chromatic; },
    get gameSpeed() { return gameSpeed; },
    get lastKillSlowMo() { return lastKillSlowMo; },
    get totalKills() { return totalKills; },
    get totalTime() { return totalTime; },
    get levelKills() { return levelKills; },
    get mapW() { return mapW; },
    get mapH() { return mapH; },
    get flickerTimer() { return flickerTimer; },
    get flickerDuration() { return flickerDuration; },
    get flickering() { return flickering; },
    get roomAlert() { return roomAlert; },
    get roomAlertTimer() { return roomAlertTimer; },
    get airdropTimer() { return airdropTimer; },
    get collapseTimer() { return collapseTimer; },
    get collapseTriggered() { return collapseTriggered; },
    get alarmActive() { return alarmActive; },
    get alarmTimer() { return alarmTimer; },
    get miniBossThreshold() { return miniBossThreshold; },
    get lastHitAngle() { return lastHitAngle; },
    get lastHitTimer() { return lastHitTimer; },
    get toxicDmgAccum() { return toxicDmgAccum; },
    get toxicFootprintTimer() { return toxicFootprintTimer; },
    get sprintDustTimer() { return sprintDustTimer; },
    get footprintTimer() { return footprintTimer; },
    get lockedDoorMsg() { return lockedDoorMsg; },
    get lockedDoorTimer() { return lockedDoorTimer; },
    get countdownActive() { return countdownActive; },
    get countdownTime() { return countdownTime; },
    get terminalHacked() { return terminalHacked; },
    get hackProgress() { return hackProgress; },
    get exitOpen() { return exitOpen; },
    get bossIntroTimer() { return bossIntroTimer; },
    get killStreak() { return killStreak; },
    get killStreakTimer() { return killStreakTimer; },
    get streakAnnounceTimer() { return streakAnnounceTimer; },
    get streakAnnounceText() { return streakAnnounceText; },
    get streakAnnounceColor() { return streakAnnounceColor; },
    get hudPrevHp() { return hudPrevHp; },
    get hudArmorShimmer() { return hudArmorShimmer; },
    get hudKillStreakLabel() { return hudKillStreakLabel; },
    get hudKillStreakLabelTimer() { return hudKillStreakLabelTimer; },
    get introTimer() { return introTimer; },
    get introLevel() { return introLevel; },
    get cinematicTimer() { return cinematicTimer; },
    get cinematicType() { return cinematicType; },
    get roomFlashTimer() { return roomFlashTimer; },
    get roomFlashName() { return roomFlashName; },
    get roomFlashImportant() { return roomFlashImportant; },
    get mouseDown() { return mouseDown; },
};

export function set(key, value) {
    switch (key) {
        case 'state': state = value; break;
        case 'gameTime': gameTime = value; break;
        case 'level': level = value; break;
        case 'difficulty': difficulty = value; break;
        case 'showMap': showMap = value; break;
        case 'camX': camX = value; break;
        case 'camY': camY = value; break;
        case 'shakeX': shakeX = value; break;
        case 'shakeY': shakeY = value; break;
        case 'shakeMag': shakeMag = value; break;
        case 'dmgFlash': dmgFlash = value; break;
        case 'killFlash': killFlash = value; break;
        case 'hitStopTimer': hitStopTimer = value; break;
        case 'chromatic': chromatic = value; break;
        case 'gameSpeed': gameSpeed = value; break;
        case 'lastKillSlowMo': lastKillSlowMo = value; break;
        case 'totalKills': totalKills = value; break;
        case 'totalTime': totalTime = value; break;
        case 'levelKills': levelKills = value; break;
        case 'mapW': mapW = value; break;
        case 'mapH': mapH = value; break;
        case 'map': map = value; break;
        case 'rooms': rooms = value; break;
        case 'explored': explored = value; break;
        case 'floorDetail': floorDetail = value; break;
        case 'decals': decals = value; break;
        case 'particles': particles = value; break;
        case 'projectiles': projectiles = value; break;
        case 'enemies': enemies = value; break;
        case 'pickups': pickups = value; break;
        case 'damageNums': damageNums = value; break;
        case 'killFeed': killFeed = value; break;
        case 'atmParticles': atmParticles = value; break;
        case 'barrels': barrels = value; break;
        case 'toxicPools': toxicPools = value; break;
        case 'airdrops': airdrops = value; break;
        case 'secretWalls': secretWalls = value; break;
        case 'collapseWalls': collapseWalls = value; break;
        case 'corpses': corpses = value; break;
        case 'dynamicLights': dynamicLights = value; break;
        case 'player': player = value; break;
        case 'flickerTimer': flickerTimer = value; break;
        case 'flickerDuration': flickerDuration = value; break;
        case 'flickering': flickering = value; break;
        case 'lastRoom': lastRoom = value; break;
        case 'roomAlert': roomAlert = value; break;
        case 'roomAlertTimer': roomAlertTimer = value; break;
        case 'airdropTimer': airdropTimer = value; break;
        case 'powerUp': powerUp = value; break;
        case 'collapseTimer': collapseTimer = value; break;
        case 'collapseTriggered': collapseTriggered = value; break;
        case 'alarmActive': alarmActive = value; break;
        case 'alarmTimer': alarmTimer = value; break;
        case 'miniBossThreshold': miniBossThreshold = value; break;
        case 'lastHitAngle': lastHitAngle = value; break;
        case 'lastHitTimer': lastHitTimer = value; break;
        case 'toxicDmgAccum': toxicDmgAccum = value; break;
        case 'playerTrail': playerTrail = value; break;
        case 'toxicFootprintTimer': toxicFootprintTimer = value; break;
        case 'sprintDustTimer': sprintDustTimer = value; break;
        case 'footprintTimer': footprintTimer = value; break;
        case 'lockedDoorMsg': lockedDoorMsg = value; break;
        case 'lockedDoorTimer': lockedDoorTimer = value; break;
        case 'countdownActive': countdownActive = value; break;
        case 'countdownTime': countdownTime = value; break;
        case 'terminalHacked': terminalHacked = value; break;
        case 'hackProgress': hackProgress = value; break;
        case 'exitOpen': exitOpen = value; break;
        case 'bossInView': bossInView = value; break;
        case 'bossTarget': bossTarget = value; break;
        case 'bossIntroTimer': bossIntroTimer = value; break;
        case 'bossIntroRoom': bossIntroRoom = value; break;
        case 'killStreak': killStreak = value; break;
        case 'killStreakTimer': killStreakTimer = value; break;
        case 'streakAnnounce': streakAnnounce = value; break;
        case 'streakAnnounceTimer': streakAnnounceTimer = value; break;
        case 'streakAnnounceText': streakAnnounceText = value; break;
        case 'streakAnnounceColor': streakAnnounceColor = value; break;
        case 'hudSegFlicker': hudSegFlicker = value; break;
        case 'hudPrevHp': hudPrevHp = value; break;
        case 'hudArmorShimmer': hudArmorShimmer = value; break;
        case 'hudKillStreakLabel': hudKillStreakLabel = value; break;
        case 'hudKillStreakLabelTimer': hudKillStreakLabelTimer = value; break;
        case 'introTimer': introTimer = value; break;
        case 'introLevel': introLevel = value; break;
        case 'cinematicTimer': cinematicTimer = value; break;
        case 'cinematicType': cinematicType = value; break;
        case 'roomFlashTimer': roomFlashTimer = value; break;
        case 'roomFlashName': roomFlashName = value; break;
        case 'roomFlashImportant': roomFlashImportant = value; break;
        case 'mouseDown': mouseDown = value; break;
        default: console.warn('Unknown state key:', key);
    }
}

// Convenience: reset all level-specific state
export function resetLevelState() {
    levelKills = 0;
    killStreak = 0; killStreakTimer = 0;
    streakAnnounceTimer = 0; streakAnnounceText = '';
    lastKillSlowMo = 0; gameSpeed = 1;
    countdownActive = false; countdownTime = 0;
    terminalHacked = false; hackProgress = 0;
    exitOpen = false;
    particles = []; projectiles = [];
    damageNums = []; killFeed = [];
    atmParticles = []; barrels = [];
    toxicPools = [];
    flickerTimer = 30 + Math.random() * 30;
    flickering = false; flickerDuration = 0;
    lastRoom = null; roomAlert = ''; roomAlertTimer = 0;
    if (level === 1) stats = { shotsFired: 0, shotsHit: 0, dmgDealt: 0, dmgTaken: 0, bestStreak: 0 };
    airdrops = [];
    airdropTimer = 45 + Math.random() * 30;
    powerUp = { type: null, timer: 0 };
    secretWalls = [];
    collapseTimer = 180;
    collapseTriggered = false;
    collapseWalls = [];
    alarmActive = false; alarmTimer = 0;
    miniBossThreshold = 15;
    lastHitAngle = 0; lastHitTimer = 0;
    toxicDmgAccum = 0;
    playerTrail = [];
    toxicFootprintTimer = 0;
    sprintDustTimer = 0;
    footprintTimer = 0;
    lockedDoorMsg = ''; lockedDoorTimer = 0;
    corpses = [];
    dynamicLights = [];
    killFlash = 0; hitStopTimer = 0;
    bossInView = null;
    bossTarget = null;
    bossIntroTimer = 0;
    bossIntroRoom = null;
}
