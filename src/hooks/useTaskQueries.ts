import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import type { CreateTaskRequest, TasksResponse, PaginationParams } from '../types/api';

export const TASK_QUERY_KEYS = {
  all: ['tasks'] as const,
  lists: () => [...TASK_QUERY_KEYS.all, 'list'] as const,
  list: (params?: PaginationParams & { agent_id?: string; status?: string }) => 
    [...TASK_QUERY_KEYS.lists(), params] as const,
  details: () => [...TASK_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...TASK_QUERY_KEYS.details(), id] as const,
};

export function useTasksQuery(params?: PaginationParams & { agent_id?: string; status?: string }): ReturnType<typeof useQuery<TasksResponse>> {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.list(params),
    queryFn: () => apiClient.getTasks(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useTaskQuery(id: string) {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.detail(id),
    queryFn: () => apiClient.getTask(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
}

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTaskRequest) => apiClient.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.lists() });
    },
    onError: (error) => {
      console.error('Failed to create task:', error);
    },
  });
}

export function useCancelTaskMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskId: string) => apiClient.cancelTask(taskId),
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.lists() });
    },
    onError: (error) => {
      console.error('Failed to cancel task:', error);
    },
  });
}

export function useRetryTaskMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskId: string) => apiClient.retryTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.lists() });
    },
    onError: (error) => {
      console.error('Failed to retry task:', error);
    },
  });
}
