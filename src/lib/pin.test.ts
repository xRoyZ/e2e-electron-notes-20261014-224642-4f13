import { describe, expect, it } from 'vitest';
import type { Note } from '../types';
import { togglePin } from './pin';

function note(partial: Partial<Note> & { id: string }): Note {
  return {
    title: 'Titel',
    body: 'Text',
    pinned: false,
    createdAt: 1_000,
    updatedAt: 2_000,
    ...partial,
  };
}

describe('togglePin', () => {
  it('pins an unpinned note', () => {
    const notes = [note({ id: 'a', pinned: false })];

    const result = togglePin(notes, 'a', 5_000);

    expect(result[0].pinned).toBe(true);
  });

  it('unpins a pinned note', () => {
    const notes = [note({ id: 'a', pinned: true })];

    const result = togglePin(notes, 'a', 5_000);

    expect(result[0].pinned).toBe(false);
  });

  it('sets updatedAt to now while preserving the other fields', () => {
    const notes = [note({ id: 'a', pinned: false, title: 'Behalten', createdAt: 42 })];

    const result = togglePin(notes, 'a', 9_000);

    expect(result[0].updatedAt).toBe(9_000);
    expect(result[0].id).toBe('a');
    expect(result[0].title).toBe('Behalten');
    expect(result[0].createdAt).toBe(42);
  });

  it('changes only the matching note and keeps the others by reference', () => {
    const untouched = note({ id: 'b', pinned: true, updatedAt: 111 });
    const notes = [note({ id: 'a' }), untouched, note({ id: 'c' })];

    const result = togglePin(notes, 'b', 7_000);

    expect(result).toHaveLength(3);
    expect(result[0]).toBe(notes[0]);
    expect(result[1]).not.toBe(untouched);
    expect(result[1].pinned).toBe(false);
    expect(result[1].updatedAt).toBe(7_000);
    expect(result[2]).toBe(notes[2]);
  });

  it('does not mutate the input array or its notes', () => {
    const original = note({ id: 'a', pinned: false, updatedAt: 2_000 });
    const notes = [original];

    const result = togglePin(notes, 'a', 5_000);

    expect(result).not.toBe(notes);
    expect(original.pinned).toBe(false);
    expect(original.updatedAt).toBe(2_000);
    expect(notes[0]).toBe(original);
  });

  it('leaves the list unchanged for an unknown id', () => {
    const notes = [note({ id: 'a' }), note({ id: 'b', pinned: true })];

    const result = togglePin(notes, 'missing', 5_000);

    expect(result).toEqual(notes);
    expect(result[0]).toBe(notes[0]);
    expect(result[1]).toBe(notes[1]);
  });
});
