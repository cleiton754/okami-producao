import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import UserModal from '../components/Users/UserModal';
import { api } from '../services/api';
import { Users, UserPlus, Shield, UserCheck, UserX, Edit, RefreshCw } from 'lucide-react';

export default function UsuariosPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.get('/usuarios');
      setUsers(data);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = () => {
    setUserToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setUserToEdit(user);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.patch(`/usuarios/${id}/status`);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Users size={26} color="var(--primary)" />
            Gestão de Usuários da Equipe
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 2 }}>
            Controle de perfis de acesso, permissões e operadores da gráfica
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleCreateUser} id="btn-add-user">
          <UserPlus size={18} /> Novo Usuário
        </button>
      </div>

      <div className="table-responsive" id="users-table-container">
        <table className="custom-table" id="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Cargo / Perfil</th>
              <th>Status</th>
              <th>Cadastrado Em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                  Carregando lista de usuários...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                  Nenhum usuário cadastrado.
                </td>
              </tr>
            ) : (
              users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 800 }}>#{u.id}</td>
                  <td style={{ fontWeight: 700 }}>{u.nome}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.cargo === 'admin' ? 'badge-okami' : 'badge-universo'}`}>
                      {u.cargo === 'admin' ? '👑 Administrador' : '🛠️ Produção'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.ativo ? 'badge-pronto' : 'badge-arquivado'}`}>
                      {u.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{formatDate(u.criado_em)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: 6 }} 
                        onClick={() => handleEditUser(u)}
                        title="Editar Usuário"
                        id={`btn-edit-user-${u.id}`}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className={`btn ${u.ativo ? 'btn-secondary' : 'btn-primary'}`} 
                        style={{ padding: 6, color: u.ativo ? '#ef4444' : '#10b981' }} 
                        onClick={() => handleToggleStatus(u.id)}
                        title={u.ativo ? 'Desativar Usuário' : 'Ativar Usuário'}
                        id={`btn-toggle-user-${u.id}`}
                      >
                        {u.ativo ? <UserX size={16} /> : <UserCheck size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <UserModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        userToEdit={userToEdit} 
        onSaved={fetchUsers} 
      />
    </Layout>
  );
}
