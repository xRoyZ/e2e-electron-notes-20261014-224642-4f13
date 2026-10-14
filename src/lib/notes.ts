import type { Note } from '../types';
import { removeNote } from './deletion';

export { removeNote };

// Scaffold stub: createNote returns a shaped placeholder so the shell stays
// stable. The real id/timestamp handling is delivered by the note editing
// ticket; the signature is part of the shared contract.
export function createNote(title: string, body: string, now: number): Note {
  return {
    id: `stub-${now}`,
    title,
    body,
    pinned: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function applyEdit(note: Note, _patch: { title?: string; body?: string }, _now: number): Note {
  return note;
}
