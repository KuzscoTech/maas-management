export default function MonitoringDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Monitoring</h1>
        <p className="mt-2 text-gray-600">
          System health and performance metrics
        </p>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg p-8 text-center">
        <div className="text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">System Monitoring</h3>
          <p className="text-gray-600">This component will display system metrics and health</p>
          <p className="text-sm text-blue-600 mt-4">Coming soon in Phase 1 Week 2</p>
        </div>
      </div>
    </div>
  );
}