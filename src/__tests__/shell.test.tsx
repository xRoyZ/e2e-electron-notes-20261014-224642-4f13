import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import App from '../App';

// Structure-only shell tests. They assert only what is true both before and
// after the feature tickets fill the stubs, and never assert placeholder copy
// or note content.
describe('app shell', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the three-pane shell', () => {
    render(<App />);

    expect(screen.getByTestId('app-header')).toBeTruthy();
    expect(screen.getByTestId('note-list')).toBeTruthy();
    expect(screen.getByTestId('note-editor')).toBeTruthy();
    expect(screen.getByTestId('preview-pane')).toBeTruthy();
  });

  it('mounts every registered view as a reachable region', () => {
    render(<App />);

    expect(screen.getByLabelText('Notizen')).toBeTruthy();
    expect(screen.getByLabelText('Editor')).toBeTruthy();
    expect(screen.getByLabelText('Markdown-Vorschau')).toBeTruthy();
  });

  it('switches the theme through the mode toggle', () => {
    render(<App />);

    fireEvent.click(screen.getByTestId('theme-dark'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(screen.getByTestId('theme-dark').getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(screen.getByTestId('theme-light'));
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(screen.getByTestId('theme-light').getAttribute('aria-pressed')).toBe('true');
  });
});
