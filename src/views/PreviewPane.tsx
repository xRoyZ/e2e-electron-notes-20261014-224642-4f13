import { useCallback, type MouseEvent } from 'react';
import DOMPurify from 'dompurify';
import { renderMarkdown } from '../lib/markdown';
import { api } from '../platform';

export interface PreviewPaneProps {
  source: string;
}

function isExternalHttpUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

export function PreviewPane({ source }: PreviewPaneProps) {
  // Links in a preview must never navigate the app window away (AC-14): the
  // click is stopped here and handed to the platform bridge, which opens it in
  // the system browser. Non-http links are simply prevented.
  const handleClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null;
    const anchor = target?.closest('a');
    if (!anchor) {
      return;
    }
    event.preventDefault();
    const href = anchor.getAttribute('href');
    if (!href || !isExternalHttpUrl(href)) {
      return;
    }
    void api.openExternal(href).catch(() => {
      // The OS hand-off can fail and there is no in-app surface for it; the URL
      // is not logged because it may carry note text (AC-19).
    });
  }, []);

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
        onClick={handleClick}
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(renderMarkdown(source), { USE_PROFILES: { html: true } }) }}
      />
    </section>
  );
}
