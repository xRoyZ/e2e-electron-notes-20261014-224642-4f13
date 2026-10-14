import type { Note, PersistedState, ThemeMode } from '../types';

export const STORAGE_KEY = 'notes-app:state';

const STORAGE_VERSION = 1;

const THEMES: readonly ThemeMode[] = ['light', 'dark', 'system'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isNote(value: unknown): value is Note {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.body === 'string' &&
    typeof value.pinned === 'boolean' &&
    isFiniteNumber(value.createdAt) &&
    isFiniteNumber(value.updatedAt)
  );
}

function parseState(raw: string): PersistedState | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!isRecord(parsed)) {
    return null;
  }
  if (parsed.version !== STORAGE_VERSION) {
    return null;
  }
  if (!Array.isArray(parsed.notes) || !parsed.notes.every(isNote)) {
    return null;
  }

  const theme = parsed.theme;
  if (typeof theme !== 'string' || !THEMES.includes(theme as ThemeMode)) {
    return null;
  }

  const selectedId = parsed.selectedId;
  if (selectedId !== null && typeof selectedId !== 'string') {
    return null;
  }

  return {
    version: STORAGE_VERSION,
    notes: parsed.notes as Note[],
    theme: theme as ThemeMode,
    selectedId,
  };
}

// Reads the single versioned entry. Anything absent, foreign or corrupt yields
// null so the app starts with an empty note set instead of crashing (AC-13).
// Note content is never logged or surfaced in an error message (AC-19).
export function loadState(): PersistedState | null {
  if (typeof window === 'undefined') {
    return null;
  }

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }

  if (raw === null) {
    return null;
  }

  return parseState(raw);
}

// Best-effort write of the one versioned entry. A full or unavailable store
// must never throw and never echo note content into an error (AC-19).
export function saveState(state: PersistedState): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Persistence is best-effort; a failed write leaves the in-memory state.
  }
}
