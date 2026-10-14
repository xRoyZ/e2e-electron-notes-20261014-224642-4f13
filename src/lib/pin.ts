import type { Note } from '../types';

// Scaffold stub: flipping the pinned flag and bumping updatedAt is delivered
// by the pinning ticket. Keep the signature from the shared contract.
export function togglePin(notes: Note[], _id: string, _now: number): Note[] {
  return notes;
}
