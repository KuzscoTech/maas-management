import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useDeployAgentMutation } from '../../hooks/useAgentQueries';
import { useEnvironmentsQuery } from '../../hooks/useEnvironmentQueries';
import type { DeployAgentRequest, Agent } from '../../types/api';

interface DeployAgentModalProps {
  onClose: () => void;
  onSuccess: () => void;
  preselectedEnvironment?: string;
}

const agentTypes: Array<{
  type: Agent['type'];
  name: string;
  description: string;
  icon: string;
}> = [
  {
    type: 'code_generator',
    name: 'Code Generator',
    description: 'Generate code in Python, JavaScript, SQL and other languages',
    icon: '💻'
  },
  {
    type: 'research',
    name: 'Research Agent',
    description: 'Web search, fact-checking, and information synthesis',
    icon: '🔍'
  },
  {
    type: 'testing',
    name: 'Testing Agent',
    description: 'Unit tests, integration testing, and validation',
    icon: '🧪'
  },
  {
    type: 'github_integration',
    name: 'GitHub Integration',
    description: 'Repository operations, PRs, and issue management',
    icon: '🐙'
  },
  {
    type: 'basic_tools',
    name: 'Basic Tools',
    description: '18+ essential tools for various automation tasks',
    icon: '🔧'
  }
];

export default function DeployAgentModal({ onClose, onSuccess, preselectedEnvironment }: DeployAgentModalProps) {
  const [formData, setFormData] = useState<DeployAgentRequest>({
    type: 'code_generator',
    name: '',
    environment_id: preselectedEnvironment || '',
    config: {}
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: environments } = useEnvironmentsQuery();
  const deployAgentMutation = useDeployAgentMutation();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Agent name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Agent name must be at least 3 characters';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Agent name must be less than 50 characters';
    } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(formData.name)) {
      newErrors.name = 'Agent name can only contain letters, numbers, spaces, hyphens, and underscores';
    }

    if (!formData.environment_id) {
      newErrors.environment_id = 'Environment is required';
    }

    if (!formData.type) {
      newErrors.type = 'Agent type is required';
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
      await deployAgentMutation.mutateAsync({
        type: formData.type,
        name: formData.name.trim(),
        environment_id: formData.environment_id,
        config: formData.config
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to deploy agent:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to deploy agent'
      });
    }
  };

  const handleInputChange = (field: keyof DeployAgentRequest, value: string | object) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const selectedAgentType = agentTypes.find(type => type.type === formData.type);

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
              Deploy New Agent
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
            {/* Agent Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Agent Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 gap-3">
                {agentTypes.map((type) => (
                  <label
                    key={type.type}
                    className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                      formData.type === type.type
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="agentType"
                      value={type.type}
                      checked={formData.type === type.type}
                      onChange={(e) => handleInputChange('type', e.target.value as Agent['type'])}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <div className="text-2xl mr-4">{type.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">{type.name}</p>
                          {formData.type === type.type && (
                            <div className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600">
                              <div className="h-1.5 w-1.5 rounded-full bg-white" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{type.description}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type}</p>
              )}
            </div>

            {/* Agent Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Agent Name <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  placeholder={selectedAgentType ? `My ${selectedAgentType.name}` : 'Agent name'}
                  maxLength={50}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Environment Selection */}
            <div>
              <label htmlFor="environment" className="block text-sm font-medium text-gray-700">
                Environment <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="environment"
                  value={formData.environment_id}
                  onChange={(e) => handleInputChange('environment_id', e.target.value)}
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                    errors.environment_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                >
                  <option value="">Select an environment</option>
                  {environments?.map((env) => (
                    <option key={env.id} value={env.id}>
                      {env.name} ({env.status})
                    </option>
                  ))}
                </select>
              </div>
              {errors.environment_id && (
                <p className="mt-1 text-sm text-red-600">{errors.environment_id}</p>
              )}
            </div>

            {/* Configuration Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Configuration</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      After deployment, you can configure agent-specific settings such as API keys, 
                      parameters, and preferences in the agent details page.
                    </p>
                  </div>
                </div>
              </div>
            </div>

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
                disabled={deployAgentMutation.isPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={deployAgentMutation.isPending}
              >
                {deployAgentMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deploying...
                  </div>
                ) : (
                  'Deploy Agent'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}