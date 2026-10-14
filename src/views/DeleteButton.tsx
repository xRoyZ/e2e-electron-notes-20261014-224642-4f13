import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface DeleteButtonProps {
  noteId: string;
  onDelete(id: string): void;
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Deletes a note only after the user confirms it in the modal (AC-03). The
// dialog follows the DESIGN.md ConfirmDialog spec: scrim, Esc/scrim cancel,
// trapped focus and 'Löschen' autofocused as the last action.
export function DeleteButton({ noteId, onDelete }: DeleteButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
  }, []);

  const confirmDelete = useCallback(() => {
    setDialogOpen(false);
    onDelete(noteId);
  }, [noteId, onDelete]);

  useEffect(() => {
    if (!dialogOpen) {
      return undefined;
    }

    confirmRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeDialog();
        return;
      }
      if (event.key !== 'Tab') {
        return;
      }
      const dialog = dialogRef.current;
      if (dialog === null) {
        return;
      }
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) {
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dialogOpen, closeDialog]);

  const dialog = dialogOpen
    ? createPortal(
        <div
          className="confirm-dialog__scrim"
          data-testid={`delete-scrim-${noteId}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDialog();
            }
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`delete-dialog-title-${noteId}`}
            aria-describedby={`delete-dialog-body-${noteId}`}
            className="confirm-dialog"
            data-testid={`delete-dialog-${noteId}`}
          >
            <h2 id={`delete-dialog-title-${noteId}`} className="confirm-dialog__title">
              Notiz löschen?
            </h2>
            <p id={`delete-dialog-body-${noteId}`} className="confirm-dialog__body">
              Möchtest du diese Notiz wirklich löschen? Das kann nicht rückgängig gemacht werden.
            </p>
            <div className="confirm-dialog__actions">
              <button
                type="button"
                className="btn btn--ghost"
                data-testid={`delete-cancel-${noteId}`}
                onClick={closeDialog}
              >
                Abbrechen
              </button>
              <button
                ref={confirmRef}
                type="button"
                className="btn btn--danger"
                data-testid={`delete-confirm-${noteId}`}
                onClick={confirmDelete}
              >
                Löschen
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <button
        type="button"
        className="icon-button delete-button"
        data-testid={`delete-button-${noteId}`}
        aria-label="Löschen"
        title="Löschen"
        onClick={() => setDialogOpen(true)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            fill="currentColor"
            d="M9 3h6l1 2h4v2H4V5h4zm-3 6h12l-1 12H7zM10 10v8h1v-8zm3 0v8h1v-8z"
          />
        </svg>
      </button>
      {dialog}
    </>
  );
}
