export interface DeleteButtonProps {
  noteId: string;
  onDelete(id: string): void;
}

// Scaffold stub: renders a visibly disabled control so nothing on the screen
// is silently ineffective. The deletion ticket fills the confirmation flow.
export function DeleteButton({ noteId }: DeleteButtonProps) {
  return (
    <button
      type="button"
      className="icon-button delete-button"
      data-testid={`delete-button-${noteId}`}
      aria-label="Löschen"
      title="Löschen folgt in Kürze"
      disabled
    >
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          fill="currentColor"
          d="M9 3h6l1 2h4v2H4V5h4zm-3 6h12l-1 12H7zM10 10v8h1v-8zm3 0v8h1v-8z"
        />
      </svg>
    </button>
  );
}
