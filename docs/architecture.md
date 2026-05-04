# Architecture

## Overview

The app is a single HTML page with no build step, no framework, and no server. Every file is served statically via GitHub Pages. The browser is the runtime; `localStorage` is the database.

```
Browser
  ├── index.html          Semantic shell and stable DOM anchors
  ├── css/styles.css      All presentation — layout, theme, state classes
  └── js/app.js           All logic — state, persistence, rendering, events
```

---

## Rendering model

There is no virtual DOM or reactive system. The approach is **full re-render on mutation**:

1. User action triggers an event handler.
2. Handler mutates `state` directly.
3. Handler calls `save()` to write to `localStorage`.
4. Handler calls the relevant `render*()` function, which clears `innerHTML` and rebuilds the section from scratch.

This is intentional. The character sheet is not a high-frequency update surface, so the simplicity of wholesale re-rendering outweighs the cost.

### Render functions

| Function | Section it owns |
|---|---|
| `renderHeader()` | Name input, prompt number input |
| `renderMemories()` | All memory cards and their experience rows |
| `renderSkills()` | Skills entry list |
| `renderResources()` | Resources entry list |
| `renderMarks()` | Marks entry list |
| `renderCharacters()` | Character cards |
| `renderArchive()` | All archive groups (delegates to per-type helpers) |

`renderEntryList(listId, items, onUpdate)` is a shared helper for the three flat lists (Skills, Resources, Marks). It receives the target element ID, the array of items, and a callback to call after any mutation (the callback re-renders and updates the archive).

---

## State management

State lives in a single module-level `let state` object. All mutations are in-place: handlers find the relevant item by `id`, mutate it directly, then call `save()`.

There is no immutability, no action/reducer pattern, and no diffing. The simplicity is deliberate — this is a tool for one player, not a shared application.

`save()` serialises the whole state object to JSON and writes it to `localStorage.tyov_character`.  
`load()` reads and parses it on startup; if parsing fails or the key is absent, `blankState()` is used.

---

## Resolution Mode

Resolution Mode is the only "modal" flow in the app. It is implemented as:

- A `resolutionMode` boolean in module scope.
- A fixed-position overlay (`#resolution-overlay`) that is shown/hidden via `.hidden`.
- `body.resolution-mode` CSS class that applies a red glow to all memory cards.
- When `renderMemories()` runs during Resolution Mode, each memory card gets an extra click handler that calls `resolveMemory(id)`.
- `resolveMemory` → `archiveMemory` → moves the chosen memory to archive, exits Resolution Mode, adds the pending new memory, re-renders.

Resolution Mode cannot be cancelled: the overlay has no dismiss control and `bindAddMemory()` ignores clicks while `resolutionMode` is true.

---

## DOM conventions

- **Stable IDs** for all top-level containers are defined in `index.html` and never created in JS.
- **`data-id` attributes** on dynamically rendered cards hold the entity's `uid` so event handlers can look items up in `state` without closures over stale references.
- **`.hidden`** (CSS `display: none !important`) is the only show/hide mechanism. No inline style manipulation.
- All new DOM nodes are created with `document.createElement`, configured imperatively, then appended. No `innerHTML` injection with user content (XSS prevention).

---

## CSS architecture

All styles live in one file (`css/styles.css`). Structure (in file order):

1. **Root & Reset** — custom properties, box-sizing, margin/padding zero
2. **Utilities** — `.hidden`, `.sr-only`
3. **Header**
4. **Resolution Mode overlay** — fixed overlay + `body.resolution-mode` scoped card styles
5. **Main layout**
6. **Section common** — `.play-section`, `.section-header`
7. **Buttons** — `.btn-add`, `.btn-icon`, `.toggle-btn`
8. **Add entry row** — shared input + button strip
9. **Memories** — grid layout, card, title, experience rows
10. **Skills / Resources / Marks** — `.entry-list`, `.entry-row`, `.entry-text.crossed`
11. **Characters** — card, name, descriptor, toggle buttons
12. **Archive** — drawer, groups, read-only entry styles
13. **Scrollbar**
14. **Responsive** — `@media (max-width: 600px)`

### Colour tokens (`:root`)

| Token | Value | Used for |
|---|---|---|
| `--color-bg` | `#0e0d0b` | Page background |
| `--color-surface` | `#1a1815` | Card backgrounds |
| `--color-surface-alt` | `#221f1b` | Archive card backgrounds |
| `--color-border` | `#3a3530` | All borders and dividers |
| `--color-text` | `#c8bfb0` | Primary text |
| `--color-text-dim` | `#6e6660` | Labels, secondary text |
| `--color-text-muted` | `#4a4540` | Placeholders, archived content |
| `--color-accent` | `#8a6f4e` | Focus states, hover highlights |
| `--color-accent-lit` | `#b8956a` | Hover text on accent-bordered elements |
| `--color-danger` | `#7a3030` | Archive button hover, Resolution Mode border |
| `--color-resolution` | `rgba(90,20,20,0.92)` | Resolution Mode overlay background |

---

## No-build constraint

The `<script>` tag in `index.html` uses a plain `src` attribute with no `type="module"`. This means:

- No ES module syntax (`import`/`export`) in `app.js`.
- No top-level `await`.
- All declarations in `app.js` are in function or module (IIFE) scope; `'use strict'` is declared at the top of the file.
- If `app.js` is ever split into multiple files, each must be added as a separate `<script>` tag in the correct dependency order.
