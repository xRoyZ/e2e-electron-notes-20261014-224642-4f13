import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { Draft } from '../types';
import { NoteEditor } from './NoteEditor';

interface HarnessProps {
  initialDraft: Draft;
  onSave?: () => void;
  onCancel?: () => void;
}

// Mirrors the shell: the draft is controlled state, so typing actually updates
// the value the editor validates against.
function Harness({ initialDraft, onSave = () => {}, onCancel = () => {} }: HarnessProps) {
  const [draft, setDraft] = useState<Draft>(initialDraft);
  return (
    <NoteEditor
      draft={draft}
      onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
      onSave={onSave}
      onCancel={onCancel}
    />
  );
}

describe('NoteEditor validation (AC-12)', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows no error state on an untouched form', () => {
    render(<Harness initialDraft={{ id: null, title: '', body: '' }} />);

    expect(screen.queryByTestId('editor-title-error')).toBeNull();
    expect(screen.queryByTestId('editor-body-error')).toBeNull();
  });

  it('reveals both missing-field hints only after a save attempt', () => {
    const onSave = vi.fn();
    render(<Harness initialDraft={{ id: null, title: '', body: '' }} onSave={onSave} />);

    fireEvent.click(screen.getByTestId('editor-save'));

    expect(screen.getByTestId('editor-title-error')).toBeTruthy();
    expect(screen.getByTestId('editor-body-error')).toBeTruthy();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('reveals a field hint once that field was touched', () => {
    render(<Harness initialDraft={{ id: null, title: '', body: '' }} />);

    fireEvent.change(screen.getByTestId('editor-title'), { target: { value: 'a' } });
    fireEvent.change(screen.getByTestId('editor-title'), { target: { value: '' } });

    expect(screen.getByTestId('editor-title-error')).toBeTruthy();
    expect(screen.queryByTestId('editor-body-error')).toBeNull();
  });

  it('saves once both fields are filled and shows no error', () => {
    const onSave = vi.fn();
    render(<Harness initialDraft={{ id: null, title: '', body: '' }} onSave={onSave} />);

    fireEvent.change(screen.getByTestId('editor-title'), { target: { value: 'Titel' } });
    fireEvent.change(screen.getByTestId('editor-body'), { target: { value: 'Text' } });
    fireEvent.click(screen.getByTestId('editor-save'));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('editor-title-error')).toBeNull();
    expect(screen.queryByTestId('editor-body-error')).toBeNull();
  });

  it('blocks save while the body is still empty after a title was entered', () => {
    const onSave = vi.fn();
    render(<Harness initialDraft={{ id: null, title: '', body: '' }} onSave={onSave} />);

    fireEvent.change(screen.getByTestId('editor-title'), { target: { value: 'Titel' } });
    fireEvent.click(screen.getByTestId('editor-save'));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByTestId('editor-body-error')).toBeTruthy();
    expect(screen.queryByTestId('editor-title-error')).toBeNull();
  });

  it('resets the touched state when a different note opens', () => {
    const noop = () => {};
    const view = render(
      <NoteEditor draft={{ id: null, title: '', body: '' }} onChange={noop} onSave={noop} onCancel={noop} />,
    );
    fireEvent.click(screen.getByTestId('editor-save'));
    expect(screen.getByTestId('editor-title-error')).toBeTruthy();

    view.rerender(
      <NoteEditor
        draft={{ id: 'n2', title: 'Andere', body: 'Inhalt' }}
        onChange={noop}
        onSave={noop}
        onCancel={noop}
      />,
    );

    expect(screen.queryByTestId('editor-title-error')).toBeNull();
    expect(screen.queryByTestId('editor-body-error')).toBeNull();
  });
});
