import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  StopIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useTaskQuery, useCancelTaskMutation, useRetryTaskMutation } from '../../hooks/useTaskQueries';
import { useAgentQuery } from '../../hooks/useAgentQueries';
import { useElectron } from '../../hooks/useElectron';
import type { Task } from '../../types/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';

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

function getStatusIcon(status: Task['status']) {
  const iconClass = "h-5 w-5";
  switch (status) {
    case 'pending':
      return <ClockIcon className={`${iconClass} text-yellow-600`} />;
    case 'running':
      return <ArrowPathIcon className={`${iconClass} text-blue-600 animate-spin`} />;
    case 'completed':
      return <CheckCircleIcon className={`${iconClass} text-green-600`} />;
    case 'failed':
      return <XCircleIcon className={`${iconClass} text-red-600`} />;
    case 'cancelled':
      return <StopIcon className={`${iconClass} text-gray-600`} />;
    default:
      return <ClockIcon className={`${iconClass} text-gray-400`} />;
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function formatDuration(startTime: string, endTime?: string) {
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date();
  const diffMs = end.getTime() - start.getTime();
  
  if (diffMs < 1000) return '< 1s';
  if (diffMs < 60000) return `${Math.floor(diffMs / 1000)}s`;
  if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ${Math.floor((diffMs % 60000) / 1000)}s`;
  return `${Math.floor(diffMs / 3600000)}h ${Math.floor((diffMs % 3600000) / 60000)}m`;
}

function formatAgentType(type: string) {
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export default function TaskDetails() {
  const { id } = useParams<{ id: string }>();
  const [showFullParameters, setShowFullParameters] = useState(false);
  const [showFullResult, setShowFullResult] = useState(false);

  const { data: task, isLoading, error, refetch } = useTaskQuery(id!);
  const { data: agent } = useAgentQuery(task?.agent_id || '');
  const cancelTaskMutation = useCancelTaskMutation();
  const retryTaskMutation = useRetryTaskMutation();
  const { saveFile, showNotification } = useElectron();

  const handleCancelTask = async () => {
    if (!task) return;
    
    if (window.confirm('Are you sure you want to cancel this task?')) {
      try {
        await cancelTaskMutation.mutateAsync(task.id);
      } catch (error) {
        console.error('Failed to cancel task:', error);
      }
    }
  };

  const handleRetryTask = async () => {
    if (!task) return;
    
    try {
      await retryTaskMutation.mutateAsync(task.id);
    } catch (error) {
      console.error('Failed to retry task:', error);
    }
  };

  const handleDownloadResult = async () => {
    if (!task?.result) return;
    
    const data = JSON.stringify(task.result, null, 2);
    const filename = `task-${task.id.slice(-8)}-result.json`;
    
    try {
      const result = await saveFile(data, filename);
      
      if (result.success && !result.cancelled) {
        await showNotification({
          title: 'Download Complete',
          body: `Task result saved successfully${result.path ? ` to ${result.path}` : ''}`,
          silent: false
        });
      } else if (result.error) {
        await showNotification({
          title: 'Download Failed',
          body: `Failed to save file: ${result.error}`,
          silent: false
        });
      }
    } catch (error) {
      console.error('Failed to download result:', error);
      await showNotification({
        title: 'Download Failed',
        body: 'An error occurred while saving the file',
        silent: false
      });
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading task details..." />;
  }

  if (error || !task) {
    return (
      <div>
        <div className="mb-8">
          <Link
            to="/tasks"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Tasks
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Task Details</h1>
        </div>
        <ErrorAlert 
          title="Failed to load task"
          message={error instanceof Error ? error.message : 'Task not found'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/tasks"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Tasks
        </Link>
        
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center">
              <DocumentTextIcon className="h-10 w-10 text-gray-400 mr-4" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Task #{task.id.slice(-8)}
                </h1>
                <div className="flex items-center mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                    {getStatusIcon(task.status)}
                    <span className="ml-2">{task.status}</span>
                  </span>
                  {agent && (
                    <span className="ml-3 text-lg text-gray-600">
                      {formatAgentType(agent.type)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {task.status === 'running' && (
              <button
                type="button"
                onClick={handleCancelTask}
                disabled={cancelTaskMutation.isPending}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <StopIcon className="h-4 w-4 mr-2" />
                {cancelTaskMutation.isPending ? 'Cancelling...' : 'Cancel'}
              </button>
            )}
            
            {task.status === 'failed' && (
              <button
                type="button"
                onClick={handleRetryTask}
                disabled={retryTaskMutation.isPending}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                {retryTaskMutation.isPending ? 'Retrying...' : 'Retry'}
              </button>
            )}
            
            {task.result && (
              <button
                type="button"
                onClick={handleDownloadResult}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Download Result
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Information */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Task Information</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Task ID</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{task.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {getStatusIcon(task.status)}
                    <span className="ml-2">{task.status}</span>
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Agent</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {agent ? (
                    <Link 
                      to={`/agents/${agent.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {agent.name}
                    </Link>
                  ) : (
                    task.agent_id
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(task.created_at)}</dd>
              </div>
              {task.started_at && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Started</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(task.started_at)}</dd>
                </div>
              )}
              {task.completed_at && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Completed</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(task.completed_at)}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">Duration</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {task.started_at ? formatDuration(task.started_at, task.completed_at) : 'Not started'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Parameters */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Parameters</h3>
              {Object.keys(task.parameters || {}).length > 3 && (
                <button
                  type="button"
                  onClick={() => setShowFullParameters(!showFullParameters)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {showFullParameters ? 'Show Less' : 'Show All'}
                </button>
              )}
            </div>
            
            {task.parameters && Object.keys(task.parameters).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(task.parameters).slice(0, showFullParameters ? undefined : 3).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-sm font-medium text-gray-500 capitalize">
                      {key.replace(/_/g, ' ')}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {typeof value === 'object' ? (
                        <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      ) : (
                        <span className="break-words">{String(value)}</span>
                      )}
                    </dd>
                  </div>
                ))}
                {!showFullParameters && Object.keys(task.parameters).length > 3 && (
                  <div className="text-sm text-gray-500">
                    ... and {Object.keys(task.parameters).length - 3} more parameters
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No parameters provided</p>
            )}
          </div>

          {/* Result */}
          {task.result && (
            <div className="bg-white shadow-sm rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Result</h3>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowFullResult(!showFullResult)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {showFullResult ? 'Collapse' : 'Expand'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadResult}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Download
                  </button>
                </div>
              </div>
              
              <div className={`bg-gray-50 rounded-lg p-4 ${showFullResult ? '' : 'max-h-96 overflow-hidden'}`}>
                <pre className="text-sm text-gray-900 whitespace-pre-wrap overflow-x-auto">
                  {typeof task.result === 'string' 
                    ? task.result 
                    : JSON.stringify(task.result, null, 2)
                  }
                </pre>
              </div>
              
              {!showFullResult && (
                <div className="mt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowFullResult(true)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Show full result
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Error Details */}
          {task.status === 'failed' && task.error && (
            <div className="bg-white shadow-sm rounded-lg p-6">
              <div className="flex items-center mb-4">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Error Details</h3>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <pre className="text-sm text-red-900 whitespace-pre-wrap overflow-x-auto">
                  {typeof task.error === 'string' 
                    ? task.error 
                    : JSON.stringify(task.error, null, 2)
                  }
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Progress</h3>
            
            {/* Progress Timeline */}
            <div className="space-y-4">
              <div className="flex items-center">
                <div className={`flex-shrink-0 w-3 h-3 rounded-full ${task.created_at ? 'bg-green-600' : 'bg-gray-300'}`} />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Created</p>
                  {task.created_at && (
                    <p className="text-xs text-gray-500">{formatDate(task.created_at)}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center">
                <div className={`flex-shrink-0 w-3 h-3 rounded-full ${task.started_at ? 'bg-green-600' : task.status === 'pending' ? 'bg-yellow-600' : 'bg-gray-300'}`} />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Started</p>
                  {task.started_at ? (
                    <p className="text-xs text-gray-500">{formatDate(task.started_at)}</p>
                  ) : task.status === 'pending' ? (
                    <p className="text-xs text-gray-500">Waiting to start...</p>
                  ) : (
                    <p className="text-xs text-gray-500">Not started</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center">
                <div className={`flex-shrink-0 w-3 h-3 rounded-full ${
                  task.completed_at ? 'bg-green-600' : 
                  task.status === 'running' ? 'bg-blue-600' : 
                  task.status === 'failed' ? 'bg-red-600' : 
                  'bg-gray-300'
                }`} />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {task.status === 'completed' ? 'Completed' : 
                     task.status === 'failed' ? 'Failed' : 
                     task.status === 'cancelled' ? 'Cancelled' : 'In Progress'}
                  </p>
                  {task.completed_at ? (
                    <p className="text-xs text-gray-500">{formatDate(task.completed_at)}</p>
                  ) : task.status === 'running' ? (
                    <p className="text-xs text-gray-500">Running...</p>
                  ) : task.status === 'failed' ? (
                    <p className="text-xs text-gray-500">Task failed</p>
                  ) : task.status === 'cancelled' ? (
                    <p className="text-xs text-gray-500">Task cancelled</p>
                  ) : (
                    <p className="text-xs text-gray-500">Pending completion</p>
                  )}
                </div>
              </div>
            </div>

            {/* Task Stats */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Statistics</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Queue Time</span>
                  <span className="text-gray-900">
                    {task.started_at ? formatDuration(task.created_at, task.started_at) : 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Execution Time</span>
                  <span className="text-gray-900">
                    {task.started_at ? formatDuration(task.started_at, task.completed_at) : '--'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Time</span>
                  <span className="text-gray-900">
                    {formatDuration(task.created_at, task.completed_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}