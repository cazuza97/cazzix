import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { HostDetailPage } from '@/pages/HostDetailPage';

export default function App() {
  const { auth } = useAuth();
  const isAuthenticated = auth !== null;

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/"
        element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/host/:hostid/:hostname"
        element={isAuthenticated ? <HostDetailPage /> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
