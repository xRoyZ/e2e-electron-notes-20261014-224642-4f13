import { createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { Note, PersistedState } from '../types';
import { removeNote } from './deletion';
import { loadState, saveState } from './storage';
import { DeleteButton } from '../views/DeleteButton';

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: 'note-1',
    title: 'Titel',
    body: 'Text',
    pinned: false,
    createdAt: 1_000,
    updatedAt: 2_000,
    ...overrides,
  };
}

function storedDump(): string {
  const parts: string[] = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (key === null) continue;
    parts.push(key, window.localStorage.getItem(key) ?? '');
  }
  return parts.join('\n');
}

describe('removeNote', () => {
  it('drops exactly the requested note and keeps the other notes unchanged', () => {
    const keep = makeNote({ id: 'keep', title: 'Behalten', body: 'bleibt' });
    const drop = makeNote({ id: 'drop', title: 'Weg', body: 'verschwindet' });

    const result = removeNote([keep, drop], 'drop');

    expect(result).toHaveLength(1);
    expect(result[0]).toBe(keep);
  });

  it('is a no-op for an unknown id', () => {
    const notes = [makeNote({ id: 'a' }), makeNote({ id: 'b' })];

    const result = removeNote(notes, 'does-not-exist');

    expect(result).toHaveLength(2);
    expect(result[0]).toBe(notes[0]);
    expect(result[1]).toBe(notes[1]);
  });

  it('does not mutate the input array', () => {
    const notes = [makeNote({ id: 'a' }), makeNote({ id: 'b' })];

    removeNote(notes, 'a');

    expect(notes).toHaveLength(2);
  });
});

describe('deletion persistence (AC-20)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('removes the deleted note title and body from the stored state', () => {
    const secretTitle = 'Vertraulicher Titel 4711';
    const secretBody = 'Vertraulicher Inhalt 4711';
    const other = makeNote({ id: 'other', title: 'Andere Notiz', body: 'Anderer Inhalt' });
    const doomed = makeNote({ id: 'doomed', title: secretTitle, body: secretBody });

    const before: PersistedState = {
      version: 1,
      notes: [doomed, other],
      theme: 'system',
      selectedId: 'doomed',
    };
    saveState(before);

    const after: PersistedState = {
      ...before,
      notes: removeNote(before.notes, 'doomed'),
      selectedId: null,
    };
    saveState(after);

    expect(storedDump()).not.toContain(secretTitle);
    expect(storedDump()).not.toContain(secretBody);

    const reloaded = loadState();
    if (reloaded !== null) {
      expect(reloaded.notes.some((note) => note.id === 'doomed')).toBe(false);
      expect(JSON.stringify(reloaded)).not.toContain(secretTitle);
      expect(JSON.stringify(reloaded)).not.toContain(secretBody);
    }
  });
});

describe('DeleteButton confirmation flow', () => {
  let onDelete: (id: string) => void;

  beforeEach(() => {
    onDelete = vi.fn<(id: string) => void>();
  });

  afterEach(() => {
    cleanup();
  });

  function renderButton(): void {
    render(createElement(DeleteButton, { noteId: 'note-7', onDelete }));
  }

  it('renders an enabled control', () => {
    renderButton();

    const button = screen.getByTestId('delete-button-note-7');
    expect((button as HTMLButtonElement).disabled).toBe(false);
  });

  it('asks for confirmation and only deletes after confirming', () => {
    renderButton();

    fireEvent.click(screen.getByTestId('delete-button-note-7'));

    expect(screen.getByTestId('delete-dialog-note-7')).toBeTruthy();
    expect(onDelete).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('delete-confirm-note-7'));

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith('note-7');
    expect(screen.queryByTestId('delete-dialog-note-7')).toBeNull();
  });

  it('cancels without deleting', () => {
    renderButton();

    fireEvent.click(screen.getByTestId('delete-button-note-7'));
    fireEvent.click(screen.getByTestId('delete-cancel-note-7'));

    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.queryByTestId('delete-dialog-note-7')).toBeNull();
  });

  it('cancels on Escape without deleting', () => {
    renderButton();

    fireEvent.click(screen.getByTestId('delete-button-note-7'));
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.queryByTestId('delete-dialog-note-7')).toBeNull();
  });
});
