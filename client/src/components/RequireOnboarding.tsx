import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Sits inside ProtectedRoute. While the profile is resolving we render nothing;
// once resolved, an un-onboarded user is sent to /profile. /profile itself is
// mounted OUTSIDE this gate (see App.tsx) so it stays reachable.
export function RequireOnboarding() {
  const { profile, profileLoading } = useAuth();
  const location = useLocation();

  if (profileLoading && !profile) return null;
  if (!profile?.onboarded) {
    return <Navigate to="/profile" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
