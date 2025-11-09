# 🎮 KI Game Collection

Eine beeindruckende Sammlung von **29 KI-generierten HTML-Spielen** (23 Hauptspiele + 6 TRON: Ares Spiele), die direkt im Browser gespielt werden können - keine Installation erforderlich!

## 🌐 Live Demo

Die Spiele sind über GitHub Pages verfügbar und können sofort gespielt werden.

## 📁 Projektstruktur

```
games/
├── index.html          # Hauptgalerie mit 23 Spielen
├── tron-index.html     # TRON: Ares Untergalerie
├── games/              # Ordner mit den Haupt-Spielen
│   ├── snake.html
│   ├── jedi-stickman.html
│   ├── space-battle.html
│   └── ... (20 weitere)
├── games/tron/         # TRON: Ares Collection
│   ├── light-cycle-racing.html
│   ├── disc-wars.html
│   └── ... (4 weitere)
├── docs/               # Dokumentation für Spiele
│   ├── snake.md
│   ├── chain_run_ketten_jumpnrun_chat_canvas.md
│   ├── kingdom-defense.md
│   └── racing-circuit.md
├── .github/workflows/  # CI/CD Pipeline
│   └── deploy.yml
├── _config.yml         # GitHub Pages Konfiguration
├── CLAUDE.md           # AI-Entwicklungsrichtlinien
└── README.md           # Diese Datei
```

## 🎯 Verfügbare Spiele

### 🏆 Hauptgalerie (23 Spiele)

**Klassiker & Arcade**
- 🐍 **Snake** - Das klassische Snake-Spiel | [Spielen](games/snake.html) | [Docs](docs/snake.md)
- 🐸 **Frogger Rush** - Überquere die Straße und den Fluss | [Spielen](games/frogger-rush.html)
- 🐦 **Flappy Bird** - Fliege durch die Röhren | [Spielen](games/flappy-bird.html)
- 🧱 **Brick Breaker** - Zerstöre alle Blöcke | [Spielen](games/brickbreaker.html)
- 🟦 **Neon Tetris** - Klassisches Tetris mit Neon-Style | [Spielen](games/neon-tetris.html)

**Action & Kampf**
- ⚔️ **Jedi Stickman Arena** - Physics-basierter Lichtschwert-Kampf | [Spielen](games/jedi-stickman.html)
- 🛡️ **Shield Siege** - Verteidigungsspiel mit Strategie | [Spielen](games/shield-siege.html)
- 🧟 **Zombie Waves** - Überlebe die Zombie-Wellen | [Spielen](games/zombie-waves.html)
- ⚡ **Blitz Battle** - Schnelles Action-Spiel | [Spielen](games/blitz-battle.html)
- 🎯 **Penalty Shootout** - Fußball-Elfmeterschießen | [Spielen](games/penalty-shootout.html)
- 🏐 **Volleyball** - 2-Spieler Volleyball | [Spielen](games/volleyball.html)

**Strategie & Tower Defense**
- 🏰 **Kingdom Defense** - Tower Defense Strategie | [Spielen](games/kingdom-defense.html) | [Docs](docs/kingdom-defense.md)
- 🚀 **Helldivers Strategy** - Taktisches Strategiespiel | [Spielen](games/helldivers-strategy.html)
- 🎖️ **Helldivers Stratego** - Erweiterte Strategie-Version | [Spielen](games/helldivers-stratego.html)

**Weltraum & Sci-Fi**
- 🛸 **Space Battle Arena** - Massive Weltraumschlachten | [Spielen](games/space-battle.html)
- 🚀 **Space Command** - Weltraum-Kommando-Strategie | [Spielen](games/space-command.html)
- 🚀 **Rocket Duel** - 2-Spieler Raketen-Duell | [Spielen](games/rocket-duel.html)

**Rätsel & Puzzle**
- 🔐 **Cipher Detective** - Entschlüssele Codes | [Spielen](games/cipher-detective.html)
- 🧩 **Maze Runner** - Finde den Ausweg | [Spielen](games/maze-runner.html)
- 🎮 **Maze 3D** - 3D Labyrinth-Erkundung | [Spielen](games/maze3d.html)

**Rennen & Racing**
- 🏎️ **Racing Circuit** - Top-Down Racing | [Spielen](games/racing-circuit.html) | [Docs](docs/racing-circuit.md)

**Plattformer & Jump'n'Run**
- 🔗 **Chain Run** - Ketten-basiertes Jump'n'Run | [Spielen](games/chain_run_ketten_jumpnrun_chat_canvas.html) | [Docs](docs/chain_run_ketten_jumpnrun_chat_canvas.md)

**3D & Sandbox**
- ⛏️ **Minecraft 3D** - Voxel-basierter 3D-Builder | [Spielen](games/minecraft3d.html)

---

### 🔴 TRON: Ares Collection (6 Spiele)

Exklusive TRON-themed Spiele inspiriert vom kommenden Film **TRON: Ares**:

- 🏍️ **Light Cycle Racing** - Klassisches Light Cycle Duell
- 💿 **Disc Wars** - Identity Disc Kampfarena
- 🟦 **TRON Tetris** - Tetris im Grid-Style
- 🧠 **Memory Grid** - Memory-Spiel auf dem Grid
- 🧩 **Grid Puzzle** - Puzzle-Herausforderung
- 🐍 **TRON Snake** - Snake im TRON-Universe

👉 [Zur TRON Gallery](tron-index.html)

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

2. **Dokumentation erstellen**: Erstelle eine Markdown-Datei im `docs/` Ordner
   ```markdown
   docs/meinspiel.md
   ```
   
3. **Spiel einbinden**: In der Markdown-Datei das Spiel mit iframe einbinden:
   ```html
   <iframe src="../games/meinspiel.html" width="100%" height="700px"></iframe>
   ```

4. **Zur Übersicht hinzufügen**: In `index.html` das neue Spiel zur Liste hinzufügen:
   ```javascript
   {
       title: "Mein Spiel",
       description: "Beschreibung",
       url: "games/meinspiel.html",
       icon: "🎮"
   }
   ```

## 🛠 Technologie

- **Frontend**: HTML5, CSS3, JavaScript
- **Hosting**: GitHub Pages
- **Dokumentation**: Markdown mit Jekyll
- **Keine externen Abhängigkeiten**: Alle Spiele laufen standalone

## 📝 Features

- ✅ Responsive Design
- ✅ Vollbildmodus für alle Spiele
- ✅ Lokale Highscore-Speicherung
- ✅ Direkte Browser-Ausführung ohne Server
- ✅ Markdown-Dokumentation für jedes Spiel
- ✅ Automatisches Deployment über GitHub Pages

## 🤝 Beitragen

Du möchtest ein neues KI-generiertes Spiel hinzufügen? Großartig!

### Anforderungen für neue Spiele

- ✅ Standalone HTML-Datei (alle CSS/JS inline)
- ✅ Responsive Design (Mobile + Desktop)
- ✅ Dateigröße < 100KB (für schnelles Laden)
- ✅ Vollbildmodus-Support
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
5. **Update** `index.html` (game array)
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

**⭐ 29 Spiele | 🎮 100% Browser-basiert | 🚀 GitHub Pages | 🤖 KI-generiert**

*Alle Spiele in dieser Sammlung wurden mit Hilfe von KI (Claude) generiert und demonstrieren die Möglichkeiten moderner Web-Technologien.*
