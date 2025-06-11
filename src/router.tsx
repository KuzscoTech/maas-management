import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './components/common/Layout';
import Dashboard from './components/common/Dashboard';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ProtectedRoute from './components/auth/ProtectedRoute';
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
    path: '/login',
    element: <LoginForm onSuccess={() => window.location.href = '/'} />,
  },
  {
    path: '/register',
    element: <RegisterForm onSuccess={() => window.location.href = '/login'} />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
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
