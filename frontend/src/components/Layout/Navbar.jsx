import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  LayoutDashboard, 
  Kanban, 
  History, 
  Users, 
  LogOut, 
  Sun, 
  Moon, 
  Printer, 
  UserCheck 
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/dashboard" className="brand-logo" id="brand-logo-link">
          <div className="stat-icon" style={{ width: 36, height: 36 }}>
            <Printer size={20} />
          </div>
          <span>OKAMI <span style={{ opacity: 0.6 }}>&</span> UNIVERSO</span>
          <span className="brand-badge">PRODUÇÃO</span>
        </NavLink>

        <div className="nav-links">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
            id="nav-link-dashboard"
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink 
            to="/producao" 
            className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
            id="nav-link-producao"
          >
            <Kanban size={18} />
            <span>Produção</span>
          </NavLink>

          <NavLink 
            to="/historico" 
            className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
            id="nav-link-historico"
          >
            <History size={18} />
            <span>Histórico</span>
          </NavLink>

          {isAdmin && (
            <NavLink 
              to="/usuarios" 
              className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
              id="nav-link-usuarios"
            >
              <Users size={18} />
              <span>Usuários</span>
            </NavLink>
          )}

          <div style={{ width: 1, height: 24, background: 'var(--border-color)', margin: '0 4px' }} />

          <button 
            onClick={toggleTheme} 
            className="btn btn-secondary" 
            style={{ padding: '8px 12px' }} 
            title="Alternar Tema Dark/Light"
            id="btn-toggle-theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 8 }}>
              <div style={{ fontSize: '0.85rem', textAlign: 'right' }}>
                <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <UserCheck size={14} color="var(--primary)" />
                  {user.nome}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 800 }}>
                  {user.cargo === 'admin' ? 'Administrador' : 'Produção'}
                </div>
              </div>
              <button 
                onClick={logout} 
                className="btn btn-secondary" 
                style={{ padding: '8px 12px', color: '#ef4444' }} 
                title="Sair da Conta"
                id="btn-logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
