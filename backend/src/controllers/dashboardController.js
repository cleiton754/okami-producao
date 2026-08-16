import { db } from '../config/database.js';

export async function getDashboardStats(req, res) {
  try {
    const { loja, produto, status, data, busca } = req.query;

    if (db.isFallback()) {
      const store = db.getFallbackStore();
      let pedidos = store.pedidos.filter(p => p.status !== 'Arquivado');

      if (loja) pedidos = pedidos.filter(p => p.loja === loja);
      if (produto) pedidos = pedidos.filter(p => p.produto === produto);
      if (status) pedidos = pedidos.filter(p => p.status === status);
      if (data) pedidos = pedidos.filter(p => p.data_pedido === data);
      if (busca) {
        const q = busca.toLowerCase();
        pedidos = pedidos.filter(p => p.titulo.toLowerCase().includes(q) || p.numero_pedido.toLowerCase().includes(q));
      }

      const total_pedidos = pedidos.length;
      const total_bloquinhos = pedidos.filter(p => p.produto === 'Bloquinho').reduce((acc, p) => acc + Number(p.quantidade), 0);
      const total_cadernetas = pedidos.filter(p => p.produto === 'Caderneta').reduce((acc, p) => acc + Number(p.quantidade), 0);
      const total_agendas = pedidos.filter(p => p.produto === 'Agenda').reduce((acc, p) => acc + Number(p.quantidade), 0);

      const aguardando_impressao = pedidos.filter(p => p.status === 'Aguardando Impressão').length;
      const impressos = pedidos.filter(p => p.status === 'Impresso').length;
      const cortados = pedidos.filter(p => p.status === 'Cortado').length;
      const montados = pedidos.filter(p => p.status === 'Montado').length;
      const prontos = pedidos.filter(p => p.status === 'Pronto').length;
      const enviados = pedidos.filter(p => p.status === 'Enviado').length;

      return res.json({
        total_pedidos,
        total_bloquinhos,
        total_cadernetas,
        total_agendas,
        aguardando_impressao,
        impressos,
        cortados,
        montados,
        prontos,
        enviados
      });
    }

    let sqlWhere = ` WHERE status != 'Arquivado'`;
    const params = [];

    if (loja) {
      sqlWhere += ` AND loja = ?`;
      params.push(loja);
    }
    if (produto) {
      sqlWhere += ` AND produto = ?`;
      params.push(produto);
    }
    if (status) {
      sqlWhere += ` AND status = ?`;
      params.push(status);
    }
    if (data) {
      sqlWhere += ` AND data_pedido = ?`;
      params.push(data);
    }
    if (busca) {
      sqlWhere += ` AND (titulo LIKE ? OR numero_pedido LIKE ?)`;
      params.push(`%${busca}%`, `%${busca}%`);
    }

    const [rows] = await db.query(`
      SELECT 
        COUNT(*) AS total_pedidos,
        SUM(CASE WHEN produto = 'Bloquinho' THEN quantidade ELSE 0 END) AS total_bloquinhos,
        SUM(CASE WHEN produto = 'Caderneta' THEN quantidade ELSE 0 END) AS total_cadernetas,
        SUM(CASE WHEN produto = 'Agenda' THEN quantidade ELSE 0 END) AS total_agendas,
        SUM(CASE WHEN status = 'Aguardando Impressão' THEN 1 ELSE 0 END) AS aguardando_impressao,
        SUM(CASE WHEN status = 'Impresso' THEN 1 ELSE 0 END) AS impressos,
        SUM(CASE WHEN status = 'Cortado' THEN 1 ELSE 0 END) AS cortados,
        SUM(CASE WHEN status = 'Montado' THEN 1 ELSE 0 END) AS montados,
        SUM(CASE WHEN status = 'Pronto' THEN 1 ELSE 0 END) AS prontos,
        SUM(CASE WHEN status = 'Enviado' THEN 1 ELSE 0 END) AS enviados
      FROM pedidos ${sqlWhere}
    `, params);

    const stats = rows[0];
    res.json({
      total_pedidos: Number(stats.total_pedidos || 0),
      total_bloquinhos: Number(stats.total_bloquinhos || 0),
      total_cadernetas: Number(stats.total_cadernetas || 0),
      total_agendas: Number(stats.total_agendas || 0),
      aguardando_impressao: Number(stats.aguardando_impressao || 0),
      impressos: Number(stats.impressos || 0),
      cortados: Number(stats.cortados || 0),
      montados: Number(stats.montados || 0),
      prontos: Number(stats.prontos || 0),
      enviados: Number(stats.enviados || 0)
    });
  } catch (error) {
    console.error('Erro ao calcular métricas:', error);
    res.status(500).json({ message: 'Erro ao gerar indicadores do dashboard.' });
  }
}
