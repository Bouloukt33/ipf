import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import './App.css';
import { AdminLayout } from './pages/AdminLayout';
import { AdminQuestionsPage } from './pages/AdminQuestionsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminSubscriptionsPage } from './pages/AdminSubscriptionsPage';
import { AdminCategoriesPage } from './pages/AdminCategoriesPage';
import { AdminPacksPage } from './pages/AdminPacksPage';
import { AdminPlansPage } from './pages/AdminPlansPage';
import { AdminEmailsPage } from './pages/AdminEmailsPage';
import { LoginPage } from './pages/LoginPage';
import { AdminGuard } from './components/AdminGuard';

function App() {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F8F5F1]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#D27A2D] border-t-transparent rounded-full animate-spin" />
          <span className="text-[16px] font-black text-[#172E42] tracking-wider uppercase">Chargement…</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : <LoginPage />
        }
      />

      <Route path="/admin" element={
        <AdminGuard>
          <AdminLayout />
        </AdminGuard>
      }>
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="questions" element={<AdminQuestionsPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="packs" element={<AdminPacksPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
        <Route path="plans" element={<AdminPlansPage />} />
        <Route path="emails" element={<AdminEmailsPage />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
