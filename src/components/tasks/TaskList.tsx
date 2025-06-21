import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  PlusIcon, 
  FunnelIcon,
  DocumentTextIcon,
  StopIcon,
  ArrowPathIcon,
  EyeIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useTasksQuery, useCancelTaskMutation, useRetryTaskMutation } from '../../hooks/useTaskQueries';
import { useAgentsQuery } from '../../hooks/useAgentQueries';
import type { Task } from '../../types/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import CreateTaskModal from './CreateTaskModal';
import BulkTaskManager from './BulkTaskManager';

function getStatusColor(status: Task['status']) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'running':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function formatAgentType(type: string) {
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(startTime: string, endTime?: string) {
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date();
  const diffMs = end.getTime() - start.getTime();
  
  if (diffMs < 1000) return '< 1s';
  if (diffMs < 60000) return `${Math.floor(diffMs / 1000)}s`;
  if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m`;
  return `${Math.floor(diffMs / 3600000)}h ${Math.floor((diffMs % 3600000) / 60000)}m`;
}

function getTaskTypeDescription(agentType: string, parameters: any) {
  const params = parameters || {};
  switch (agentType) {
    case 'code_generator':
      return `Generate ${params.language || 'code'}: ${params.description || 'No description'}`;
    case 'research':
      return `Research: ${params.query || params.topic || 'No query specified'}`;
    case 'testing':
      return `Create tests: ${params.test_type || 'unit tests'} for ${params.target || 'project'}`;
    case 'github_integration':
      return `GitHub: ${params.operation || 'repository operation'} on ${params.repository || 'unknown repo'}`;
    case 'basic_tools':
      return `Tools: ${params.operation || 'utility operation'}`;
    default:
      return 'Task execution';
  }
}

export default function TaskList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkManager, setShowBulkManager] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Get filter values from URL params
  const agentFilter = searchParams.get('agent') || '';
  const statusFilter = searchParams.get('status') || '';

  const { data: tasks, isLoading, error, refetch } = useTasksQuery({
    agent_id: agentFilter || undefined,
    status: statusFilter || undefined,
  });
  const { data: agents } = useAgentsQuery();
  const cancelTaskMutation = useCancelTaskMutation();
  const retryTaskMutation = useRetryTaskMutation();

  const handleCancelTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to cancel this task?')) {
      try {
        await cancelTaskMutation.mutateAsync(taskId);
      } catch (error) {
        console.error('Failed to cancel task:', error);
      }
    }
  };

  const handleRetryTask = async (taskId: string) => {
    try {
      await retryTaskMutation.mutateAsync(taskId);
    } catch (error) {
      console.error('Failed to retry task:', error);
    }
  };

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading tasks..." />;
  }

  if (error) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="mt-2 text-gray-600">
            Submit and monitor AI agent tasks
          </p>
        </div>
        <ErrorAlert 
          title="Failed to load tasks"
          message={error instanceof Error ? error.message : 'Unknown error occurred'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="mt-2 text-gray-600">
            Submit and monitor AI agent tasks
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters
          </button>
          <button
            type="button"
            onClick={() => setShowBulkManager(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <DocumentTextIcon className="h-4 w-4 mr-2" />
            Bulk Operations
          </button>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Create Task
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="agent-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Agent
              </label>
              <select
                id="agent-filter"
                value={agentFilter}
                onChange={(e) => updateFilter('agent', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">All Agents</option>
                {agents?.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.agent_name} ({formatAgentType(agent.agent_type)})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="running">Running</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          
          {(agentFilter || statusFilter) && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Task Stats */}
      {tasks && tasks.items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Tasks</p>
                  <p className="text-2xl font-semibold text-gray-900">{tasks.items.length}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Running</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {tasks.items.filter((task: Task) => task.status === 'running').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Completed</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {tasks.items.filter((task: Task) => task.status === 'completed').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Failed</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {tasks.items.filter((task: Task) => task.status === 'failed').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-yellow-600 rounded-full"></div>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {tasks.items.filter((task: Task) => task.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task List */}
      {!tasks || tasks.items.length === 0 ? (
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {(agentFilter || statusFilter) ? 'No tasks match filters' : 'No tasks yet'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {(agentFilter || statusFilter) 
              ? 'Try adjusting your filters or create a new task.'
              : 'Get started by creating your first AI agent task.'
            }
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Create Task
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {tasks.items.map((task: Task) => {
              const agent = agents?.find(a => a.id === task.agent_id);
              return (
                <li key={task.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center">
                          <Link
                            to={`/tasks/${task.id}`}
                            className="text-lg font-medium text-blue-600 hover:text-blue-800 truncate"
                          >
                            Task #{task.id.slice(-8)}
                          </Link>
                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-900">
                          {getTaskTypeDescription(agent?.type || '', task.parameters)}
                        </div>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <span>Agent: {agent?.name || 'Unknown'}</span>
                          <span>•</span>
                          <span>Created {formatDate(task.created_at)}</span>
                          {task.status === 'running' && (
                            <>
                              <span>•</span>
                              <span>Duration: {formatDuration(task.created_at)}</span>
                            </>
                          )}
                          {task.status === 'completed' && task.completed_at && (
                            <>
                              <span>•</span>
                              <span>Duration: {formatDuration(task.created_at, task.completed_at)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {task.status === 'running' && (
                        <button
                          type="button"
                          onClick={() => handleCancelTask(task.id)}
                          disabled={cancelTaskMutation.isPending}
                          className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                          title="Cancel task"
                        >
                          <StopIcon className="h-4 w-4" />
                        </button>
                      )}
                      
                      {task.status === 'failed' && (
                        <button
                          type="button"
                          onClick={() => handleRetryTask(task.id)}
                          disabled={retryTaskMutation.isPending}
                          className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                          title="Retry task"
                        >
                          <ArrowPathIcon className="h-4 w-4" />
                        </button>
                      )}
                      
                      <Link
                        to={`/tasks/${task.id}`}
                        className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        title="View details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                      
                      <Link
                        to={`/tasks/${task.id}`}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <ChevronRightIcon className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            refetch();
          }}
          preselectedAgent={agentFilter}
        />
      )}

      {/* Bulk Task Manager */}
      {showBulkManager && (
        <BulkTaskManager
          onClose={() => setShowBulkManager(false)}
        />
      )}
    </div>
  );
}