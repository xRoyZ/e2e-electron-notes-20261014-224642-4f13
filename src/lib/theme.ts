import type { ThemeMode } from '../types';

// Resolve the theme the app should render with on start-up or when the stored
// choice changes. A stored explicit choice ('light' | 'dark') wins; 'system' or
// no stored value at all follows the operating system preference.
export function resolveInitialTheme(stored: ThemeMode | null, prefersDark: boolean): 'light' | 'dark' {
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  return prefersDark ? 'dark' : 'light';
}

// Write the resolved theme onto the document root. The CSS token set in
// styles.css reads `html[data-theme='dark']`, so every pane (list, editor and
// preview) switches with this one attribute.
export function applyTheme(theme: 'light' | 'dark'): void {
  if (typeof document === 'undefined') {
    return;
  }
  document.documentElement.setAttribute('data-theme', theme);
}
