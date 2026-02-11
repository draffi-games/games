# KI Game Collection - Design System

A unified design reference for all gallery pages and game UIs in the collection.

---

## Color Palette

### Core Background Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-void` | `#000000` | Pure black, TRON backgrounds |
| `--bg-deep` | `#0a0a0f` | Primary dark background |
| `--bg-space` | `#001122` | Secondary/panel backgrounds |
| `--bg-card` | `rgba(20, 20, 30, 0.95)` | Card surfaces |
| `--bg-card-hover` | `rgba(0, 68, 102, 0.5)` | Card hover state |

### Theme Accent Colors

#### Starship Command (Main Gallery)
| Token | Value | Usage |
|-------|-------|-------|
| `--accent-cyan` | `#00ffff` | Primary interactive elements, titles |
| `--accent-orange` | `#ff6600` | Warning states, secondary accents |
| `--accent-green` | `#00ff00` | Success, active states |
| `--accent-red` | `#ff0000` | Critical alerts, errors |

#### TRON Gallery
| Token | Value | Usage |
|-------|-------|-------|
| `--tron-red` | `#FF0000` | Dillinger theme |
| `--tron-green` | `#00FF41` | ENCOM theme |
| `--tron-blue` | `#00D9FF` | Flynn theme |

#### Strategy Gallery
| Token | Value | Usage |
|-------|-------|-------|
| `--strategy-gold` | `#c9a227` | Primary accent |
| `--strategy-accent` | `#d4af37` | Secondary gold |
| `--strategy-brown` | `#8b4513` | Warm secondary |

#### Simulations Gallery
| Token | Value | Usage |
|-------|-------|-------|
| `--sim-purple` | `#667eea` | Primary accent |
| `--sim-violet` | `#764ba2` | Secondary accent |
| `--sim-emerald` | `#10b981` | Success / available |

### Semantic Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--color-success` | `#00ff00` / `#228b22` | Active, available, online |
| `--color-warning` | `#ff6600` / `#f59e0b` | Caution, reduced capacity |
| `--color-danger` | `#ff0000` / `#dc143c` | Critical, error, offline |
| `--color-info` | `#00D9FF` | Informational highlights |

### Text Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--text-primary` | `#ffffff` | Headings, primary text |
| `--text-secondary` | `#cccccc` / `#e0e0e0` | Body text |
| `--text-muted` | `#888888` | Subtle labels, metadata |
| `--text-disabled` | `#555555` | Disabled elements |

---

## Typography

### Font Families
| Name | Stack | Usage |
|------|-------|-------|
| **Monospace** | `'Courier New', monospace` | Main gallery, code-like UI |
| **Display** | `'Orbitron', monospace` | TRON headers, futuristic titles |
| **UI** | `'Rajdhani', monospace` | TRON body text, subtitles |
| **System** | `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif` | Strategy & Simulation galleries |

### Font Scale
| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| **Hero** | `clamp(2.5rem, 8vw, 5rem)` | 900 | Logo, hero titles |
| **H1** | `clamp(2rem, 6vw, 4rem)` | 700 | Page titles |
| **H2** | `36px` / `2.25rem` | 700 | Section headers |
| **H3** | `24px` / `1.5rem` | 700 | Card titles |
| **Body** | `16px` / `1rem` | 400 | Body text |
| **Small** | `14px` / `0.875rem` | 400 | Tab labels, status text |
| **Micro** | `12px` / `0.75rem` | 400 | Tags, metadata, fine print |
| **Nano** | `10px` / `0.625rem` | 400 | Compact card descriptions |

### Letter Spacing
| Level | Value | Usage |
|-------|-------|-------|
| **Tight** | `0.05em` | Body text |
| **Normal** | `0.1em` | Buttons, labels |
| **Wide** | `0.15em` | Navigation, uppercase text |
| **Ultra** | `0.3em` | Subtitles, taglines |

---

## Spacing System

Based on an 8px grid with a 4px half-step:

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `4px` | Minimal gaps |
| `--space-2` | `8px` | Tight element spacing |
| `--space-3` | `12px` | Card padding (compact) |
| `--space-4` | `16px` / `1rem` | Standard element spacing |
| `--space-5` | `20px` | Card padding (normal) |
| `--space-6` | `24px` | Section gaps |
| `--space-8` | `32px` / `2rem` | Section padding, container padding |
| `--space-12` | `48px` / `3rem` | Header padding |
| `--space-16` | `64px` / `4rem` | Major section spacing |

---

## Animation System

### Timing Tokens
| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `--duration-instant` | `100ms` | - | Opacity flashes |
| `--duration-fast` | `200ms` | `ease` | Button hovers, micro-interactions |
| `--duration-normal` | `300ms` | `ease` | Card transitions, general |
| `--duration-slow` | `500ms` | `ease` | Page transitions, overlays |
| `--duration-dramatic` | `800ms` | `ease-out` | Loading screens, reveals |
| `--duration-ambient` | `2000ms+` | `ease-in-out` | Background animations |

### Easing Functions
| Name | Value | Usage |
|------|-------|-------|
| `--ease-standard` | `ease` | General purpose |
| `--ease-in-out` | `ease-in-out` | Ambient, looping |
| `--ease-out` | `ease-out` | Elements entering |
| `--ease-bounce` | `cubic-bezier(0.68, -0.55, 0.265, 1.55)` | Playful interactions |
| `--ease-smooth` | `cubic-bezier(0.4, 0, 0.2, 1)` | Material-inspired |

### Standard Animations

#### Page Load Fade-In
```css
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
/* Usage: animation: fadeIn 0.5s ease forwards; */
```

#### Card Reveal (Staggered)
```css
@keyframes cardReveal {
    from {
        opacity: 0;
        transform: translateY(30px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}
/* Usage: animation: cardReveal 0.5s ease forwards;
   Stagger with: animation-delay: calc(var(--card-index) * 80ms); */
```

#### Glow Pulse
```css
@keyframes glowPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}
/* Usage: animation: glowPulse 2s ease-in-out infinite; */
```

#### Slide Up Enter
```css
@keyframes slideUpEnter {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

#### Spin (Loaders)
```css
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
```

#### Shimmer (Loading Placeholder)
```css
@keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}
/* Usage on element:
   background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%);
   background-size: 200% 100%;
   animation: shimmer 1.5s infinite; */
```

---

## Component Patterns

### Game Card

Standard card structure used across all galleries:

```html
<article class="game-card" role="listitem" tabindex="0">
    <div class="game-icon">EMOJI</div>
    <h3 class="game-title">Game Name</h3>
    <p class="game-description">Description text</p>
</article>
```

#### Card States
| State | Border | Background | Transform |
|-------|--------|------------|-----------|
| Default | `1px solid var(--border-color)` | Semi-transparent dark | none |
| Hover | `1px solid var(--accent)` | Slightly brighter | `translateY(-5px)` to `translateY(-10px)` |
| Focus | Same as hover + outline | Same as hover | Same as hover |
| Active/Click | Accent border + glow | Accent tint | `scale(0.98)` |

#### Card Hover Glow
```css
.game-card:hover {
    border-color: var(--accent);
    box-shadow: 0 0 10px var(--accent), 0 0 20px var(--accent);
    transform: translateY(-5px);
}
```

### Navigation Button

```css
.nav-link {
    display: inline-block;
    padding: 1rem 2rem;
    background: rgba(0, 0, 0, 0.6);
    border: 2px solid var(--accent);
    color: var(--accent);
    text-decoration: none;
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 0.15em;
    transition: all 0.3s ease;
}

.nav-link:hover {
    background: var(--accent);
    color: #000;
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(var(--accent-rgb), 0.3);
}
```

### Loading Screen

A shared loading screen pattern for all galleries:

```html
<div class="page-loading" id="pageLoading">
    <div class="loading-content">
        <div class="loading-title">LOADING TEXT</div>
        <div class="loading-bar">
            <div class="loading-bar-fill"></div>
        </div>
    </div>
</div>
```

```css
.page-loading {
    position: fixed;
    inset: 0;
    background: var(--bg-deep);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 1;
    transition: opacity 0.5s ease;
}

.page-loading.hidden {
    opacity: 0;
    pointer-events: none;
}

.loading-bar {
    width: 300px;
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
    margin-top: 1.5rem;
}

.loading-bar-fill {
    height: 100%;
    width: 0%;
    background: var(--accent);
    box-shadow: 0 0 10px var(--accent);
    transition: width 0.3s ease;
}
```

### Game Launch Transition

An overlay that appears when clicking a game card, creating a smooth transition:

```css
.game-launch-overlay {
    position: fixed;
    inset: 0;
    background: var(--bg-deep);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
}

.game-launch-overlay.active {
    opacity: 1;
    pointer-events: all;
}

.launch-icon {
    font-size: 4rem;
    animation: glowPulse 1s ease-in-out infinite;
    margin-bottom: 1rem;
}

.launch-text {
    font-size: 1.2rem;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: var(--accent);
}
```

### Footer

Consistent footer pattern across galleries:

```html
<footer class="gallery-footer">
    <div class="footer-content">
        <p class="footer-status">STATUS LINE TEXT</p>
        <p class="footer-credit">KI Game Collection</p>
    </div>
</footer>
```

```css
.gallery-footer {
    text-align: center;
    padding: 3rem 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    margin-top: 4rem;
    color: var(--text-muted);
    font-size: 0.9rem;
}

.footer-credit {
    margin-top: 1rem;
    opacity: 0.5;
    font-size: 0.8rem;
}
```

---

## Glow & Shadow System

### Text Glow
```css
/* Subtle glow */
text-shadow: 0 0 10px var(--accent);

/* Medium glow */
text-shadow:
    0 0 7px var(--white),
    0 0 10px var(--white),
    0 0 21px var(--white),
    0 0 42px var(--accent);

/* Intense TRON glow */
text-shadow:
    0 0 7px var(--white),
    0 0 10px var(--white),
    0 0 21px var(--white),
    0 0 42px var(--accent),
    0 0 82px var(--accent),
    0 0 92px var(--accent),
    0 0 102px var(--accent),
    0 0 151px var(--accent);
```

### Box Glow
```css
/* Subtle */
box-shadow: 0 0 10px var(--accent);

/* Medium */
box-shadow: 0 0 10px var(--accent), 0 0 20px var(--accent);

/* Intense */
box-shadow:
    0 0 20px var(--accent),
    0 0 40px var(--accent),
    0 0 60px var(--accent);
```

### Elevation Shadows
```css
/* Card resting */
box-shadow: none;

/* Card hover */
box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 30px rgba(var(--accent-rgb), 0.2);

/* Floating element */
box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(var(--accent-rgb), 0.3);
```

---

## Responsive Breakpoints

| Name | Width | Usage |
|------|-------|-------|
| **Mobile** | `max-width: 768px` | Single column, reduced padding |
| **Tablet** | `max-width: 900px` | Hide side panels, 2-column grid |
| **Desktop** | `max-width: 1200px` | Narrow side panels |
| **Wide** | `max-width: 1400px` | 3-column game grid |
| **Full** | `> 1400px` | 4-column grid, max content width |

### Responsive Grid Columns
```css
/* Default: 4 columns */
grid-template-columns: repeat(4, 1fr);

/* < 1400px: 3 columns */
grid-template-columns: repeat(3, 1fr);

/* < 900px: 2 columns */
grid-template-columns: repeat(2, 1fr);

/* < 768px: 1 column */
grid-template-columns: 1fr;

/* Auto-fit alternative (sub-galleries) */
grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
```

---

## Accessibility

### Reduced Motion
Every gallery MUST include this at the end of its `<style>` block:

```css
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
}
```

### Focus Indicators
All interactive elements must have visible focus styles:

```css
.game-card:focus-visible,
.nav-link:focus-visible,
button:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 4px;
}
```

### Contrast Requirements
- Text on dark backgrounds: minimum `#888888` on `#0a0a0f` (ratio ~5.5:1)
- Interactive elements: accent colors on dark provide sufficient contrast
- Glow effects are decorative only, not relied upon for readability

### ARIA Patterns
- Game grids use `role="list"` with `role="listitem"` on cards
- Cards use `tabindex="0"` and keyboard navigation (Enter/Space)
- Category tabs use `role="tablist"` and `role="tab"`
- Background decorations use `aria-hidden="true"`

---

## Inline Implementation Notes

Since all files must be self-contained HTML with no external dependencies (except optional Google Fonts), all CSS and JS patterns documented here are designed to be copy-pasted inline into each file's `<style>` and `<script>` blocks.

### CSS Custom Properties Template
Place at the top of each file's `<style>` block, selecting the theme-appropriate values:

```css
:root {
    /* Background */
    --bg-deep: #0a0a0f;
    --bg-card: rgba(20, 20, 30, 0.95);

    /* Theme Accent (pick per gallery) */
    --accent: #00ffff;
    --accent-rgb: 0, 255, 255;

    /* Text */
    --text-primary: #ffffff;
    --text-secondary: #cccccc;
    --text-muted: #888888;

    /* Spacing */
    --space-2: 8px;
    --space-4: 16px;
    --space-6: 24px;
    --space-8: 32px;

    /* Animation */
    --duration-fast: 200ms;
    --duration-normal: 300ms;
    --duration-slow: 500ms;
}
```
