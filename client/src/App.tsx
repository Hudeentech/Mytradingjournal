import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import SettingsPage from './components/SettingsPage';
import PipsCalculator from './components/PipsCalculator';
import { ToastProvider } from './components/ui/Toast';

import type { ReactNode } from 'react';
function RequireAuth({ children }: { children: ReactNode }) {
  const token = localStorage.getItem('token');
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function AppRoutes() {
  const token = localStorage.getItem('token');
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        token ? <Navigate to="/dashboard" replace /> : <LoginPage />
      } />
      <Route path="/register" element={
        token ? <Navigate to="/dashboard" replace /> : <RegisterPage />
      } />
      {/* Protected routes */}
      <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/home" element={<Navigate to="/dashboard" replace />} />
      <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
      <Route path="/calculator" element={<RequireAuth><PipsCalculator /></RequireAuth>} />
      {/* Root route - redirect to login if not authenticated, dashboard if authenticated */}
      <Route path="/" element={
        token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
      } />
      {/* Catch all route - redirect to login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        <AppRoutes />
      </div>
    </ToastProvider>
  );
}

export default App;
