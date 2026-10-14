import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { applyTheme, resolveInitialTheme } from './theme';

describe('resolveInitialTheme', () => {
  it('keeps a stored light choice regardless of the system preference', () => {
    expect(resolveInitialTheme('light', true)).toBe('light');
    expect(resolveInitialTheme('light', false)).toBe('light');
  });

  it('keeps a stored dark choice regardless of the system preference', () => {
    expect(resolveInitialTheme('dark', true)).toBe('dark');
    expect(resolveInitialTheme('dark', false)).toBe('dark');
  });

  it("follows the system preference when the choice is 'system'", () => {
    expect(resolveInitialTheme('system', true)).toBe('dark');
    expect(resolveInitialTheme('system', false)).toBe('light');
  });

  it('follows the system preference when nothing is stored', () => {
    expect(resolveInitialTheme(null, true)).toBe('dark');
    expect(resolveInitialTheme(null, false)).toBe('light');
  });
});

describe('applyTheme', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  it('sets the light theme attribute the design tokens read', () => {
    applyTheme('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('sets the dark theme attribute the design tokens read', () => {
    applyTheme('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('switches the attribute back and forth', () => {
    applyTheme('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    applyTheme('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
