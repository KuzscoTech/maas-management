import { Link } from 'react-router-dom';
import { useHealthQuery } from '../../hooks/useHealthQuery';

export default function Dashboard() {
  const { data: health, isLoading: loading, error } = useHealthQuery();

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="mt-2 text-gray-600">
          Overview of your MAAS Platform status and quick actions
        </p>
      </div>

      {/* API Status Card */}
      <div className="bg-white overflow-hidden shadow-sm rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Platform Status
          </h3>
          
          {loading && (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-gray-600">Connecting to MAAS Platform...</span>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Connection Failed
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error instanceof Error ? error.message : String(error)}</p>
                    <p className="mt-1">
                      Make sure the MAAS Platform backend is running on{' '}
                      <code className="bg-red-100 px-1 rounded">http://localhost:8000</code>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {health && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Platform Connected
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Service: {health.service}</p>
                    <p>Version: {health.version}</p>
                    <p>Status: {health.status}</p>
                    <p>Last Check: {new Date(health.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {health && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link 
            to="/environments"
            className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">Environments</h4>
                  <p className="text-gray-600">Manage isolated workspaces</p>
                </div>
              </div>
            </div>
          </Link>

          <Link 
            to="/agents"
            className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">Agents</h4>
                  <p className="text-gray-600">Deploy and manage AI agents</p>
                </div>
              </div>
            </div>
          </Link>

          <Link 
            to="/tasks"
            className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">Tasks</h4>
                  <p className="text-gray-600">Submit and monitor tasks</p>
                </div>
              </div>
            </div>
          </Link>

          <Link 
            to="/monitoring"
            className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">Monitoring</h4>
                  <p className="text-gray-600">System health and metrics</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Development Info */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Development Phase 1: Navigation Setup Complete
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>✅ React Router configured with main routes</p>
              <p>✅ Responsive navigation layout with sidebar</p>
              <p>✅ React Query setup with automatic health monitoring</p>
              <p>✅ Dashboard with health monitoring and quick actions</p>
              <p className="mt-2 font-medium">Next: Environment Management Dashboard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}