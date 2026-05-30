import { Route, Routes, Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import './App.css';
import { AdminLayout } from './pages/AdminLayout';
import { AdminQuestionsPage } from './pages/AdminQuestionsPage';

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
              <div className="max-w-md">
                <h1 className="text-[32px] font-black text-[#172E42] mb-4">IPF Admin</h1>
                <p className="text-[16px] font-bold text-[#5a7a99] mb-8">
                  Accédez au dashboard sécurisé pour gérer vos questions et quiz.
                </p>
                <LoginButton />
              </div>
            </div>
          )
        }
      />

      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<div>Dashboard Page (En cours de migration)</div>} />
        <Route path="questions" element={<AdminQuestionsPage />} />
        <Route path="categories" element={<div>Categories Page (En cours de migration)</div>} />
        <Route path="packs" element={<div>Packs Page (En cours de migration)</div>} />
        <Route path="users" element={<div>Users Page (En cours de migration)</div>} />
        <Route path="subscriptions" element={<div>Subscriptions Page (En cours de migration)</div>} />
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
