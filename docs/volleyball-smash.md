---
layout: default
title: Volleyball Smash
---

# 💥 Volleyball Smash

Rasantes 1v1-Beachvolleyball am selben Rechner. Timing schlägt Tasten: Sprung und Fallgeschwindigkeit entscheiden über den Smash!

## Spielbeschreibung

Volleyball Smash ist ein Arcade-Duell für zwei Spieler an einem Rechner. Ihr steht euch über einem Netz gegenüber und müsst den Ball auf der gegnerischen Seite zu Boden bringen, ohne dass er bei euch selbst aufkommt. Wer im richtigen Moment springt und den Ball im Fallen trifft, verwandelt einen normalen Kontakt in einen harten Spike, der schwer zu erwidern ist.

## Features

- **Zwei-Spieler-Duell**: Beide Spieler treten am selben Bildschirm gegeneinander an
- **Timing-basierter Spike**: Fallgeschwindigkeit und Sprunghöhe bestimmen die Wucht des Schlags
- **Screen Shake & Hit-Stop**: Spürbare Rückmeldung bei Landung, Bump, Spike und Matchball
- **Zeitlupen-Momente**: Clutch-Saves und der entscheidende Punkt werden in Slow-Motion gefeiert
- **Partikel & Popups**: Staub, Konfetti und Textanzeigen wie SPIKE!, PERFECT! oder CLUTCH!
- **Combo-System**: Aufeinanderfolgende starke Aktionen erhöhen Tempo und Effekte
- **Golden Ball**: Beim Matchball bekommt der Ball einen goldenen Glanz
- **Sieg-Statistik**: Die Siege pro Spieler werden lokal gespeichert
- **Vollständiger Sound**: Eigens synthetisierte Effekte für Sprung, Bump, Spike, Punkt und Matchgewinn
- **Vollbildmodus**: Für ein immersives Spielerlebnis
- **Pause & Neustart**: Jederzeit pausierbar und ohne Neuladen neu startbar

## Steuerung

**Spieler 1 (links):**
- **W**: Springen
- **A / D**: Nach links / rechts bewegen

**Spieler 2 (rechts):**
- **Pfeiltaste hoch**: Springen
- **Pfeiltaste links / rechts**: Nach links / rechts bewegen

**Allgemein:**
- **Leertaste**: Spiel starten / Revanche starten
- **R**: Spiel neu starten
- **F**: Vollbildmodus umschalten
- **Esc**: Pause / zurück

## Spielregeln

1. Der Ball muss über das Netz auf die gegnerische Seite gespielt werden
2. Berührt der Ball den Boden auf einer Seite, erhält der Gegner den Punkt
3. Jeder Spieler darf den Ball nur einmal berühren, bevor er das Netz wieder überquert hat, sonst gibt es einen Punkt für den Gegner (Doppelberührung)
4. Wer im Sprung fällt und den Ball im richtigen Moment trifft, spielt einen Spike statt eines normalen Bumps
5. Sieger ist, wer zuerst mindestens 7 Punkte erreicht und dabei mit 2 Punkten Vorsprung führt, spätestens jedoch bei 11 Punkten
6. Nach jedem Punkt gibt es eine kurze Pause, bevor der nächste Ball ins Spiel kommt
7. Nach einem gewonnenen Match beginnt beim nächsten Durchgang der Verlierer mit dem Aufschlag

## Tipps & Tricks

- Springe erst kurz bevor der Ball ankommt, nicht zu früh, sonst fällst du schon wieder, wenn der Ball da ist
- Ein Spike aus vollem Fall ist deutlich schwerer zu erwidern als ein normaler Bump
- Achte auf die Netzhöhe: Ein flacher Ball nah am Netz kann als knapper Streifschuss durchrutschen
- Baue eine Serie starker Aktionen auf, um vom Combo-System zu profitieren
- Beim Matchball lohnt sich besondere Vorsicht: Ein Fehler beendet das Spiel sofort
- Kurz vor dem Boden noch einmal retten lohnt sich, ein knapper Save kann das Blatt wenden

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
        src="../games/volleyball-smash.html" 
        style="
            width: 100%;
            height: 700px;
            border: none;
        "
        title="Volleyball Smash">
    </iframe>
</div>

<script>
function openGame() {
    window.open('../games/volleyball-smash.html', '_blank');
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
- **Web Audio API**: Für die synthetisierten Soundeffekte
- **LocalStorage**: Für die Sieg-Statistik
- **Keine externen Abhängigkeiten**: Läuft komplett standalone

## Credits

Dieses Spiel wurde mit Hilfe von KI generiert und ist ein Beispiel für die Möglichkeiten moderner Web-Technologien.

---

[← Zurück zur Spieleübersicht](../index.html)
