import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Printer, Lock, Mail, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, senha);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Erro ao realizar login. Verifique email e senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: 20
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: 440,
        padding: 36,
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        background: 'rgba(30, 41, 59, 0.85)',
        borderColor: 'rgba(255,255,255,0.1)',
        color: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 20px rgba(236,72,153,0.3)'
          }}>
            <Printer size={28} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>OKAMI & UNIVERSO</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 4 }}>
            Sistema de Gestão de Produção Interna
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            padding: 12,
            borderRadius: 8,
            fontSize: '0.85rem',
            marginBottom: 20,
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 6, color: '#cbd5e1' }}>
              Email do Usuário
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
              <input 
                type="email" 
                placeholder="admin@okami.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 40px',
                  borderRadius: 10,
                  border: '1px solid #334155',
                  background: '#0f172a',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
                required
                id="input-login-email"
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 6, color: '#cbd5e1' }}>
              Senha
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 40px',
                  borderRadius: 10,
                  border: '1px solid #334155',
                  background: '#0f172a',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
                required
                id="input-login-password"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ marginTop: 8, padding: 12, fontSize: '0.95rem' }} 
            disabled={loading}
            id="btn-login-submit"
          >
            {loading ? 'Autenticando...' : 'Entrar no Sistema'} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: 24, padding: 14, background: 'rgba(15, 23, 42, 0.6)', borderRadius: 10, fontSize: '0.75rem', color: '#94a3b8' }}>
          <div style={{ fontWeight: 700, color: '#cbd5e1', marginBottom: 4 }}>Acesso de Demonstração Seed:</div>
          <div>👑 <b>Admin:</b> admin@okami.com | <b>Senha:</b> admin123</div>
          <div>🛠️ <b>Produção:</b> producao@okami.com | <b>Senha:</b> producao123</div>
        </div>
      </div>
    </div>
  );
}
