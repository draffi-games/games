# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a collection of AI-generated HTML games that run directly in the browser and are served via GitHub Pages. Each game is a standalone HTML file with embedded CSS and JavaScript, requiring no build process or external dependencies.

## Key Commands

### Local Development
```bash
# Start local development server
python3 -m http.server 8000
# Then open http://localhost:8000 in browser

# Alternative with Node.js if available
npx http-server -p 8000
```

### Deployment
```bash
# Changes pushed to main branch automatically deploy via GitHub Actions
git add .
git commit -m "Your message here"
git push origin main
```

## Architecture

### File Structure
- `index.html` - Main gallery page displaying all games as cards
- `games/` - Contains standalone HTML game files
- `docs/` - Markdown documentation for each game with iframe embedding
- `_config.yml` - Jekyll configuration for GitHub Pages
- `.github/workflows/deploy.yml` - GitHub Actions workflow for automatic deployment

### Adding New Games

1. **Create Game File**: Add a self-contained HTML file to `games/[gamename].html`
   - Must include all CSS and JavaScript inline
   - Should support fullscreen mode
   - Should have a back link to index.html
   - Use localStorage for persistent data (scores, settings)

2. **Create Documentation**: Add `docs/[gamename].md` with:
   - Game description and rules
   - Embedded iframe pointing to `../games/[gamename].html`
   - Fullscreen button functionality
   - Controls and tips

3. **Update Gallery**: Modify the `games` array in `index.html`:
   ```javascript
   {
       title: "Game Name",
       description: "Brief description",
       url: "games/[gamename].html",
       icon: "🎮"  // Emoji icon for the card
   }
   ```

## Game Development Guidelines

### Required Features for Each Game
- Responsive design that works on mobile and desktop
- Keyboard controls (and touch controls where applicable)
- Visual feedback for user actions
- Clear game over/win conditions
- Score tracking (optional but recommended)

### Common Patterns

**Fullscreen Toggle:**
```javascript
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}
```

**LocalStorage for High Scores:**
```javascript
// Save
localStorage.setItem('gameNameHighScore', score);
// Load
const highScore = localStorage.getItem('gameNameHighScore') || 0;
```

**Game Loop Pattern:**
```javascript
let gameRunning = false;
let gameLoop;

function startGame() {
    gameRunning = true;
    gameLoop = setInterval(update, 100);
}

function stopGame() {
    gameRunning = false;
    clearInterval(gameLoop);
}
```

**Event Listener Cleanup Pattern (IMPORTANT - Prevents Memory Leaks):**
```javascript
// Event Manager Class
class EventManager {
    constructor() {
        this.listeners = [];
    }

    add(element, event, handler, options) {
        element.addEventListener(event, handler, options);
        this.listeners.push({ element, event, handler, options });
    }

    removeAll() {
        this.listeners.forEach(({ element, event, handler, options }) => {
            element.removeEventListener(event, handler, options);
        });
        this.listeners = [];
    }
}

// Usage in game
const eventManager = new EventManager();

function initGame() {
    // Add listeners through event manager
    eventManager.add(canvas, 'click', handleClick);
    eventManager.add(window, 'keydown', handleKeyDown);
    eventManager.add(window, 'resize', handleResize);
}

function resetGame() {
    // Clean up all listeners before re-initializing
    eventManager.removeAll();
    // Reset game state...
    initGame();
}
```

**Debug Mode Pattern (No console.log in Production):**
```javascript
// At top of script
const DEBUG = false;

if (!DEBUG) {
    const noop = () => {};
    console.log = noop;
    console.warn = noop;
    console.info = noop;
    // Keep console.error for critical issues
}

// Now all console.log will be silent in production
console.log("This won't show when DEBUG = false");
```

**Safe LocalStorage Access (Error Handling):**
```javascript
function safeGetItem(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item !== null ? item : defaultValue;
    } catch (error) {
        console.error('LocalStorage not available:', error);
        return defaultValue;
    }
}

function safeSetItem(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (error) {
        console.error('LocalStorage not available:', error);
        return false;
    }
}

// Usage
const highScore = parseInt(safeGetItem('gameHighScore', '0'));
safeSetItem('gameHighScore', newScore.toString());
```

**Safe Canvas Context:**
```javascript
function initCanvas() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return null;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Canvas 2D context not available');
        return null;
    }

    return { canvas, ctx };
}

// Usage
const canvasSetup = initCanvas();
if (!canvasSetup) {
    alert('Your browser does not support Canvas. Please use a modern browser.');
    return;
}
const { canvas, ctx } = canvasSetup;
```

## GitHub Pages Configuration

The site automatically deploys when changes are pushed to the main branch. The GitHub Actions workflow handles:
1. Building with Jekyll
2. Uploading artifacts
3. Deploying to GitHub Pages

URL structure after deployment:
- Main page: `https://[username].github.io/games/`
- Individual games: `https://[username].github.io/games/games/[gamename].html`
- Documentation: `https://[username].github.io/games/docs/[gamename]`

## Important Notes

- All games must be self-contained HTML files with no external dependencies
- Games should work offline once loaded
- Avoid using CDNs or external resources
- Keep file sizes reasonable (ideally under 100KB per game)
- Test games locally before pushing to ensure they work standalone