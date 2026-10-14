import { useEffect, useRef, useState } from 'react';
import type { Draft } from '../types';

export interface NoteEditorProps {
  draft: Draft | null;
  onChange(patch: { title?: string; body?: string }): void;
  onSave(): void;
  onCancel(): void;
}

interface TouchedFields {
  title: boolean;
  body: boolean;
}

const UNTOUCHED: TouchedFields = { title: false, body: false };

// AC-12: an untouched form shows no error state. Feedback for a missing title
// or body appears only once that field was touched (changed or blurred) or a
// save was attempted. The form starts neutral and resets whenever a different
// note/draft session opens.
export function NoteEditor({ draft, onChange, onSave, onCancel }: NoteEditorProps) {
  const [touched, setTouched] = useState<TouchedFields>(UNTOUCHED);
  const [saveAttempted, setSaveAttempted] = useState(false);
  const previousDraft = useRef<Draft | null>(null);

  useEffect(() => {
    const previous = previousDraft.current;
    previousDraft.current = draft;
    if (draft === null) {
      return;
    }
    const openedNewSession =
      previous === null || previous.id !== draft.id;
    if (openedNewSession) {
      setTouched(UNTOUCHED);
      setSaveAttempted(false);
    }
  }, [draft]);

  if (!draft) {
    return (
      <section className="editor-pane" data-testid="note-editor" aria-label="Editor">
        <div className="empty-state" data-testid="editor-empty-state">
          <span className="empty-state__glyph" aria-hidden="true">✎</span>
          <p className="empty-state__title">Keine Notiz geöffnet</p>
          <p className="empty-state__help">Notiz auswählen oder „Neue Notiz“ anlegen.</p>
        </div>
      </section>
    );
  }

  const titleMissing = draft.title.trim().length === 0;
  const bodyMissing = draft.body.trim().length === 0;
  const showTitleError = (touched.title || saveAttempted) && titleMissing;
  const showBodyError = (touched.body || saveAttempted) && bodyMissing;

  const handleSave = (): void => {
    setSaveAttempted(true);
    if (titleMissing || bodyMissing) {
      return;
    }
    onSave();
  };

  return (
    <section className="editor-pane" data-testid="note-editor" aria-label="Editor">
      <div className="editor-pane__header">
        <div className="editor-pane__title-group">
          <input
            className={`editor-pane__title${showTitleError ? ' editor-pane__field--error' : ''}`}
            type="text"
            data-testid="editor-title"
            aria-label="Titel"
            aria-invalid={showTitleError}
            aria-describedby={showTitleError ? 'editor-title-error' : undefined}
            placeholder="Titel"
            value={draft.title}
            onChange={(event) => {
              setTouched((current) => ({ ...current, title: true }));
              onChange({ title: event.target.value });
            }}
            onBlur={() => setTouched((current) => ({ ...current, title: true }))}
          />
          {showTitleError ? (
            <p id="editor-title-error" className="editor-pane__error" data-testid="editor-title-error" role="alert">
              Bitte einen Titel eingeben.
            </p>
          ) : null}
        </div>
        <div className="editor-pane__actions">
          <button type="button" className="btn btn--ghost" data-testid="editor-cancel" onClick={onCancel}>
            Abbrechen
          </button>
          <button type="button" className="btn btn--primary" data-testid="editor-save" onClick={handleSave}>
            Speichern
          </button>
        </div>
      </div>
      <div className="editor-pane__body-group">
        <textarea
          className={`editor-pane__body${showBodyError ? ' editor-pane__field--error' : ''}`}
          data-testid="editor-body"
          aria-label="Notiztext"
          aria-invalid={showBodyError}
          aria-describedby={showBodyError ? 'editor-body-error' : undefined}
          placeholder="Notiz schreiben …"
          value={draft.body}
          onChange={(event) => {
            setTouched((current) => ({ ...current, body: true }));
            onChange({ body: event.target.value });
          }}
          onBlur={() => setTouched((current) => ({ ...current, body: true }))}
        />
        {showBodyError ? (
          <p id="editor-body-error" className="editor-pane__error" data-testid="editor-body-error" role="alert">
            Bitte einen Text eingeben.
          </p>
        ) : null}
      </div>
    </section>
  );
}
