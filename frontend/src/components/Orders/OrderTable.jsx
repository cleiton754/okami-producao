import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Edit, Trash2, Archive, ExternalLink, Image as ImageIcon } from 'lucide-react';

export default function OrderTable({ orders, onEdit, onStatusChange, onDelete }) {
  const { isAdmin } = useAuth();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Aguardando Impressão': return 'badge-aguardando';
      case 'Impresso': return 'badge-impresso';
      case 'Cortado': return 'badge-cortado';
      case 'Montado': return 'badge-montado';
      case 'Pronto': return 'badge-pronto';
      case 'Enviado': return 'badge-enviado';
      default: return 'badge-arquivado';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const [y, m, d] = dateStr.split('T')[0].split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="table-responsive" id="order-table-container">
      <table className="custom-table" id="order-table">
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Loja</th>
            <th>Produto</th>
            <th>Qtd</th>
            <th>Espiral / FV</th>
            <th>Status</th>
            <th>Data</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                Nenhum pedido encontrado.
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr key={order.id}>
                <td>
                  <div style={{ fontWeight: 800 }}>#{order.numero_pedido}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{order.titulo}</div>
                  {order.arquivos && order.arquivos.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      {order.arquivos.map((file, idx) => (
                        <a 
                          key={idx} 
                          href={file.url} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 2 }}
                        >
                          <ImageIcon size={12} /> {file.tipo}
                        </a>
                      ))}
                    </div>
                  )}
                </td>

                <td>
                  <span className={`badge ${order.loja === 'Okami' ? 'badge-okami' : 'badge-universo'}`}>
                    {order.loja}
                  </span>
                </td>

                <td>
                  <span style={{ fontWeight: 700 }}>{order.produto}</span>
                </td>

                <td>
                  <span style={{ fontWeight: 800, fontSize: '1rem' }}>{order.quantidade}</span>
                </td>

                <td style={{ fontSize: '0.85rem' }}>
                  <div>Espiral: <b>{order.tipo_espiral}</b></div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    Frente/Verso: {order.frente_verso ? 'Sim' : 'Não'}
                  </div>
                </td>

                <td>
                  <select
                    className={`badge ${getStatusBadge(order.status)}`}
                    value={order.status}
                    onChange={(e) => onStatusChange(order.id, e.target.value)}
                    style={{ border: 'none', cursor: 'pointer', padding: '6px 10px' }}
                    id={`select-status-${order.id}`}
                  >
                    <option value="Aguardando Impressão">Aguardando Impressão</option>
                    <option value="Impresso">Impresso</option>
                    <option value="Cortado">Cortado</option>
                    <option value="Montado">Montado</option>
                    <option value="Pronto">Pronto</option>
                    <option value="Enviado">Enviado</option>
                    <option value="Arquivado">Arquivado</option>
                  </select>
                </td>

                <td style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {formatDate(order.data_pedido)}
                </td>

                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {isAdmin && (
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: 6 }} 
                        onClick={() => onEdit(order)}
                        title="Editar Pedido"
                        id={`btn-edit-order-${order.id}`}
                      >
                        <Edit size={16} />
                      </button>
                    )}

                    {isAdmin && (
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: 6, color: '#ef4444' }} 
                        onClick={() => onDelete(order.id)}
                        title="Excluir Pedido"
                        id={`btn-delete-order-${order.id}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
