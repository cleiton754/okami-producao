import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Edit, Trash2, Image as ImageIcon, Calendar, Layers, FileText } from 'lucide-react';

export default function OrderCard({ order, onEdit, onStatusChange, onDelete }) {
  const { isAdmin } = useAuth();

  const statuses = [
    'Aguardando Impressão',
    'Impresso',
    'Cortado',
    'Montado',
    'Pronto',
    'Enviado'
  ];

  const currentIdx = statuses.indexOf(order.status);
  const nextStatus = currentIdx >= 0 && currentIdx < statuses.length - 1 ? statuses[currentIdx + 1] : null;
  const prevStatus = currentIdx > 0 ? statuses[currentIdx - 1] : null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const [y, m, d] = dateStr.split('T')[0].split('-');
    return `${d}/${m}/${y}`;
  };

  const frenteFile = order.arquivos?.find(a => a.tipo === 'frente');
  const versoFile = order.arquivos?.find(a => a.tipo === 'verso');

  return (
    <div 
      className="glass-panel" 
      style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10, position: 'relative' }}
      id={`kanban-card-${order.id}`}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)' }}>
            #{order.numero_pedido}
          </span>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginTop: 2, lineHeight: 1.3 }}>
            {order.titulo}
          </h4>
        </div>
        <span className={`badge ${order.loja === 'Okami' ? 'badge-okami' : 'badge-universo'}`}>
          {order.loja}
        </span>
      </div>

      {/* Thumbnail Previews */}
      {(frenteFile || versoFile) && (
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          {frenteFile && frenteFile.url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
            <img 
              src={frenteFile.url} 
              alt="Frente" 
              style={{ width: 54, height: 54, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border-color)' }} 
            />
          ) : frenteFile ? (
            <a href={frenteFile.url} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '6px 8px', fontSize: '0.7rem' }}>
              <FileText size={14} /> PDF Frente
            </a>
          ) : null}

          {versoFile && versoFile.url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
            <img 
              src={versoFile.url} 
              alt="Verso" 
              style={{ width: 54, height: 54, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border-color)' }} 
            />
          ) : versoFile ? (
            <a href={versoFile.url} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '6px 8px', fontSize: '0.7rem' }}>
              <FileText size={14} /> PDF Verso
            </a>
          ) : null}
        </div>
      )}

      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div>Produto: <b>{order.produto}</b> (Qtd: <b>{order.quantidade}</b>)</div>
        <div>Espiral: <b>{order.tipo_espiral}</b> {order.frente_verso ? '• (Frente/Verso)' : ''}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Calendar size={13} /> Data: {formatDate(order.data_pedido)}
        </div>
        {order.observacoes && (
          <div style={{ fontStyle: 'italic', background: 'var(--bg-primary)', padding: 6, borderRadius: 6, marginTop: 4 }}>
            "{order.observacoes}"
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, paddingTop: 8, borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {prevStatus && (
            <button 
              className="btn btn-secondary" 
              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
              onClick={() => onStatusChange(order.id, prevStatus)}
              title={`Voltar para ${prevStatus}`}
              id={`btn-prev-status-${order.id}`}
            >
              ← Voltar
            </button>
          )}
          {nextStatus && (
            <button 
              className="btn btn-primary" 
              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
              onClick={() => onStatusChange(order.id, nextStatus)}
              title={`Avançar para ${nextStatus}`}
              id={`btn-next-status-${order.id}`}
            >
              Avançar →
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          {isAdmin && (
            <button 
              className="btn btn-secondary" 
              style={{ padding: 4 }} 
              onClick={() => onEdit(order)}
              title="Editar"
              id={`btn-kanban-edit-${order.id}`}
            >
              <Edit size={14} />
            </button>
          )}
          {isAdmin && (
            <button 
              className="btn btn-secondary" 
              style={{ padding: 4, color: '#ef4444' }} 
              onClick={() => onDelete(order.id)}
              title="Excluir"
              id={`btn-kanban-delete-${order.id}`}
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
