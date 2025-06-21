import type { Environment, Agent, Task, TasksResponse } from '../types/api';

// Demo Environments
export const demoEnvironments: Environment[] = [
  {
    id: 'env-1',
    name: 'Development Environment',
    description: 'A development environment for testing AI agents and workflows',
    status: 'active',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-20T14:45:00Z',
    organization_id: 'org-1',
    config: {
      security_level: 'development',
      auto_scaling: false,
      debug_mode: true,
      max_concurrent_tasks: 5
    }
  },
  {
    id: 'env-2',
    name: 'Production Environment',
    description: 'Production-ready environment with high security and performance',
    status: 'active',
    created_at: '2024-01-10T09:15:00Z',
    updated_at: '2024-01-25T16:20:00Z',
    organization_id: 'org-1',
    config: {
      security_level: 'production',
      auto_scaling: true,
      debug_mode: false,
      max_concurrent_tasks: 20
    }
  },
  {
    id: 'env-3',
    name: 'Research Lab',
    description: 'Research environment for AI agent experimentation and analysis',
    status: 'inactive',
    created_at: '2024-01-12T11:00:00Z',
    updated_at: '2024-01-18T13:30:00Z',
    organization_id: 'org-1',
    config: {
      security_level: 'research',
      auto_scaling: true,
      debug_mode: true,
      max_concurrent_tasks: 10
    }
  }
];

// Demo Agents
export const demoAgents: Agent[] = [
  {
    id: 'agent-1',
    agent_id: 'code_generator_demo_1',
    agent_name: 'Code Assistant Pro',
    agent_type: 'code_generator',
    model: 'gemini-2.0-flash',
    status: 'active',
    environment_id: 'env-1',
    configuration: {
      default_language: 'python',
      style_guide: 'pep8',
      include_tests: true,
      include_documentation: true
    },
    created_at: '2024-01-16T10:00:00Z',
    updated_at: '2024-01-20T15:30:00Z'
  },
  {
    id: 'agent-2',
    agent_id: 'research_demo_2',
    agent_name: 'Research Assistant',
    agent_type: 'research',
    model: 'gemini-2.0-flash',
    status: 'active',
    environment_id: 'env-3',
    configuration: {
      search_depth: 'comprehensive',
      fact_checking: true,
      citation_style: 'academic'
    },
    created_at: '2024-01-17T09:30:00Z',
    updated_at: '2024-01-22T11:15:00Z'
  },
  {
    id: 'agent-3',
    agent_id: 'testing_demo_3',
    agent_name: 'QA Testing Bot',
    agent_type: 'testing',
    model: 'gemini-2.0-flash',
    status: 'inactive',
    environment_id: 'env-1',
    configuration: {
      default_framework: 'pytest',
      coverage_threshold: 80,
      include_integration_tests: true
    },
    created_at: '2024-01-18T14:20:00Z',
    updated_at: '2024-01-23T10:45:00Z'
  },
  {
    id: 'agent-4',
    agent_id: 'github_demo_4',
    agent_name: 'GitHub Integration',
    agent_type: 'github_integration',
    model: 'gemini-2.0-flash',
    status: 'active',
    environment_id: 'env-2',
    configuration: {
      auto_create_pr: true,
      require_reviews: true,
      branch_protection: true
    },
    created_at: '2024-01-19T08:15:00Z',
    updated_at: '2024-01-24T12:00:00Z'
  },
  {
    id: 'agent-5',
    agent_id: 'basic_tools_demo_5',
    agent_name: 'Utility Toolkit',
    agent_type: 'basic_tools',
    model: 'gemini-2.0-flash',
    status: 'deploying',
    environment_id: 'env-1',
    configuration: {
      enabled_tools: ['file_operations', 'web_scraping', 'data_processing'],
      timeout_seconds: 300
    },
    created_at: '2024-01-25T16:30:00Z',
    updated_at: '2024-01-25T16:35:00Z'
  }
];

// Demo Tasks
export const demoTasks: Task[] = [
  {
    id: 'task-1',
    type: 'code_generator',
    agent_id: 'agent-1',
    environment_id: 'env-1',
    status: 'completed',
    parameters: {
      prompt: 'Create a Python function to calculate fibonacci numbers',
      language: 'python',
      include_tests: true
    },
    result: {
      code: 'def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)',
      tests: 'def test_fibonacci():\n    assert fibonacci(0) == 0\n    assert fibonacci(1) == 1\n    assert fibonacci(5) == 5',
      execution_time: 1.23
    },
    created_at: '2024-01-20T09:00:00Z',
    updated_at: '2024-01-20T09:01:23Z',
    started_at: '2024-01-20T09:00:05Z',
    completed_at: '2024-01-20T09:01:23Z'
  },
  {
    id: 'task-2',
    type: 'research',
    agent_id: 'agent-2',
    environment_id: 'env-3',
    status: 'running',
    parameters: {
      query: 'Latest developments in AI agent frameworks 2024',
      depth: 'comprehensive',
      sources: ['academic', 'industry', 'news']
    },
    created_at: '2024-01-25T14:30:00Z',
    updated_at: '2024-01-25T14:45:00Z',
    started_at: '2024-01-25T14:32:00Z'
  },
  {
    id: 'task-3',
    type: 'testing',
    agent_id: 'agent-3',
    environment_id: 'env-1',
    status: 'failed',
    parameters: {
      test_suite: 'integration_tests',
      target_coverage: 85
    },
    error: 'Test environment setup failed: Missing dependency pytest-cov',
    created_at: '2024-01-24T11:15:00Z',
    updated_at: '2024-01-24T11:20:00Z',
    started_at: '2024-01-24T11:16:00Z'
  },
  {
    id: 'task-4',
    type: 'github_integration',
    agent_id: 'agent-4',
    environment_id: 'env-2',
    status: 'pending',
    parameters: {
      action: 'create_pull_request',
      repository: 'myorg/myrepo',
      branch: 'feature/new-api',
      title: 'Add new API endpoints'
    },
    created_at: '2024-01-25T16:00:00Z',
    updated_at: '2024-01-25T16:00:00Z'
  },
  {
    id: 'task-5',
    type: 'code_generator',
    agent_id: 'agent-1',
    environment_id: 'env-1',
    status: 'completed',
    parameters: {
      prompt: 'Create a REST API endpoint for user authentication',
      language: 'typescript',
      framework: 'express'
    },
    result: {
      code: 'app.post("/auth/login", async (req, res) => {\n  // Authentication logic\n});',
      documentation: 'POST /auth/login - Authenticates user credentials',
      execution_time: 2.45
    },
    created_at: '2024-01-23T10:30:00Z',
    updated_at: '2024-01-23T10:32:45Z',
    started_at: '2024-01-23T10:30:15Z',
    completed_at: '2024-01-23T10:32:45Z'
  }
];

// Demo API functions that return promises like real API calls
export const demoApi = {
  // Environment API
  getEnvironments: async (): Promise<Environment[]> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    return demoEnvironments;
  },

  getEnvironment: async (id: string): Promise<Environment> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const environment = demoEnvironments.find(env => env.id === id);
    if (!environment) {
      throw new Error(`Environment with id ${id} not found`);
    }
    return environment;
  },

  // Agent API
  getAgents: async (environmentId?: string): Promise<Agent[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    if (environmentId) {
      return demoAgents.filter(agent => agent.environment_id === environmentId);
    }
    return demoAgents;
  },

  getAgent: async (id: string): Promise<Agent> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const agent = demoAgents.find(a => a.id === id);
    if (!agent) {
      throw new Error(`Agent with id ${id} not found`);
    }
    return agent;
  },

  // Task API
  getTasks: async (params?: { 
    agent_id?: string; 
    status?: string; 
    page?: number; 
    size?: number 
  }): Promise<TasksResponse> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    let filteredTasks = [...demoTasks];
    
    if (params?.agent_id) {
      filteredTasks = filteredTasks.filter(task => task.agent_id === params.agent_id);
    }
    
    if (params?.status) {
      filteredTasks = filteredTasks.filter(task => task.status === params.status);
    }

    const page = params?.page || 1;
    const size = params?.size || 10;
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    
    return {
      items: filteredTasks.slice(startIndex, endIndex),
      total: filteredTasks.length,
      page,
      size
    };
  },

  getTask: async (id: string): Promise<Task> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const task = demoTasks.find(t => t.id === id);
    if (!task) {
      throw new Error(`Task with id ${id} not found`);
    }
    return task;
  },

  // Agent lifecycle API
  startAgent: async (id: string): Promise<Agent> => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate startup time
    const agentIndex = demoAgents.findIndex(a => a.id === id);
    if (agentIndex === -1) {
      throw new Error(`Agent with id ${id} not found`);
    }
    
    // Update the demo agent status to active
    demoAgents[agentIndex] = {
      ...demoAgents[agentIndex],
      status: 'active',
      updated_at: new Date().toISOString()
    };
    
    return demoAgents[agentIndex];
  },

  stopAgent: async (id: string): Promise<Agent> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate shutdown time
    const agentIndex = demoAgents.findIndex(a => a.id === id);
    if (agentIndex === -1) {
      throw new Error(`Agent with id ${id} not found`);
    }
    
    // Update the demo agent status to inactive
    demoAgents[agentIndex] = {
      ...demoAgents[agentIndex],
      status: 'inactive',
      updated_at: new Date().toISOString()
    };
    
    return demoAgents[agentIndex];
  },

  updateAgent: async (id: string, data: { name?: string; type?: string; config?: any }): Promise<Agent> => {
    await new Promise(resolve => setTimeout(resolve, 400)); // Simulate update time
    const agentIndex = demoAgents.findIndex(a => a.id === id);
    if (agentIndex === -1) {
      throw new Error(`Agent with id ${id} not found`);
    }
    
    // Update the demo agent data
    demoAgents[agentIndex] = {
      ...demoAgents[agentIndex],
      ...(data.name && { agent_name: data.name }),
      ...(data.type && { agent_type: data.type }),
      ...(data.config && { configuration: data.config }),
      updated_at: new Date().toISOString()
    };
    
    return demoAgents[agentIndex];
  },

  deleteAgent: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delete time
    const agentIndex = demoAgents.findIndex(a => a.id === id);
    if (agentIndex === -1) {
      throw new Error(`Agent with id ${id} not found`);
    }
    
    // Remove the agent from demo data
    demoAgents.splice(agentIndex, 1);
  },

  // Task creation
  createTask: async (data: { agent_id: string; parameters: any }): Promise<any> => {
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate task creation time
    
    const agent = demoAgents.find(a => a.id === data.agent_id);
    if (!agent) {
      throw new Error(`Agent with id ${data.agent_id} not found`);
    }
    
    const taskId = `task_${data.agent_id}_${Date.now()}`;
    const now = new Date().toISOString();
    
    // Create a demo task
    const task = {
      id: taskId,
      agent_id: data.agent_id,
      agent_name: agent.agent_name,
      status: 'pending' as const,
      parameters: data.parameters,
      created_at: now,
      updated_at: now,
      type: agent.agent_type,
      environment_id: agent.environment_id
    };
    
    // Add to demo tasks array
    demoTasks.push(task);
    
    return task;
  }
};

// Check if we should use demo data (when backend is not available)
export const shouldUseDemoData = (): boolean => {
  return localStorage.getItem('maas-skip-health-check') === 'true';
};
