---
layout: default
title: "VOID PROTOCOL: Ground Zero"
---

# VOID PROTOCOL: Ground Zero

Ein intensiver Alien-Breed-Style Top-Down Dungeon Crawler mit Androiden-Gegnern in prozedural generierten Leveln.

## Gameplay

Kaempfe dich durch 3 Sektoren einer zerstoerten Forschungsstation. Finde Keycards, hacke das Terminal und fliehe durch den Sicherheitstunnel bevor der Countdown ablaeuft. Androiden jagen dich in Schwaermen -- nutze 6 verschiedene Waffen, deine Taschenlampe und taktisches Geschick zum Ueberleben.

<div style="position: relative; width: 100%; max-width: 960px; margin: 20px auto;">
    <iframe id="gameFrame" src="../games/void-protocol/index.html" style="width: 100%; height: 600px; border: 2px solid #00f0ff; border-radius: 8px; background: #0a0b0d;" allowfullscreen></iframe>
    <button onclick="document.getElementById('gameFrame').requestFullscreen()" style="display: block; margin: 10px auto; padding: 8px 20px; background: #0a0b0d; color: #00f0ff; border: 1px solid #00f0ff; border-radius: 4px; cursor: pointer; font-family: monospace;">Fullscreen</button>
</div>

## Steuerung

| Taste | Aktion |
|-------|--------|
| WASD / Pfeiltasten | Bewegung |
| Maus | Zielen |
| Linke Maustaste | Schiessen |
| Shift | Sprint (verbraucht Stamina) |
| E | Interagieren (Terminal hacken, Tuer oeffnen, Tunnel betreten) |
| Q / Mausrad | Waffe wechseln |
| 1-6 | Direkte Waffenwahl |
| Tab | Vollbild-Karte |
| Escape | Pause |

## Waffen

| Waffe | Schaden | Spezial |
|-------|---------|---------|
| Pistol | 8 | Unendlich Munition, Semi-Auto |
| SMG | 10 | Vollautomatisch, hohe Feuerrate |
| Shotgun | 8x8 | 8 Pellets, Nahkampf-Monster |
| Plasma | 22 | Splash Damage (40px Radius) |
| Flamer | 5 | Flammenwerfer, kurze Reichweite |
| Railgun | 55 | Durchschlagend, Hitscan |

## Gegner

| Typ | Farbe | Verhalten |
|-----|-------|-----------|
| **Scout** | Blau | Schnell, Nahkampf, Flanking, weicht bei Treffern aus |
| **Sentinel** | Rot | Fernkaempfer, Schulterkanone, weicht zurueck |
| **Heavy** | Orange | Langsam, massiv gepanzert, hoher Schaden, Charge-Angriff mit Vorwarnung |
| **Commander** | Lila | Boss, regenerierendes Energieschild, spawnt Scouts |

## Spielablauf pro Level

1. **Erkunden** -- Finde Keycards in Waffenkammern und Lagerraeumen
2. **Oeffnen** -- Nutze Keycards um verschlossene Tueren zu oeffnen
3. **Hacken** -- Halte E am Terminal fuer 3 Sekunden
4. **Fliehen** -- Countdown startet! Renne zum Exit-Tunnel bevor die Zeit ablaeuft
5. **Ueberleben** -- Waehrend des Countdowns spawnen massive Androiden-Wellen

## Features

- Prozedurale Levelgenerierung (BSP-Algorithmus) fuer einzigartiges Gameplay
- 2.5D-Wanddarstellung mit Tiefeneffekt
- Dual-Flashlight System (Kegel + Ambient) mit Flackern
- Farbige Raumbeleuchtung (Additive Blend)
- Fog of War mit glattem Lichtkegel
- 4 Androiden-Typen mit unterschiedlichem Verhalten
- 6 einzigartige Waffen mit visuellen Effekten
- Persistente Boden-Decals (Oel, Brandspuren, Einschussloecher)
- Atmosphaerische Partikel (Staub, Funken, Rauch)
- Damage Numbers und Kill Feed
- Boss-Healthbar fuer Commander
- Explosive Faesser mit Kettenreaktionen
- Loot-Drops von besiegten Androiden
- Kill-Streak-System (Double Kill, Triple Kill, Rampage...)
- Post-Processing (Scanlines, Vignette, Chromatic Aberration)
- Niedrig-HP Warnung mit pulsierendem Rot-Effekt
- Toxische Pfuetzen mit gruener Glueh-Aura (5 DPS)
- Zufaellige Stromausfaelle (Licht-Flicker Events)
- Raum-Eintritts-Benachrichtigungen
- Detaillierte Kampf-Statistiken (Accuracy, Damage, Best Streak)
- Commander-Schild regeneriert langsam
- Airdrops mit Versorgungskisten (Health, Armor, Munition, Power-Up)
- Power-Ups: Geschwindigkeit, Doppelschaden, Schildregeneration (10s Dauer)
- Regen-Effekt waehrend des Countdowns
- KI meidet toxische Pfuetzen und erleidet Schaden darin
- Aktiver Kill-Streak-Zaehler auf dem Bildschirm
- 3 Schwierigkeitsgrade (Easy, Normal, Hard) mit skalierter Feindanzahl
- Geheimraum hinter zerstoerbarer Wand im Lagerraum (seltener Loot!)
- Alarm-System: Boss- und Serverraum-Betreten alarmiert alle Feinde (15s)
- Strukturkollaps nach 3 Minuten -- neue Wege oeffnen sich
- Rogue Heavy Mini-Boss alle 15 Kills (2.5x HP, 1.5x Schaden)
- Zerstoerbare Waende mit Rissanzeige und Fortschrittseffekten
- Schadensrichtungs-Anzeige (roter Bogen zeigt Angriffsrichtung)
- Heavy-Charge-Angriff mit Vorwarnung (0.4s Aufladung mit pulsierender Aura und Richtungslinie, dann 3x Geschwindigkeit mit Speed-Linien)
- Heavy-Wandcrash: Heavies nehmen Selbstschaden und werden betaeubt wenn sie gegen Waende prallen
- Sentinel-Laservisier (roter gestrichelter Laser mit Zielkreuz zeigt 0.35s Vorwarnung)
- Commander-Teleport (Commander teleportieren sich hinter den Spieler)
- Androiden-Wrackteile bleiben nach dem Tod sichtbar liegen
- Funkende Kabel an der Decke als atmosphaerischer Effekt
- Rogue Heavy zeigt eigene Boss-Healthbar (orange-rot)

## Tips

- Die Taschenlampe zeigt nur nach vorne -- Feinde koennen von hinten kommen!
- Spare Munition -- die Pistole hat unendlich Schuss, bei leerem Magazin wird automatisch gewechselt
- Schiesse auf explosive Faesser fuer Kettenreaktionen -- aber halte Abstand!
- Waehrend des Countdowns: Sprint direkt zum Exit, kaempfe nicht
- Commander spawnen Scouts -- erledige sie zuerst
- Heavies sind langsam, halte Distanz und nutze Plasma oder Railgun
- Besiegte Androiden droppen manchmal Health und Munition
- Meide toxische Pfuetzen (gruenes Gluehen) -- sie verursachen konstanten Schaden
- Stromausfaelle reduzieren die Sicht drastisch -- nutze deine Taschenlampe!
- Commander-Schilde regenerieren sich langsam -- bleib am Druecker!
- Airdrops erscheinen alle 50-90 Sekunden -- oeffne sie fuer Health, Armor, Munition und ein Power-Up!
- Power-Ups sind mächtig aber kurzlebig (10s) -- nutze sie strategisch!
- Locke Androiden in toxische Pfuetzen -- sie nehmen dort ebenfalls Schaden!
- Suche im Lagerraum nach rissigen Waenden -- dahinter verbirgt sich ein Geheimraum!
- Betrete Boss- und Serverraeume vorsichtig -- sie loesen den Alarm aus!
- Nach 3 Minuten kollabiert eine Wand und oeffnet einen Abkuerzungsweg
- Alle 15 Kills erscheint ein Rogue Heavy -- bereite dich vor!
- Weiche Heavy-Charges aus -- sie krachen gegen die Wand und betaeuben sich selbst!
- Hard-Modus hat mehr Feinde pro Raum und zusaetzliche Sentinels

[Zurueck zur Spielegalerie](../)
