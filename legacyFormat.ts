// Helpers kept for data written by the older import format.

export function parseLegacy(text: string): unknown {
  if (typeof text !== 'string' || text.trim() === '') {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function legacyLabel(raw: unknown): string {
  return String(raw);
}
