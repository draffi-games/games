---
layout: default
title: Chain Run
---

# ⛓️ Chain Run

Ein kooperatives Jump'n'Run-Spiel, bei dem zwei Spieler durch eine Kette verbunden sind und gemeinsam Hindernisse überwinden müssen.

## Spielbeschreibung

Chain Run ist ein innovatives Plattformspiel, das Teamwork erfordert. Zwei Charaktere - blau und orange - sind durch eine physikalische Kette verbunden. Diese Verbindung macht das Spiel zu einer einzigartigen Herausforderung, da beide Spieler ihre Bewegungen koordinieren müssen, um erfolgreich zu sein.

## Features

- **Physik-basierte Kettenmechanik**: Realistische Seilphysik verbindet beide Spieler
- **Kooperatives Gameplay**: Beide Spieler müssen zusammenarbeiten
- **Ankerpunkte**: Strategische Punkte zum Befestigen der Kette
- **Bewegliche Plattformen**: Dynamische Level-Elemente
- **Schalter und Tore**: Puzzle-Elemente die Teamwork erfordern
- **Drei unterschiedliche Welten**: Wiese, Höhle und Raumstation

## Steuerung

### Keyboard
- **A / ←**: Nach links bewegen
- **D / →**: Nach rechts bewegen  
- **W / ↑ / Leertaste**: Springen
- **E**: Kette an Ankerpunkt befestigen/lösen
- **R**: Level neu starten

### Touch (Mobile)
- Nutze die On-Screen-Buttons zum Bewegen und Springen
- Tippe auf den Ketten-Button für Ankerpunkte

## Spielmechanik

### Die Kette
- Die Kette hat eine maximale Länge und zieht die Spieler zusammen
- Nutze die Ketten-Physik für Schwung und kreative Lösungen
- Die Kette kann an blauen Ankerpunkten befestigt werden

### Ankerpunkte
- Blaue Kreise im Level sind Ankerpunkte
- Drücke E in der Nähe eines Ankerpunkts um die Kette zu befestigen
- Dies ermöglicht neue Bewegungsmuster und Lösungswege

### Level-Ziele
1. **Schalter aktivieren** (gelb/orange): Öffnet das rote Tor
2. **Tor passieren**: Nachdem der Schalter aktiviert wurde
3. **Ziel erreichen** (grün): Beide Spieler müssen das Ziel erreichen

## Tipps & Tricks

- **Momentum nutzen**: Schwinge einen Spieler, um schwierige Sprünge zu schaffen
- **Ankerpunkte strategisch nutzen**: Sie ermöglichen größere Distanzen zwischen den Spielern
- **Timing ist wichtig**: Besonders bei beweglichen Plattformen
- **Kommunikation**: Bei zwei Spielern ist Absprache der Schlüssel zum Erfolg

## Level-Übersicht

### Level 1: Wiese
Ein sonniges Einführungslevel mit grundlegenden Mechaniken.

### Level 2: Höhle  
Dunklere Atmosphäre mit beweglichen Plattformen und mehr Herausforderungen.

### Level 3: Raumstation
Sci-Fi-Setting mit komplexeren Puzzle-Elementen.

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
    max-width: 900px;
    margin: 30px auto;
    border: 3px solid #667eea;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
">
    <iframe 
        id="gameFrame"
        src="../games/chain_run_ketten_jumpnrun_chat_canvas.html" 
        style="
            width: 100%;
            height: 700px;
            border: none;
        "
        title="Chain Run Game">
    </iframe>
</div>

<script>
function openGame() {
    window.open('../games/chain_run_ketten_jumpnrun_chat_canvas.html', '_blank');
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

- **Technologie**: HTML5 Canvas, JavaScript
- **Physik-Engine**: Custom-implementierte Seilphysik
- **Grafik**: Procedural generierte Hintergründe
- **Performance**: 60 FPS optimiert

## Credits

Dieses Spiel wurde mit Hilfe von KI generiert und demonstriert fortgeschrittene Canvas-Programmierung und Physik-Simulation im Browser.

---

[← Zurück zur Spieleübersicht](../index.html)