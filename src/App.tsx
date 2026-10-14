import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AppState, PersistedState, ThemeMode } from './types';
import { loadState, saveState } from './lib/storage';
import { createNote, applyEdit } from './lib/notes';
import { removeNote } from './lib/deletion';
import { filterNotes } from './lib/search';
import { sortNotes } from './lib/sort';
import { togglePin } from './lib/pin';
import { resolveInitialTheme, applyTheme } from './lib/theme';
import { NoteList } from './views/NoteList';
import { NoteEditor } from './views/NoteEditor';
import { PreviewPane } from './views/PreviewPane';

function systemPrefersDark(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function createInitialState(): AppState {
  const stored = loadState();
  return {
    notes: stored?.notes ?? [],
    theme: stored?.theme ?? 'system',
    selectedId: stored?.selectedId ?? null,
    query: '',
    draft: null,
  };
}

function ModeToggle({ theme, onSelect }: { theme: 'light' | 'dark'; onSelect(mode: 'light' | 'dark'): void }) {
  return (
    <div className="mode-toggle" role="group" aria-label="Erscheinungsbild">
      <button
        type="button"
        className={`mode-toggle__segment${theme === 'light' ? ' is-active' : ''}`}
        data-testid="theme-light"
        aria-pressed={theme === 'light'}
        aria-label="Heller Modus"
        onClick={() => onSelect('light')}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"
          />
        </svg>
      </button>
      <button
        type="button"
        className={`mode-toggle__segment${theme === 'dark' ? ' is-active' : ''}`}
        data-testid="theme-dark"
        aria-pressed={theme === 'dark'}
        aria-label="Dunkler Modus"
        onClick={() => onSelect('dark')}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path fill="currentColor" d="M20 14.5A8 8 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
        </svg>
      </button>
    </div>
  );
}

function AppHeader({
  theme,
  onTheme,
  onNewNote,
}: {
  theme: 'light' | 'dark';
  onTheme(mode: ThemeMode): void;
  onNewNote(): void;
}) {
  return (
    <header className="app-header" data-testid="app-header">
      <span className="app-header__title">Notizen</span>
      <div className="app-header__actions">
        <button type="button" className="btn btn--primary" data-testid="header-new-note" onClick={onNewNote}>
          Neue Notiz
        </button>
        <ModeToggle theme={theme} onSelect={onTheme} />
      </div>
    </header>
  );
}

export default function App() {
  const [state, setState] = useState<AppState>(createInitialState);

  const resolvedTheme: 'light' | 'dark' =
    state.theme === 'system' ? resolveInitialTheme(null, systemPrefersDark()) : state.theme;

  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    const persisted: PersistedState = {
      version: 1,
      notes: state.notes,
      theme: state.theme,
      selectedId: state.selectedId,
    };
    saveState(persisted);
  }, [state.notes, state.theme, state.selectedId]);

  const visibleNotes = useMemo(
    () => sortNotes(filterNotes(state.notes, state.query)),
    [state.notes, state.query],
  );

  const selectedNote = useMemo(
    () => state.notes.find((note) => note.id === state.selectedId) ?? null,
    [state.notes, state.selectedId],
  );

  const previewSource = state.draft ? state.draft.body : selectedNote?.body ?? '';

  const handleNewNote = useCallback(() => {
    setState((current) => ({
      ...current,
      draft: { id: null, title: '', body: '' },
      selectedId: null,
    }));
  }, []);

  const handleSelect = useCallback((id: string) => {
    setState((current) => {
      const note = current.notes.find((entry) => entry.id === id);
      if (!note) {
        return { ...current, selectedId: id, draft: null };
      }
      return {
        ...current,
        selectedId: id,
        draft: { id: note.id, title: note.title, body: note.body },
      };
    });
  }, []);

  const handleQueryChange = useCallback((query: string) => {
    setState((current) => ({ ...current, query }));
  }, []);

  const handleChangeDraft = useCallback((patch: { title?: string; body?: string }) => {
    setState((current) =>
      current.draft ? { ...current, draft: { ...current.draft, ...patch } } : current,
    );
  }, []);

  const handleSave = useCallback(() => {
    setState((current) => {
      if (!current.draft) {
        return current;
      }
      const now = Date.now();
      if (current.draft.id === null) {
        const note = createNote(current.draft.title, current.draft.body, now);
        return {
          ...current,
          notes: [note, ...current.notes],
          draft: { id: note.id, title: note.title, body: note.body },
          selectedId: note.id,
        };
      }
      const draft = current.draft;
      return {
        ...current,
        notes: current.notes.map((note) =>
          note.id === draft.id ? applyEdit(note, { title: draft.title, body: draft.body }, now) : note,
        ),
        draft: { id: draft.id, title: draft.title, body: draft.body },
        selectedId: draft.id,
      };
    });
  }, []);

  const handleCancel = useCallback(() => {
    setState((current) => ({ ...current, draft: null }));
  }, []);

  const handleTogglePin = useCallback((id: string) => {
    setState((current) => ({ ...current, notes: togglePin(current.notes, id, Date.now()) }));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      notes: removeNote(current.notes, id),
      selectedId: current.selectedId === id ? null : current.selectedId,
      draft: current.draft?.id === id ? null : current.draft,
    }));
  }, []);

  const handleTheme = useCallback((theme: ThemeMode) => {
    setState((current) => ({ ...current, theme }));
  }, []);

  return (
    <div className="app">
      <AppHeader theme={resolvedTheme} onTheme={handleTheme} onNewNote={handleNewNote} />
      <div className="app-body">
        <NoteList
          notes={visibleNotes}
          query={state.query}
          selectedId={state.selectedId}
          onQueryChange={handleQueryChange}
          onSelect={handleSelect}
          onNewNote={handleNewNote}
          onTogglePin={handleTogglePin}
          onDelete={handleDelete}
        />
        <NoteEditor
          draft={state.draft}
          onChange={handleChangeDraft}
          onSave={handleSave}
          onCancel={handleCancel}
        />
        <PreviewPane source={previewSource} />
      </div>
    </div>
  );
}
