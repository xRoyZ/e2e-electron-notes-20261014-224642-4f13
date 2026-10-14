export interface Note {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Draft {
  id: string | null;
  title: string;
  body: string;
}

export interface AppState {
  notes: Note[];
  theme: ThemeMode;
  selectedId: string | null;
  query: string;
  draft: Draft | null;
}

export interface PersistedState {
  version: 1;
  notes: Note[];
  theme: ThemeMode;
  selectedId: string | null;
}
