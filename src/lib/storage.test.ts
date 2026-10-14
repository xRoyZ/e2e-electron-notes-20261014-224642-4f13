import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PersistedState } from '../types';
import { STORAGE_KEY, loadState, saveState } from './storage';

function sampleState(): PersistedState {
  return {
    version: 1,
    notes: [
      {
        id: 'n1',
        title: 'Notiz',
        body: 'Inhalt',
        pinned: false,
        createdAt: 1_000,
        updatedAt: 2_000,
      },
    ],
    theme: 'dark',
    selectedId: 'n1',
  };
}

describe('storage round trip', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('saves and reloads the very same state', () => {
    const state = sampleState();

    saveState(state);

    expect(loadState()).toEqual(state);
  });

  it('writes exactly one versioned entry under the agreed key', () => {
    saveState(sampleState());

    expect(window.localStorage.length).toBe(1);
    expect(window.localStorage.getItem(STORAGE_KEY)).not.toBeNull();
    const raw = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}');
    expect(raw.version).toBe(1);
  });
});

describe('loadState edge cases', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns null when nothing is stored', () => {
    expect(loadState()).toBeNull();
  });

  it('returns null for malformed JSON instead of throwing', () => {
    window.localStorage.setItem(STORAGE_KEY, '{not json');

    expect(loadState()).toBeNull();
  });

  it('returns null for foreign data (wrong version)', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 99, notes: [], theme: 'system', selectedId: null }));

    expect(loadState()).toBeNull();
  });

  it('returns null for a foreign shape that is not a state object', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify('hello'));

    expect(loadState()).toBeNull();
  });

  it('returns null when a note entry is not a valid note', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, notes: [{ id: 1 }], theme: 'system', selectedId: null }),
    );

    expect(loadState()).toBeNull();
  });

  it('returns null for an unknown theme value', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, notes: [], theme: 'neon', selectedId: null }),
    );

    expect(loadState()).toBeNull();
  });

  it('never throws when the store cannot be read', () => {
    const spy = vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
      throw new Error('store unavailable');
    });

    expect(() => loadState()).not.toThrow();
    expect(loadState()).toBeNull();

    spy.mockRestore();
  });
});

describe('saveState robustness', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('does not throw when the store rejects the write', () => {
    const spy = vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });

    expect(() => saveState(sampleState())).not.toThrow();

    spy.mockRestore();
  });
});
