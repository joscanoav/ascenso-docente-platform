import { Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Practice from './pages/Practice';
import MockExam from './pages/MockExam';
import Result from './pages/Result';
import History from './pages/History';
import HistoryDetail from './pages/HistoryDetail';
import Admin from './pages/Admin';

export default function App() {
  const { loading } = useAuth();

  if (loading) return null;

  return (
    <div className="app-shell">
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/:block"
          element={
            <ProtectedRoute>
              <Practice />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mock-exam"
          element={
            <ProtectedRoute>
              <MockExam />
            </ProtectedRoute>
          }
        />
        <Route
          path="/result"
          element={
            <ProtectedRoute>
              <Result />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history/:id"
          element={
            <ProtectedRoute>
              <HistoryDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <Admin />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}
