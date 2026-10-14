import type { Note } from '../types';

export interface PinToggleProps {
  note: Note;
  onToggle(id: string): void;
}

// Scaffold stub: renders a visibly disabled control so nothing on the screen
// is silently ineffective. The pinning ticket fills the real behaviour.
export function PinToggle({ note }: PinToggleProps) {
  return (
    <button
      type="button"
      className="icon-button pin-toggle"
      data-testid={`pin-toggle-${note.id}`}
      aria-pressed={note.pinned}
      aria-label={note.pinned ? 'Angeheftet' : 'Anheften'}
      title="Anheften folgt in Kürze"
      disabled
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
