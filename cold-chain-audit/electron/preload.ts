import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  onExportReport: (callback: () => void) => {
    ipcRenderer.on('export-report', callback);
  },
  getAppVersion: () => ipcRenderer.invoke('get-app-version')
});
