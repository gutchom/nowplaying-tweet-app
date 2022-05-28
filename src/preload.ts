import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  pin: (pin: string) => ipcRenderer.send('pin', pin),
  tweet: (userId: string) => ipcRenderer.send('tweet', userId),
  login: () => ipcRenderer.send('logout'),
  logout: (userId: string) => ipcRenderer.send('logout', userId),
  setConfig: (config: unknown) => ipcRenderer.send('set-config', config),
  setTemplate: (template: string) => ipcRenderer.send('set-template', template),
});
