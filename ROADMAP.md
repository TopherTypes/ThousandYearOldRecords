# Roadmap

## v1 — Current (in progress)

The initial release. A functional, offline-capable character record tool covering all core mechanical needs for a TYOV playthrough.

### In scope

- [x] Character name and prompt-number header
- [x] Memories (max 5) with Experiences (max 3 each)
- [x] Resolution Mode for Memory overflow
- [x] Skills with strikethrough (lost) and archive
- [x] Resources with strikethrough (lost) and archive
- [x] Characters with Mortal/Immortal and Alive/Dead toggles
- [x] Marks
- [x] Archive — read-only, grouped by type, toggled visible
- [x] `localStorage` auto-save on every change
- [x] Gothic dark theme, desktop-first, responsive to tablet
- [x] GitHub Pages deployment

### Out of scope for v1

The following are explicitly deferred. They are not bugs — they are deliberate omissions.

- Prompt text display or navigation within the book
- Journal / diary entries
- Multiple characters or save slots
- Export, print, or share
- Undo / redo
- Theming or user customisation beyond what ships
- Cloud sync or cross-device support

---

## v2 — Ideas (not committed)

These are candidate features for a future release. Nothing here is promised or scheduled.

### Export & portability
- Export character as a formatted PDF or printable HTML page
- Export / import as JSON for backup and device transfer

### Multiple characters
- Save slot selection on load (named slots, stored as separate `localStorage` keys)
- Basic "new character" / "load character" flow

### Quality of life
- Drag-to-reorder Memories and Experiences
- Keyboard shortcut to add a new Memory
- Collapse / expand individual Memory cards

### Presentation
- Optional sepia / parchment light theme
- Larger text mode for tablet play without glasses

### Session aids
- Simple session log — a freeform text area to jot notes during play, separate from Memories
- "Last played" timestamp shown on load

---

## Guiding principles (all versions)

- **No permanent deletion.** The archive is always the destination, never the trash.
- **No server.** Everything runs in the browser.
- **No framework.** Vanilla HTML, CSS, and JavaScript only.
- **No build step.** The repository root is the deployed site.
