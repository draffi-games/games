// VOID PROTOCOL — Constants & Enums

// Tile size in pixels
export const T = 32;

// Game states
export const ST_MENU = 0;
export const ST_PLAY = 1;
export const ST_PAUSE = 2;
export const ST_DEAD = 3;
export const ST_WIN = 4;
export const ST_VICTORY = 5;

// Tile types
export const TILE_VOID = 0;
export const TILE_WALL = 1;
export const TILE_FLOOR = 2;
export const TILE_DOOR_B = 3;
export const TILE_DOOR_R = 4;
export const TILE_DOOR_G = 5;
export const TILE_TERMINAL = 6;
export const TILE_EXIT = 7;
export const TILE_FLOOR2 = 8;
export const TILE_FLOOR3 = 9;
export const TILE_FLOOR4 = 10;

// Room types
export const ROOM_START = 0;
export const ROOM_EXIT = 1;
export const ROOM_SERVER = 2;
export const ROOM_ARMORY = 3;
export const ROOM_STORAGE = 4;
export const ROOM_BOSS = 5;
export const ROOM_PATROL = 6;

// Enemy types
export const EN_SCOUT = 0;
export const EN_SENTINEL = 1;
export const EN_HEAVY = 2;
export const EN_COMMANDER = 3;

// Difficulty presets
export const DIFF = [
    { name: 'EASY',   hpMul: 0.7, dmgMul: 0.7, reactMul: 1.4, countdowns: [70, 60, 50] },
    { name: 'NORMAL', hpMul: 1,   dmgMul: 1,   reactMul: 1,   countdowns: [60, 50, 40] },
    { name: 'HARD',   hpMul: 1.3, dmgMul: 1.3, reactMul: 0.7, countdowns: [50, 40, 30] }
];

// Limits
export const MAX_DECALS = 200;
export const MAX_ATM_PARTICLES = 200;
export const MAX_DYNAMIC_LIGHTS = 10;
export const MAX_KILL_FEED = 5;
