---
layout: default
title: Snake Game
---

# 🐍 Snake Game

Ein klassisches Snake-Spiel, das direkt im Browser läuft. Gesteuert wird mit den Pfeiltasten oder WASD.

## Spielbeschreibung

Snake ist ein Arcade-Klassiker, bei dem du eine Schlange steuerst, die immer länger wird, je mehr Äpfel sie frisst. Das Ziel ist es, so viele Äpfel wie möglich zu sammeln, ohne in die Wand oder in deinen eigenen Körper zu krachen.

## Features

- **Responsive Design**: Passt sich an verschiedene Bildschirmgrößen an
- **High Score**: Dein Highscore wird lokal gespeichert
- **Pause-Funktion**: Das Spiel kann jederzeit pausiert werden
- **Vollbildmodus**: Für ein immersives Spielerlebnis
- **Moderne Grafik**: Saubere, moderne Optik mit Farbverläufen

## Steuerung

- **Pfeiltasten** oder **WASD**: Bewegung der Schlange
- **Leertaste**: Pause/Fortsetzen
- **Start-Button**: Spiel starten
- **Reset-Button**: Spiel zurücksetzen

## Spielregeln

1. Die Schlange bewegt sich kontinuierlich in die gewählte Richtung
2. Sammle rote Äpfel, um Punkte zu erhalten und zu wachsen
3. Vermeide es, in Wände oder deinen eigenen Körper zu fahren
4. Je länger die Schlange wird, desto schwieriger wird das Spiel

## Tipps & Tricks

- Plane deine Bewegungen voraus, besonders wenn die Schlange länger wird
- Nutze den gesamten Spielbereich aus
- Vermeide es, dich in Ecken zu manövrieren
- Die Schlange kann nicht direkt rückwärts fahren

## Spiel starten

<div style="margin: 30px 0;">
    <button onclick="openGame()" style="
        padding: 15px 30px;
        font-size: 18px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 30px;
        cursor: pointer;
        transition: transform 0.2s;
    ">🎮 Spiel im neuen Tab öffnen</button>
    
    <button onclick="toggleFullscreen()" style="
        padding: 15px 30px;
        font-size: 18px;
        margin-left: 10px;
        background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
        color: white;
        border: none;
        border-radius: 30px;
        cursor: pointer;
        transition: transform 0.2s;
    ">⛶ Vollbild spielen</button>
</div>

## Eingebettetes Spiel

<div id="gameContainer" style="
    width: 100%;
    max-width: 800px;
    margin: 30px auto;
    border: 3px solid #667eea;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
">
    <iframe 
        id="gameFrame"
        src="../games/snake.html" 
        style="
            width: 100%;
            height: 700px;
            border: none;
        "
        title="Snake Game">
    </iframe>
</div>

<script>
function openGame() {
    window.open('../games/snake.html', '_blank');
}

function toggleFullscreen() {
    const iframe = document.getElementById('gameFrame');
    const container = document.getElementById('gameContainer');
    
    if (!document.fullscreenElement) {
        container.requestFullscreen().then(() => {
            iframe.style.height = '100vh';
        });
    } else {
        document.exitFullscreen().then(() => {
            iframe.style.height = '700px';
        });
    }
}

// ESC zum Verlassen des Vollbildmodus
document.addEventListener('fullscreenchange', () => {
    const iframe = document.getElementById('gameFrame');
    if (!document.fullscreenElement) {
        iframe.style.height = '700px';
    }
});
</script>

## Technische Details

- **Technologie**: Reines HTML5, CSS3 und JavaScript
- **Canvas API**: Für die Spielgrafik
- **LocalStorage**: Für die Highscore-Speicherung
- **Keine externen Abhängigkeiten**: Läuft komplett standalone

## Credits

Dieses Spiel wurde mit Hilfe von KI generiert und ist ein Beispiel für die Möglichkeiten moderner Web-Technologien.

---

[← Zurück zur Spieleübersicht](../index.html)