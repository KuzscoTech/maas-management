import { useCallback } from 'react';

// Type definitions for the Electron API exposed via preload
interface ElectronAPI {
  saveFile: (data: string, defaultPath?: string) => Promise<{ success: boolean; path?: string; error?: string; cancelled?: boolean }>;
  showNotification: (options: { title?: string; body: string; icon?: string; silent?: boolean }) => Promise<boolean>;
  onMenuAction: (callback: (action: string) => void) => void;
  removeAllListeners: (channel: string) => void;
  platform: string;
  getVersion: () => string;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export function useElectron() {
  const isElectron = typeof window !== 'undefined' && window.electronAPI;

  // File operations
  const saveFile = useCallback(async (data: string, defaultPath?: string) => {
    if (!isElectron) {
      // Fallback for web browser
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = defaultPath || 'task-result.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return { success: true };
    }

    return window.electronAPI!.saveFile(data, defaultPath);
  }, [isElectron]);

  // Notifications
  const showNotification = useCallback(async (options: { 
    title?: string; 
    body: string; 
    icon?: string; 
    silent?: boolean 
  }) => {
    if (!isElectron) {
      // Fallback for web browser
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(options.title || 'MAAS Management', {
          body: options.body,
          icon: options.icon,
          silent: options.silent
        });
        return true;
      } else if ('Notification' in window && Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(options.title || 'MAAS Management', {
            body: options.body,
            icon: options.icon,
            silent: options.silent
          });
          return true;
        }
      }
      return false;
    }

    return window.electronAPI!.showNotification(options);
  }, [isElectron]);

  // Menu action handler
  const onMenuAction = useCallback((callback: (action: string) => void) => {
    if (!isElectron) return;
    
    window.electronAPI!.onMenuAction(callback);
    
    // Cleanup function
    return () => {
      window.electronAPI!.removeAllListeners('menu-action');
    };
  }, [isElectron]);

  // Platform info
  const platform = isElectron ? window.electronAPI!.platform : 'web';
  const version = isElectron ? window.electronAPI!.getVersion() : '1.0.0';

  return {
    isElectron,
    platform,
    version,
    saveFile,
    showNotification,
    onMenuAction,
  };
}