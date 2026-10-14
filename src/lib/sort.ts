import type { Note } from '../types';

// Notes sorted for the list (AC-07, AC-08): pinned notes first, then the most
// recently changed note on top within each group. Equal timestamps keep their
// incoming order — the sort is stable, and so is the pinned/unpinned grouping.
// The input array is never mutated.
export function sortNotes(notes: Note[]): Note[] {
  return notes
    .map((note, index) => ({ note, index }))
    .sort((a, b) => {
      if (a.note.pinned !== b.note.pinned) {
        return a.note.pinned ? -1 : 1;
      }
      if (a.note.updatedAt !== b.note.updatedAt) {
        return b.note.updatedAt - a.note.updatedAt;
      }
      return a.index - b.index;
    })
    .map((entry) => entry.note);
}
