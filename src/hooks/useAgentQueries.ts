import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { queryKeys } from '../services/queryClient';
import { demoApi, shouldUseDemoData } from '../services/demoData';
import type { Agent, DeployAgentRequest } from '../types/api';

export function useAgentsQuery(environmentId?: string) {
  return useQuery({
    queryKey: queryKeys.agents.list(environmentId),
    queryFn: () => shouldUseDemoData() ? demoApi.getAgents(environmentId) : apiClient.getAgents(environmentId),
  });
}

export function useAgentQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.agents.detail(id),
    queryFn: () => shouldUseDemoData() ? demoApi.getAgent(id) : apiClient.getAgent(id),
    enabled: !!id,
  });
}

export function useDeployAgentMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: DeployAgentRequest) => apiClient.deployAgent(data),
    onSuccess: (newAgent) => {
      // Invalidate agents list for the environment
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.agents.list(newAgent.environment_id) 
      });
      
      // Invalidate all agents list as well
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.agents.list() 
      });
      
      // Set the new agent in cache
      queryClient.setQueryData(
        queryKeys.agents.detail(newAgent.id),
        newAgent
      );
    },
  });
}

export function useUpdateAgentMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Agent> }) =>
      apiClient.updateAgent(id, data),
    onSuccess: (updatedAgent) => {
      // Update the specific agent in cache
      queryClient.setQueryData(
        queryKeys.agents.detail(updatedAgent.id),
        updatedAgent
      );
      
      // Invalidate agents lists
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.agents.list(updatedAgent.environment_id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.agents.list() 
      });
    },
  });
}

export function useStartAgentMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.startAgent(id),
    onSuccess: (updatedAgent) => {
      queryClient.setQueryData(
        queryKeys.agents.detail(updatedAgent.id),
        updatedAgent
      );
      
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.agents.list(updatedAgent.environment_id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.agents.list() 
      });
    },
  });
}

export function useStopAgentMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.stopAgent(id),
    onSuccess: (updatedAgent) => {
      queryClient.setQueryData(
        queryKeys.agents.detail(updatedAgent.id),
        updatedAgent
      );
      
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.agents.list(updatedAgent.environment_id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.agents.list() 
      });
    },
  });
}

export function useDeleteAgentMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteAgent(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.agents.detail(deletedId) });
      
      // Invalidate all agents lists
      queryClient.invalidateQueries({ queryKey: queryKeys.agents.all });
    },
  });
}
