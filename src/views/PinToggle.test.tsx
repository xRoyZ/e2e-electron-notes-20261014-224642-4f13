import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { Note } from '../types';
import { PinToggle } from './PinToggle';

function note(partial: Partial<Note> = {}): Note {
  return {
    id: 'note-1',
    title: 'Titel',
    body: 'Text',
    pinned: false,
    createdAt: 0,
    updatedAt: 0,
    ...partial,
  };
}

describe('PinToggle', () => {
  afterEach(() => {
    cleanup();
  });

  it('is an enabled control that reports the id on click (AC-07)', () => {
    const onToggle = vi.fn();
    render(<PinToggle note={note()} onToggle={onToggle} />);

    const button = screen.getByTestId('pin-toggle-note-1') as HTMLButtonElement;
    expect(button.disabled).toBe(false);
    expect(button.getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(button);

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith('note-1');
  });

  it('shows a pinned note as pressed', () => {
    render(<PinToggle note={note({ pinned: true })} onToggle={() => {}} />);

    const button = screen.getByTestId('pin-toggle-note-1');
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.className).toContain('pin-toggle--pinned');
  });
});
