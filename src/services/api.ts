import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type {
  HealthStatus,
  DetailedHealthStatus,
  Environment,
  CreateEnvironmentRequest,
  EnvironmentsResponse,
  Agent,
  DeployAgentRequest,
  Task,
  CreateTaskRequest,
  TasksResponse,
  Organization,
  User,
  ApiKey,
  CreateApiKeyRequest,
  SystemMetrics,
  AgentMetrics,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '../types/api';

class MaasApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:8000') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL: `${this.baseURL}/api/v1`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('API Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Health endpoints
  async getHealth(): Promise<HealthStatus> {
    const response = await this.client.get<HealthStatus>('/health');
    return response.data;
  }

  async getLivenessProbe(): Promise<{ status: string }> {
    const response = await this.client.get<{ status: string }>('/health/live');
    return response.data;
  }

  async getReadinessProbe(): Promise<{
    status: string;
    components: Record<string, boolean>;
    timestamp: string;
  }> {
    const response = await this.client.get('/health/ready');
    return response.data;
  }

  async getDetailedHealth(): Promise<DetailedHealthStatus> {
    const response = await this.client.get<DetailedHealthStatus>('/monitoring/health/detailed');
    return response.data;
  }

  // Authentication endpoints
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>('/auth/login', data);
    return response.data;
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await this.client.post<RegisterResponse>('/auth/register', data);
    return response.data;
  }

  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const response = await this.client.post<RefreshTokenResponse>('/auth/refresh', data);
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout');
  }

  async getCurrentUser(): Promise<LoginResponse['user']> {
    const response = await this.client.get<LoginResponse['user']>('/auth/me');
    return response.data;
  }

  // Environment endpoints
  async getEnvironments(): Promise<EnvironmentsResponse> {
    const response = await this.client.get<EnvironmentsResponse>('/environments');
    return response.data;
  }

  async getEnvironment(id: string): Promise<Environment> {
    const response = await this.client.get<Environment>(`/environments/${id}`);
    return response.data;
  }

  async createEnvironment(data: CreateEnvironmentRequest): Promise<Environment> {
    const response = await this.client.post<Environment>('/environments', data);
    return response.data;
  }

  async updateEnvironment(id: string, data: Partial<Environment>): Promise<Environment> {
    const response = await this.client.put<Environment>(`/environments/${id}`, data);
    return response.data;
  }

  async deleteEnvironment(id: string): Promise<void> {
    await this.client.delete(`/environments/${id}`);
  }

  // Agent endpoints
  async getAgents(environmentId?: string): Promise<Agent[]> {
    const params = environmentId ? { environment_id: environmentId } : {};
    const response = await this.client.get<{agents: Agent[], total: number, page: number, page_size: number}>('/agents', { params });
    return response.data.agents;
  }

  async getAgent(id: string): Promise<Agent> {
    const response = await this.client.get<Agent>(`/agents/${id}`);
    return response.data;
  }

  async deployAgent(data: DeployAgentRequest): Promise<Agent> {
    const response = await this.client.post<Agent>('/agents', data);
    return response.data;
  }

  async updateAgent(id: string, data: DeployAgentRequest): Promise<Agent> {
    const response = await this.client.put<Agent>(`/agents/${id}`, data);
    return response.data;
  }

  async deleteAgent(id: string): Promise<void> {
    await this.client.delete(`/agents/${id}`);
  }

  async startAgent(id: string): Promise<Agent> {
    const response = await this.client.post<Agent>(`/agents/${id}/start`);
    return response.data;
  }

  async stopAgent(id: string): Promise<Agent> {
    const response = await this.client.post<Agent>(`/agents/${id}/stop`);
    return response.data;
  }

  // Task endpoints
  async getTasks(params?: { agent_id?: string; status?: string; page?: number; size?: number }): Promise<TasksResponse> {
    const response = await this.client.get<TasksResponse>('/tasks', { params });
    return response.data;
  }

  async getTask(id: string): Promise<Task> {
    const response = await this.client.get<Task>(`/tasks/${id}`);
    return response.data;
  }

  async createTask(data: CreateTaskRequest): Promise<Task> {
    const response = await this.client.post<Task>('/tasks/simple', data);
    return response.data;
  }

  async cancelTask(id: string): Promise<Task> {
    // Use status update endpoint to cancel task
    const response = await this.client.put<Task>(`/tasks/${id}/status`, {
      status: 'CANCELLED'
    });
    return response.data;
  }

  async retryTask(id: string): Promise<Task> {
    // Use task transition endpoint for retry
    const response = await this.client.put<Task>(`/tasks/${id}/transition`, {
      action: 'retry'
    });
    return response.data;
  }

  // Organization endpoints
  async getOrganizations(): Promise<Organization[]> {
    const response = await this.client.get<Organization[]>('/organizations');
    return response.data;
  }

  async getOrganization(id: string): Promise<Organization> {
    const response = await this.client.get<Organization>(`/organizations/${id}`);
    return response.data;
  }

  // User endpoints
  async getUsers(): Promise<User[]> {
    const response = await this.client.get<User[]>('/users');
    return response.data;
  }

  async getUser(id: string): Promise<User> {
    const response = await this.client.get<User>(`/users/${id}`);
    return response.data;
  }

  // API Key endpoints
  async getApiKeys(): Promise<ApiKey[]> {
    const response = await this.client.get<ApiKey[]>('/api-keys');
    return response.data;
  }

  async createApiKey(data: CreateApiKeyRequest): Promise<{ api_key: ApiKey; key: string }> {
    const response = await this.client.post<{ api_key: ApiKey; key: string }>('/api-keys', data);
    return response.data;
  }

  async deleteApiKey(id: string): Promise<void> {
    await this.client.delete(`/api-keys/${id}`);
  }

  // Monitoring endpoints
  async getSystemMetrics(): Promise<SystemMetrics> {
    // Use the actual monitoring endpoints available
    const response = await this.client.get<SystemMetrics>('/monitoring/system/info');
    return response.data;
  }

  async getAgentMetrics(environmentId?: string): Promise<AgentMetrics[]> {
    // Use performance summary as agent metrics alternative
    const response = await this.client.get('/monitoring/performance/summary');
    return []; // Return empty array for now since agent-specific metrics aren't implemented
  }

  // Additional monitoring endpoints that actually exist
  async getPerformanceSummary(timeRange: string = '1h'): Promise<any> {
    const response = await this.client.get(`/monitoring/performance/summary`, {
      params: { time_range: timeRange }
    });
    return response.data;
  }

  // Utility methods
  setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken(): void {
    delete this.client.defaults.headers.common['Authorization'];
  }

  updateBaseURL(baseURL: string): void {
    this.baseURL = baseURL;
    this.client.defaults.baseURL = `${baseURL}/api/v1`;
  }
}

// Create and export a singleton instance
export const apiClient = new MaasApiClient();

// Export the class for testing or creating new instances
export default MaasApiClient;
