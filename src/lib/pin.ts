import type { Note } from '../types';

// Toggles the pinned flag of the note with `id` and stamps `updatedAt` with
// `now` (AC-07). Returns a new array: the matching note is replaced by a copy,
// every other note keeps its reference, and the input array is never mutated.
// An unknown id leaves every note unchanged.
export function togglePin(notes: Note[], id: string, now: number): Note[] {
  return notes.map((note) =>
    note.id === id ? { ...note, pinned: !note.pinned, updatedAt: now } : note,
  );
}
