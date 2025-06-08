export default function AgentList() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Agents</h1>
        <p className="mt-2 text-gray-600">
          Deploy and manage AI agents across environments
        </p>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg p-8 text-center">
        <div className="text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Agent Management</h3>
          <p className="text-gray-600">This component will display and manage AI agents</p>
          <p className="text-sm text-blue-600 mt-4">Coming soon in Phase 1 Week 2</p>
        </div>
      </div>
    </div>
  );
}