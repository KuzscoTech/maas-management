import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../services/api';
import type { LoginRequest, RegisterRequest, LoginResponse } from '../types/api';

interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  is_admin: boolean;
  organizations: Array<{
    id: string;
    name: string;
    role: string;
  }>;
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => void;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (credentials: LoginRequest) => {
        try {
          set({ isLoading: true, error: null });
          
          const response: LoginResponse = await apiClient.login(credentials);
          
          // Set auth token for future requests
          apiClient.setAuthToken(response.access_token);
          
          set({
            isAuthenticated: true,
            user: response.user,
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            isLoading: false,
            error: null,
          });
          
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Login failed',
          });
          throw error;
        }
      },

      register: async (data: RegisterRequest) => {
        try {
          set({ isLoading: true, error: null });
          
          await apiClient.register(data);
          
          set({
            isLoading: false,
            error: null,
          });
          
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Registration failed',
          });
          throw error;
        }
      },

      logout: () => {
        // Call logout API endpoint (best effort)
        apiClient.logout().catch(() => {
          // Ignore errors on logout
        });
        
        // Remove auth token from API client
        apiClient.removeAuthToken();
        
        // Clear auth state
        set({
          ...initialState,
        });
      },

      refreshAccessToken: async (): Promise<boolean> => {
        try {
          const { refreshToken } = get();
          
          if (!refreshToken) {
            return false;
          }
          
          const response = await apiClient.refreshToken({
            refresh_token: refreshToken,
          });
          
          // Update access token
          apiClient.setAuthToken(response.access_token);
          
          set({
            accessToken: response.access_token,
            error: null,
          });
          
          return true;
          
        } catch (error) {
          // Refresh failed, logout user
          get().logout();
          return false;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      initializeAuth: () => {
        const { accessToken } = get();
        
        if (accessToken) {
          // Set the token in the API client
          apiClient.setAuthToken(accessToken);
          
          // Verify token is still valid by fetching user data
          apiClient.getCurrentUser()
            .then((user) => {
              set({
                isAuthenticated: true,
                user: user,
                error: null,
              });
            })
            .catch(() => {
              // Token is invalid, try to refresh
              get().refreshAccessToken().then((success) => {
                if (!success) {
                  // Refresh failed, logout
                  get().logout();
                }
              });
            });
        }
      },
    }),
    {
      name: 'maas-auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Setup automatic token refresh
let refreshInterval: NodeJS.Timeout;

export const setupTokenRefresh = () => {
  // Clear existing interval
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  
  // Refresh token every 10 minutes (tokens expire in 15 minutes)
  refreshInterval = setInterval(() => {
    const { isAuthenticated, refreshAccessToken } = useAuthStore.getState();
    
    if (isAuthenticated) {
      refreshAccessToken();
    }
  }, 10 * 60 * 1000); // 10 minutes
};

// Setup axios interceptor for automatic token refresh on 401 errors
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.map(cb => cb(token));
  refreshSubscribers = [];
};

apiClient['client'].interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, wait for it to complete
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            resolve(apiClient['client'](originalRequest));
          });
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        const { refreshAccessToken } = useAuthStore.getState();
        const success = await refreshAccessToken();
        
        if (success) {
          const { accessToken } = useAuthStore.getState();
          onRefreshed(accessToken!);
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          return apiClient['client'](originalRequest);
        } else {
          // Refresh failed, redirect to login
          return Promise.reject(error);
        }
      } catch (refreshError) {
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);
