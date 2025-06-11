import { useState } from 'react';
import {
  CogIcon,
  QuestionMarkCircleIcon,
  BookOpenIcon,
  CommandLineIcon,
  KeyIcon,
  EyeIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useConfigurationWizard } from '../../hooks/useConfigurationWizard';
import { useElectron } from '../../hooks/useElectron';

interface HelpSection {
  id: string;
  title: string;
  icon: React.ElementType;
  content: React.ReactNode;
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'settings' | 'help'>('settings');
  const [expandedSection, setExpandedSection] = useState<string>('');
  const [settings, setSettings] = useState({
    apiUrl: 'http://localhost:8000',
    timeout: 30000,
    maxRetries: 3,
    enableNotifications: true,
    autoRefresh: true,
    debugMode: false
  });

  const { showWizardManually, resetConfiguration } = useConfigurationWizard();
  const { platform, version } = useElectron();

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    // In a real app, this would save to localStorage or send to API
    localStorage.setItem('maas-app-settings', JSON.stringify({ ...settings, [key]: value }));
  };

  const helpSections: HelpSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: BookOpenIcon,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Quick Start Guide</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Ensure your MAAS Platform backend is running on <code className="bg-gray-100 px-1 rounded">http://localhost:8000</code></li>
              <li>Create your first environment using the Environment Templates</li>
              <li>Deploy agents to your environment from the Agents page</li>
              <li>Submit tasks to your agents from the Tasks page</li>
              <li>Monitor progress and results in the Dashboard</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">First Time Setup</h4>
            <p className="text-sm text-gray-700 mb-2">
              If you haven't completed the initial setup wizard, you can restart it anytime:
            </p>
            <button
              onClick={showWizardManually}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <CogIcon className="h-4 w-4 mr-2" />
              Run Setup Wizard
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'environments',
      title: 'Managing Environments',
      icon: CommandLineIcon,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Environment Types</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-start space-x-2">
                <span className="text-lg">🛠️</span>
                <div>
                  <strong>Development:</strong> Perfect for testing with debug mode enabled and relaxed security
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-lg">🚀</span>
                <div>
                  <strong>Production:</strong> High-security environment with auto-scaling and monitoring
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-lg">🔬</span>
                <div>
                  <strong>Research:</strong> Flexible configuration for experimentation and analysis
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-lg">🏢</span>
                <div>
                  <strong>Enterprise:</strong> Complete compliance and governance features
                </div>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Environment Operations</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>Create environments from templates or custom configurations</li>
              <li>Start/stop environments to control resource usage</li>
              <li>View environment details including deployed agents and recent tasks</li>
              <li>Delete environments when no longer needed (with confirmation)</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'agents',
      title: 'Working with Agents',
      icon: KeyIcon,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Available Agent Types</h4>
            <div className="space-y-3 text-sm">
              <div className="border-l-4 border-blue-400 pl-3">
                <strong className="text-blue-800">Code Generator Agent</strong>
                <p className="text-gray-700">Generates code in various programming languages with style guides and testing</p>
              </div>
              <div className="border-l-4 border-green-400 pl-3">
                <strong className="text-green-800">Research Agent</strong>
                <p className="text-gray-700">Conducts comprehensive research with fact-checking and citation</p>
              </div>
              <div className="border-l-4 border-purple-400 pl-3">
                <strong className="text-purple-800">Testing Agent</strong>
                <p className="text-gray-700">Creates and runs tests with various frameworks and coverage analysis</p>
              </div>
              <div className="border-l-4 border-orange-400 pl-3">
                <strong className="text-orange-800">GitHub Integration Agent</strong>
                <p className="text-gray-700">Manages GitHub repositories, creates PRs, and handles version control</p>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Agent Management</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>Deploy agents to specific environments</li>
              <li>Configure agent-specific parameters and API keys</li>
              <li>Monitor agent health and performance</li>
              <li>Start, stop, or restart agents as needed</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'tasks',
      title: 'Task Management',
      icon: CogIcon,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Creating Tasks</h4>
            <p className="text-sm text-gray-700 mb-2">
              Each agent type has its own specialized task form with relevant parameters:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li><strong>Code Generator:</strong> Language, requirements, style preferences</li>
              <li><strong>Research Agent:</strong> Search queries, sources, fact-checking options</li>
              <li><strong>Testing Agent:</strong> Target specification, test type, framework</li>
              <li><strong>GitHub Integration:</strong> Repository, operation type, details</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Task Status</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                <span>Pending - Waiting to start</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                <span>Running - Currently executing</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>Completed - Finished successfully</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                <span>Failed - Encountered an error</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Bulk Operations</h4>
            <p className="text-sm text-gray-700 mb-2">Use the Bulk Operations feature to:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>Cancel multiple running tasks at once</li>
              <li>Retry failed tasks in batch</li>
              <li>Export results from multiple completed tasks</li>
              <li>Create multiple tasks using templates</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'monitoring',
      title: 'Monitoring & Performance',
      icon: EyeIcon,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">System Metrics</h4>
            <p className="text-sm text-gray-700 mb-2">
              The monitoring dashboard provides real-time insights into:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>System health and platform connectivity</li>
              <li>CPU, memory, and response time metrics</li>
              <li>Task success rates and performance statistics</li>
              <li>Environment and agent status overview</li>
              <li>Recent activity and error tracking</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Refresh Intervals</h4>
            <p className="text-sm text-gray-700">
              You can adjust the monitoring refresh rate from 10 seconds to 5 minutes based on your needs. 
              More frequent updates provide better real-time visibility but may increase system load.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: ExclamationTriangleIcon,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Common Issues</h4>
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <h5 className="font-medium text-red-800 mb-1">Cannot connect to MAAS Platform</h5>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  <li>Ensure the backend is running on http://localhost:8000</li>
                  <li>Check that no firewall is blocking the connection</li>
                  <li>Verify the API URL in settings is correct</li>
                </ul>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <h5 className="font-medium text-yellow-800 mb-1">Tasks are failing</h5>
                <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                  <li>Check that the required agents are deployed and running</li>
                  <li>Verify agent configurations and API keys</li>
                  <li>Review task parameters for errors</li>
                  <li>Check the monitoring dashboard for system issues</li>
                </ul>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h5 className="font-medium text-blue-800 mb-1">Performance is slow</h5>
                <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                  <li>Reduce the monitoring refresh interval</li>
                  <li>Check system resource usage in the monitoring dashboard</li>
                  <li>Consider scaling environments or limiting concurrent tasks</li>
                </ul>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Reset Options</h4>
            <p className="text-sm text-gray-700 mb-2">
              If you're experiencing persistent issues, you can reset the application configuration:
            </p>
            <button
              onClick={resetConfiguration}
              className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
              Reset Configuration
            </button>
          </div>
        </div>
      )
    }
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? '' : sectionId);
  };

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Application Settings</h3>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 space-y-6">
            {/* API Configuration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                MAAS Platform API URL
              </label>
              <input
                type="text"
                value={settings.apiUrl}
                onChange={(e) => handleSettingChange('apiUrl', e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-sm text-gray-500">
                The base URL for your MAAS Platform backend
              </p>
            </div>

            {/* Timeout Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Request Timeout (milliseconds)
              </label>
              <input
                type="number"
                min="5000"
                max="300000"
                value={settings.timeout}
                onChange={(e) => handleSettingChange('timeout', parseInt(e.target.value))}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-sm text-gray-500">
                How long to wait for API requests before timing out
              </p>
            </div>

            {/* Retry Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Retries
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={settings.maxRetries}
                onChange={(e) => handleSettingChange('maxRetries', parseInt(e.target.value))}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-sm text-gray-500">
                Number of times to retry failed requests
              </p>
            </div>

            {/* Notification Settings */}
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="notifications"
                  type="checkbox"
                  checked={settings.enableNotifications}
                  onChange={(e) => handleSettingChange('enableNotifications', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="notifications" className="ml-2 block text-sm text-gray-900">
                  Enable desktop notifications
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="auto-refresh"
                  type="checkbox"
                  checked={settings.autoRefresh}
                  onChange={(e) => handleSettingChange('autoRefresh', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="auto-refresh" className="ml-2 block text-sm text-gray-900">
                  Auto-refresh data
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="debug-mode"
                  type="checkbox"
                  checked={settings.debugMode}
                  onChange={(e) => handleSettingChange('debugMode', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="debug-mode" className="ml-2 block text-sm text-gray-900">
                  Enable debug mode
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Info */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Application Information</h3>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Version</dt>
                <dd className="mt-1 text-sm text-gray-900">{version}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Platform</dt>
                <dd className="mt-1 text-sm text-gray-900">{platform}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Build Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{new Date().toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Environment</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {import.meta.env.DEV ? 'Development' : 'Production'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHelpTab = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Help & Documentation</h3>
        <p className="text-sm text-gray-600 mb-6">
          Find answers to common questions and learn how to use the MAAS Management Application effectively.
        </p>
      </div>

      <div className="space-y-2">
        {helpSections.map((section) => {
          const Icon = section.icon;
          const isExpanded = expandedSection === section.id;
          
          return (
            <div key={section.id} className="bg-white border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 text-gray-400" />
                  <span className="font-medium text-gray-900">{section.title}</span>
                </div>
                {isExpanded ? (
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
              
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <div className="pt-4">
                    {section.content}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings & Help</h1>
        <p className="mt-2 text-gray-600">
          Configure your application preferences and access comprehensive documentation
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CogIcon className="h-5 w-5 inline mr-2" />
            Settings
          </button>
          <button
            onClick={() => setActiveTab('help')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'help'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <QuestionMarkCircleIcon className="h-5 w-5 inline mr-2" />
            Help & Documentation
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'settings' ? renderSettingsTab() : renderHelpTab()}
      </div>
    </div>
  );
}