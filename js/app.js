'use strict';

// ============================================================
// STATE
// ============================================================

const STORAGE_KEY = 'tyov_character';

const MEMORY_MAX      = 5;
const EXPERIENCE_MAX  = 3;

function blankState() {
  return {
    name:         '',
    promptNumber: '',
    createdAt:    null,
    memories:     [],
    skills:       [],
    resources:    [],
    characters:   [],
    marks:        [],
    archive: {
      memories:   [],
      skills:     [],
      resources:  [],
      characters: [],
      marks:      [],
    },
  };
}

function blankMemory() {
  return { id: uid(), title: '', experiences: [] };
}

function blankExperience() {
  return { id: uid(), text: '' };
}

function blankSkill(text = '') {
  return { id: uid(), text, crossed: false };
}

function blankResource(text = '') {
  return { id: uid(), text, crossed: false };
}

function blankCharacter(name = '') {
  return { id: uid(), name, desc: '', mortal: true, alive: true };
}

function blankMark(text = '') {
  return { id: uid(), text };
}

let state = blankState();
let resolutionMode = false;

// ============================================================
// PERSISTENCE
// ============================================================

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = JSON.parse(raw);
  } catch (_) {
    state = blankState();
  }
}

// ============================================================
// UTILITIES
// ============================================================

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function $(selector, root = document) {
  return root.querySelector(selector);
}

function $$(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

// ============================================================
// RENDER — MEMORIES
// ============================================================

function renderMemories() {
  const list = $('#memories-list');
  list.innerHTML = '';

  state.memories.forEach((memory) => {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.dataset.id = memory.id;

    // Title row
    const titleRow = document.createElement('div');
    titleRow.className = 'memory-title-row';

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.className = 'memory-title-input';
    titleInput.placeholder = 'A memory begins…';
    titleInput.value = memory.title;
    titleInput.addEventListener('input', () => {
      memory.title = titleInput.value;
      save();
    });

    const actions = document.createElement('div');
    actions.className = 'memory-actions';

    const archiveBtn = document.createElement('button');
    archiveBtn.className = 'btn-icon btn-archive';
    archiveBtn.title = 'Archive this memory';
    archiveBtn.textContent = '✕';
    archiveBtn.addEventListener('click', () => archiveMemory(memory.id));

    actions.appendChild(archiveBtn);
    titleRow.appendChild(titleInput);
    titleRow.appendChild(actions);
    card.appendChild(titleRow);

    // Experiences
    const expList = document.createElement('div');
    expList.className = 'experiences-list';

    memory.experiences.forEach((exp) => {
      expList.appendChild(buildExperienceRow(memory, exp));
    });

    card.appendChild(expList);

    // Add experience or full message
    if (memory.experiences.length >= EXPERIENCE_MAX) {
      const fullMsg = document.createElement('p');
      fullMsg.className = 'memory-full-msg';
      fullMsg.textContent = 'This memory is full.';
      card.appendChild(fullMsg);
    } else {
      const addExpRow = document.createElement('div');
      addExpRow.className = 'memory-add-experience';

      const addExpBtn = document.createElement('button');
      addExpBtn.className = 'btn-add';
      addExpBtn.textContent = '+ Experience';
      addExpBtn.addEventListener('click', () => {
        memory.experiences.push(blankExperience());
        save();
        renderMemories();
      });

      addExpRow.appendChild(addExpBtn);
      card.appendChild(addExpRow);
    }

    // Resolution mode click handler
    if (resolutionMode) {
      card.addEventListener('click', () => resolveMemory(memory.id));
    }

    list.appendChild(card);
  });
}

function buildExperienceRow(memory, exp) {
  const row = document.createElement('div');
  row.className = 'experience-row';

  const textarea = document.createElement('textarea');
  textarea.className = 'experience-input';
  textarea.placeholder = 'What happened…';
  textarea.rows = 1;
  textarea.value = exp.text;
  textarea.addEventListener('input', () => {
    exp.text = textarea.value;
    autoResize(textarea);
    save();
  });
  autoResize(textarea);

  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'experience-actions';

  const archiveBtn = document.createElement('button');
  archiveBtn.className = 'btn-icon btn-archive';
  archiveBtn.title = 'Remove experience';
  archiveBtn.textContent = '✕';
  archiveBtn.addEventListener('click', () => {
    memory.experiences = memory.experiences.filter(e => e.id !== exp.id);
    save();
    renderMemories();
  });

  actionsDiv.appendChild(archiveBtn);
  row.appendChild(textarea);
  row.appendChild(actionsDiv);
  return row;
}

function autoResize(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
}

// ============================================================
// RESOLUTION MODE
// ============================================================

function enterResolutionMode() {
  resolutionMode = true;
  document.body.classList.add('resolution-mode');
  $('#resolution-overlay').classList.remove('hidden');
  renderMemories();
}

function exitResolutionMode() {
  resolutionMode = false;
  document.body.classList.remove('resolution-mode');
  $('#resolution-overlay').classList.add('hidden');
}

function resolveMemory(id) {
  archiveMemory(id, { skipResolutionExit: false, fromResolution: true });
}

function archiveMemory(id, opts = {}) {
  const idx = state.memories.findIndex(m => m.id === id);
  if (idx === -1) return;
  const [removed] = state.memories.splice(idx, 1);
  state.archive.memories.push(removed);
  save();

  if (resolutionMode) {
    exitResolutionMode();
    // Add the pending new memory
    state.memories.push(blankMemory());
    save();
  }

  renderMemories();
  renderArchive();
}

// ============================================================
// RENDER — SKILLS & RESOURCES (shared list pattern)
// ============================================================

function renderEntryList(listId, items, onUpdate) {
  const list = $(listId);
  list.innerHTML = '';

  items.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'entry-row';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'entry-text' + (item.crossed ? ' crossed' : '');
    input.value = item.text;
    input.addEventListener('input', () => {
      item.text = input.value;
      save();
      onUpdate();
    });

    const actions = document.createElement('div');
    actions.className = 'entry-actions';

    // Strikethrough toggle (Skills/Resources only — if item has 'crossed' property)
    if ('crossed' in item) {
      const strikeBtn = document.createElement('button');
      strikeBtn.className = 'btn-icon btn-strikethrough' + (item.crossed ? ' active' : '');
      strikeBtn.title = item.crossed ? 'Restore' : 'Mark as lost';
      strikeBtn.textContent = '—';
      strikeBtn.addEventListener('click', () => {
        item.crossed = !item.crossed;
        save();
        onUpdate();
      });
      actions.appendChild(strikeBtn);
    }

    const archiveBtn = document.createElement('button');
    archiveBtn.className = 'btn-icon btn-archive';
    archiveBtn.title = 'Archive';
    archiveBtn.textContent = '✕';
    archiveBtn.addEventListener('click', () => {
      const idx = items.findIndex(i => i.id === item.id);
      if (idx !== -1) items.splice(idx, 1);
      save();
      onUpdate();
    });

    actions.appendChild(archiveBtn);
    row.appendChild(input);
    row.appendChild(actions);
    list.appendChild(row);
  });
}

function renderSkills() {
  renderEntryList('#skills-list', state.skills, () => {
    renderSkills();
    renderArchive();
  });
}

function renderResources() {
  renderEntryList('#resources-list', state.resources, () => {
    renderResources();
    renderArchive();
  });
}

function renderMarks() {
  renderEntryList('#marks-list', state.marks, () => {
    renderMarks();
    renderArchive();
  });
}

// ============================================================
// RENDER — CHARACTERS
// ============================================================

function renderCharacters() {
  const list = $('#characters-list');
  list.innerHTML = '';

  state.characters.forEach((char) => {
    const card = document.createElement('div');
    card.className = 'character-card' + (!char.alive ? ' dead' : '');
    card.dataset.id = char.id;

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'character-name-field';
    nameInput.placeholder = 'Name…';
    nameInput.value = char.name;
    nameInput.addEventListener('input', () => {
      char.name = nameInput.value;
      save();
    });

    const descInput = document.createElement('input');
    descInput.type = 'text';
    descInput.className = 'character-desc-field';
    descInput.placeholder = 'A brief note…';
    descInput.value = char.desc;
    descInput.addEventListener('input', () => {
      char.desc = descInput.value;
      save();
    });

    const toggles = document.createElement('div');
    toggles.className = 'character-toggles';

    const mortalBtn = document.createElement('button');
    mortalBtn.className = 'toggle-btn ' + (char.mortal ? 'mortal' : 'immortal');
    mortalBtn.textContent = char.mortal ? 'Mortal' : 'Immortal';
    mortalBtn.addEventListener('click', () => {
      char.mortal = !char.mortal;
      save();
      renderCharacters();
    });

    const aliveBtn = document.createElement('button');
    aliveBtn.className = 'toggle-btn ' + (char.alive ? 'alive' : 'dead');
    aliveBtn.textContent = char.alive ? 'Alive' : 'Dead';
    aliveBtn.addEventListener('click', () => {
      char.alive = !char.alive;
      save();
      renderCharacters();
    });

    toggles.appendChild(mortalBtn);
    toggles.appendChild(aliveBtn);

    const actions = document.createElement('div');
    actions.className = 'character-actions';

    const archiveBtn = document.createElement('button');
    archiveBtn.className = 'btn-icon btn-archive';
    archiveBtn.title = 'Archive character';
    archiveBtn.textContent = '✕';
    archiveBtn.addEventListener('click', () => {
      const idx = state.characters.findIndex(c => c.id === char.id);
      if (idx !== -1) {
        const [removed] = state.characters.splice(idx, 1);
        state.archive.characters.push(removed);
        save();
        renderCharacters();
        renderArchive();
      }
    });

    actions.appendChild(archiveBtn);

    card.appendChild(nameInput);
    card.appendChild(descInput);
    card.appendChild(toggles);
    card.appendChild(actions);
    list.appendChild(card);
  });
}

// ============================================================
// RENDER — ARCHIVE
// ============================================================

function renderArchive() {
  renderArchiveMemories();
  renderArchiveList('#archive-skills-list',     state.archive.skills);
  renderArchiveList('#archive-resources-list',  state.archive.resources);
  renderArchiveCharacters();
  renderArchiveList('#archive-marks-list',      state.archive.marks);
}

function renderArchiveMemories() {
  const list = $('#archive-memories-list');
  list.innerHTML = '';

  if (!state.archive.memories.length) {
    list.innerHTML = '<p class="archive-empty">Nothing forgotten yet.</p>';
    return;
  }

  state.archive.memories.forEach((memory) => {
    const card = document.createElement('div');
    card.className = 'archive-memory-card';

    const title = document.createElement('p');
    title.className = 'archive-memory-title';
    title.textContent = memory.title || '(untitled memory)';
    card.appendChild(title);

    memory.experiences.forEach((exp) => {
      if (!exp.text) return;
      const item = document.createElement('p');
      item.className = 'archive-experience-item';
      item.textContent = exp.text;
      card.appendChild(item);
    });

    list.appendChild(card);
  });
}

function renderArchiveList(selector, items) {
  const list = $(selector);
  list.innerHTML = '';

  if (!items.length) {
    list.innerHTML = '<p class="archive-empty">Nothing here.</p>';
    return;
  }

  items.forEach((item) => {
    const p = document.createElement('p');
    p.className = 'archive-entry';
    p.textContent = item.text || '(empty)';
    list.appendChild(p);
  });
}

function renderArchiveCharacters() {
  const list = $('#archive-characters-list');
  list.innerHTML = '';

  if (!state.archive.characters.length) {
    list.innerHTML = '<p class="archive-empty">None lost yet.</p>';
    return;
  }

  state.archive.characters.forEach((char) => {
    const row = document.createElement('div');
    row.className = 'archive-character-entry';

    const name = document.createElement('span');
    name.className = 'archive-character-name';
    name.textContent = char.name || '(unnamed)';

    const meta = document.createElement('span');
    meta.className = 'archive-character-meta';
    meta.textContent = [
      char.mortal ? 'Mortal' : 'Immortal',
      char.alive  ? 'Alive'  : 'Dead',
      char.desc,
    ].filter(Boolean).join(' · ');

    row.appendChild(name);
    row.appendChild(meta);
    list.appendChild(row);
  });
}

// ============================================================
// HEADER
// ============================================================

function renderHeader() {
  const nameInput   = $('#character-name');
  const promptInput = $('#prompt-number');

  nameInput.value   = state.name;
  promptInput.value = state.promptNumber;

  nameInput.addEventListener('input', () => {
    state.name = nameInput.value;
    if (!state.createdAt) state.createdAt = new Date().toISOString();
    save();
  });

  promptInput.addEventListener('input', () => {
    const val = parseInt(promptInput.value, 10);
    state.promptNumber = isNaN(val) || val < 1 ? '' : val;
    promptInput.value = state.promptNumber;
    save();
  });
}

// ============================================================
// ADD ACTIONS
// ============================================================

function bindAddMemory() {
  $('#btn-add-memory').addEventListener('click', () => {
    if (resolutionMode) return;

    if (state.memories.length >= MEMORY_MAX) {
      enterResolutionMode();
      return;
    }

    state.memories.push(blankMemory());
    save();
    renderMemories();
  });
}

function bindAddSkill() {
  const input = $('#new-skill-input');
  const btn   = $('#btn-add-skill');

  function addSkill() {
    const text = input.value.trim();
    if (!text) return;
    state.skills.push(blankSkill(text));
    input.value = '';
    save();
    renderSkills();
  }

  btn.addEventListener('click', addSkill);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') addSkill(); });
}

function bindAddResource() {
  const input = $('#new-resource-input');
  const btn   = $('#btn-add-resource');

  function addResource() {
    const text = input.value.trim();
    if (!text) return;
    state.resources.push(blankResource(text));
    input.value = '';
    save();
    renderResources();
  }

  btn.addEventListener('click', addResource);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') addResource(); });
}

function bindAddCharacter() {
  const input = $('#new-character-input');
  const btn   = $('#btn-add-character');

  function addCharacter() {
    const name = input.value.trim();
    if (!name) return;
    state.characters.push(blankCharacter(name));
    input.value = '';
    save();
    renderCharacters();
  }

  btn.addEventListener('click', addCharacter);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') addCharacter(); });
}

function bindAddMark() {
  const input = $('#new-mark-input');
  const btn   = $('#btn-add-mark');

  function addMark() {
    const text = input.value.trim();
    if (!text) return;
    state.marks.push(blankMark(text));
    input.value = '';
    save();
    renderMarks();
  }

  btn.addEventListener('click', addMark);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') addMark(); });
}

// ============================================================
// ARCHIVE TOGGLE
// ============================================================

function bindArchiveToggle() {
  const btn    = $('#btn-toggle-archive');
  const drawer = $('#archive-drawer');

  btn.addEventListener('click', () => {
    const isOpen = !drawer.classList.contains('hidden');
    if (isOpen) {
      drawer.classList.add('hidden');
      btn.textContent = 'Show Archive';
      btn.setAttribute('aria-expanded', 'false');
    } else {
      drawer.classList.remove('hidden');
      btn.textContent = 'Hide Archive';
      btn.setAttribute('aria-expanded', 'true');
    }
  });
}

// ============================================================
// INIT
// ============================================================

function init() {
  load();
  renderHeader();
  renderMemories();
  renderSkills();
  renderResources();
  renderCharacters();
  renderMarks();
  renderArchive();

  bindAddMemory();
  bindAddSkill();
  bindAddResource();
  bindAddCharacter();
  bindAddMark();
  bindArchiveToggle();
}

document.addEventListener('DOMContentLoaded', init);
