import { db } from '../config/database.js';

export async function getHistory(req, res) {
  try {
    const { pedido_id, usuario_id } = req.query;

    if (db.isFallback()) {
      const store = db.getFallbackStore();
      let history = store.historico.map(h => {
        const usuario = store.usuarios.find(u => u.id === h.usuario_id);
        const pedido = store.pedidos.find(p => p.id === h.pedido_id);
        return {
          ...h,
          usuario_nome: usuario ? usuario.nome : 'Usuário Removido',
          numero_pedido: pedido ? pedido.numero_pedido : 'N/A'
        };
      });

      if (pedido_id) history = history.filter(h => h.pedido_id === Number(pedido_id));
      if (usuario_id) history = history.filter(h => h.usuario_id === Number(usuario_id));

      return res.json(history);
    }

    let sql = `
      SELECT h.*, u.nome AS usuario_nome, p.numero_pedido, p.titulo AS pedido_titulo
      FROM historico h
      LEFT JOIN usuarios u ON h.usuario_id = u.id
      LEFT JOIN pedidos p ON h.pedido_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (pedido_id) {
      sql += ' AND h.pedido_id = ?';
      params.push(pedido_id);
    }
    if (usuario_id) {
      sql += ' AND h.usuario_id = ?';
      params.push(usuario_id);
    }

    sql += ' ORDER BY h.data_hora DESC LIMIT 200';

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ message: 'Erro ao carregar histórico de auditoria.' });
  }
}
