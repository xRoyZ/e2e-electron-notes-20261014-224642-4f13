import type { PersistedState } from '../types';

export const STORAGE_KEY = 'notes-app:state';

// Scaffold stub: persistence is filled in by the note creation/editing ticket.
// The contract is fixed, so the signature and the versioned shape are final.
export function loadState(): PersistedState | null {
  return null;
}

export function saveState(_state: PersistedState): void {
  // no-op until the persistence ticket implements the versioned writer
}
