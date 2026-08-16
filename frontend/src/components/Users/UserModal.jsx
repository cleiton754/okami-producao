import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { X, User, Lock, Mail, ShieldCheck } from 'lucide-react';

export default function UserModal({ isOpen, onClose, userToEdit, onSaved }) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    cargo: 'producao',
    ativo: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        nome: userToEdit.nome || '',
        email: userToEdit.email || '',
        senha: '',
        cargo: userToEdit.cargo || 'producao',
        ativo: userToEdit.ativo === 1 || userToEdit.ativo === true
      });
    } else {
      setFormData({
        nome: '',
        email: '',
        senha: '',
        cargo: 'producao',
        ativo: true
      });
    }
    setError('');
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (userToEdit) {
        await api.put(`/usuarios/${userToEdit.id}`, formData);
      } else {
        await api.post('/usuarios', formData);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Erro ao salvar usuário.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" id="user-modal-overlay">
      <div className="modal-content" style={{ maxWidth: 480 }} id="user-modal-content">
        <div className="modal-header">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
            {userToEdit ? 'Editar Usuário' : 'Novo Usuário da Equipe'}
          </h3>
          <button className="btn btn-secondary" style={{ padding: 6 }} onClick={onClose} id="btn-close-user-modal">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Nome Completo *</label>
            <input 
              type="text" 
              name="nome" 
              value={formData.nome} 
              onChange={handleChange} 
              className="form-control" 
              required 
              id="input-user-name"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Email de Acesso *</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              className="form-control" 
              required 
              id="input-user-email"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>
              Senha {userToEdit ? '(Deixe em branco para não alterar)' : '*'}
            </label>
            <input 
              type="password" 
              name="senha" 
              value={formData.senha} 
              onChange={handleChange} 
              className="form-control" 
              required={!userToEdit}
              id="input-user-password"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: 4 }}>Perfil / Cargo *</label>
            <select name="cargo" value={formData.cargo} onChange={handleChange} className="form-control" id="select-user-role">
              <option value="producao">Equipe de Produção</option>
              <option value="admin">Administrador Geral</option>
            </select>
          </div>

          {userToEdit && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <input 
                type="checkbox" 
                name="ativo" 
                id="checkbox-user-active" 
                checked={formData.ativo} 
                onChange={handleChange}
                style={{ width: 18, height: 18 }}
              />
              <label htmlFor="checkbox-user-active" style={{ fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}>
                Usuário Ativo no Sistema
              </label>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} id="btn-cancel-user-modal">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="btn-submit-user-modal">
              {loading ? 'Salvando...' : 'Salvar Usuário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
