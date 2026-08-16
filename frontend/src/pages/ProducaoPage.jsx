import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import OrderFilter from '../components/Orders/OrderFilter';
import OrderTable from '../components/Orders/OrderTable';
import KanbanBoard from '../components/Kanban/KanbanBoard';
import OrderModal from '../components/Orders/OrderModal';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { Kanban, List, Plus, Archive, RefreshCw } from 'lucide-react';

export default function ProducaoPage() {
  const { orders, filters, setFilters, fetchOrders, updateOrderStatus, deleteOrder, loading } = useOrders();
  const { isAdmin } = useAuth();

  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState(null);

  useEffect(() => {
    fetchOrders(filters);
  }, [filters, fetchOrders]);

  const handleOpenCreateModal = () => {
    setOrderToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (order) => {
    setOrderToEdit(order);
    setIsModalOpen(true);
  };

  const toggleArchivedMode = () => {
    setFilters(prev => ({ ...prev, arquivados: !prev.arquivados }));
  };

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Kanban size={26} color="var(--primary)" />
            Fluxo de Produção {filters.arquivados ? '(Pedidos Arquivados)' : ''}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 2 }}>
            Gerenciamento do status e etapas de produção de bloquinhos, cadernetas e agendas
          </p>
        </div>

        <div style={{ display: 'flex', itemsAlign: 'center', gap: 10 }}>
          {/* View Toggle */}
          <div className="glass-panel" style={{ display: 'flex', padding: 4, borderRadius: 12 }}>
            <button 
              className={`nav-btn ${viewMode === 'kanban' ? 'active' : ''}`} 
              style={{ padding: '6px 12px' }}
              onClick={() => setViewMode('kanban')}
              id="btn-view-kanban"
            >
              <Kanban size={16} /> Kanban
            </button>
            <button 
              className={`nav-btn ${viewMode === 'list' ? 'active' : ''}`} 
              style={{ padding: '6px 12px' }}
              onClick={() => setViewMode('list')}
              id="btn-view-list"
            >
              <List size={16} /> Tabela
            </button>
          </div>

          <button 
            className={`btn ${filters.arquivados ? 'btn-primary' : 'btn-secondary'}`}
            onClick={toggleArchivedMode}
            id="btn-toggle-archived"
          >
            <Archive size={16} /> {filters.arquivados ? 'Ver Produção Ativa' : 'Ver Arquivados'}
          </button>

          {isAdmin && (
            <button 
              className="btn btn-primary" 
              onClick={handleOpenCreateModal}
              id="btn-new-order"
            >
              <Plus size={18} /> Novo Pedido
            </button>
          )}
        </div>
      </div>

      <OrderFilter 
        filters={filters} 
        setFilters={setFilters} 
        onApply={(newFilters) => fetchOrders(newFilters)} 
      />

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} className="spin" />
          <p style={{ marginTop: 8 }}>Carregando fluxo de produção...</p>
        </div>
      ) : viewMode === 'kanban' ? (
        <KanbanBoard 
          orders={orders} 
          onEdit={handleOpenEditModal} 
          onStatusChange={updateOrderStatus} 
          onDelete={deleteOrder} 
        />
      ) : (
        <OrderTable 
          orders={orders} 
          onEdit={handleOpenEditModal} 
          onStatusChange={updateOrderStatus} 
          onDelete={deleteOrder} 
        />
      )}

      <OrderModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        orderToEdit={orderToEdit} 
        onSaved={() => fetchOrders(filters)} 
      />
    </Layout>
  );
}
