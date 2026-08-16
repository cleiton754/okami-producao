import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import { api } from '../services/api';
import { History, User, Clock, Package, RefreshCw } from 'lucide-react';

export default function HistoricoPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.get('/historico');
      setHistory(data);
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(d);
  };

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
            <History size={26} color="var(--primary)" />
            Histórico de Auditoria & Ações
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 2 }}>
            Registro cronológico completo de criação, alterações e movimentações de pedidos pela equipe
          </p>
        </div>

        <button className="btn btn-secondary" onClick={fetchHistory} id="btn-refresh-history">
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> Atualizar Logs
        </button>
      </div>

      <div className="glass-panel" style={{ padding: 20 }}>
        {loading ? (
          <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)' }}>
            Carregando registro de atividades...
          </div>
        ) : history.length === 0 ? (
          <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)' }}>
            Nenhum histórico registrado no sistema.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} id="history-list">
            {history.map(item => (
              <div 
                key={item.id} 
                style={{
                  padding: 14,
                  borderRadius: 12,
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div className="stat-icon" style={{ width: 40, height: 40, background: 'var(--primary-light)', color: 'var(--primary)' }}>
                    <User size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      {item.acao}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      Responsável: <b>{item.usuario_nome || 'Sistema'}</b>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={14} />
                  {formatDateTime(item.data_hora)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
