import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  PlusIcon, 
  EllipsisVerticalIcon, 
  PlayIcon, 
  StopIcon, 
  TrashIcon,
  CpuChipIcon,
  FunnelIcon 
} from '@heroicons/react/24/outline';
import { useAgentsQuery, useDeleteAgentMutation, useStartAgentMutation, useStopAgentMutation } from '../../hooks/useAgentQueries';
import { useEnvironmentsQuery } from '../../hooks/useEnvironmentQueries';
import type { Agent } from '../../types/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';
import DeployAgentModal from './DeployAgentModal';

function getStatusColor(status: Agent['status']) {
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

function getAgentTypeIcon(type: Agent['agent_type']) {
  const iconClass = "h-8 w-8";
  switch (type) {
    case 'code_generator':
      return <CpuChipIcon className={`${iconClass} text-blue-600`} />;
    case 'research':
      return <CpuChipIcon className={`${iconClass} text-green-600`} />;
    case 'testing':
      return <CpuChipIcon className={`${iconClass} text-purple-600`} />;
    case 'github_integration':
      return <CpuChipIcon className={`${iconClass} text-orange-600`} />;
    case 'basic_tools':
      return <CpuChipIcon className={`${iconClass} text-gray-600`} />;
    default:
      return <CpuChipIcon className={`${iconClass} text-gray-400`} />;
  }
}

function formatAgentType(type: Agent['agent_type']) {
  return type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
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

export default function AgentList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Get filter values from URL params
  const environmentFilter = searchParams.get('environment') || '';
  const typeFilter = searchParams.get('type') || '';
  const statusFilter = searchParams.get('status') || '';

  const { data: agents, isLoading, error, refetch } = useAgentsQuery(environmentFilter || undefined);
  const { data: environments } = useEnvironmentsQuery();
  const deleteAgentMutation = useDeleteAgentMutation();
  const startAgentMutation = useStartAgentMutation();
  const stopAgentMutation = useStopAgentMutation();

  // Filter agents based on search params
  const filteredAgents = agents?.filter(agent => {
    if (typeFilter && agent.agent_type !== typeFilter) return false;
    if (statusFilter && agent.status !== statusFilter) return false;
    return true;
  });

  const handleDeleteAgent = async (agentId: string, agentName: string) => {
    if (window.confirm(`Are you sure you want to delete agent "${agentName}"? This action cannot be undone.`)) {
      try {
        await deleteAgentMutation.mutateAsync(agentId);
        setSelectedAgent(null);
      } catch (error) {
        console.error('Failed to delete agent:', error);
      }
    }
  };

  const handleStartAgent = async (agentId: string) => {
    try {
      await startAgentMutation.mutateAsync(agentId);
    } catch (error) {
      console.error('Failed to start agent:', error);
    }
  };

  const handleStopAgent = async (agentId: string) => {
    try {
      await stopAgentMutation.mutateAsync(agentId);
    } catch (error) {
      console.error('Failed to stop agent:', error);
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
    return <LoadingSpinner message="Loading agents..." />;
  }

  if (error) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agents</h1>
          <p className="mt-2 text-gray-600">
            Deploy and manage AI agents across environments
          </p>
        </div>
        <ErrorAlert 
          title="Failed to load agents"
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
          <h1 className="text-3xl font-bold text-gray-900">Agents</h1>
          <p className="mt-2 text-gray-600">
            Deploy and manage AI agents across environments
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
            onClick={() => setShowDeployModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Deploy Agent
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="environment-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Environment
              </label>
              <select
                id="environment-filter"
                value={environmentFilter}
                onChange={(e) => updateFilter('environment', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">All Environments</option>
                {environments?.map((env) => (
                  <option key={env.id} value={env.id}>
                    {env.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Agent Type
              </label>
              <select
                id="type-filter"
                value={typeFilter}
                onChange={(e) => updateFilter('type', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">All Types</option>
                <option value="code_generator">Code Generator</option>
                <option value="research">Research Agent</option>
                <option value="testing">Testing Agent</option>
                <option value="github_integration">GitHub Integration</option>
                <option value="basic_tools">Basic Tools</option>
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="deploying">Deploying</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>
          
          {(environmentFilter || typeFilter || statusFilter) && (
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

      {/* Agent Stats */}
      {agents && agents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Agents</p>
                  <p className="text-2xl font-semibold text-gray-900">{filteredAgents?.length || 0}</p>
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
                    {filteredAgents?.filter(agent => agent.status === 'active').length || 0}
                  </p>
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
                  <p className="text-sm font-medium text-gray-500">Deploying</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {filteredAgents?.filter(agent => agent.status === 'deploying').length || 0}
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
                  <p className="text-sm font-medium text-gray-500">Errors</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {filteredAgents?.filter(agent => agent.status === 'error').length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Agent List */}
      {!filteredAgents || filteredAgents.length === 0 ? (
        <div className="text-center py-12">
          <CpuChipIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {(environmentFilter || typeFilter || statusFilter) ? 'No agents match filters' : 'No agents deployed'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {(environmentFilter || typeFilter || statusFilter) 
              ? 'Try adjusting your filters or deploy a new agent.'
              : 'Get started by deploying your first AI agent.'
            }
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowDeployModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Deploy Agent
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {filteredAgents.map((agent) => (
              <li key={agent.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="flex-shrink-0 mr-4">
                      {getAgentTypeIcon(agent.agent_type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center">
                        <Link
                          to={`/agents/${agent.id}`}
                          className="text-lg font-medium text-blue-600 hover:text-blue-800 truncate"
                        >
                          {agent.agent_name}
                        </Link>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                          {agent.status}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <span>{formatAgentType(agent.agent_type)}</span>
                        <span>•</span>
                        <span>Environment: {environments?.find(e => e.id === agent.environment_id)?.name || agent.environment_id}</span>
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        Created {formatDate(agent.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {agent.status === 'active' ? (
                      <button
                        type="button"
                        onClick={() => handleStopAgent(agent.id)}
                        disabled={stopAgentMutation.isPending}
                        className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        title="Stop agent"
                      >
                        <StopIcon className="h-4 w-4" />
                      </button>
                    ) : agent.status === 'inactive' ? (
                      <button
                        type="button"
                        onClick={() => handleStartAgent(agent.id)}
                        disabled={startAgentMutation.isPending}
                        className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        title="Start agent"
                      >
                        <PlayIcon className="h-4 w-4" />
                      </button>
                    ) : null}
                    
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setSelectedAgent(
                          selectedAgent === agent.id ? null : agent.id
                        )}
                        className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <EllipsisVerticalIcon className="h-4 w-4" />
                      </button>
                      
                      {selectedAgent === agent.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                          <div className="py-1">
                            <Link
                              to={`/agents/${agent.id}`}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setSelectedAgent(null)}
                            >
                              View Details
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDeleteAgent(agent.id, agent.agent_name)}
                              className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                              disabled={deleteAgentMutation.isPending}
                            >
                              <div className="flex items-center">
                                <TrashIcon className="h-4 w-4 mr-2" />
                                {deleteAgentMutation.isPending ? 'Deleting...' : 'Delete'}
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

      {/* Deploy Agent Modal */}
      {showDeployModal && (
        <DeployAgentModal
          onClose={() => setShowDeployModal(false)}
          onSuccess={() => {
            setShowDeployModal(false);
            refetch();
          }}
          preselectedEnvironment={environmentFilter}
        />
      )}
    </div>
  );
}