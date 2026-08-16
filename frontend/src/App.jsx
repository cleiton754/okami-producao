import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { OrderProvider } from './context/OrderContext';

import Login from './pages/Login';
import DashboardPage from './pages/DashboardPage';
import ProducaoPage from './pages/ProducaoPage';
import HistoricoPage from './pages/HistoricoPage';
import UsuariosPage from './pages/UsuariosPage';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
        Carregando Okami & Universo System...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <OrderProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />

              <Route path="/producao" element={
                <ProtectedRoute>
                  <ProducaoPage />
                </ProtectedRoute>
              } />

              <Route path="/historico" element={
                <ProtectedRoute>
                  <HistoricoPage />
                </ProtectedRoute>
              } />

              <Route path="/usuarios" element={
                <ProtectedRoute adminOnly={true}>
                  <UsuariosPage />
                </ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </OrderProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
