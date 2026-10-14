import type { Draft } from '../types';

export interface NoteEditorProps {
  draft: Draft | null;
  onChange(patch: { title?: string; body?: string }): void;
  onSave(): void;
  onCancel(): void;
}

export function NoteEditor({ draft, onChange, onSave, onCancel }: NoteEditorProps) {
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

  return (
    <section className="editor-pane" data-testid="note-editor" aria-label="Editor">
      <div className="editor-pane__header">
        <input
          className="editor-pane__title"
          type="text"
          data-testid="editor-title"
          aria-label="Titel"
          placeholder="Titel"
          value={draft.title}
          onChange={(event) => onChange({ title: event.target.value })}
        />
        <div className="editor-pane__actions">
          <button type="button" className="btn btn--ghost" data-testid="editor-cancel" onClick={onCancel}>
            Abbrechen
          </button>
          <button type="button" className="btn btn--primary" data-testid="editor-save" onClick={onSave}>
            Speichern
          </button>
        </div>
      </div>
      <textarea
        className="editor-pane__body"
        data-testid="editor-body"
        aria-label="Notiztext"
        placeholder="Notiz schreiben …"
        value={draft.body}
        onChange={(event) => onChange({ body: event.target.value })}
      />
    </section>
  );
}
