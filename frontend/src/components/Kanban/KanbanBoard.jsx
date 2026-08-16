import React from 'react';
import OrderCard from '../Orders/OrderCard';
import { Printer, Scissors, Layers, CheckCircle2, Send, Clock } from 'lucide-react';

const COLUMNS = [
  { key: 'Aguardando Impressão', title: 'Aguardando Impressão', icon: Clock, color: '#eab308' },
  { key: 'Impresso', title: 'Impresso', icon: Printer, color: '#3b82f6' },
  { key: 'Cortado', title: 'Cortado', icon: Scissors, color: '#8b5cf6' },
  { key: 'Montado', title: 'Montado', icon: Layers, color: '#f97316' },
  { key: 'Pronto', title: 'Pronto', icon: CheckCircle2, color: '#10b981' },
  { key: 'Enviado', title: 'Enviado', icon: Send, color: '#06b6d4' }
];

export default function KanbanBoard({ orders, onEdit, onStatusChange, onDelete }) {
  return (
    <div className="kanban-board" id="kanban-board-grid">
      {COLUMNS.map(col => {
        const IconComponent = col.icon;
        const columnOrders = orders.filter(o => o.status === col.key);

        return (
          <div className="kanban-column" key={col.key} id={`kanban-col-${col.key.toLowerCase().replace(/\s+/g, '-')}`}>
            <div className="kanban-column-header">
              <div className="kanban-column-title" style={{ color: col.color }}>
                <IconComponent size={18} />
                <span>{col.title}</span>
              </div>
              <span className="count-pill">{columnOrders.length}</span>
            </div>

            <div className="kanban-cards">
              {columnOrders.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic', border: '1px dashed var(--border-color)', borderRadius: 8 }}>
                  Nenhum pedido nesta etapa
                </div>
              ) : (
                columnOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onEdit={onEdit}
                    onStatusChange={onStatusChange}
                    onDelete={onDelete}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
