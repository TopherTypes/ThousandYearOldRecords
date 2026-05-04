# Thousand Year Old Vampire — Character Record Web App
## Product Requirements Document

**Version:** 1.0  
**Format:** Single-page web app, HTML + Vanilla JS, browser localStorage only

---

## 1. Purpose & Scope

A lightweight, offline-capable character record tool for solo play of *Thousand Year Old Vampire*. The player uses this alongside the physical book. The app tracks character state, enforces mechanical constraints, and archives (never deletes) lost content.

---

## 2. Users & Context

Single user, solo play session. No accounts, no sync, no server. All data lives in `localStorage`. Designed for desktop-first but responsive enough for tablet use.

---

## 3. Core Entities & Data Model

### Character
- Name (text)
- Prompt Number (integer, manual input)
- Created date (auto-set on first save)

### Memories (max 5 in play)
- Each Memory has:
  - A title or opening phrase (short text)
  - Up to 3 Experiences (each a short text entry)
- Overflow rule: if a 6th Memory would be created, the player is prompted to choose one existing Memory to archive before the new one is added

### Experiences
- Belong to a Memory
- Max 3 per Memory — adding a 4th is blocked with a clear message

### Skills
- Text entries, no cap
- Can be marked as **crossed out** (lost) without deletion

### Resources
- Text entries, no cap
- Can be marked as **crossed out** (lost) without deletion

### Characters
- Name + short descriptor/note
- Type: **Mortal** or **Immortal** (toggleable)
- Status: **Alive** or **Dead** (toggleable)
- No cap on number of characters

### Marks
- Freeform text entries representing physical or psychological marks on the vampire
- No cap

### Archive
- Holds all archived Memories (with their Experiences intact), Skills, Resources, Characters, and Marks
- Read-only in play view
- Hidden by default; revealed via a toggle

---

## 4. Screens & Layout

### Single Page Layout

**Header**
- Character name (editable inline)
- Prompt number field (numeric input, labelled "Current Prompt")

**Main Play Area** (sections, scrollable)
1. Memories
2. Skills
3. Resources
4. Characters
5. Marks

**Footer / Toggle**
- "Show Archive" — reveals archived content below or in a drawer, grouped by type

---

## 5. Feature Specifications

### 5.1 Memories

- Display up to 5 Memory cards in the play view
- Each card shows its title/phrase and its list of Experiences
- **Add Memory** button:
  - If fewer than 5 Memories exist: adds a new empty Memory
  - If exactly 5 Memories exist: the app enters **Resolution Mode** — all current Memories are highlighted and the player must click one to archive; only then is the new Memory added
- **Add Experience** within a Memory:
  - Blocked at 3 with inline message: *"This memory is full."*
- Each Memory and each Experience has an **Edit** and **Archive** action
- Archiving a Memory moves it (with all Experiences intact) to the Archive

### 5.2 Resolution Mode (Memory Overflow)

- Triggered when the player attempts to add a 6th Memory
- All 5 current Memory cards receive a visual "choose me" affordance
- A contextual prompt appears: *"Your oldest self must be forgotten. Choose a memory to lose."*
- Player clicks a Memory to archive it
- New Memory is then created
- Resolution Mode cannot be dismissed without completing the choice

### 5.3 Skills & Resources

- Flat list with an **Add** input field
- Each entry has:
  - **Strikethrough toggle** — marks it as lost; entry remains visible but visually distinguished
  - **Archive** action — removes from play view entirely

### 5.4 Characters

- List of character cards
- Fields per character: Name, short descriptor/note
- Toggle: **Mortal / Immortal**
- Toggle: **Alive / Dead**
- Visual treatment: dead characters shown with reduced opacity or struck name
- **Archive** action removes from play view

### 5.5 Marks

- Simple list of text entries
- Add / Edit / Archive per entry

### 5.6 Archive

- Hidden by default; toggled visible via "Show Archive" control
- Groups archived content by type: Memories, Skills, Resources, Characters, Marks
- **Read-only** — no editing, no restoring
- The past is permanent

### 5.7 Prompt Number

- Single numeric input in the header
- Persisted to `localStorage` on every change
- Accepts positive integers only

---

## 6. Data Persistence

- All state saved to `localStorage` on every change (no manual save button required)
- Single JSON blob stored under the key `tyov_character`
- On load: restore full state from storage, or initialise a blank character if none exists
- No data is ever permanently deleted; archiving is the only removal action

---

## 7. Mechanical Constraints Summary

| Entity | Active Cap | Overflow Behaviour |
|---|---|---|
| Memories | 5 | Player chooses one to archive before 6th is added (Resolution Mode) |
| Experiences | 3 per Memory | Blocked with inline message; no overflow |
| Skills | None | Strikethrough for lost; Archive removes from play view |
| Resources | None | Same as Skills |
| Characters | None | Archiveable |
| Marks | None | Archiveable |

---

## 8. Out of Scope (v1)

- Prompt navigation or prompt text display
- Journal or diary entries
- Multiple characters or save slots
- Export, print, or share
- Undo / redo
- Theming or user customisation
- Cloud sync or cross-device support

---

## 9. Design Notes

- **Tone:** Gothic, minimal. Dark background, legible serif or elegant sans-serif typography. Nothing bright or gamey.
- **No hard deletes:** Every removal action archives. Nothing is permanently destroyed.
- **Resolution Mode** should feel momentous — this is a significant in-game moment, not a routine dialog. Visual treatment should mark it as different from normal interactions.
- The archive should feel like a crypt, not a recycle bin — present, solemn, inaccessible.
