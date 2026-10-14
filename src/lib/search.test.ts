import { describe, expect, it } from 'vitest';
import type { Note } from '../types';
import { filterNotes } from './search';

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

const notes: Note[] = [
  note({ id: 'a', title: 'Shopping list', body: 'Milk and bread' }),
  note({ id: 'b', title: 'Project ideas', body: 'Build a notes app' }),
  note({ id: 'c', title: 'Groceries', body: 'Apples, pears' }),
];

describe('filterNotes', () => {
  it('returns all notes unchanged for an empty query', () => {
    const result = filterNotes(notes, '');
    expect(result).toEqual(notes);
    expect(result).toHaveLength(3);
  });

  it('returns all notes unchanged for a whitespace-only query', () => {
    const result = filterNotes(notes, '   \t  ');
    expect(result).toEqual(notes);
    expect(result).toHaveLength(3);
  });

  it('returns an empty list when nothing matches', () => {
    expect(filterNotes(notes, 'zzz')).toEqual([]);
  });

  it('matches case-insensitively', () => {
    expect(filterNotes(notes, 'SHOPPING').map((n) => n.id)).toEqual(['a']);
    expect(filterNotes(notes, 'shopping').map((n) => n.id)).toEqual(['a']);
  });

  it('matches inside the title', () => {
    expect(filterNotes(notes, 'project').map((n) => n.id)).toEqual(['b']);
  });

  it('matches inside the body', () => {
    expect(filterNotes(notes, 'bread').map((n) => n.id)).toEqual(['a']);
  });

  it('matches a partial word', () => {
    expect(filterNotes(notes, 'grocer').map((n) => n.id)).toEqual(['c']);
  });

  it('preserves the original order of matching notes', () => {
    const result = filterNotes(notes, 'a');
    expect(result.map((n) => n.id)).toEqual(['a', 'b', 'c']);
  });
});
