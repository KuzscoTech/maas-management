import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './components/common/Layout';
import Dashboard from './components/common/Dashboard';
import EnvironmentList from './components/environments/EnvironmentList';
import EnvironmentDetails from './components/environments/EnvironmentDetails';
import AgentList from './components/agents/AgentList';
import AgentDetails from './components/agents/AgentDetails';
import TaskList from './components/tasks/TaskList';
import TaskDetails from './components/tasks/TaskDetails';
import MonitoringDashboard from './components/common/MonitoringDashboard';
import Settings from './components/settings/Settings';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'environments',
        children: [
          {
            index: true,
            element: <EnvironmentList />,
          },
          {
            path: ':id',
            element: <EnvironmentDetails />,
          },
        ],
      },
      {
        path: 'agents',
        children: [
          {
            index: true,
            element: <AgentList />,
          },
          {
            path: ':id',
            element: <AgentDetails />,
          },
        ],
      },
      {
        path: 'tasks',
        children: [
          {
            index: true,
            element: <TaskList />,
          },
          {
            path: ':id',
            element: <TaskDetails />,
          },
        ],
      },
      {
        path: 'monitoring',
        element: <MonitoringDashboard />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: '*',
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
]);