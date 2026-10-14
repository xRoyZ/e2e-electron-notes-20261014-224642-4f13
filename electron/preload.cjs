'use strict';

const { contextBridge, ipcRenderer } = require('electron');

// The renderer gets exactly one named object with one narrow function. No
// ipcRenderer, no require, no process is exposed (AC-16).
contextBridge.exposeInMainWorld('api', {
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
});
