# Agent Guide — Thousand Year Old Vampire Character Record

This file tells an AI coding agent everything it needs to work safely and correctly in this repository.

---

## Project in one sentence

A single-page, zero-dependency browser app that tracks character state for the tabletop solo RPG *Thousand Year Old Vampire*. No build step, no framework, no server.

---

## Critical constraints

1. **No frameworks.** This is intentionally plain HTML + CSS + JS. Do not introduce React, Vue, Svelte, Alpine, jQuery, Tailwind, or any npm package.
2. **No build toolchain.** There is no `package.json`, no bundler, no transpiler. Code must run directly in the browser as written.
3. **No deletes.** The game's core mechanic is that nothing is ever permanently lost — archiving is the only removal action. Do not add any UI or logic that permanently destroys data.
4. **localStorage only.** All persistence goes through the single key `tyov_character`. Do not add network requests, IndexedDB, cookies, or external storage.
5. **GitHub Pages deployment.** `index.html` must stay at the repository root. Do not move it or wrap it in a subdirectory build output.

---

## Code layout

```
index.html      Semantic HTML shell. All sections have stable IDs used by JS.
css/styles.css  All visual styling. Uses CSS custom properties (--color-*, --font-*).
js/app.js       All application logic. One file, no modules.
```

### `js/app.js` structure (in order)

| Section | What it does |
|---|---|
| STATE | `state` object, blank constructors (`blankMemory`, `blankSkill`, etc.), `uid()` |
| PERSISTENCE | `save()` / `load()` via `localStorage` |
| UTILITIES | `$()` / `$$()` wrappers, `autoResize()` |
| RENDER — MEMORIES | `renderMemories()`, `buildExperienceRow()` |
| RESOLUTION MODE | `enterResolutionMode()`, `exitResolutionMode()`, `resolveMemory()`, `archiveMemory()` |
| RENDER — SKILLS / RESOURCES / MARKS | `renderEntryList()` shared helper, then per-section wrappers |
| RENDER — CHARACTERS | `renderCharacters()` |
| RENDER — ARCHIVE | `renderArchive()` and per-type helpers |
| HEADER | `renderHeader()` |
| ADD ACTIONS | `bindAddMemory()`, `bindAddSkill()`, etc. |
| ARCHIVE TOGGLE | `bindArchiveToggle()` |
| INIT | `init()` — called on `DOMContentLoaded` |

---

## State shape

```js
{
  name:         string,
  promptNumber: number | '',
  createdAt:    ISO8601 string | null,

  memories: [
    {
      id:          string,       // uid()
      title:       string,
      experiences: [{ id, text }]
    }
  ],

  skills:     [{ id, text, crossed: bool }],
  resources:  [{ id, text, crossed: bool }],
  characters: [{ id, name, desc, mortal: bool, alive: bool }],
  marks:      [{ id, text }],

  archive: {
    memories:   [...same shape as memories],
    skills:     [...],
    resources:  [...],
    characters: [...],
    marks:      [...],
  }
}
```

The entire object is serialised as JSON under `localStorage.tyov_character` after every mutation. There is no debouncing; writes are synchronous and immediate.

---

## Mechanical rules to preserve

| Rule | Location in code |
|---|---|
| Max 5 active Memories | `MEMORY_MAX = 5` constant; checked in `bindAddMemory()` |
| 6th Memory → Resolution Mode | `enterResolutionMode()` — adds overlay, adds CSS class to body, re-renders memory cards with click handlers |
| Resolution Mode cannot be dismissed without a choice | The overlay has no close button; only clicking a memory card exits it |
| Max 3 Experiences per Memory | `EXPERIENCE_MAX = 3`; checked in `renderMemories()` — shows "This memory is full." message |
| Archive is read-only | `renderArchive*` functions build DOM from archived data but attach no edit or restore handlers |
| No permanent deletion | Every removal path calls `state.archive.<type>.push(removed)` before splicing from the active array |

---

## CSS conventions

- All colours are CSS custom properties on `:root` in `css/styles.css`. Edit tokens there; never hardcode hex values in new rules.
- Dark palette: `--color-bg` (#0e0d0b) is the page background; `--color-surface` (#1a1815) is card backgrounds.
- Resolution Mode styles are scoped to `body.resolution-mode .memory-card` — do not scope them any other way.
- The `.hidden` utility class uses `display: none !important`. Use it (via `classList`) for show/hide toggling; do not manipulate `display` directly in JS.

---

## DOM conventions

- All stable IDs are in `index.html`. JS locates nodes with `$('#id')`. Do not create new root-level IDs in JS.
- Dynamically created cards/rows are rebuilt on every relevant `render*()` call (no partial patching). Keep render functions pure with respect to the DOM — clear `innerHTML`, then rebuild.
- `data-id` attributes on cards hold the entity's `uid` and are used by event handlers to locate the right item in `state`.

---

## Testing

There is no automated test suite. To verify a change:

1. Open `index.html` in a browser (no server needed for basic checks).
2. Manually exercise the affected feature.
3. Open DevTools → Application → Local Storage and confirm the JSON shape looks correct.
4. Reload the page and confirm state is restored correctly.

---

## What not to do

- Do not add a `package.json`, `node_modules`, or any dependency manifest.
- Do not split `app.js` into ES modules (GitHub Pages serves files but the project has no module bundler and no `type="module"` on the script tag).
- Do not add a "Restore from Archive" button — the archive is intentionally permanent.
- Do not add a manual Save button — auto-save on every change is part of the design.
- Do not add prompt text or navigation — out of scope per `docs/PRD.md` §8.
