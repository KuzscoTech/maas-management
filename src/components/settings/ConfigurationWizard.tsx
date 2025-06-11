import { useState } from 'react';
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CogIcon,
  RocketLaunchIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { useHealthQuery } from '../../hooks/useHealthQuery';
import { useCreateEnvironmentMutation } from '../../hooks/useEnvironmentQueries';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  optional?: boolean;
}

interface EnvironmentTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  config: {
    name: string;
    description: string;
    config: Record<string, any>;
  };
}

const environmentTemplates: EnvironmentTemplate[] = [
  {
    id: 'development',
    name: 'Development',
    description: 'Perfect for testing and development work with relaxed security',
    icon: '🛠️',
    config: {
      name: 'Development Environment',
      description: 'A development environment for testing AI agents and workflows',
      config: {
        security_level: 'development',
        auto_scaling: false,
        debug_mode: true,
        max_concurrent_tasks: 5
      }
    }
  },
  {
    id: 'production',
    name: 'Production',
    description: 'High-security environment for production workloads',
    icon: '🚀',
    config: {
      name: 'Production Environment',
      description: 'A production-ready environment with high security and performance',
      config: {
        security_level: 'production',
        auto_scaling: true,
        debug_mode: false,
        max_concurrent_tasks: 20
      }
    }
  },
  {
    id: 'research',
    name: 'Research',
    description: 'Optimized for research and experimentation with AI agents',
    icon: '🔬',
    config: {
      name: 'Research Environment',
      description: 'A research environment for AI agent experimentation and analysis',
      config: {
        security_level: 'research',
        auto_scaling: true,
        debug_mode: true,
        max_concurrent_tasks: 10
      }
    }
  }
];

export default function ConfigurationWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customSettings, setCustomSettings] = useState({
    apiUrl: 'http://localhost:8000',
    maxRetries: 3,
    timeout: 30000,
    enableNotifications: true
  });
  
  const { data: healthData, isLoading: healthLoading } = useHealthQuery();
  const createEnvironmentMutation = useCreateEnvironmentMutation();

  const steps: WizardStep[] = [
    {
      id: 'connection',
      title: 'Platform Connection',
      description: 'Verify connection to MAAS Platform backend',
      completed: !!healthData?.status && healthData.status === 'healthy'
    },
    {
      id: 'environment',
      title: 'Environment Setup',
      description: 'Create your first environment using a template',
      completed: false
    },
    {
      id: 'settings',
      title: 'Application Settings',
      description: 'Configure application preferences and behavior',
      completed: false,
      optional: true
    },
    {
      id: 'complete',
      title: 'Setup Complete',
      description: 'Your MAAS Management App is ready to use',
      completed: false
    }
  ];

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateEnvironment = async () => {
    if (!selectedTemplate) return;
    
    const template = environmentTemplates.find(t => t.id === selectedTemplate);
    if (!template) return;

    try {
      await createEnvironmentMutation.mutateAsync(template.config);
      steps[1].completed = true;
      handleNextStep();
    } catch (error) {
      console.error('Failed to create environment:', error);
    }
  };

  const handleFinishSetup = () => {
    // Save settings to localStorage or application config
    localStorage.setItem('maas-app-configured', 'true');
    localStorage.setItem('maas-app-settings', JSON.stringify(customSettings));
    
    // Mark setup as complete
    steps[3].completed = true;
    
    // Force page reload to ensure state is updated
    window.location.reload();
  };

  const handleSkipSetup = () => {
    // Allow users to skip setup and access the app offline
    localStorage.setItem('maas-app-configured', 'true');
    localStorage.setItem('maas-app-settings', JSON.stringify(customSettings));
    localStorage.setItem('maas-skip-health-check', 'true');
    window.location.reload();
  };

  const renderConnectionStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Platform Connection</h3>
        <p className="mt-2 text-sm text-gray-500">
          We'll verify that your MAAS Platform backend is running and accessible.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          {healthLoading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          ) : healthData?.status === 'healthy' ? (
            <CheckCircleIcon className="h-6 w-6 text-green-500" />
          ) : (
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">
              MAAS Platform Status: {healthLoading ? 'Checking...' : healthData?.status || 'Unknown'}
            </p>
            <p className="text-xs text-gray-500">
              Backend URL: {customSettings.apiUrl}
            </p>
          </div>
        </div>
      </div>

      {healthData?.status === 'healthy' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <CheckCircleIcon className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Connection Successful</h3>
              <p className="mt-1 text-sm text-green-700">
                Your MAAS Platform backend is running and ready to manage AI agents.
              </p>
            </div>
          </div>
        </div>
      )}

      {healthData?.status !== 'healthy' && !healthLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Connection Failed</h3>
              <p className="mt-1 text-sm text-red-700">
                Cannot connect to MAAS Platform. Please ensure the backend is running on {customSettings.apiUrl}
              </p>
              <div className="mt-4">
                <button
                  onClick={handleSkipSetup}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Continue Without Backend
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderEnvironmentStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <RocketLaunchIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Environment Setup</h3>
        <p className="mt-2 text-sm text-gray-500">
          Choose a template to create your first environment for managing AI agents.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {environmentTemplates.map((template) => (
          <div
            key={template.id}
            className={`relative rounded-lg border p-4 cursor-pointer transition-all ${
              selectedTemplate === template.id
                ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <div className="flex items-start space-x-3">
              <span className="text-2xl">{template.icon}</span>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">{template.name}</h4>
                <p className="mt-1 text-sm text-gray-500">{template.description}</p>
              </div>
              {selectedTemplate === template.id && (
                <CheckIcon className="h-5 w-5 text-blue-600" />
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedTemplate && (
        <div className="mt-6">
          <button
            onClick={handleCreateEnvironment}
            disabled={createEnvironmentMutation.isPending}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {createEnvironmentMutation.isPending ? 'Creating Environment...' : 'Create Environment'}
          </button>
        </div>
      )}
    </div>
  );

  const renderSettingsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Application Settings</h3>
        <p className="mt-2 text-sm text-gray-500">
          Configure application preferences and behavior (optional).
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">API Base URL</label>
          <input
            type="text"
            value={customSettings.apiUrl}
            onChange={(e) => setCustomSettings(prev => ({ ...prev, apiUrl: e.target.value }))}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Request Timeout (ms)</label>
          <input
            type="number"
            value={customSettings.timeout}
            onChange={(e) => setCustomSettings(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Max Retries</label>
          <input
            type="number"
            value={customSettings.maxRetries}
            onChange={(e) => setCustomSettings(prev => ({ ...prev, maxRetries: parseInt(e.target.value) }))}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div className="flex items-center">
          <input
            id="notifications"
            type="checkbox"
            checked={customSettings.enableNotifications}
            onChange={(e) => setCustomSettings(prev => ({ ...prev, enableNotifications: e.target.checked }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="notifications" className="ml-2 block text-sm text-gray-900">
            Enable desktop notifications
          </label>
        </div>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-6 text-center">
      <div>
        <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Setup Complete!</h3>
        <p className="mt-2 text-sm text-gray-500">
          Your MAAS Management Application is now configured and ready to use.
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-green-800 mb-2">What's Next?</h4>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Deploy AI agents to your environment</li>
          <li>• Submit tasks to different agent types</li>
          <li>• Monitor agent performance and results</li>
          <li>• Explore advanced features and settings</li>
        </ul>
      </div>

      <button
        onClick={handleFinishSetup}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Go to Dashboard
      </button>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderConnectionStep();
      case 1:
        return renderEnvironmentStep();
      case 2:
        return renderSettingsStep();
      case 3:
        return renderCompleteStep();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            MAAS Management Setup
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Let's get your AI agent management platform configured
          </p>
        </div>

        {/* Progress Steps */}
        <nav aria-label="Progress">
          <ol className="space-y-4 md:flex md:space-y-0 md:space-x-8">
            {steps.map((step, index) => (
              <li key={step.id} className="md:flex-1">
                <div
                  className={`group pl-4 py-2 flex flex-col border-l-4 md:pl-0 md:pt-4 md:pb-0 md:border-l-0 md:border-t-4 ${
                    index <= currentStep
                      ? 'border-blue-600'
                      : 'border-gray-200'
                  }`}
                >
                  <span
                    className={`text-xs font-semibold tracking-wide uppercase ${
                      index <= currentStep
                        ? 'text-blue-600'
                        : 'text-gray-500'
                    }`}
                  >
                    Step {index + 1}
                  </span>
                  <span className="text-sm font-medium">
                    {step.title}
                    {step.optional && (
                      <span className="text-gray-500 text-xs ml-1">(Optional)</span>
                    )}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </nav>

        {/* Step Content */}
        <div className="bg-white shadow rounded-lg p-6">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={handlePreviousStep}
              disabled={currentStep === 0}
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNextStep}
                disabled={
                  (currentStep === 0 && healthData?.status !== 'healthy') ||
                  (currentStep === 1 && !selectedTemplate) ||
                  createEnvironmentMutation.isPending
                }
                className="py-2 px-4 border border-transparent rounded-md shadow-sm bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentStep === 1 && selectedTemplate ? 'Create & Continue' : 'Next'}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
