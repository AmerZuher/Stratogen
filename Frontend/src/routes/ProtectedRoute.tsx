import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../providers/AuthContext';
import Layout from '../components/layouts/Layout';

export function ProtectedRoute() {
  const { token, isLoading } = useAuth();

  // Show a loading state while checking for the token
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // If there's a token, render the main app layout with the child route
  // The <Outlet /> is where the child route component (e.g., ProjectsPage) will be rendered.
  // AFTER (Correct)
  return token ? <Layout /> : <Navigate to="/login" />;
}