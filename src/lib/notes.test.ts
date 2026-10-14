import { describe, expect, it } from 'vitest';
import type { Note } from '../types';
import { applyEdit, createNote, removeNote } from './notes';

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: 'note-1',
    title: 'Alt',
    body: 'Alter Text',
    pinned: false,
    createdAt: 1_000,
    updatedAt: 2_000,
    ...overrides,
  };
}

describe('createNote', () => {
  it('creates an unpinned note with the given title, body and timestamps', () => {
    const note = createNote('Titel', 'Inhalt', 5_000);

    expect(note.title).toBe('Titel');
    expect(note.body).toBe('Inhalt');
    expect(note.pinned).toBe(false);
    expect(note.createdAt).toBe(5_000);
    expect(note.updatedAt).toBe(5_000);
  });

  it('generates a non-empty id for every note and never reuses one', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 50; i += 1) {
      const note = createNote('a', 'b', 1);
      expect(typeof note.id).toBe('string');
      expect(note.id.length).toBeGreaterThan(0);
      ids.add(note.id);
    }
    expect(ids.size).toBe(50);
  });
});

describe('applyEdit', () => {
  it('updates title and body immediately and bumps updatedAt', () => {
    const note = makeNote();

    const edited = applyEdit(note, { title: 'Neu', body: 'Neuer Text' }, 9_000);

    expect(edited.title).toBe('Neu');
    expect(edited.body).toBe('Neuer Text');
    expect(edited.updatedAt).toBe(9_000);
  });

  it('preserves id, pinned and createdAt and does not mutate the input', () => {
    const note = makeNote({ id: 'keep-id', pinned: true, createdAt: 42 });

    const edited = applyEdit(note, { title: 'Geändert' }, 9_000);

    expect(edited.id).toBe('keep-id');
    expect(edited.pinned).toBe(true);
    expect(edited.createdAt).toBe(42);
    expect(note.title).toBe('Alt');
    expect(note.updatedAt).toBe(2_000);
  });

  it('leaves a field absent from the patch untouched', () => {
    const note = makeNote({ title: 'Titel', body: 'Text' });

    const edited = applyEdit(note, { body: 'Neuer Text' }, 9_000);

    expect(edited.title).toBe('Titel');
    expect(edited.body).toBe('Neuer Text');
  });

  it('allows an explicit empty string to clear a field', () => {
    const note = makeNote({ title: 'Titel', body: 'Text' });

    const edited = applyEdit(note, { title: '' }, 9_000);

    expect(edited.title).toBe('');
    expect(edited.body).toBe('Text');
  });
});

describe('removeNote re-export', () => {
  it('is the single implementation from deletion.ts', () => {
    const notes = [makeNote({ id: 'a' }), makeNote({ id: 'b' })];

    expect(removeNote(notes, 'a')).toHaveLength(1);
  });
});
