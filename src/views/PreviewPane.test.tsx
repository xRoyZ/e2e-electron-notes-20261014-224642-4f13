import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PreviewPane } from './PreviewPane';

// Preview pane behaviour: live formatted rendering (AC-05), raw HTML shown as
// text (AC-06) and external links handed to the platform bridge so the app
// window never navigates away (AC-14).
describe('PreviewPane', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders formatted markdown into the content region', () => {
    render(<PreviewPane source={'# Title\n\n**bold** and *italic*'} />);
    const html = screen.getByTestId('preview-content').innerHTML;
    expect(html).toContain('<h1>Title</h1>');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<em>italic</em>');
  });

  it('shows raw HTML as escaped text instead of executing it', () => {
    render(<PreviewPane source={'<script>alert(1)</script>'} />);
    const html = screen.getByTestId('preview-content').innerHTML;
    expect(html).not.toContain('<script');
    expect(html).toContain('&lt;script&gt;');
  });

  it('handles a link click through the platform bridge instead of navigating', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<PreviewPane source={'[example](https://example.com)'} />);

    fireEvent.click(screen.getByText('example'));

    expect(openSpy).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
  });

  it('updates while the source changes without stealing focus from the editor', () => {
    const { rerender } = render(
      <div>
        <textarea data-testid="editor" />
        <PreviewPane source={'# First'} />
      </div>,
    );
    const editor = screen.getByTestId('editor') as HTMLTextAreaElement;
    editor.focus();
    expect(document.activeElement).toBe(editor);

    rerender(
      <div>
        <textarea data-testid="editor" />
        <PreviewPane source={'# First\n\nsecond paragraph'} />
      </div>,
    );

    expect(document.activeElement).toBe(editor);
    expect(screen.getByTestId('preview-content').innerHTML).toContain('second paragraph');
  });
});
