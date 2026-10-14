import { describe, expect, it } from 'vitest';
import type { Note } from '../types';
import { sortNotes } from './sort';

function note(partial: Partial<Note> & { id: string }): Note {
  return {
    title: '',
    body: '',
    pinned: false,
    createdAt: 0,
    updatedAt: 0,
    ...partial,
  };
}

describe('sortNotes', () => {
  it('returns an empty array for an empty list', () => {
    expect(sortNotes([])).toEqual([]);
  });

  it('places every pinned note before every unpinned note', () => {
    const notes = [
      note({ id: 'a', pinned: false, updatedAt: 900 }),
      note({ id: 'b', pinned: true, updatedAt: 100 }),
      note({ id: 'c', pinned: false, updatedAt: 800 }),
      note({ id: 'd', pinned: true, updatedAt: 200 }),
    ];

    expect(sortNotes(notes).map((n) => n.id)).toEqual(['d', 'b', 'a', 'c']);
  });

  it('orders by updatedAt descending within each group', () => {
    const notes = [
      note({ id: 'a', pinned: false, updatedAt: 100 }),
      note({ id: 'b', pinned: false, updatedAt: 300 }),
      note({ id: 'c', pinned: false, updatedAt: 200 }),
      note({ id: 'd', pinned: true, updatedAt: 100 }),
      note({ id: 'e', pinned: true, updatedAt: 300 }),
      note({ id: 'f', pinned: true, updatedAt: 200 }),
    ];

    expect(sortNotes(notes).map((n) => n.id)).toEqual(['e', 'f', 'd', 'b', 'c', 'a']);
  });

  it('keeps the incoming order of notes with equal timestamps', () => {
    const notes = [
      note({ id: 'a', updatedAt: 500 }),
      note({ id: 'b', updatedAt: 500 }),
      note({ id: 'c', updatedAt: 500 }),
    ];

    expect(sortNotes(notes).map((n) => n.id)).toEqual(['a', 'b', 'c']);
  });

  it('keeps the pinned order stable on equal timestamps as well', () => {
    const notes = [
      note({ id: 'a', pinned: true, updatedAt: 500 }),
      note({ id: 'b', pinned: true, updatedAt: 500 }),
      note({ id: 'c', pinned: false, updatedAt: 500 }),
      note({ id: 'd', pinned: false, updatedAt: 500 }),
    ];

    expect(sortNotes(notes).map((n) => n.id)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('does not mutate the input array or its notes', () => {
    const notes = [
      note({ id: 'a', pinned: false, updatedAt: 100 }),
      note({ id: 'b', pinned: true, updatedAt: 200 }),
    ];
    const snapshot = notes.map((n) => ({ ...n }));

    const sorted = sortNotes(notes);

    expect(notes).toEqual(snapshot);
    expect(sorted).not.toBe(notes);
    expect(sorted.map((n) => n.id)).toEqual(['b', 'a']);
  });
});
