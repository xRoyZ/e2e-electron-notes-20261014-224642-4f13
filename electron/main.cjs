'use strict';

const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('node:path');

const isDev = !app.isPackaged;
const devServerUrl = process.env.VITE_DEV_SERVER_URL || '';

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

function isInternalUrl(url) {
  if (isDev && devServerUrl) {
    return url.startsWith(devServerUrl);
  }
  return url.startsWith('file://');
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
  // second window; external links go through the main process (AC-14).
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
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

// Scaffold stub for the open-external channel: it answers without acting so the
// renderer's promise resolves. The safe system-browser handoff is delivered by
// the external-links ticket.
ipcMain.handle('open-external', async () => undefined);

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
