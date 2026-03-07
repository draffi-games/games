# Game Juice Enhancement System - Design Document

## Date: 2026-03-07

## Goal
Polish all 23 browser games with professional "Game Juice" effects and visual improvements.

## Three Pillars

### 1. Game Juice Kit (Inline Library)
Reusable JS classes that get inlined into each game:
- **ScreenShake**: Decay-based camera shake on impacts
- **ParticleSystem**: Burst, trail, ambient particles with configurable colors
- **TweenEngine**: Elastic, bounce, cubic easing for smooth animations
- **SoundSynth**: Web Audio API synthesizer (no external files)
- **PostFX**: Canvas glow/bloom via shadow, color grading

### 2. Visual Polish per Game
Each game receives:
- Screen shake on collisions/impacts
- Particle bursts on scoring/destruction
- Tweened UI animations (score pop, health flash)
- Improved color palette (HSB-harmonized)
- Better typography (distinctive, not generic)
- Glow/bloom effects on key elements
- Smooth state transitions

### 3. Quality Standards
- Files remain self-contained HTML (no external deps)
- Target under 150KB per game
- Follow CLAUDE.md patterns (EventManager, DEBUG, safe localStorage)
- Maintain existing gameplay mechanics
- Keep responsive design working

## Agent Deployment (10 Clone Troopers)

| Agent | Assignment |
|-------|-----------|
| CT-01 | Game Juice Kit reference + demo page |
| CT-02 | zombie-waves, space-battle |
| CT-03 | neon-tetris, brickbreaker |
| CT-04 | flappy-bird, snake |
| CT-05 | racing-circuit, frogger-rush |
| CT-06 | sumo-bumpers, volleyball, penalty-shootout |
| CT-07 | maze-runner, jedi-stickman |
| CT-08 | asteroid-miners, space-command |
| CT-09 | kingdom-defense, helldivers-stratego, aoe4-battle-sim |
| CT-10 | void-protocol, minecraft3d, territory-garden, bio-sim, cipher-detective |
