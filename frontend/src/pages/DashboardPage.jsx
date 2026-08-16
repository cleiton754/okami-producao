import React, { useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import StatsCards from '../components/Dashboard/StatsCards';
import OrderFilter from '../components/Orders/OrderFilter';
import { useOrders } from '../context/OrderContext';
import { LayoutDashboard, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const { stats, filters, setFilters, fetchStats, loading } = useOrders();

  useEffect(() => {
    fetchStats(filters);
  }, [filters, fetchStats]);

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
            <LayoutDashboard size={26} color="var(--primary)" />
            Dashboard de Produção Okami & Universo
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 2 }}>
            Acompanhamento gerencial consolidado da papelaria e produção em tempo real
          </p>
        </div>

        <button 
          className="btn btn-secondary" 
          onClick={() => fetchStats(filters)}
          id="btn-refresh-dashboard"
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> Atualizar Métricas
        </button>
      </div>

      <OrderFilter 
        filters={filters} 
        setFilters={setFilters} 
        onApply={(newFilters) => fetchStats(newFilters)} 
      />

      <StatsCards stats={stats} />
    </Layout>
  );
}
