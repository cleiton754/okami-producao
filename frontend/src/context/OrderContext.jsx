import React, { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../services/api';

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    loja: '',
    produto: '',
    status: '',
    data: '',
    busca: '',
    arquivados: false
  });

  const fetchOrders = useCallback(async (customFilters = filters) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (customFilters.loja) queryParams.append('loja', customFilters.loja);
      if (customFilters.produto) queryParams.append('produto', customFilters.produto);
      if (customFilters.status) queryParams.append('status', customFilters.status);
      if (customFilters.data) queryParams.append('data', customFilters.data);
      if (customFilters.busca) queryParams.append('busca', customFilters.busca);
      if (customFilters.arquivados) queryParams.append('arquivados', 'true');

      const data = await api.get(`/pedidos?${queryParams.toString()}`);
      setOrders(data);
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async (customFilters = filters) => {
    try {
      const queryParams = new URLSearchParams();
      if (customFilters.loja) queryParams.append('loja', customFilters.loja);
      if (customFilters.produto) queryParams.append('produto', customFilters.produto);
      if (customFilters.status) queryParams.append('status', customFilters.status);
      if (customFilters.data) queryParams.append('data', customFilters.data);
      if (customFilters.busca) queryParams.append('busca', customFilters.busca);

      const data = await api.get(`/dashboard/stats?${queryParams.toString()}`);
      setStats(data);
    } catch (err) {
      console.error('Erro ao buscar métricas:', err);
    }
  }, [filters]);

  const updateOrderStatus = async (id, newStatus) => {
    await api.patch(`/pedidos/${id}/status`, { status: newStatus });
    await fetchOrders();
    await fetchStats();
  };

  const deleteOrder = async (id) => {
    await api.delete(`/pedidos/${id}`);
    await fetchOrders();
    await fetchStats();
  };

  return (
    <OrderContext.Provider value={{
      orders,
      stats,
      loading,
      filters,
      setFilters,
      fetchOrders,
      fetchStats,
      updateOrderStatus,
      deleteOrder
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  return useContext(OrderContext);
}
