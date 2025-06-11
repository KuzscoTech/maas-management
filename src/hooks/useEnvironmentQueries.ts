import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { queryKeys } from '../services/queryClient';
import { demoApi, shouldUseDemoData } from '../services/demoData';
import type { Environment, CreateEnvironmentRequest } from '../types/api';

export function useEnvironmentsQuery() {
  return useQuery({
    queryKey: queryKeys.environments.list(),
    queryFn: async () => {
      if (shouldUseDemoData()) {
        return demoApi.getEnvironments();
      } else {
        const response = await apiClient.getEnvironments();
        // Extract environments array from paginated response
        return response.environments;
      }
    },
  });
}

export function useEnvironmentQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.environments.detail(id),
    queryFn: () => shouldUseDemoData() ? demoApi.getEnvironment(id) : apiClient.getEnvironment(id),
    enabled: !!id,
  });
}

export function useCreateEnvironmentMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateEnvironmentRequest) => apiClient.createEnvironment(data),
    onSuccess: (newEnvironment) => {
      // Invalidate and refetch environments list
      queryClient.invalidateQueries({ queryKey: queryKeys.environments.list() });
      
      // Optionally set the new environment in cache
      queryClient.setQueryData(
        queryKeys.environments.detail(newEnvironment.id),
        newEnvironment
      );
    },
  });
}

export function useUpdateEnvironmentMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Environment> }) =>
      apiClient.updateEnvironment(id, data),
    onSuccess: (updatedEnvironment) => {
      // Update the specific environment in cache
      queryClient.setQueryData(
        queryKeys.environments.detail(updatedEnvironment.id),
        updatedEnvironment
      );
      
      // Invalidate environments list to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.environments.list() });
    },
  });
}

export function useDeleteEnvironmentMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteEnvironment(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.environments.detail(deletedId) });
      
      // Invalidate environments list
      queryClient.invalidateQueries({ queryKey: queryKeys.environments.list() });
    },
  });
}
