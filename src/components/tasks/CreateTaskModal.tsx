import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCreateTaskMutation } from '../../hooks/useTaskQueries';
import { useAgentsQuery } from '../../hooks/useAgentQueries';

interface CreateTaskModalProps {
  onClose: () => void;
  onSuccess: () => void;
  preselectedAgent?: string;
}

interface TaskFormData {
  agent_id: string;
  parameters: Record<string, any>;
}

export default function CreateTaskModal({ onClose, onSuccess, preselectedAgent }: CreateTaskModalProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    agent_id: preselectedAgent || '',
    parameters: {},
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: agents } = useAgentsQuery();
  const createTaskMutation = useCreateTaskMutation();

  const selectedAgent = agents?.find(agent => agent.id === formData.agent_id);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.agent_id) {
      newErrors.agent_id = 'Agent is required';
    }

    if (!selectedAgent) {
      newErrors.agent_id = 'Selected agent not found';
    }

    // Validate based on agent type
    if (selectedAgent) {
      switch (selectedAgent.type) {
        case 'code_generator':
          if (!formData.parameters.description?.trim()) {
            newErrors.description = 'Code description is required';
          }
          if (!formData.parameters.language) {
            newErrors.language = 'Programming language is required';
          }
          break;
        case 'research':
          if (!formData.parameters.query?.trim()) {
            newErrors.query = 'Research query is required';
          }
          break;
        case 'testing':
          if (!formData.parameters.target?.trim()) {
            newErrors.target = 'Test target is required';
          }
          break;
        case 'github_integration':
          if (!formData.parameters.repository?.trim()) {
            newErrors.repository = 'Repository is required';
          }
          if (!formData.parameters.operation) {
            newErrors.operation = 'Operation is required';
          }
          break;
        case 'basic_tools':
          if (!formData.parameters.operation) {
            newErrors.operation = 'Tool operation is required';
          }
          break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await createTaskMutation.mutateAsync({
        agent_id: formData.agent_id,
        parameters: formData.parameters,
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to create task:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create task'
      });
    }
  };

  const handleParameterChange = (key: string, value: any) => {
    setFormData(prevData => ({
      ...prevData,
      parameters: { ...prevData.parameters, [key]: value }
    }));
    // Clear error for this field when user starts typing
    if (errors[key]) {
      setErrors(prevErrors => ({ ...prevErrors, [key]: '' }));
    }
  };

  const handleAgentChange = (agentId: string) => {
    setFormData(() => ({
      agent_id: agentId,
      parameters: {} // Reset parameters when changing agent
    }));
    setErrors({}); // Clear all errors when changing agent
  };

  const renderAgentSpecificForm = () => {
    if (!selectedAgent) return null;

    switch (selectedAgent.type) {
      case 'code_generator':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                Programming Language <span className="text-red-500">*</span>
              </label>
              <select
                id="language"
                value={formData.parameters.language || ''}
                onChange={(e) => handleParameterChange('language', e.target.value)}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.language ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                }`}
              >
                <option value="">Select language</option>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="java">Java</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="cpp">C++</option>
                <option value="sql">SQL</option>
              </select>
              {errors.language && <p className="mt-1 text-sm text-red-600">{errors.language}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Code Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                rows={4}
                value={formData.parameters.description || ''}
                onChange={(e) => handleParameterChange('description', e.target.value)}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                }`}
                placeholder="Describe what code you want to generate..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            <div>
              <label htmlFor="style" className="block text-sm font-medium text-gray-700">
                Code Style Preferences
              </label>
              <input
                type="text"
                id="style"
                value={formData.parameters.style || ''}
                onChange={(e) => handleParameterChange('style', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="e.g., PEP8, clean code, functional style..."
              />
            </div>
          </div>
        );

      case 'research':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="query" className="block text-sm font-medium text-gray-700">
                Research Query <span className="text-red-500">*</span>
              </label>
              <textarea
                id="query"
                rows={3}
                value={formData.parameters.query || ''}
                onChange={(e) => handleParameterChange('query', e.target.value)}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.query ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                }`}
                placeholder="What would you like to research?"
              />
              {errors.query && <p className="mt-1 text-sm text-red-600">{errors.query}</p>}
            </div>

            <div>
              <label htmlFor="sources" className="block text-sm font-medium text-gray-700">
                Preferred Sources
              </label>
              <input
                type="text"
                id="sources"
                value={formData.parameters.sources || ''}
                onChange={(e) => handleParameterChange('sources', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="e.g., academic papers, official docs, news..."
              />
            </div>

            <div className="flex items-center">
              <input
                id="fact_check"
                type="checkbox"
                checked={formData.parameters.fact_check || false}
                onChange={(e) => handleParameterChange('fact_check', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="fact_check" className="ml-2 block text-sm text-gray-900">
                Enable fact-checking
              </label>
            </div>
          </div>
        );

      case 'testing':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="target" className="block text-sm font-medium text-gray-700">
                Test Target <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="target"
                value={formData.parameters.target || ''}
                onChange={(e) => handleParameterChange('target', e.target.value)}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.target ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                }`}
                placeholder="What code/function to test?"
              />
              {errors.target && <p className="mt-1 text-sm text-red-600">{errors.target}</p>}
            </div>

            <div>
              <label htmlFor="test_type" className="block text-sm font-medium text-gray-700">
                Test Type
              </label>
              <select
                id="test_type"
                value={formData.parameters.test_type || 'unit'}
                onChange={(e) => handleParameterChange('test_type', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="unit">Unit Tests</option>
                <option value="integration">Integration Tests</option>
                <option value="e2e">End-to-End Tests</option>
                <option value="performance">Performance Tests</option>
              </select>
            </div>

            <div>
              <label htmlFor="framework" className="block text-sm font-medium text-gray-700">
                Testing Framework
              </label>
              <input
                type="text"
                id="framework"
                value={formData.parameters.framework || ''}
                onChange={(e) => handleParameterChange('framework', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="e.g., Jest, pytest, JUnit..."
              />
            </div>
          </div>
        );

      case 'github_integration':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="repository" className="block text-sm font-medium text-gray-700">
                Repository <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="repository"
                value={formData.parameters.repository || ''}
                onChange={(e) => handleParameterChange('repository', e.target.value)}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.repository ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                }`}
                placeholder="owner/repository-name"
              />
              {errors.repository && <p className="mt-1 text-sm text-red-600">{errors.repository}</p>}
            </div>

            <div>
              <label htmlFor="operation" className="block text-sm font-medium text-gray-700">
                Operation <span className="text-red-500">*</span>
              </label>
              <select
                id="operation"
                value={formData.parameters.operation || ''}
                onChange={(e) => handleParameterChange('operation', e.target.value)}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.operation ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                }`}
              >
                <option value="">Select operation</option>
                <option value="create_pr">Create Pull Request</option>
                <option value="review_pr">Review Pull Request</option>
                <option value="create_issue">Create Issue</option>
                <option value="close_issue">Close Issue</option>
                <option value="analyze_repo">Analyze Repository</option>
              </select>
              {errors.operation && <p className="mt-1 text-sm text-red-600">{errors.operation}</p>}
            </div>

            <div>
              <label htmlFor="details" className="block text-sm font-medium text-gray-700">
                Operation Details
              </label>
              <textarea
                id="details"
                rows={3}
                value={formData.parameters.details || ''}
                onChange={(e) => handleParameterChange('details', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Additional details about the operation..."
              />
            </div>
          </div>
        );

      case 'basic_tools':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="operation" className="block text-sm font-medium text-gray-700">
                Tool Operation <span className="text-red-500">*</span>
              </label>
              <select
                id="operation"
                value={formData.parameters.operation || ''}
                onChange={(e) => handleParameterChange('operation', e.target.value)}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.operation ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                }`}
              >
                <option value="">Select operation</option>
                <option value="file_processing">File Processing</option>
                <option value="data_transformation">Data Transformation</option>
                <option value="text_analysis">Text Analysis</option>
                <option value="api_integration">API Integration</option>
                <option value="automation">Automation Task</option>
                <option value="validation">Data Validation</option>
              </select>
              {errors.operation && <p className="mt-1 text-sm text-red-600">{errors.operation}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Task Description
              </label>
              <textarea
                id="description"
                rows={4}
                value={formData.parameters.description || ''}
                onChange={(e) => handleParameterChange('description', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Describe what you want to accomplish..."
              />
            </div>
          </div>
        );

      default:
        return (
          <div>
            <label htmlFor="parameters" className="block text-sm font-medium text-gray-700">
              Task Parameters
            </label>
            <textarea
              id="parameters"
              rows={4}
              value={JSON.stringify(formData.parameters, null, 2)}
              onChange={(e) => {
                try {
                  const params = JSON.parse(e.target.value);
                  setFormData(prevData => ({ ...prevData, parameters: params }));
                } catch {
                  // Invalid JSON, don't update
                }
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm font-mono text-sm"
              placeholder='{"key": "value"}'
            />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="relative inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6 sm:align-middle">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Create New Task
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Agent Selection */}
            <div>
              <label htmlFor="agent" className="block text-sm font-medium text-gray-700">
                Select Agent <span className="text-red-500">*</span>
              </label>
              <select
                id="agent"
                value={formData.agent_id}
                onChange={(e) => handleAgentChange(e.target.value)}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.agent_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                }`}
              >
                <option value="">Select an agent</option>
                {agents?.filter(agent => agent.status === 'active').map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.type.replace(/_/g, ' ')})
                  </option>
                ))}
              </select>
              {errors.agent_id && <p className="mt-1 text-sm text-red-600">{errors.agent_id}</p>}
            </div>

            {/* Agent-specific form */}
            {selectedAgent && (
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">
                  {selectedAgent.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Configuration
                </h4>
                {renderAgentSpecificForm()}
              </div>
            )}

            {/* Submit Error */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={createTaskMutation.isPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={createTaskMutation.isPending || !selectedAgent}
              >
                {createTaskMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Task'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}