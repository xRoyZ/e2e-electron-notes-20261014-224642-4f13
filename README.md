# Notizen

Eine lokale Desktop-Notiz-App auf Basis von Electron mit einem Vite-Renderer
(React + TypeScript). Notizen werden ausschließlich auf dem Gerät gespeichert:
angelegt, bearbeitet, durchsucht, angeheftet und gelöscht, mit einer
Markdown-Vorschau neben dem Editor und einem hellen bzw. dunklen Erscheinungsbild.
Es gibt keinen Server und keine Netzwerkanfragen — die App lädt keine externen
Ressourcen und verlässt nie das Gerät.

## Tech-Stack

- **Desktop-Runtime:** Electron (Hauptprozess), Fenster lädt den gebauten Renderer
- **UI:** React + TypeScript, gebaut mit Vite
- **Test:** Vitest mit jsdom und @testing-library/react
- **Persistenz:** `localStorage` im Renderer, versioniertes Schema (`notes-app:state`)
- **Markdown:** `marked` + `dompurify` für eine sanitisierte Vorschau

## Installation

```bash
npm ci
```

## Entwicklung und Ausführung

Renderer bauen und im Electron-Fenster starten:

```bash
npm run build
npm start
```

Für einen Browser-Check (der Renderer läuft auch ohne Electron) den gebauten
`dist/`-Ordner über einen lokalen Static-Server ausliefern — `file://` blockiert
ES-Module:

```bash
npm run build
npx vite preview --port 4173
# danach http://localhost:4173 im Browser öffnen
```

Während der Entwicklung steht der `vite`-Entwicklungsserver (`npx vite`) zur
Verfügung; das Electron-Fenster lädt ihn, wenn `VITE_DEV_SERVER_URL` gesetzt ist.

## Produktions-Build

```bash
npm run build   # schreibt den Renderer nach dist/
npm run dist    # paketiert die App mit electron-builder
```

`electron-builder` legt die Pakete in `release/` ab (Ausgabe-Verzeichnis laut
`package.json`).

## Bedienung

- **Neue Notiz:** Schaltfläche „Neue Notiz“ im Kopf oder in der Listen-Spalte
  öffnet ein leeres Formular im Editor.
- **Bearbeiten:** Titel und Text im Editor ändern, dann „Speichern“.
  „Abbrechen“ verwirft den bearbeiteten Entwurf.
- **Suchen:** Das Suchfeld in der Listen-Spalte filtert live über Titel und Text.
- **Anheften:** Die Pin-Schaltfläche an einer Notizzeile sortiert sie nach oben.
- **Löschen:** Die Lösch-Schaltfläche entfernt die Notiz nach Bestätigung.
- **Hell/Dunkel:** Der Umschalter oben rechts wechselt das Erscheinungsbild
  sofort und merkt sich die Wahl.
- **Vorschau:** Text im Editor wird rechts live als sanitisiertes Markdown
  dargestellt; rohes HTML erscheint als Text.

Die drei Bereiche sind Liste | Editor | Markdown-Vorschau.

## Funktionen

- Notizen anlegen, bearbeiten und löschen mit Persistenz im `localStorage`
- Live-Suche über Titel und Text
- Anheften mit Sortierung „angeheftete zuerst“, danach zuletzt geändert
- Markdown-Vorschau mit HTML-Sanitizing
- Heller und dunkler Modus (Systempräferenz als Startwert)
- Lokale Anwendung ohne externe Ressourcen und ohne Netzwerkzugriff
- Sicheres Renderer-Setup: `contextIsolation` an, `nodeIntegration` aus,
  `sandbox` an, strenges CSP für den Produktions-Renderer
