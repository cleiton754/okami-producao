import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('okami_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem('okami_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.usuario);
          localStorage.setItem('okami_user', JSON.stringify(res.usuario));
        } catch (err) {
          console.error('Sessão expirada:', err);
          logout();
        }
      }
      setLoading(false);
    }
    checkAuth();
  }, []);

  const login = async (email, senha) => {
    const res = await api.post('/auth/login', { email, senha });
    localStorage.setItem('okami_token', res.token);
    localStorage.setItem('okami_user', JSON.stringify(res.usuario));
    setUser(res.usuario);
    return res.usuario;
  };

  const logout = () => {
    localStorage.removeItem('okami_token');
    localStorage.removeItem('okami_user');
    setUser(null);
  };

  const isAdmin = user?.cargo === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
