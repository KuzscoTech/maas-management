import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useDeployAgentMutation } from '../../hooks/useAgentQueries';
import { useEnvironmentsQuery } from '../../hooks/useEnvironmentQueries';
import type { DeployAgentRequest, Agent, AgentTemplateConfig } from '../../types/api';

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
    config: {},
    templateConfig: {
      template: 'google-adk',
      model: 'gemini-2.0-flash',
      codeGenerator: {
        defaultLanguage: 'python',
        styleGuide: 'pep8',
        includeTests: true,
        includeDocs: true,
        securityScan: false,
        frameworks: []
      }
    }
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
        config: formData.config,
        templateConfig: formData.templateConfig
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

  const handleTemplateConfigChange = (updates: Partial<AgentTemplateConfig>) => {
    setFormData(prev => ({
      ...prev,
      templateConfig: {
        ...prev.templateConfig!,
        ...updates
      }
    }));
  };

  const handleAgentSpecificConfigChange = (agentType: Agent['agent_type'], updates: any) => {
    setFormData(prev => ({
      ...prev,
      templateConfig: {
        ...prev.templateConfig!,
        [agentType]: {
          ...prev.templateConfig![agentType as keyof AgentTemplateConfig],
          ...updates
        }
      }
    }));
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

            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Agent Template <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { value: 'google-adk', name: 'Google ADK', description: 'Advanced AI with Gemini models (Recommended)', icon: '🧠' },
                  { value: 'basic', name: 'Basic Template', description: 'Simple template without AI capabilities', icon: '⚡' },
                  { value: 'enterprise', name: 'Enterprise Template', description: 'Advanced features with custom integrations', icon: '🏢' }
                ].map((template) => (
                  <label
                    key={template.value}
                    className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                      formData.templateConfig?.template === template.value
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="template"
                      value={template.value}
                      checked={formData.templateConfig?.template === template.value}
                      onChange={(e) => handleTemplateConfigChange({ template: e.target.value as AgentTemplateConfig['template'] })}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <div className="text-2xl mr-4">{template.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">{template.name}</p>
                          {formData.templateConfig?.template === template.value && (
                            <div className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600">
                              <div className="h-1.5 w-1.5 rounded-full bg-white" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{template.description}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Model Selection (Google ADK only) */}
            {formData.templateConfig?.template === 'google-adk' && (
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                  AI Model <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    id="model"
                    value={formData.templateConfig?.model || 'gemini-2.0-flash'}
                    onChange={(e) => handleTemplateConfigChange({ model: e.target.value as AgentTemplateConfig['model'] })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash (Fast, Efficient)</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro (Advanced Reasoning)</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash (Balanced)</option>
                  </select>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Choose the AI model that best fits your performance and capability requirements.
                </p>
              </div>
            )}

            {/* Agent-Specific Configuration */}
            {formData.templateConfig?.template === 'google-adk' && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  {selectedAgentType?.name} Configuration
                </h4>
                
                {/* Code Generator Configuration */}
                {formData.type === 'code_generator' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Default Language</label>
                        <select
                          value={formData.templateConfig?.codeGenerator?.defaultLanguage || 'python'}
                          onChange={(e) => handleAgentSpecificConfigChange('codeGenerator', { defaultLanguage: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="python">Python</option>
                          <option value="javascript">JavaScript</option>
                          <option value="sql">SQL</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Style Guide</label>
                        <select
                          value={formData.templateConfig?.codeGenerator?.styleGuide || 'pep8'}
                          onChange={(e) => handleAgentSpecificConfigChange('codeGenerator', { styleGuide: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="pep8">PEP 8 (Python)</option>
                          <option value="google">Google Style</option>
                          <option value="airbnb">Airbnb (JavaScript)</option>
                          <option value="standard">Standard</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.templateConfig?.codeGenerator?.includeTests ?? true}
                          onChange={(e) => handleAgentSpecificConfigChange('codeGenerator', { includeTests: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Include Tests</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.templateConfig?.codeGenerator?.includeDocs ?? true}
                          onChange={(e) => handleAgentSpecificConfigChange('codeGenerator', { includeDocs: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Include Documentation</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.templateConfig?.codeGenerator?.securityScan ?? false}
                          onChange={(e) => handleAgentSpecificConfigChange('codeGenerator', { securityScan: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Security Scanning</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Research Agent Configuration */}
                {formData.type === 'research' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Search Depth</label>
                        <select
                          value={formData.templateConfig?.research?.searchDepth || 'comprehensive'}
                          onChange={(e) => handleAgentSpecificConfigChange('research', { searchDepth: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="basic">Basic</option>
                          <option value="comprehensive">Comprehensive</option>
                          <option value="academic">Academic</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Citation Style</label>
                        <select
                          value={formData.templateConfig?.research?.citationStyle || 'apa'}
                          onChange={(e) => handleAgentSpecificConfigChange('research', { citationStyle: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="apa">APA</option>
                          <option value="mla">MLA</option>
                          <option value="ieee">IEEE</option>
                          <option value="chicago">Chicago</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.templateConfig?.research?.factChecking ?? true}
                          onChange={(e) => handleAgentSpecificConfigChange('research', { factChecking: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Fact Checking</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Testing Agent Configuration */}
                {formData.type === 'testing' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Coverage Threshold (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.templateConfig?.testing?.coverageThreshold || 80}
                          onChange={(e) => handleAgentSpecificConfigChange('testing', { coverageThreshold: parseInt(e.target.value) })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.templateConfig?.testing?.includeIntegrationTests ?? false}
                          onChange={(e) => handleAgentSpecificConfigChange('testing', { includeIntegrationTests: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Integration Tests</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.templateConfig?.testing?.performanceTesting ?? false}
                          onChange={(e) => handleAgentSpecificConfigChange('testing', { performanceTesting: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Performance Testing</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* GitHub Integration Configuration */}
                {formData.type === 'github_integration' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.templateConfig?.github?.autoCreatePR ?? true}
                          onChange={(e) => handleAgentSpecificConfigChange('github', { autoCreatePR: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Auto-create Pull Requests</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.templateConfig?.github?.requireReviews ?? true}
                          onChange={(e) => handleAgentSpecificConfigChange('github', { requireReviews: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Require Reviews</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.templateConfig?.github?.branchProtection ?? true}
                          onChange={(e) => handleAgentSpecificConfigChange('github', { branchProtection: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Branch Protection</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Basic Tools Configuration */}
                {formData.type === 'basic_tools' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Timeout (seconds)</label>
                        <input
                          type="number"
                          min="30"
                          max="3600"
                          value={formData.templateConfig?.basicTools?.timeoutSeconds || 300}
                          onChange={(e) => handleAgentSpecificConfigChange('basicTools', { timeoutSeconds: parseInt(e.target.value) })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Max Concurrent Tasks</label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={formData.templateConfig?.basicTools?.maxConcurrentTasks || 5}
                          onChange={(e) => handleAgentSpecificConfigChange('basicTools', { maxConcurrentTasks: parseInt(e.target.value) })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Configuration Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Enhanced Configuration</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      This agent will be deployed with your selected template and configuration. 
                      Google ADK templates provide advanced AI capabilities with Gemini models, 
                      while agent-specific settings optimize performance for your use case.
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