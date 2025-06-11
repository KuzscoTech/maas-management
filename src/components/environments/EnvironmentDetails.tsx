import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  TrashIcon, 
  PlusIcon,
  PlayIcon,
  StopIcon,
  CpuChipIcon,
  DocumentTextIcon 
} from '@heroicons/react/24/outline';
import { useEnvironmentQuery, useDeleteEnvironmentMutation } from '../../hooks/useEnvironmentQueries';
import { useAgentsQuery } from '../../hooks/useAgentQueries';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';

function getStatusColor(status: string) {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function EnvironmentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: environment, isLoading, error, refetch } = useEnvironmentQuery(id!);
  const { data: agents } = useAgentsQuery(id);
  const deleteEnvironmentMutation = useDeleteEnvironmentMutation();

  const handleDeleteEnvironment = async () => {
    if (!environment) return;
    
    try {
      await deleteEnvironmentMutation.mutateAsync(environment.id);
      navigate('/environments');
    } catch (error) {
      console.error('Failed to delete environment:', error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading environment details..." />;
  }

  if (error || !environment) {
    return (
      <div>
        <div className="mb-8">
          <Link
            to="/environments"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Environments
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Environment Details</h1>
        </div>
        <ErrorAlert 
          title="Failed to load environment"
          message={error instanceof Error ? error.message : 'Environment not found'}
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
          to="/environments"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Environments
        </Link>
        
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900 truncate">
                {environment.name}
              </h1>
              <span className={`ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(environment.status)}`}>
                {environment.status}
              </span>
            </div>
            {environment.description && (
              <p className="mt-2 text-gray-600">{environment.description}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {environment.status === 'active' ? (
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                title="Stop environment"
              >
                <StopIcon className="h-4 w-4 mr-2" />
                Stop
              </button>
            ) : (
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                title="Start environment"
              >
                <PlayIcon className="h-4 w-4 mr-2" />
                Start
              </button>
            )}
            
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit
            </button>
            
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm bg-white text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Environment Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Environment Information</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Environment ID</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{environment.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Organization</dt>
                <dd className="mt-1 text-sm text-gray-900">{environment.organization_id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(environment.created_at)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(environment.updated_at)}</dd>
              </div>
            </dl>
          </div>
        </div>
        
        <div>
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Deployed Agents</span>
                <span className="text-sm font-medium text-gray-900">
                  {agents?.length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Active Agents</span>
                <span className="text-sm font-medium text-gray-900">
                  {agents?.filter(agent => agent.status === 'active').length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Running Tasks</span>
                <span className="text-sm font-medium text-gray-900">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agents Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Deployed Agents</h3>
          <Link
            to={`/agents?environment=${environment.id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Deploy Agent
          </Link>
        </div>
        
        {!agents || agents.length === 0 ? (
          <div className="bg-white shadow-sm rounded-lg p-8 text-center">
            <CpuChipIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No agents deployed</h4>
            <p className="text-gray-600 mb-4">Deploy your first AI agent to start automating tasks.</p>
            <Link
              to={`/agents?environment=${environment.id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Deploy Agent
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {agents.slice(0, 5).map((agent) => (
                <li key={agent.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CpuChipIcon className="h-8 w-8 text-gray-400 mr-4" />
                      <div>
                        <Link
                          to={`/agents/${agent.id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          {agent.agent_name}
                        </Link>
                        <p className="text-sm text-gray-500">{agent.agent_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown'}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                      {agent.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            {agents.length > 5 && (
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <Link
                  to={`/agents?environment=${environment.id}`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  View all {agents.length} agents →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Tasks Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Recent Tasks</h3>
          <Link
            to={`/tasks?environment=${environment.id}`}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View all tasks →
          </Link>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg p-8 text-center">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No recent tasks</h4>
          <p className="text-gray-600">Tasks submitted to agents in this environment will appear here.</p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowDeleteConfirm(false)}
            />
            
            <div className="relative inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <TrashIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Delete Environment
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete "{environment.name}"? This action cannot be undone and will remove all associated agents and tasks.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeleteEnvironment}
                  disabled={deleteEnvironmentMutation.isPending}
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {deleteEnvironmentMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}