import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { queryClient } from './services/queryClient';
import { useConfigurationWizard } from './hooks/useConfigurationWizard';
import { useAuthStore, setupTokenRefresh } from './stores/authStore';
import ConfigurationWizard from './components/settings/ConfigurationWizard';

function App() {
  const { showWizard } = useConfigurationWizard();
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize authentication on app startup
    initializeAuth();
    
    // Setup automatic token refresh
    setupTokenRefresh();
  }, [initializeAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      {showWizard ? (
        <ConfigurationWizard />
      ) : (
        <RouterProvider router={router} />
      )}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;