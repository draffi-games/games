// VOID PROTOCOL — Utility Functions

// Deterministic hash for procedural generation
export function hashR(x, y, s) {
    let n = Math.sin(x * 12.9898 + y * 78.233 + s * 45.164) * 43758.5453;
    return n - Math.floor(n);
}

// Convert hex color to {r,g,b}
export function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    return {
        r: parseInt(hex.substr(0, 2), 16),
        g: parseInt(hex.substr(2, 2), 16),
        b: parseInt(hex.substr(4, 2), 16)
    };
}

// Object Pool for high-frequency allocations
export function Pool(createFn, max) {
    this.create = createFn;
    this.max = max;
    this.pool = [];
    this.active = [];
}

Pool.prototype.get = function () {
    let o;
    if (this.pool.length > 0) {
        o = this.pool.pop();
    } else if (this.active.length >= this.max) {
        o = this.active.shift();
    } else {
        o = this.create();
    }
    this.active.push(o);
    return o;
};

Pool.prototype.ret = function (o) {
    let idx = this.active.indexOf(o);
    if (idx >= 0) this.active.splice(idx, 1);
    if (this.pool.length < this.max) this.pool.push(o);
};

Pool.prototype.clear = function () {
    this.pool = this.pool.concat(this.active);
    this.active = [];
};

// Shared pools
export const particlePool = new Pool(() => ({
    x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1,
    r: 0, g: 0, b: 0, size: 2, grav: false, type: 'spark'
}), 500);

export const projPool = new Pool(() => ({
    x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1,
    dmg: 0, friendly: true, type: 'bullet', color: '#ff0',
    trail: [], pierce: false, splashR: 0
}), 100);

// Distance helper
export function dist(x1, y1, x2, y2) {
    let dx = x2 - x1, dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

// Clamp
export function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}
