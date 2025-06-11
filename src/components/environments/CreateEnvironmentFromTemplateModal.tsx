import { useState } from 'react';
import { 
  XMarkIcon, 
  CheckIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { useCreateEnvironmentMutation } from '../../hooks/useEnvironmentQueries';
import { useAuthStore } from '../../stores/authStore';
import { environmentTemplates, type EnvironmentTemplate } from '../../services/templates';

interface CreateEnvironmentFromTemplateModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type TabType = 'templates' | 'custom';

export default function CreateEnvironmentFromTemplateModal({ 
  onClose, 
  onSuccess 
}: CreateEnvironmentFromTemplateModalProps) {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [customName, setCustomName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createEnvironmentMutation = useCreateEnvironmentMutation();

  const filteredTemplates = environmentTemplates.filter(template => {
    const matchesSearch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: '', name: 'All Categories' },
    { id: 'development', name: 'Development' },
    { id: 'production', name: 'Production' },
    { id: 'research', name: 'Research' },
    { id: 'enterprise', name: 'Enterprise' }
  ];

  const handleCreateFromTemplate = async () => {
    if (!selectedTemplate) return;

    const template = environmentTemplates.find(t => t.id === selectedTemplate);
    if (!template) return;

    if (!user?.organizations.length) {
      setErrors({
        submit: 'No organization found. Please contact your administrator.'
      });
      return;
    }

    const name = customName.trim() || template.config.name;

    try {
      await createEnvironmentMutation.mutateAsync({
        name,
        description: template.config.description,
        organization_id: user.organizations[0].id,
        configuration: template.config.config || {},
        resource_limits: {
          max_agents: 5,
          max_tasks_per_day: 1000
        }
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to create environment:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create environment'
      });
    }
  };

  const handleCreateCustom = async () => {
    if (!customName.trim()) {
      setErrors({ name: 'Environment name is required' });
      return;
    }

    if (!user?.organizations.length) {
      setErrors({
        submit: 'No organization found. Please contact your administrator.'
      });
      return;
    }

    try {
      await createEnvironmentMutation.mutateAsync({
        name: customName.trim(),
        description: 'Custom environment created without template',
        organization_id: user.organizations[0].id,
        configuration: {
          security_level: 'development',
          auto_scaling: false,
          debug_mode: true,
          max_concurrent_tasks: 5
        },
        resource_limits: {
          max_agents: 5,
          max_tasks_per_day: 1000
        }
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to create environment:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create environment'
      });
    }
  };

  const renderTemplateCard = (template: EnvironmentTemplate) => (
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
        <span className="text-2xl flex-shrink-0">{template.icon}</span>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {template.name}
          </h4>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
            {template.description}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {template.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
              >
                {tag}
              </span>
            ))}
            {template.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                +{template.tags.length - 3}
              </span>
            )}
          </div>
        </div>
        {selectedTemplate === template.id && (
          <CheckIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
        )}
      </div>
    </div>
  );

  const renderTemplatesTab = () => (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <FunnelIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
        {filteredTemplates.map(renderTemplateCard)}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">No templates match your search criteria.</p>
        </div>
      )}

      {/* Custom Name Input */}
      {selectedTemplate && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Environment Name (Optional)
          </label>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder={environmentTemplates.find(t => t.id === selectedTemplate)?.config.name}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <p className="mt-1 text-sm text-gray-500">
            Leave empty to use the template's default name
          </p>
        </div>
      )}
    </div>
  );

  const renderCustomTab = () => (
    <div className="space-y-4">
      <div className="text-center py-4">
        <h4 className="text-lg font-medium text-gray-900">Create Custom Environment</h4>
        <p className="mt-1 text-sm text-gray-500">
          Create an environment with basic settings that you can customize later
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Environment Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          placeholder="Enter environment name"
          className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
            errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="text-sm font-medium text-blue-800">Default Configuration</h5>
        <ul className="mt-1 text-sm text-blue-700 space-y-1">
          <li>• Development security level</li>
          <li>• Debug mode enabled</li>
          <li>• Maximum 5 concurrent tasks</li>
          <li>• Manual scaling</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="relative inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6 sm:align-middle">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Create Environment
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('templates')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'templates'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                From Template
              </button>
              <button
                onClick={() => setActiveTab('custom')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'custom'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Custom
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'templates' ? renderTemplatesTab() : renderCustomTab()}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={createEnvironmentMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={activeTab === 'templates' ? handleCreateFromTemplate : handleCreateCustom}
              disabled={
                createEnvironmentMutation.isPending ||
                (activeTab === 'templates' && !selectedTemplate) ||
                (activeTab === 'custom' && !customName.trim())
              }
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createEnvironmentMutation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Create Environment'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}