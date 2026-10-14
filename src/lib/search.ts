import type { Note } from '../types';

// Scaffold stub: live filtering over title and body is delivered by the
// search ticket. Keep the signature from the shared contract.
export function filterNotes(notes: Note[], _query: string): Note[] {
  return notes;
}
