import DOMPurify from 'dompurify';
import { renderMarkdown } from '../lib/markdown';

export interface PreviewPaneProps {
  source: string;
}

export function PreviewPane({ source }: PreviewPaneProps) {
  const isEmpty = source.trim().length === 0;
  if (isEmpty) {
    return (
      <section className="preview-pane" data-testid="preview-pane" aria-label="Markdown-Vorschau">
        <div className="empty-state" data-testid="preview-empty-state">
          <span className="empty-state__glyph" aria-hidden="true">¶</span>
          <p className="empty-state__title">Keine Vorschau</p>
          <p className="empty-state__help">Text im Editor eingeben, um die Vorschau zu sehen.</p>
        </div>
      </section>
    );
  }
  // renderMarkdown is contractually required to sanitize; the DOMPurify pass at
  // the injection site is defence in depth for untrusted note text.
  return (
    <section className="preview-pane" data-testid="preview-pane" aria-label="Markdown-Vorschau">
      <div
        className="preview-pane__content"
        data-testid="preview-content"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(renderMarkdown(source), { USE_PROFILES: { html: true } }) }}
      />
    </section>
  );
}
