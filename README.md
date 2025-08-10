# KI Game Collection

Eine Sammlung von KI-generierten HTML-Spielen, die direkt im Browser gespielt werden können.

## 🎮 Live Demo

Die Spiele sind über GitHub Pages verfügbar: https://draffi-games.github.io/games

## 📁 Projektstruktur

```
games/
├── index.html          # Hauptseite mit Spieleübersicht
├── games/              # Ordner mit den HTML-Spielen
│   └── snake.html      # Snake-Spiel
├── docs/               # Dokumentation für jedes Spiel
│   └── snake.md        # Snake Spielbeschreibung mit Einbindung
├── _config.yml         # GitHub Pages Konfiguration
└── README.md           # Diese Datei
```

## 🎯 Verfügbare Spiele

### [🐍 Snake](docs/snake.md)
Das klassische Snake-Spiel - sammle Äpfel und werde länger! Gesteuert wird mit den Pfeiltasten oder WASD.

- **Features**: Highscore, Pause-Funktion, Vollbildmodus
- **Steuerung**: Pfeiltasten/WASD, Leertaste für Pause
- [Direkt spielen](games/snake.html) | [Dokumentation](docs/snake.md)

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

Du möchtest ein neues KI-generiertes Spiel hinzufügen? 

1. Fork das Repository
2. Erstelle dein Spiel (HTML-Datei)
3. Füge Dokumentation hinzu (Markdown-Datei)
4. Erstelle einen Pull Request

## 📄 Lizenz

Dieses Projekt ist öffentlich und kann frei verwendet werden. Alle Spiele wurden mit KI generiert.

## 🔗 Links

- [Spielesammlung](https://draffi-games.github.io/games)
- [GitHub Repository](https://github.com/draffi-games/games)

---

*Alle Spiele in dieser Sammlung wurden mit Hilfe von KI generiert und demonstrieren die Möglichkeiten moderner Web-Technologien.*
