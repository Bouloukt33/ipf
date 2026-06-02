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
          isAuthenticated ? (
            <Navigate to="/admin/dashboard" replace />
          ) : (
            <div className="flex items-center justify-center h-screen bg-[#F8F5F1] p-6 text-center">
              <div className="max-w-md bg-white p-10 rounded-[40px] shadow-card border border-ink-100">
                <img src="/images/logo_admin_dark.png" alt="IPF Logo" className="h-12 mx-auto mb-8 object-contain" />
                <h1 className="text-[28px] font-black text-[#172E42] mb-3">Administration</h1>
                <p className="text-[15px] font-semibold text-[#5a7a99] mb-10">
                  Accédez au dashboard sécurisé pour gérer vos questions et quiz.
                </p>
                <LoginButton />
              </div>
            </div>
          )
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

function LoginButton() {
  const { loginWithRedirect } = useAuth0();
  return (
    <button
      onClick={() => loginWithRedirect()}
      className="h-[52px] px-10 rounded-[16px] border-none bg-gradient-to-br from-[#D27A2D] to-[#F59E0B] font-extrabold text-[16px] text-white cursor-pointer shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
    >
      Se connecter
    </button>
  );
}

export default App;
