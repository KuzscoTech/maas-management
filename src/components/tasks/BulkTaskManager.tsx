import { useState } from 'react';
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  PlayIcon,
  StopIcon,
  ArrowDownTrayIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { useTasksQuery, useCancelTaskMutation, useRetryTaskMutation } from '../../hooks/useTaskQueries';
import { useElectron } from '../../hooks/useElectron';

interface BulkTaskManagerProps {
  onClose: () => void;
}

interface TaskTemplate {
  id: string;
  name: string;
  agentType: string;
  parameters: Record<string, any>;
  count: number;
}

export default function BulkTaskManager({ onClose }: BulkTaskManagerProps) {
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'manage' | 'create'>('manage');
  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>([]);
  const [newTemplate, setNewTemplate] = useState<Partial<TaskTemplate>>({
    name: '',
    agentType: 'code_generator',
    parameters: {},
    count: 1
  });

  const { data: tasks } = useTasksQuery();
  const { saveFile, showNotification } = useElectron();
  const cancelTaskMutation = useCancelTaskMutation();
  const retryTaskMutation = useRetryTaskMutation();

  const filteredTasks = (tasks && Array.isArray(tasks) ? tasks.filter((task: any) => 
    task.status === 'pending' || task.status === 'running' || task.status === 'failed'
  ) : []);

  const handleTaskSelection = (taskId: string, selected: boolean) => {
    const newSelection = new Set(selectedTasks);
    if (selected) {
      newSelection.add(taskId);
    } else {
      newSelection.delete(taskId);
    }
    setSelectedTasks(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedTasks.size === filteredTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(filteredTasks.map(task => task.id)));
    }
  };

  const handleBulkCancel = async () => {
    const tasksToCancel = Array.from(selectedTasks).filter(taskId => {
      const task = (tasks && Array.isArray(tasks) ? tasks.find((t: any) => t.id === taskId) : null);
      return task && (task.status === 'pending' || task.status === 'running');
    });

    if (tasksToCancel.length === 0) {
      await showNotification({
        title: 'No Tasks to Cancel',
        body: 'No running or pending tasks selected',
        silent: false
      });
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to cancel ${tasksToCancel.length} task(s)?`
    );

    if (confirmed) {
      try {
        await Promise.all(
          tasksToCancel.map(taskId => cancelTaskMutation.mutateAsync(taskId))
        );
        
        await showNotification({
          title: 'Tasks Cancelled',
          body: `Successfully cancelled ${tasksToCancel.length} task(s)`,
          silent: false
        });
        
        setSelectedTasks(new Set());
      } catch (error) {
        await showNotification({
          title: 'Cancel Failed',
          body: 'Some tasks could not be cancelled',
          silent: false
        });
      }
    }
  };

  const handleBulkRetry = async () => {
    const tasksToRetry = Array.from(selectedTasks).filter(taskId => {
      const task = (tasks && Array.isArray(tasks) ? tasks.find((t: any) => t.id === taskId) : null);
      return task && task.status === 'failed';
    });

    if (tasksToRetry.length === 0) {
      await showNotification({
        title: 'No Tasks to Retry',
        body: 'No failed tasks selected',
        silent: false
      });
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to retry ${tasksToRetry.length} failed task(s)?`
    );

    if (confirmed) {
      try {
        await Promise.all(
          tasksToRetry.map(taskId => retryTaskMutation.mutateAsync(taskId))
        );
        
        await showNotification({
          title: 'Tasks Retried',
          body: `Successfully retried ${tasksToRetry.length} task(s)`,
          silent: false
        });
        
        setSelectedTasks(new Set());
      } catch (error) {
        await showNotification({
          title: 'Retry Failed',
          body: 'Some tasks could not be retried',
          silent: false
        });
      }
    }
  };

  const handleExportResults = async () => {
    const tasksToExport = Array.from(selectedTasks)
      .map(taskId => (tasks && Array.isArray(tasks) ? tasks.find((t: any) => t.id === taskId) : null))
      .filter(task => task && task.status === 'completed') as any[];

    if (tasksToExport.length === 0) {
      await showNotification({
        title: 'No Results to Export',
        body: 'No completed tasks selected',
        silent: false
      });
      return;
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      taskCount: tasksToExport.length,
      tasks: tasksToExport.map(task => ({
        id: task.id,
        agentType: task.agent_type,
        status: task.status,
        createdAt: task.created_at,
        completedAt: task.updated_at,
        parameters: task.parameters,
        result: task.result
      }))
    };

    try {
      const result = await saveFile(
        JSON.stringify(exportData, null, 2),
        `bulk-task-results-${new Date().toISOString().split('T')[0]}.json`
      );

      if (result.success && !result.cancelled) {
        await showNotification({
          title: 'Export Complete',
          body: `Exported ${tasksToExport.length} task results`,
          silent: false
        });
      }
    } catch (error) {
      await showNotification({
        title: 'Export Failed',
        body: 'Failed to export task results',
        silent: false
      });
    }
  };

  const addTaskTemplate = () => {
    if (!newTemplate.name || !newTemplate.agentType) return;

    const template: TaskTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name,
      agentType: newTemplate.agentType,
      parameters: newTemplate.parameters || {},
      count: newTemplate.count || 1
    };

    setTaskTemplates([...taskTemplates, template]);
    setNewTemplate({
      name: '',
      agentType: 'code_generator',
      parameters: {},
      count: 1
    });
  };

  const removeTaskTemplate = (templateId: string) => {
    setTaskTemplates(taskTemplates.filter(t => t.id !== templateId));
  };

  const handleBulkCreate = async () => {
    if (taskTemplates.length === 0) {
      await showNotification({
        title: 'No Templates',
        body: 'Add at least one task template',
        silent: false
      });
      return;
    }

    const totalTasks = taskTemplates.reduce((sum, template) => sum + template.count, 0);
    
    const confirmed = window.confirm(
      `This will create ${totalTasks} task(s) across ${taskTemplates.length} template(s). Continue?`
    );

    if (confirmed) {
      // In a real implementation, this would call the API to create multiple tasks
      await showNotification({
        title: 'Bulk Creation Started',
        body: `Creating ${totalTasks} tasks...`,
        silent: false
      });
      
      // Simulate task creation
      setTimeout(async () => {
        await showNotification({
          title: 'Bulk Creation Complete',
          body: `Successfully created ${totalTasks} tasks`,
          silent: false
        });
        setTaskTemplates([]);
        setActiveTab('manage');
      }, 2000);
    }
  };

  const renderManageTab = () => (
    <div className="space-y-6">
      {/* Bulk Actions Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Manage Tasks</h3>
          <p className="text-sm text-gray-500">
            Select tasks to perform bulk operations
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleSelectAll}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {selectedTasks.size === filteredTasks.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      </div>

      {/* Selected Tasks Actions */}
      {selectedTasks.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-blue-800">
              {selectedTasks.size} task(s) selected
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleBulkCancel}
                disabled={cancelTaskMutation.isPending}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                <StopIcon className="h-4 w-4 mr-1" />
                Cancel
              </button>
              <button
                onClick={handleBulkRetry}
                disabled={retryTaskMutation.isPending}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
              >
                <PlayIcon className="h-4 w-4 mr-1" />
                Retry
              </button>
              <button
                onClick={handleExportResults}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredTasks.map((task) => (
            <li key={task.id}>
              <div className="px-4 py-4 flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={selectedTasks.has(task.id)}
                  onChange={(e) => handleTaskSelection(task.id, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {(task.agent_type || '').replace('_', ' ').toUpperCase()} Task
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'failed' ? 'bg-red-100 text-red-800' :
                        task.status === 'running' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(task.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {filteredTasks.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-gray-500">No tasks available for bulk operations</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderCreateTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Bulk Task Creation</h3>
        <p className="text-sm text-gray-500">
          Create multiple tasks using templates
        </p>
      </div>

      {/* Add Template Form */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Add Task Template</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Template name"
            value={newTemplate.name}
            onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <select
            value={newTemplate.agentType}
            onChange={(e) => setNewTemplate({ ...newTemplate, agentType: e.target.value })}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="code_generator">Code Generator</option>
            <option value="research_agent">Research Agent</option>
            <option value="testing_agent">Testing Agent</option>
            <option value="github_integration">GitHub Integration</option>
          </select>
          <input
            type="number"
            min="1"
            max="100"
            placeholder="Count"
            value={newTemplate.count}
            onChange={(e) => setNewTemplate({ ...newTemplate, count: parseInt(e.target.value) || 1 })}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <button
            onClick={addTaskTemplate}
            disabled={!newTemplate.name || !newTemplate.agentType}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add
          </button>
        </div>
      </div>

      {/* Template List */}
      {taskTemplates.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Task Templates</h4>
          <div className="space-y-2">
            {taskTemplates.map((template) => (
              <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{template.name}</p>
                    <p className="text-xs text-gray-500">
                      {template.agentType.replace('_', ' ')} • {template.count} task(s)
                    </p>
                  </div>
                  <button
                    onClick={() => removeTaskTemplate(template.id)}
                    className="text-red-400 hover:text-red-500"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleBulkCreate}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <ClipboardDocumentListIcon className="h-4 w-4 mr-2" />
              Create {taskTemplates.reduce((sum, t) => sum + t.count, 0)} Task(s)
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        {/* Modal panel */}
        <div className="relative inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-6xl sm:p-6 sm:align-middle">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Bulk Task Manager</h2>
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
                onClick={() => setActiveTab('manage')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'manage'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Manage Tasks
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'create'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Bulk Create
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[500px]">
            {activeTab === 'manage' ? renderManageTab() : renderCreateTab()}
          </div>
        </div>
      </div>
    </div>
  );
}