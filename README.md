# Thousand Year Old Vampire — Character Record

A lightweight, offline-capable character record tool for solo play of [*Thousand Year Old Vampire*](https://timhutchings.itch.io/tyov) by Tim Hutchings. Built to run entirely in the browser with no server, no accounts, and no installation.

**Live app:** https://tophertypes.github.io/ThousandYearOldRecords/

---

## What it does

Tracks all the moving parts of a TYOV playthrough so you can focus on the story rather than the paperwork:

- **Memories** — up to 5 in play, each holding up to 3 Experiences. A 6th Memory triggers **Resolution Mode**: the game asks you to choose one memory to lose before the new one is written.
- **Skills & Resources** — flat lists with strikethrough (lost) and archive (removed from play) actions.
- **Characters** — name, descriptor, Mortal/Immortal toggle, Alive/Dead toggle. Dead characters are visually dimmed.
- **Marks** — freeform text entries for physical or psychological marks.
- **Archive** — a read-only crypt for everything that has passed out of play. Nothing is ever permanently deleted.
- **Prompt tracker** — a single numeric field in the header so you always know where you are in the book.

All state persists automatically to `localStorage`; there is no save button.

---

## Running locally

No build step. Open `index.html` in any modern browser, or serve the directory with any static file server:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

---

## Project layout

```
/
├── index.html                    # Single-page app entry point (required by GitHub Pages)
├── css/
│   └── styles.css                # Gothic dark theme, all layout
├── js/
│   └── app.js                    # State, persistence, rendering, event binding
└── docs/
    ├── PRD.md                    # Full product requirements document
    ├── architecture.md           # Code structure and design decisions
    └── spec/
        └── data-model.md         # localStorage schema and entity definitions
```

---

## Tech

- Vanilla HTML, CSS, and JavaScript — no frameworks, no build toolchain
- `localStorage` for persistence (single key: `tyov_character`)
- GitHub Pages for hosting (static, no server required)

---

## Repository documentation

| Document | Purpose |
|---|---|
| [ROADMAP.md](ROADMAP.md) | What is planned and what is out of scope |
| [AGENT.md](AGENT.md) | Guide for AI agents working on this codebase |
| [docs/PRD.md](docs/PRD.md) | Full product requirements |
| [docs/architecture.md](docs/architecture.md) | Architecture and code conventions |
| [docs/spec/data-model.md](docs/spec/data-model.md) | Data model reference |
