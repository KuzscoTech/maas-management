import { useState, useEffect } from 'react';

interface AppSettings {
  apiUrl: string;
  maxRetries: number;
  timeout: number;
  enableNotifications: boolean;
}

interface ConfigurationState {
  isConfigured: boolean;
  showWizard: boolean;
  settings: AppSettings;
}

const defaultSettings: AppSettings = {
  apiUrl: 'http://localhost:8000',
  maxRetries: 3,
  timeout: 30000,
  enableNotifications: true
};

export function useConfigurationWizard() {
  const [state, setState] = useState<ConfigurationState>({
    isConfigured: false,
    showWizard: false,
    settings: defaultSettings
  });

  useEffect(() => {
    // Check if app has been configured
    const configured = localStorage.getItem('maas-app-configured') === 'true';
    const skipHealthCheck = localStorage.getItem('maas-skip-health-check') === 'true';
    
    // Load saved settings
    const savedSettings = localStorage.getItem('maas-app-settings');
    let settings = defaultSettings;
    
    if (savedSettings) {
      try {
        settings = { ...defaultSettings, ...JSON.parse(savedSettings) };
      } catch (error) {
        console.warn('Failed to parse saved settings, using defaults');
      }
    }

    setState({
      isConfigured: configured || skipHealthCheck,
      showWizard: !configured && !skipHealthCheck,
      settings
    });
  }, []);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...state.settings, ...newSettings };
    setState(prev => ({ ...prev, settings: updated }));
    localStorage.setItem('maas-app-settings', JSON.stringify(updated));
  };

  const markAsConfigured = () => {
    localStorage.setItem('maas-app-configured', 'true');
    setState(prev => ({ ...prev, isConfigured: true, showWizard: false }));
  };

  const resetConfiguration = () => {
    localStorage.removeItem('maas-app-configured');
    localStorage.removeItem('maas-app-settings');
    setState({
      isConfigured: false,
      showWizard: true,
      settings: defaultSettings
    });
  };

  const showWizardManually = () => {
    setState(prev => ({ ...prev, showWizard: true }));
  };

  const hideWizard = () => {
    setState(prev => ({ ...prev, showWizard: false }));
  };

  return {
    isConfigured: state.isConfigured,
    showWizard: state.showWizard,
    settings: state.settings,
    updateSettings,
    markAsConfigured,
    resetConfiguration,
    showWizardManually,
    hideWizard
  };
}
