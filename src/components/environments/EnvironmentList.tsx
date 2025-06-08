export default function EnvironmentList() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Environments</h1>
        <p className="mt-2 text-gray-600">
          Manage isolated workspaces for your AI agents
        </p>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg p-8 text-center">
        <div className="text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Environment Management</h3>
          <p className="text-gray-600">This component will display and manage environments</p>
          <p className="text-sm text-blue-600 mt-4">Coming soon in Phase 1 Week 2</p>
        </div>
      </div>
    </div>
  );
}