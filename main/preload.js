// preload.js (main)
import { contextBridge, ipcRenderer } from 'electron';

const handler = {
  send: (channel, value) => ipcRenderer.send(channel, value),
  on: (channel, callback) => {
    const subscription = (...args) => callback(...args);
    ipcRenderer.on(channel, subscription);
    return () => ipcRenderer.removeListener(channel, subscription);
  },
  removeListener: (channel, callback) => ipcRenderer.removeListener(channel, callback),
};

contextBridge.exposeInMainWorld('ipc', handler);
