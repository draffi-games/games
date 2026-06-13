# 🎮 KI Game Collection

Eine beeindruckende Sammlung von **39 KI-generierten HTML-Spielen**, die direkt im Browser gespielt werden können - keine Installation erforderlich!

## 🌐 Live Demo

Die Spiele sind über GitHub Pages verfügbar und können sofort gespielt werden. Der Launcher (`index.html`) ist das **GRID OS** - die zentrale Galerie mit Filter nach Kategorie und Suche.

## 📁 Projektstruktur

```
games/
├── index.html              # GRID OS - zentrale Galerie mit allen 39 Spielen
├── games/                  # Haupt-Spiele (eine Ebene tief)
│   ├── snake.html
│   ├── space-battle.html
│   ├── kingdom-defense.html
│   └── ... (weitere)
├── games/tron/             # Tron-Collection (zwei Ebenen tief)
│   ├── tron-3d-dual-arena-threejs.html
│   ├── disc-wars.html
│   ├── grid-puzzle.html
│   └── memory-grid.html
├── games/simulations/      # Simulationen (zwei Ebenen tief)
│   ├── ecosystem-simulator.html
│   ├── gravity-sandbox.html
│   └── ... (weitere)
├── games/void-protocol/    # VOID PROTOCOL - modulares Spiel mit eigenem Ordner
│   └── index.html
├── docs/                   # Dokumentation für ausgewählte Spiele
│   ├── snake.md
│   ├── kingdom-defense.md
│   ├── racing-circuit.md
│   └── void-protocol.md
├── .github/workflows/      # CI/CD Pipeline
│   └── deploy.yml
├── _config.yml             # GitHub Pages Konfiguration
├── CLAUDE.md               # AI-Entwicklungsrichtlinien
└── README.md               # Diese Datei
```

## 🎯 Verfügbare Spiele (39)

### 💥 Action (5)

- 🚀 **Space Battle Arena** - Intensiver 4v4 Weltraumkampf mit WASD-Steuerung und Schilden | [Spielen](games/space-battle.html)
- 🧟 **Zombie Waves** - Top-Down Shooter gegen Zombie-Wellen, baue Barrikaden | [Spielen](games/zombie-waves.html)
- 🎯 **VOID PROTOCOL** - Dungeon Crawler mit prozeduralen Leveln, 4 Androiden-Typen und Fog of War | [Spielen](games/void-protocol/index.html) | [Docs](docs/void-protocol.md)
- ⛏️ **Minecraft 3D** - Voxel-Welt zum Bauen, Erkunden und Überleben | [Spielen](games/minecraft3d.html)
- 💥 **Helldivers Stratego** - Taktischer Kampf mit Strategos und Airstrikes | [Spielen](games/helldivers-stratego.html)

### ♟️ Strategie (3)

- ⚔️ **AoE4 Battle Simulator** - Age of Empires 4 Kampfsimulator, 16 Fraktionen, KI-Counter | [Spielen](games/aoe4-battle-sim.html)
- 🛰️ **Space Command** - StarCraft-inspirierte Weltraum-RTS, Basen bauen | [Spielen](games/space-command.html)
- 🏰 **Kingdom Defense** - Tower Defense mit Bogenschützen, Kanonen und Magiern gegen 15 Wellen | [Spielen](games/kingdom-defense.html) | [Docs](docs/kingdom-defense.md)

### 🕹️ Arcade (10)

- 🐍 **Snake** - Das klassische Snake-Spiel, sammle Äpfel | [Spielen](games/snake.html) | [Docs](docs/snake.md)
- 🧱 **Brick Breaker** - Zerstöre Blöcke und sammle Power-Ups | [Spielen](games/brickbreaker.html)
- 🐦 **Flappy Bird** - Steuere den Vogel durch die Röhren | [Spielen](games/flappy-bird.html)
- 🐸 **Frogger Rush** - Überquere Straßen und springe auf Baumstämme | [Spielen](games/frogger-rush.html)
- 🟦 **Neon Tetris** - Tetris mit Cyberpunk-Look, Ghost-Piece und Glow-Effekte | [Spielen](games/neon-tetris.html)
- 🌿 **Territory Garden** - Paper.io-inspiriert, erobere Territorium als Pflanze | [Spielen](games/territory-garden.html)
- ⚽ **Penalty Shootout** - Elfmeterschießen, bezwinge den Torwart | [Spielen](games/penalty-shootout.html)
- 🏎️ **Racing Circuit** - Top-Down Rennspiel, 5 Runden auf dem Circuit | [Spielen](games/racing-circuit.html) | [Docs](docs/racing-circuit.md)
- 📚 **Das Geheimnis des Professors** - Rätselabenteuer in 5 Räumen | [Spielen](games/cipher-detective.html)
- 🎮 **Game Juice Demo** - Lerne Game Feel mit und ohne Juice-Effekte | [Spielen](games/game-juice-demo.html)

### 👥 Mehrspieler (5)

- ⚔️ **Jedi Stickman Arena** - Physik-basierter Lichtschwert-Kampf mit Ragdoll | [Spielen](games/jedi-stickman.html)
- 🏐 **Volleyball** - Volleyball für zwei Spieler mit realistischer Physik | [Spielen](games/volleyball.html)
- 🎯 **Maze Runner** - Zwei-Spieler Labyrinth-Rennen, WASD vs Pfeiltasten | [Spielen](games/maze-runner.html)
- ⛏️ **Asteroid Miners** - Kooperatives Weltraum-Mining für 2-4 Spieler | [Spielen](games/asteroid-miners.html)
- 🤼 **Sumo Bumpers** - Arena-Kampf für 2-4 Spieler auf schrumpfender Plattform | [Spielen](games/sumo-bumpers.html)

### 🔴 Tron (4)

Spiele auf dem Neon-Grid, inspiriert vom Tron-Universum:

- 🌟 **Tron: 3D Arena WebGL** - Ultimatives 3D-Tron mit Three.js, Light Cycles und Split-Screen | [Spielen](games/tron/tron-3d-dual-arena-threejs.html)
- 🟣 **Tron: Disc Wars** - Disc-basierte Tron-Arena, wirf deine Disc und weiche aus | [Spielen](games/tron/disc-wars.html)
- 🟦 **Tron: Grid Puzzle** - Puzzle auf dem Tron-Grid, Logik trifft Neon | [Spielen](games/tron/grid-puzzle.html)
- 🧠 **Tron: Memory Grid** - Memory-Spiel im Tron-Universum, finde die leuchtenden Paare | [Spielen](games/tron/memory-grid.html)

### 🔬 Simulationen (12)

- 🦠 **Bio-Sim: Mikrobiologie** - Beobachte Zellen, Bakterien und Immunzellen | [Spielen](games/bio-sim.html)
- 🧬 **Ecosystem Simulator** - NPC-basiertes Ökosystem mit Flocking und Predator-Prey | [Spielen](games/simulations/ecosystem-simulator.html)
- 🌌 **Gravity Sandbox** - Planeten erstellen, Gravitationsfelder und Orbits beobachten | [Spielen](games/simulations/gravity-sandbox.html)
- 🌊 **Wave Simulator** - Wellenmechanik mit Interferenz, Beugung und Reflexion | [Spielen](games/simulations/wave-simulator.html)
- ⚗️ **Periodensystem** - Alle 118 Elemente mit Details, filterbar nach Gruppen | [Spielen](games/simulations/periodic-table.html)
- 🧪 **Chemische Reaktionen** - Elemente mischen, Molekülstrukturen und Reaktionen sehen | [Spielen](games/simulations/chemical-reactions.html)
- 🎹 **Web Synthesizer** - Vollwertiger Synthesizer mit Oszillatoren, Filtern, ADSR und Sequencer | [Spielen](games/simulations/synthesizer.html)
- 🔊 **Frequency Lab** - Schallwellen und Frequenzen erforschen, Wellenformen visualisieren | [Spielen](games/simulations/frequency-lab.html)
- ⚡ **Circuit Builder** - Elektronische Schaltkreise bauen mit Widerständen, LEDs, Transistoren | [Spielen](games/simulations/circuit-builder.html)
- 🔧 **Logic Gate Simulator** - Digitale Logikschaltungen: AND, OR, NOT, XOR und mehr | [Spielen](games/simulations/logic-gates.html)
- 🪐 **Solar System Orrery** - Interaktives Sonnensystem mit korrekten Orbits | [Spielen](games/simulations/solar-system.html)
- ⛈️ **Weather System** - Wettersysteme simulieren: Hoch-/Tiefdruck, Wolken und Wind | [Spielen](games/simulations/weather-system.html)

## 🚀 GitHub Pages aktivieren

1. Gehe zu den Repository-Einstellungen
2. Scrolle zu "Pages"
3. Wähle unter "Source" → "Deploy from a branch"
4. Wähle "main" branch und "/ (root)" Ordner
5. Speichern und warten bis die Seite deployed ist

Die Spiele sind dann unter `https://draffi-games.github.io/games` erreichbar.

## 🎨 Neues Spiel hinzufügen

1. **HTML-Spiel erstellen**: Erstelle eine neue HTML-Datei im `games/` Ordner
   ```html
   games/meinspiel.html
   ```

2. **Back-Link einbauen**: Jedes Spiel braucht einen konsistenten Zurück-Link ins GRID OS.
   - Eine Ebene tief (`games/*.html`): `<a href="../index.html">← GRID OS</a>`
   - Zwei Ebenen tief (`games/tron/`, `games/simulations/`, `games/void-protocol/`): `<a href="../../index.html">← GRID OS</a>`

3. **Dokumentation erstellen** (optional): Erstelle eine Markdown-Datei im `docs/` Ordner
   ```markdown
   docs/meinspiel.md
   ```

4. **Zur Übersicht hinzufügen**: In `index.html` das neue Spiel zum `games`-Array hinzufügen:
   ```javascript
   {title:"Mein Spiel", desc:"Beschreibung", url:"games/meinspiel.html", icon:"🎮", tags:["arcade"]}
   ```

## 🛠 Technologie

- **Frontend**: HTML5, CSS3, JavaScript
- **Hosting**: GitHub Pages
- **Dokumentation**: Markdown mit Jekyll
- **Keine externen Abhängigkeiten**: Alle Spiele laufen standalone

## 📝 Features

- ✅ Responsive Design
- ✅ Vollbildmodus für viele Spiele
- ✅ Lokale Highscore-Speicherung
- ✅ Direkte Browser-Ausführung ohne Server
- ✅ Konsistente Navigation (← GRID OS) in jedem Spiel
- ✅ Automatisches Deployment über GitHub Pages

## 🤝 Beitragen

Du möchtest ein neues KI-generiertes Spiel hinzufügen? Großartig!

### Anforderungen für neue Spiele

- ✅ Standalone HTML-Datei (alle CSS/JS inline)
- ✅ Responsive Design (Mobile + Desktop)
- ✅ Konsistenter Back-Link ins GRID OS (siehe oben)
- ✅ Vollbildmodus-Support (wo sinnvoll)
- ✅ LocalStorage für Highscores/Settings
- ✅ Keyboard Controls (+ Touch wo sinnvoll)
- ✅ Error Handling (localStorage, Canvas, etc.)
- ✅ Keine `console.log` in Production
- ✅ Event Listener Cleanup beim Neustart

### Contribution Workflow

1. **Fork** das Repository
2. **Erstelle** dein Spiel (siehe [CLAUDE.md](CLAUDE.md) für Best Practices)
3. **Teste** lokal mit `python3 -m http.server 8000`
4. **Füge Dokumentation** hinzu (`docs/meinspiel.md`)
5. **Update** `index.html` (games-Array)
6. **Erstelle** einen Pull Request

Siehe [CLAUDE.md](CLAUDE.md) für detaillierte Code-Patterns und Best Practices!

## 📄 Lizenz

Dieses Projekt ist öffentlich und kann frei verwendet werden. Alle Spiele wurden mit KI generiert.

## 🔧 Technische Standards

- **Code Quality**: Event Listener Cleanup, Error Handling, kein Debug-Output
- **Performance**: Optimierte Dateigröße, effizientes Rendering
- **Accessibility**: ARIA-Labels, Keyboard-Navigation, Screen-Reader Support
- **CI/CD**: Automatische HTML-Validierung, Lighthouse Tests, Broken Link Checks

Weitere Details siehe [CLAUDE.md](CLAUDE.md)

---

**⭐ 39 Spiele | 🎮 100% Browser-basiert | 🚀 GitHub Pages | 🤖 KI-generiert**

*Alle Spiele in dieser Sammlung wurden mit Hilfe von KI (Claude) generiert und demonstrieren die Möglichkeiten moderner Web-Technologien.*
