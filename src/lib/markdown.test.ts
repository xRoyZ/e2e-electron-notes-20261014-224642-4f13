import { describe, expect, it } from 'vitest';
import { renderMarkdown } from './markdown';

// One case per markdown element the preview promises (AC-05), plus the
// raw-HTML case (AC-06).
describe('renderMarkdown', () => {
  it('renders headings', () => {
    expect(renderMarkdown('# Title')).toContain('<h1>Title</h1>');
    expect(renderMarkdown('## Subtitle')).toContain('<h2>Subtitle</h2>');
    expect(renderMarkdown('### Section')).toContain('<h3>Section</h3>');
  });

  it('renders bold text', () => {
    expect(renderMarkdown('**bold**')).toContain('<strong>bold</strong>');
  });

  it('renders italic text', () => {
    expect(renderMarkdown('*italic*')).toContain('<em>italic</em>');
  });

  it('renders unordered lists', () => {
    const html = renderMarkdown('- one\n- two');
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>one</li>');
    expect(html).toContain('<li>two</li>');
  });

  it('renders ordered lists', () => {
    const html = renderMarkdown('1. first\n2. second');
    expect(html).toContain('<ol>');
    expect(html).toContain('<li>first</li>');
    expect(html).toContain('<li>second</li>');
  });

  it('renders links as anchors', () => {
    const html = renderMarkdown('[OpenAI](https://openai.com)');
    expect(html).toContain('<a href="https://openai.com">OpenAI</a>');
  });

  it('renders inline code', () => {
    expect(renderMarkdown('Use `npm test` now')).toContain('<code>npm test</code>');
  });

  it('renders fenced code blocks', () => {
    const html = renderMarkdown('```\nconst x = 1;\n```');
    expect(html).toContain('<pre>');
    expect(html).toContain('<code>');
    expect(html).toContain('const x = 1;');
  });

  it('escapes raw HTML so it is shown as text, never executed', () => {
    const html = renderMarkdown('<script>alert(1)</script>');
    expect(html).not.toMatch(/<script/i);
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('alert(1)');
  });

  it('escapes inline raw HTML instead of rendering markup', () => {
    const html = renderMarkdown('before <img src=x onerror=alert(1)> after');
    expect(html).not.toMatch(/<img/i);
    expect(html).toContain('&lt;img');
    expect(html).toContain('&gt;');
  });

  it('drops dangerous link protocols', () => {
    const html = renderMarkdown('[click](javascript:alert(1))');
    expect(html).not.toMatch(/javascript:/i);
  });

  it('returns an empty string for empty input', () => {
    expect(renderMarkdown('')).toBe('');
    expect(renderMarkdown('   ')).toBe('');
  });
});
