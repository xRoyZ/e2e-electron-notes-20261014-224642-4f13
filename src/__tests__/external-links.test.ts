import { beforeAll, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import vm from 'node:vm';

// The main process is a CommonJS entry that calls `require('electron')` at load
// time, so it cannot simply be imported in a test. It is evaluated in a `vm`
// sandbox with a stubbed `electron`, which exercises the real file without ever
// launching Electron (AC-14).
type Handler = (event: { preventDefault: () => void }, url: string) => void;
type OpenHandler = (details: { url: string }) => { action: string };

interface Harness {
  exports: {
    isInternalUrl(target: string): boolean;
    isSafeExternalUrl(url: string): boolean;
  };
  ipcHandlers: Record<string, (event: unknown, url: unknown) => unknown>;
  windowOpenHandlers: OpenHandler[];
  willNavigateHandlers: Handler[];
  openExternal: ReturnType<typeof vi.fn>;
}

function loadMain(): Harness {
  const nodeRequire = createRequire(import.meta.url);
  const ipcHandlers: Harness['ipcHandlers'] = {};
  const windowOpenHandlers: OpenHandler[] = [];
  const willNavigateHandlers: Handler[] = [];
  const openExternal = vi.fn(async () => undefined);

  const electronMock = {
    app: {
      isPackaged: true,
      whenReady: () => Promise.resolve(),
      on: () => {},
      quit: () => {},
    },
    BrowserWindow: class {
      webContents = {
        setWindowOpenHandler: (fn: OpenHandler) => {
          windowOpenHandlers.push(fn);
        },
        on: (name: string, fn: Handler) => {
          if (name === 'will-navigate') {
            willNavigateHandlers.push(fn);
          }
        },
      };
      once() {}
      show() {}
      loadURL() {}
      loadFile() {}
      static getAllWindows() {
        return [];
      }
    },
    ipcMain: {
      handle: (channel: string, fn: (event: unknown, url: unknown) => unknown) => {
        ipcHandlers[channel] = fn;
      },
    },
    session: { defaultSession: { webRequest: { onHeadersReceived: () => {} } } },
    shell: { openExternal },
  };

  const electronDir = path.resolve(process.cwd(), 'electron');
  const filename = path.join(electronDir, 'main.cjs');
  const sandbox: Record<string, unknown> = {
    require: (id: string) => (id === 'electron' ? electronMock : nodeRequire(id)),
    module: { exports: {} as Record<string, unknown> },
    exports: {},
    __dirname: electronDir,
    __filename: filename,
    process,
    URL,
    console,
  };
  sandbox.exports = sandbox.module;
  vm.createContext(sandbox);
  vm.runInContext(readFileSync(filename, 'utf8'), sandbox, { filename });

  const moduleExports = (sandbox.module as { exports: Harness['exports'] }).exports;
  return { exports: moduleExports, ipcHandlers, windowOpenHandlers, willNavigateHandlers, openExternal };
}

let harness: Harness;

beforeAll(() => {
  harness = loadMain();
});

const indexUrl = () => {
  const { pathToFileURL } = createRequire(import.meta.url)('node:url') as typeof import('node:url');
  return pathToFileURL(path.resolve(process.cwd(), 'dist', 'index.html')).href;
};

describe('isSafeExternalUrl', () => {
  it('accepts http and https URLs', () => {
    expect(harness.exports.isSafeExternalUrl('http://example.com')).toBe(true);
    expect(harness.exports.isSafeExternalUrl('https://example.com/a?b=1#c')).toBe(true);
  });

  it('refuses every other scheme and malformed input', () => {
    expect(harness.exports.isSafeExternalUrl('file:///etc/passwd')).toBe(false);
    expect(harness.exports.isSafeExternalUrl('javascript:alert(1)')).toBe(false);
    expect(harness.exports.isSafeExternalUrl('mailto:a@b.c')).toBe(false);
    expect(harness.exports.isSafeExternalUrl('ftp://example.com')).toBe(false);
    expect(harness.exports.isSafeExternalUrl('not a url')).toBe(false);
    expect(harness.exports.isSafeExternalUrl('')).toBe(false);
    expect(harness.exports.isSafeExternalUrl(undefined as unknown as string)).toBe(false);
    expect(harness.exports.isSafeExternalUrl(42 as unknown as string)).toBe(false);
  });
});

describe('isInternalUrl', () => {
  it('accepts the built dist/index.html, with an optional hash or query', () => {
    expect(harness.exports.isInternalUrl(indexUrl())).toBe(true);
    expect(harness.exports.isInternalUrl(`${indexUrl()}#section`)).toBe(true);
    expect(harness.exports.isInternalUrl(`${indexUrl()}?x=1`)).toBe(true);
  });

  it('refuses everything that is not the app page', () => {
    expect(harness.exports.isInternalUrl('https://example.com')).toBe(false);
    expect(harness.exports.isInternalUrl('file:///app/dist/other.html')).toBe(false);
    expect(harness.exports.isInternalUrl('file:///etc/passwd')).toBe(false);
    expect(harness.exports.isInternalUrl('')).toBe(false);
  });
});

describe('open-external handler', () => {
  it('opens an http(s) URL through shell.openExternal', async () => {
    await harness.ipcHandlers['open-external']({}, 'https://example.com');
    expect(harness.openExternal).toHaveBeenCalledWith('https://example.com');
  });

  it('ignores every non-http(s) scheme', async () => {
    harness.openExternal.mockClear();
    await harness.ipcHandlers['open-external']({}, 'file:///etc/passwd');
    await harness.ipcHandlers['open-external']({}, 'javascript:alert(1)');
    expect(harness.openExternal).not.toHaveBeenCalled();
  });
});

describe('window navigation guards', () => {
  it('registers will-navigate and setWindowOpenHandler', () => {
    expect(harness.willNavigateHandlers.length).toBeGreaterThan(0);
    expect(harness.windowOpenHandlers.length).toBeGreaterThan(0);
  });

  it('will-navigate prevents a foreign target and allows the app page', () => {
    const handler = harness.willNavigateHandlers[0];
    const foreignEvent = { preventDefault: vi.fn() };
    handler(foreignEvent, 'https://example.com');
    expect(foreignEvent.preventDefault).toHaveBeenCalled();

    const internalEvent = { preventDefault: vi.fn() };
    handler(internalEvent, indexUrl());
    expect(internalEvent.preventDefault).not.toHaveBeenCalled();
  });

  it('setWindowOpenHandler denies every foreign target', () => {
    const handler = harness.windowOpenHandlers[0];
    expect(handler({ url: 'https://example.com' })).toEqual({ action: 'deny' });
    expect(handler({ url: 'file:///etc/passwd' })).toEqual({ action: 'deny' });
  });
});
