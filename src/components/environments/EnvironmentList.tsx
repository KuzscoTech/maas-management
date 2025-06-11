import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, EllipsisVerticalIcon, PlayIcon, StopIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useEnvironmentsQuery, useDeleteEnvironmentMutation } from '../../hooks/useEnvironmentQueries';
import type { Environment } from '../../types/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import CreateEnvironmentFromTemplateModal from './CreateEnvironmentFromTemplateModal';

function getStatusColor(status: Environment['status']) {
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
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function EnvironmentList() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEnvironment, setSelectedEnvironment] = useState<string | null>(null);
  
  const { data: environments, isLoading, error, refetch } = useEnvironmentsQuery();
  const deleteEnvironmentMutation = useDeleteEnvironmentMutation();

  const handleDeleteEnvironment = async (environmentId: string, environmentName: string) => {
    if (window.confirm(`Are you sure you want to delete environment "${environmentName}"? This action cannot be undone.`)) {
      try {
        await deleteEnvironmentMutation.mutateAsync(environmentId);
        setSelectedEnvironment(null);
      } catch (error) {
        console.error('Failed to delete environment:', error);
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading environments..." />;
  }

  if (error) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Environments</h1>
          <p className="mt-2 text-gray-600">
            Manage isolated workspaces for your AI agents
          </p>
        </div>
        <ErrorAlert 
          title="Failed to load environments"
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
          <h1 className="text-3xl font-bold text-gray-900">Environments</h1>
          <p className="mt-2 text-gray-600">
            Manage isolated workspaces for your AI agents
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            New Environment
          </button>
        </div>
      </div>

      {/* Environment Stats */}
      {environments && environments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Environments</p>
                  <p className="text-2xl font-semibold text-gray-900">{environments.length}</p>
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
                  <p className="text-sm font-medium text-gray-500">Active</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {environments.filter(env => env.status === 'active').length}
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
                    {environments.filter(env => env.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Environment List */}
      {!environments || environments.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No environments</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first environment.</p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              New Environment
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {environments.map((environment) => (
              <li key={environment.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center">
                        <Link
                          to={`/environments/${environment.id}`}
                          className="text-lg font-medium text-blue-600 hover:text-blue-800 truncate"
                        >
                          {environment.name}
                        </Link>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(environment.status)}`}>
                          {environment.status}
                        </span>
                      </div>
                      {environment.description && (
                        <p className="mt-1 text-sm text-gray-600 truncate">
                          {environment.description}
                        </p>
                      )}
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span>
                          Created {formatDate(environment.created_at)}
                        </span>
                        {environment.updated_at !== environment.created_at && (
                          <span className="ml-4">
                            Updated {formatDate(environment.updated_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {environment.status === 'active' ? (
                      <button
                        type="button"
                        className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        title="Stop environment"
                      >
                        <StopIcon className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        title="Start environment"
                      >
                        <PlayIcon className="h-4 w-4" />
                      </button>
                    )}
                    
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setSelectedEnvironment(
                          selectedEnvironment === environment.id ? null : environment.id
                        )}
                        className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <EllipsisVerticalIcon className="h-4 w-4" />
                      </button>
                      
                      {selectedEnvironment === environment.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                          <div className="py-1">
                            <Link
                              to={`/environments/${environment.id}`}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setSelectedEnvironment(null)}
                            >
                              View Details
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDeleteEnvironment(environment.id, environment.name)}
                              className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                              disabled={deleteEnvironmentMutation.isPending}
                            >
                              <div className="flex items-center">
                                <TrashIcon className="h-4 w-4 mr-2" />
                                {deleteEnvironmentMutation.isPending ? 'Deleting...' : 'Delete'}
                              </div>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Create Environment Modal */}
      {showCreateModal && (
        <CreateEnvironmentFromTemplateModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}