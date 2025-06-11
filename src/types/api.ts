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
  organization_id: string;
  configuration?: {
    [key: string]: any;
  };
  resource_limits?: {
    [key: string]: any;
  };
}

export interface EnvironmentsResponse {
  environments: Environment[];
  total: number;
  page: number;
  page_size: number;
}

// Agent Types
export interface Agent {
  id: string;
  agent_id: string;
  agent_name: string;
  agent_type: 'code_generator' | 'research' | 'research_agent' | 'testing' | 'testing_agent' | 'github_integration' | 'github_integration_agent' | 'basic_tools';
  model?: string;
  status: 'active' | 'inactive' | 'deploying' | 'error';
  environment_id: string;
  configuration?: {
    [key: string]: any;
  };
  created_at: string;
  updated_at?: string;
}

export interface AgentTemplateConfig {
  // Template Selection
  template: 'google-adk' | 'basic' | 'enterprise';
  
  // Model Configuration (for Google ADK)
  model?: 'gemini-2.0-flash' | 'gemini-1.5-pro' | 'gemini-1.5-flash';
  
  // Agent-Specific Configuration
  codeGenerator?: {
    defaultLanguage: 'python' | 'javascript' | 'sql';
    styleGuide: 'pep8' | 'google' | 'airbnb' | 'standard';
    includeTests: boolean;
    includeDocs: boolean;
    securityScan: boolean;
    frameworks: string[];
  };
  
  research?: {
    searchDepth: 'basic' | 'comprehensive' | 'academic';
    factChecking: boolean;
    citationStyle: 'apa' | 'mla' | 'ieee' | 'chicago';
    sources: 'web' | 'academic' | 'news' | 'all';
  };
  
  testing?: {
    frameworks: string[];
    coverageThreshold: number;
    includeIntegrationTests: boolean;
    performanceTesting: boolean;
  };
  
  github?: {
    autoCreatePR: boolean;
    requireReviews: boolean;
    branchProtection: boolean;
    webhooks: string[];
  };
  
  basicTools?: {
    enabledTools: string[];
    timeoutSeconds: number;
    maxConcurrentTasks: number;
  };
}

export interface DeployAgentRequest {
  type: Agent['agent_type'];
  name: string;
  environment_id: string;
  config?: {
    [key: string]: any;
  };
  // New enhanced configuration
  templateConfig?: AgentTemplateConfig;
}

// Task Types
export interface Task {
  id: string;
  type: Agent['agent_type'];
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

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    full_name: string;
    is_admin: boolean;
    organizations: Array<{
      id: string;
      name: string;
      role: string;
    }>;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirm_password: string;
  full_name: string;
  organization_name?: string;
}

export interface RegisterResponse {
  user_id: string;
  email: string;
  organization_id?: string;
  message: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
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
