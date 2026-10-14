import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import App from '../App';
import { loadState } from '../lib/storage';

// End-to-end wiring for the note pipeline through the real shell: create a
// note, see it in the list immediately, edit it, and confirm both survive into
// the persisted state a restart would read back.
describe('note create/edit flow', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    cleanup();
  });

  it('adds a saved note to the list immediately and persists it', () => {
    const { container } = render(<App />);

    fireEvent.click(screen.getByTestId('header-new-note'));
    fireEvent.change(screen.getByTestId('editor-title'), { target: { value: 'Einkauf' } });
    fireEvent.change(screen.getByTestId('editor-body'), { target: { value: 'Milch und Brot' } });
    fireEvent.click(screen.getByTestId('editor-save'));

    const rows = container.querySelectorAll('.note-row');
    expect(rows).toHaveLength(1);
    expect(rows[0].textContent).toContain('Einkauf');

    const persisted = loadState();
    expect(persisted?.notes).toHaveLength(1);
    expect(persisted?.notes[0].title).toBe('Einkauf');
    expect(persisted?.notes[0].body).toBe('Milch und Brot');
  });

  it('opens a selected note in the editor and shows an edit in list and editor', () => {
    const { container } = render(<App />);

    fireEvent.click(screen.getByTestId('header-new-note'));
    fireEvent.change(screen.getByTestId('editor-title'), { target: { value: 'Erster Titel' } });
    fireEvent.change(screen.getByTestId('editor-body'), { target: { value: 'Erster Text' } });
    fireEvent.click(screen.getByTestId('editor-save'));

    const row = container.querySelector('.note-row__body');
    expect(row).not.toBeNull();
    fireEvent.click(row as Element);

    const titleInput = screen.getByTestId('editor-title') as HTMLInputElement;
    expect(titleInput.value).toBe('Erster Titel');

    fireEvent.change(titleInput, { target: { value: 'Zweiter Titel' } });
    fireEvent.click(screen.getByTestId('editor-save'));

    expect(screen.getByTestId('editor-title')).toHaveProperty('value', 'Zweiter Titel');
    expect(container.querySelector('.note-row')?.textContent).toContain('Zweiter Titel');

    const persisted = loadState();
    expect(persisted?.notes[0].title).toBe('Zweiter Titel');
    expect(persisted?.notes[0].body).toBe('Erster Text');
  });
});
