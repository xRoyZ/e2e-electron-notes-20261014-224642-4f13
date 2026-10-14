import type { ThemeMode } from '../types';

// Scaffold stub: reading the stored/system preference is delivered by the
// theme ticket. The one real interaction the scaffold ships is applyTheme,
// which the toolbar toggle uses to switch the appearance immediately.
export function resolveInitialTheme(_stored: ThemeMode | null, _prefersDark: boolean): 'light' | 'dark' {
  return 'light';
}

export function applyTheme(theme: 'light' | 'dark'): void {
  if (typeof document === 'undefined') {
    return;
  }
  document.documentElement.setAttribute('data-theme', theme);
}
