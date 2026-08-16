import React from 'react';
import { 
  Package, 
  BookOpen, 
  BookMarked, 
  Calendar, 
  Printer, 
  Scissors, 
  Layers, 
  CheckCircle2, 
  Send 
} from 'lucide-react';

export default function StatsCards({ stats }) {
  if (!stats) return null;

  const cards = [
    { label: 'Total de Pedidos', value: stats.total_pedidos, icon: Package, color: '#3b82f6' },
    { label: 'Bloquinhos (Unid.)', value: stats.total_bloquinhos, icon: BookOpen, color: '#ec4899' },
    { label: 'Cadernetas (Unid.)', value: stats.total_cadernetas, icon: BookMarked, color: '#8b5cf6' },
    { label: 'Agendas (Unid.)', value: stats.total_agendas, icon: Calendar, color: '#06b6d4' },
    { label: 'Aguardando Impressão', value: stats.aguardando_impressao, icon: Printer, color: '#eab308' },
    { label: 'Impressos', value: stats.impressos, icon: Printer, color: '#3b82f6' },
    { label: 'Cortados', value: stats.cortados, icon: Scissors, color: '#8b5cf6' },
    { label: 'Montados', value: stats.montados, icon: Layers, color: '#f97316' },
    { label: 'Prontos', value: stats.prontos, icon: CheckCircle2, color: '#10b981' },
    { label: 'Enviados', value: stats.enviados, icon: Send, color: '#06b6d4' }
  ];

  return (
    <div className="stats-grid" id="stats-cards-grid">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div className="stat-card" key={index}>
            <div className="stat-info">
              <div className="stat-value">{card.value}</div>
              <div className="stat-label">{card.label}</div>
            </div>
            <div className="stat-icon" style={{ backgroundColor: `${card.color}15`, color: card.color }}>
              <IconComponent size={24} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
