// VOID PROTOCOL — Screen Post-Processing Effects

import { player, gameTime, dmgFlash, killFlash, chromatic, countdownActive,
         lastHitAngle, lastHitTimer, alarmActive, alarmTimer,
         collapseTriggered, collapseWalls, collapseTimer, flickering } from '../core/state.js';
import { gc, W, H } from '../core/canvas.js';

export function renderScreenEffects(ctx) {
  // Scanlines (subtle)
  ctx.fillStyle = 'rgba(0,0,0,0.03)';
  for (let y = 0; y < H; y += 4) {
    ctx.fillRect(0, y, W, 1);
  }

  // Vignette - permanent dark vignette with multi-stop falloff
  let vignBase = countdownActive ? 0.7 : 0.5;
  let vignInner = countdownActive ? 0.2 : 0.3;
  let vignGrad = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * vignInner, W / 2, H / 2, Math.sqrt(W * W + H * H) * 0.55);
  vignGrad.addColorStop(0, 'rgba(0,0,0,0)');
  vignGrad.addColorStop(0.7, `rgba(0,0,0,${vignBase * 0.3})`);
  vignGrad.addColorStop(1, `rgba(0,0,0,${vignBase})`);
  ctx.fillStyle = vignGrad;
  ctx.fillRect(0, 0, W, H);

  // CRT Curvature - darken extreme edges for barrel distortion feel
  let crtEdge = 12;
  let crtAlpha = 0.25;
  let crtTop = ctx.createLinearGradient(0, 0, 0, crtEdge);
  crtTop.addColorStop(0, `rgba(0,0,0,${crtAlpha})`);
  crtTop.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = crtTop;
  ctx.fillRect(0, 0, W, crtEdge);
  let crtBot = ctx.createLinearGradient(0, H - crtEdge, 0, H);
  crtBot.addColorStop(0, 'rgba(0,0,0,0)');
  crtBot.addColorStop(1, `rgba(0,0,0,${crtAlpha})`);
  ctx.fillStyle = crtBot;
  ctx.fillRect(0, H - crtEdge, W, crtEdge);
  let crtLeft = ctx.createLinearGradient(0, 0, crtEdge, 0);
  crtLeft.addColorStop(0, `rgba(0,0,0,${crtAlpha})`);
  crtLeft.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = crtLeft;
  ctx.fillRect(0, 0, crtEdge, H);
  let crtRight = ctx.createLinearGradient(W - crtEdge, 0, W, 0);
  crtRight.addColorStop(0, 'rgba(0,0,0,0)');
  crtRight.addColorStop(1, `rgba(0,0,0,${crtAlpha})`);
  ctx.fillStyle = crtRight;
  ctx.fillRect(W - crtEdge, 0, crtEdge, H);
  // Corner darkening
  let cornerSize = 40;
  let cornerAlpha = 0.35;
  let corners = [[0, 0], [W, 0], [0, H], [W, H]];
  for (let [cx, cy] of corners) {
    let cGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cornerSize);
    cGrad.addColorStop(0, `rgba(0,0,0,${cornerAlpha})`);
    cGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = cGrad;
    let rx = cx === 0 ? 0 : W - cornerSize;
    let ry = cy === 0 ? 0 : H - cornerSize;
    ctx.fillRect(rx, ry, cornerSize, cornerSize);
  }

  // Damage flash
  if (dmgFlash > 0) {
    ctx.fillStyle = `rgba(200,20,0,${dmgFlash * 0.3})`;
    ctx.fillRect(0, 0, W, H);
  }

  // Damage Glitch - horizontal scanline displacement with RGB shift
  if (dmgFlash > 0.05) {
    ctx.save();
    let glitchIntensity = Math.min(1, dmgFlash * 3);
    let numStrips = 3 + Math.floor(glitchIntensity * 4);
    for (let i = 0; i < numStrips; i++) {
      let stripY = Math.floor(((Math.sin(gameTime * 173.7 + i * 57.3) * 0.5 + 0.5)) * H);
      let stripH = 2 + Math.floor(Math.abs(Math.sin(gameTime * 91.3 + i * 31.7)) * 6);
      let offsetX = Math.floor((Math.sin(gameTime * 127.1 + i * 43.9) - 0.5) * (2 + glitchIntensity * 5));
      if (stripY + stripH > H) stripH = H - stripY;
      if (stripY < 0 || stripH <= 0) continue;
      ctx.globalCompositeOperation = 'lighter';
      // Red-tinted strip shifted right
      ctx.globalAlpha = glitchIntensity * 0.2;
      ctx.drawImage(gc, 0, stripY, W, stripH, offsetX, stripY, W, stripH);
      // Blue-tinted strip shifted left
      ctx.globalAlpha = glitchIntensity * 0.15;
      ctx.drawImage(gc, 0, stripY, W, stripH, -offsetX, stripY, W, stripH);
    }
    // Occasional full-width glitch line
    if (glitchIntensity > 0.3) {
      let bigY = Math.floor(Math.abs(Math.sin(gameTime * 211.7)) * H);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = glitchIntensity * 0.08;
      ctx.fillStyle = `rgb(${180 + Math.floor(Math.abs(Math.sin(gameTime * 97.3)) * 75)},${Math.floor(Math.abs(Math.sin(gameTime * 53.1)) * 30)},${Math.floor(Math.abs(Math.sin(gameTime * 71.9)) * 30)})`;
      ctx.fillRect(0, bigY, W, 1);
    }
    ctx.restore();
  }

  // Kill flash (white screen flash on enemy death)
  if (killFlash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${killFlash * 0.25})`;
    ctx.fillRect(0, 0, W, H);
  }

  // Low HP warning - heartbeat pulsing red vignette with screen edge pulse
  if (player.alive && player.hp <= 25) {
    let intensity = (1 - player.hp / 25) * 0.5;
    let beatFreq = player.hp < 10 ? 14 : player.hp < 15 ? 10 : 8;
    // Heartbeat: sharp peak then decay (double-bump like a real heartbeat)
    let t = (gameTime * beatFreq) % (Math.PI * 2);
    let beat = Math.pow(Math.max(0, Math.sin(t)), 3) + Math.pow(Math.max(0, Math.sin(t + 0.8)), 5) * 0.4;
    let alpha = intensity * beat;
    // Red vignette border that leaves center clear
    let warnGrad = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.2, W / 2, H / 2, Math.sqrt(W * W + H * H) * 0.5);
    warnGrad.addColorStop(0, 'rgba(0,0,0,0)');
    warnGrad.addColorStop(0.6, 'rgba(0,0,0,0)');
    warnGrad.addColorStop(1, `rgba(200,0,0,${alpha})`);
    ctx.fillStyle = warnGrad;
    ctx.fillRect(0, 0, W, H);
    // Subtle edge flash on heartbeat peaks
    if (beat > 0.5) {
      let pulseAlpha = (beat - 0.5) * intensity * 0.15;
      ctx.fillStyle = `rgba(60,0,0,${pulseAlpha})`;
      ctx.fillRect(0, 0, W, 3);
      ctx.fillRect(0, H - 3, W, 3);
      ctx.fillRect(0, 0, 3, H);
      ctx.fillRect(W - 3, 0, 3, H);
    }
  }

  // Damage direction indicator
  if (lastHitTimer > 0) {
    let dirAlpha = Math.min(1, lastHitTimer / 0.4) * 0.6;
    let hAngle = lastHitAngle;
    // Draw red arc on screen edge pointing to damage source
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate(hAngle);
    let edgeDist = Math.min(W, H) * 0.42;
    ctx.globalAlpha = dirAlpha;
    // Red gradient wedge
    let wedgeGrad = ctx.createRadialGradient(edgeDist, 0, 0, edgeDist, 0, 60);
    wedgeGrad.addColorStop(0, 'rgba(255,0,0,0.7)');
    wedgeGrad.addColorStop(1, 'rgba(255,0,0,0)');
    ctx.fillStyle = wedgeGrad;
    ctx.beginPath();
    ctx.moveTo(edgeDist - 30, -25);
    ctx.lineTo(edgeDist + 30, -15);
    ctx.lineTo(edgeDist + 30, 15);
    ctx.lineTo(edgeDist - 30, 25);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Countdown alarm border
  if (countdownActive) {
    let pulse = Math.sin(gameTime * 6) * 0.5 + 0.5;
    ctx.strokeStyle = `rgba(255,0,0,${0.3 * pulse})`;
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, W - 4, H - 4);
    // Edge smoke during countdown
    ctx.fillStyle = `rgba(40,10,5,${0.05 * pulse})`;
    ctx.fillRect(0, 0, W, 30);
    ctx.fillRect(0, H - 30, W, 30);
  }

  // Static Noise - faint noise during countdown or very low HP
  let showStatic = countdownActive || (player.alive && player.hp <= 15);
  if (showStatic) {
    let staticIntensity = 0;
    if (countdownActive) staticIntensity = Math.max(staticIntensity, 0.04);
    if (player.alive && player.hp <= 15) staticIntensity = Math.max(staticIntensity, 0.03 * (1 - player.hp / 15));
    ctx.save();
    ctx.globalAlpha = staticIntensity;
    // Sparse random noise dots
    let seed = Math.floor(gameTime * 60);
    for (let i = 0; i < 120; i++) {
      let rx = ((seed * 13 + i * 7919) % W);
      let ry = ((seed * 17 + i * 6271) % H);
      let bright = ((seed * 3 + i * 4001) % 255);
      ctx.fillStyle = `rgb(${bright},${bright},${bright})`;
      ctx.fillRect(rx, ry, 1, 1);
    }
    // Larger noise blocks for texture
    for (let i = 0; i < 8; i++) {
      let bx = ((seed * 23 + i * 3571) % Math.max(1, W - 4));
      let by = ((seed * 31 + i * 2137) % Math.max(1, H - 2));
      let bw = 2 + ((seed + i * 113) % 3);
      let bright = ((seed * 7 + i * 929) % 200);
      ctx.fillStyle = `rgb(${bright},${bright},${bright})`;
      ctx.fillRect(bx, by, bw, 1);
    }
    ctx.restore();
  }

  // Chromatic aberration (offset red/blue channels)
  if (chromatic > 0.02) {
    let off = Math.floor(chromatic * 15);
    if (off >= 1) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = chromatic * 0.15;
      // Red shift right
      ctx.drawImage(gc, off, 0, W - off, H, 0, 0, W - off, H);
      ctx.globalAlpha = chromatic * 0.1;
      // Blue shift left
      ctx.drawImage(gc, 0, 0, W - off, H, off, 0, W - off, H);
      ctx.restore();
    }
  }
}
