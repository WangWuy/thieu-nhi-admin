import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import Layout from './components/layout/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import UserListPage from './pages/users/UserListPage';
import ClassListPage from './pages/classes/ClassListPage';
import StudentListPage from './pages/students/StudentListPage';
import AttendancePage from './pages/attendance/AttendancePage';
import ComparisonToolsPage from './pages/metrics/ComparisonToolsPage'; 
import ReportsPage from './pages/reports/ReportsPage';
import SettingsPage from './pages/settings/SettingsPage';
import AlertSystemPage from './pages/alerts/AlertSystemPage';
import { authService } from './services/authService';

// Protected Route Component
const ProtectedRoute = ({ children, user, requiredRoles }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Layout Wrapper
const AppLayout = ({ children, user, onLogout }) => (
  <Layout user={user} onLogout={onLogout}>
    {children}
  </Layout>
);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authService.isAuthenticated()) {
      const savedUser = authService.getCurrentUserFromStorage();
      if (savedUser) {
        setUser(savedUser);
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route
          path="/login"
          element={
            user ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} />
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute user={user}>
              <AppLayout user={user} onLogout={handleLogout}>
                <Dashboard user={user} />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/alerts"
          element={
            <ProtectedRoute user={user} requiredRoles={['ban_dieu_hanh', 'phan_doan_truong']}>
              <AppLayout user={user} onLogout={handleLogout}>
                <AlertSystemPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/comparison"
          element={
            <ProtectedRoute user={user} requiredRoles={['ban_dieu_hanh', 'phan_doan_truong']}>
              <AppLayout user={user} onLogout={handleLogout}>
                <ComparisonToolsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute user={user} requiredRoles={['ban_dieu_hanh', 'phan_doan_truong']}>
              <AppLayout user={user} onLogout={handleLogout}>
                <UserListPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/classes"
          element={
            <ProtectedRoute user={user} requiredRoles={['ban_dieu_hanh', 'phan_doan_truong']}>
              <AppLayout user={user} onLogout={handleLogout}>
                <ClassListPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/students"
          element={
            <ProtectedRoute user={user}>
              <AppLayout user={user} onLogout={handleLogout}>
                <StudentListPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance"
          element={
            <ProtectedRoute user={user}>
              <AppLayout user={user} onLogout={handleLogout}>
                <AttendancePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute user={user}>
              <AppLayout user={user} onLogout={handleLogout}>
                <ReportsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute user={user}>
              <AppLayout user={user} onLogout={handleLogout}>
                <SettingsPage user={user} />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;