import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  TrashIcon, 
  PlayIcon,
  StopIcon,
  CpuChipIcon,
  DocumentTextIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { 
  useAgentQuery, 
  useDeleteAgentMutation, 
  useStartAgentMutation, 
  useStopAgentMutation,
  useUpdateAgentMutation 
} from '../../hooks/useAgentQueries';
import { useEnvironmentQuery } from '../../hooks/useEnvironmentQueries';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import EditAgentModal from './EditAgentModal';

function getStatusColor(status: string) {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    case 'deploying':
      return 'bg-blue-100 text-blue-800';
    case 'error':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function formatAgentType(type: string) {
  return type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
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

function getAgentTypeDescription(type: string) {
  switch (type) {
    case 'code_generator':
      return 'Generates code in Python, JavaScript, SQL and other languages with style preferences and requirements';
    case 'research':
      return 'Performs web search, fact-checking, and information synthesis from multiple sources';
    case 'testing':
      return 'Creates unit tests, integration tests, and validation frameworks';
    case 'github_integration':
      return 'Manages repository operations, pull requests, and issue tracking';
    case 'basic_tools':
      return 'Provides 18+ essential tools for various automation and utility tasks';
    default:
      return 'AI agent for specialized task automation';
  }
}

export default function AgentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: agent, isLoading, error, refetch } = useAgentQuery(id!);
  const { data: environment } = useEnvironmentQuery(agent?.environment_id || '');
  const deleteAgentMutation = useDeleteAgentMutation();
  const startAgentMutation = useStartAgentMutation();
  const stopAgentMutation = useStopAgentMutation();
  const updateAgentMutation = useUpdateAgentMutation();

  const handleDeleteAgent = async () => {
    if (!agent) return;
    
    try {
      await deleteAgentMutation.mutateAsync(agent.id);
      navigate('/agents');
    } catch (error) {
      console.error('Failed to delete agent:', error);
    }
  };

  const handleStartAgent = async () => {
    if (!agent) return;
    try {
      await startAgentMutation.mutateAsync(agent.id);
    } catch (error) {
      console.error('Failed to start agent:', error);
    }
  };

  const handleStopAgent = async () => {
    if (!agent) return;
    try {
      await stopAgentMutation.mutateAsync(agent.id);
    } catch (error) {
      console.error('Failed to stop agent:', error);
    }
  };

  const handleUpdateAgent = async (data: { name: string }) => {
    if (!agent) return;
    try {
      await updateAgentMutation.mutateAsync({
        id: agent.id,
        data: {
          name: data.name,
          type: agent.agent_type,
          environment_id: agent.environment_id,
          config: agent.configuration || {}
        }
      });
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to update agent:', error);
      throw error;
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading agent details..." />;
  }

  if (error || !agent) {
    return (
      <div>
        <div className="mb-8">
          <Link
            to="/agents"
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Agents
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Agent Details</h1>
        </div>
        <ErrorAlert 
          title="Failed to load agent"
          message={error instanceof Error ? error.message : 'Agent not found'}
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
          to="/agents"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Agents
        </Link>
        
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center">
              <CpuChipIcon className="h-10 w-10 text-gray-400 mr-4" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 truncate">
                  {agent.agent_name}
                </h1>
                <div className="flex items-center mt-2">
                  <span className="text-lg text-gray-600">{formatAgentType(agent.agent_type)}</span>
                  <span className={`ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(agent.status)}`}>
                    {agent.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {agent.status === 'active' ? (
              <button
                type="button"
                onClick={handleStopAgent}
                disabled={stopAgentMutation.isPending}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                title="Stop agent"
              >
                <StopIcon className="h-4 w-4 mr-2" />
                {stopAgentMutation.isPending ? 'Stopping...' : 'Stop'}
              </button>
            ) : agent.status === 'inactive' ? (
              <button
                type="button"
                onClick={handleStartAgent}
                disabled={startAgentMutation.isPending}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                title="Start agent"
              >
                <PlayIcon className="h-4 w-4 mr-2" />
                {startAgentMutation.isPending ? 'Starting...' : 'Start'}
              </button>
            ) : null}
            
            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Cog6ToothIcon className="h-4 w-4 mr-2" />
              Configure
            </button>
            
            <button
              type="button"
              onClick={() => setShowEditModal(true)}
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

      {/* Agent Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Agent Information</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Agent ID</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{agent.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Type</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatAgentType(agent.agent_type)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Environment</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {environment ? (
                    <Link 
                      to={`/environments/${environment.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {environment.name}
                    </Link>
                  ) : (
                    agent.environment_id
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                    {agent.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(agent.created_at)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(agent.updated_at)}</dd>
              </div>
            </dl>
            
            <div className="mt-6">
              <dt className="text-sm font-medium text-gray-500 mb-2">Description</dt>
              <dd className="text-sm text-gray-900">{getAgentTypeDescription(agent.agent_type)}</dd>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Total Tasks</span>
                <span className="text-sm font-medium text-gray-900">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Successful Tasks</span>
                <span className="text-sm font-medium text-gray-900">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Failed Tasks</span>
                <span className="text-sm font-medium text-gray-900">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Success Rate</span>
                <span className="text-sm font-medium text-gray-900">--</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Avg Execution Time</span>
                <span className="text-sm font-medium text-gray-900">--</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Configuration</h3>
          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Cog6ToothIcon className="h-4 w-4 mr-2" />
            Configure
          </button>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg p-6">
          {agent.configuration && Object.keys(agent.configuration).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(agent.configuration)
                .filter(([key]) => !['template', 'template_config'].includes(key))
                .map(([key, value]) => (
                <div key={key}>
                  <dt className="text-sm font-medium text-gray-500 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {typeof value === 'boolean' ? (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {value ? 'Enabled' : 'Disabled'}
                      </span>
                    ) : typeof value === 'object' ? (
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {JSON.stringify(value)}
                      </code>
                    ) : (
                      String(value)
                    )}
                  </dd>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Cog6ToothIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No configuration set</h4>
              <p className="text-gray-600 mb-4">Configure API keys, parameters, and preferences for this agent.</p>
              <button
                type="button"
                onClick={() => setShowConfigModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Cog6ToothIcon className="h-4 w-4 mr-2" />
                Configure Agent
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recent Tasks Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Recent Tasks</h3>
          <Link
            to={`/tasks?agent=${agent.id}`}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            View all tasks →
          </Link>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg p-8 text-center">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No recent tasks</h4>
          <p className="text-gray-600">Tasks submitted to this agent will appear here.</p>
        </div>
      </div>

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowConfigModal(false)}
            />
            
            <div className="relative inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6 sm:align-middle">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Agent Configuration</h3>
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {agent.configuration && Object.keys(agent.configuration).length > 0 ? (
                  <div className="space-y-6">
                    {/* Template Information */}
                    {agent.configuration.template && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-800 mb-2">Template Configuration</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-blue-600 font-medium">Template:</span>
                            <span className="ml-2 text-blue-800 capitalize">{agent.configuration.template}</span>
                          </div>
                          {agent.model && (
                            <div>
                              <span className="text-blue-600 font-medium">AI Model:</span>
                              <span className="ml-2 text-blue-800">{agent.model}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Agent-Specific Configuration */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-800 mb-4">
                        {formatAgentType(agent.agent_type)} Settings
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(agent.configuration)
                          .filter(([key]) => !['template', 'template_config'].includes(key))
                          .map(([key, value]) => (
                          <div key={key} className="text-sm">
                            <dt className="font-medium text-gray-600 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                            </dt>
                            <dd className="mt-1 text-gray-800">
                              {typeof value === 'boolean' ? (
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {value ? 'Enabled' : 'Disabled'}
                                </span>
                              ) : typeof value === 'object' ? (
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {JSON.stringify(value)}
                                </code>
                              ) : (
                                String(value)
                              )}
                            </dd>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Raw Configuration (for debugging) */}
                    <details className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <summary className="text-sm font-medium text-gray-800 cursor-pointer">
                        Raw Configuration (Advanced)
                      </summary>
                      <pre className="mt-3 text-xs bg-gray-100 p-3 rounded overflow-auto">
                        {JSON.stringify(agent.configuration, null, 2)}
                      </pre>
                    </details>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Cog6ToothIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Configuration Data</h4>
                    <p className="text-gray-600 mb-4">
                      This agent was deployed without enhanced configuration. 
                      Redeploy the agent to use the new template system with Google ADK models.
                    </p>
                  </div>
                )}

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    Delete Agent
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete "{agent.agent_name}"? This action cannot be undone and will remove all associated tasks and configuration.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeleteAgent}
                  disabled={deleteAgentMutation.isPending}
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {deleteAgentMutation.isPending ? 'Deleting...' : 'Delete'}
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

      {/* Edit Agent Modal */}
      {showEditModal && agent && (
        <EditAgentModal
          agent={agent}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdateAgent}
        />
      )}
    </div>
  );
}