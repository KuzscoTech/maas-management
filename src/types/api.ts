// Base API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  success?: boolean;
}

// Health Check Types
export interface HealthStatus {
  status: string;
  timestamp: string;
  service: string;
  version: string;
}

export interface DetailedHealthStatus {
  status: string;
  timestamp: string;
  service: {
    name: string;
    version: string;
    environment: string;
  };
  components: {
    database?: {
      status: string;
      type?: string;
      pool?: {
        size: number;
        checked_in: number;
        checked_out: number;
        overflow: number;
        total: number;
      };
      error?: string;
    };
    redis?: {
      status: string;
      version?: string;
      connected_clients?: number;
      used_memory_human?: string;
      uptime_in_seconds?: number;
      error?: string;
    };
    api?: {
      status: string;
      uptime?: string;
      request_count?: string;
    };
  };
}

// Environment Types
export interface Environment {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
  organization_id: string;
  config?: {
    [key: string]: any;
  };
}

export interface CreateEnvironmentRequest {
  name: string;
  description?: string;
  config?: {
    [key: string]: any;
  };
}

// Agent Types
export interface Agent {
  id: string;
  name: string;
  type: 'code_generator' | 'research' | 'testing' | 'github_integration' | 'basic_tools';
  status: 'active' | 'inactive' | 'deploying' | 'error';
  environment_id: string;
  config?: {
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export interface DeployAgentRequest {
  type: Agent['type'];
  name: string;
  environment_id: string;
  config?: {
    [key: string]: any;
  };
}

// Task Types
export interface Task {
  id: string;
  type: Agent['type'];
  agent_id: string;
  environment_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  parameters: {
    [key: string]: any;
  };
  result?: {
    [key: string]: any;
  };
  error?: string;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface CreateTaskRequest {
  agent_id: string;
  parameters: {
    [key: string]: any;
  };
}

export interface TasksResponse {
  items: Task[];
  total: number;
  page: number;
  size: number;
}

export interface PaginationParams {
  page?: number;
  size?: number;
}

// Organization Types
export interface Organization {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  organization_id: string;
  created_at: string;
  updated_at: string;
}

// API Key Types
export interface ApiKey {
  id: string;
  name: string;
  key_preview: string; // Only shows first/last few characters
  environment_id?: string;
  permissions: string[];
  expires_at?: string;
  last_used_at?: string;
  created_at: string;
}

export interface CreateApiKeyRequest {
  name: string;
  environment_id?: string;
  permissions: string[];
  expires_at?: string;
}

// Monitoring Types
export interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  active_agents: number;
  running_tasks: number;
  total_environments: number;
}

export interface AgentMetrics {
  agent_id: string;
  agent_name: string;
  total_tasks: number;
  successful_tasks: number;
  failed_tasks: number;
  average_execution_time: number;
  last_activity: string;
}