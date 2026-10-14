import type { Note } from '../types';

// Pure deletion logic. The caller has already obtained the user's confirmation
// (AC-03); removeNote simply drops the matching note and leaves every other
// note object untouched so list, editor and preview all converge on the
// remaining set. An unknown id is a no-op that returns the same notes.
export function removeNote(notes: Note[], id: string): Note[] {
  return notes.filter((note) => note.id !== id);
}
