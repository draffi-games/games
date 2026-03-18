// VOID PROTOCOL — Cinematic Transitions & Menu Background

import { gameTime, introTimer, introLevel, cinematicTimer, cinematicType,
         bossIntroTimer } from '../core/state.js';
import { gc, W, H } from '../core/canvas.js';

// ===== Boss Room Intro Cinematic =====
export function renderBossIntro(ctx) {
  if (bossIntroTimer <= 0) return;

  let prog = 1 - bossIntroTimer / 2.5; // 0 -> 1 over 2.5s
  let fadeAlpha;
  if (prog < 0.1) fadeAlpha = prog / 0.1;
  else if (prog > 0.75) fadeAlpha = (1 - prog) / 0.25;
  else fadeAlpha = 1;
  fadeAlpha = Math.max(0, Math.min(1, fadeAlpha));

  // Vignette - darken screen edges
  let vigGrad = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.2, W / 2, H / 2, Math.max(W, H) * 0.7);
  vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
  vigGrad.addColorStop(0.6, 'rgba(0,0,0,0.3)');
  vigGrad.addColorStop(1, 'rgba(0,0,0,0.85)');
  ctx.fillStyle = vigGrad;
  ctx.globalAlpha = fadeAlpha;
  ctx.fillRect(0, 0, W, H);

  // Purple flash at start
  if (prog < 0.2) {
    let flashI = (0.2 - prog) / 0.2;
    ctx.fillStyle = `rgba(140,50,200,${flashI * 0.25 * fadeAlpha})`;
    ctx.fillRect(0, 0, W, H);
  }

  // Purple border pulse
  let borderPulse = Math.sin(prog * Math.PI * 4) * 0.5 + 0.5;
  ctx.strokeStyle = `rgba(170,68,255,${fadeAlpha * borderPulse * 0.6})`;
  ctx.lineWidth = 3;
  ctx.strokeRect(2, 2, W - 4, H - 4);

  // Horizontal line sweep (left to right)
  let sweepProg = Math.min(1, prog * 2);
  let sweepX = sweepProg * W;
  ctx.fillStyle = '#a4f';
  ctx.globalAlpha = fadeAlpha * (1 - sweepProg * 0.5);
  ctx.fillRect(sweepX - 2, H * 0.35 - 2, 4, 4);
  // Thin horizontal line trailing the sweep
  ctx.fillStyle = 'rgba(170,68,255,0.6)';
  ctx.globalAlpha = fadeAlpha * 0.8;
  ctx.fillRect(0, H * 0.35, sweepX, 1);
  ctx.fillRect(W - sweepX, H * 0.35 + 36, sweepX, 1);

  // "BOSS CHAMBER" title text with glitch
  if (prog > 0.15) {
    let textAlpha = Math.min(1, (prog - 0.15) / 0.2);
    ctx.globalAlpha = fadeAlpha * textAlpha * 0.95;
    // Background panel
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(W / 2 - 180, H * 0.35 - 5, 360, 45);

    // Glitch effect
    let gx = prog < 0.5 ? (Math.random() - 0.5) * 6 : 0;
    let gy = prog < 0.5 ? (Math.random() - 0.5) * 3 : 0;

    // Main title
    ctx.shadowColor = '#a4f';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#a4f';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BOSS CHAMBER', W / 2 + gx, H * 0.35 + 22 + gy);
    ctx.shadowBlur = 0;

    // Subtitle
    if (prog > 0.35) {
      let subAlpha = Math.min(1, (prog - 0.35) / 0.15);
      ctx.globalAlpha = fadeAlpha * subAlpha * 0.7;
      ctx.fillStyle = '#c8f';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('COMMANDER DETECTED', W / 2 + gx * 0.3, H * 0.35 + 38 + gy * 0.3);
    }

    // Random glitch slices during early phase
    if (prog < 0.6 && Math.random() < 0.4) {
      let slY = H * 0.35 - 5 + Math.random() * 45;
      let slH = 2 + Math.random() * 4;
      let slOff = (Math.random() - 0.5) * 15;
      ctx.globalAlpha = 0.5;
      ctx.drawImage(gc, 0, slY, W, slH, slOff, slY, W, slH);
    }
  }

  // Scanlines overlay
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  ctx.globalAlpha = fadeAlpha * 0.4;
  for (let sy = 0; sy < H; sy += 3) {
    ctx.fillRect(0, sy, W, 1);
  }

  ctx.textAlign = 'left';
  ctx.globalAlpha = 1;
}

// ===== Level Start Intro =====
export function renderLevelIntro(ctx) {
  if (introTimer <= 0) return;

  let prog = 1 - introTimer / 1.5; // 0 -> 1 over 1.5s
  let revealY = prog * H;
  let fadeAlpha = prog < 0.1 ? prog / 0.1 : prog > 0.8 ? (1 - prog) / 0.2 : 1;
  fadeAlpha = Math.max(0, Math.min(1, fadeAlpha));

  // Dark overlay above the reveal line
  if (prog < 0.9) {
    ctx.fillStyle = 'rgba(5,6,8,0.7)';
    ctx.globalAlpha = (1 - prog) * 0.6;
    ctx.fillRect(0, 0, W, Math.max(0, H - revealY));
    ctx.globalAlpha = 1;
  }

  // Scan-line at reveal edge
  ctx.fillStyle = '#0df';
  ctx.globalAlpha = fadeAlpha * 0.8;
  ctx.fillRect(0, revealY - 1, W, 2);
  // Glow around scan-line
  let slGrad = ctx.createLinearGradient(0, revealY - 20, 0, revealY + 20);
  slGrad.addColorStop(0, 'rgba(0,221,255,0)');
  slGrad.addColorStop(0.5, 'rgba(0,221,255,0.15)');
  slGrad.addColorStop(1, 'rgba(0,221,255,0)');
  ctx.fillStyle = slGrad;
  ctx.globalAlpha = fadeAlpha;
  ctx.fillRect(0, revealY - 20, W, 40);

  // "SECTOR X" text with glitch effect
  ctx.globalAlpha = fadeAlpha * 0.95;
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(W / 2 - 160, H * 0.4 - 30, 320, 70);

  // Glitch offset for early part of animation
  let gx = prog < 0.4 ? (Math.random() - 0.5) * 8 : 0;
  let gy = prog < 0.4 ? (Math.random() - 0.5) * 3 : 0;

  // Main title
  ctx.fillStyle = '#0df';
  ctx.font = 'bold 36px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('SECTOR ' + introLevel, W / 2 + gx, H * 0.4 + 10 + gy);

  // Subtitle
  ctx.fillStyle = '#08a';
  ctx.font = 'bold 14px monospace';
  let subtitles = ['CONTAINMENT ZONE', 'PROCESSING CORE', 'COMMAND CENTER'];
  ctx.fillText(subtitles[Math.min(introLevel - 1, 2)] || 'UNKNOWN SECTOR', W / 2 + gx * 0.5, H * 0.4 + 32 + gy * 0.5);

  // Glitch horizontal lines (random slices)
  if (prog < 0.5 && Math.random() < 0.4) {
    let sliceY = H * 0.4 - 30 + Math.random() * 70;
    let sliceH = 2 + Math.random() * 4;
    let sliceOff = (Math.random() - 0.5) * 20;
    ctx.globalAlpha = 0.6;
    ctx.drawImage(gc, 0, sliceY, W, sliceH, sliceOff, sliceY, W, sliceH);
  }

  // Thin scanlines across the overlay
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  ctx.globalAlpha = fadeAlpha * 0.5;
  for (let sy = 0; sy < H; sy += 3) {
    ctx.fillRect(0, sy, W, 1);
  }

  ctx.textAlign = 'left';
  ctx.globalAlpha = 1;
}

// ===== Evacuation Activation Cinematic =====
export function renderEvacuationCinematic(ctx) {
  if (cinematicTimer <= 0 || cinematicType !== 'evacuation') return;

  let prog = 1 - cinematicTimer / 2.0; // 0 -> 1 over 2s
  let fadeAlpha;
  if (prog < 0.1) fadeAlpha = prog / 0.1;
  else if (prog > 0.7) fadeAlpha = (1 - prog) / 0.3;
  else fadeAlpha = 1;
  fadeAlpha = Math.max(0, Math.min(1, fadeAlpha));

  // Darken screen
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.globalAlpha = fadeAlpha * 0.7;
  ctx.fillRect(0, 0, W, H);

  // Red flash pulse
  let redPulse = Math.sin(prog * Math.PI * 6) * 0.5 + 0.5;
  ctx.fillStyle = 'rgba(255,30,20,0.2)';
  ctx.globalAlpha = fadeAlpha * redPulse * 0.6;
  ctx.fillRect(0, 0, W, H);

  // Red border flash
  ctx.strokeStyle = '#f44';
  ctx.globalAlpha = fadeAlpha * redPulse * 0.8;
  ctx.lineWidth = 4;
  ctx.strokeRect(3, 3, W - 6, H - 6);

  // "EVACUATION PROTOCOL" text with glitch
  ctx.globalAlpha = fadeAlpha * 0.95;
  ctx.fillStyle = 'rgba(0,0,0,0.8)';
  ctx.fillRect(W / 2 - 200, H * 0.38 - 10, 400, 60);

  let gx2 = prog < 0.5 ? (Math.random() - 0.5) * 10 : prog > 0.8 ? (Math.random() - 0.5) * 6 : 0;
  let gy2 = prog < 0.5 ? (Math.random() - 0.5) * 4 : 0;

  ctx.fillStyle = '#f44';
  ctx.font = 'bold 30px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('EVACUATION', W / 2 + gx2, H * 0.38 + 18 + gy2);
  ctx.fillStyle = '#f88';
  ctx.font = 'bold 20px monospace';
  ctx.fillText('PROTOCOL INITIATED', W / 2 + gx2 * 0.7, H * 0.38 + 42 + gy2 * 0.5);

  // Warning stripes at top/bottom
  ctx.globalAlpha = fadeAlpha * 0.3;
  let stripeW = 40;
  for (let sx = 0; sx < W; sx += stripeW * 2) {
    ctx.fillStyle = '#f44';
    ctx.beginPath();
    ctx.moveTo(sx, 0); ctx.lineTo(sx + stripeW, 0);
    ctx.lineTo(sx + stripeW - 10, 8); ctx.lineTo(sx - 10, 8);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(sx, H); ctx.lineTo(sx + stripeW, H);
    ctx.lineTo(sx + stripeW - 10, H - 8); ctx.lineTo(sx - 10, H - 8);
    ctx.closePath(); ctx.fill();
  }

  // Glitch slices
  if (prog < 0.6 && Math.random() < 0.5) {
    let sliceY2 = H * 0.38 - 10 + Math.random() * 60;
    let sliceH2 = 2 + Math.random() * 5;
    let sliceOff2 = (Math.random() - 0.5) * 25;
    ctx.globalAlpha = 0.5;
    ctx.drawImage(gc, 0, sliceY2, W, sliceH2, sliceOff2, sliceY2, W, sliceH2);
  }

  ctx.textAlign = 'left';
  ctx.globalAlpha = 1;
}

// ===== Room Entry Flash (not used as separate cinematic — baked into HUD) =====
export function renderRoomFlash(ctx) {
  // Room flash is handled inline in renderHUD's roomFlashTimer section.
  // This export is here for architectural completeness if the orchestrator needs it.
}

// ===== Menu Background =====
export function renderMenuBg(ctx) {
  // Animated grid background
  ctx.fillStyle = '#050608';
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(0,221,255,0.04)';
  ctx.lineWidth = 1;
  let gridSize = 40;
  let offX = (gameTime * 10) % gridSize;
  let offY = (gameTime * 8) % gridSize;
  for (let x = -gridSize + offX; x < W + gridSize; x += gridSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = -gridSize + offY; y < H + gridSize; y += gridSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Floating particles
  ctx.fillStyle = 'rgba(0,221,255,0.15)';
  for (let i = 0; i < 30; i++) {
    let px = (Math.sin(gameTime * 0.3 + i * 2.1) * 0.5 + 0.5) * W;
    let py = (Math.cos(gameTime * 0.2 + i * 1.7) * 0.5 + 0.5) * H;
    let s = 1 + Math.sin(gameTime + i) * 0.5;
    ctx.beginPath(); ctx.arc(px, py, s, 0, Math.PI * 2); ctx.fill();
  }

  // Scan line effect
  let scanY = (gameTime * 50) % H;
  ctx.fillStyle = 'rgba(0,221,255,0.03)';
  ctx.fillRect(0, scanY, W, 2);

  // Vignette
  let vig = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.2, W / 2, H / 2, Math.sqrt(W * W + H * H) * 0.5);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.7)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
}

// ===== Combined cinematic overlay (called by renderer after HUD) =====
export function renderCinematics(ctx) {
  renderLevelIntro(ctx);
  renderEvacuationCinematic(ctx);
  renderBossIntro(ctx);
}
