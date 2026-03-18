// VOID PROTOCOL — Procedural Texture Generation

import { T } from '../core/constants.js';

// Texture cache — prevents regenerating the same texture
const texCache = {};

function genTex(key, w, h, fn) {
  if (texCache[key]) return texCache[key];
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d');
  fn(x, w, h);
  texCache[key] = c;
  return c;
}

export function genFloorTex(variant) {
  return genTex('floor' + variant, T, T, (x, w, h) => {
    const bases = ['#1e2026', '#221e1c', '#1c221e', '#1e1e24'];
    x.fillStyle = bases[variant] || bases[0];
    x.fillRect(0, 0, w, h);
    // Tile grid lines with subtle glow
    x.strokeStyle = 'rgba(255,255,255,0.06)';
    x.lineWidth = 1;
    x.strokeRect(0.5, 0.5, w - 1, h - 1);
    // Inner bevel (3D depth effect)
    x.strokeStyle = 'rgba(255,255,255,0.03)';
    x.beginPath(); x.moveTo(1, h - 1); x.lineTo(1, 1); x.lineTo(w - 1, 1); x.stroke();
    x.strokeStyle = 'rgba(0,0,0,0.15)';
    x.beginPath(); x.moveTo(w - 1, 1); x.lineTo(w - 1, h - 1); x.lineTo(1, h - 1); x.stroke();
    // Enhanced noise with color variation
    for (let i = 0; i < 35; i++) {
      let bri = Math.random() * 0.08;
      x.fillStyle = `rgba(${100 + Math.random() * 155},${100 + Math.random() * 155},${100 + Math.random() * 155},${bri})`;
      x.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2);
    }
    // Circuit pattern on some tiles
    if (variant === 0) {
      x.strokeStyle = 'rgba(0,180,220,0.04)';
      x.lineWidth = 0.5;
      x.beginPath(); x.moveTo(w * 0.3, 0); x.lineTo(w * 0.3, h * 0.4); x.lineTo(w * 0.7, h * 0.4); x.lineTo(w * 0.7, h); x.stroke();
      // Circuit node
      x.fillStyle = 'rgba(0,200,255,0.06)';
      x.beginPath(); x.arc(w * 0.3, h * 0.4, 2, 0, Math.PI * 2); x.fill();
    }
    if (variant === 1) {
      // Metal plate pattern
      x.fillStyle = 'rgba(80,60,40,0.08)';
      x.fillRect(w / 4, 0, w / 2, h);
      // Rivets
      x.fillStyle = 'rgba(120,100,80,0.1)';
      x.beginPath(); x.arc(4, 4, 1.5, 0, Math.PI * 2); x.fill();
      x.beginPath(); x.arc(w - 4, 4, 1.5, 0, Math.PI * 2); x.fill();
      x.beginPath(); x.arc(4, h - 4, 1.5, 0, Math.PI * 2); x.fill();
      x.beginPath(); x.arc(w - 4, h - 4, 1.5, 0, Math.PI * 2); x.fill();
    }
    if (variant === 2) {
      // Tech lines
      x.strokeStyle = 'rgba(0,255,150,0.04)';
      x.lineWidth = 0.5;
      x.beginPath(); x.moveTo(0, h * 0.3); x.lineTo(w * 0.6, h * 0.3); x.lineTo(w * 0.6, h); x.stroke();
      x.strokeStyle = 'rgba(0,255,150,0.03)';
      x.beginPath(); x.moveTo(w, h * 0.7); x.lineTo(w * 0.4, h * 0.7); x.stroke();
    }
    if (variant === 3) {
      // Hex pattern
      x.fillStyle = 'rgba(100,80,140,0.06)';
      x.beginPath();
      x.moveTo(w / 2, 2); x.lineTo(w - 4, h / 4); x.lineTo(w - 4, h * 3 / 4); x.lineTo(w / 2, h - 2); x.lineTo(4, h * 3 / 4); x.lineTo(4, h / 4); x.closePath();
      x.fill();
      x.strokeStyle = 'rgba(140,100,200,0.05)';
      x.lineWidth = 0.5;
      x.stroke();
    }
  });
}

export function genWallTex(variant) {
  return genTex('wall' + variant, T, T, (x, w, h) => {
    const bases = ['#303640', '#403030', '#304038'];
    x.fillStyle = bases[variant] || bases[0];
    x.fillRect(0, 0, w, h);
    // Industrial panel pattern
    x.strokeStyle = 'rgba(0,0,0,0.25)';
    x.lineWidth = 1;
    x.strokeRect(1, 1, w - 2, h / 2 - 1);
    x.strokeRect(w / 2, h / 2, w / 2 - 1, h / 2 - 1);
    x.strokeRect(0, h / 2, -1 + w / 2, h / 2 - 1);
    // Top highlight (3D bevel)
    x.fillStyle = 'rgba(255,255,255,0.06)';
    x.fillRect(2, 2, w - 4, 2);
    // Bottom shadow
    x.fillStyle = 'rgba(0,0,0,0.12)';
    x.fillRect(2, h - 3, w - 4, 2);
    // Rivets/bolts
    let rivetAlpha = variant === 0 ? 0.12 : 0.08;
    x.fillStyle = `rgba(180,180,200,${rivetAlpha})`;
    x.beginPath(); x.arc(4, 4, 1.5, 0, Math.PI * 2); x.fill();
    x.beginPath(); x.arc(w - 4, 4, 1.5, 0, Math.PI * 2); x.fill();
    x.beginPath(); x.arc(4, h - 4, 1.5, 0, Math.PI * 2); x.fill();
    x.beginPath(); x.arc(w - 4, h - 4, 1.5, 0, Math.PI * 2); x.fill();
    // Vent/grate detail per variant
    if (variant === 0) {
      // Horizontal vent slats
      x.strokeStyle = 'rgba(0,200,255,0.05)';
      x.lineWidth = 0.5;
      for (let i = 0; i < 3; i++) {
        let yy = h * 0.3 + i * 3;
        x.beginPath(); x.moveTo(w * 0.2, yy); x.lineTo(w * 0.8, yy); x.stroke();
      }
    }
    if (variant === 1) {
      // Warning stripe
      x.fillStyle = 'rgba(200,150,0,0.06)';
      x.beginPath();
      x.moveTo(0, h); x.lineTo(8, h); x.lineTo(w, 0); x.lineTo(w - 8, 0); x.closePath();
      x.fill();
    }
    if (variant === 2) {
      // Conduit
      x.strokeStyle = 'rgba(0,180,100,0.06)';
      x.lineWidth = 2;
      x.beginPath(); x.moveTo(w / 2, 0); x.lineTo(w / 2, h); x.stroke();
    }
    // Enhanced noise
    for (let i = 0; i < 25; i++) {
      x.fillStyle = `rgba(0,0,0,${Math.random() * 0.12})`;
      x.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 3, 1 + Math.random() * 3);
    }
    // Subtle specular highlight
    x.fillStyle = 'rgba(255,255,255,0.02)';
    x.fillRect(3, 3, w / 2 - 3, h / 2 - 3);
  });
}

export function genDoorTex(color) {
  return genTex('door_' + color, T, T, (x, w, h) => {
    x.fillStyle = '#1a1a2a';
    x.fillRect(0, 0, w, h);
    x.fillStyle = color;
    x.globalAlpha = 0.4;
    x.fillRect(4, 2, w - 8, h - 4);
    x.globalAlpha = 0.8;
    x.fillRect(w / 2 - 2, 4, 4, h - 8);
    x.globalAlpha = 1;
    // lock icon
    x.fillStyle = color;
    x.beginPath(); x.arc(w / 2, h / 2, 5, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#000';
    x.fillRect(w / 2 - 2, h / 2 - 1, 4, 4);
    // border
    x.strokeStyle = color;
    x.lineWidth = 2;
    x.strokeRect(2, 1, w - 4, h - 2);
  });
}

export function genTerminalTex() {
  return genTex('terminal', T, T, (x, w, h) => {
    x.fillStyle = '#1a2a1a';
    x.fillRect(0, 0, w, h);
    x.fillStyle = '#0f0';
    x.globalAlpha = 0.3;
    x.fillRect(4, 4, w - 8, h - 8);
    x.globalAlpha = 1;
    // screen
    x.fillStyle = '#0a0';
    x.fillRect(6, 6, w - 12, h - 16);
    // text lines
    x.fillStyle = '#0f0';
    for (let i = 0; i < 3; i++) {
      x.fillRect(8, 8 + i * 4, 8 + Math.random() * 8, 2);
    }
    // keyboard
    x.fillStyle = '#1a3a1a';
    x.fillRect(6, h - 8, w - 12, 5);
    x.strokeStyle = '#0f0';
    x.lineWidth = 1;
    x.strokeRect(3, 3, w - 6, h - 6);
  });
}

export function genExitTex() {
  return genTex('exit', T, T, (x, w, h) => {
    // Dark metallic base
    x.fillStyle = '#121828';
    x.fillRect(0, 0, w, h);
    // Grate pattern
    x.strokeStyle = 'rgba(0,180,220,0.08)';
    x.lineWidth = 0.5;
    for (let g = 0; g < w; g += 4) {
      x.beginPath(); x.moveTo(g, 0); x.lineTo(g, h); x.stroke();
    }
    for (let g = 0; g < h; g += 4) {
      x.beginPath(); x.moveTo(0, g); x.lineTo(w, g); x.stroke();
    }
    // Inner portal frame
    x.strokeStyle = '#0ae';
    x.lineWidth = 2;
    x.strokeRect(3, 3, w - 6, h - 6);
    // Corner brackets
    x.strokeStyle = '#0df';
    x.lineWidth = 2.5;
    let cb = 7;
    // Top-left
    x.beginPath(); x.moveTo(2, cb); x.lineTo(2, 2); x.lineTo(cb, 2); x.stroke();
    // Top-right
    x.beginPath(); x.moveTo(w - cb, 2); x.lineTo(w - 2, 2); x.lineTo(w - 2, cb); x.stroke();
    // Bottom-left
    x.beginPath(); x.moveTo(2, h - cb); x.lineTo(2, h - 2); x.lineTo(cb, h - 2); x.stroke();
    // Bottom-right
    x.beginPath(); x.moveTo(w - 2, h - cb); x.lineTo(w - 2, h - 2); x.lineTo(w - cb, h - 2); x.stroke();
    // Chevron arrows (direction markers)
    x.fillStyle = '#0df';
    x.globalAlpha = 0.4;
    x.beginPath();
    x.moveTo(w * 0.35, h * 0.3); x.lineTo(w * 0.65, h * 0.5); x.lineTo(w * 0.35, h * 0.7);
    x.lineTo(w * 0.42, h * 0.5); x.closePath();
    x.fill();
    x.globalAlpha = 0.2;
    x.beginPath();
    x.moveTo(w * 0.2, h * 0.35); x.lineTo(w * 0.45, h * 0.5); x.lineTo(w * 0.2, h * 0.65);
    x.lineTo(w * 0.27, h * 0.5); x.closePath();
    x.fill();
    x.globalAlpha = 1;
    // Center diamond emblem
    x.fillStyle = 'rgba(0,220,255,0.15)';
    x.beginPath();
    x.moveTo(w / 2, h * 0.25); x.lineTo(w * 0.7, h / 2); x.lineTo(w / 2, h * 0.75); x.lineTo(w * 0.3, h / 2); x.closePath();
    x.fill();
  });
}

// Floor detail overlays
export function genCrackTex() {
  return genTex('crack' + Math.random(), T, T, (x, w, h) => {
    x.strokeStyle = 'rgba(0,0,0,0.3)';
    x.lineWidth = 1;
    x.beginPath();
    let cx = Math.random() * w, cy = Math.random() * h;
    x.moveTo(cx, cy);
    for (let i = 0; i < 4; i++) {
      cx += Math.random() * 12 - 6; cy += Math.random() * 12 - 6;
      x.lineTo(cx, cy);
    }
    x.stroke();
  });
}

export function genCableTex() {
  return genTex('cable' + Math.random(), T, T, (x, w, h) => {
    const colors = ['#440', '#044', '#404'];
    x.strokeStyle = colors[Math.floor(Math.random() * 3)];
    x.lineWidth = 2;
    x.globalAlpha = 0.25;
    x.beginPath();
    if (Math.random() > 0.5) { x.moveTo(0, h * Math.random()); x.lineTo(w, h * Math.random()) }
    else { x.moveTo(w * Math.random(), 0); x.lineTo(w * Math.random(), h) }
    x.stroke();
    x.globalAlpha = 1;
  });
}

export function genDrainTex() {
  return genTex('drain' + Math.random(), T, T, (x, w, h) => {
    x.fillStyle = 'rgba(0,0,0,0.25)';
    x.beginPath(); x.arc(w / 2, h / 2, 6, 0, Math.PI * 2); x.fill();
    x.strokeStyle = 'rgba(0,0,0,0.2)';
    x.lineWidth = 1;
    x.beginPath(); x.moveTo(w / 2 - 4, h / 2 - 4); x.lineTo(w / 2 + 4, h / 2 + 4); x.stroke();
    x.beginPath(); x.moveTo(w / 2 + 4, h / 2 - 4); x.lineTo(w / 2 - 4, h / 2 + 4); x.stroke();
  });
}

// Pre-generated texture references
export let floorTexes, wallTexes, doorTexes, terminalTex, exitTex;

export function initTextures() {
  floorTexes = [genFloorTex(0), genFloorTex(1), genFloorTex(2), genFloorTex(3)];
  wallTexes = [genWallTex(0), genWallTex(1), genWallTex(2)];
  doorTexes = { b: genDoorTex('#44f'), r: genDoorTex('#f44'), g: genDoorTex('#fd0') };
  terminalTex = genTerminalTex();
  exitTex = genExitTex();
}
