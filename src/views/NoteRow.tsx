import type { Note } from '../types';
import { PinToggle } from './PinToggle';
import { DeleteButton } from './DeleteButton';

export interface NoteRowProps {
  note: Note;
  selected: boolean;
  onSelect(id: string): void;
  onTogglePin(id: string): void;
  onDelete(id: string): void;
}

// The one shared timestamp format of the product: local time, 'TT.MM.JJJJ HH:MM'.
export function formatTimestamp(value: number): string {
  if (!Number.isFinite(value)) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function snippet(body: string): string {
  const line = body.replace(/\s+/g, ' ').trim();
  return line.length > 80 ? `${line.slice(0, 80)}…` : line;
}

export function NoteRow({ note, selected, onSelect, onTogglePin, onDelete }: NoteRowProps) {
  return (
    <li className={`note-row${selected ? ' note-row--selected' : ''}`} data-testid={`note-row-${note.id}`}>
      <button type="button" className="note-row__body" onClick={() => onSelect(note.id)}>
        <span className="note-row__title-line">
          {note.pinned ? <span className="note-row__pin" aria-hidden="true">★</span> : null}
          <span className="note-row__title">{note.title || 'Ohne Titel'}</span>
        </span>
        <span className="note-row__snippet">{snippet(note.body) || 'Kein Text'}</span>
        <span className="note-row__timestamp">{formatTimestamp(note.updatedAt)}</span>
      </button>
      <div className="note-row__actions">
        <PinToggle note={note} onToggle={onTogglePin} />
        <DeleteButton noteId={note.id} onDelete={onDelete} />
      </div>
    </li>
  );
}
