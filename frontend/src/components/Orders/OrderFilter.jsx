import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

export default function OrderFilter({ filters, setFilters, onApply, showStatusFilter = true }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    const resetState = {
      loja: '',
      produto: '',
      status: '',
      data: '',
      busca: '',
      arquivados: filters.arquivados
    };
    setFilters(resetState);
    if (onApply) onApply(resetState);
  };

  return (
    <div className="toolbar" id="order-filter-toolbar">
      <div style={{ position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
        <input 
          type="text"
          name="busca"
          placeholder="Buscar por título ou nº do pedido..."
          value={filters.busca}
          onChange={handleChange}
          style={{ paddingLeft: 38 }}
          id="input-filter-search"
        />
      </div>

      <select name="loja" value={filters.loja} onChange={handleChange} id="select-filter-loja">
        <option value="">Todas as Lojas</option>
        <option value="Okami">Okami</option>
        <option value="Universo">Universo</option>
      </select>

      <select name="produto" value={filters.produto} onChange={handleChange} id="select-filter-produto">
        <option value="">Todos os Produtos</option>
        <option value="Bloquinho">Bloquinho</option>
        <option value="Caderneta">Caderneta</option>
        <option value="Agenda">Agenda</option>
      </select>

      {showStatusFilter && (
        <select name="status" value={filters.status} onChange={handleChange} id="select-filter-status">
          <option value="">Todos os Status</option>
          <option value="Aguardando Impressão">Aguardando Impressão</option>
          <option value="Impresso">Impresso</option>
          <option value="Cortado">Cortado</option>
          <option value="Montado">Montado</option>
          <option value="Pronto">Pronto</option>
          <option value="Enviado">Enviado</option>
        </select>
      )}

      <input 
        type="date"
        name="data"
        value={filters.data}
        onChange={handleChange}
        id="input-filter-date"
      />
    </div>
  );
}
