import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { queryKeys } from '../services/queryClient';

export function useHealthQuery() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => apiClient.getHealth(),
    refetchInterval: 30000, // Refetch every 30 seconds for health monitoring
    refetchIntervalInBackground: true,
  });
}

export function useDetailedHealthQuery() {
  return useQuery({
    queryKey: queryKeys.detailedHealth,
    queryFn: () => apiClient.getDetailedHealth(),
    refetchInterval: 60000, // Refetch every minute for detailed health
    refetchIntervalInBackground: true,
  });
}

export function useReadinessQuery() {
  return useQuery({
    queryKey: ['health', 'readiness'],
    queryFn: () => apiClient.getReadinessProbe(),
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
  });
}