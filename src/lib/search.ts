import type { Note } from '../types';

// Live filtering over note titles and text (AC-04): a case-insensitive
// substring match on either field. An empty or whitespace-only query leaves
// every note in place, order untouched.
export function filterNotes(notes: Note[], query: string): Note[] {
  const needle = query.trim().toLowerCase();
  if (needle === '') {
    return notes;
  }
  return notes.filter((note) => {
    const title = note.title.toLowerCase();
    const body = note.body.toLowerCase();
    return title.includes(needle) || body.includes(needle);
  });
}
