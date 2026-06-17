import { BrowserRouter, Routes, Route, Outlet, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RequireOnboarding } from './components/RequireOnboarding';
import { Nav } from './components/Nav';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Applications } from './pages/Applications';
import { JobAnalysis } from './pages/JobAnalysis';
import { Profile } from './pages/Profile';
import { useAuth } from './hooks/useAuth';

function ProfilePage() {
  const { refreshProfile } = useAuth();
  const navigate = useNavigate();
  return (
    <Profile
      onSaved={async () => {
        await refreshProfile();
        navigate('/');
      }}
    />
  );
}

// Shell for authenticated pages: nav bar + routed content.
function Layout() {
  return (
    <div className="relative min-h-[100dvh] bg-surface">
      {/* Faint engineering grid + a low lime wash at the top. Fixed, non-interactive. */}
      <div className="grid-wash pointer-events-none fixed inset-0 -z-0" />
      <div
        className="pointer-events-none fixed inset-x-0 top-0 -z-0 h-72"
        style={{
          background:
            'radial-gradient(50% 100% at 50% 0%, rgba(163,230,53,0.07), transparent 70%)',
        }}
      />
      <Nav />
      <main className="relative mx-auto max-w-5xl px-4 py-10">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route element={<RequireOnboarding />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/applications" element={<Applications />} />
                <Route path="/analyze" element={<JobAnalysis />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
