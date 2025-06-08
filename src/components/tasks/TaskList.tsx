export default function TaskList() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
        <p className="mt-2 text-gray-600">
          Submit and monitor tasks across your AI agents
        </p>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg p-8 text-center">
        <div className="text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Task Management</h3>
          <p className="text-gray-600">This component will display and manage tasks</p>
          <p className="text-sm text-blue-600 mt-4">Coming soon in Phase 1 Week 2</p>
        </div>
      </div>
    </div>
  );
}