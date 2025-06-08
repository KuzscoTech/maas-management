import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors except 408 (timeout)
        if (error instanceof Error && 'response' in error) {
          const status = (error as any).response?.status;
          if (status >= 400 && status < 500 && status !== 408) {
            return false;
          }
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false, // Don't retry mutations by default
    },
  },
});

// Query keys for consistent caching
export const queryKeys = {
  health: ['health'] as const,
  detailedHealth: ['health', 'detailed'] as const,
  environments: {
    all: ['environments'] as const,
    list: () => [...queryKeys.environments.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.environments.all, 'detail', id] as const,
  },
  agents: {
    all: ['agents'] as const,
    list: (environmentId?: string) => 
      environmentId 
        ? [...queryKeys.agents.all, 'list', { environmentId }] as const
        : [...queryKeys.agents.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.agents.all, 'detail', id] as const,
  },
  tasks: {
    all: ['tasks'] as const,
    list: (filters?: { environmentId?: string; agentId?: string }) =>
      [...queryKeys.tasks.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.tasks.all, 'detail', id] as const,
  },
  organizations: {
    all: ['organizations'] as const,
    list: () => [...queryKeys.organizations.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.organizations.all, 'detail', id] as const,
  },
  users: {
    all: ['users'] as const,
    list: () => [...queryKeys.users.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.users.all, 'detail', id] as const,
  },
  apiKeys: {
    all: ['apiKeys'] as const,
    list: () => [...queryKeys.apiKeys.all, 'list'] as const,
  },
  monitoring: {
    all: ['monitoring'] as const,
    system: () => [...queryKeys.monitoring.all, 'system'] as const,
    agents: (environmentId?: string) => 
      environmentId
        ? [...queryKeys.monitoring.all, 'agents', { environmentId }] as const
        : [...queryKeys.monitoring.all, 'agents'] as const,
  },
} as const;