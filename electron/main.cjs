'use strict';

const { app, BrowserWindow, ipcMain, session, shell } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const isDev = !app.isPackaged;
const devServerUrl = process.env.VITE_DEV_SERVER_URL || '';

// The one address the app window is allowed to be on: its own built
// dist/index.html. Anything else is a foreign target and gets refused by the
// navigation guards below (AC-14).
const INDEX_HTML_URL = pathToFileURL(path.join(__dirname, '..', 'dist', 'index.html')).href;

// Strict production CSP (AC-15): scripts and every other resource may only come
// from the app's own origin. Kept in sync with the meta tag injected into the
// built index.html by vite.config.ts.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join('; ');

function applyProductionCsp() {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [CONTENT_SECURITY_POLICY],
      },
    });
  });
}

// Only the app's own page counts as internal: in development the Vite dev
// server (the app served from source), in production the exact file URL of the
// built dist/index.html. A hash or query on that same file stays internal; every
// other target — another file, another path, a remote origin — does not.
function isInternalUrl(target) {
  if (typeof target !== 'string' || target.length === 0) {
    return false;
  }
  if (isDev && devServerUrl) {
    return target.startsWith(devServerUrl);
  }
  const withoutFragment = target.split('#')[0].split('?')[0];
  return withoutFragment === INDEX_HTML_URL;
}

// External links may only ever be handed to the system browser when they are a
// real http(s) URL. Every other scheme (file:, javascript:, mailto:, custom
// protocol handlers) is ignored (AC-14).
function isSafeExternalUrl(url) {
  if (typeof url !== 'string') {
    return false;
  }
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  return parsed.protocol === 'http:' || parsed.protocol === 'https:';
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    backgroundColor: '#16181D',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  });

  win.once('ready-to-show', () => win.show());

  // The app window never navigates to a foreign address and never opens a
  // second window; a target that is not the app's own page is refused. External
  // links go through the main process (AC-14).
  win.webContents.setWindowOpenHandler(({ url }) => {
    return isInternalUrl(url) ? { action: 'allow' } : { action: 'deny' };
  });
  win.webContents.on('will-navigate', (event, url) => {
    if (!isInternalUrl(url)) {
      event.preventDefault();
    }
  });

  if (isDev && devServerUrl) {
    win.loadURL(devServerUrl);
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  return win;
}

// The renderer's single OS channel: hand an http(s) URL to the system browser.
// Any other scheme is a no-op, so the renderer can never talk the main process
// into opening something dangerous (AC-14).
ipcMain.handle('open-external', async (_event, url) => {
  if (!isSafeExternalUrl(url)) {
    return;
  }
  await shell.openExternal(url);
});

app.whenReady().then(() => {
  if (!isDev) {
    applyProductionCsp();
  }
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

module.exports = { isInternalUrl, isSafeExternalUrl };
