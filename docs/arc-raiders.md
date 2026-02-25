---
layout: default
title: Arc Raiders - Deathmatch
---

# Arc Raiders: Deathmatch

Split-Screen PvP Shooter inspiriert von Arc Raiders! Zwei Spieler kaempfen in einer zerstoerten Sci-Fi Stadt um die Vorherrschaft. Sammle Waffen, nutze Deckung und sei der Erste mit 10 Kills!

<div style="text-align: center; margin: 30px 0;">
    <iframe id="gameFrame" src="../games/arc-raiders.html" style="width: 1020px; height: 740px; border: 3px solid #00ccff; border-radius: 10px; max-width: 100%;"></iframe>
    <br>
    <button onclick="document.getElementById('gameFrame').requestFullscreen()" style="margin-top: 15px; padding: 10px 20px; font-size: 16px; background: #00ccff; color: black; border: none; border-radius: 5px; cursor: pointer;">
        Fullscreen Mode
    </button>
</div>

## Spielkonzept

Arc Raiders: Deathmatch ist ein lokaler Split-Screen PvP-Shooter fuer zwei Spieler. In einer post-apokalyptischen, zerstoerten Stadt kaempfen zwei Raider gegeneinander. Waffen spawnen auf der Map und muessen aufgesammelt werden. Wer zuerst 10 Kills erreicht, gewinnt!

## Steuerung

### Spieler 1 (Orange - Linke Bildschirmhaelfte)
- **WASD** - Bewegen
- **Leertaste** - Schiessen
- **R** - Waffe wechseln (zurueck zur Pistole)
- **E** - Dash (kurzer Ausweich-Sprint, 2s Cooldown)

### Spieler 2 (Cyan - Rechte Bildschirmhaelfte)
- **Pfeiltasten** - Bewegen
- **Enter** - Schiessen
- **P** - Waffe wechseln (zurueck zur Pistole)
- **K** - Dash (kurzer Ausweich-Sprint, 2s Cooldown)

### Allgemein
- **Enter** - Spiel starten / Rematch
- **ESC** - Zurueck zum Menue (nach Game Over)

## Waffen

### Pistole (Standard)
- Unendlich Munition, geringer Schaden (8 DMG)
- Immer verfuegbar als Backup-Waffe

### Railgun
- **45 Schaden** pro Treffer - extrem toedlich!
- Instant-Hitscan Strahl der durch duenne Waende (Rubble) geht
- Langsame Feuerrate, nur 5 Schuss
- Roter Laserstrahl mit Leuchteffekt

### Plasma Launcher
- **30 Direktschaden** + **15 Flaechenschaden** im Radius
- Langsame Projektile die bei Kontakt explodieren
- 8 Schuss, gut zum Ecken-Clearing
- Blaue Plasma-Kugeln mit Explosionseffekt

### Shotgun
- **7 Pellets x 7 Schaden** = bis zu 49 Schaden auf Nahkampf
- Schaden faellt mit Distanz ab
- 12 Schuss, devastierend auf kurze Distanz
- Gelber Pellet-Faecherstrahl

### EMP-Granaten
- **5 Schaden** + **taktischer Effekt**
- Verlangsamt Gegner um 50% fuer 3 Sekunden
- Stoert das gegnerische HUD (statischer Glitch-Effekt)
- 3 Granaten, perfekt zum Kombinieren mit anderen Waffen

## Pickups

### Waffen-Pickups
- Spawnen an 8 festen Positionen auf der Map
- Schweben und rotieren mit farbigem Leuchtring
- Respawnen 20 Sekunden nach dem Aufsammeln
- Pulsierender Ring zeigt baldigen Respawn an

### Health Pack (Gruen)
- Heilt 40 HP (Maximum: 100 HP)
- 4 Stueck auf der Map verteilt
- Respawnt nach 15 Sekunden

### Shield Pack (Blau)
- Gibt 50 Schildpunkte (Maximum: 50)
- Schild absorbiert Schaden vor der Gesundheit
- 3 Stueck auf der Map, Respawn nach 20 Sekunden

## Map: Zerstoerte Stadt

Die 2400x2400 Pixel grosse Map besteht aus verschiedenen Zonen:

- **Zentraler Platz** - Offener Bereich mit Brunnenruine, viele Waffen aber wenig Deckung
- **NW: Eingestuerzte Wohnblocks** - Enge Gaenge, ideal fuer Shotgun-Kaempfe
- **NE: Roboter-Friedhof** - Grosse Mech-Wracks als Deckung, Railgun spawnt hier
- **SW: Tiefgaragen-Eingang** - Betonpfeiler, Health/Shield Pickups
- **SE: Abgestuerztes Schiff** - Lange Sichtlinien, Plasma Launcher spawnt hier
- **Verbindungsstrassen** - Riskante Uebergaenge zwischen den Zonen

## HUD

Jede Bildschirmhaelfte zeigt:
- **HP-Leiste** (oben links) - Pulsiert rot unter 25%
- **Schild-Leiste** (unter HP) - Blauer Balken
- **Kill-Zaehler** (oben rechts) - Leuchtet gold ab 8 Kills
- **Waffen-Info** (unten mitte) - Name, Munition, farbcodiert
- **Minimap** (unten rechts) - Zeigt Map, Spieler und Pickups

## Tipps & Tricks

1. **Kontrolliere die Mitte** - Die besten Waffen spawnen zentral, aber du bist exponiert
2. **Railgun fuer Profis** - Hoher Schaden aber schwer zu treffen, pierced durch Rubble
3. **EMP + Shotgun Combo** - EMP verlangsamt den Gegner, dann mit Shotgun nachsetzen
4. **Nutze Deckung** - Gebaeude blocken Railgun-Strahlen, Rubble nicht!
5. **Respawn-Timing** - Nach dem Tod bist du 1.5s unverwundbar, nutze die Zeit
6. **Kenne die Spawn-Punkte** - Du respawnst moeglichst weit vom Gegner entfernt
7. **Munition managen** - Leere Waffen wechseln automatisch zur Pistole
8. **Dash zum Ausweichen** - Nutze den Dash um Railgun-Schuessen oder Explosionen auszuweichen (waehrend dem Dash bist du unverwundbar!)
9. **Kill Streaks** - Mehrere Kills hintereinander loesen Streak-Ankuendigungen aus (Double Kill, Killing Spree, Dominating, Unstoppable)

## Features (v2.0)

- Split-Screen fuer 2 Spieler am gleichen Bildschirm
- 5 verschiedene Waffen mit einzigartigen Mechaniken
- **Dash-Mechanik** mit Unverwundbarkeits-Frames und Afterimage-Effekt
- **Dynamische Beleuchtung** - Muzzle Flash, Explosionen und Spieler erzeugen Echtzeit-Lichtquellen
- **Slow-Motion Final Kill** - Der letzte Kill wird in Zeitlupe gezeigt
- **Kill Streak System** - Double Kill, Killing Spree, Dominating, Unstoppable
- Detaillierte zerstoerte Stadt-Map mit Zone-Labels, Mech-Augen, Motorgluehn und Brunnenruine
- **Boden-Brandspuren** von Plasma-Explosionen
- Partikeleffekte: Explosionen, Muzzle Flash, EMP-Pulse, Fussspuren, Asche
- Minimap mit Echtzeit-Positionen
- Kill-Feed zeigt alle Kills an
- **Hitmarker-Crosshair** und Aim-Direction-Anzeige
- Game-Over Statistiken: Kills, Deaths, Accuracy, Lieblingswaffe mit Spotlight-Effekt
- EMP-Stoereffekt auf dem gegnerischen HUD
- **Atmosphaerischer Ascheregen** und Fade-In Effekte

---

[<- Zurueck zur Spieleuebersicht](../index.html)
