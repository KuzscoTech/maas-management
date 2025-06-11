import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import LoadingSpinner from '../common/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, accessToken, initializeAuth, isLoading } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    // Initialize auth when component mounts
    if (accessToken && !isAuthenticated) {
      initializeAuth();
    }
  }, [accessToken, isAuthenticated, initializeAuth]);

  // Show loading spinner while checking authentication
  if (isLoading || (accessToken && !isAuthenticated)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner message="Authenticating..." />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render protected content
  return <>{children}</>;
}
