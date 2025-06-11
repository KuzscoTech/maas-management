import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CpuChipIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ServerIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import { useHealthQuery } from '../../hooks/useHealthQuery';
import { useEnvironmentsQuery } from '../../hooks/useEnvironmentQueries';
import { useTasksQuery } from '../../hooks/useTaskQueries';
import LoadingSpinner from './LoadingSpinner';

interface MetricCard {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ElementType;
  color: string;
}

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

export default function MonitoringDashboard() {
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);

  const { data: healthData, isLoading: healthLoading } = useHealthQuery();
  const { data: environments } = useEnvironmentsQuery();
  const { data: tasks } = useTasksQuery();

  // Simulate system metrics (in a real app, these would come from the backend)
  useEffect(() => {
    const generateMetrics = () => {
      const baseMetrics: SystemMetric[] = [
        {
          name: 'CPU Usage',
          value: Math.random() * 100,
          unit: '%',
          status: Math.random() > 0.8 ? 'warning' : 'healthy',
          trend: Math.random() > 0.5 ? 'up' : 'down'
        },
        {
          name: 'Memory Usage',
          value: Math.random() * 100,
          unit: '%',
          status: Math.random() > 0.9 ? 'critical' : 'healthy',
          trend: Math.random() > 0.5 ? 'up' : 'stable'
        },
        {
          name: 'Response Time',
          value: Math.random() * 500 + 50,
          unit: 'ms',
          status: Math.random() > 0.7 ? 'warning' : 'healthy',
          trend: Math.random() > 0.5 ? 'down' : 'up'
        },
        {
          name: 'Queue Size',
          value: Math.floor(Math.random() * 20),
          unit: 'tasks',
          status: Math.random() > 0.8 ? 'warning' : 'healthy',
          trend: Math.random() > 0.5 ? 'stable' : 'down'
        }
      ];
      setSystemMetrics(baseMetrics);
    };

    generateMetrics();
    const interval = setInterval(generateMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return ArrowTrendingUpIcon;
      case 'down': return ArrowTrendingDownIcon;
      default: return ClockIcon;
    }
  };

  const taskStats = (tasks && Array.isArray(tasks)) ? {
    total: tasks.length,
    running: tasks.filter((t: any) => t.status === 'running').length,
    completed: tasks.filter((t: any) => t.status === 'completed').length,
    failed: tasks.filter((t: any) => t.status === 'failed').length,
    pending: tasks.filter((t: any) => t.status === 'pending').length
  } : null;

  const envStats = environments ? {
    total: environments.length,
    active: environments.filter(e => e.status === 'active').length,
    inactive: environments.filter(e => e.status === 'inactive').length
  } : null;

  const metricCards: MetricCard[] = [
    {
      title: 'System Health',
      value: healthData?.status === 'healthy' ? 'Healthy' : 'Issues',
      icon: healthData?.status === 'healthy' ? CheckCircleIcon : ExclamationTriangleIcon,
      color: healthData?.status === 'healthy' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
    },
    {
      title: 'Active Environments',
      value: envStats?.active || 0,
      change: envStats ? `${envStats.total} total` : undefined,
      icon: ServerIcon,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      title: 'Running Tasks',
      value: taskStats?.running || 0,
      change: taskStats ? `${taskStats.total} total` : undefined,
      icon: BoltIcon,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      title: 'Success Rate',
      value: taskStats && taskStats.total > 0 
        ? `${Math.round((taskStats.completed / taskStats.total) * 100)}%`
        : 'N/A',
      change: taskStats ? `${taskStats.completed}/${taskStats.total}` : undefined,
      icon: ChartBarIcon,
      color: 'text-green-600 bg-green-100'
    }
  ];

  if (healthLoading) {
    return <LoadingSpinner message="Loading monitoring data..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
          <p className="mt-2 text-gray-600">
            Real-time system health and performance metrics
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value={10000}>10 seconds</option>
            <option value={30000}>30 seconds</option>
            <option value={60000}>1 minute</option>
            <option value={300000}>5 minutes</option>
          </select>
          <div className="flex items-center text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
            Live
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric, index) => (
          <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-md ${metric.color}`}>
                    <metric.icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {metric.title}
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    {metric.value}
                  </dd>
                  {metric.change && (
                    <dd className="mt-1 text-sm text-gray-600">
                      {metric.change}
                    </dd>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Resources</h3>
          <div className="space-y-4">
            {systemMetrics.map((metric, index) => {
              const TrendIcon = getTrendIcon(metric.trend);
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getStatusColor(metric.status)}`}>
                      <CpuChipIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{metric.name}</p>
                      <p className="text-xs text-gray-500">
                        {metric.value.toFixed(1)} {metric.unit}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendIcon className={`h-4 w-4 ${
                      metric.trend === 'up' ? 'text-green-500' : 
                      metric.trend === 'down' ? 'text-red-500' : 'text-gray-400'
                    }`} />
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getStatusColor(metric.status)
                    }`}>
                      {metric.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Task Performance</h3>
          {taskStats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{taskStats.completed}</p>
                  <p className="text-sm text-gray-500">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{taskStats.failed}</p>
                  <p className="text-sm text-gray-500">Failed</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{taskStats.running}</p>
                  <p className="text-sm text-gray-500">Running</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{taskStats.pending}</p>
                  <p className="text-sm text-gray-500">Pending</p>
                </div>
              </div>
              
              {/* Task Success Rate Progress Bar */}
              <div>
                <div className="flex justify-between text-sm">
                  <span>Success Rate</span>
                  <span>{taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}%</span>
                </div>
                <div className="mt-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: taskStats.total > 0 ? `${(taskStats.completed / taskStats.total) * 100}%` : '0%' 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <p className="text-sm">No task data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {(tasks && Array.isArray(tasks) ? tasks.slice(0, 5) : []).map((task: any) => (
            <div key={task.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  task.status === 'completed' ? 'bg-green-400' :
                  task.status === 'failed' ? 'bg-red-400' :
                  task.status === 'running' ? 'bg-blue-400' :
                  'bg-yellow-400'
                }`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {task.agent_type.replace('_', ' ').toUpperCase()} Task
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(task.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                task.status === 'completed' ? 'bg-green-100 text-green-800' :
                task.status === 'failed' ? 'bg-red-100 text-red-800' :
                task.status === 'running' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {task.status}
              </span>
            </div>
          )) || (
            <div className="text-center text-gray-500">
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}