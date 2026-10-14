import type { Note } from '../types';
import { removeNote } from './deletion';

export { removeNote };

// Stable, collision-resistant id for a note. Prefers the platform UUID
// generator and falls back to a time/random pair where it is unavailable.
function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `note-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// Creates a fresh note at `now` (epoch ms). A new note is never pinned.
export function createNote(title: string, body: string, now: number): Note {
  return {
    id: generateId(),
    title,
    body,
    pinned: false,
    createdAt: now,
    updatedAt: now,
  };
}

// Applies a partial edit to a note, bumping `updatedAt` to `now` and preserving
// id, pinned and createdAt. Fields absent from the patch are untouched.
export function applyEdit(note: Note, patch: { title?: string; body?: string }, now: number): Note {
  return {
    ...note,
    title: patch.title ?? note.title,
    body: patch.body ?? note.body,
    updatedAt: now,
  };
}
