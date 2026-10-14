import type { Note } from '../types';

export interface PinToggleProps {
  note: Note;
  onToggle(id: string): void;
}

// The pin control of a note row (AC-07). It reflects the note's pinned state
// through its pressed style and `aria-pressed`, and hands the id to the shell
// so the pinning and ordering become live.
export function PinToggle({ note, onToggle }: PinToggleProps) {
  const label = note.pinned ? 'Anheften aufheben' : 'Anheften';
  return (
    <button
      type="button"
      className={`icon-button pin-toggle${note.pinned ? ' pin-toggle--pinned' : ''}`}
      data-testid={`pin-toggle-${note.id}`}
      aria-pressed={note.pinned}
      aria-label={label}
      title={label}
      onClick={() => onToggle(note.id)}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          fill="currentColor"
          d="M14 3l7 7-2 2-1.2-.6-3.1 3.1.7 3.1-1.4 1.4-4.3-4.3-4.9 4.9-1.4-1.4 4.9-4.9L3.3 9.9l1.4-1.4 3.1.7 3.1-3.1L10.3 5z"
        />
      </svg>
    </button>
  );
}
