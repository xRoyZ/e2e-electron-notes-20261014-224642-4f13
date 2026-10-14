import type { Note } from '../types';
import { NoteRow } from './NoteRow';

// Contract props are fixed by the sprint's shared interface. The pin/delete
// callbacks are the shell's wiring for NoteRow and are kept optional so the
// contract's required shape is unchanged.
export interface NoteListProps {
  notes: Note[];
  query: string;
  selectedId: string | null;
  onQueryChange(q: string): void;
  onSelect(id: string): void;
  onNewNote(): void;
  onTogglePin?(id: string): void;
  onDelete?(id: string): void;
}

function noop(): void {
  // intentionally empty fallback
}

export function NoteList({
  notes,
  query,
  selectedId,
  onQueryChange,
  onSelect,
  onNewNote,
  onTogglePin,
  onDelete,
}: NoteListProps) {
  const togglePin = onTogglePin ?? noop;
  const removeNote = onDelete ?? noop;
  const hasQuery = query.trim().length > 0;

  return (
    <aside className="note-list" data-testid="note-list" aria-label="Notizen">
      <div className="note-list__toolbar">
        <div className="search-input">
          <svg className="search-input__icon" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              d="M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM15.5 15.5 20 20"
            />
          </svg>
          <input
            className="search-input__field"
            type="search"
            data-testid="search-input"
            aria-label="Notizen durchsuchen"
            placeholder="Notizen durchsuchen"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </div>
        <button type="button" className="btn btn--primary btn--block" data-testid="new-note" onClick={onNewNote}>
          Neue Notiz
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="empty-state" data-testid="list-empty-state">
          <span className="empty-state__glyph" aria-hidden="true">◍</span>
          <p className="empty-state__title">{hasQuery ? 'Keine Notizen gefunden' : 'Noch keine Notizen'}</p>
          <p className="empty-state__help">
            {hasQuery ? 'Suchbegriff prüfen oder Feld leeren.' : 'Erste Notiz mit „Neue Notiz“ anlegen.'}
          </p>
        </div>
      ) : (
        <ul className="note-list__items">
          {notes.map((note) => (
            <NoteRow
              key={note.id}
              note={note}
              selected={note.id === selectedId}
              onSelect={onSelect}
              onTogglePin={togglePin}
              onDelete={removeNote}
            />
          ))}
        </ul>
      )}
    </aside>
  );
}
