import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Gate for authenticated routes. While the session is resolving we render
// nothing; once resolved, no session -> redirect to /login, else render the
// nested route via <Outlet>.
export function ProtectedRoute() {
  const { session, loading } = useAuth();

  if (loading) return null;
  if (!session) return <Navigate to="/login" replace />;
  return <Outlet />;
}
