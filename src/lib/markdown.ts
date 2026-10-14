import DOMPurify from 'dompurify';
import { marked, Renderer, type Tokens } from 'marked';

// Contract (src/types shared interface): renderMarkdown(source) returns
// sanitized HTML. Raw HTML inside the note text is escaped and rendered as
// literal text, never as markup (AC-06), and the result is additionally run
// through DOMPurify as defence in depth.

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => HTML_ESCAPES[character]);
}

// A note's raw HTML must be shown, not executed. The default marked renderer
// would pass it through verbatim, so the `html` hook turns every HTML token
// (block or inline) into its escaped text form.
function createRenderer(): Renderer {
  const renderer = new Renderer();
  renderer.html = ({ text, block }: Tokens.HTML | Tokens.Tag): string => {
    const escaped = escapeHtml(text);
    return block ? `<p>${escaped}</p>\n` : escaped;
  };
  return renderer;
}

export function renderMarkdown(source: string): string {
  if (source.trim().length === 0) {
    return '';
  }
  const rawHtml = marked(source, {
    renderer: createRenderer(),
    async: false,
    gfm: true,
    breaks: false,
  });
  return DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true } });
}
