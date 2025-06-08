import { useParams } from 'react-router-dom';

export default function AgentDetails() {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Agent Details</h1>
        <p className="mt-2 text-gray-600">
          Agent ID: {id}
        </p>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg p-8 text-center">
        <div className="text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Agent Details</h3>
          <p className="text-gray-600">This component will show detailed agent information</p>
          <p className="text-sm text-blue-600 mt-4">Coming soon in Phase 1 Week 2</p>
        </div>
      </div>
    </div>
  );
}