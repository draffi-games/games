---
layout: default
title: Racing Circuit
---

# Racing Circuit 🏎️

Ein spannendes Top-Down Racing Game mit Zeitrennen! Fahre mit deinem Rennwagen über einen herausfordernden Circuit und stelle neue Bestzeiten auf.

<div style="text-align: center; margin: 30px 0;">
    <iframe id="gameFrame" src="../games/racing-circuit.html" style="width: 1020px; height: 740px; border: 3px solid #ff4444; border-radius: 10px; max-width: 100%;"></iframe>
    <br>
    <button onclick="document.getElementById('gameFrame').requestFullscreen()" style="margin-top: 15px; padding: 10px 20px; font-size: 16px; background: #ff4444; color: white; border: none; border-radius: 5px; cursor: pointer;">
        Fullscreen Mode
    </button>
</div>

## Spielkonzept

In Racing Circuit steuerst du einen Rennwagen von oben betrachtet über eine herausfordernde Rennstrecke. Dein Ziel ist es, 5 Runden so schnell wie möglich zu fahren und dabei deine beste Rundenzeit zu verbessern!

## Steuerung

### Tastatur
- **↑ (Pfeiltaste hoch)** - Beschleunigen
- **↓ (Pfeiltaste runter)** - Bremsen / Rückwärts
- **← / →** - Lenken (funktioniert nur bei Bewegung)
- **Leertaste / P** - Pause

### Touch-Controls
Auf mobilen Geräten erscheinen virtuelle Buttons:
- **▲** - Beschleunigen
- **▼** - Bremsen
- **◄ / ►** - Lenken

## Spielmechanik

### Fahrzeug-Physik
- **Beschleunigung**: Halte die Pfeiltaste hoch gedrückt, um zu beschleunigen
- **Drift**: Bei hoher Geschwindigkeit in Kurven driftet das Auto
- **Reibung**: Das Auto wird automatisch langsamer, wenn du nicht beschleunigst
- **Kollision**: Wenn du von der Strecke abkommst, wirst du stark abgebremst

### Checkpoint-System
- Die Strecke hat 4 Checkpoints, die in der richtigen Reihenfolge durchfahren werden müssen
- Eine Runde zählt nur, wenn alle Checkpoints erreicht wurden
- Dies verhindert Abkürzungen und sorgt für faire Rundenzeiten

### Zeitnahme
- **Lap Time**: Zeigt deine aktuelle Rundenzeit an
- **Best Lap**: Deine schnellste Runde wird gespeichert
- **Speed**: Aktuelle Geschwindigkeit in km/h
- **Lap Counter**: Zeigt an, in welcher Runde du bist (1-5)

## Streckenlayout

Die Rennstrecke ist ein ovaler Circuit mit verschiedenen Kurventypen:
- **Lange Gerade**: Ideal zum Beschleunigen
- **Haarnadelkurve**: Scharfe 180°-Kurve - hier musst du bremsen!
- **S-Kurven**: Schnelle Kurven-Kombinationen
- **Start/Ziel-Linie**: Rot markiert am unteren Ende der Strecke

## Tipps & Tricks

1. **Bremse in scharfen Kurven**: Du musst nicht in jeder Kurve bremsen, aber bei Haarnadelkurven ist es notwendig

2. **Finde die ideale Linie**: Die kürzeste Linie ist nicht immer die schnellste - nutze die volle Streckenbreite

3. **Geschwindigkeit kontrollieren**: Zu viel Speed in Kurven führt zu Kollisionen mit der Streckenbegrenzung

4. **Frühzeitig lenken**: Beginne das Lenken vor der Kurve, nicht erst mittendrin

5. **Lerne die Strecke**: Nach ein paar Runden kennst du den Circuit auswendig und kannst besser planen

6. **Nutze die volle Streckenbreite**: Fahre von außen in die Kurve, treffe den Scheitelpunkt innen und fahre wieder nach außen

## Bewertungssystem

Nach 5 Runden:
- **Unter 1:30 pro Runde**: Professioneller Rennfahrer! 🏆
- **1:30 - 2:00**: Sehr gute Zeit! 🥇
- **2:00 - 2:30**: Solide Leistung! 🥈
- **Über 2:30**: Weiter üben! 🏁

Deine beste Rundenzeit wird im Browser gespeichert - versuche dich selbst zu schlagen!

## Features

✨ **Realistische Physik** - Beschleunigung, Bremsen und Drift<br>
🏁 **Checkpoint-System** - Verhindert Abkürzungen<br>
⏱️ **Zeitnahme** - Mit Bestzeiten-Speicherung<br>
📱 **Responsive** - Funktioniert auf Desktop und Mobile<br>
🎮 **Einfache Steuerung** - Pfeiltasten oder Touch-Controls<br>
💾 **Highscore-Speicherung** - Deine Bestzeit bleibt gespeichert

## Entwicklung

Entwickelt als Teil der Starship Command Game Collection. Das Spiel läuft komplett im Browser ohne externe Dependencies.

---

[← Zurück zur Spieleübersicht](../index.html)
