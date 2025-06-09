const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  saveFile: (data, defaultPath) => ipcRenderer.invoke('save-file', data, defaultPath),
  
  // Notifications
  showNotification: (options) => ipcRenderer.invoke('show-notification', options),
  
  // Menu actions (listen for menu events)
  onMenuAction: (callback) => {
    ipcRenderer.on('menu-action', (event, action) => callback(action));
  },
  
  // Remove listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },
  
  // Platform info
  platform: process.platform,
  
  // App version
  getVersion: () => {
    return process.env.npm_package_version || '1.0.0';
  }
});

// Security: Remove access to node.js APIs from the renderer process
delete window.require;
delete window.exports;
delete window.module;